const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryMovement = require('../models/InventoryMovement');

const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


// Validaciones

const validateSale = [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.product').isMongoId().withMessage('ID de producto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.unitPrice').optional().isNumeric({ min: 0 }).withMessage('Precio unitario inválido'),
  body('paymentMethod').isIn(['cash', 'card', 'transfer', 'credit', 'mixed']).withMessage('Método de pago inválido')
];

// Reporte diario 

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

    sales.forEach(sale => {
      summary.paymentMethods[sale.paymentMethod] =
        (summary.paymentMethods[sale.paymentMethod] || 0) + sale.totals.total;

      const cashierName = sale.cashier?.firstName && sale.cashier?.lastName
        ? `${sale.cashier.firstName} ${sale.cashier.lastName}`
        : 'Sin nombre';
      if (!summary.salesByCashier[cashierName]) {
        summary.salesByCashier[cashierName] = { count: 0, amount: 0 };
      }
      summary.salesByCashier[cashierName].count++;
      summary.salesByCashier[cashierName].amount += sale.totals.total;
    });

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        summary,
        sales
      }
    });
  } catch (error) {
    console.error('Error al generar reporte diario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Listado y detalle

// GET /api/sales
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

    const [sales, total] = await Promise.all([
      Sale.find(filters)
        .populate('customer', 'firstName lastName phone')
        .populate('cashier', 'firstName lastName username')
        .populate('items.product', 'name sku')
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit, 10) || 20, 100))
        .skip((parseInt(page, 10) - 1) * (parseInt(limit, 10) || 20)),
      Sale.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / (parseInt(limit, 10) || 20)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/sales/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('cashier', 'firstName lastName username')
      .populate('items.product')
      .populate('refund.refundedBy', 'firstName lastName username');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    res.json({ success: true, data: { sale } });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Crear venta (transacción)

// POST /api/sales
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

    const { items, customer, paymentMethod, paymentDetails = {}, notes = '' } = req.body;

    // Traer productos en un solo query
    const ids = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: ids }, isActive: true })
      .select('_id name pricing inventory')
      .session(session);

    const map = new Map(products.map(p => [String(p._id), p]));

    // Validar stock y calcular totales sin modificar aún
    let subtotal = 0;
    let discountTotal = 0;
    const processedItems = [];

    for (const it of items) {
      const p = map.get(String(it.product));
      if (!p) throw new Error(`Producto ${it.product} no encontrado o inactivo`);

      const qty = Number(it.quantity);
      if (qty <= 0) throw new Error(`Cantidad inválida en un ítem`);
      if (p.inventory.currentStock < qty) {
        throw new Error(`Stock insuficiente para ${p.name}. Disponible: ${p.inventory.currentStock}, solicitado: ${qty}`);
      }

      const unitPrice = it.unitPrice != null ? Number(it.unitPrice) : Number(p.pricing.sellingPrice || 0);
      const lineDiscount = Number(it.discount || 0);
      const lineSubtotal = unitPrice * qty;

      processedItems.push({
        product: p._id,
        quantity: qty,
        unitPrice,
        subtotal: lineSubtotal - lineDiscount,
        discount: lineDiscount
      });

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
    }

    const tax = Number(req.body.tax || 0);
    const total = subtotal - discountTotal + tax;

    // Crear venta primero (para referenciar en movimientos)
    const saleArr = await Sale.create([{
      customer: customer || null,
      cashier: req.user._id,
      items: processedItems,
      totals: { subtotal, discount: discountTotal, tax, total },
      paymentMethod,
      paymentDetails,
      notes
    }], { session });

    const sale = saleArr[0];

    // Descontar stock + crear movimientos
    for (const it of processedItems) {
      const p = map.get(String(it.product));
      const prev = p.inventory.currentStock;
      const next = prev - it.quantity;

      // actualiza stock
      await Product.updateOne(
        { _id: p._id },
        { $set: { 'inventory.currentStock': next } },
        { session }
      );

      // registra movimiento (cantidad positiva; el tipo indica salida)
      await InventoryMovement.create([{
        product: p._id,
        type: 'sale',
        quantity: it.quantity,
        previousStock: prev,
        newStock: next,
        unitCost: Number(p.pricing.costPrice || 0),
        totalCost: Number(p.pricing.costPrice || 0) * it.quantity,
        reference: { documentType: 'sale', documentId: sale._id, documentNumber: sale.saleNumber },
        user: req.user._id,
        notes: `Venta ${sale.saleNumber} - ${p.name}`
      }], { session });

      // refleja el cambio en el mapa para siguientes ítems del mismo producto
      p.inventory.currentStock = next;
    }

    // Actualiza info del cliente
    if (customer) {
      await Customer.findByIdAndUpdate(
        customer,
        { $inc: { totalPurchases: total } , lastPurchase: new Date() },
        { session }
      );

      if (paymentMethod === 'credit') {
        await Customer.findByIdAndUpdate(
          customer,
          { $inc: { currentCredit: total } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    const completeSale = await Sale.findById(sale._id)
      .populate('customer', 'firstName lastName')
      .populate('cashier', 'firstName lastName username')
      .populate('items.product', 'name sku brand');

    return res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { sale: completeSale }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al crear venta:', error);
    return res.status(400).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
});

// Cancelar venta

// PUT /api/sales/:id/cancel
router.put('/:id/cancel', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    if (sale.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Solo se pueden cancelar ventas completadas' });
    }

    // Revertir stock y registrar movimientos
    for (const item of sale.items) {
      const p = await Product.findById(item.product).session(session);
      if (!p) continue;

      const prev = p.inventory.currentStock;
      const next = prev + item.quantity;

      await Product.updateOne(
        { _id: p._id },
        { $set: { 'inventory.currentStock': next } },
        { session }
      );

      await InventoryMovement.create([{
        product: p._id,
        type: 'return',
        quantity: item.quantity,              
        previousStock: prev,
        newStock: next,
        reference: { documentType: 'sale', documentId: sale._id, documentNumber: sale.saleNumber },
        user: req.user._id,
        notes: `Cancelación de venta ${sale.saleNumber}`
      }], { session });
    }

    sale.status = 'cancelled';
    await sale.save({ session });

    if (sale.customer && sale.paymentMethod === 'credit') {
      await Customer.findByIdAndUpdate(
        sale.customer,
        { $inc: { currentCredit: -sale.totals.total, totalPurchases: -sale.totals.total } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Venta cancelada exitosamente' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Reembolso

   
// POST /api/sales/:id/refund
router.post('/:id/refund', auth, authorize(['admin', 'employee']), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { refundAmount, refundReason, items } = req.body;
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    if (sale.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Solo se pueden reembolsar ventas completadas' });
    }
    if (sale.refund?.isRefunded) {
      return res.status(400).json({ success: false, message: 'Esta venta ya fue reembolsada' });
    }

    // Reembolso parcial por ítems
    if (items && items.length > 0) {
      for (const rItem of items) {
        const saleItem = sale.items.find(i => i.product.toString() === rItem.product);
        if (!saleItem) throw new Error(`Producto ${rItem.product} no encontrado en la venta`);
        if (rItem.quantity > saleItem.quantity) throw new Error('Cantidad a reembolsar excede la cantidad vendida');

        const p = await Product.findById(rItem.product).session(session);
        if (!p) continue;

        const prev = p.inventory.currentStock;
        const next = prev + rItem.quantity;

        await Product.updateOne(
          { _id: p._id },
          { $set: { 'inventory.currentStock': next } },
          { session }
        );

        await InventoryMovement.create([{
          product: p._id,
          type: 'return',
          quantity: rItem.quantity,          // positiva
          previousStock: prev,
          newStock: next,
          reference: { documentType: 'sale', documentId: sale._id, documentNumber: sale.saleNumber },
          user: req.user._id,
          notes: `Reembolso parcial - ${refundReason || ''}`.trim()
        }], { session });
      }
    }

    // Marcar venta como reembolsada
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
    session.endSession();

    res.json({ success: true, message: 'Reembolso procesado exitosamente' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al procesar reembolso:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
});

module.exports = router;
