const sequelize = require('../config/database');
const { Department, Doctor, Schedule } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('🗄️  Database synced.');

    // --- Departments ---
    const departments = await Department.bulkCreate([
      { name: 'Poli Umum', description: 'Pelayanan kesehatan umum untuk pemeriksaan rutin, konsultasi, dan penanganan penyakit umum.', icon: '🩺' },
      { name: 'Poli Anak', description: 'Pelayanan kesehatan khusus untuk bayi, anak-anak, dan remaja.', icon: '👶' },
      { name: 'Poli Jantung', description: 'Pelayanan kesehatan terkait jantung dan pembuluh darah (kardiovaskular).', icon: '❤️' },
      { name: 'Poli Bedah', description: 'Pelayanan konsultasi dan tindakan bedah umum maupun spesialistik.', icon: '🔪' },
      { name: 'Poli Mata', description: 'Pelayanan kesehatan mata termasuk pemeriksaan refraksi dan penyakit mata.', icon: '👁️' },
      { name: 'Poli Gigi', description: 'Pelayanan kesehatan gigi dan mulut termasuk pembersihan, pencabutan, dan perawatan.', icon: '🦷' },
      { name: 'Poli Kulit & Kelamin', description: 'Pelayanan kesehatan terkait penyakit kulit, kelamin, dan kosmetik medis.', icon: '🧴' },
      { name: 'Poli Saraf', description: 'Pelayanan kesehatan terkait gangguan sistem saraf dan otak.', icon: '🧠' },
    ]);

    console.log('✅ Departments seeded.');

    // --- Doctors ---
    const doctors = await Doctor.bulkCreate([
      // Poli Umum (id: 1)
      { name: 'dr. Ahmad Fadillah, Sp.PD', specialization: 'Dokter Umum / Penyakit Dalam', departmentId: 1, bio: 'Berpengalaman 15 tahun dalam bidang penyakit dalam dan kedokteran umum.' },
      { name: 'dr. Siti Nurhaliza', specialization: 'Dokter Umum', departmentId: 1, bio: 'Dokter umum dengan keahlian khusus dalam pencegahan dan promosi kesehatan.' },
      
      // Poli Anak (id: 2)
      { name: 'dr. Budi Santoso, Sp.A', specialization: 'Spesialis Anak', departmentId: 2, bio: 'Spesialis anak dengan sub-spesialisasi tumbuh kembang anak.' },
      { name: 'dr. Dewi Kusuma, Sp.A', specialization: 'Spesialis Anak', departmentId: 2, bio: 'Ahli dalam penanganan alergi dan imunologi anak.' },
      
      // Poli Jantung (id: 3)
      { name: 'dr. Eko Prasetyo, Sp.JP', specialization: 'Spesialis Jantung & Pembuluh Darah', departmentId: 3, bio: 'Konsultan kardiologi intervensi dengan pengalaman 20 tahun.' },
      { name: 'dr. Fitri Handayani, Sp.JP', specialization: 'Spesialis Jantung', departmentId: 3, bio: 'Spesialis jantung dengan fokus pada pencegahan penyakit kardiovaskular.' },
      
      // Poli Bedah (id: 4)
      { name: 'dr. Gunawan Wibisono, Sp.B', specialization: 'Spesialis Bedah Umum', departmentId: 4, bio: 'Ahli bedah dengan pengalaman dalam operasi laparoskopi dan minimal invasif.' },
      
      // Poli Mata (id: 5)
      { name: 'dr. Hadi Santosa, Sp.M', specialization: 'Spesialis Mata', departmentId: 5, bio: 'Spesialis mata dengan keahlian dalam bedah katarak dan LASIK.' },
      { name: 'dr. Indah Permata, Sp.M', specialization: 'Spesialis Mata', departmentId: 5, bio: 'Ahli dalam penanganan glaukoma dan retina.' },
      
      // Poli Gigi (id: 6)
      { name: 'drg. Joko Widodo', specialization: 'Dokter Gigi Umum', departmentId: 6, bio: 'Dokter gigi dengan keahlian dalam restorasi dan estetika gigi.' },
      { name: 'drg. Kartini Sari, Sp.KG', specialization: 'Spesialis Konservasi Gigi', departmentId: 6, bio: 'Spesialis perawatan saluran akar dan restorasi gigi.' },
      
      // Poli Kulit (id: 7)
      { name: 'dr. Lestari Dewi, Sp.KK', specialization: 'Spesialis Kulit & Kelamin', departmentId: 7, bio: 'Ahli dermatologi dengan pengalaman dalam penanganan penyakit kulit dan kosmetik.' },
      
      // Poli Saraf (id: 8)
      { name: 'dr. Muhammad Rizki, Sp.N', specialization: 'Spesialis Saraf', departmentId: 8, bio: 'Neurolog berpengalaman dalam penanganan stroke, epilepsi, dan gangguan saraf lainnya.' },
      { name: 'dr. Nadia Putri, Sp.N', specialization: 'Spesialis Saraf', departmentId: 8, bio: 'Spesialis saraf dengan fokus pada nyeri kepala dan gangguan tidur.' },
    ]);

    console.log('✅ Doctors seeded.');

    // --- Schedules ---
    const scheduleData = [];
    
    // dr. Ahmad Fadillah (id: 1) - Senin, Rabu, Jumat
    scheduleData.push({ doctorId: 1, dayOfWeek: 1, startTime: '08:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 1, dayOfWeek: 3, startTime: '08:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 1, dayOfWeek: 5, startTime: '08:00', endTime: '14:00' });
    
    // dr. Siti Nurhaliza (id: 2) - Selasa, Kamis, Sabtu
    scheduleData.push({ doctorId: 2, dayOfWeek: 2, startTime: '09:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 2, dayOfWeek: 4, startTime: '09:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 2, dayOfWeek: 6, startTime: '09:00', endTime: '13:00' });
    
    // dr. Budi Santoso (id: 3) - Senin, Rabu, Sabtu
    scheduleData.push({ doctorId: 3, dayOfWeek: 1, startTime: '10:00', endTime: '16:00' });
    scheduleData.push({ doctorId: 3, dayOfWeek: 3, startTime: '10:00', endTime: '16:00' });
    scheduleData.push({ doctorId: 3, dayOfWeek: 6, startTime: '08:00', endTime: '12:00' });
    
    // dr. Dewi Kusuma (id: 4) - Selasa, Kamis, Jumat
    scheduleData.push({ doctorId: 4, dayOfWeek: 2, startTime: '08:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 4, dayOfWeek: 4, startTime: '08:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 4, dayOfWeek: 5, startTime: '10:00', endTime: '15:00' });
    
    // dr. Eko Prasetyo (id: 5) - Senin, Rabu
    scheduleData.push({ doctorId: 5, dayOfWeek: 1, startTime: '09:00', endTime: '13:00' });
    scheduleData.push({ doctorId: 5, dayOfWeek: 3, startTime: '09:00', endTime: '13:00' });
    
    // dr. Fitri Handayani (id: 6) - Selasa, Kamis, Sabtu
    scheduleData.push({ doctorId: 6, dayOfWeek: 2, startTime: '10:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 6, dayOfWeek: 4, startTime: '10:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 6, dayOfWeek: 6, startTime: '09:00', endTime: '12:00' });
    
    // dr. Gunawan Wibisono (id: 7) - Senin, Rabu, Jumat
    scheduleData.push({ doctorId: 7, dayOfWeek: 1, startTime: '08:00', endTime: '12:00' });
    scheduleData.push({ doctorId: 7, dayOfWeek: 3, startTime: '13:00', endTime: '17:00' });
    scheduleData.push({ doctorId: 7, dayOfWeek: 5, startTime: '08:00', endTime: '12:00' });
    
    // dr. Hadi Santosa (id: 8) - Senin, Kamis
    scheduleData.push({ doctorId: 8, dayOfWeek: 1, startTime: '08:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 8, dayOfWeek: 4, startTime: '08:00', endTime: '14:00' });
    
    // dr. Indah Permata (id: 9) - Selasa, Jumat
    scheduleData.push({ doctorId: 9, dayOfWeek: 2, startTime: '09:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 9, dayOfWeek: 5, startTime: '09:00', endTime: '15:00' });
    
    // drg. Joko Widodo (id: 10) - Senin, Selasa, Kamis, Jumat
    scheduleData.push({ doctorId: 10, dayOfWeek: 1, startTime: '08:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 10, dayOfWeek: 2, startTime: '08:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 10, dayOfWeek: 4, startTime: '08:00', endTime: '15:00' });
    scheduleData.push({ doctorId: 10, dayOfWeek: 5, startTime: '08:00', endTime: '15:00' });
    
    // drg. Kartini Sari (id: 11) - Rabu, Sabtu
    scheduleData.push({ doctorId: 11, dayOfWeek: 3, startTime: '09:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 11, dayOfWeek: 6, startTime: '09:00', endTime: '13:00' });
    
    // dr. Lestari Dewi (id: 12) - Selasa, Kamis, Sabtu
    scheduleData.push({ doctorId: 12, dayOfWeek: 2, startTime: '10:00', endTime: '16:00' });
    scheduleData.push({ doctorId: 12, dayOfWeek: 4, startTime: '10:00', endTime: '16:00' });
    scheduleData.push({ doctorId: 12, dayOfWeek: 6, startTime: '08:00', endTime: '12:00' });
    
    // dr. Muhammad Rizki (id: 13) - Senin, Rabu, Jumat
    scheduleData.push({ doctorId: 13, dayOfWeek: 1, startTime: '09:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 13, dayOfWeek: 3, startTime: '09:00', endTime: '14:00' });
    scheduleData.push({ doctorId: 13, dayOfWeek: 5, startTime: '13:00', endTime: '17:00' });
    
    // dr. Nadia Putri (id: 14) - Selasa, Kamis
    scheduleData.push({ doctorId: 14, dayOfWeek: 2, startTime: '08:00', endTime: '13:00' });
    scheduleData.push({ doctorId: 14, dayOfWeek: 4, startTime: '08:00', endTime: '13:00' });

    await Schedule.bulkCreate(scheduleData);
    console.log('✅ Schedules seeded.');

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
