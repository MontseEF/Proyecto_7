// backend/scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.set('strictQuery', true);

// Modelos
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';

async function seedData() {
  try {
    
    // Conexión
   
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Conectado a MongoDB');

    // Limpieza
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
    ]);
    console.log('🧹 Datos anteriores eliminados');

   
    // 1) Usuarios (con password hasheado)
    
    const usersSeed = [
      { username: 'admin',    email: 'admin@ferreteria.com',    password: 'admin123',    firstName: 'Administrador', lastName: 'Sistema', role: 'admin',   phone: '+56912345678' },
      { username: 'cajero1',  email: 'cajero1@ferreteria.com',  password: 'cajero123',   firstName: 'María',         lastName: 'González', role: 'cashier', phone: '+56987654321' },
      { username: 'empleado1',email: 'empleado1@ferreteria.com',password: 'empleado123', firstName: 'Juan',          lastName: 'Pérez',    role: 'employee',phone: '+56911223344' },
    ];

    const salt = await bcrypt.genSalt(10);
    const usersForInsert = await Promise.all(
      usersSeed.map(async u => ({ ...u, password: await bcrypt.hash(u.password, salt) }))
    );
    const createdUsers = await User.insertMany(usersForInsert);
    console.log(`👥 Usuarios creados: ${createdUsers.length}`);

   
    // 2) Categorías (forzamos nameLower porque insertMany no dispara pre('save'))
    
    const categoriesSeed = [
      { name: 'Herramientas Manuales',    description: 'Martillos, destornilladores, llaves, etc.' },
      { name: 'Herramientas Eléctricas',  description: 'Taladros, sierras, pulidoras, etc.' },
      { name: 'Materiales de Construcción', description: 'Cemento, ladrillos, arena, etc.' },
      { name: 'Tornillería y Fijaciones', description: 'Tornillos, tuercas, pernos, clavos' },
      { name: 'Plomería',                 description: 'Tuberías, llaves, grifos, conexiones' },
      { name: 'Electricidad',             description: 'Cables, enchufes, interruptores, focos' },
      { name: 'Pintura y Acabados',       description: 'Pinturas, brochas, rodillos, barnices' },
      { name: 'Ferretería General',       description: 'Candados, bisagras, manijas, etc.' },
    ].map(c => ({ ...c, nameLower: c.name.toLowerCase() }));

    const createdCategories = await Category.insertMany(categoriesSeed);
    console.log(`📁 Categorías creadas: ${createdCategories.length}`);

   
    // 3) Proveedores
    
    const suppliersSeed = [
      {
        name: 'Herramientas del Sur S.A.',
        businessName: 'Herramientas del Sur S.A.',
        rut: '76.123.456-7',
        email: 'ventas@herramientasdelsur.cl',
        phone: '+56222334455',
        address: { street: 'Av. Industrial', number: '1234', city: 'Santiago', state: 'Región Metropolitana', zipCode: '8320000', country: 'Chile' },
        contact: { name: 'Carlos Mendoza', phone: '+56987123456', email: 'carlos@herramientasdelsur.cl', position: 'Gerente de Ventas' },
        paymentTerms: '30_days',
        categories: [createdCategories[0]._id, createdCategories[1]._id],
        rating: 4,
        isPreferred: true
      },
      {
        name: 'Materiales y Construcción Ltda.',
        businessName: 'Materiales y Construcción Ltda.',
        rut: '77.234.567-8',
        email: 'pedidos@materialesconstruccion.cl',
        phone: '+56223344556',
        address: { street: 'Calle Los Constructores', number: '567', city: 'Santiago', state: 'Región Metropolitana', zipCode: '8340000', country: 'Chile' },
        paymentTerms: '15_days',
        categories: [createdCategories[2]._id, createdCategories[3]._id],
        rating: 5,
        isPreferred: true
      },
      {
        name: 'Distribuidora Eléctrica Norte',
        businessName: 'Distribuidora Eléctrica Norte SpA',
        rut: '78.345.678-9',
        email: 'ventas@electricanorte.cl',
        phone: '+56224455667',
        address: { street: 'Av. Eléctrica', number: '890', city: 'Santiago', state: 'Región Metropolitana', zipCode: '8350000', country: 'Chile' },
        paymentTerms: '30_days',
        categories: [createdCategories[5]._id],
        rating: 4
      }
    ];
    const createdSuppliers = await Supplier.insertMany(suppliersSeed);
    console.log(`🏭 Proveedores creados: ${createdSuppliers.length}`);

    
    // 4) Productos (normalizamos SKU a mayúsculas)
   
    const P = createdCategories;  // alias corto
    const S = createdSuppliers;

    const productsSeed = [
      {
        name: 'Martillo Carpintero 16oz',
        description: 'Martillo de carpintero con mango de madera, cabeza de 16 onzas',
        sku: 'MART-001',
        barcode: '7801234567890',
        category: P[0]._id, supplier: S[0]._id,
        brand: 'Stanley',
        pricing: { costPrice: 8500, sellingPrice: 12990 },
        inventory: { currentStock: 25, minStock: 5 }
      },
      {
        name: 'Destornillador Phillips #2',
        description: 'Destornillador Phillips #2 con mango ergonómico',
        sku: 'DEST-001',
        category: P[0]._id, supplier: S[0]._id,
        brand: 'Klein Tools',
        pricing: { costPrice: 3200, sellingPrice: 4990 },
        inventory: { currentStock: 40, minStock: 10 }
      },
      {
        name: 'Taladro Percutor 13mm',
        description: 'Taladro percutor eléctrico 13mm, 650W con maletín',
        sku: 'TAL-001',
        barcode: '7801234567891',
        category: P[1]._id, supplier: S[0]._id,
        brand: 'Bosch',
        pricing: { costPrice: 45000, sellingPrice: 69990 },
        inventory: { currentStock: 8, minStock: 3 }
      },
      {
        name: 'Cemento Portland 25kg',
        description: 'Cemento Portland tipo I, saco de 25kg',
        sku: 'CEM-001',
        category: P[2]._id, supplier: S[1]._id,
        brand: 'Melón',
        pricing: { costPrice: 4500, sellingPrice: 6990 },
        inventory: { currentStock: 120, minStock: 20 }
      },
      {
        name: 'Tornillos Autoperforantes 1/2"',
        description: 'Tornillos autoperforantes galvanizados 1/2", caja x100 unidades',
        sku: 'TORN-001',
        category: P[3]._id, supplier: S[1]._id,
        pricing: { costPrice: 2800, sellingPrice: 4290 },
        inventory: { currentStock: 50, minStock: 10 }
      },
      {
        name: 'Cable Eléctrico 2.5mm²',
        description: 'Cable eléctrico 2.5mm² THW-LS, metro lineal',
        sku: 'CAB-001',
        category: P[5]._id, supplier: S[2]._id,
        brand: 'Procobre',
        pricing: { costPrice: 890, sellingPrice: 1390 },
        inventory: { currentStock: 500, minStock: 50 }
      },
      {
        name: 'Llave Inglesa 10"',
        description: 'Llave inglesa ajustable 10 pulgadas',
        sku: 'LL-001',
        category: P[0]._id, supplier: S[0]._id,
        brand: 'Bahco',
        pricing: { costPrice: 12000, sellingPrice: 18990 },
        inventory: { currentStock: 2, minStock: 5 } 
      }
    ].map(pr => ({ ...pr, sku: String(pr.sku).trim().toUpperCase() }));

    const createdProducts = await Product.insertMany(productsSeed);
    console.log(`📦 Productos creados: ${createdProducts.length}`);

    
    // 5) Clientes
   
    const customersSeed = [
      {
        firstName: 'Pedro', lastName: 'Rodríguez', email: 'pedro.rodriguez@email.com',
        phone: '+56912345678', dni: '12345678-9', customerType: 'individual',
        address: { street: 'Los Aromos', number: '123', city: 'Santiago', state: 'Región Metropolitana', zipCode: '7500000', country: 'Chile' },
        paymentTerms: 'cash', discountRate: 0
      },
      {
        firstName: 'Ana', lastName: 'Silva', email: 'ana.silva@constructora.cl',
        phone: '+56987654321', rut: '76.555.666-7', customerType: 'business', businessName: 'Constructora Silva Ltda.',
        address: { street: 'Av. Providencia', number: '456', city: 'Santiago', state: 'Región Metropolitana', zipCode: '7500001', country: 'Chile' },
        creditLimit: 500000, paymentTerms: '30_days', discountRate: 5
      },
      {
        firstName: 'Luis', lastName: 'Morales',
        phone: '+56911223344', dni: '11223344-5', customerType: 'individual', paymentTerms: 'cash'
      }
    ];

    const createdCustomers = await Customer.insertMany(customersSeed);
    console.log(`👥 Clientes creados: ${createdCustomers.length}`);

    // Conteo final
    const [cU, cC, cS, cP, cCu] = await Promise.all([
      User.countDocuments(), Category.countDocuments(), Supplier.countDocuments(),
      Product.countDocuments(), Customer.countDocuments()
    ]);
    console.log('\n📊 Resumen:');
    console.log(`   Users:      ${cU}`);
    console.log(`   Categories: ${cC}`);
    console.log(`   Suppliers:  ${cS}`);
    console.log(`   Products:   ${cP}`);
    console.log(`   Customers:  ${cCu}`);

    console.log('\n✅ Seed completado exitosamente!');
  } catch (err) {
    console.error('Error en seed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData();
}

module.exports = seedData;
