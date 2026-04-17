const toolDeclarations = [
  {
    name: 'getDoctorSchedule',
    description: 'Mencari jadwal praktek dokter dari database rumah sakit. Gunakan function ini SETIAP kali user bertanya tentang dokter atau jadwal. JANGAN mengarang data tanpa memanggil function ini terlebih dahulu.',
    parameters: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Kata kunci pencarian: nama dokter (contoh: "Alexander"), spesialis (contoh: "anak"), atau nama poli (contoh: "GIGI"). Kosongkan string "" untuk menampilkan semua dokter.',
        },
        offset: {
          type: 'integer',
          description: 'Offset untuk pagination. Default 0. Jika user minta "lihat lebih banyak" atau "tampilkan semua", gunakan offset sesuai jumlah_ditampilkan sebelumnya (misal: 5, 10, 15).',
        },
      },
    },
  },
  {
    name: 'getPatients',
    description: 'Mencari data pasien berdasarkan nama di database rumah sakit. WAJIB dipanggil saat proses reservasi untuk mendapatkan patient_id yang valid. JANGAN menggunakan ID pasien yang tidak berasal dari hasil function ini.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nama pasien yang dicari. Contoh: "Tati Suheti". Pencarian bersifat partial match.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'createAppointment',
    description: 'Membuat reservasi/appointment baru. HANYA panggil function ini SETELAH user mengkonfirmasi semua data (jawab "ya/benar/oke"). Parameter patient_id dan doctor_id HARUS berasal dari hasil getPatients dan getDoctorSchedule.',
    parameters: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'integer',
          description: 'ID pasien dari hasil getPatients. Contoh: 1. JANGAN gunakan ID yang tidak dari hasil pencarian.',
        },
        doctor_id: {
          type: 'integer',
          description: 'ID dokter dari hasil getDoctorSchedule. Contoh: 90. JANGAN gunakan ID yang tidak dari hasil pencarian.',
        },
        appointment_date: {
          type: 'string',
          description: 'Tanggal dan waktu appointment. Format WAJIB: "YYYY-MM-DD HH:MM:SS". Contoh: "2026-04-17 10:00:00". Tanggal HARUS sesuai jadwal dokter.',
        },
        keluhan: {
          type: 'string',
          description: 'Keluhan pasien dalam bentuk kalimat. Contoh: "Demam tinggi sejak 3 hari yang lalu".',
        },
      },
      required: ['patient_id', 'doctor_id', 'appointment_date', 'keluhan'],
    },
  },
];

module.exports = toolDeclarations;
