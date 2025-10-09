const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validaciones
const validateLogin = [
  body('username').notEmpty().withMessage('Username requerido'),
  body('password').notEmpty().withMessage('Password requerido')
];

//Generar token JWT
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error('FALTA JWT_SECRET en el archivo .env del backend');
}
const generateToken = (userId) =>
  jwt.sign({ userId }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

//POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { username, password } = req.body;

    // Busca usuario por username o email e incluye contraseña
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!user.password) {
      return res.status(500).json({ success: false, message: 'Usuario sin hash de contraseña' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: { user: userResponse, token }
    });
  } catch (error) {
    console.error('AUTH /login error:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
