const toolDeclarations = [
  {
    name: 'getDoctorSchedule',
    description: 'Mencari jadwal praktek dokter dari database rumah sakit. Gunakan function ini SETIAP kali user bertanya tentang dokter atau jadwal. JANGAN mengarang data tanpa memanggil function ini terlebih dahulu.',
    parameters: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Kata kunci pencarian: nama dokter, spesialis, atau nama poli. Kosongkan string "" untuk menampilkan semua dokter.',
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
    description: 'Membuat reservasi/appointment baru. HANYA panggil SETELAH user konfirmasi "ya/benar/oke". Semua parameter WAJIB diisi dari hasil function sebelumnya (getPatients & getDoctorSchedule).',
    parameters: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'integer',
          description: 'ID pasien dari hasil getPatients.',
        },
        doctor_id: {
          type: 'integer',
          description: 'ID dokter dari hasil getDoctorSchedule.',
        },
        poli: {
          type: 'string',
          description: 'Nama poli dokter dari hasil getDoctorSchedule. Contoh: "GIGI", "UMUM", "PENYAKIT DALAM". WAJIB diisi dari data dokter.',
        },
        appointment_date: {
          type: 'string',
          description: 'Tanggal dan waktu appointment. Format WAJIB: "YYYY-MM-DD HH:MM:SS". Contoh: "2026-04-17 10:00:00".',
        },
        keluhan: {
          type: 'string',
          description: 'Keluhan pasien dalam bentuk kalimat.',
        },
      },
      required: ['patient_id', 'doctor_id', 'poli', 'appointment_date', 'keluhan'],
    },
  },
];

module.exports = toolDeclarations;
