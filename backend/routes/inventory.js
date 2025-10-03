const express = require('express');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/inventory - Obtener resumen de inventario
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      supplier,
      lowStock,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filters = { isActive: true };
    
    if (category) filters.category = category;
    if (supplier) filters.supplier = supplier;
    if (lowStock === 'true') {
      filters.$expr = { $lte: ['$inventory.currentStock', '$inventory.minStock'] };
    }
    
    // Filtro de búsqueda
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filters)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .select('name sku inventory pricing category supplier isLowStock')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filters);

    // Calcular estadísticas
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { 
            $sum: { 
              $multiply: ['$inventory.currentStock', '$pricing.costPrice'] 
            }
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.currentStock', '$inventory.minStock'] },
                1,
                0
              ]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [
                { $eq: ['$inventory.currentStock', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        stats: stats[0] || {
          totalProducts: 0,
          totalStockValue: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/inventory/movements - Obtener movimientos de inventario
router.get('/movements', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      product,
      type,
      startDate,
      endDate,
      user
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (product) filters.product = product;
    if (type) filters.type = type;
    if (user) filters.user = user;
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const movements = await InventoryMovement.find(filters)
      .populate('product', 'name sku')
      .populate('user', 'firstName lastName username')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InventoryMovement.countDocuments(filters);

    res.json({
      success: true,
      data: {
        movements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/inventory/adjust - Ajustar inventario
router.post('/adjust', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { adjustments, reason } = req.body;

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un ajuste'
      });
    }

    const results = [];

    for (const adjustment of adjustments) {
      const { productId, newStock, reason: itemReason } = adjustment;

      if (!productId || newStock < 0) {
        throw new Error('Datos de ajuste inválidos');
      }

      const product = await Product.findById(productId).session(session);
      
      if (!product) {
        throw new Error(`Producto ${productId} no encontrado`);
      }

      const previousStock = product.inventory.currentStock;
      const difference = newStock - previousStock;

      // Actualizar stock del producto
      product.inventory.currentStock = newStock;
      await product.save({ session });

      // Crear movimiento de inventario
      const movement = new InventoryMovement({
        product: productId,
        type: 'adjustment',
        quantity: difference,
        previousStock,
        newStock,
        user: req.user._id,
        notes: itemReason || reason || 'Ajuste de inventario'
      });

      await movement.save({ session });

      results.push({
        product: product.name,
        previousStock,
        newStock,
        difference
      });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Ajustes de inventario aplicados exitosamente',
      data: { results }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al ajustar inventario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  } finally {
    session.endSession();
  }
});

// POST /api/inventory/transfer - Transferir inventario entre ubicaciones
router.post('/transfer', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, fromLocation, toLocation, notes } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de transferencia inválidos'
      });
    }

    const product = await Product.findById(productId).session(session);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Actualizar ubicación del producto
    if (toLocation) {
      product.inventory.location = toLocation;
      await product.save({ session });
    }

    // Crear movimiento de inventario
    const movement = new InventoryMovement({
      product: productId,
      type: 'transfer',
      quantity: 0, // Las transferencias no cambian el stock total
      previousStock: product.inventory.currentStock,
      newStock: product.inventory.currentStock,
      user: req.user._id,
      location: {
        from: fromLocation,
        to: toLocation
      },
      notes: notes || 'Transferencia de ubicación'
    });

    await movement.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Transferencia completada exitosamente',
      data: { 
        product: product.name,
        fromLocation,
        toLocation,
        quantity
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al transferir inventario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  } finally {
    session.endSession();
  }
});

// GET /api/inventory/low-stock - Productos con stock bajo
router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$inventory.currentStock', '$inventory.minStock'] }
    })
    .populate('category', 'name')
    .populate('supplier', 'name phone email')
    .sort({ 'inventory.currentStock': 1 });

    // Agrupar por proveedor para facilitar órdenes de compra
    const bySupplier = {};
    products.forEach(product => {
      const supplierId = product.supplier._id.toString();
      if (!bySupplier[supplierId]) {
        bySupplier[supplierId] = {
          supplier: product.supplier,
          products: []
        };
      }
      bySupplier[supplierId].products.push(product);
    });

    res.json({
      success: true,
      data: {
        products,
        bySupplier: Object.values(bySupplier),
        totalLowStock: products.length
      }
    });

  } catch (error) {
    console.error('Error al obtener stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/inventory/out-of-stock - Productos agotados
router.get('/out-of-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      'inventory.currentStock': 0
    })
    .populate('category', 'name')
    .populate('supplier', 'name phone email')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        products,
        totalOutOfStock: products.length
      }
    });

  } catch (error) {
    console.error('Error al obtener productos agotados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/inventory/valuation - Valorización del inventario
router.get('/valuation', auth, async (req, res) => {
  try {
    const valuation = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$inventory.currentStock' },
          totalCostValue: {
            $sum: { $multiply: ['$inventory.currentStock', '$pricing.costPrice'] }
          },
          totalSellingValue: {
            $sum: { $multiply: ['$inventory.currentStock', '$pricing.sellingPrice'] }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          categoryName: '$category.name',
          totalProducts: 1,
          totalQuantity: 1,
          totalCostValue: { $round: ['$totalCostValue', 2] },
          totalSellingValue: { $round: ['$totalSellingValue', 2] },
          potentialProfit: { 
            $round: [{ $subtract: ['$totalSellingValue', '$totalCostValue'] }, 2] 
          }
        }
      },
      { $sort: { totalCostValue: -1 } }
    ]);

    // Calcular totales generales
    const totals = valuation.reduce((acc, cat) => ({
      totalProducts: acc.totalProducts + cat.totalProducts,
      totalQuantity: acc.totalQuantity + cat.totalQuantity,
      totalCostValue: acc.totalCostValue + cat.totalCostValue,
      totalSellingValue: acc.totalSellingValue + cat.totalSellingValue,
      potentialProfit: acc.potentialProfit + cat.potentialProfit
    }), {
      totalProducts: 0,
      totalQuantity: 0,
      totalCostValue: 0,
      totalSellingValue: 0,
      potentialProfit: 0
    });

    res.json({
      success: true,
      data: {
        byCategory: valuation,
        totals
      }
    });

  } catch (error) {
    console.error('Error al calcular valorización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/inventory/:productId/history - Historial de movimientos de un producto
router.get('/:productId/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const movements = await InventoryMovement.find({ 
      product: req.params.productId 
    })
    .populate('user', 'firstName lastName username')
    .populate('supplier', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await InventoryMovement.countDocuments({ 
      product: req.params.productId 
    });

    const product = await Product.findById(req.params.productId)
      .select('name sku inventory');

    res.json({
      success: true,
      data: {
        product,
        movements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;