const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { auth } = require('../middleware/auth');

// Todas las rutas de pagos requieren autenticación
router.use(auth);

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', paymentsController.createPaymentIntent);

// POST /api/payments/confirm-payment
router.post('/confirm-payment', paymentsController.confirmPayment);

// GET /api/payments/history
router.get('/history', paymentsController.getUserPayments);

module.exports = router;