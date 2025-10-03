const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
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
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es requerida']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'El proveedor es requerido']
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    color: String,
    size: String,
    other: String
  },
  pricing: {
    costPrice: {
      type: Number,
      required: [true, 'El precio de costo es requerido'],
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'El precio de venta es requerido'],
      min: 0
    },
    wholesalePrice: {
      type: Number,
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0
    }
  },
  inventory: {
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    minStock: {
      type: Number,
      required: true,
      min: 0,
      default: 5
    },
    maxStock: {
      type: Number,
      min: 0
    },
    location: {
      aisle: String,
      shelf: String,
      bin: String
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'box', 'pack'],
    default: 'piece'
  },
  warranty: {
    duration: Number, // en meses
    terms: String
  }
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ 'inventory.currentStock': 1 });

// Virtual para verificar si está en stock bajo
productSchema.virtual('isLowStock').get(function() {
  return this.inventory.currentStock <= this.inventory.minStock;
});

// Virtual para calcular margen de ganancia
productSchema.virtual('profitMargin').get(function() {
  if (this.pricing.costPrice === 0) return 0;
  return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice * 100).toFixed(2);
});

// Middleware para actualizar timestamps cuando cambia el stock
productSchema.pre('save', function(next) {
  if (this.isModified('inventory.currentStock')) {
    this.inventory.lastStockUpdate = new Date();
  }
  next();
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);