const toolDeclarations = [
  {
    name: 'getDepartments',
    description: 'Mendapatkan daftar semua departemen/poli yang tersedia di rumah sakit, beserta deskripsinya.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'searchDoctors',
    description: 'Mencari dokter berdasarkan nama, spesialisasi, atau departemen. Bisa mencari semua dokter jika tidak ada filter.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nama dokter yang dicari (pencarian parsial, contoh: "Budi")',
        },
        specialization: {
          type: 'string',
          description: 'Spesialisasi dokter (contoh: "Anak", "Jantung", "Mata")',
        },
        departmentName: {
          type: 'string',
          description: 'Nama departemen/poli (contoh: "Poli Anak", "Poli Jantung")',
        },
      },
    },
  },
  {
    name: 'getDoctorSchedule',
    description: 'Mendapatkan jadwal praktek lengkap seorang dokter berdasarkan ID dokter.',
    parameters: {
      type: 'object',
      properties: {
        doctorId: {
          type: 'integer',
          description: 'ID dokter yang ingin dilihat jadwalnya',
        },
      },
      required: ['doctorId'],
    },
  },
  {
    name: 'getAvailableSlots',
    description: 'Mengecek slot waktu yang tersedia untuk reservasi dengan dokter tertentu pada tanggal tertentu.',
    parameters: {
      type: 'object',
      properties: {
        doctorId: {
          type: 'integer',
          description: 'ID dokter',
        },
        date: {
          type: 'string',
          description: 'Tanggal yang ingin dicek dalam format YYYY-MM-DD (contoh: "2026-04-15")',
        },
      },
      required: ['doctorId', 'date'],
    },
  },
  {
    name: 'createReservation',
    description: 'Membuat reservasi baru untuk pasien. Reservasi akan berstatus PENDING dan perlu dikonfirmasi oleh admin.',
    parameters: {
      type: 'object',
      properties: {
        patientName: {
          type: 'string',
          description: 'Nama lengkap pasien',
        },
        patientPhone: {
          type: 'string',
          description: 'Nomor telepon pasien',
        },
        patientEmail: {
          type: 'string',
          description: 'Email pasien (opsional)',
        },
        doctorId: {
          type: 'integer',
          description: 'ID dokter yang dituju',
        },
        dateTime: {
          type: 'string',
          description: 'Tanggal dan waktu reservasi dalam format ISO (contoh: "2026-04-15T09:00:00")',
        },
        reason: {
          type: 'string',
          description: 'Alasan atau keluhan pasien',
        },
      },
      required: ['patientName', 'patientPhone', 'doctorId', 'dateTime'],
    },
  },
  {
    name: 'checkReservation',
    description: 'Mengecek status reservasi berdasarkan kode booking.',
    parameters: {
      type: 'object',
      properties: {
        bookingCode: {
          type: 'string',
          description: 'Kode booking reservasi (contoh: "RS-ABC12345")',
        },
      },
      required: ['bookingCode'],
    },
  },
];

module.exports = toolDeclarations;
