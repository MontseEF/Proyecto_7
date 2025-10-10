const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar modelos
const Product = require('../models/Product');

async function analyzeAndMigrateProducts() {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB Atlas');

    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '..', 'ferreteria_products.json');
    console.log('📖 Leyendo archivo JSON...');
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const productsData = JSON.parse(rawData);
    
    console.log(`Encontrados ${productsData.length} productos en el archivo JSON`);

    // Analizar la estructura de algunos productos
    console.log('\n ANÁLISIS DE ESTRUCTURA:');
    const sample = productsData.slice(0, 3);
    
    sample.forEach((product, index) => {
      console.log(`\n--- Producto ${index + 1} ---`);
      console.log(`Nombre: ${product.name}`);
      console.log(`SKU: ${product.sku}`);
      console.log(`Precio: ${product.pricing?.sellingPrice}`);
      console.log(`Stock: ${product.inventory?.currentStock}`);
      console.log(`Campos extra en JSON:`, Object.keys(product).filter(key => 
        !['name', 'sku', 'barcode', 'description', 'brand', 'category', 'supplier', 'pricing', 'inventory', 'images', 'isActive', 'isFeatured'].includes(key)
      ));
    });

    // Verificar cuántos productos ya existen
    const existingCount = await Product.countDocuments();
    console.log(`\n Productos existentes en DB: ${existingCount}`);

    // Preguntar al usuario si quiere continuar con una muestra pequeña
    console.log('\n MIGRACIÓN DE PRUEBA (primeros 100 productos):');
    
    let created = 0;
    let errors = 0;
    let skipped = 0;

    // Procesar solo los primeros 100 productos para prueba
    const testBatch = productsData.slice(0, 100);
    
    for (const productData of testBatch) {
      try {
        // Verificar si el producto ya existe por SKU
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
          skipped++;
          continue;
        }

        // Crear producto con los campos que coinciden con el modelo
        const newProduct = new Product({
          name: productData.name,
          sku: productData.sku,
          barcode: productData.barcode,
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
          
          images: productData.images || [],
          isActive: productData.isActive !== false, // default true
          isFeatured: productData.isFeatured === true // default false
        });

        await newProduct.save();
        created++;
        
      } catch (error) {
        errors++;
        if (errors <= 5) { // Solo mostrar los primeros 5 errores
          console.error(`Error con ${productData.sku}: ${error.message}`);
        }
      }
    }

    // Resumen
    console.log('\n RESUMEN DE PRUEBA:');
    console.log(`Creados: ${created}`);
    console.log(`Omitidos: ${skipped}`);
    console.log(`Errores: ${errors}`);

    // Mostrar algunos productos creados
    if (created > 0) {
      console.log('\n Productos creados exitosamente:');
      const newProducts = await Product.find().sort({ createdAt: -1 }).limit(5)
        .select('name sku pricing.sellingPrice inventory.currentStock');
      
      newProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.sku}) - $${product.pricing.sellingPrice} - Stock: ${product.inventory.currentStock}`);
      });
    }

    console.log('\n ¡La estructura del JSON es compatible con el modelo!');
    console.log(' Para migrar todos los productos, ejecuta el script completo.');

  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

analyzeAndMigrateProducts();