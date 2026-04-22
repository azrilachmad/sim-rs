const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SYSTEM_PROMPT = require('../ai/system-prompt');
const toolDeclarations = require('../ai/tools');
const functionHandlers = require('../ai/functions');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get today's date string in Indonesian format, fresh per request
 */
function getTodayString() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * POST /api/chat
 * Body: { messages: [{ role: 'user'|'model', content: string }] }
 * Header: Authorization: Bearer <token>
 */
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let prompt = SYSTEM_PROMPT.replace('{{TODAY}}', getTodayString());

    // Create model with fresh date + patient context per request
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: prompt,
      tools: [{ functionDeclarations: toolDeclarations }],
      generationConfig: {
        temperature: 0.3,     // Slightly higher to avoid blank responses
        topP: 0.85,
        topK: 30,
        maxOutputTokens: 2048,
      },
    });

    // Build chat history (all messages except the last one)
    // Gemini requires the first message in history to be role 'user',
    // so we skip any leading 'model' messages (e.g. the welcome message)
    const rawHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Drop leading model messages
    const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
    const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    const chat = model.startChat({ history });

    // Send the latest user message
    const latestMessage = messages[messages.length - 1].content;
    let result = await chat.sendMessage(latestMessage);
    let response = result.response;

    // Handle function calling loop
    const maxIterations = 10;
    let iteration = 0;
    let lastFunctionResults = null;
    const debugLog = [];

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
        console.log(`🔧 Function call [iter ${iteration}]: ${name}`, JSON.stringify(args));

        let fnResult;
        try {
          if (functionHandlers[name]) {
            fnResult = await functionHandlers[name](args || {});
          } else {
            fnResult = { error: `Function ${name} tidak tersedia.` };
          }
        } catch (err) {
          console.error(`❌ Function ${name} error:`, err.message);
          fnResult = { error: `Gagal menjalankan ${name}: ${err.message}` };
        }

        // Track debug info for frontend visibility
        debugLog.push({
          function: name,
          args: args,
          result_preview: fnResult?._debug || (fnResult?.success !== undefined ? { success: fnResult.success } : { count: fnResult?.jumlah || fnResult?.jumlah_total }),
        });

        functionResponses.push({
          functionResponse: {
            name,
            response: { result: fnResult },
          },
        });
      }

      lastFunctionResults = functionResponses;

      // Send function results back to Gemini
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      iteration++;
    }

    // Extract final text response
    const textParts = response.candidates?.[0]?.content?.parts?.filter(p => p.text) || [];
    let finalText = textParts.map(p => p.text).join('\n').trim();

    // RETRY: If Gemini returned blank after function calls, nudge it once
    if (!finalText && lastFunctionResults && iteration < maxIterations) {
      console.log('⚠️ Gemini returned blank after function calls, retrying with nudge...');
      try {
        result = await chat.sendMessage('Berikan jawaban berdasarkan data yang sudah ditemukan.');
        response = result.response;
        
        const retryParts = response.candidates?.[0]?.content?.parts?.filter(p => p.text) || [];
        finalText = retryParts.map(p => p.text).join('\n').trim();
        
        if (finalText) {
          console.log('✅ Retry successful, got text response');
        }
      } catch (retryErr) {
        console.error('❌ Retry failed:', retryErr.message);
      }
    }

    // Final fallback
    if (!finalText) {
      console.warn(`⚠️ Empty response after ${iteration} iterations`);
      finalText = iteration >= maxIterations
        ? 'Mohon maaf, proses memakan waktu lebih lama dari perkiraan. Silakan coba ulangi permintaan Anda. 🙏'
        : 'Mohon maaf, terjadi gangguan sementara. Silakan ulangi pertanyaan Anda. 🙏';
    }

    res.json({
      role: 'model',
      content: finalText,
      _debug: {
        iterations: iteration,
        function_calls: debugLog,
      },
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      error: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    });
  }
});

module.exports = router;
