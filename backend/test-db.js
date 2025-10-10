// Script para probar la conexión a MongoDB y listar colecciones
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Conectando a MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');
    
    // Obtener la base de datos
    const db = mongoose.connection.db;
    
    // Listar todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log('\n📂 Colecciones encontradas:');
    
    if (collections.length === 0) {
      console.log('   No hay colecciones en la base de datos');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documentos`);
      }
    }
    
    // Probar insertar un documento de prueba
    console.log('\n🧪 Probando inserción de documento...');
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Conexión funcionando correctamente'
    });
    console.log('✅ Documento insertado con ID:', result.insertedId);
    
    // Eliminar el documento de prueba
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🗑️ Documento de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('Detalles del error del servidor:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

testConnection();