import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function verifyProductionUser() {
  console.log('🔍 Verificando usuário de teste em produção...\n')
  
  try {
    const testEmail = 'test@example.com'
    const testPassword = 'test123'
    
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (existingUser) {
      console.log('✅ Usuário de teste encontrado:')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Nome: ${existingUser.name}`)
      console.log(`   Plano: ${existingUser.planType}`)
      console.log(`   Criado em: ${existingUser.createdAt}`)
      
      // Verificar se a senha está correta
      if (existingUser.passwordHash) {
        const isPasswordValid = await bcrypt.compare(testPassword, existingUser.passwordHash)
        console.log(`   Senha válida: ${isPasswordValid ? '✅ SIM' : '❌ NÃO'}`)
        
        if (!isPasswordValid) {
          console.log('\n🔧 Atualizando senha do usuário de teste...')
          const newHashedPassword = await bcrypt.hash(testPassword, 10)
          await prisma.user.update({
            where: { email: testEmail },
            data: { passwordHash: newHashedPassword }
          })
          console.log('✅ Senha atualizada com sucesso')
        }
      } else {
        console.log('❌ Usuário não tem senha (OAuth only)')
      }
      
      return true
    } else {
      console.log('❌ Usuário de teste NÃO encontrado em produção')
      console.log('\n🔧 Criando usuário de teste...')
      
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Test User Production',
          passwordHash: hashedPassword,
          planType: 'PRO', // Dar acesso PRO para testar todos os modelos
          profession: 'Developer',
          organization: 'Test Organization'
        }
      })
      
      console.log('✅ Usuário de teste criado com sucesso:')
      console.log(`   Email: ${newUser.email}`)
      console.log(`   ID: ${newUser.id}`)
      console.log(`   Plano: ${newUser.planType}`)
      
      return true
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário:', error.message)
    return false
  }
}

async function testLoginCredentials() {
  console.log('\n🧪 Testando credenciais de login...\n')
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare('test123', user.passwordHash)
      
      if (isPasswordValid) {
        console.log('✅ CREDENCIAIS VÁLIDAS PARA LOGIN:')
        console.log('   Email: test@example.com')
        console.log('   Senha: test123')
        console.log('   Plano:', user.planType)
        
        return {
          email: 'test@example.com',
          password: 'test123',
          userId: user.id,
          planType: user.planType
        }
      } else {
        console.log('❌ Senha inválida')
      }
    } else {
      console.log('❌ Usuário não encontrado ou sem senha')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar credenciais:', error.message)
  }
  
  return null
}

async function main() {
  console.log('🚀 Verificação completa do usuário de produção\n')
  
  const userExists = await verifyProductionUser()
  
  if (userExists) {
    const credentials = await testLoginCredentials()
    
    if (credentials) {
      console.log('\n🎉 USUÁRIO DE TESTE PRONTO PARA USO!')
      console.log('\n📝 Instruções para login manual:')
      console.log('1. Acesse: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin')
      console.log('2. Email: test@example.com')
      console.log('3. Senha: test123')
      console.log('4. Após login, vá para: /dashboard/chat')
    } else {
      console.log('\n❌ PROBLEMA COM CREDENCIAIS')
    }
  } else {
    console.log('\n❌ FALHA NA CONFIGURAÇÃO DO USUÁRIO')
  }
  
  await prisma.$disconnect()
}

if (require.main === module) {
  main()
}

export { verifyProductionUser, testLoginCredentials }