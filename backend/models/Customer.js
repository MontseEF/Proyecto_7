const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  dni: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  rut: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  customerType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  businessName: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    number: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Chile'
    }
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  currentCredit: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['cash', '15_days', '30_days', '45_days', '60_days'],
    default: 'cash'
  },
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String,
  lastPurchase: {
    type: Date
  },
  totalPurchases: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual para nombre completo
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual para crédito disponible
customerSchema.virtual('availableCredit').get(function() {
  return this.creditLimit - this.currentCredit;
});

// Índices
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ dni: 1 });
customerSchema.index({ rut: 1 });

customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);