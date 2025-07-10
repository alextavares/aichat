"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Video,
  FileText,
  Palette,
  Brain,
  Star,
  Zap,
  Trending
} from 'lucide-react'
import { ImageGenerator } from './image-generator'
import { CopywritingGenerator } from './copywriting-generator'
import { ContentSummarizer } from './content-summarizer'
import { AudioTranscriber } from './audio-transcriber'

// Template categories organized by AI functionality (like InnerAI.com)
const categories = [
  { id: 'all', name: 'Todas Ferramentas', icon: Sparkles },
  { id: 'text', name: 'IA para Texto', icon: FileText, color: 'bg-blue-500' },
  { id: 'images', name: 'IA para Imagens', icon: ImageIcon, color: 'bg-purple-500' },
  { id: 'video', name: 'IA para Vídeo', icon: Video, color: 'bg-pink-500' },
  { id: 'audio', name: 'IA para Áudio', icon: Mic, color: 'bg-green-500' },
  { id: 'assistants', name: 'Assistentes Personalizados', icon: Brain, color: 'bg-orange-500' }
]

// Template data organized by AI functionality type
const templates = [
  // IA para Texto
  {
    id: 'chat-advanced',
    title: 'Chat com IA Avançada',
    description: 'Converse com modelos como GPT-4, Claude e Gemini para qualquer tarefa',
    category: 'text',
    type: 'POPULAR',
    usage: '12.5k',
    rating: 4.9,
    preview: '💬',
    tags: ['GPT-4', 'Claude', 'Conversação'],
    time: 'Instantâneo',
    features: ['Múltiplos modelos', 'Contexto longo', 'Streaming']
  },
  {
    id: 'copywriting',
    title: 'Gerador de Copy',
    description: 'Crie textos persuasivos para vendas, anúncios e marketing',
    category: 'text',
    type: 'PRO',
    usage: '8.3k',
    rating: 4.8,
    preview: '✍️',
    tags: ['Copywriting', 'Marketing', 'Vendas'],
    time: '2 min',
    features: ['Templates prontos', 'Múltiplas variações', 'A/B testing']
  },
  {
    id: 'content-generator',
    title: 'Criador de Conteúdo',
    description: 'Gere artigos, posts e conteúdo para blogs e redes sociais',
    category: 'text',
    type: 'TRENDING',
    usage: '6.7k',
    rating: 4.7,
    preview: '📝',
    tags: ['Blog', 'Social Media', 'SEO'],
    time: '3 min',
    features: ['SEO otimizado', 'Múltiplos formatos', 'Pesquisa automática']
  },
  {
    id: 'translation',
    title: 'Tradutor Avançado',
    description: 'Traduções precisas mantendo contexto e tom original',
    category: 'text',
    type: 'FREE',
    usage: '9.1k',
    rating: 4.6,
    preview: '🌐',
    tags: ['Tradução', 'Idiomas', 'Contexto'],
    time: '30s',
    features: ['50+ idiomas', 'Preserva tom', 'Contexto cultural']
  },

  // IA para Imagens
  {
    id: 'image-generation',
    title: 'Geração de Imagens DALL-E',
    description: 'Crie imagens profissionais usando DALL-E 3 com qualidade HD',
    category: 'images',
    type: 'NEW',
    usage: '4.2k',
    rating: 4.9,
    preview: '🎨',
    tags: ['DALL-E 3', 'HD', 'Profissional'],
    time: '45s',
    features: ['Qualidade HD', 'Múltiplos estilos', 'Prompt otimizado']
  },
  {
    id: 'image-editing',
    title: 'Editor de Imagens IA',
    description: 'Edite imagens com comandos de texto usando IA avançada',
    category: 'images',
    type: 'COMING_SOON',
    usage: '---',
    rating: 0,
    preview: '🖼️',
    tags: ['Edição', 'IA', 'Comandos'],
    time: '1 min',
    features: ['Edição por texto', 'Remoção de objetos', 'Estilo transfer']
  },
  {
    id: 'background-remover',
    title: 'Remoção de Fundo',
    description: 'Remove fundos automaticamente com precisão profissional',
    category: 'images',
    type: 'COMING_SOON',
    usage: '---',
    rating: 0,
    preview: '🔲',
    tags: ['Fundo', 'Transparente', 'Automático'],
    time: '15s',
    features: ['Alta precisão', 'Bordas suaves', 'Batch processing']
  },

  // IA para Vídeo (futuro)
  {
    id: 'video-generation',
    title: 'Geração de Vídeos',
    description: 'Transforme texto em vídeos profissionais com IA',
    category: 'video',
    type: 'COMING_SOON',
    usage: '---',
    rating: 0,
    preview: '🎬',
    tags: ['Vídeo', 'IA', 'Automático'],
    time: '5 min',
    features: ['Texto para vídeo', 'Múltiplos estilos', 'Avatares IA']
  },
  {
    id: 'video-transcription',
    title: 'Transcrição de Vídeo',
    description: 'Transcreva vídeos automaticamente com alta precisão',
    category: 'video',
    type: 'COMING_SOON',
    usage: '---',
    rating: 0,
    preview: '📹',
    tags: ['Transcrição', 'Legendas', 'Automático'],
    time: '2 min',
    features: ['Alta precisão', 'Múltiplos idiomas', 'Timestamps']
  },

  // IA para Áudio
  {
    id: 'audio-transcription',
    title: 'Transcrição de Áudio',
    description: 'Transcreva áudios e vídeos com precisão usando Whisper AI',
    category: 'audio',
    type: 'NEW',
    usage: '1.8k',
    rating: 4.9,
    preview: '🎧',
    tags: ['Whisper', 'Precisão', 'Timestamps'],
    time: '2 min',
    features: ['Alta precisão', 'Múltiplos idiomas', 'Timestamps', 'Legendas']
  },
  {
    id: 'voice-generation',
    title: 'Geração de Voz',
    description: 'Converta texto em áudio natural com vozes realistas',
    category: 'audio',
    type: 'COMING_SOON',
    usage: '---',
    rating: 0,
    preview: '🎙️',
    tags: ['TTS', 'Voz Natural', 'Multilíngue'],
    time: '1 min',
    features: ['Vozes realistas', 'Múltiplos idiomas', 'Controle de emoção']
  },

  // Assistentes Personalizados
  {
    id: 'custom-assistant',
    title: 'Assistente Personalizado',
    description: 'Crie assistentes IA especializados para suas necessidades',
    category: 'assistants',
    type: 'PRO',
    usage: '2.8k',
    rating: 4.7,
    preview: '🤖',
    tags: ['Personalizado', 'Especializado', 'Workflow'],
    time: '10 min',
    features: ['Treinamento customizado', 'Memória persistente', 'Integração API']
  }
]

