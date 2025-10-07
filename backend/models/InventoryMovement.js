const mongoose = require('mongoose');

const InventoryMovementSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type:     { type: String, enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage'], required: true, index: true },
    quantity: { type: Number, required: true, min: 0 }, // pon min:1 si quieres prohibir 0
    previousStock: { type: Number, required: true, min: 0 },
    newStock:      { type: Number, required: true, min: 0 },

    unitCost:  { type: Number, min: 0, default: 0 },
    totalCost: { type: Number, min: 0, default: 0 },

    reference: {
      documentType: { type: String, enum: ['sale', 'purchase_order', 'adjustment', 'transfer'] },
      documentId:   { type: mongoose.Schema.Types.ObjectId },
      documentNumber: String
    },

    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },

    notes: String,
    location: {
      from: { aisle: String, shelf: String, bin: String },
      to:   { aisle: String, shelf: String, bin: String }
    }
  },
  { timestamps: true }
);

// Índices
InventoryMovementSchema.index({ product: 1, createdAt: -1 });
InventoryMovementSchema.index({ type: 1, createdAt: -1 });
InventoryMovementSchema.index({ user: 1, createdAt: -1 });

// Calcula totalCost si no viene
InventoryMovementSchema.pre('save', function (next) {
  if (!this.totalCost) {
    this.totalCost = Number((this.quantity || 0) * (this.unitCost || 0));
  }
  // Validación simple de stock según tipo de movimiento
  if (this.type === 'purchase' || this.type === 'return') {
    if (this.newStock < this.previousStock) {
      return next(new Error('newStock debe ser mayor o igual a previousStock en entradas'));
    }
  }
  if (this.type === 'sale' || this.type === 'damage') {
    if (this.newStock > this.previousStock) {
      return next(new Error('newStock debe ser menor o igual a previousStock en salidas'));
    }
  }
  next();
});

module.exports = mongoose.model('InventoryMovement', InventoryMovementSchema);
