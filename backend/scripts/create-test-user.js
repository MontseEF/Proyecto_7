const mongoose = require('mongoose');
const User = require('../models/User');

async function createTestUser() {
  try {
    // Conectar a la base de datos (usar la misma URI que el servidor)
    require('dotenv').config();
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('El usuario admin ya existe');
      process.exit(0);
    }

    // Crear usuario de prueba
    const testUser = new User({
      username: 'admin',
      email: 'admin@ferreteria.com',
      password: '123456',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'admin',
      phone: '123456789'
    });

    await testUser.save();
    console.log('Usuario de prueba creado exitosamente:');
    console.log('Username: admin');
    console.log('Password: 123456');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();