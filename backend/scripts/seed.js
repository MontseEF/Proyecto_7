const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const seedData = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db');
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    console.log('🧹 Datos anteriores eliminados');

    // 1. Crear usuarios
    const users = [
      {
        username: 'admin',
        email: 'admin@ferreteria.com',
        password: 'admin123',
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'admin',
        phone: '+56912345678'
      },
      {
        username: 'cajero1',
        email: 'cajero1@ferreteria.com',
        password: 'cajero123',
        firstName: 'María',
        lastName: 'González',
        role: 'cashier',
        phone: '+56987654321'
      },
      {
        username: 'empleado1',
        email: 'empleado1@ferreteria.com',
        password: 'empleado123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'employee',
        phone: '+56911223344'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Usuarios creados:', createdUsers.length);

    // 2. Crear categorías
    const categories = [
      {
        name: 'Herramientas Manuales',
        description: 'Martillos, destornilladores, llaves, etc.'
      },
      {
        name: 'Herramientas Eléctricas',
        description: 'Taladros, sierras, pulidoras, etc.'
      },
      {
        name: 'Materiales de Construcción',
        description: 'Cemento, ladrillos, arena, etc.'
      },
      {
        name: 'Tornillería y Fijaciones',
        description: 'Tornillos, tuercas, pernos, clavos'
      },
      {
        name: 'Plomería',
        description: 'Tuberías, llaves, grifos, conexiones'
      },
      {
        name: 'Electricidad',
        description: 'Cables, enchufes, interruptores, focos'
      },
      {
        name: 'Pintura y Acabados',
        description: 'Pinturas, brochas, rodillos, barnices'
      },
      {
        name: 'Ferretería General',
        description: 'Candados, bisagras, manijas, etc.'
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('📁 Categorías creadas:', createdCategories.length);

    // 3. Crear proveedores
    const suppliers = [
      {
        name: 'Herramientas del Sur S.A.',
        businessName: 'Herramientas del Sur S.A.',
        rut: '76.123.456-7',
        email: 'ventas@herramientasdelsur.cl',
        phone: '+56222334455',
        address: {
          street: 'Av. Industrial',
          number: '1234',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '8320000',
          country: 'Chile'
        },
        contact: {
          name: 'Carlos Mendoza',
          phone: '+56987123456',
          email: 'carlos@herramientasdelsur.cl',
          position: 'Gerente de Ventas'
        },
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
        address: {
          street: 'Calle Los Constructores',
          number: '567',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '8340000',
          country: 'Chile'
        },
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
        address: {
          street: 'Av. Eléctrica',
          number: '890',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '8350000',
          country: 'Chile'
        },
        paymentTerms: '30_days',
        categories: [createdCategories[5]._id],
        rating: 4
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log('🏭 Proveedores creados:', createdSuppliers.length);

    // 4. Crear productos
    const products = [
      // Herramientas Manuales
      {
        name: 'Martillo Carpintero 16oz',
        description: 'Martillo de carpintero con mango de madera, cabeza de 16 onzas',
        sku: 'MART-001',
        barcode: '7801234567890',
        category: createdCategories[0]._id,
        supplier: createdSuppliers[0]._id,
        brand: 'Stanley',
        model: 'STHT51512',
        specifications: {
          weight: '450g',
          material: 'Acero forjado',
          color: 'Negro/Amarillo'
        },
        pricing: {
          costPrice: 8500,
          sellingPrice: 12990,
          wholesalePrice: 11500
        },
        inventory: {
          currentStock: 25,
          minStock: 5,
          maxStock: 50,
          location: {
            aisle: 'A',
            shelf: '1',
            bin: '01'
          }
        },
        unit: 'piece',
        warranty: {
          duration: 12,
          terms: 'Garantía contra defectos de fabricación'
        },
        tags: ['martillo', 'carpintero', 'herramienta', 'stanley']
      },
      {
        name: 'Destornillador Phillips #2',
        description: 'Destornillador Phillips #2 con mango ergonómico',
        sku: 'DEST-001',
        category: createdCategories[0]._id,
        supplier: createdSuppliers[0]._id,
        brand: 'Klein Tools',
        pricing: {
          costPrice: 3200,
          sellingPrice: 4990
        },
        inventory: {
          currentStock: 40,
          minStock: 10,
          maxStock: 80,
          location: {
            aisle: 'A',
            shelf: '2',
            bin: '03'
          }
        },
        unit: 'piece'
      },
      // Herramientas Eléctricas
      {
        name: 'Taladro Percutor 13mm',
        description: 'Taladro percutor eléctrico 13mm, 650W con maletín',
        sku: 'TAL-001',
        barcode: '7801234567891',
        category: createdCategories[1]._id,
        supplier: createdSuppliers[0]._id,
        brand: 'Bosch',
        model: 'GSB 13 RE',
        specifications: {
          power: '650W',
          chuckSize: '13mm',
          color: 'Azul'
        },
        pricing: {
          costPrice: 45000,
          sellingPrice: 69990,
          wholesalePrice: 62000
        },
        inventory: {
          currentStock: 8,
          minStock: 3,
          maxStock: 15,
          location: {
            aisle: 'B',
            shelf: '1',
            bin: '01'
          }
        },
        unit: 'piece',
        warranty: {
          duration: 24,
          terms: 'Garantía oficial Bosch'
        },
        tags: ['taladro', 'percutor', 'bosch', 'electrico']
      },
      // Materiales de Construcción
      {
        name: 'Cemento Portland 25kg',
        description: 'Cemento Portland tipo I, saco de 25kg',
        sku: 'CEM-001',
        category: createdCategories[2]._id,
        supplier: createdSuppliers[1]._id,
        brand: 'Melón',
        specifications: {
          weight: '25kg',
          type: 'Portland Tipo I'
        },
        pricing: {
          costPrice: 4500,
          sellingPrice: 6990,
          wholesalePrice: 6200
        },
        inventory: {
          currentStock: 120,
          minStock: 20,
          maxStock: 200,
          location: {
            aisle: 'C',
            shelf: '1',
            bin: '01'
          }
        },
        unit: 'kg',
        tags: ['cemento', 'construccion', 'melon']
      },
      // Tornillería
      {
        name: 'Tornillos Autoperforantes 1/2"',
        description: 'Tornillos autoperforantes galvanizados 1/2", caja x100 unidades',
        sku: 'TORN-001',
        category: createdCategories[3]._id,
        supplier: createdSuppliers[1]._id,
        specifications: {
          size: '1/2 pulgada',
          material: 'Acero galvanizado',
          quantity: '100 unidades'
        },
        pricing: {
          costPrice: 2800,
          sellingPrice: 4290
        },
        inventory: {
          currentStock: 50,
          minStock: 10,
          maxStock: 100,
          location: {
            aisle: 'D',
            shelf: '3',
            bin: '05'
          }
        },
        unit: 'box',
        tags: ['tornillos', 'autoperforantes', 'galvanizado']
      },
      // Electricidad
      {
        name: 'Cable Eléctrico 2.5mm²',
        description: 'Cable eléctrico 2.5mm² THW-LS, metro lineal',
        sku: 'CAB-001',
        category: createdCategories[5]._id,
        supplier: createdSuppliers[2]._id,
        brand: 'Procobre',
        specifications: {
          section: '2.5mm²',
          type: 'THW-LS',
          color: 'Varios'
        },
        pricing: {
          costPrice: 890,
          sellingPrice: 1390
        },
        inventory: {
          currentStock: 500,
          minStock: 50,
          maxStock: 1000,
          location: {
            aisle: 'E',
            shelf: '1',
            bin: '01'
          }
        },
        unit: 'm',
        tags: ['cable', 'electrico', 'procobre', 'thw']
      },
      // Producto con stock bajo para pruebas
      {
        name: 'Llave Inglesa 10"',
        description: 'Llave inglesa ajustable 10 pulgadas',
        sku: 'LL-001',
        category: createdCategories[0]._id,
        supplier: createdSuppliers[0]._id,
        brand: 'Bahco',
        pricing: {
          costPrice: 12000,
          sellingPrice: 18990
        },
        inventory: {
          currentStock: 2, // Stock bajo para pruebas
          minStock: 5,
          maxStock: 20,
          location: {
            aisle: 'A',
            shelf: '3',
            bin: '02'
          }
        },
        unit: 'piece',
        tags: ['llave', 'inglesa', 'ajustable', 'bahco']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('📦 Productos creados:', createdProducts.length);

    // 5. Crear clientes de ejemplo
    const customers = [
      {
        firstName: 'Pedro',
        lastName: 'Rodríguez',
        email: 'pedro.rodriguez@email.com',
        phone: '+56912345678',
        dni: '12345678-9',
        customerType: 'individual',
        address: {
          street: 'Los Aromos',
          number: '123',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '7500000',
          country: 'Chile'
        },
        paymentTerms: 'cash',
        discountRate: 0
      },
      {
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'ana.silva@constructora.cl',
        phone: '+56987654321',
        rut: '76.555.666-7',
        customerType: 'business',
        businessName: 'Constructora Silva Ltda.',
        address: {
          street: 'Av. Providencia',
          number: '456',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '7500001',
          country: 'Chile'
        },
        creditLimit: 500000,
        paymentTerms: '30_days',
        discountRate: 5
      },
      {
        firstName: 'Luis',
        lastName: 'Morales',
        phone: '+56911223344',
        dni: '11223344-5',
        customerType: 'individual',
        paymentTerms: 'cash'
      }
    ];

    const createdCustomers = await Customer.insertMany(customers);
    console.log('👥 Clientes creados:', createdCustomers.length);

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👨‍💼 Administrador:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n👩‍💼 Cajero:');
    console.log('   Usuario: cajero1');
    console.log('   Contraseña: cajero123');
    console.log('\n👨‍🔧 Empleado:');
    console.log('   Usuario: empleado1');
    console.log('   Contraseña: empleado123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedData();
}

module.exports = seedData;