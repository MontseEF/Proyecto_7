const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar modelos
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

async function migrateProductsFromJSON() {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '..', 'ferreteria_products.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const productsData = JSON.parse(rawData);
    
    console.log(`Encontrados ${productsData.length} productos en el archivo JSON`);

    // Estadísticas
    let created = 0;
    let errors = 0;
    let skipped = 0;

    // Procesar productos en lotes para mejor rendimiento
    const batchSize = 100;
    
    for (let i = 0; i < productsData.length; i += batchSize) {
      const batch = productsData.slice(i, i + batchSize);
      console.log(`Procesando lote ${Math.floor(i/batchSize) + 1} (${batch.length} productos)...`);
      
      for (const productData of batch) {
        try {
          // Verificar si el producto ya existe por SKU
          const existingProduct = await Product.findOne({ sku: productData.sku });
          if (existingProduct) {
            skipped++;
            continue;
          }

          // Mapear los datos del JSON al esquema del modelo
          const mappedProduct = {
            name: productData.name,
            sku: productData.sku,
            barcode: productData.barcode,
            description: productData.description || '',
            brand: productData.brand || '',
            
            // Mantener referencias como strings por ahora (se pueden convertir después)
            category: mongoose.Types.ObjectId.isValid(productData.category) ? productData.category : null,
            supplier: mongoose.Types.ObjectId.isValid(productData.supplier) ? productData.supplier : null,
            
            // Pricing - solo los campos que existen en el modelo
            pricing: {
              costPrice: productData.pricing?.costPrice || 0,
              sellingPrice: productData.pricing?.sellingPrice || 0
            },
            
            // Inventory - solo los campos que existen en el modelo
            inventory: {
              currentStock: productData.inventory?.currentStock || 0,
              minStock: productData.inventory?.minStock || 5
            },
            
            // Images - mantener estructura
            images: productData.images || [],
            
            // Flags
            isActive: productData.isActive !== undefined ? productData.isActive : true,
            isFeatured: productData.isFeatured !== undefined ? productData.isFeatured : false
          };

          // Crear el producto
          const newProduct = new Product(mappedProduct);
          await newProduct.save();
          created++;
          
          if (created % 50 === 0) {
            console.log(`    ${created} productos creados...`);
          }
          
        } catch (error) {
          errors++;
          console.error(`Error con producto ${productData.sku}:`, error.message);
          
          // Si hay muchos errores, mostrar solo los primeros 10
          if (errors <= 10) {
            console.error('   Datos problemáticos:', {
              name: productData.name,
              sku: productData.sku,
              error: error.message
            });
          }
        }
      }
    }

    // Resumen final
    console.log('\n RESUMEN DE MIGRACIÓN:');
    console.log(`Productos creados: ${created}`);
    console.log(`Productos omitidos (ya existían): ${skipped}`);
    console.log(`Errores: ${errors}`);
    console.log(`Total procesados: ${created + skipped + errors}`);

    // Verificar algunos productos en la base de datos
    const totalInDB = await Product.countDocuments();
    console.log(`\n  Total de productos en la base de datos: ${totalInDB}`);

    // Mostrar algunos productos de ejemplo
    const sampleProducts = await Product.find().limit(3).select('name sku pricing.sellingPrice inventory.currentStock');
    console.log('\n Productos de ejemplo en la base de datos:');
    sampleProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.sku}) - $${product.pricing.sellingPrice} - Stock: ${product.inventory.currentStock}`);
    });

  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n Conexión cerrada');
    process.exit();
  }
}

// Función para limpiar productos existentes (opcional)
async function clearProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Limpiando productos existentes...');
    
    const result = await Product.deleteMany({});
    console.log(`  ${result.deletedCount} productos eliminados`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error limpiando productos:', error);
  }
}

// Ejecutar migración
console.log(' Iniciando migración de productos desde JSON a MongoDB Atlas...');
console.log(' Tip: Si quieres limpiar productos existentes primero, descomenta la línea clearProducts()');

// Descomenta la siguiente línea si quieres limpiar productos existentes primero
// await clearProducts();

migrateProductsFromJSON();