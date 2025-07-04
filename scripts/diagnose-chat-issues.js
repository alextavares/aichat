// Script de diagnóstico detalhado para problemas do chat
const PRODUCTION_URL = 'https://seahorse-app-k5pag.ondigitalocean.app';

async function diagnoseChatIssues() {
  console.log('🔍 Diagnóstico Detalhado do Chat em Produção\n');
  console.log('=' .repeat(60));
  
  const diagnostics = {
    infrastructure: {
      pageLoad: false,
      authentication: false,
      apiEndpoints: false,
      staticAssets: false
    },
    chatSpecific: {
      modelsAvailable: false,
      streamingSupport: false,
      errorHandling: false
    },
    possibleIssues: [],
    recommendations: []
  };

  // 1. Verificar infraestrutura básica
  console.log('\n1. VERIFICANDO INFRAESTRUTURA');
  console.log('-' .repeat(40));
  
  // Teste de página de login
  try {
    const loginTest = await fetch(`${PRODUCTION_URL}/auth/signin`);
    console.log(`✓ Página de login: ${loginTest.status === 200 ? '✅ OK' : '❌ ERRO'}`);
    diagnostics.infrastructure.pageLoad = loginTest.status === 200;
    
    const loginHtml = await loginTest.text();
    
    // Verificar se há mensagens de erro no HTML
    if (loginHtml.includes('NEXTAUTH_URL')) {
      diagnostics.possibleIssues.push('NEXTAUTH_URL pode estar mal configurado');
    }
    if (loginHtml.includes('NEXTAUTH_SECRET')) {
      diagnostics.possibleIssues.push('NEXTAUTH_SECRET pode estar faltando');
    }
    if (loginHtml.includes('DATABASE_URL')) {
      diagnostics.possibleIssues.push('Problema de conexão com banco de dados');
    }
  } catch (error) {
    console.log('✓ Página de login: ❌ ERRO DE REDE');
    diagnostics.possibleIssues.push(`Erro ao acessar página de login: ${error.message}`);
  }

  // Teste de API Health
  try {
    const healthTest = await fetch(`${PRODUCTION_URL}/api/health`);
    console.log(`✓ API Health Check: ${healthTest.status === 200 ? '✅ OK' : '❌ ERRO'}`);
    diagnostics.infrastructure.apiEndpoints = healthTest.status === 200;
  } catch (error) {
    console.log('✓ API Health Check: ❌ ERRO');
  }

  // 2. Verificar endpoints específicos do chat
  console.log('\n2. VERIFICANDO ENDPOINTS DO CHAT');
  console.log('-' .repeat(40));
  
  // Teste do endpoint de chat (deve retornar 401 sem auth)
  try {
    const chatTest = await fetch(`${PRODUCTION_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-3.5-turbo'
      })
    });
    
    console.log(`✓ Endpoint /api/chat/stream: ${chatTest.status === 401 ? '✅ Protegido' : `❌ Status ${chatTest.status}`}`);
    
    if (chatTest.status !== 401) {
      const response = await chatTest.json();
      console.log('  Resposta inesperada:', response);
      diagnostics.possibleIssues.push('Endpoint de chat pode estar mal configurado');
    }
  } catch (error) {
    console.log('✓ Endpoint /api/chat/stream: ❌ ERRO');
    diagnostics.possibleIssues.push(`Erro no endpoint de chat: ${error.message}`);
  }

  // 3. Possíveis problemas de configuração
  console.log('\n3. ANÁLISE DE POSSÍVEIS PROBLEMAS');
  console.log('-' .repeat(40));
  
  // Baseado nos testes, identificar problemas
  if (!diagnostics.infrastructure.pageLoad) {
    diagnostics.possibleIssues.push('Aplicação pode não estar rodando corretamente');
    diagnostics.recommendations.push('Verificar logs de deploy no DigitalOcean');
  }

  // Listar problemas comuns
  console.log('\n🔴 PROBLEMAS COMUNS EM PRODUÇÃO:');
  console.log('1. Variáveis de ambiente faltando ou incorretas');
  console.log('2. Banco de dados inacessível ou sem migrações');
  console.log('3. API Keys de IA não configuradas');
  console.log('4. CORS ou problemas de autenticação');
  console.log('5. Limites de rate limiting ou quota');

  // 4. Verificação específica de IA
  console.log('\n4. VERIFICAÇÃO DE CONFIGURAÇÃO DE IA');
  console.log('-' .repeat(40));
  console.log('⚠️  Não é possível verificar diretamente sem autenticação');
  console.log('Verificações necessárias no painel do DigitalOcean:');
  console.log('- OPENAI_API_KEY está configurada?');
  console.log('- OPENROUTER_API_KEY está configurada?');
  console.log('- Alguma das chaves está válida e com créditos?');

  // 5. Recomendações específicas
  console.log('\n5. AÇÕES RECOMENDADAS');
  console.log('-' .repeat(40));
  console.log('1️⃣  Verificar logs do aplicativo:');
  console.log('   doctl apps logs <app-id> --type=run');
  console.log('\n2️⃣  Verificar variáveis de ambiente:');
  console.log('   - NEXTAUTH_URL = https://seahorse-app-k5pag.ondigitalocean.app');
  console.log('   - NEXTAUTH_SECRET configurado');
  console.log('   - DATABASE_URL e DIRECT_URL corretos');
  console.log('   - OPENAI_API_KEY ou OPENROUTER_API_KEY válidas');
  console.log('\n3️⃣  Testar localmente com as mesmas variáveis:');
  console.log('   Copie as variáveis de produção para .env.local e teste');
  console.log('\n4️⃣  Verificar banco de dados:');
  console.log('   - Migrations aplicadas: npx prisma migrate deploy');
  console.log('   - Conexão funcionando: npx prisma db pull');

  // 6. Script de teste manual
  console.log('\n6. TESTE MANUAL DO CHAT');
  console.log('-' .repeat(40));
  console.log('Para testar o chat manualmente:');
  console.log('1. Acesse: https://seahorse-app-k5pag.ondigitalocean.app');
  console.log('2. Faça login com suas credenciais');
  console.log('3. Navegue para /dashboard/chat');
  console.log('4. Abra o Console do navegador (F12)');
  console.log('5. Tente enviar uma mensagem');
  console.log('6. Observe erros no Console e na aba Network');
  
  // Resumo final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('=' .repeat(60));
  
  if (diagnostics.possibleIssues.length > 0) {
    console.log('\n❌ Possíveis problemas identificados:');
    diagnostics.possibleIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ Infraestrutura básica parece estar funcionando');
    console.log('   O problema pode estar nas configurações de IA ou autenticação');
  }

  console.log('\n💡 Próximos passos:');
  console.log('1. Verificar logs de produção para erros específicos');
  console.log('2. Confirmar todas as variáveis de ambiente');
  console.log('3. Testar com um usuário real e monitorar console/network');
}

// Executar diagnóstico
diagnoseChatIssues();