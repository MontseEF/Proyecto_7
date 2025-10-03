const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del proveedor es requerido'],
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  rut: {
    type: String,
    unique: true,
    sparse: true,
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
  contact: {
    name: String,
    phone: String,
    email: String,
    position: String
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', '15_days', '30_days', '45_days', '60_days', '90_days'],
    default: '30_days'
  },
  deliveryTerms: {
    type: String,
    enum: ['pickup', 'delivery', 'both'],
    default: 'both'
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  notes: String,
  lastOrder: {
    type: Date
  },
  totalOrders: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices
supplierSchema.index({ name: 1 });
supplierSchema.index({ rut: 1 });
supplierSchema.index({ email: 1 });

// Virtual para productos que suministra
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier'
});

supplierSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Supplier', supplierSchema);