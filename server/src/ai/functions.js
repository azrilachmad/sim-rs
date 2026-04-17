const odooApi = require('../services/odoo-api');

/**
 * Normalize name for fuzzy search:
 * strips "dr.", "drg.", "dokter", "ns.", "apt.", titles, punctuation
 */
function normalizeName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\b(dr|drg|dokter|ns|apt|sp)\b\.?/g, '')
    .replace(/,.*$/g, '')
    .replace(/[.,\-()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if search query matches a doctor entry
 */
function matchesDoctor(doctor, query) {
  const q = normalizeName(query);
  const name = normalizeName(doctor.nama_dokter);
  const spesialis = (doctor.spesialis || '').toLowerCase();
  const poli = (doctor.poli || '').toLowerCase();
  const rawName = (doctor.nama_dokter || '').toLowerCase();

  if (rawName.includes(query.toLowerCase())) return true;
  if (name.includes(q)) return true;
  const queryWords = q.split(' ').filter(w => w.length > 1);
  if (queryWords.length > 0 && queryWords.every(w => name.includes(w))) return true;
  if (spesialis.includes(query.toLowerCase())) return true;
  if (poli.includes(query.toLowerCase())) return true;

  return false;
}

/**
 * Format jadwal: return structured per-day schedule
 * Instead of concatenated string, returns clean array
 */
function formatJadwal(jadwalList) {
  if (!jadwalList || jadwalList.length === 0) return [];

  // Group by hari, collect time slots
  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const dayMap = {};

  for (const j of jadwalList) {
    const hari = j.hari;
    const jam = j.jadwal_praktek;
    if (!dayMap[hari]) dayMap[hari] = [];
    if (!dayMap[hari].includes(jam)) dayMap[hari].push(jam);
  }

  // Sort by day order, return structured
  return Object.entries(dayMap)
    .sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]))
    .map(([hari, slots]) => `${hari}: ${slots.join(', ')}`);
}

/**
 * Summarize jadwal for compact table display
 */
function summarizeJadwal(jadwalList) {
  if (!jadwalList || jadwalList.length === 0) return 'Belum ada jadwal';

  // Group by time slot
  const timeGroups = {};
  for (const j of jadwalList) {
    const time = j.jadwal_praktek;
    if (!timeGroups[time]) timeGroups[time] = [];
    timeGroups[time].push(j.hari);
  }

  return Object.entries(timeGroups)
    .map(([time, days]) => `${days.join(', ')}: ${time}`)
    .join('\n');
}

/**
 * Get doctor schedules, optionally filtered.
 * Returns max 5 results with pagination hint.
 */
async function getDoctorSchedule({ search, offset = 0 } = {}) {
  try {
    const { Doctor, DoctorSchedule } = require('../models');
    
    // Fetch all doctors with their schedules from local DB
    const doctors = await Doctor.findAll({
      include: [{ model: DoctorSchedule, as: 'jadwal' }],
      order: [['id', 'ASC']]
    });

    let data = doctors.map(d => ({
      id: d.id,
      nama_dokter: d.name,
      kode: d.kode,
      poli: d.poli,
      spesialis: d.spesialis,
      jadwal: (d.jadwal || []).map(j => ({
        hari: j.hari,
        jadwal_praktek: j.jadwal_praktek,
      })),
    }));

    if (search) {
      data = data.filter(d => matchesDoctor(d, search));
    }

    const withSchedule = data.filter(d => d.jadwal && d.jadwal.length > 0);

    if (withSchedule.length === 0) {
      return {
        jumlah: 0,
        pesan: search
          ? `Tidak ditemukan dokter dengan kata kunci "${search}". Coba kata kunci lain.`
          : 'Tidak ada dokter dengan jadwal saat ini.',
        dokter: [],
      };
    }

    // Pagination
    const MAX_DISPLAY = 5;
    const startIdx = parseInt(offset) || 0;
    const displayed = withSchedule.slice(startIdx, startIdx + MAX_DISPLAY);
    const remaining = withSchedule.length - (startIdx + displayed.length);

    return {
      jumlah_total: withSchedule.length,
      jumlah_ditampilkan: displayed.length,
      offset_saat_ini: startIdx,
      offset_berikutnya: remaining > 0 ? startIdx + MAX_DISPLAY : null,
      sisa_belum_ditampilkan: remaining > 0 ? remaining : 0,
      pesan: remaining > 0
        ? `Menampilkan ${displayed.length} dari ${withSchedule.length} dokter (offset: ${startIdx}). Untuk melihat lebih banyak, panggil lagi dengan offset: ${startIdx + MAX_DISPLAY}.`
        : `Semua ${withSchedule.length} dokter sudah ditampilkan.`,
      dokter: displayed.map(d => ({
        id: d.id,
        nama: d.nama_dokter,
        poli: d.poli || '-',
        spesialis: d.spesialis || '-',
        jadwal_ringkas: summarizeJadwal(d.jadwal),
        jadwal_detail: formatJadwal(d.jadwal),
      })),
    };
  } catch (error) {
    console.error('❌ getDoctorSchedule error:', error.message);
    return { error: 'Gagal mengambil data jadwal dokter: ' + error.message };
  }
}

