// Script para criar um usuário de teste diretamente no banco
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('test123456', 10);
    
    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: 'test@payment.com',
        name: 'Test Payment',
        password: hashedPassword,
        role: 'FREE',
        profession: 'Developer',
        organization: 'Test Inc',
        usage: {
          create: {
            tokensUsed: 0,
            messagesUsed: 0,
            templatesUsed: 0,
            knowledgeBasesUsed: 0
          }
        }
      }
    });
    
    console.log('✅ Usuário de teste criado com sucesso:');
    console.log('   Email:', user.email);
    console.log('   Senha: test123456');
    console.log('   ID:', user.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Usuário já existe');
    } else {
      console.error('❌ Erro ao criar usuário:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();