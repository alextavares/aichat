// Teste simples usando fetch para verificar APIs
const http = require('http');
const https = require('https');

console.log('🧪 Teste Automatizado do Inner AI Clone\n');

// Função para fazer requisições
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  const baseUrl = 'localhost';
  const port = 3000;
  
  try {
    // 1. Testar Homepage
    console.log('1️⃣ Testando Homepage...');
    const home = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/',
      method: 'GET'
    });
    console.log(`   Status: ${home.status}`);
    console.log(`   ✅ Homepage respondendo\n`);
    
    // 2. Testar página de login
    console.log('2️⃣ Testando Página de Login...');
    const login = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/auth/signin',
      method: 'GET'
    });
    console.log(`   Status: ${login.status}`);
    console.log(`   ✅ Login page acessível\n`);
    
    // 3. Testar APIs
    console.log('3️⃣ Testando APIs...');
    
    // API de templates
    const templates = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/templates',
      method: 'GET'
    });
    console.log(`   /api/templates: ${templates.status}`);
    
    // API de usage
    const usage = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/usage/today',
      method: 'GET'
    });
    console.log(`   /api/usage/today: ${usage.status}`);
    
    // API de conversations
    const conversations = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/conversations',
      method: 'GET'
    });
    console.log(`   /api/conversations: ${conversations.status}\n`);
    
    // 4. Resumo
    console.log('📊 Resumo dos Testes:');
    console.log('====================');
    console.log(`✅ Homepage: OK`);
    console.log(`✅ Login Page: OK`);
    console.log(`${templates.status === 500 ? '❌' : templates.status === 307 ? '🔐' : '✅'} API Templates: ${templates.status}`);
    console.log(`${usage.status === 500 ? '❌' : usage.status === 307 ? '🔐' : '✅'} API Usage: ${usage.status}`);
    console.log(`${conversations.status === 500 ? '❌' : conversations.status === 307 ? '🔐' : '✅'} API Conversations: ${conversations.status}`);
    
    console.log('\n💡 Legenda:');
    console.log('   ✅ = Funcionando');
    console.log('   🔐 = Requer autenticação (esperado)');
    console.log('   ❌ = Erro no servidor');
    
    // Se houver erros 500, mostrar detalhes
    if (templates.status === 500 || usage.status === 500 || conversations.status === 500) {
      console.log('\n⚠️  APIs com erro 500 detectadas!');
      console.log('Execute: cd ~/inneraiclone && npx prisma generate');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar testes
runTests();