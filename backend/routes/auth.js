const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// Validaciones 
const validateRegistration = [
  body('username').isLength({ min: 3 }).withMessage('Username debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre es requerido'),
  body('lastName').notEmpty().withMessage('Apellido es requerido')
];

const validateLogin = [
  body('username').notEmpty().withMessage('Username o email es requerido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

// Registro (seed)
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, role, phone } = req.body;

// Unicidad: usernameLower + email
    const usernameLower = username.toLowerCase();
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { usernameLower }]
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Usuario o email ya existe' });
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      phone
    });

    const token = signToken(user);
    const { password: _pw, ...safe } = user.toObject();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { user: safe, token }
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Login (username o email) 
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
    }

    const { username, password } = req.body;

// Permite login con username o email
    const q = {
      $or: [
        { usernameLower: String(username).toLowerCase() },
        { email: String(username).toLowerCase() }
      ],
      isActive: true
    };

  // Importante: traer password explícitamente
    const user = await User.findOne(q).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    const { password: _pw, ...safe } = user.toObject();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: { user: safe, token }
    });
  } catch (err) {
    console.error('Error al hacer login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Perfil 
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('username email role firstName lastName phone isActive createdAt updatedAt');
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Actualizar perfil (usa auth) 
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Opcional: impedir cambio de email a uno ya usado
    if (email) {
      const exists = await User.findOne({ _id: { $ne: req.user._id }, email: String(email).toLowerCase() });
      if (exists) return res.status(400).json({ success: false, message: 'Ese email ya está en uso' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, email },
      { new: true, runValidators: true }
    ).select('username email role firstName lastName phone isActive createdAt updatedAt');

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    res.json({ success: true, message: 'Perfil actualizado exitosamente', data: { user } });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Cambiar contraseña (usa auth) 
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña actual y nueva son requeridas' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });

    user.password = newPassword; // pre('save') hará el hash
    await user.save();

    res.json({ success: true, message: 'Contraseña cambiada exitosamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
