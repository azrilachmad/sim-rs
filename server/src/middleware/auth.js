const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rs-sehat-ai-secret-key-2026';

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      patient_id: user.patient_id,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: verify JWT token
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired.' });
  }
}

module.exports = { generateToken, authMiddleware, JWT_SECRET };
