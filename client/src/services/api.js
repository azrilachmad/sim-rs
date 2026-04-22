const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Safe JSON parse — handles non-JSON responses (e.g. Nginx HTML errors)
 */
async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server sedang tidak tersedia. Silakan coba beberapa saat lagi.');
  }
}

/**
 * Send chat message with request/response logging for devtools tracking
 */
export async function sendChatMessage(messages) {
  const startTime = performance.now();
  const requestPayload = { messages };

  console.group(`🔵 API Request: POST /api/chat`);
  console.log('📤 Payload:', requestPayload);
  console.log('⏱️ Started at:', new Date().toLocaleTimeString());

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const error = await safeJson(response).catch(() => ({}));
      console.error(`❌ Response: ${response.status} (${elapsed}ms)`, error);
      console.groupEnd();
      throw new Error(error.error || 'Gagal menghubungi server.');
    }

    const data = await safeJson(response);
    console.log(`✅ Response: ${response.status} (${elapsed}ms)`);
    
    // Show backend debug info (Odoo payloads, function calls, etc.)
    if (data._debug) {
      console.group('🔍 Backend Debug Info');
      console.log('Iterations:', data._debug.iterations);
      if (data._debug.function_calls?.length) {
        for (const fc of data._debug.function_calls) {
          console.group(`⚙️ ${fc.function}()`);
          console.log('Args:', fc.args);
          console.log('Result:', fc.result_preview);
          console.groupEnd();
        }
      }
      console.groupEnd();
    }
    
    console.groupEnd();
    return data;
  } catch (error) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error(`❌ Request failed (${elapsed}ms):`, error.message);
    console.groupEnd();
    throw error;
  }
}
