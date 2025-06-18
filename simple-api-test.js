// Teste simples sem Puppeteer
const http = require('http');

async function simpleAPITest() {
  console.log('🧪 Teste Simples das APIs do Inner AI Clone\n');
  
  const tests = [
    { name: 'Homepage', path: '/', expected: 200 },
    { name: 'Login Page', path: '/auth/signin', expected: 200 },
    { name: 'Dashboard', path: '/dashboard', expected: [200, 307] },
    { name: 'API Templates', path: '/api/templates', expected: [200, 307, 401] },
    { name: 'API Usage', path: '/api/usage/today', expected: [200, 307, 401] },
    { name: 'API Chat', path: '/api/chat', expected: [200, 307, 401, 405] }
  ];
  
  for (const test of tests) {
    await testEndpoint(test);
  }
  
  console.log('\n✅ Teste concluído!');
}

function testEndpoint({ name, path, expected }) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      const expectedArray = Array.isArray(expected) ? expected : [expected];
      const passed = expectedArray.includes(res.statusCode);
      
      console.log(`${passed ? '✅' : '❌'} ${name}: ${res.statusCode} ${passed ? 'OK' : 'ERRO'}`);
      
      if (res.statusCode === 307) {
        console.log(`   ↪️  Redirecionamento (autenticação requerida)`);
      } else if (res.statusCode === 500) {
        console.log(`   ⚠️  Erro no servidor - verificar logs`);
      }
      
      resolve();
    });
    
    req.on('error', (e) => {
      console.log(`❌ ${name}: Erro de conexão - ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Executar
simpleAPITest();