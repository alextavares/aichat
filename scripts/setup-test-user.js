const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateTestUser() {
  console.log('🔍 Verificando usuário de teste...');
  
  const testEmail = '11@gmail.com';
  const testPassword = 'Y*mare2025';
  
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('✅ Usuário de teste já existe:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        hasPassword: !!existingUser.passwordHash
      });
      
      // Verificar se a senha está correta
      if (existingUser.passwordHash) {
        const isPasswordValid = await bcrypt.compare(testPassword, existingUser.passwordHash);
        console.log(`🔐 Senha válida: ${isPasswordValid ? '✅' : '❌'}`);
        
        if (!isPasswordValid) {
          console.log('🔧 Atualizando senha...');
          const hashedPassword = await bcrypt.hash(testPassword, 12);
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { passwordHash: hashedPassword }
          });
          console.log('✅ Senha atualizada com sucesso!');
        }
      } else {
        console.log('🔧 Adicionando senha ao usuário...');
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash: hashedPassword }
        });
        console.log('✅ Senha adicionada com sucesso!');
      }
    } else {
      console.log('🆕 Criando usuário de teste...');
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Usuário Teste',
          passwordHash: hashedPassword,
          profession: 'Desenvolvedor',
          organization: 'Teste'
        }
      });
      
      console.log('✅ Usuário de teste criado:', {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      });
    }
    
    // Verificar conexão com banco
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateTestUser();