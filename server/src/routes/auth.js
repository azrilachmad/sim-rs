const express = require('express');
const { User, Patient } = require('../models');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { name, email, password, no_mr? }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, no_mr } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }

    // Check email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }

    // Try to match with patient data using no_mr
    let patient_id = null;
    if (no_mr) {
      const patient = await Patient.findOne({ where: { no_mr } });
      if (patient) {
        patient_id = patient.id;
      }
    }

    // If no MR provided or not found, try match by name
    if (!patient_id) {
      const patient = await Patient.findOne({
        where: { name: name },
      });
      if (patient) {
        patient_id = patient.id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      patient_id,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        patient_id: user.patient_id,
        patient_linked: !!user.patient_id,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ error: 'Gagal melakukan registrasi.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Patient, as: 'patient', attributes: ['name', 'no_mr'] }],
    });

    if (!user || !user.checkPassword(password)) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        patient_id: user.patient_id,
        patient_name: user.patient?.name || null,
        patient_mr: user.patient?.no_mr || null,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Gagal melakukan login.' });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
const { authMiddleware } = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'patient_id'],
      include: [{ model: Patient, as: 'patient', attributes: ['name', 'no_mr'] }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      patient_id: user.patient_id,
      patient_name: user.patient?.name || null,
      patient_mr: user.patient?.no_mr || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data user.' });
  }
});

module.exports = router;
