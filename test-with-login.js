// Teste com login simulado
const http = require('http');
const querystring = require('querystring');

async function testWithLogin() {
  console.log('🧪 Teste com Login do Inner AI Clone\n');
  
  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginData = querystring.stringify({
      email: 'test@example.com',
      password: 'test123',
      csrfToken: 'test'
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': loginData.length
      }
    };
    
    const cookies = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          console.log('   ✅ Cookies de sessão obtidos');
          resolve(setCookie.join('; '));
        } else {
          resolve(null);
        }
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });
    
    if (!cookies) {
      console.log('   ❌ Não foi possível obter sessão');
      return;
    }
    
    // 2. Testar APIs autenticadas
    console.log('\n2️⃣ Testando APIs autenticadas...');
    
    // Testar /api/usage/today
    await testAuthenticatedAPI('/api/usage/today', cookies, 'Usage API');
    
    // Testar /api/templates
    await testAuthenticatedAPI('/api/templates', cookies, 'Templates API');
    
    // Testar /api/conversations
    await testAuthenticatedAPI('/api/conversations', cookies, 'Conversations API');
    
    // 3. Testar envio de mensagem no chat
    console.log('\n3️⃣ Testando envio de mensagem...');
    const chatData = JSON.stringify({
      message: 'Olá! O que é JavaScript?',
      model: 'gpt-3.5-turbo'
    });
    
    const chatOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': chatData.length,
        'Cookie': cookies
      }
    };
    
    await new Promise((resolve) => {
      const req = http.request(chatOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          if (res.statusCode === 200) {
            console.log('   ✅ Mensagem enviada com sucesso!');
            try {
              const response = JSON.parse(data);
              console.log('   Resposta:', response.message?.substring(0, 50) + '...');
            } catch (e) {
              console.log('   Resposta recebida (streaming)');
            }
          } else {
            console.log('   ❌ Erro:', data);
          }
          resolve();
        });
      });
      
      req.on('error', (e) => {
        console.log('   ❌ Erro:', e.message);
        resolve();
      });
      
      req.write(chatData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n✅ Teste concluído!');
}

function testAuthenticatedAPI(path, cookies, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   ${name}: ${res.statusCode} ${res.statusCode === 200 ? '✅' : '❌'}`);
        if (res.statusCode === 200 && data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`     Dados:`, Object.keys(parsed).join(', '));
          } catch (e) {
            // Não é JSON
          }
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`   ${name}: ❌ Erro - ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Executar
testWithLogin();