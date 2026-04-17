import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [umur, setUmur] = useState('');
  const [sex, setSex] = useState('');
  const [noMR, setNoMR] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, { umur, sex, no_mr: noMR || undefined });
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏥</div>
          <h1>RS Sehat AI</h1>
          <p>Buat akun baru</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap sesuai rekam medis"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="umur">Umur</label>
              <input
                id="umur"
                type="text"
                value={umur}
                onChange={(e) => setUmur(e.target.value)}
                placeholder="Contoh: 25 Tahun"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sex">Jenis Kelamin</label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                required
              >
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="noMR">No. Rekam Medis <span className="optional">(opsional)</span></label>
            <input
              id="noMR"
              type="text"
              value={noMR}
              onChange={(e) => setNoMR(e.target.value)}
              placeholder="Contoh: 00-29-14"
            />
            <span className="form-hint">Isi jika sudah pernah berobat untuk auto-link data pasien</span>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
