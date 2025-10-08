const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer = null, cashier, items, paymentMethod, paymentDetails = {}, notes = '' } = req.body;

    // Validaciones mínimas
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('La venta debe incluir al menos 1 ítem');
    }
    if (!cashier) throw new Error('Cashier (usuario) es requerido');
    if (!paymentMethod) throw new Error('paymentMethod es requerido');

    // 1) Traer productos involucrados y validar stock
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .select('_id name pricing inventory')
      .session(session);

    const productMap = new Map(products.map(p => [String(p._id), p]));

    for (const it of items) {
      const p = productMap.get(String(it.product));
      if (!p) throw new Error(`Producto no encontrado o inactivo: ${it.product}`);
      if (it.quantity <= 0) throw new Error(`Cantidad inválida para ${p.name}`);
      if (p.inventory.currentStock < it.quantity) {
        throw new Error(`Stock insuficiente para ${p.name} (disponible: ${p.inventory.currentStock}, solicitado: ${it.quantity})`);
      }
    }

    // 2) Calcular totales (seguridad del lado del servidor)
    let subtotal = 0;
    let discountTotal = 0;
    for (const it of items) {
      const p = productMap.get(String(it.product));
      const unitPrice = Number(it.unitPrice ?? p.pricing.sellingPrice ?? 0);
      const lineDiscount = Number(it.discount ?? 0);
      const lineSubtotal = unitPrice * it.quantity;

      it.unitPrice = unitPrice;
      it.subtotal = lineSubtotal - lineDiscount;

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
    }
    const tax = 0; // si aplicas IVA más adelante, calcula aquí
    const total = subtotal - discountTotal + tax;

    // 3) Crear documento de venta (aún no commit)
    const sale = await Sale.create([{
      customer,
      cashier,
      items,
      totals: { subtotal, discount: discountTotal, tax, total },
      paymentMethod,
      paymentDetails,
      notes
    }], { session });

    const saleDoc = sale[0];

    // 4) Actualizar stock y crear movimientos por cada ítem
    for (const it of items) {
      const p = productMap.get(String(it.product));

      const previousStock = p.inventory.currentStock;
      const newStock = previousStock - it.quantity;

      // Descuenta stock del producto
      await Product.updateOne(
        { _id: p._id },
        { $set: { 'inventory.currentStock': newStock } },
        { session }
      );

      // Registra movimiento de inventario (tipo "sale")
      await InventoryMovement.create([{
        product: p._id,
        type: 'sale',
        quantity: it.quantity,
        previousStock,
        newStock,
        unitCost: p.pricing.costPrice ?? 0,
        totalCost: (p.pricing.costPrice ?? 0) * it.quantity,
        reference: {
          documentType: 'sale',
          documentId: saleDoc._id,
          documentNumber: saleDoc.saleNumber
        },
        user: cashier,
        notes: `Venta ${saleDoc.saleNumber} - ${p.name}`
      }], { session });
    }

    // 5) Commit de la transacción
    await session.commitTransaction();
    session.endSession();

    // Traer venta con populate para responder bonito
    const populated = await Sale.findById(saleDoc._id)
      .populate('customer', 'firstName lastName email')
      .populate('cashier', 'username firstName lastName')
      .populate('items.product', 'name sku brand')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: { sale: populated }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creando venta:', err);
    return res.status(400).json({ success: false, message: err.message || 'No se pudo crear la venta' });
  }
};
