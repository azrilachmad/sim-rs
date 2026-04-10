const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Department, Doctor, Schedule, Reservation } = require('../models');

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Get all departments
 */
async function getDepartments() {
  const departments = await Department.findAll({
    include: [{
      model: Doctor,
      as: 'doctors',
      attributes: ['id', 'name', 'specialization'],
    }],
    order: [['name', 'ASC']],
  });

  return departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    description: dept.description,
    icon: dept.icon,
    jumlahDokter: dept.doctors.length,
    dokter: dept.doctors.map(d => ({ id: d.id, nama: d.name, spesialisasi: d.specialization })),
  }));
}

/**
 * Search doctors by name, specialization, or department
 */
async function searchDoctors({ name, specialization, departmentName }) {
  const where = {};
  const includeWhere = {};

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (specialization) {
    where.specialization = { [Op.like]: `%${specialization}%` };
  }
  if (departmentName) {
    includeWhere.name = { [Op.like]: `%${departmentName}%` };
  }

  const doctors = await Doctor.findAll({
    where,
    include: [
      {
        model: Department,
        as: 'department',
        where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
        attributes: ['id', 'name', 'icon'],
      },
      {
        model: Schedule,
        as: 'schedules',
        where: { isActive: true },
        required: false,
        attributes: ['dayOfWeek', 'startTime', 'endTime'],
      },
    ],
    order: [['name', 'ASC']],
  });

  return doctors.map(doc => ({
    id: doc.id,
    nama: doc.name,
    spesialisasi: doc.specialization,
    departemen: doc.department?.name || '-',
    bio: doc.bio,
    jadwal: doc.schedules.map(s => ({
      hari: DAY_NAMES[s.dayOfWeek],
      jam: `${s.startTime} - ${s.endTime}`,
    })),
  }));
}

/**
 * Get full schedule for a specific doctor
 */
async function getDoctorSchedule({ doctorId }) {
  const doctor = await Doctor.findByPk(doctorId, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['name'],
      },
      {
        model: Schedule,
        as: 'schedules',
        where: { isActive: true },
        required: false,
        order: [['dayOfWeek', 'ASC']],
      },
    ],
  });

  if (!doctor) {
    return { error: 'Dokter tidak ditemukan.' };
  }

  return {
    id: doctor.id,
    nama: doctor.name,
    spesialisasi: doctor.specialization,
    departemen: doctor.department?.name || '-',
    bio: doctor.bio,
    jadwal: doctor.schedules
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(s => ({
        hari: DAY_NAMES[s.dayOfWeek],
        hariKe: s.dayOfWeek,
        jamMulai: s.startTime,
        jamSelesai: s.endTime,
      })),
  };
}

/**
 * Get available time slots for a doctor on a specific date
 */
async function getAvailableSlots({ doctorId, date }) {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  // Find doctor's schedule for this day
  const schedule = await Schedule.findOne({
    where: { doctorId, dayOfWeek, isActive: true },
    include: [{ model: Doctor, as: 'doctor', attributes: ['name'] }],
  });

  if (!schedule) {
    return {
      available: false,
      message: `Dokter tidak memiliki jadwal praktek pada hari ${DAY_NAMES[dayOfWeek]}.`,
    };
  }

  // Get existing reservations for this date
  const startOfDay = new Date(date + 'T00:00:00');
  const endOfDay = new Date(date + 'T23:59:59');

  const existingReservations = await Reservation.findAll({
    where: {
      doctorId,
      dateTime: { [Op.between]: [startOfDay, endOfDay] },
      status: { [Op.notIn]: ['CANCELLED'] },
    },
  });

  const bookedTimes = existingReservations.map(r => {
    const dt = new Date(r.dateTime);
    return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  });

  // Generate 30-minute slots
  const slots = [];
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);
  
  let currentH = startH;
  let currentM = startM;

  while (currentH < endH || (currentH === endH && currentM < endM)) {
    const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    slots.push({
      waktu: timeStr,
      tersedia: !bookedTimes.includes(timeStr),
    });
    currentM += 30;
    if (currentM >= 60) {
      currentH += 1;
      currentM -= 60;
    }
  }

  return {
    available: true,
    dokter: schedule.doctor?.name,
    tanggal: date,
    hari: DAY_NAMES[dayOfWeek],
    jamPraktek: `${schedule.startTime} - ${schedule.endTime}`,
    slots,
  };
}

/**
 * Create a new reservation
 */
async function createReservation({ patientName, patientPhone, patientEmail, doctorId, dateTime, reason }) {
  // Check doctor exists
  const doctor = await Doctor.findByPk(doctorId, {
    include: [{ model: Department, as: 'department' }],
  });
  
  if (!doctor) {
    return { success: false, message: 'Dokter tidak ditemukan.' };
  }

  // Check if slot is available
  const targetDate = new Date(dateTime);
  const dayOfWeek = targetDate.getDay();

  const schedule = await Schedule.findOne({
    where: { doctorId, dayOfWeek, isActive: true },
  });

  if (!schedule) {
    return { success: false, message: `Dokter tidak praktek pada hari ${DAY_NAMES[dayOfWeek]}.` };
  }

  // Check for existing reservation at this time
  const existing = await Reservation.findOne({
    where: {
      doctorId,
      dateTime: targetDate,
      status: { [Op.notIn]: ['CANCELLED'] },
    },
  });

  if (existing) {
    return { success: false, message: 'Slot waktu ini sudah terisi. Silakan pilih waktu lain.' };
  }

  // Generate booking code
  const bookingCode = 'RS-' + uuidv4().substring(0, 8).toUpperCase();

  const reservation = await Reservation.create({
    patientName,
    patientPhone,
    patientEmail: patientEmail || '',
    doctorId,
    dateTime: targetDate,
    reason: reason || '',
    status: 'PENDING',
    bookingCode,
  });

  return {
    success: true,
    message: 'Reservasi berhasil dibuat!',
    detail: {
      kodeBooking: reservation.bookingCode,
      namaPasien: reservation.patientName,
      telepon: reservation.patientPhone,
      dokter: doctor.name,
      departemen: doctor.department?.name || '-',
      tanggalWaktu: dateTime,
      alasan: reason || '-',
      status: 'PENDING (Menunggu konfirmasi admin)',
    },
  };
}

/**
 * Check reservation status by booking code
 */
async function checkReservation({ bookingCode }) {
  const reservation = await Reservation.findOne({
    where: { bookingCode },
    include: [{
      model: Doctor,
      as: 'doctor',
      include: [{ model: Department, as: 'department' }],
    }],
  });

  if (!reservation) {
    return { found: false, message: 'Reservasi dengan kode booking tersebut tidak ditemukan.' };
  }

  const statusLabels = {
    PENDING: '⏳ Menunggu Konfirmasi',
    CONFIRMED: '✅ Dikonfirmasi',
    CANCELLED: '❌ Dibatalkan',
    COMPLETED: '✔️ Selesai',
  };

  return {
    found: true,
    detail: {
      kodeBooking: reservation.bookingCode,
      namaPasien: reservation.patientName,
      telepon: reservation.patientPhone,
      dokter: reservation.doctor?.name || '-',
      departemen: reservation.doctor?.department?.name || '-',
      tanggalWaktu: reservation.dateTime,
      alasan: reservation.reason || '-',
      status: statusLabels[reservation.status] || reservation.status,
      dibuatPada: reservation.createdAt,
    },
  };
}

// Map function names to handlers
const functionHandlers = {
  getDepartments,
  searchDoctors,
  getDoctorSchedule,
  getAvailableSlots,
  createReservation,
  checkReservation,
};

module.exports = functionHandlers;
