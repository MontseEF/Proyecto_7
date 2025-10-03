const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  reference: {
    documentType: {
      type: String,
      enum: ['sale', 'purchase_order', 'adjustment', 'transfer']
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId
    },
    documentNumber: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  notes: String,
  location: {
    from: {
      aisle: String,
      shelf: String,
      bin: String
    },
    to: {
      aisle: String,
      shelf: String,
      bin: String
    }
  }
}, {
  timestamps: true
});

// Índices
inventoryMovementSchema.index({ product: 1, createdAt: -1 });
inventoryMovementSchema.index({ type: 1, createdAt: -1 });
inventoryMovementSchema.index({ user: 1 });

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);