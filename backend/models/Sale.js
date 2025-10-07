const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema(
  {
    saleNumber: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 }
      }
    ],

    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'credit', 'mixed'],
      required: true
    },

    paymentDetails: {
      cash: {
        received: { type: Number, min: 0 },
        change: { type: Number, min: 0 }
      },
      card: {
        type: { type: String, trim: true }, // visa, mastercard, etc.
        lastFour: String,
        transactionId: String
      },
      transfer: {
        bank: String,
        transactionId: String
      },
      credit: {
        dueDate: Date,
        isPaid: { type: Boolean, default: false },
        paidDate: Date
      }
    },

    status: { type: String, enum: ['completed', 'cancelled', 'refunded', 'pending'], default: 'completed' },
    notes: String,

    refund: {
      isRefunded: { type: Boolean, default: false },
      refundDate: Date,
      refundAmount: { type: Number, min: 0 },
      refundReason: String,
      refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },
  { timestamps: true }
);

// Genera número de venta incremental
SaleSchema.pre('save', async function (next) {
  if (!this.saleNumber) {
    const lastSale = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNumber = 1;
    if (lastSale?.saleNumber) {
      const last = parseInt(lastSale.saleNumber.replace(/\D/g, '')) || 0;
      nextNumber = last + 1;
    }
    this.saleNumber = `V-${String(nextNumber).padStart(6, '0')}`;
  }
  next();
});

// Índices
SaleSchema.index({ saleNumber: 1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ cashier: 1 });
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', SaleSchema);
