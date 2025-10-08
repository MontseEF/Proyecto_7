const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },

    // clave para unicidad case-insensitive
    usernameLower: {
      type: String,
      index: true,
      unique: true,
      sparse: true
    },

    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },

    password: {
      type: String,
      required: [true, 'Digita contraseña'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false 
    },

    firstName: {
      type: String,
      required: [true, 'Se requiere el nombre'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Se requiere el apellido'],
      trim: true
    },

    role: {
      type: String,
      enum: ['admin', 'employee', 'cashier'],
      default: 'employee'
    },

    phone: { type: String, trim: true },

    isActive: { type: Boolean, default: true },

    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Índices explícitos
userSchema.index({ usernameLower: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

// Hashear contraseña
userSchema.pre('save', async function (next) {
  
  // normaliza usernameLower
  if (this.isModified('username') && this.username) {
    this.usernameLower = this.username.toLowerCase();
  }

  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual nombre completo
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

