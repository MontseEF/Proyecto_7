const axios = require('axios');

async function testReportsRoutes() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log('🔍 Probando rutas de reports...\n');
    
    // 1. Primero hacer login para obtener token
    console.log('1️⃣ Haciendo login para obtener token');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data?.data?.token;
    if (!token) {
      throw new Error('No se recibió token en la respuesta');
    }
    console.log('✅ Login OK, token obtenido');
    
    // 2. Probar Dashboard
    console.log('\n2️⃣ Testing /api/reports/dashboard');
    const dashboardResponse = await axios.get(`${baseURL}/reports/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard OK:', dashboardResponse.status);
    console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    
    // 3. Probar otras rutas de reports
    console.log('\n3️⃣ Testing /api/reports/sales');
    const salesResponse = await axios.get(`${baseURL}/reports/sales`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Sales report OK:', salesResponse.status);
    
    console.log('\n4️⃣ Testing /api/reports/products');
    const productsResponse = await axios.get(`${baseURL}/reports/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Products report OK:', productsResponse.status);
    
    console.log('\n🎉 ¡Todas las rutas de reports funcionan correctamente!');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('URL:', error.config?.url);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testReportsRoutes();