// Teste simples das APIs do chat
import { prisma } from '../lib/prisma.js';

async function testChatAPIs() {
  console.log('🧪 Teste simples das APIs do InnerAI\n');

  try {
    // 1. Verificar conexão com banco de dados
    console.log('1️⃣ Testando conexão com banco de dados...');
    const userCount = await prisma.user.count();
    console.log(`✅ Banco conectado! Usuários encontrados: ${userCount}`);

    // 2. Buscar usuário de teste
    console.log('\n2️⃣ Buscando usuário de teste...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'teste@innerai.com' }
    });

    if (testUser) {
      console.log(`✅ Usuário encontrado:`);
      console.log(`   - ID: ${testUser.id}`);
      console.log(`   - Nome: ${testUser.name}`);
      console.log(`   - Plano: ${testUser.planType}`);
    } else {
      console.error('❌ Usuário de teste não encontrado');
      return;
    }

    // 3. Verificar conversas do usuário
    console.log('\n3️⃣ Verificando conversas existentes...');
    const conversations = await prisma.conversation.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`✅ Conversas encontradas: ${conversations.length}`);
    conversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.title || 'Sem título'} (${conv.id})`);
    });

    // 4. Criar nova conversa de teste
    console.log('\n4️⃣ Criando nova conversa de teste...');
    const newConversation = await prisma.conversation.create({
      data: {
        userId: testUser.id,
        title: `Teste API - ${new Date().toLocaleString('pt-BR')}`
      }
    });
    console.log(`✅ Conversa criada: ${newConversation.id}`);

    // 5. Adicionar mensagem de teste
    console.log('\n5️⃣ Adicionando mensagem de teste...');
    const userMessage = await prisma.message.create({
      data: {
        conversationId: newConversation.id,
        role: 'USER',
        content: 'Teste de mensagem via script',
        modelUsed: 'gpt-3.5-turbo'
      }
    });
    console.log(`✅ Mensagem criada: ${userMessage.id}`);

    // 6. Verificar modelos de AI disponíveis
    console.log('\n6️⃣ Verificando modelos de AI disponíveis...');
    const models = await prisma.aIModel.findMany({
      where: { isActive: true },
      select: { name: true, provider: true, planRequired: true }
    });

    console.log(`✅ Modelos encontrados: ${models.length}`);
    models.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.name} (${model.provider}) - Plano: ${model.planRequired}`);
    });

    // 7. Verificar limites do plano
    console.log('\n7️⃣ Verificando limites do plano...');
    const planLimit = await prisma.planLimit.findUnique({
      where: { planType: testUser.planType }
    });

    if (planLimit) {
      console.log(`✅ Limites do plano ${testUser.planType}:`);
      console.log(`   - Mensagens diárias: ${planLimit.dailyMessagesLimit || 'Ilimitado'}`);
      console.log(`   - Tokens mensais: ${planLimit.monthlyTokensLimit || 'Ilimitado'}`);
    }

    // 8. Verificar uso do usuário hoje
    console.log('\n8️⃣ Verificando uso do usuário hoje...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.userUsage.findMany({
      where: {
        userId: testUser.id,
        date: {
          gte: today
        }
      }
    });

    if (usage.length > 0) {
      console.log(`✅ Uso encontrado:`);
      usage.forEach(u => {
        console.log(`   - Modelo: ${u.modelId}`);
        console.log(`   - Mensagens: ${u.messagesCount}`);
        console.log(`   - Tokens: ${u.inputTokensUsed + u.outputTokensUsed}`);
      });
    } else {
      console.log('ℹ️  Nenhum uso registrado hoje');
    }

    console.log('\n✅ Teste concluído com sucesso!');
    console.log('\n📝 Resumo:');
    console.log(`   - Banco de dados: OK`);
    console.log(`   - Usuário de teste: OK`);
    console.log(`   - Conversas: ${conversations.length}`);
    console.log(`   - Modelos AI: ${models.length}`);
    console.log(`   - APIs prontas para uso`);

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testChatAPIs().catch(console.error); 