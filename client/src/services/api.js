const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Get stored auth token
 */
function getToken() {
  return localStorage.getItem('rs_ai_token');
}

/**
 * Get auth headers
 */
function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Login
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login gagal.');

  localStorage.setItem('rs_ai_token', data.token);
  localStorage.setItem('rs_ai_user', JSON.stringify(data.user));
  return data;
}

/**
 * Register
 */
export async function register(name, email, password, extras = {}) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, ...extras }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registrasi gagal.');

  localStorage.setItem('rs_ai_token', data.token);
  localStorage.setItem('rs_ai_user', JSON.stringify(data.user));
  return data;
}

/**
 * Logout
 */
export function logout() {
  localStorage.removeItem('rs_ai_token');
  localStorage.removeItem('rs_ai_user');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const raw = localStorage.getItem('rs_ai_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Check if logged in
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * Send chat message (protected)
 */
export async function sendChatMessage(messages) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });

  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Sesi telah berakhir. Silakan login kembali.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Gagal menghubungi server.');
  }

  return response.json();
}
