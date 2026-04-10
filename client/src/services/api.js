const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function sendChatMessage(messages) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Gagal menghubungi server.');
  }

  return response.json();
}
