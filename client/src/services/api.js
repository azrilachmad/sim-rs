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
 * Send chat message
 */
export async function sendChatMessage(messages) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await safeJson(response).catch(() => ({}));
    throw new Error(error.error || 'Gagal menghubungi server.');
  }

  return safeJson(response);
}
