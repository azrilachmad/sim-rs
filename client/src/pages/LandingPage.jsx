import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedIcon from '@mui/icons-material/Verified';

const departments = [
  { icon: '🩺', name: 'Poli Umum', desc: 'Pemeriksaan & konsultasi umum' },
  { icon: '👶', name: 'Poli Anak', desc: 'Kesehatan bayi & anak' },
  { icon: '❤️', name: 'Poli Jantung', desc: 'Kardiovaskular' },
  { icon: '🔪', name: 'Poli Bedah', desc: 'Bedah umum & spesialistik' },
  { icon: '👁️', name: 'Poli Mata', desc: 'Kesehatan mata' },
  { icon: '🦷', name: 'Poli Gigi', desc: 'Kesehatan gigi & mulut' },
  { icon: '🧴', name: 'Poli Kulit', desc: 'Kulit & kelamin' },
  { icon: '🧠', name: 'Poli Saraf', desc: 'Neurologi' },
];

const steps = [
  { icon: <ChatIcon sx={{ fontSize: 32 }} />, title: 'Mulai Chat', desc: 'Buka halaman chat dan mulai percakapan dengan AI asisten.' },
  { icon: <SearchIcon sx={{ fontSize: 32 }} />, title: 'Tanyakan Info', desc: 'Tanyakan jadwal dokter, spesialis, atau poli yang Anda butuhkan.' },
  { icon: <EventAvailableIcon sx={{ fontSize: 32 }} />, title: 'Buat Reservasi', desc: 'AI akan membantu Anda memilih waktu dan membuat reservasi.' },
  { icon: <VerifiedIcon sx={{ fontSize: 32 }} />, title: 'Konfirmasi', desc: 'Dapatkan kode booking. Reservasi dikonfirmasi oleh admin.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary-500/20">
              RS
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">RS Sehat</h1>
              <p className="text-[10px] text-primary-400 font-medium tracking-wider uppercase">AI Assistant</p>
            </div>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SmartToyIcon />}
            onClick={() => navigate('/chat')}
            sx={{ borderRadius: 3, px: 3 }}
          >
            Chat AI
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-navy-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-sm text-primary-300 font-medium">AI-Powered Hospital Assistant</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
            <span className="text-white">Layanan Rumah Sakit</span>
            <br />
            <span className="gradient-text">Lebih Mudah dengan AI</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Tanyakan jadwal dokter, cari spesialis, dan buat reservasi — semua melalui percakapan dengan asisten AI kami.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/chat')}
              sx={{
                py: 1.8,
                px: 5,
                fontSize: '1.1rem',
                borderRadius: 4,
              }}
            >
              Mulai Chat Sekarang
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{
                py: 1.8,
                px: 5,
                fontSize: '1.1rem',
                borderRadius: 4,
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#94a3b8',
                '&:hover': {
                  borderColor: 'rgba(6, 196, 170, 0.5)',
                  bgcolor: 'rgba(6, 196, 170, 0.05)',
                },
              }}
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { num: '14+', label: 'Dokter' },
              { num: '8', label: 'Poli' },
              { num: '24/7', label: 'AI Online' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.num}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Fitur Utama</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Apa yang Bisa Kami Bantu?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <AccessTimeIcon sx={{ fontSize: 36, color: '#06c4aa' }} />,
                title: 'Jadwal Dokter',
                desc: 'Cek jadwal praktek dokter kapan saja. Ketahui hari dan jam praktek setiap dokter.',
                gradient: 'from-primary-500/20 to-primary-900/20',
              },
              {
                icon: <LocalHospitalIcon sx={{ fontSize: 36, color: '#818cf8' }} />,
                title: 'Info Spesialis & Poli',
                desc: 'Temukan dokter spesialis yang tepat. Cari berdasarkan departemen atau keahlian.',
                gradient: 'from-navy-400/20 to-navy-700/20',
              },
              {
                icon: <CalendarMonthIcon sx={{ fontSize: 36, color: '#f59e0b' }} />,
                title: 'Reservasi Online',
                desc: 'Buat janji temu langsung dari chat. Pilih dokter, tanggal, dan waktu yang tersedia.',
                gradient: 'from-amber-500/20 to-amber-900/20',
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`glass rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 cursor-default group`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Departemen</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Poli & Spesialisasi</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="glass rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/chat')}
              >
                <span className="text-4xl block mb-3 group-hover:scale-125 transition-transform duration-300">{dept.icon}</span>
                <h5 className="text-sm font-bold text-white mb-1">{dept.name}</h5>
                <p className="text-xs text-slate-500">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Cara Kerja</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white">Mudah & Cepat</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-navy-400/20 flex items-center justify-center mx-auto mb-4 text-primary-400">
                  {step.icon}
                </div>
                <div className="absolute top-0 right-0 w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 md:right-auto md:left-1/2 md:transform md:-translate-x-1/2 md:-top-3">
                  {i + 1}
                </div>
                <h5 className="text-lg font-bold text-white mb-2">{step.title}</h5>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-navy-400/10" />
            <div className="relative z-10">
              <SmartToyIcon sx={{ fontSize: 48, color: '#06c4aa', mb: 2 }} />
              <h3 className="text-3xl font-bold text-white mb-4">Siap Memulai?</h3>
              <p className="text-slate-400 mb-8 text-lg">
                Chat dengan AI kami sekarang untuk mendapatkan informasi rumah sakit dan membuat reservasi.
              </p>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/chat')}
                sx={{ py: 1.8, px: 5, fontSize: '1.1rem', borderRadius: 4 }}
              >
                Buka Chat AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
              RS
            </div>
            <span className="text-sm text-slate-500">RS Sehat AI Assistant</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 RS Sehat. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
