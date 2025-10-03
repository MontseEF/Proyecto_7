const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryMovement = require('../models/InventoryMovement');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const router = express.Router();

// Validaciones
const validateSale = [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.product').isMongoId().withMessage('ID de producto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.unitPrice').isNumeric({ min: 0 }).withMessage('Precio unitario inválido'),
  body('paymentMethod').isIn(['cash', 'card', 'transfer', 'credit', 'mixed']).withMessage('Método de pago inválido')
];

// GET /api/sales - Obtener todas las ventas
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      customer,
      cashier,
      status,
      paymentMethod
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    if (customer) filters.customer = customer;
    if (cashier) filters.cashier = cashier;
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;

    const sales = await Sale.find(filters)
      .populate('customer', 'firstName lastName phone')
      .populate('cashier', 'firstName lastName username')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(filters);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/sales/:id - Obtener venta por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('cashier', 'firstName lastName username')
      .populate('items.product')
      .populate('refund.refundedBy', 'firstName lastName username');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: { sale }
    });

  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/sales - Crear nueva venta
router.post('/', auth, validateSale, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { items, customer, paymentMethod, paymentDetails, notes } = req.body;

    // Verificar stock y calcular totales
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        throw new Error(`Producto ${item.product} no encontrado`);
      }

      if (!product.isActive) {
        throw new Error(`El producto ${product.name} no está activo`);
      }

      if (product.inventory.currentStock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Stock actual: ${product.inventory.currentStock}`);
      }

      // Actualizar stock
      product.inventory.currentStock -= item.quantity;
      await product.save({ session });

      // Crear movimiento de inventario
      const inventoryMovement = new InventoryMovement({
        product: product._id,
        type: 'sale',
        quantity: -item.quantity,
        previousStock: product.inventory.currentStock + item.quantity,
        newStock: product.inventory.currentStock,
        unitCost: item.unitPrice,
        totalCost: item.unitPrice * item.quantity,
        user: req.user._id,
        notes: `Venta - ${notes || ''}`
      });
      await inventoryMovement.save({ session });

      const itemSubtotal = item.unitPrice * item.quantity - (item.discount || 0);
      subtotal += itemSubtotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal,
        discount: item.discount || 0
      });
    }

    // Calcular totales
    const discount = req.body.discount || 0;
    const tax = req.body.tax || 0;
    const total = subtotal - discount + tax;

    // Crear la venta
    const sale = new Sale({
      customer: customer || null,
      cashier: req.user._id,
      items: processedItems,
      totals: {
        subtotal,
        discount,
        tax,
        total
      },
      paymentMethod,
      paymentDetails,
      notes
    });

    await sale.save({ session });

    // Actualizar información del cliente si existe
    if (customer) {
      await Customer.findByIdAndUpdate(
        customer,
        {
          $inc: { totalPurchases: total },
          lastPurchase: new Date()
        },
        { session }
      );

      // Si es venta a crédito, actualizar crédito del cliente
      if (paymentMethod === 'credit') {
        await Customer.findByIdAndUpdate(
          customer,
          { $inc: { currentCredit: total } },
          { session }
        );
      }
    }

    await session.commitTransaction();

    // Obtener la venta completa para respuesta
    const completeSale = await Sale.findById(sale._id)
      .populate('customer', 'firstName lastName')
      .populate('cashier', 'firstName lastName')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { sale: completeSale }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  } finally {
    session.endSession();
  }
});

// PUT /api/sales/:id/cancel - Cancelar venta
router.put('/:id/cancel', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    if (sale.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cancelar ventas completadas'
      });
    }

    // Revertir stock de todos los productos
    for (const item of sale.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.inventory.currentStock += item.quantity;
        await product.save({ session });

        // Crear movimiento de inventario
        const inventoryMovement = new InventoryMovement({
          product: product._id,
          type: 'return',
          quantity: item.quantity,
          previousStock: product.inventory.currentStock - item.quantity,
          newStock: product.inventory.currentStock,
          reference: {
            documentType: 'sale',
            documentId: sale._id,
            documentNumber: sale.saleNumber
          },
          user: req.user._id,
          notes: `Cancelación de venta ${sale.saleNumber}`
        });
        await inventoryMovement.save({ session });
      }
    }

    // Actualizar estado de la venta
    sale.status = 'cancelled';
    await sale.save({ session });

    // Si era venta a crédito, revertir crédito del cliente
    if (sale.customer && sale.paymentMethod === 'credit') {
      await Customer.findByIdAndUpdate(
        sale.customer,
        { 
          $inc: { 
            currentCredit: -sale.totals.total,
            totalPurchases: -sale.totals.total
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Venta cancelada exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al cancelar venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    session.endSession();
  }
});

// POST /api/sales/:id/refund - Procesar reembolso
router.post('/:id/refund', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { refundAmount, refundReason, items } = req.body;

    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    if (sale.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reembolsar ventas completadas'
      });
    }

    if (sale.refund.isRefunded) {
      return res.status(400).json({
        success: false,
        message: 'Esta venta ya fue reembolsada'
      });
    }

    // Si se especifican items para reembolso parcial
    if (items && items.length > 0) {
      for (const refundItem of items) {
        const saleItem = sale.items.find(item => 
          item.product.toString() === refundItem.product
        );

        if (!saleItem) {
          throw new Error(`Producto ${refundItem.product} no encontrado en la venta`);
        }

        if (refundItem.quantity > saleItem.quantity) {
          throw new Error(`Cantidad a reembolsar excede la cantidad vendida`);
        }

        // Revertir stock
        const product = await Product.findById(refundItem.product).session(session);
        if (product) {
          product.inventory.currentStock += refundItem.quantity;
          await product.save({ session });

          // Crear movimiento de inventario
          const inventoryMovement = new InventoryMovement({
            product: product._id,
            type: 'return',
            quantity: refundItem.quantity,
            previousStock: product.inventory.currentStock - refundItem.quantity,
            newStock: product.inventory.currentStock,
            reference: {
              documentType: 'sale',
              documentId: sale._id,
              documentNumber: sale.saleNumber
            },
            user: req.user._id,
            notes: `Reembolso parcial - ${refundReason}`
          });
          await inventoryMovement.save({ session });
        }
      }
    }

    // Actualizar información del reembolso
    sale.refund = {
      isRefunded: true,
      refundDate: new Date(),
      refundAmount: refundAmount || sale.totals.total,
      refundReason,
      refundedBy: req.user._id
    };

    sale.status = 'refunded';
    await sale.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error al procesar reembolso:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  } finally {
    session.endSession();
  }
});

// GET /api/sales/reports/daily - Reporte de ventas diarias
router.get('/reports/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    }).populate('cashier', 'firstName lastName');

    const summary = {
      totalSales: sales.length,
      totalAmount: sales.reduce((sum, sale) => sum + sale.totals.total, 0),
      paymentMethods: {},
      salesByCashier: {}
    };

    // Agrupar por método de pago
    sales.forEach(sale => {
      summary.paymentMethods[sale.paymentMethod] = 
        (summary.paymentMethods[sale.paymentMethod] || 0) + sale.totals.total;
      
      const cashierName = sale.cashier.fullName;
      if (!summary.salesByCashier[cashierName]) {
        summary.salesByCashier[cashierName] = { count: 0, amount: 0 };
      }
      summary.salesByCashier[cashierName].count++;
      summary.salesByCashier[cashierName].amount += sale.totals.total;
    });

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary,
        sales
      }
    });

  } catch (error) {
    console.error('Error al generar reporte diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;