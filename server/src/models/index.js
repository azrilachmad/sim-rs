const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '🏥',
  },
}, {
  tableName: 'departments',
  timestamps: true,
});

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  tableName: 'doctors',
  timestamps: true,
});

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id',
    },
  },
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0=Minggu, 1=Senin, ..., 6=Sabtu
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING, // "08:00"
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING, // "15:00"
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'dayOfWeek'],
    },
  ],
});

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  patientPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  patientEmail: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id',
    },
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING',
  },
  bookingCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'reservations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'dateTime'],
    },
  ],
});

// Associations
Department.hasMany(Doctor, { foreignKey: 'departmentId', as: 'doctors' });
Doctor.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Doctor.hasMany(Schedule, { foreignKey: 'doctorId', as: 'schedules' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Doctor.hasMany(Reservation, { foreignKey: 'doctorId', as: 'reservations' });
Reservation.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = { Department, Doctor, Schedule, Reservation };
