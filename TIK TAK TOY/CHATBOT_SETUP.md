# 🤖 Chatbot Setup Guide

## Problem: Chatbot Only Says "Sorry"

If your chatbot is only responding with "sorry" messages, it's likely due to API connection issues. Here's how to fix it:

## ✅ Solution 1: Use the Proxy Server (Recommended)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Proxy Server
```bash
npm run proxy
```

### Step 3: Access the Website
- Open: `http://localhost:3001`
- Or: `http://localhost:3001/website`

### Step 4: Update API Configuration
Replace the API configuration in your HTML files:

**In `index.html` and `website.html`, change:**
```html
<script src="api-config.js"></script>
```

**To:**
```html
<script src="api-config-proxy.js"></script>
```

## ✅ Solution 2: Direct API (Alternative)

If you want to use the direct API approach:

### Step 1: Check API Key
Make sure your DeepSeek API key is valid and has sufficient credits.

### Step 2: Run the Game Server
```bash
npm start
```

### Step 3: Access the Game
- Open: `http://localhost:3000`

## 🔧 Troubleshooting

### Issue: CORS Errors
- **Solution**: Use the proxy server (Solution 1)

### Issue: API Timeout
- **Solution**: The chatbot will use fallback responses automatically

### Issue: Network Problems
- **Solution**: The chatbot has built-in fallback responses for common questions

## 🎯 What the Chatbot Can Do

### Game Questions:
- "How do I play Tic Tac Toe?"
- "How do I install on Android?"
- "What are the game modes?"

### General Knowledge:
- "What's the capital of France?"
- "Tell me about quantum physics"
- "How do I calculate the area of a circle?"

### Entertainment:
- "Tell me a joke"
- "What are some good movies?"
- "Give me motivation"

### Technical Help:
- "How do I write JavaScript?"
- "What is machine learning?"

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Run proxy server**: `npm run proxy`
3. **Open browser**: Go to `http://localhost:3001`
4. **Click the 🤖 button** in the bottom-right corner
5. **Ask any question!**

## 📱 Mobile Testing

The chatbot works perfectly on mobile devices:
- Open the website on your phone
- Click the 🤖 button
- Ask questions using voice or text

## 🔒 Security Note

The API key is included in the frontend for demo purposes. For production use, consider:
- Using environment variables
- Implementing proper authentication
- Using a backend proxy (already provided)

## 💡 Tips

- The chatbot remembers conversation context
- It has fallback responses for when the API is unavailable
- It can handle any type of question
- It's optimized for mobile devices

---

**Need help?** The chatbot itself can help you with setup questions! Just ask it about installation or technical issues. 