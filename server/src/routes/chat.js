const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SYSTEM_PROMPT = require('../ai/system-prompt');
const toolDeclarations = require('../ai/tools');
const functionHandlers = require('../ai/functions');
const { authMiddleware } = require('../middleware/auth');

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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;
    const user = req.user; // from JWT: { id, name, email, patient_id }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Inject patient context into system prompt
    let prompt = SYSTEM_PROMPT.replace('{{TODAY}}', getTodayString());
    if (user.patient_id) {
      prompt = prompt.replace('{{PATIENT_CONTEXT}}',
        `\n\nINFORMASI PASIEN (SUDAH LOGIN):\n` +
        `- Nama: ${user.name}\n` +
        `- Patient ID: ${user.patient_id}\n` +
        `User ini SUDAH terverifikasi sebagai pasien. Saat reservasi, LANGSUNG gunakan data ini. TIDAK PERLU tanya nama pasien atau panggil getPatients.`
      );
    } else {
      prompt = prompt.replace('{{PATIENT_CONTEXT}}',
        `\n\nUser "${user.name}" sudah login tapi BELUM terhubung dengan data pasien. Saat reservasi, tetap tanyakan nama pasien dan gunakan getPatients untuk mencari.`
      );
    }

    // Create model with fresh date + patient context per request
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: prompt,
      tools: [{ functionDeclarations: toolDeclarations }],
      generationConfig: {
        temperature: 0.1,     // Very low: consistent, factual responses
        topP: 0.8,            // Narrow token sampling
        topK: 20,             // Limited vocabulary choices
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
    const maxIterations = 5; // Reduced from 10 to prevent over-calling
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
        console.log(`🔧 Function call: ${name}`, JSON.stringify(args));

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
      content: finalText || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.',
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      error: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    });
  }
});

module.exports = router;
