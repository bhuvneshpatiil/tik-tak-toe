const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const players = new Map();

wss.on('connection', (ws) => {
  ws.isAdmin = false;
  console.log('New player connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'admin_observe') {
      ws.isAdmin = true;
      sendAdminUpdate(ws);
      return;
    }
    
    switch (data.type) {
      case 'join_room':
        handleJoinRoom(ws, data.roomId);
        break;
      case 'make_move':
        handleMakeMove(ws, data.roomId, data.cellIndex);
        break;
      case 'reset_game':
        handleResetGame(ws, data.roomId);
        break;
    }
  });
  
  ws.on('close', () => {
    handlePlayerDisconnect(ws);
  });
});

function handleJoinRoom(ws, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      players: [],
      board: Array(9).fill(''),
      currentPlayer: 'X',
      gameActive: true
    });
  }
  
  const room = rooms.get(roomId);
  
  if (room.players.length >= 2) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Room is full'
    }));
    return;
  }
  
  const playerId = room.players.length === 0 ? 'X' : 'O';
  room.players.push({ ws, playerId });
  players.set(ws, { roomId, playerId });
  
  ws.send(JSON.stringify({
    type: 'joined_room',
    playerId,
    roomId
  }));
  
  // Notify all players in the room
  broadcastToRoom(roomId, {
    type: 'game_state',
    board: room.board,
    currentPlayer: room.currentPlayer,
    gameActive: room.gameActive,
    players: room.players.length
  });
  
  broadcastAdminUpdate();
}

function handleMakeMove(ws, roomId, cellIndex) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const player = players.get(ws);
  if (!player || player.playerId !== room.currentPlayer || !room.gameActive) return;
  
  if (room.board[cellIndex] !== '') return;
  
  room.board[cellIndex] = room.currentPlayer;
  
  // Check for win
  if (checkWin(room.board, room.currentPlayer)) {
    room.gameActive = false;
    broadcastToRoom(roomId, {
      type: 'game_over',
      winner: room.currentPlayer,
      board: room.board
    });
  } else if (room.board.every(cell => cell !== '')) {
    room.gameActive = false;
    broadcastToRoom(roomId, {
      type: 'game_over',
      winner: null,
      board: room.board
    });
  } else {
    room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
    broadcastToRoom(roomId, {
      type: 'game_state',
      board: room.board,
      currentPlayer: room.currentPlayer,
      gameActive: room.gameActive
    });
  }
  
  broadcastAdminUpdate();
}

function handleResetGame(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.board = Array(9).fill('');
  room.currentPlayer = 'X';
  room.gameActive = true;
  
  broadcastToRoom(roomId, {
    type: 'game_state',
    board: room.board,
    currentPlayer: room.currentPlayer,
    gameActive: room.gameActive
  });
  
  broadcastAdminUpdate();
}

function handlePlayerDisconnect(ws) {
  const player = players.get(ws);
  if (!player) return;
  
  const room = rooms.get(player.roomId);
  if (room) {
    room.players = room.players.filter(p => p.ws !== ws);
    
    if (room.players.length === 0) {
      rooms.delete(player.roomId);
    } else {
      broadcastToRoom(player.roomId, {
        type: 'player_disconnected',
        message: 'Opponent disconnected'
      });
    }
  }
  
  players.delete(ws);
  
  broadcastAdminUpdate();
}

function broadcastToRoom(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

function checkWin(board, player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diags
  ];
  return winPatterns.some(pattern =>
    pattern.every(idx => board[idx] === player)
  );
}

function sendAdminUpdate(ws) {
  const allRooms = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    players: room.players.map(p => p.playerId),
    board: room.board,
    currentPlayer: room.currentPlayer,
    gameActive: room.gameActive
  }));
  ws.send(JSON.stringify({ type: 'admin_rooms', rooms: allRooms }));
}

function broadcastAdminUpdate() {
  wss.clients.forEach(client => {
    if (client.isAdmin && client.readyState === WebSocket.OPEN) {
      sendAdminUpdate(client);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 