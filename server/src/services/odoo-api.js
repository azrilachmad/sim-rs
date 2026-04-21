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
    if (!USE_LOCAL) {
      config.body = JSON.stringify({ 
        jsonrpc: "2.0", 
        params: options.body 
      });
    } else {
      config.body = JSON.stringify(options.body);
    }
  }

  const source = USE_LOCAL ? 'LOCAL' : 'ODOO';
  console.log(`🌐 ${source} API: ${config.method} ${url}`);

  const response = await fetch(url, config);

  if (!response.ok) {
    let detail = '';
    try {
      const json = await response.json();
      detail = json.error || JSON.stringify(json);
    } catch {
      detail = await response.text().catch(() => '');
    }
    console.error(`❌ API error ${response.status}: ${detail}`);
    throw new Error(detail || `API error: ${response.status}`);
  }

  const jsonResponse = await response.json();

  // Handle Odoo JSON-RPC errors (which typically return HTTP 200)
  if (jsonResponse.error) {
    const errorMsg = jsonResponse.error.data?.message || jsonResponse.error.message || 'Unknown Odoo error';
    console.error(`❌ API JSON-RPC error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Transparently unwrap JSON-RPC result envelope if it exists
  if (jsonResponse.result !== undefined) {
    return jsonResponse.result;
  }

  return jsonResponse;
}

async function getDoctors() {
  return odooFetch('/api/v1/doctors');
}

async function getJadwalDokter() {
  return odooFetch('/api/v1/jadwal-dokter');
}

async function getPatients() {
  return odooFetch('/api/v1/patients');
}

async function getAppointments(limit = 10, offset = 0) {
  return odooFetch(`/api/v1/appointments?limit=${limit}&offset=${offset}`);
}

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
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
