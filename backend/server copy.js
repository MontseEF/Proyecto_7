// DEPENDENCIAS & ENV
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Seguridad / CORS / body
app.set('trust proxy', 1);
app.use(helmet());
// Rate limiting más permisivo durante desarrollo
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por ventana (más permisivo)
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
}));

// Configuración de CORS más permisiva para desarrollo
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);
    
    // En desarrollo, ser más permisivo
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Origen no permitido:', origin);
      callback(new Error('No permitido por la política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Mongo
mongoose.set('strictQuery', true);
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Conectado a MongoDB'))
  .catch(err=>console.error('Mongo error:', err.message));

// Cargar todos los modelos para que estén disponibles para populate
require('./models/User');
require('./models/Category');
require('./models/Supplier');
require('./models/Product');
require('./models/Customer');
require('./models/Sale');
require('./models/InventoryMovement');

// Rutas API
const apiRouter = require('./routes/router');
app.use('/api', apiRouter);

// 404 global
app.use('*', (_req, res) => res.status(404).json({ message: 'Ruta no encontrada en el servidor' }));

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Health:  http://localhost:${PORT}/api/health`);
});
