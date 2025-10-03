const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null // Para ventas sin cliente registrado
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'credit', 'mixed'],
    required: true
  },
  paymentDetails: {
    cash: {
      received: Number,
      change: Number
    },
    card: {
      type: String, // visa, mastercard, etc.
      lastFour: String,
      transactionId: String
    },
    transfer: {
      bank: String,
      transactionId: String
    },
    credit: {
      dueDate: Date,
      isPaid: {
        type: Boolean,
        default: false
      },
      paidDate: Date
    }
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded', 'pending'],
    default: 'completed'
  },
  notes: String,
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundDate: Date,
    refundAmount: Number,
    refundReason: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Middleware para generar número de venta automáticamente
saleSchema.pre('save', async function(next) {
  if (!this.saleNumber) {
    const lastSale = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNumber = 1;
    
    if (lastSale && lastSale.saleNumber) {
      const lastNumber = parseInt(lastSale.saleNumber.replace(/\D/g, ''));
      nextNumber = lastNumber + 1;
    }
    
    this.saleNumber = `V-${nextNumber.toString().padStart(6, '0')}`;
  }
  next();
});

// Índices
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ cashier: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', saleSchema);