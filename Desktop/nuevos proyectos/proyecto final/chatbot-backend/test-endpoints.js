const axios = require('axios');

const BASE_URL = 'http://localhost:3008';

// Variables para almacenar tokens
let userToken = '';
let adminToken = '';
let userId = '';
let adminId = '';

// Función para hacer requests con manejo de errores
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Test 1: Registrar un usuario normal
async function testRegisterUser() {
  console.log('\n🧪 Test 1: Registrar usuario normal');
  const userData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    // role por defecto será 'user'
  };
  
  const result = await makeRequest('POST', '/auth/register', userData);
  if (result.success) {
    userToken = result.data.data.access_token;
    console.log('✅ Usuario registrado exitosamente');
    console.log('📄 Token obtenido:', userToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 2: Registrar un admin (manualmente como admin)
async function testRegisterAdmin() {
  console.log('\n🧪 Test 2: Registrar usuario admin');
  const adminData = {
    username: 'testadmin',
    email: 'admin@example.com',
    password: 'admin123',
    // role se asignará por defecto como 'user', luego lo cambiaremos manualmente
  };
  
  const result = await makeRequest('POST', '/auth/register', adminData);
  if (result.success) {
    adminToken = result.data.data.access_token;
    console.log('✅ Admin registrado exitosamente');
    console.log('📄 Token obtenido:', adminToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 3: Login como usuario normal
async function testLoginUser() {
  console.log('\n🧪 Test 3: Login usuario normal');
  const loginData = {
    username: 'testuser@example.com', // En LoginDto, username debe ser un email
    password: 'password123',
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  if (result.success) {
    userToken = result.data.data.access_token;
    console.log('✅ Login exitoso');
    console.log('📄 Token obtenido:', userToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 4: Login como admin
async function testLoginAdmin() {
  console.log('\n🧪 Test 4: Login admin');
  const loginData = {
    username: 'admin@example.com', // En LoginDto, username debe ser un email
    password: 'admin123',
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  if (result.success) {
    adminToken = result.data.data.access_token;
    console.log('✅ Login exitoso');
    console.log('📄 Token obtenido:', adminToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 5: Obtener todos los usuarios (solo admin)
async function testGetAllUsersAsAdmin() {
  console.log('\n🧪 Test 5: Obtener todos los usuarios (como admin)');
  
  const result = await makeRequest('GET', '/users', null, {
    Authorization: `Bearer ${adminToken}`,
  });
  
  if (result.success) {
    console.log('✅ Lista de usuarios obtenida exitosamente');
    console.log('👥 Total usuarios:', result.data.data.total);
    // Guardar IDs para pruebas posteriores
    if (result.data.data.data.length > 0) {
      userId = result.data.data.data.find(u => u.email === 'testuser@example.com')?.id;
      adminId = result.data.data.data.find(u => u.email === 'admin@example.com')?.id;
      console.log('👤 User ID:', userId);
      console.log('👨‍💼 Admin ID:', adminId);
    }
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 6: Intentar obtener todos los usuarios como usuario normal (debe fallar)
async function testGetAllUsersAsUser() {
  console.log('\n🧪 Test 6: Intentar obtener todos los usuarios (como usuario normal)');
  
  const result = await makeRequest('GET', '/users', null, {
    Authorization: `Bearer ${userToken}`,
  });
  
  if (result.success) {
    console.log('❌ PROBLEMA: Usuario normal pudo acceder a lista completa');
  } else {
    console.log('✅ Correctamente denegado. Status:', result.status);
    console.log('📄 Error:', result.error.message || result.error);
  }
}

// Test 7: Usuario accede a su propio perfil
async function testUserAccessOwnProfile() {
  console.log('\n🧪 Test 7: Usuario accede a su propio perfil');
  
  if (!userId) {
    console.log('❌ No se pudo obtener el ID del usuario');
    return;
  }
  
  const result = await makeRequest('GET', `/users/${userId}`, null, {
    Authorization: `Bearer ${userToken}`,
  });
  
  if (result.success) {
    console.log('✅ Usuario accedió a su perfil correctamente');
    console.log('👤 Username:', result.data.data.username);
    console.log('📧 Email:', result.data.data.email);
    console.log('🔑 Rol:', result.data.data.role);
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 8: Usuario intenta acceder a perfil de otro usuario (debe fallar)
async function testUserAccessOtherProfile() {
  console.log('\n🧪 Test 8: Usuario intenta acceder a perfil de admin');
  
  if (!adminId) {
    console.log('❌ No se pudo obtener el ID del admin');
    return;
  }
  
  const result = await makeRequest('GET', `/users/${adminId}`, null, {
    Authorization: `Bearer ${userToken}`,
  });
  
  if (result.success) {
    console.log('❌ PROBLEMA: Usuario normal accedió a perfil de admin');
  } else {
    console.log('✅ Correctamente denegado. Status:', result.status);
    console.log('📄 Error:', result.error.message || result.error);
  }
}

// Test 9: Admin accede a perfil de usuario
async function testAdminAccessUserProfile() {
  console.log('\n🧪 Test 9: Admin accede a perfil de usuario');
  
  if (!userId) {
    console.log('❌ No se pudo obtener el ID del usuario');
    return;
  }
  
  const result = await makeRequest('GET', `/users/${userId}`, null, {
    Authorization: `Bearer ${adminToken}`,
  });
  
  if (result.success) {
    console.log('✅ Admin accedió a perfil de usuario correctamente');
    console.log('👤 Username:', result.data.data.username);
    console.log('📧 Email:', result.data.data.email);
    console.log('🔑 Rol:', result.data.data.role);
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Test 10: Acceso sin token (debe fallar)
async function testAccessWithoutToken() {
  console.log('\n🧪 Test 10: Intentar acceder sin token');
  
  const result = await makeRequest('GET', '/users');
  
  if (result.success) {
    console.log('❌ PROBLEMA: Se pudo acceder sin token');
  } else {
    console.log('✅ Correctamente denegado. Status:', result.status);
    console.log('📄 Error:', result.error.message || result.error);
  }
}

// Test 11: Usuario actualiza su propio perfil
async function testUserUpdateOwnProfile() {
  console.log('\n🧪 Test 11: Usuario actualiza su propio perfil');
  
  if (!userId) {
    console.log('❌ No se pudo obtener el ID del usuario');
    return;
  }
  
  const updateData = {
    username: 'testuserupdated',
  };
  
  const result = await makeRequest('PUT', `/users/${userId}`, updateData, {
    Authorization: `Bearer ${userToken}`,
  });
  
  if (result.success) {
    console.log('✅ Usuario actualizó su perfil correctamente');
    console.log('👤 Nuevo username:', result.data.data.username);
  } else {
    console.log('❌ Error:', result.error);
  }
}

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas de endpoints protegidos con JWT y roles');
  console.log('=' .repeat(60));
  
  try {
    await testRegisterUser();
    await testRegisterAdmin();
    await testLoginUser();
    await testLoginAdmin();
    await testGetAllUsersAsAdmin();
    await testGetAllUsersAsUser();
    await testUserAccessOwnProfile();
    await testUserAccessOtherProfile();
    await testAdminAccessUserProfile();
    await testAccessWithoutToken();
    await testUserUpdateOwnProfile();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
  }
}

// Verificar si el servidor está corriendo
async function checkServer() {
  console.log('🔍 Verificando si el servidor está corriendo...');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Servidor corriendo correctamente');
    return true;
  } catch (error) {
    console.log('❌ Servidor no disponible. Asegúrate de que esté corriendo en puerto 3008');
    console.log('💡 Ejecuta: npm run start:dev');
    return false;
  }
}

// Ejecutar
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();
