// Test para debuggear el endpoint de productos
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function testProductsEndpoint() {
  try {
    console.log('=== Test de conexión y endpoint de productos ===');
    
    // 1. Conectar a la DB
    console.log('1. Conectando a MongoDB...');
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ferreteria_db';
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Conectado a MongoDB');

    // 2. Verificar la colección de productos
    console.log('\n2. Verificando colección de productos...');
    const productCount = await Product.countDocuments();
    console.log(`📦 Total de productos: ${productCount}`);

    if (productCount === 0) {
      console.log('⚠️ No hay productos en la base de datos');
    } else {
      // 3. Intentar la misma consulta que hace el endpoint
      console.log('\n3. Ejecutando consulta similar al endpoint...');
      
      const filters = { isActive: true };
      const sort = { name: 1 };
      
      console.log('Filtros:', filters);
      console.log('Ordenamiento:', sort);
      
      const products = await Product.find(filters)
        .populate('category', 'name')
        .populate('supplier', 'name')
        .sort(sort)
        .limit(20);
      
      console.log(`✅ Productos encontrados: ${products.length}`);
      
      if (products.length > 0) {
        console.log('\nPrimer producto:');
        console.log(JSON.stringify(products[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error en el test:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

testProductsEndpoint();