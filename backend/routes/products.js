const express = require('express');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Validaciones
const validateProduct = [
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('sku').notEmpty().withMessage('SKU es requerido'),
  body('category').isMongoId().withMessage('Categoría inválida'),
  body('supplier').isMongoId().withMessage('Proveedor inválido'),
  body('pricing.costPrice').isNumeric().withMessage('Precio de costo debe ser numérico'),
  body('pricing.sellingPrice').isNumeric().withMessage('Precio de venta debe ser numérico'),
  body('inventory.currentStock').isNumeric().withMessage('Stock actual debe ser numérico'),
  body('inventory.minStock').isNumeric().withMessage('Stock mínimo debe ser numérico')
];

// GET /api/products - Obtener todos los productos con filtros
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      supplier,
      search,
      isActive,
      lowStock,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (category) filters.category = category;
    if (supplier) filters.supplier = supplier;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (lowStock === 'true') {
      filters.$expr = { $lte: ['$inventory.currentStock', '$inventory.minStock'] };
    }
    
    // Filtro de búsqueda por texto
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filters)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filters);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', auth, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar si el SKU ya existe
    const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con este SKU'
      });
    }

    const product = new Product(req.body);
    await product.save();

    const savedProduct = await Product.findById(product._id)
      .populate('category')
      .populate('supplier');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: savedProduct }
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', auth, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar si el SKU ya existe en otro producto
    const existingProduct = await Product.findOne({ 
      sku: req.body.sku.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro producto con este SKU'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category').populate('supplier');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product }
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/products/low-stock - Productos con stock bajo
router.get('/reports/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$inventory.currentStock', '$inventory.minStock'] }
    })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ 'inventory.currentStock': 1 });

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/products/:id/images - Subir imagen del producto
router.post('/:id/images', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó imagen'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    product.images.push({
      url: imageUrl,
      alt: req.body.alt || product.name,
      isPrimary: product.images.length === 0 // Primera imagen es primaria
    });

    await product.save();

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: { imageUrl }
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;