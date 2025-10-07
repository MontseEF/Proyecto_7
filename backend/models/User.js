const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido'],
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },
    // Para unicidad case-insensitive
    usernameLower: { type: String, unique: true, index: true, select: false },

    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email inválido']
    },

    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false // no devolverla por defecto
    },

    firstName: { type: String, required: [true, 'El nombre es requerido'], trim: true },
    lastName:  { type: String, required: [true, 'El apellido es requerido'], trim: true },

    role: { type: String, enum: ['admin', 'employee', 'cashier'], default: 'employee', index: true },

    phone:   { type: String, trim: true, default: '' },
    isActive:{ type: Boolean, default: true, index: true },
    lastLogin: Date
  },
  { timestamps: true }
);

// Virtual
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Normalización
UserSchema.pre('save', async function (next) {
  if (this.username) this.username = this.username.trim();
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName)  this.lastName  = this.lastName.trim();
  if (this.email)     this.email     = this.email.trim().toLowerCase();

  // calcula usernameLower
  if (this.username) this.usernameLower = this.username.toLowerCase();

  // Hash solo si cambió
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Hash también en updates tipo findOneAndUpdate
UserSchema.pre('findOneAndUpdate', async function (next) {
  const u = this.getUpdate() || {};

  if (u.username) {
    u.username = String(u.username).trim();
    u.usernameLower = u.username.toLowerCase();
  }
  if (u.firstName) u.firstName = String(u.firstName).trim();
  if (u.lastName)  u.lastName  = String(u.lastName).trim();
  if (u.email)     u.email     = String(u.email).trim().toLowerCase();

  // Si viene password, hashearla aquí
  if (u.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      u.password = await bcrypt.hash(String(u.password), salt);
    } catch (err) {
      return next(err);
    }
  }

  this.setUpdate(u);
  next();
});

// Comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Índices
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ usernameLower: 1 }, { unique: true });

// Virtuals en salidas
UserSchema.set('toJSON',   { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
