const express = require('express');
const { Doctor, DoctorSchedule, Patient, Appointment } = require('../models');

const router = express.Router();

// ==================== DOCTORS ====================

// GET /api/v1/doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({ order: [['id', 'ASC']] });
    res.json({
      count: doctors.length,
      data: doctors.map(d => ({
        id: d.id,
        name: d.name,
        kode: d.kode,
        gender: d.gender,
        tipe_nakes: d.tipe_nakes,
        spesialis: d.spesialis,
        poli: d.poli,
      })),
    });
  } catch (error) {
    console.error('❌ GET /doctors error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/jadwal-dokter
router.get('/jadwal-dokter', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: DoctorSchedule, as: 'jadwal' }],
      order: [['id', 'ASC']],
    });
    res.json({
      count: doctors.length,
      data: doctors.map(d => ({
        id: d.id,
        nama_dokter: d.name,
        kode: d.kode,
        poli: d.poli,
        spesialis: d.spesialis,
        jadwal: (d.jadwal || []).map(j => ({
          hari: j.hari,
          jadwal_praktek: j.jadwal_praktek,
        })),
      })),
    });
  } catch (error) {
    console.error('❌ GET /jadwal-dokter error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PATIENTS ====================

// GET /api/v1/patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.findAll({ order: [['id', 'ASC']] });
    res.json({
      count: patients.length,
      data: patients.map(p => ({
        id: p.id,
        name: p.name,
        no_mr: p.no_mr,
        no_reg: p.no_reg,
        umur: p.umur,
        sex: p.sex,
      })),
    });
  } catch (error) {
    console.error('❌ GET /patients error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== APPOINTMENTS ====================

// GET /api/v1/appointments
router.get('/appointments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { count: total, rows } = await Appointment.findAndCountAll({
      include: [
        { model: Doctor, as: 'doctorData', attributes: ['name'] },
        { model: Patient, as: 'patientData', attributes: ['name'] },
      ],
      order: [['id', 'ASC']],
      limit,
      offset,
    });

    res.json({
      total,
      count: rows.length,
      limit,
      offset,
      data: rows.map(a => ({
        id: a.id,
        name: a.name,
        patient: a.patientData?.name || '',
        doctor: a.doctorData?.name || '',
        appointment_date: a.appointment_date,
        state: a.state,
        keluhan: a.keluhan,
        poli: a.poli,
      })),
    });
  } catch (error) {
    console.error('❌ GET /appointments error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/appointments
router.post('/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, keluhan } = req.body;

    console.log('📝 POST /appointments body:', req.body);

    // Validate & coerce types
    const pid = parseInt(patient_id);
    const did = parseInt(doctor_id);

    if (!pid || !did || !appointment_date) {
      return res.status(400).json({
        error: 'patient_id, doctor_id, dan appointment_date wajib diisi.',
      });
    }

    // Lookup patient and doctor (optional — may not exist locally)
    const patient = await Patient.findByPk(pid);
    const doctor = await Doctor.findByPk(did);

    // Generate name like APTxxx
    const lastAppt = await Appointment.findOne({ order: [['id', 'DESC']] });
    const nextId = (lastAppt?.id || 0) + 1;
    const name = `APT${nextId}`;

    const appointment = await Appointment.create({
      name,
      patient_id: pid,
      patient_name: patient?.name || '',
      doctor_id: did,
      doctor_name: doctor?.name || '',
      appointment_date: String(appointment_date),
      state: 'submit',
      keluhan: keluhan || '',
      poli: doctor?.poli || '',
    });

    res.status(201).json({
      id: appointment.id,
      name: appointment.name,
      patient: patient?.name || `Pasien #${pid}`,
      doctor: doctor?.name || `Dokter #${did}`,
      appointment_date: appointment.appointment_date,
      state: appointment.state,
      keluhan: appointment.keluhan,
      poli: appointment.poli,
    });
  } catch (error) {
    console.error('❌ POST /appointments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/appointments/:id
router.put('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment tidak ditemukan.' });
    }

    const { keluhan, appointment_date, state } = req.body;
    if (keluhan !== undefined) appointment.keluhan = keluhan;
    if (appointment_date !== undefined) appointment.appointment_date = appointment_date;
    if (state !== undefined) appointment.state = state;

    await appointment.save();
    res.json({ message: 'Appointment berhasil diupdate.', data: appointment });
  } catch (error) {
    console.error('❌ PUT /appointments error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/appointments/:id
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment tidak ditemukan.' });
    }
    await appointment.destroy();
    res.json({ message: 'Appointment berhasil dihapus.' });
  } catch (error) {
    console.error('❌ DELETE /appointments error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
