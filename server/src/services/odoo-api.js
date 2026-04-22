// Odoo API service — direct connection to Odoo REST API
// When USE_LOCAL_API=true, queries go to our local Express server
// When USE_LOCAL_API=false (default), queries go to the Odoo server

const USE_LOCAL = process.env.USE_LOCAL_API === 'true';

const ODOO_URL = process.env.ODOO_BASE_URL || 'http://103.171.84.159:8069';
const ODOO_TOKEN = process.env.ODOO_TOKEN || 'Bearer SECRET123';
const LOCAL_URL = `http://localhost:${process.env.PORT || 3001}`;

function getBaseUrl() {
  return USE_LOCAL ? LOCAL_URL : ODOO_URL;
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (!USE_LOCAL) {
    headers['Authorization'] = ODOO_TOKEN;
  }
  return headers;
}

async function odooFetch(endpoint, options = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  const config = {
    method: options.method || 'GET',
    headers: { ...getHeaders(), ...options.headers },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const source = USE_LOCAL ? 'LOCAL' : 'ODOO';
  console.log(`🌐 ${source} API: ${config.method} ${url}`);
  if (options.body) {
    console.log(`📦 Payload:`, JSON.stringify(options.body));
  }

  const response = await fetch(url, config);

  // Read body once
  const responseText = await response.text();
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
  } catch {
    console.error(`❌ Invalid JSON response: ${responseText.substring(0, 200)}`);
    throw new Error(`API returned invalid JSON (HTTP ${response.status})`);
  }

  // Handle HTTP errors
  if (!response.ok) {
    const detail = jsonResponse.error?.data?.message || jsonResponse.error?.message || jsonResponse.message || JSON.stringify(jsonResponse);
    console.error(`❌ API error ${response.status}: ${detail}`);
    throw new Error(detail);
  }

  // Handle Odoo JSON-RPC errors (which return HTTP 200 but contain error)
  if (jsonResponse.error) {
    const errorMsg = jsonResponse.error.data?.message || jsonResponse.error.message || 'Unknown Odoo error';
    console.error(`❌ Odoo error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Transparently unwrap JSON-RPC result envelope if present
  if (jsonResponse.result !== undefined) {
    return jsonResponse.result;
  }

  return jsonResponse;
}

// ── GET endpoints ──────────────────────────────────────

async function getDoctors() {
  return odooFetch('/api/v1/doctors');
}

async function getJadwalDokter() {
  return odooFetch('/api/v1/jadwal-dokter');
}

async function getPatients() {
  return odooFetch('/api/v1/patients');
}

async function getPoli() {
  return odooFetch('/api/v1/poli');
}

async function getAppointments(limit = 10, offset = 0) {
  return odooFetch(`/api/v1/appointments?limit=${limit}&offset=${offset}`);
}

// ── WRITE endpoints ────────────────────────────────────

async function createAppointment(data) {
  return odooFetch('/api/v1/appointments', { method: 'POST', body: data });
}

async function updateAppointment(id, data) {
  return odooFetch(`/api/v1/appointments/${id}`, { method: 'PUT', body: data });
}

async function deleteAppointment(id) {
  return odooFetch(`/api/v1/appointments/${id}`, { method: 'DELETE' });
}

module.exports = {
  getDoctors,
  getJadwalDokter,
  getPatients,
  getPoli,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
