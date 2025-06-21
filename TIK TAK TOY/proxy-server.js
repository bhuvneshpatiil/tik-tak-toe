const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for DeepSeek API
app.post('/api/chat', async (req, res) => {
    try {
        const { userMessage, conversationHistory } = req.body;
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer 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`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful and intelligent AI assistant. You can answer questions about:

                        **Tic Tac Toe Game:**
                        - Game rules and how to play
                        - Installation instructions for Android
                        - Game modes (offline, computer, online)
                        - Technical support for the game
                        - Information about the game creator (bhuvnesh)

                        **General Knowledge:**
                        - Science, technology, history, geography
                        - Mathematics, calculations, problem solving
                        - Current events, news, and trends
                        - Literature, arts, and culture
                        - Health, fitness, and lifestyle advice
                        - Programming and technical questions
                        - Business, finance, and economics
                        - Entertainment, movies, music, and games
                        - Travel, food, and cooking
                        - Philosophy, psychology, and self-help

                        **Conversation:**
                        - Casual chat and friendly conversation
                        - Jokes, riddles, and entertainment
                        - Personal advice and motivation
                        - Language learning and translation help

                        Be friendly, helpful, knowledgeable, and engaging. Provide accurate, informative, and well-structured responses. If you're not sure about something, say so honestly. Always be respectful and appropriate in your responses.`
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();
        res.json({ success: true, response: data.choices[0].message.content });
        
    } catch (error) {
        console.error('Proxy API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'API call failed',
            fallback: 'I can help you with game questions, installation, and general knowledge. What would you like to know?'
        });
    }
});

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/website', (req, res) => {
    res.sendFile(path.join(__dirname, 'website.html'));
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Main game: http://localhost:${PORT}`);
    console.log(`Website: http://localhost:${PORT}/website`);
}); 