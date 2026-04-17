const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'rs_ai';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const RESULT_DIR = path.join(__dirname, '..', '..', 'collection', 'result');

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

    // 2. Now connect via Sequelize and sync
    const sequelize = require('./config/database');
    const { Doctor, DoctorSchedule, Patient, Appointment } = require('./models');

    await sequelize.sync({ force: true });
    console.log('🗄️  Tables recreated.');

    // --- DOCTORS ---
    const doctorsData = loadJSON(path.join(RESULT_DIR, 'doctors', 'get-doctors.json'));
    for (const d of doctorsData.data) {
      await Doctor.create({
        id: d.id,
        name: d.name,
        kode: d.kode || '',
        gender: d.gender || '',
        tipe_nakes: d.tipe_nakes || '',
        spesialis: d.spesialis || '',
        poli: d.poli || '',
      });
    }
    console.log(`✅ Doctors seeded: ${doctorsData.data.length} records`);

    // --- DOCTOR SCHEDULES ---
    const jadwalData = loadJSON(path.join(RESULT_DIR, 'doctors', 'get-jadwal-doctors.json'));
    let scheduleCount = 0;
    for (const d of jadwalData.data) {
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
    console.log(`✅ Doctor schedules seeded: ${scheduleCount} records`);

    // --- PATIENTS ---
    const patientsData = loadJSON(path.join(RESULT_DIR, 'Patients', 'get-patients.json'));
    for (const p of patientsData.data) {
      await Patient.create({
        id: p.id,
        name: p.name,
        no_mr: p.no_mr || '',
        no_reg: p.no_reg || '',
        umur: p.umur || '',
        sex: p.sex || '',
      });
    }
    console.log(`✅ Patients seeded: ${patientsData.data.length} records`);

    // --- APPOINTMENTS: SKIPPED (tabel tetap dibuat tapi kosong) ---
    console.log('⏭️  Appointments: tabel dibuat, data TIDAK di-seed (kosong).');

    console.log('\n🎉 Seeding selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error);
    process.exit(1);
  }
};

seedData();
