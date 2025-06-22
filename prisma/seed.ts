import { PrismaClient, PromptCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create AI Models
  const models = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.0000005, // $0.50 per 1M tokens
      costPerOutputToken: 0.0000015, // $1.50 per 1M tokens
      maxContextLength: 4096,
      planRequired: 'FREE' as const
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.00003, // $30 per 1M tokens
      costPerOutputToken: 0.00006, // $60 per 1M tokens
      maxContextLength: 8192,
      planRequired: 'PRO' as const
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.00001, // $10 per 1M tokens
      costPerOutputToken: 0.00003, // $30 per 1M tokens
      maxContextLength: 128000,
      planRequired: 'PRO' as const
    }
  ]

  for (const model of models) {
    await prisma.aIModel.upsert({
      where: { id: model.id },
      update: model,
      create: model
    })
  }

  console.log('✅ AI Models created')

  // Create Plan Limits
  const planLimits = [
    {
      planType: 'FREE' as const,
      dailyMessagesLimit: 10,
      monthlyTokensLimit: 100000, // 100k tokens/month
      modelsAllowed: ['gpt-3.5-turbo'],
      featuresEnabled: ['chat']
    },
    {
      planType: 'PRO' as const,
      dailyMessagesLimit: 500,
      monthlyTokensLimit: 5000000, // 5M tokens/month
      modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      featuresEnabled: ['chat', 'voice', 'transcription', 'templates']
    },
    {
      planType: 'ENTERPRISE' as const,
      dailyMessagesLimit: null, // Unlimited
      monthlyTokensLimit: null, // Unlimited
      modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      featuresEnabled: ['chat', 'voice', 'transcription', 'templates', 'api_access', 'priority_support']
    }
  ]

  for (const limit of planLimits) {
    await prisma.planLimit.upsert({
      where: {
        planType: limit.planType
      },
      update: limit,
      create: limit
    })
  }

  console.log('✅ Plan limits created')

  // Create a test user (optional)
  const testUserEmail = 'test@example.com'
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('test123', 12)
    await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        passwordHash,
        planType: 'FREE',
        profession: 'Developer',
        organization: 'Test Org'
      }
    })
    console.log('✅ Test user created (test@example.com / test123)')
  }

  // Seed templates
  const templates: {
    name: string
    description: string
    category: PromptCategory
    templateContent: string
    variables: string[]
    isPublic: boolean
  }[] = [
    {
      name: "Email Marketing",
      description: "Template para criar campanhas de email marketing eficazes",
      category: "MARKETING",
      templateContent: `Crie um email marketing para {produto} direcionado a {publico_alvo}. 

O email deve:
- Ter um assunto chamativo
- Destacar os principais benefícios do {produto}
- Incluir uma call-to-action clara
- Tom de voz: {tom_voz}

Inclua também sugestões de personalização para aumentar a taxa de abertura.`,
      variables: ["produto", "publico_alvo", "tom_voz"],
      isPublic: true
    },
    {
      name: "Análise de Código",
      description: "Template para revisão e análise de código",
      category: "ENGENHARIA", 
      templateContent: `Analise o seguinte código e forneça feedback detalhado:

\`\`\`{linguagem}
{codigo}
\`\`\`

Por favor, analise:
1. Qualidade do código e boas práticas
2. Possíveis bugs ou problemas
3. Sugestões de melhoria
4. Performance e otimizações
5. Legibilidade e manutenibilidade

Seja específico e forneça exemplos de como melhorar.`,
      variables: ["linguagem", "codigo"],
      isPublic: true
    },
    {
      name: "Proposta Comercial",
      description: "Template para criar propostas comerciais profissionais",
      category: "VENDAS",
      templateContent: `Crie uma proposta comercial profissional para {empresa_cliente} oferecendo {produto_servico}.

Detalhes do cliente:
- Empresa: {empresa_cliente}
- Segmento: {segmento}
- Principais dores: {dores}

Nossa solução:
- Produto/Serviço: {produto_servico}
- Valor: {valor}
- Prazo de entrega: {prazo}

A proposta deve incluir:
1. Resumo executivo
2. Entendimento do problema
3. Nossa solução
4. Benefícios e ROI
5. Investimento
6. Próximos passos`,
      variables: ["empresa_cliente", "produto_servico", "segmento", "dores", "valor", "prazo"],
      isPublic: true
    },
    {
      name: "Job Description",
      description: "Template para criar descrições de vagas atrativas",
      category: "RECURSOS_HUMANOS",
      templateContent: `Crie uma descrição de vaga completa para a posição de {cargo} na {empresa}.

Informações da empresa:
- Nome: {empresa}
- Setor: {setor}
- Cultura: {cultura}

Detalhes da vaga:
- Cargo: {cargo}
- Nível: {nivel}
- Modalidade: {modalidade}
- Localização: {localizacao}

A descrição deve incluir:
1. Sobre a empresa
2. Responsabilidades principais
3. Requisitos obrigatórios
4. Requisitos desejáveis
5. Benefícios oferecidos
6. Como se candidatar

Use linguagem inclusiva e atrativa para candidatos.`,
      variables: ["cargo", "empresa", "setor", "cultura", "nivel", "modalidade", "localizacao"],
      isPublic: true
    },
    {
      name: "Briefing de Design",
      description: "Template para criar briefings de projetos de design",
      category: "DESIGN",
      templateContent: `Crie um briefing detalhado para o projeto de design {tipo_projeto}.

Informações do projeto:
- Tipo: {tipo_projeto}
- Cliente: {cliente}
- Objetivo: {objetivo}
- Público-alvo: {publico_alvo}
- Orçamento: {orcamento}
- Prazo: {prazo}

O briefing deve incluir:
1. Contexto e background
2. Objetivos específicos
3. Público-alvo detalhado
4. Requisitos técnicos
5. Referências visuais
6. Entregáveis esperados
7. Cronograma
8. Critérios de sucesso

Seja específico e detalhado para evitar retrabalho.`,
      variables: ["tipo_projeto", "cliente", "objetivo", "publico_alvo", "orcamento", "prazo"],
      isPublic: true
    },
    {
      name: "Conteúdo para Redes Sociais",
      description: "Template para criar posts engajadores para redes sociais",
      category: "CRIADOR_CONTEUDO",
      templateContent: `Crie um post para {rede_social} sobre {topico}.

Detalhes:
- Rede social: {rede_social}
- Tópico: {topico}
- Objetivo: {objetivo}
- Tom de voz: {tom_voz}
- Público-alvo: {publico}

O post deve incluir:
1. Hook inicial cativante
2. Conteúdo de valor
3. Call-to-action
4. Hashtags relevantes (se aplicável)
5. Sugestões de stories complementares

Adapte o formato e linguagem para a rede social específica.`,
      variables: ["rede_social", "topico", "objetivo", "tom_voz", "publico"],
      isPublic: true
    }
  ]

  for (const template of templates) {
    const existing = await prisma.promptTemplate.findFirst({
      where: { name: template.name }
    })
    
    if (!existing) {
      await prisma.promptTemplate.create({
        data: template
      })
    }
  }

  console.log('✅ Templates created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })