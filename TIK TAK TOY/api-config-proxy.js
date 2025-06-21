// Alternative API Configuration using Proxy Server
const PROXY_API_URL = '/api/chat'; // This will use the proxy server

// Fallback responses for when API is unavailable
const fallbackResponses = {
    greetings: [
        "Hello! 👋 How can I help you today?",
        "Hi there! I'm here to assist you with any questions.",
        "Greetings! What would you like to know?"
    ],
    game: [
        "Tic Tac Toe is a classic game where you need to get three X's or O's in a row!",
        "To play, click on any empty cell to place your mark. Get three in a row to win!",
        "The game has three modes: offline (with friends), computer (vs AI), and online (multiplayer)."
    ],
    install: [
        "To install on Android, look for the 'Install' button or use your browser's 'Add to Home Screen' option.",
        "Tap the install prompt when it appears, or use Chrome's menu to add to home screen.",
        "Once installed, the game will appear on your home screen like a regular app!"
    ],
    general: [
        "I'd be happy to help you with that! Could you provide more details?",
        "That's an interesting question! Let me think about it...",
        "I'm here to assist you with any information you need."
    ],
    knowledge: [
        "I can help you with general knowledge questions! What would you like to know?",
        "I have information about science, history, technology, and much more. Just ask!",
        "Feel free to ask me about any topic - I'm here to help!"
    ]
};

// Smart fallback response generator
function getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return fallbackResponses.greetings[Math.floor(Math.random() * fallbackResponses.greetings.length)];
    }
    
    if (message.includes('play') || message.includes('game') || message.includes('tic tac toe') || message.includes('rules')) {
        return fallbackResponses.game[Math.floor(Math.random() * fallbackResponses.game.length)];
    }
    
    if (message.includes('install') || message.includes('android') || message.includes('download') || message.includes('home screen')) {
        return fallbackResponses.install[Math.floor(Math.random() * fallbackResponses.install.length)];
    }
    
    if (message.includes('who') && message.includes('made') || message.includes('creator') || message.includes('author')) {
        return "This Tic Tac Toe game was created by bhuvnesh! It's a fun multiplayer game with multiple modes.";
    }
    
    if (message.includes('thank')) {
        return "You're welcome! 😊 Feel free to ask me anything else!";
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
        return "I can help you with: game rules, installation, general knowledge, calculations, advice, jokes, and much more! Just ask me anything!";
    }
    
    if (message.includes('capital') || message.includes('country') || message.includes('science') || message.includes('history')) {
        return fallbackResponses.knowledge[Math.floor(Math.random() * fallbackResponses.knowledge.length)];
    }
    
    // For other questions, provide a helpful response
    return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)] + 
           " I can help with game questions, general knowledge, and much more!";
}

// API call function using proxy server
async function callDeepSeekAPI(userMessage, conversationHistory = []) {
    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(PROXY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userMessage,
                conversationHistory
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Proxy API call failed: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.response) {
            return data.response;
        } else {
            throw new Error('Invalid response from proxy server');
        }
        
    } catch (error) {
        console.error('Proxy API Error:', error);
        
        // Provide a helpful fallback response instead of just saying sorry
        return getFallbackResponse(userMessage);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { callDeepSeekAPI, getFallbackResponse };
} 