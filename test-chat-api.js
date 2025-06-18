// Teste direto da API de chat
const fetch = require('node-fetch');

async function testChatAPI() {
  console.log('🧪 Testando API de Chat diretamente...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 1. Primeiro fazer login para obter cookie de sessão
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'email=test@example.com&password=test123&csrfToken=test',
      redirect: 'manual'
    });
    
    // Capturar cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('   Status:', loginResponse.status);
    console.log('   Cookies obtidos:', cookies ? 'Sim' : 'Não');
    
    if (!cookies) {
      console.log('   ❌ Não foi possível obter sessão');
      return;
    }
    
    // 2. Testar API de chat
    console.log('\n2️⃣ Testando API de chat...');
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        message: 'Olá! O que é Node.js?',
        model: 'gpt-3.5-turbo'
      })
    });
    
    console.log('   Status:', chatResponse.status);
    
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('   ✅ Resposta recebida!');
      console.log('   Mensagem:', data.message?.substring(0, 100) + '...');
    } else {
      const error = await chatResponse.text();
      console.log('   ❌ Erro:', error);
    }
    
    // 3. Testar API de templates
    console.log('\n3️⃣ Testando API de templates...');
    const templatesResponse = await fetch(`${baseUrl}/api/templates`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('   Status:', templatesResponse.status);
    
    if (templatesResponse.ok) {
      const templates = await templatesResponse.json();
      console.log('   ✅ Templates carregados:', templates.length);
      if (templates.length > 0) {
        console.log('   Primeiro template:', templates[0].name);
      }
    }
    
    // 4. Testar API de uso
    console.log('\n4️⃣ Testando API de uso...');
    const usageResponse = await fetch(`${baseUrl}/api/usage/today`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('   Status:', usageResponse.status);
    
    if (usageResponse.ok) {
      const usage = await usageResponse.json();
      console.log('   ✅ Dados de uso:');
      console.log('     - Mensagens hoje:', usage.dailyMessages);
      console.log('     - Limite diário:', usage.dailyLimit);
      console.log('     - Plano:', usage.planType);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Verificar se fetch está disponível
if (typeof fetch === 'undefined') {
  console.log('Instalando node-fetch...');
  const { exec } = require('child_process');
  exec('npm install node-fetch@2', (error) => {
    if (!error) {
      console.log('node-fetch instalado, execute o script novamente');
    }
  });
} else {
  testChatAPI();
}