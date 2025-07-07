const BASE_URL = 'http://localhost:3000';

async function testChat() {
  console.log('🧪 Iniciando teste do sistema de chat...\n');

  try {
    // 1. Obter CSRF token
    console.log('1️⃣ Obtendo CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log('✅ CSRF token obtido');

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'teste@innerai.com',
        password: 'Test@123456',
        csrfToken: csrfToken,
        json: 'true'
      }),
      credentials: 'include'
    });

    const loginData = await loginResponse.json();
    if (loginData.ok) {
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.error('❌ Erro no login:', loginData);
      return;
    }

    // 3. Verificar sessão
    console.log('\n3️⃣ Verificando sessão...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
      credentials: 'include'
    });
    const sessionData = await sessionResponse.json();

    if (sessionData.user) {
      console.log('✅ Sessão válida:', sessionData.user.email);
      console.log('   Plano:', sessionData.user.planType);
    } else {
      console.error('❌ Sessão inválida');
      return;
    }

    // 4. Criar uma conversa
    console.log('\n4️⃣ Criando nova conversa...');
    const conversationResponse = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Teste de Chat' }),
      credentials: 'include'
    });

    if (!conversationResponse.ok) {
      console.error('❌ Erro ao criar conversa:', conversationResponse.status);
      const errorText = await conversationResponse.text();
      console.error('Resposta:', errorText);
      return;
    }

    const conversationData = await conversationResponse.json();
    if (conversationData.id) {
      console.log('✅ Conversa criada:', conversationData.id);
    } else {
      console.error('❌ Erro ao criar conversa:', conversationData);
      return;
    }

    const conversationId = conversationData.id;

    // 5. Enviar mensagem de teste
    console.log('\n5️⃣ Enviando mensagem de teste...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Olá! Este é um teste do sistema de chat. Me responda com uma mensagem simples.',
        conversationId: conversationId,
        model: 'gpt-3.5-turbo'
      }),
      credentials: 'include'
    });

    if (!chatResponse.ok) {
      console.error('❌ Erro ao enviar mensagem:', chatResponse.status);
      const errorText = await chatResponse.text();
      console.error('Resposta:', errorText);
      return;
    }

    const chatData = await chatResponse.json();
    if (chatData.success) {
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📝 Resposta:', chatData.message);
    } else {
      console.error('❌ Erro ao enviar mensagem:', chatData);
    }

    // 6. Testar streaming
    console.log('\n6️⃣ Testando streaming...');
    const streamResponse = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Me conte uma piada curta',
        conversationId: conversationId,
        model: 'gpt-3.5-turbo'
      }),
      credentials: 'include'
    });

    if (!streamResponse.ok) {
      console.error('❌ Erro no streaming:', streamResponse.status);
      const errorText = await streamResponse.text();
      console.error('Resposta:', errorText);
      return;
    }

    console.log('📡 Recebendo stream...');
    const reader = streamResponse.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        process.stdout.write(chunk);
      }
      console.log('\n\n✅ Stream concluído!');
    }

    console.log('\n🎉 Todos os testes passaram!');

  } catch (error: any) {
    console.error('\n❌ Erro durante os testes:', error.message);
    console.error(error);
  }
}

// Executar teste
testChat().catch(console.error); 