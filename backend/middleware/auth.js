const jwt = require('jsonwebtoken');
const User = require('../models/User');


const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    const token = match ? match[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const userId = decoded.id ?? decoded.userId; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token inválido (payload incompleto).' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Token inválido o usuario inactivo.' });
    }

    // inyectamos info útil
    req.user = { _id: user._id, role: user.role, username: user.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Sesión expirada. Inicia sesión nuevamente.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    console.error('Error en middleware de autenticación:', err);
    return res.status(401).json({ success: false, message: 'No autenticado.' });
  }
};

const authorize = (roles = []) => {
  const list = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. Usuario no autenticado.' });
    }
    if (list.length && !list.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Permisos insuficientes.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
