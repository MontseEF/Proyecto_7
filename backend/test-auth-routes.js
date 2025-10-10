const axios = require('axios');

async function testAuthRoutes() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log(' Probando rutas de autenticación...\n');
    
    // 1. Probar Health Check
    console.log(' Testing /api/health');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log(' Health OK:', healthResponse.status);
    
    // 2. Probar Login
    console.log('\n Testing /api/auth/login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login OK:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data?.data?.token;
    if (!token) {
      throw new Error('No se recibió token en la respuesta');
    }
    
    // 3. Probar Profile con token
    console.log('\n Testing /api/auth/profile');
    const profileResponse = await axios.get(`${baseURL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile OK:', profileResponse.status);
    console.log('Profile response:', JSON.stringify(profileResponse.data, null, 2));
    
    console.log('\n ¡Todas las rutas de autenticación funcionan correctamente!');
    
  } catch (error) {
    console.error('\n Error en las pruebas:');
    
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

testAuthRoutes();