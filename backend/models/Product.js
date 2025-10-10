const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
      index: true
    },
    sku: {
      type: String,
      required: [true, 'El SKU es requerido'],
      unique: true,
      uppercase: true,
      trim: true
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null
    },
    pricing: {
      costPrice: {
        type: Number,
        default: 0,
        min: 0
      },
      sellingPrice: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    inventory: {
      currentStock: {
        type: Number,
        default: 0,
        min: 0
      },
      minStock: {
        type: Number,
        default: 5,
        min: 0
      }
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Índices para búsquedas eficientes
ProductSchema.index({ name: 'text', sku: 'text', barcode: 'text', brand: 'text' });

// Virtual: producto con stock bajo
ProductSchema.virtual('isLowStock').get(function () {
  return this.inventory.currentStock <= this.inventory.minStock;
});

// Virtual: margen de ganancia en %
ProductSchema.virtual('profitMargin').get(function () {
  if (this.pricing.costPrice === 0) return 0;
  return (
    ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) *
    100
  ).toFixed(2);
});

// Middleware: normaliza SKU y name
ProductSchema.pre('save', function (next) {
  if (this.sku) this.sku = String(this.sku).trim().toUpperCase();
  if (this.name) this.name = String(this.name).trim();
  next();
});

ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
