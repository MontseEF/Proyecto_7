const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();

// Healthcheck
router.get('/health', (_req, res) => {
  const states = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoState: states[mongoose.connection.readyState] || 'desconocido',
    time: new Date().toISOString()
  });
});

// Importar subrutas
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const customerRoutes = require('./customers');
const supplierRoutes = require('./suppliers');
const saleRoutes = require('./sales');
const inventoryRoutes = require('./inventory');
const reportRoutes = require('./reports');

// Ping básico del router
router.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Router Ferretería operativo'
  });
});

// Rutas principales
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/products', productRoutes);
router.use('/reports', reportRoutes);
router.use('/sales', saleRoutes);
router.use('/suppliers', supplierRoutes);

// 404 del router 
router.use('*', (_req, res) => {
  res.status(404).json({ message: 'Ruta de API no encontrada' });
});

module.exports = router;