interface MarketplaceLayoutProps {
  userPlan: string
}

export function MarketplaceLayout({ userPlan }: MarketplaceLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return parseInt(b.usage.replace('k', '000')) - parseInt(a.usage.replace('k', '000'))
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return a.type === 'NEW' ? -1 : 1
      default:
        return 0
    }
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NEW': return 'bg-green-500'
      case 'POPULAR': return 'bg-blue-500'
      case 'TRENDING': return 'bg-purple-500'
      case 'PRO': return 'bg-yellow-500'
      case 'FREE': return 'bg-emerald-500'
      case 'COMING_SOON': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ferramentas de IA
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Acesse todas as funcionalidades de IA organizadas por tipo: texto, imagem, vídeo, áudio e assistentes personalizados
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar ferramentas de IA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Mais Popular</SelectItem>
              <SelectItem value="rating">Melhor Avaliado</SelectItem>
              <SelectItem value="newest">Mais Recente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              {/* Header with preview and type */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl mb-2">{template.preview}</div>
                <Badge 
                  className={`${getTypeColor(template.type)} text-white text-xs`}
                >
                  {template.type}
                </Badge>
              </div>

              {/* Title and Description */}
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {template.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 2}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{template.usage} usos</span>
                  <span>~{template.time}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={() => {
                  if (template.id === 'image-generation') {
                    setActiveTemplate('image-generator')
                  } else if (template.id === 'chat-advanced') {
                    window.location.href = '/dashboard/chat'
                  } else if (template.id === 'copywriting') {
                    setActiveTemplate('copywriting-generator')
                  } else if (template.id === 'content-generator') {
                    setActiveTemplate('content-summarizer')
                  } else if (template.id === 'audio-transcription') {
                    setActiveTemplate('audio-transcriber')
                  } else if (template.type === 'COMING_SOON') {
                    // Show coming soon message
                    console.log('Coming soon:', template.id)
                  } else {
                    // Handle other templates
                    console.log('Template clicked:', template.id)
                  }
                }}
                disabled={template.type === 'COMING_SOON'}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {template.type === 'COMING_SOON' ? 'Em Breve' : 'Usar Ferramenta'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results info */}
      <div className="text-center text-muted-foreground">
        <p>Mostrando {sortedTemplates.length} de {templates.length} ferramentas</p>
      </div>

      {/* Template Modals/Views */}
      {activeTemplate === 'image-generator' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gerador de Imagens IA</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <ImageGenerator userPlan={userPlan} />
            </div>
          </div>
        </div>
      )}

      {activeTemplate === 'copywriting-generator' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gerador de Copywriting</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <CopywritingGenerator userPlan={userPlan} />
            </div>
          </div>
        </div>
      )}

      {activeTemplate === 'content-summarizer' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Resumidor de Conteúdo</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <ContentSummarizer userPlan={userPlan} />
            </div>
          </div>
        </div>
      )}

      {activeTemplate === 'audio-transcriber' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transcritor de Áudio</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <AudioTranscriber userPlan={userPlan} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}