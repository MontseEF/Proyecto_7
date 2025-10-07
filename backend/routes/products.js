const express = require('express');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

const router = express.Router();


// Multer (subida de imágenes)

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten archivos de imagen'), false);
  }
});


// Validaciones (MVP: opcionales)

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
  body('sku').trim().notEmpty().withMessage('SKU es requerido'),
  body('category').optional().isMongoId().withMessage('Categoría inválida'),
  body('supplier').optional().isMongoId().withMessage('Proveedor inválido'),
  body('pricing.costPrice').optional().isNumeric().withMessage('Precio de costo debe ser numérico'),
  body('pricing.sellingPrice').optional().isNumeric().withMessage('Precio de venta debe ser numérico'),
  body('inventory.currentStock').optional().isNumeric().withMessage('Stock actual debe ser numérico'),
  body('inventory.minStock').optional().isNumeric().withMessage('Stock mínimo debe ser numérico')
];

// Lista blanca (anti mass-assignment)
const pickProductFields = (body) => {
  const allowed = [
    'name', 'sku', 'barcode', 'brand', 'description',
    'category', 'supplier',
    'pricing', 'inventory',
    'isActive', 'images'
  ];
  const data = {};
  for (const k of allowed) if (body[k] !== undefined) data[k] = body[k];

  // Normaliza SKU y defaults
  if (data.sku) data.sku = String(data.sku).trim().toUpperCase();
  if (data.isActive === undefined) data.isActive = true;
  return data;
};

 // Rutas públicas (Catálogo)


// GET /api/products 
router.get('/', async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      category,
      supplier,
      search,
      isActive = 'true',
      lowStock,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    page = parseInt(page, 10);
    limit = Math.min(parseInt(limit, 10) || 20, 100);

    const filters = {};
    if (category) filters.category = category;
    if (supplier) filters.supplier = supplier;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (lowStock === 'true') {
      filters.$expr = { $lte: ['$inventory.currentStock', '$inventory.minStock'] };
    }

    if (search) {
      const rx = { $regex: search, $options: 'i' };
      filters.$or = [{ name: rx }, { sku: rx }, { barcode: rx }, { brand: rx }];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('category', 'name')
        .populate('supplier', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// GET /api/products/reports/low-stock  
router.get('/reports/low-stock', auth, async (_req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$inventory.currentStock', '$inventory.minStock'] }
    })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ 'inventory.currentStock': 1 });

    res.json({ success: true, data: { products } });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/products/:id  → detalle público
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');

    if (!product || product.isActive === false) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Rutas protegidas (Admin)


// POST /api/products  → crear
router.post('/', auth, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

    const data = pickProductFields(req.body);

    // SKU único
    const exists = await Product.findOne({ sku: data.sku });
    if (exists) return res.status(400).json({ success: false, message: 'Ya existe un producto con este SKU' });

    const product = await Product.create(data);
    const saved = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('supplier', 'name');

    res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: { product: saved } });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/products/:id  → actualizar
router.put('/:id', auth, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

    const data = pickProductFields(req.body);

    // SKU único (excluyendo el mismo)
    if (data.sku) {
      const exists = await Product.findOne({ sku: data.sku, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: 'Ya existe otro producto con este SKU' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('category', 'name')
      .populate('supplier', 'name');

    if (!updated) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    res.json({ success: true, message: 'Producto actualizado exitosamente', data: { product: updated } });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/products/:id  → “soft delete”
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    res.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/products/:id/images 
router.post('/:id/images', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se proporcionó imagen' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const imageUrl = `/uploads/products/${req.file.filename}`;
    product.images.push({
      url: imageUrl,
      alt: req.body.alt || product.name,
      isPrimary: product.images.length === 0
    });

    await product.save();
    res.json({ success: true, message: 'Imagen subida exitosamente', data: { imageUrl } });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;

