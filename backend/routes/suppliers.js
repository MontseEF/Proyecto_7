const express = require('express');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validaciones
const validateSupplier = [
  body('name').notEmpty().withMessage('Nombre es requerido').trim(),
  body('phone').notEmpty().withMessage('Teléfono es requerido').trim(),
  body('email').optional().isEmail().withMessage('Email inválido')
];

// GET /api/suppliers - Obtener todos los proveedores
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      isPreferred
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isPreferred !== undefined) filters.isPreferred = isPreferred === 'true';
    
    // Filtro de búsqueda
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { rut: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(filters)
      .populate('categories', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Supplier.countDocuments(filters);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/suppliers/:id - Obtener proveedor por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('categories')
      .populate('products');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });

  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/suppliers - Crear nuevo proveedor
router.post('/', auth, authorize(['admin', 'employee']), validateSupplier, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar duplicados
    const duplicateFilters = [];
    if (req.body.email) duplicateFilters.push({ email: req.body.email });
    if (req.body.rut) duplicateFilters.push({ rut: req.body.rut });

    if (duplicateFilters.length > 0) {
      const existingSupplier = await Supplier.findOne({ $or: duplicateFilters });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un proveedor con este email o RUT'
        });
      }
    }

    const supplier = new Supplier(req.body);
    await supplier.save();

    const savedSupplier = await Supplier.findById(supplier._id)
      .populate('categories');

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: { supplier: savedSupplier }
    });

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/suppliers/:id - Actualizar proveedor
router.put('/:id', auth, authorize(['admin', 'employee']), validateSupplier, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar duplicados excluyendo el proveedor actual
    const duplicateFilters = [];
    if (req.body.email) duplicateFilters.push({ email: req.body.email });
    if (req.body.rut) duplicateFilters.push({ rut: req.body.rut });

    if (duplicateFilters.length > 0) {
      const existingSupplier = await Supplier.findOne({ 
        $or: duplicateFilters,
        _id: { $ne: req.params.id }
      });
      
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro proveedor con este email o RUT'
        });
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categories');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: { supplier }
    });

  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/suppliers/:id - Eliminar proveedor (soft delete)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/suppliers/search/quick - Búsqueda rápida de proveedores
router.get('/search/quick', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suppliers: [] }
      });
    }

    const suppliers = await Supplier.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { businessName: { $regex: q, $options: 'i' } },
        { rut: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name businessName phone email rut')
    .limit(10)
    .sort({ name: 1 });

    res.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    console.error('Error en búsqueda rápida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/suppliers/:id/rating - Actualizar calificación del proveedor
router.put('/:id/rating', auth, authorize(['admin', 'employee']), async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Calificación actualizada exitosamente',
      data: { supplier }
    });

  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/suppliers/:id/products - Obtener productos del proveedor
router.get('/:id/products', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const Product = require('../models/Product');
    
    const products = await Product.find({ 
      supplier: req.params.id,
      isActive: true 
    })
    .populate('category', 'name')
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Product.countDocuments({ 
      supplier: req.params.id,
      isActive: true 
    });

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
    console.error('Error al obtener productos del proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;