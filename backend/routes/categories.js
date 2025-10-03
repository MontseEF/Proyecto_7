const express = require('express');
const Category = require('../models/Category');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validaciones
const validateCategory = [
  body('name').notEmpty().withMessage('Nombre es requerido').trim()
];

// GET /api/categories - Obtener todas las categorías
router.get('/', auth, async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const filters = {};
    if (!includeInactive) {
      filters.isActive = true;
    }

    const categories = await Category.find(filters)
      .populate('parentCategory', 'name')
      .populate('subcategories')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
    });

  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/categories - Crear nueva categoría
router.post('/', auth, authorize(['admin', 'employee']), validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con este nombre'
      });
    }

    const category = new Category(req.body);
    await category.save();

    const savedCategory = await Category.findById(category._id)
      .populate('parentCategory');

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category: savedCategory }
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', auth, authorize(['admin', 'employee']), validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar si otro registro tiene el mismo nombre
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      _id: { $ne: req.params.id }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otra categoría con este nombre'
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category }
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/categories/:id - Eliminar categoría (soft delete)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/categories/tree - Obtener categorías en estructura de árbol
router.get('/structure/tree', auth, async (req, res) => {
  try {
    // Obtener categorías principales (sin padre)
    const mainCategories = await Category.find({ 
      parentCategory: null,
      isActive: true 
    }).populate({
      path: 'subcategories',
      match: { isActive: true },
      populate: {
        path: 'subcategories',
        match: { isActive: true }
      }
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: { categories: mainCategories }
    });

  } catch (error) {
    console.error('Error al obtener árbol de categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;