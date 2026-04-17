const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

// ==================== MODELS ====================

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  kode: { type: DataTypes.STRING, defaultValue: '' },
  gender: { type: DataTypes.STRING, defaultValue: '' },
  tipe_nakes: { type: DataTypes.STRING, defaultValue: '' },
  spesialis: { type: DataTypes.STRING, defaultValue: '' },
  poli: { type: DataTypes.STRING, defaultValue: '' },
}, { timestamps: false, tableName: 'doctors' });

const DoctorSchedule = sequelize.define('DoctorSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctor_id: { type: DataTypes.INTEGER, allowNull: false },
  hari: { type: DataTypes.STRING, allowNull: false },
  jadwal_praktek: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: false, tableName: 'doctor_schedules' });

const Patient = sequelize.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  no_mr: { type: DataTypes.STRING, defaultValue: '' },
  no_reg: { type: DataTypes.STRING, defaultValue: '' },
  umur: { type: DataTypes.STRING, defaultValue: '' },
  sex: { type: DataTypes.STRING, defaultValue: '' },
}, { timestamps: false, tableName: 'patients' });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  patient_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hashSync(user.password, 10);
    },
  },
});

User.prototype.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, defaultValue: '' },
  patient_id: { type: DataTypes.INTEGER, allowNull: false },
  doctor_id: { type: DataTypes.INTEGER, allowNull: false },
  appointment_date: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, defaultValue: 'submit' },
  keluhan: { type: DataTypes.STRING, defaultValue: '' },
  poli: { type: DataTypes.STRING, defaultValue: '' },
}, { timestamps: true, tableName: 'appointments' });

// ==================== ASSOCIATIONS ====================

Doctor.hasMany(DoctorSchedule, { foreignKey: 'doctor_id', as: 'jadwal' });
DoctorSchedule.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctorData' });

Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patientData' });

User.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

module.exports = {
  sequelize,
  Doctor,
  DoctorSchedule,
  Patient,
  User,
  Appointment,
};