/**
 * Search patients by name
 */
async function getPatients({ name } = {}) {
  try {
    const { Patient } = require('../models');
    const { Op } = require('sequelize');

    let whereClause = {};
    if (name) {
      whereClause.name = {
        [Op.like]: `%${name}%`
      };
    }

    const patients = await Patient.findAll({
      where: whereClause,
      limit: 10,
      order: [['id', 'ASC']]
    });

    if (patients.length === 0) {
      return {
        jumlah: 0,
        pesan: `Pasien dengan nama "${name}" tidak ditemukan di database. Pastikan nama dieja dengan benar.`,
        data: [],
      };
    }

    return {
      jumlah: patients.length,
      data: patients.map(p => ({
        id: p.id,
        nama: p.name,
        noMR: p.no_mr,
        umur: p.umur,
        jenisKelamin: p.sex,
      })),
    };
  } catch (error) {
    console.error('❌ getPatients error:', error.message);
    return { error: 'Gagal mencari data pasien: ' + error.message };
  }
}

/**
 * Create appointment — only call after user confirmation
 */
async function createAppointment({ patient_id, doctor_id, appointment_date, keluhan }) {
  try {
    const { Patient, Doctor, Appointment } = require('../models');

    const pid = parseInt(patient_id);
    const did = parseInt(doctor_id);

    console.log('🔧 createAppointment args:', { pid, did, appointment_date, keluhan });

    if (!pid || !did) {
      return { success: false, message: 'patient_id dan doctor_id harus berupa angka valid.' };
    }

    if (!appointment_date) {
      return { success: false, message: 'appointment_date wajib diisi. Format: YYYY-MM-DD HH:MM:SS' };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/;
    if (!dateRegex.test(appointment_date)) {
      return {
        success: false,
        message: `Format tanggal salah: "${appointment_date}". Format yang benar: "YYYY-MM-DD HH:MM:SS". Contoh: "2026-04-17 10:00:00".`,
      };
    }

    if (!keluhan || keluhan.trim().length === 0) {
      return { success: false, message: 'Keluhan pasien wajib diisi.' };
    }

    // Fetch patient and doctor to get names/Poli
    const patient = await Patient.findByPk(pid);
    if (!patient) {
        return { success: false, message: `Pasien dengan ID ${pid} tidak ditemukan di database kami.` };
    }

    const doctor = await Doctor.findByPk(did);
    if (!doctor) {
        return { success: false, message: `Dokter dengan ID ${did} tidak ditemukan di database kami.` };
    }

    // Generate appointment name
    const lastAppt = await Appointment.findOne({ order: [['id', 'DESC']] });
    const nextId = (lastAppt?.id || 0) + 1;
    const name = `APT${nextId}`;

    const appointment = await Appointment.create({
      name,
      patient_id: pid,
      patient_name: patient.name,
      doctor_id: did,
      doctor_name: doctor.name,
      appointment_date: String(appointment_date),
      state: 'submit',
      keluhan: keluhan.trim(),
      poli: doctor.poli || '',
    });

    return {
      success: true,
      message: 'Appointment berhasil dibuat!',
      data: {
          id: appointment.id,
          name: appointment.name,
          patient: patient.name,
          doctor: doctor.name,
          appointment_date: appointment.appointment_date,
          state: appointment.state,
          keluhan: appointment.keluhan,
          poli: appointment.poli,
      },
    };
  } catch (error) {
    console.error('❌ createAppointment error:', error.message);
    return { success: false, message: 'Gagal membuat appointment: ' + error.message };
  }
}

const functionHandlers = {
  getDoctorSchedule,
  getPatients,
  createAppointment,
};

module.exports = functionHandlers;
