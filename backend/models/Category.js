const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es requerido'],
      trim: true
    },
    // campo auxiliar para unicidad case-insensitive
    nameLower: {
      type: String,
      unique: true,
      index: true,
      select: false 
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

// Virtuales
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Índices adicionales útiles
CategorySchema.index({ name: 'text', description: 'text' });

// Normalización
CategorySchema.pre('save', function (next) {
  if (this.name) {
    this.name = String(this.name).trim();
    this.nameLower = this.name.toLowerCase();
  }
  next();
});

// Para updates con findOneAndUpdate
CategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  if (update.name) {
    update.name = String(update.name).trim();
    update.nameLower = update.name.toLowerCase();
    this.setUpdate(update);
  }
  next();
});

// Incluir virtuals en salidas
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', CategorySchema);
