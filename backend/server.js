// DEPENDENCIAS & ENV

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// AJUSTES DE SERVIDOR

app.set('trust proxy', 1); // Para que Render/Railway vean la IP real

// Seguridad básica
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

// CORS: permite comunicación con el Frontend (Vite usa 5173 por defecto)
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true
}));

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos 
app.use('/uploads', express.static('uploads'));


// CONEXIÓN A MONGODB

mongoose.set('strictQuery', true);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err.message));

mongoose.connection.on('error', (err) => {
  console.error('Mongo error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongo desconectado');
});


// RUTAS

const apiRouter = require('./routes/router');
app.use('/api', apiRouter);

// Healthcheck (muestra estado de API y Mongo)
app.get('/api/health', (_req, res) => {
  const mongoStates = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  const mongoState = mongoStates[mongoose.connection.readyState] || 'desconocido';

  res.json({
    ok: true,
    message: 'API de Ferretería funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors_origin: ALLOWED_ORIGIN,
    mongo: {
      uri: MONGO_URI.includes('localhost') ? 'local' : 'remoto',
      estado: mongoState
    }
  });
});

// 404 general
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el servidor' });
});

// Manejo global de errores
app.use((err, _req, res, _next) => {
  console.error('Error interno:', err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});


// ARRANQUE DEL SERVIDOR

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS permitido: ${ALLOWED_ORIGIN}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
