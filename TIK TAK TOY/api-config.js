// DeepSeek API Configuration
const DEEPSEEK_API_KEY = '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';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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
    error: [
        "I'm having trouble connecting right now, but I can still help with basic questions!",
        "Let me try to answer your question with my available knowledge.",
        "While I'm reconnecting, here's what I know about your topic..."
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
    
    // For other questions, provide a helpful response
    return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)] + 
           " While I'm reconnecting to my full knowledge base, you can ask me about the Tic Tac Toe game, installation, or general questions!";
}

// API call function with improved error handling
async function callDeepSeekAPI(userMessage, conversationHistory = []) {
    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Accept': 'application/json'
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
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        
        // Provide a helpful fallback response instead of just saying sorry
        return getFallbackResponse(userMessage);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { callDeepSeekAPI, DEEPSEEK_API_KEY, getFallbackResponse };
} 