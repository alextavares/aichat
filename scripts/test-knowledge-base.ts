import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testKnowledgeBase() {
  try {
    console.log('🧪 Testando Knowledge Base...\n')

    // 1. Buscar um usuário de teste
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'test'
        }
      }
    })

    if (!user) {
      console.log('❌ Nenhum usuário de teste encontrado')
      console.log('💡 Crie um usuário de teste primeiro')
      return
    }

    console.log(`✅ Usuário encontrado: ${user.email}`)

    // 2. Criar itens de teste na Knowledge Base
    console.log('\n📝 Criando itens de teste...')

    const knowledgeItems = [
      {
        userId: user.id,
        name: 'Manual do Usuário',
        description: 'Documentação completa do sistema',
        type: 'DOCUMENT' as const,
        content: 'Este é o conteúdo do manual do usuário...',
        mimeType: 'text/plain',
        fileSize: 1024,
      },
      {
        userId: user.id,
        name: 'FAQ - Perguntas Frequentes',
        description: 'Respostas para as dúvidas mais comuns',
        type: 'FAQ' as const,
        content: 'P: Como fazer login?\nR: Use seu email e senha cadastrados.\n\nP: Como adicionar documentos?\nR: Acesse a seção Knowledge Base.',
      },
      {
        userId: user.id,
        name: 'Políticas da Empresa',
        description: 'Regras e políticas internas',
        type: 'TEXT' as const,
        content: 'Políticas de privacidade e termos de uso...',
      },
    ]

    for (const item of knowledgeItems) {
      const created = await prisma.knowledgeBase.create({
        data: item
      })
      console.log(`✅ Criado: ${created.name} (${created.type})`)
    }

    // 3. Listar itens ativos
    console.log('\n📋 Listando itens ativos...')
    const activeItems = await prisma.knowledgeBase.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true
      }
    })

    console.log(`Total de itens ativos: ${activeItems.length}`)
    activeItems.forEach(item => {
      console.log(`- ${item.name} (${item.type}) - ${item.createdAt.toLocaleDateString()}`)
    })

    // 4. Verificar limites por plano
    console.log('\n🎯 Verificando limites do plano...')
    const limits = {
      FREE: 5,
      PRO: 50,
      ENTERPRISE: -1
    }

    const userLimit = limits[user.planType as keyof typeof limits]
    console.log(`Plano do usuário: ${user.planType}`)
    console.log(`Limite de documentos: ${userLimit === -1 ? 'Ilimitado' : userLimit}`)
    console.log(`Documentos atuais: ${activeItems.length}`)
    
    if (userLimit !== -1 && activeItems.length >= userLimit) {
      console.log('⚠️  Limite atingido!')
    } else {
      console.log('✅ Dentro do limite')
    }

    // 5. Testar soft delete
    if (activeItems.length > 0) {
      console.log('\n🗑️  Testando soft delete...')
      const itemToDelete = activeItems[0]
      
      await prisma.knowledgeBase.update({
        where: { id: itemToDelete.id },
        data: { isActive: false }
      })
      
      console.log(`✅ Item "${itemToDelete.name}" marcado como inativo`)
      
      const remainingActive = await prisma.knowledgeBase.count({
        where: {
          userId: user.id,
          isActive: true
        }
      })
      
      console.log(`Itens ativos restantes: ${remainingActive}`)
    }

    console.log('\n✅ Teste concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testKnowledgeBase()
  .catch(console.error)