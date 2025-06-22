"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

import TemplateCategories from '@/components/templates/TemplateCategories'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateSearch from '@/components/templates/TemplateSearch'
import { CreateTemplateDialog } from '@/components/templates/CreateTemplateDialog'
import { TemplatePreviewDialog } from '@/components/templates/TemplatePreviewDialog'

interface Template {
  id: string
  name: string
  description: string
  category: string
  templateContent: string
  icon?: string
  gradient?: string
  tags?: string[]
  isPublic: boolean
  isFeatured: boolean
  usageCount: number
  createdBy?: string
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

// Mock data for templates with improved UI
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Executive Summary',
    description: 'Craft a concise, impactful summary that highlights the main points and objectives of your document',
    category: 'work',
    templateContent: 'Crie um resumo executivo profissional para [TÓPICO] que inclua:\n\n1. Visão geral do projeto/documento\n2. Principais pontos e descobertas\n3. Recomendações estratégicas\n4. Próximos passos\n\nTom: Profissional e conciso\nTamanho: Máximo 2 parágrafos',
    icon: '📊',
    gradient: 'blue',
    tags: ['negócios', 'relatórios', 'executivo'],
    isPublic: true,
    isFeatured: true,
    usageCount: 15234,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Press Release',
    description: 'Draft a professional press release to announce important news or events, effectively reaching media outlets',
    category: 'marketing',
    templateContent: 'Escreva um press release profissional sobre [EVENTO/NOTÍCIA] incluindo:\n\n1. Título chamativo\n2. Lead com as informações essenciais (O quê, Quem, Quando, Onde, Por quê)\n3. Corpo com detalhes e contexto\n4. Citação de porta-voz\n5. Informações sobre a empresa\n6. Contato para imprensa\n\nTom: Jornalístico e informativo',
    icon: '📰',
    gradient: 'purple',
    tags: ['imprensa', 'comunicação', 'PR'],
    isPublic: true,
    isFeatured: true,
    usageCount: 8942,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'LinkedIn Post',
    description: 'Craft compelling LinkedIn posts from text prompts or files, enhancing your network reach',
    category: 'social',
    templateContent: 'Crie um post para LinkedIn sobre [TÓPICO] que:\n\n1. Comece com um gancho envolvente\n2. Conte uma história ou compartilhe insights valiosos\n3. Inclua dados ou estatísticas relevantes\n4. Termine com uma pergunta para engajar a audiência\n5. Use hashtags relevantes\n\nTom: Profissional mas pessoal\nTamanho: 150-200 palavras',
    icon: '💼',
    gradient: 'indigo',
    tags: ['social media', 'linkedin', 'networking'],
    isPublic: true,
    isFeatured: false,
    usageCount: 21456,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Email Campaign',
    description: 'Design effective email campaigns that engage your audience and drive conversions',
    category: 'email',
    templateContent: 'Crie uma campanha de email para [OBJETIVO] com:\n\n1. Linha de assunto atraente\n2. Prévia do email\n3. Saudação personalizada\n4. Corpo do email com storytelling\n5. CTA claro e destacado\n6. P.S. com oferta adicional\n\nTom: Conversacional e persuasivo\nObjetivo: [CONVERSÃO DESEJADA]',
    icon: '📧',
    gradient: 'pink',
    tags: ['email', 'marketing', 'conversão'],
    isPublic: true,
    isFeatured: true,
    usageCount: 13789,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Blog Article Outline',
    description: 'Create a structured outline for your blog posts to ensure comprehensive coverage of your topic',
    category: 'writing',
    templateContent: 'Desenvolva um outline completo para um artigo de blog sobre [TÓPICO]:\n\n1. Título SEO-friendly\n2. Introdução com gancho\n3. 3-5 subtópicos principais\n4. Pontos-chave para cada subtópico\n5. Conclusão com CTA\n6. Meta descrição\n\nPalavras-chave: [KEYWORDS]\nTamanho alvo: [PALAVRAS]',
    icon: '✍️',
    gradient: 'green',
    tags: ['blog', 'conteúdo', 'SEO'],
    isPublic: true,
    isFeatured: false,
    usageCount: 17652,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Product Description',
    description: 'Write compelling product descriptions that highlight features and benefits to boost sales',
    category: 'business',
    templateContent: 'Escreva uma descrição de produto para [PRODUTO] que:\n\n1. Destaque os principais benefícios\n2. Liste características técnicas\n3. Resolva objeções comuns\n4. Inclua prova social\n5. Termine com CTA urgente\n\nTom: Persuasivo e informativo\nPúblico-alvo: [PERSONA]',
    icon: '🛍️',
    gradient: 'orange',
    tags: ['e-commerce', 'vendas', 'produto'],
    isPublic: true,
    isFeatured: true,
    usageCount: 11234,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(mockTemplates)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort by featured and usage count
    filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return b.usageCount - a.usageCount
    })

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  const handleFavorite = async (templateId: string) => {
    try {
      // Toggle favorite in local state
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      ))

      // API call would go here
      toast({
        title: "Favorito atualizado",
        description: "Template adicionado aos favoritos",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favorito",
        variant: "destructive",
      })
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    try {
      // Track usage
      await fetch(`/api/templates/${templateId}/use`, { method: 'POST' })
      
      // Navigate to chat with template
      router.push(`/dashboard/chat?template=${templateId}`)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível usar o template",
        variant: "destructive",
      })
    }
  }

  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setShowPreviewDialog(true)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Use templates prontos para acelerar sua produtividade ou crie seus próprios
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="gradient-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <TemplateSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar templates por nome, descrição ou tags..."
        />
      </div>

      {/* Category Filters */}
      <TemplateCategories
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tente ajustar seus filtros ou crie um novo template personalizado
          </p>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="mt-4"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onFavorite={handleFavorite}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateTemplateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false)
            // Refetch templates
          }}
        />
      )}

      {selectedTemplate && (
        <TemplatePreviewDialog
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          template={selectedTemplate}
          onUse={() => handleUseTemplate(selectedTemplate.id)}
        />
      )}
    </div>
  )
}