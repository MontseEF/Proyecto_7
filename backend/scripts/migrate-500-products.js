const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar modelos
const Product = require('../models/Product');

async function migrate500Products() {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '..', 'ferreteria_products.json');
    console.log('Leyendo archivo JSON...');
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const productsData = JSON.parse(rawData);
    
    console.log(`Total productos en JSON: ${productsData.length}`);
    console.log('Migrando solo los primeros 500 productos...');

    // Tomar solo los primeros 500 productos
    const productsToMigrate = productsData.slice(0, 500);
    
    let created = 0;
    let errors = 0;
    let skipped = 0;

    console.log('\n Iniciando migración...');
    
    for (let i = 0; i < productsToMigrate.length; i++) {
      const productData = productsToMigrate[i];
      
      try {
        // Verificar si el producto ya existe por SKU
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
          skipped++;
          continue;
        }

        // Crear producto con los campos compatibles con el modelo
        const newProduct = new Product({
          name: productData.name,
          sku: productData.sku,
          barcode: productData.barcode || null,
          description: productData.description || '',
          brand: productData.brand || '',
          
          // Solo usar ObjectId válidos, sino null
          category: mongoose.Types.ObjectId.isValid(productData.category) ? productData.category : null,
          supplier: mongoose.Types.ObjectId.isValid(productData.supplier) ? productData.supplier : null,
          
          pricing: {
            costPrice: Number(productData.pricing?.costPrice) || 0,
            sellingPrice: Number(productData.pricing?.sellingPrice) || 0
          },
          
          inventory: {
            currentStock: Number(productData.inventory?.currentStock) || 0,
            minStock: Number(productData.inventory?.minStock) || 5
          },
          
          images: Array.isArray(productData.images) ? productData.images : [],
          isActive: productData.isActive !== false,
          isFeatured: productData.isFeatured === true
        });

        await newProduct.save();
        created++;
        
        // Mostrar progreso cada 50 productos
        if (created % 50 === 0) {
          console.log(`    ${created} productos creados de 500...`);
        }
        
      } catch (error) {
        errors++;
        if (errors <= 3) { // Solo mostrar los primeros 3 errores
          console.error(`Error con ${productData.sku}: ${error.message}`);
        }
      }
    }

    // Resumen final
    console.log('\n RESUMEN DE MIGRACIÓN (500 productos):');
    console.log(`Productos creados: ${created}`);
    console.log(`Productos omitidos (ya existían): ${skipped}`);
    console.log(`Errores: ${errors}`);
    console.log(`Total procesados: ${created + skipped + errors}`);

    // Verificar total en la base de datos
    const totalInDB = await Product.countDocuments();
    console.log(`\n Total productos en la base de datos: ${totalInDB}`);

    // Mostrar algunos productos creados
    if (created > 0) {
      console.log('\n Últimos 5 productos creados:');
      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name sku pricing.sellingPrice inventory.currentStock brand');
      
      recentProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      SKU: ${product.sku} | Marca: ${product.brand}`);
        console.log(`      Precio: $${product.pricing.sellingPrice?.toLocaleString()} | Stock: ${product.inventory.currentStock}`);
        console.log('');
      });
    }

    console.log('¡Migración de 500 productos completada exitosamente!');

  } catch (error) {
    console.error(' Error en la migración:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

console.log('Migrando 500 productos desde JSON a MongoDB Atlas...');
migrate500Products();