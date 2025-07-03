import { prisma } from '../lib/prisma'

async function fixModelsDatabase() {
  console.log('🔍 Verificando e corrigindo modelos no banco de dados...\n')
  
  try {
    // 1. Verificar modelos existentes no banco
    console.log('1. Verificando modelos existentes no banco...')
    const existingModels = await prisma.aIModel.findMany({
      select: { id: true, name: true, provider: true }
    })
    
    console.log(`✅ Modelos no banco: ${existingModels.length}`)
    if (existingModels.length > 0) {
      existingModels.forEach(model => {
        console.log(`   - ${model.id} (${model.name}) - ${model.provider}`)
      })
    } else {
      console.log('❌ Nenhum modelo encontrado no banco!')
    }
    
    // 2. Listar modelos que a aplicação está tentando usar
    console.log('\n2. Modelos que a aplicação tenta usar:')
    const frontendModels = [
      'mistral-7b', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 
      'gpt-4.1', 'gpt-4o', 'claude-3-opus', 'claude-3-sonnet',
      'claude-4-sonnet', 'gemini-pro', 'sabia-3.1'
    ]
    
    frontendModels.forEach(modelId => {
      const exists = existingModels.some(m => m.id === modelId)
      console.log(`   ${exists ? '✅' : '❌'} ${modelId}`)
    })
    
    // 3. Verificar conversas que falharam
    console.log('\n3. Verificando conversas problemáticas...')
    const conversationsWithNullModel = await prisma.conversation.findMany({
      where: { 
        OR: [
          { modelUsed: null },
          { modelUsed: { notIn: existingModels.map(m => m.id) } }
        ]
      },
      select: { id: true, modelUsed: true, createdAt: true }
    })
    
    console.log(`⚠️  Conversas com modelos inválidos: ${conversationsWithNullModel.length}`)
    
    // 4. Criar modelos básicos necessários
    console.log('\n4. Criando modelos básicos necessários...')
    
    const basicModels = [
      {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        provider: 'OPENROUTER',
        maxContextLength: 8192,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006,
        planRequired: 'FREE'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OPENROUTER',
        maxContextLength: 128000,
        costPerInputToken: 0.0000025,
        costPerOutputToken: 0.00001,
        planRequired: 'PRO'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'OPENROUTER',
        maxContextLength: 200000,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015,
        planRequired: 'PRO'
      },
      {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'OPENROUTER',
        maxContextLength: 200000,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015,
        planRequired: 'PRO'
      },
      {
        id: 'sabia-3.1',
        name: 'Sabiá 3.1',
        provider: 'OPENROUTER',
        maxContextLength: 32768,
        costPerInputToken: 0.000002,
        costPerOutputToken: 0.000008,
        planRequired: 'FREE'
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'OPENROUTER',
        maxContextLength: 1048576,
        costPerInputToken: 0.00000125,
        costPerOutputToken: 0.00001,
        planRequired: 'PRO'
      },
      {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'OPENROUTER',
        maxContextLength: 131072,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015,
        planRequired: 'PRO'
      }
    ]
    
    let createdCount = 0
    for (const model of basicModels) {
      try {
        const existing = await prisma.aIModel.findUnique({
          where: { id: model.id }
        })
        
        if (!existing) {
          await prisma.aIModel.create({
            data: model
          })
          console.log(`✅ Criado: ${model.id}`)
          createdCount++
        } else {
          console.log(`ℹ️  Já existe: ${model.id}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao criar ${model.id}:`, error.message)
      }
    }
    
    console.log(`\n🎉 Criados ${createdCount} novos modelos`)
    
    // 5. Verificar estado final
    console.log('\n5. Estado final do banco...')
    const finalModels = await prisma.aIModel.findMany({
      select: { id: true, name: true, provider: true }
    })
    
    console.log(`✅ Total de modelos: ${finalModels.length}`)
    
    // 6. Corrigir conversas problemáticas
    console.log('\n6. Corrigindo conversas problemáticas...')
    
    if (conversationsWithNullModel.length > 0) {
      const defaultModel = 'mistral-7b' // Usar modelo padrão
      
      const updateResult = await prisma.conversation.updateMany({
        where: { 
          OR: [
            { modelUsed: null },
            { modelUsed: { notIn: finalModels.map(m => m.id) } }
          ]
        },
        data: { modelUsed: defaultModel }
      })
      
      console.log(`✅ Corrigidas ${updateResult.count} conversas com modelo padrão`)
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!')
    console.log('💡 Agora o chat deve funcionar sem erros de foreign key')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  fixModelsDatabase()
}

export { fixModelsDatabase }