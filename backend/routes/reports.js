const express = require('express');
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryMovement = require('../models/InventoryMovement');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/reports/dashboard - Dashboard principal con métricas
router.get('/dashboard', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Ventas de hoy
    const todaySales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totals.total, 0);

    // Ventas del mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySales = await Sale.find({
      createdAt: { $gte: startOfMonth },
      status: 'completed'
    });

    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.totals.total, 0);

    // Productos con stock bajo
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$inventory.currentStock', '$inventory.minStock'] }
    });

    // Productos más vendidos del mes
    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    // Clientes más frecuentes
    const topCustomers = await Sale.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfMonth }, 
          status: 'completed',
          customer: { $ne: null }
        } 
      },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
          phone: '$customer.phone',
          totalPurchases: 1,
          totalSpent: { $round: ['$totalSpent', 2] }
        }
      }
    ]);

    // Ventas por método de pago (últimos 7 días)
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const paymentMethodStats = await Sale.aggregate([
      { $match: { createdAt: { $gte: last7Days }, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$totals.total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        todayStats: {
          sales: todaySales.length,
          revenue: Math.round(todayRevenue * 100) / 100
        },
        monthlyStats: {
          sales: monthlySales.length,
          revenue: Math.round(monthlyRevenue * 100) / 100
        },
        inventory: {
          lowStockProducts
        },
        topProducts,
        topCustomers,
        paymentMethodStats
      }
    });

  } catch (error) {
    console.error('Error al generar dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reports/sales - Reporte de ventas con filtros
router.get('/sales', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day', // day, week, month
      cashier,
      paymentMethod
    } = req.query;

    // Configurar fechas
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Construir filtros
    const matchFilters = {
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    };

    if (cashier) matchFilters.cashier = mongoose.Types.ObjectId(cashier);
    if (paymentMethod) matchFilters.paymentMethod = paymentMethod;

    // Configurar agrupación por período
    let dateGrouping;
    switch (groupBy) {
      case 'week':
        dateGrouping = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: 
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesReport = await Sale.aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: dateGrouping,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totals.total' },
          averageTicket: { $avg: '$totals.total' },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Resumen general
    const summary = await Sale.aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totals.total' },
          averageTicket: { $avg: '$totals.total' },
          minSale: { $min: '$totals.total' },
          maxSale: { $max: '$totals.total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        groupBy,
        summary: summary[0] || {},
        salesData: salesReport
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reports/products - Reporte de productos
router.get('/products', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      sortBy = 'quantity', // quantity, revenue, profit
      limit = 20
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchFilters = {
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    };

    let sortField;
    switch (sortBy) {
      case 'revenue':
        sortField = { totalRevenue: -1 };
        break;
      case 'profit':
        sortField = { totalProfit: -1 };
        break;
      default:
        sortField = { totalQuantity: -1 };
    }

    const productReport = await Sale.aggregate([
      { $match: matchFilters },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      ...(category ? [{ $match: { 'product.category': mongoose.Types.ObjectId(category) } }] : []),
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$product.name' },
          sku: { $first: '$product.sku' },
          category: { $first: '$product.category' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalCost: { 
            $sum: { 
              $multiply: ['$items.quantity', '$product.pricing.costPrice'] 
            }
          },
          averagePrice: { $avg: '$items.unitPrice' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          profitMargin: {
            $cond: [
              { $eq: ['$totalCost', 0] },
              0,
              { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalCost'] }, 100] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] }
        }
      },
      { $sort: sortField },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          sku: 1,
          categoryName: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalCost: { $round: ['$totalCost', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          profitMargin: { $round: ['$profitMargin', 2] },
          averagePrice: { $round: ['$averagePrice', 2] },
          salesCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        sortBy,
        products: productReport
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reports/customers - Reporte de clientes
router.get('/customers', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      sortBy = 'totalSpent', // totalSpent, totalPurchases, lastPurchase
      limit = 20
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let sortField;
    switch (sortBy) {
      case 'totalPurchases':
        sortField = { totalPurchases: -1 };
        break;
      case 'lastPurchase':
        sortField = { lastPurchase: -1 };
        break;
      default:
        sortField = { totalSpent: -1 };
    }

    const customerReport = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed',
          customer: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          averageTicket: { $avg: '$totals.total' },
          lastPurchase: { $max: '$createdAt' },
          firstPurchase: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      { $sort: sortField },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
          email: '$customer.email',
          phone: '$customer.phone',
          totalPurchases: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          averageTicket: { $round: ['$averageTicket', 2] },
          lastPurchase: 1,
          firstPurchase: 1,
          daysSinceLastPurchase: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$lastPurchase'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        sortBy,
        customers: customerReport
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reports/inventory/movements - Reporte de movimientos de inventario
router.get('/inventory/movements', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      product,
      user
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchFilters = {
      createdAt: { $gte: start, $lte: end }
    };

    if (type) matchFilters.type = type;
    if (product) matchFilters.product = mongoose.Types.ObjectId(product);
    if (user) matchFilters.user = mongoose.Types.ObjectId(user);

    const movements = await InventoryMovement.find(matchFilters)
      .populate('product', 'name sku')
      .populate('user', 'firstName lastName')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    // Resumen por tipo de movimiento
    const summary = await InventoryMovement.aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: { $abs: '$quantity' } },
          totalValue: { $sum: '$totalCost' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        movements,
        summary
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/reports/financial - Reporte financiero
router.get('/financial', auth, authorize(['admin']), async (req, res) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Ingresos por ventas
    const salesData = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          grossRevenue: { $sum: '$totals.total' },
          totalDiscounts: { $sum: '$totals.discount' },
          netRevenue: { $sum: { $subtract: ['$totals.total', '$totals.discount'] } }
        }
      }
    ]);

    // Costo de mercancías vendidas
    const cogs = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalCOGS: {
            $sum: {
              $multiply: ['$items.quantity', '$product.pricing.costPrice']
            }
          }
        }
      }
    ]);

    const financial = salesData[0] || {};
    const totalCOGS = cogs[0]?.totalCOGS || 0;
    const grossProfit = (financial.netRevenue || 0) - totalCOGS;
    const grossMargin = financial.netRevenue ? (grossProfit / financial.netRevenue * 100) : 0;

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        revenue: {
          gross: Math.round((financial.grossRevenue || 0) * 100) / 100,
          discounts: Math.round((financial.totalDiscounts || 0) * 100) / 100,
          net: Math.round((financial.netRevenue || 0) * 100) / 100
        },
        costs: {
          cogs: Math.round(totalCOGS * 100) / 100
        },
        profit: {
          gross: Math.round(grossProfit * 100) / 100,
          margin: Math.round(grossMargin * 100) / 100
        },
        totalSales: financial.totalSales || 0
      }
    });

  } catch (error) {
    console.error('Error al generar reporte financiero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;