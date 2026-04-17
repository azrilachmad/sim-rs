const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'rs_ai';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const ODOO_URL = process.env.ODOO_BASE_URL || 'http://103.171.84.159:8069';
const ODOO_TOKEN = process.env.ODOO_TOKEN || 'Bearer SECRET123';

/**
 * Fetch data from Odoo API
 */
async function fetchOdoo(endpoint) {
  const url = `${ODOO_URL}${endpoint}`;
  console.log(`🌐 Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ODOO_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Odoo API error: ${response.status} - ${await response.text()}`);
  }

  return response.json();
}

const seedData = async () => {
  try {
    // 1. Create database if not exists
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await connection.end();
    console.log(`✅ Database "${DB_NAME}" ready.`);

    // 2. Connect via Sequelize and sync
    const sequelize = require('./config/database');
    const { Doctor, DoctorSchedule, Patient, Appointment } = require('./models');

    await sequelize.sync({ force: true });
    console.log('🗄️  Tables recreated.');

    // --- FETCH FROM ODOO API ---
    console.log('\n📡 Fetching data from Odoo API...');

    const [doctorsResult, jadwalResult, patientsResult] = await Promise.all([
      fetchOdoo('/api/v1/doctors'),
      fetchOdoo('/api/v1/jadwal-dokter'),
      fetchOdoo('/api/v1/patients'),
    ]);

    // --- DOCTORS ---
    const doctors = doctorsResult.data || [];
    const doctorIds = new Set();
    for (const d of doctors) {
      await Doctor.create({
        id: d.id,
        name: d.name || d.nama_dokter || '',
        kode: d.kode || '',
        gender: d.gender || '',
        tipe_nakes: d.tipe_nakes || '',
        spesialis: d.spesialis || '',
        poli: d.poli || '',
      });
      doctorIds.add(d.id);
    }
    console.log(`✅ Doctors seeded: ${doctors.length} records (from Odoo)`);

    // --- DOCTOR SCHEDULES + sync missing doctors ---
    const jadwalDokter = jadwalResult.data || [];
    let scheduleCount = 0;
    let missingDoctors = 0;
    for (const d of jadwalDokter) {
      // If doctor from jadwal not in doctors table, create it
      if (!doctorIds.has(d.id)) {
        await Doctor.create({
          id: d.id,
          name: d.nama_dokter || '',
          kode: d.kode || '',
          gender: '',
          tipe_nakes: '',
          spesialis: d.spesialis || '',
          poli: d.poli || '',
        });
        doctorIds.add(d.id);
        missingDoctors++;
      }

      if (d.jadwal && d.jadwal.length > 0) {
        for (const j of d.jadwal) {
          await DoctorSchedule.create({
            doctor_id: d.id,
            hari: j.hari,
            jadwal_praktek: j.jadwal_praktek,
          });
          scheduleCount++;
        }
      }
    }
    if (missingDoctors > 0) {
      console.log(`⚠️  ${missingDoctors} dokter dari jadwal tidak ada di /doctors → otomatis ditambahkan`);
    }
    console.log(`✅ Doctor schedules seeded: ${scheduleCount} records (from Odoo)`);

    // --- PATIENTS ---
    const patients = patientsResult.data || [];
    for (const p of patients) {
      await Patient.create({
        id: p.id,
        name: p.name || '',
        no_mr: p.no_mr || '',
        no_reg: p.no_reg || '',
        umur: p.umur || '',
        sex: p.sex || '',
      });
    }
    console.log(`✅ Patients seeded: ${patients.length} records (from Odoo)`);

    // --- APPOINTMENTS (from Odoo, with pagination) ---
    console.log('📡 Fetching appointments from Odoo API...');
    let allAppointments = [];
    let offset = 0;
    const limit = 10;
    let total = 0;

    // Fetch first page to get total count
    const firstPage = await fetchOdoo(`/api/v1/appointments?limit=${limit}&offset=0`);
    total = firstPage.total || 0;
    allAppointments = allAppointments.concat(firstPage.data || []);
    offset += limit;

    // Fetch remaining pages
    while (offset < total) {
      const page = await fetchOdoo(`/api/v1/appointments?limit=${limit}&offset=${offset}`);
      allAppointments = allAppointments.concat(page.data || []);
      offset += limit;
    }

    console.log(`📋 Total appointments fetched: ${allAppointments.length}`);

    // Disable FK checks for appointment seeding (Odoo data may reference IDs not in local tables)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    let aptSuccess = 0;
    let aptSkipped = 0;
    for (const apt of allAppointments) {
      try {
        await Appointment.create({
          id: apt.id,
          name: apt.name || '',
          patient_id: apt.patient_id || 0,
          patient_name: apt.patient || '',
          doctor_id: apt.doctor_id || 0,
          doctor_name: apt.doctor || '',
          appointment_date: apt.appointment_date || '',
          state: apt.state || 'submit',
          keluhan: apt.keluhan || '',
          poli: apt.poli || '',
        });
        aptSuccess++;
      } catch (err) {
        aptSkipped++;
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`✅ Appointments seeded: ${aptSuccess} records (${aptSkipped} skipped) (from Odoo)`);

    console.log('\n🎉 Seeding selesai! Data dari Odoo API berhasil disinkronkan.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error.message || error);
    process.exit(1);
  }
};

seedData();
