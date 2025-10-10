const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Logger para ver exactamente qué llega
router.use((req, _res, next) => {
  console.log('→ API:', req.method, req.originalUrl);
  next();
});

// Subrutas
const authRoutes = require('./auth');
const productRoutes = require('./products');
const reportsRoutes = require('./reports');
const paymentsRoutes = require('./payments');
// Luego activar las demás:
// const categoryRoutes = require('./categories');
// const customerRoutes = require('./customers');
// const supplierRoutes = require('./suppliers');
// const salesRoutes = require('./sales');

// Health
router.get('/health', (_req, res) => {
  const states = ['desconectado','conectado','conectando','desconectando'];
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoState: states[mongoose.connection.readyState] || 'desconocido',
    time: new Date().toISOString()
  });
});

// Ping del router
router.get('/', (_req, res) => res.json({ ok: true, message: 'Router Ferretería operativo' }));

// Montaje de rutas (ORDEN IMPORTA)
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/reports', reportsRoutes);
router.use('/payments', paymentsRoutes);

// 404 del router (siempre al final)
router.use('*', (_req, res) => res.status(404).json({ message: 'Ruta de API no encontrada' }));

module.exports = router;