const axios = require('axios');

async function testLogin() {
  try {
    console.log('Probando endpoint de login...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login exitoso!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error en login:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Data:', error.response?.data);
  }
}

async function testHealth() {
  try {
    console.log('Probando endpoint de health...');
    
    const response = await axios.get('http://localhost:3000/api/health');
    
    console.log('Health check exitoso!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('Error en health check:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
  }
}

async function runTests() {
  await testHealth();
  console.log('');
  await testLogin();
}

runTests();