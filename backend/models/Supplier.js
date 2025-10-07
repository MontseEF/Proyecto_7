const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El nombre del proveedor es requerido'], trim: true, index: true },
    businessName: { type: String, trim: true, default: '' },

    rut:   { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true,
             trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email inválido'] },

    phone:   { type: String, required: [true, 'El teléfono es requerido'], trim: true },
    address: {
      street: String, number: String, city: String, state: String, zipCode: String,
      country: { type: String, default: 'Chile' }
    },
    contact: {
      name: String,
      phone: String,
      email: { type: String, trim: true, lowercase: true,
               match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email de contacto inválido'] },
      position: String
    },
    paymentTerms: { type: String, enum: ['immediate', '15_days', '30_days', '45_days', '60_days', '90_days'], default: '30_days' },
    deliveryTerms: { type: String, enum: ['pickup', 'delivery', 'both'], default: 'both' },
    minimumOrder: { type: Number, default: 0, min: 0 },

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

    rating: { type: Number, min: 1, max: 5, default: 3 },
    isActive: { type: Boolean, default: true, index: true },
    isPreferred: { type: Boolean, default: false },

    notes: String,
    lastOrder: Date,
    totalOrders: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Virtual: productos que suministra
SupplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier'
});

// Índices adicionales
SupplierSchema.index({ name: 1, isActive: 1 });
SupplierSchema.index({ rut: 1 },   { unique: true, sparse: true });
SupplierSchema.index({ email: 1 }, { unique: true, sparse: true });

// Normalización
SupplierSchema.pre('save', function (next) {
  if (this.name)  this.name  = this.name.trim();
  if (this.email) this.email = this.email.trim().toLowerCase();
  if (this.rut)   this.rut   = this.rut.trim();
  if (this.phone) this.phone = this.phone.trim();
  if (this.contact && this.contact.email) {
    this.contact.email = String(this.contact.email).trim().toLowerCase();
  }
  next();
});

SupplierSchema.pre('findOneAndUpdate', function (next) {
  const u = this.getUpdate() || {};
  if (u.name)  u.name  = String(u.name).trim();
  if (u.email) u.email = String(u.email).trim().toLowerCase();
  if (u.rut)   u.rut   = String(u.rut).trim();
  if (u.phone) u.phone = String(u.phone).trim();
  if (u.contact?.email) u.contact.email = String(u.contact.email).trim().toLowerCase();
  this.setUpdate(u);
  next();
});

// Salidas con virtuales
SupplierSchema.set('toJSON',   { virtuals: true });
SupplierSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
