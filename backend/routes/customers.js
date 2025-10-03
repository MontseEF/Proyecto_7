const express = require('express');
const Customer = require('../models/Customer');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validaciones
const validateCustomer = [
  body('firstName').notEmpty().withMessage('Nombre es requerido').trim(),
  body('lastName').notEmpty().withMessage('Apellido es requerido').trim(),
  body('phone').notEmpty().withMessage('Teléfono es requerido').trim(),
  body('email').optional().isEmail().withMessage('Email inválido')
];

// GET /api/customers - Obtener todos los clientes
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      customerType,
      isActive
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (customerType) filters.customerType = customerType;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    // Filtro de búsqueda
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { dni: { $regex: search, $options: 'i' } },
        { rut: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filters)
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(filters);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/customers/:id - Obtener cliente por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/customers - Crear nuevo cliente
router.post('/', auth, validateCustomer, async (req, res) => {
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
    if (req.body.dni) duplicateFilters.push({ dni: req.body.dni });
    if (req.body.rut) duplicateFilters.push({ rut: req.body.rut });

    if (duplicateFilters.length > 0) {
      const existingCustomer = await Customer.findOne({ $or: duplicateFilters });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este email, DNI o RUT'
        });
      }
    }

    const customer = new Customer(req.body);
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { customer }
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', auth, validateCustomer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar duplicados excluyendo el cliente actual
    const duplicateFilters = [];
    if (req.body.email) duplicateFilters.push({ email: req.body.email });
    if (req.body.dni) duplicateFilters.push({ dni: req.body.dni });
    if (req.body.rut) duplicateFilters.push({ rut: req.body.rut });

    if (duplicateFilters.length > 0) {
      const existingCustomer = await Customer.findOne({ 
        $or: duplicateFilters,
        _id: { $ne: req.params.id }
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro cliente con este email, DNI o RUT'
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: { customer }
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE /api/customers/:id - Eliminar cliente (soft delete)
router.delete('/:id', auth, authorize(['admin', 'employee']), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/customers/search/quick - Búsqueda rápida de clientes
router.get('/search/quick', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { customers: [] }
      });
    }

    const customers = await Customer.find({
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { dni: { $regex: q, $options: 'i' } },
        { rut: { $regex: q, $options: 'i' } }
      ]
    })
    .select('firstName lastName phone email dni rut')
    .limit(10)
    .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      data: { customers }
    });

  } catch (error) {
    console.error('Error en búsqueda rápida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/customers/:id/credit - Actualizar crédito del cliente
router.put('/:id/credit', auth, authorize(['admin', 'employee']), async (req, res) => {
  try {
    const { creditLimit, currentCredit } = req.body;

    if (creditLimit < 0 || currentCredit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los valores de crédito no pueden ser negativos'
      });
    }

    if (currentCredit > creditLimit) {
      return res.status(400).json({
        success: false,
        message: 'El crédito actual no puede ser mayor al límite'
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { creditLimit, currentCredit },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Crédito actualizado exitosamente',
      data: { customer }
    });

  } catch (error) {
    console.error('Error al actualizar crédito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;