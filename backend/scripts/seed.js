require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpieza
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({})
    ]);
    console.log('Datos anteriores eliminados');

    // Usuarios (con contraseña hasheada manualmente)
    const users = [
      {
        username: 'admin',
        email: 'admin@ferreteria.com',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'admin',
        phone: '+56912345678',
        isActive: true
      },
      {
        username: 'cajero1',
        email: 'cajero1@ferreteria.com',
        password: bcrypt.hashSync('cajero123', 10),
        firstName: 'María',
        lastName: 'González',
        role: 'cashier',
        phone: '+56987654321',
        isActive: true
      },
      {
        username: 'empleado1',
        email: 'empleado1@ferreteria.com',
        password: bcrypt.hashSync('empleado123', 10),
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'employee',
        phone: '+56911223344',
        isActive: true
      }
    ];
    const createdUsers = await User.insertMany(users);
    console.log(`Usuarios creados: ${createdUsers.length}`);

    // Categorías
    const categories = await Category.insertMany([
      { name: 'Herramientas' },
      { name: 'Construcción' },
      { name: 'Electricidad' },
      { name: 'Plomería' },
      { name: 'Pinturas' },
      { name: 'Ferretería General' },
      { name: 'Jardinería' },
      { name: 'Seguridad Industrial' }
    ]);
    console.log(`Categorías creadas: ${categories.length}`);

    // Proveedores
    const suppliers = await Supplier.insertMany([
      { name: 'Acme Tools', email: 'ventas@acmetools.com', phone: '22222222' },
      { name: 'Construmax', email: 'contacto@construmax.cl', phone: '33333333' },
      { name: 'ElectroSur', email: 'ventas@electrosur.cl', phone: '44444444' }
    ]);
    console.log(`Proveedores creados: ${suppliers.length}`);

    // Productos
    const products = await Product.insertMany([
      {
        name: 'Martillo Carpintero',
        description: 'Martillo con mango de madera',
        sku: 'MTL001',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        pricing: { costPrice: 3000, sellingPrice: 5990 },
        inventory: { currentStock: 50, minStock: 5 }
      },
      {
        name: 'Alicate Universal',
        description: 'Alicate 8 pulgadas',
        sku: 'ALC002',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        pricing: { costPrice: 2500, sellingPrice: 4990 },
        inventory: { currentStock: 40, minStock: 5 }
      },
      {
        name: 'Taladro Percutor',
        description: '800W con maletín',
        sku: 'TLR003',
        category: categories[0]._id,
        supplier: suppliers[1]._id,
        pricing: { costPrice: 25000, sellingPrice: 49990 },
        inventory: { currentStock: 10, minStock: 2 }
      }
    ]);
    console.log(`Productos creados: ${products.length}`);

    // Clientes
    const customers = await Customer.insertMany([
      { firstName: 'Pedro', lastName: 'Ramírez', phone: '99999999' },
      { firstName: 'Lucía', lastName: 'Soto', phone: '88888888' },
      { firstName: 'Carlos', lastName: 'Mena', phone: '77777777' }
    ]);
    console.log(`Clientes creados: ${customers.length}`);

    console.log(`
Resumen:
Users: ${createdUsers.length}
Categories: ${categories.length}
Suppliers: ${suppliers.length}
Products: ${products.length}
Customers: ${customers.length}
    `);

    console.log('\n Seed completado exitosamente!');
    await mongoose.disconnect();
  } catch (error) {
    console.error(' Error en seed:', error);
    await mongoose.disconnect();
  }
})();
