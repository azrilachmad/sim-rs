const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SYSTEM_PROMPT = require('../ai/system-prompt');
const toolDeclarations = require('../ai/tools');
const functionHandlers = require('../ai/functions');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_PROMPT.replace(
    '{{TODAY}}',
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  ),
  tools: [{
    functionDeclarations: toolDeclarations,
  }],
});

/**
 * POST /api/chat
 * Body: { messages: [{ role: 'user'|'model', content: string }] }
 */
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Build chat history (all messages except the last one)
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    // Send the latest user message
    const latestMessage = messages[messages.length - 1].content;
    let result = await chat.sendMessage(latestMessage);
    let response = result.response;

    // Handle function calling loop
    let maxIterations = 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Check if there are function calls
      const functionCalls = parts.filter(p => p.functionCall);

      if (functionCalls.length === 0) break;

      // Execute all function calls
      const functionResponses = [];

      for (const part of functionCalls) {
        const { name, args } = part.functionCall;
        console.log(`🔧 Function call: ${name}`, args);

        let fnResult;
        try {
          if (functionHandlers[name]) {
            fnResult = await functionHandlers[name](args || {});
          } else {
            fnResult = { error: `Function ${name} not found.` };
          }
        } catch (err) {
          console.error(`❌ Function ${name} error:`, err);
          fnResult = { error: `Terjadi kesalahan saat menjalankan fungsi ${name}.` };
        }

        functionResponses.push({
          functionResponse: {
            name,
            response: { result: fnResult },
          },
        });
      }

      // Send function results back to Gemini
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      iteration++;
    }

    // Extract final text response
    const textParts = response.candidates?.[0]?.content?.parts?.filter(p => p.text) || [];
    const finalText = textParts.map(p => p.text).join('\n');

    res.json({
      role: 'model',
      content: finalText,
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
