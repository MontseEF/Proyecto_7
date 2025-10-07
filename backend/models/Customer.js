const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'El nombre es requerido'], trim: true },
    lastName:  { type: String, required: [true, 'El apellido es requerido'], trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,       // permite varios null/undefined
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email inválido']
    },
    phone: { type: String, required: [true, 'El teléfono es requerido'], trim: true },
    dni:   { type: String, unique: true, sparse: true, trim: true },
    rut:   { type: String, unique: true, sparse: true, trim: true },
    customerType: { type: String, enum: ['individual', 'business'], default: 'individual' },
    businessName: { type: String, trim: true, default: '' },
    address: {
      street: String, number: String, city: String, state: String, zipCode: String,
      country: { type: String, default: 'Chile' }
    },
    creditLimit:   { type: Number, default: 0, min: 0 },
    currentCredit: { type: Number, default: 0, min: 0 },
    paymentTerms:  { type: String, enum: ['cash', '15_days', '30_days', '45_days', '60_days'], default: 'cash' },
    discountRate:  { type: Number, default: 0, min: 0, max: 100 },
    isActive:      { type: Boolean, default: true, index: true },
    notes: String,
    lastPurchase:   { type: Date },
    totalPurchases: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Virtuales
CustomerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
CustomerSchema.virtual('availableCredit').get(function () {
  return this.creditLimit - this.currentCredit;
});

// Índices
CustomerSchema.index({ email: 1 }, { sparse: true, unique: true });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ dni: 1 }, { sparse: true, unique: true });
CustomerSchema.index({ rut: 1 }, { sparse: true, unique: true });
CustomerSchema.index({ lastName: 1, firstName: 1, isActive: 1 });

// Normalización
CustomerSchema.pre('save', function (next) {
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName)  this.lastName  = this.lastName.trim();
  if (this.email)     this.email     = this.email.trim().toLowerCase();
  if (this.rut)       this.rut       = this.rut.trim();
  if (this.dni)       this.dni       = this.dni.trim();
  if (this.phone)     this.phone     = this.phone.trim();
  next();
});

CustomerSchema.pre('findOneAndUpdate', function (next) {
  const u = this.getUpdate() || {};
  if (u.firstName) u.firstName = String(u.firstName).trim();
  if (u.lastName)  u.lastName  = String(u.lastName).trim();
  if (u.email)     u.email     = String(u.email).trim().toLowerCase();
  if (u.rut)       u.rut       = String(u.rut).trim();
  if (u.dni)       u.dni       = String(u.dni).trim();
  if (u.phone)     u.phone     = String(u.phone).trim();
  this.setUpdate(u);
  next();
});

// Salidas con virtuales
CustomerSchema.set('toJSON',   { virtuals: true });
CustomerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', CustomerSchema);
