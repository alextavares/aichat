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

// Template categories aligned with personas
const categories = [
  { id: 'all', name: 'Todos', icon: Sparkles },
  { id: 'marketing', name: 'Marketing', icon: Trending, color: 'bg-blue-500' },
  { id: 'content', name: 'Criação de Conteúdo', icon: FileText, color: 'bg-purple-500' },
  { id: 'design', name: 'Design & Arte', icon: Palette, color: 'bg-pink-500' },
  { id: 'productivity', name: 'Produtividade', icon: Zap, color: 'bg-green-500' },
  { id: 'ai-tools', name: 'Ferramentas IA', icon: Brain, color: 'bg-orange-500' },
  { id: 'media', name: 'Áudio & Vídeo', icon: Video, color: 'bg-red-500' }
]

// Template data focusing on Carlos Marketing and Ana Criadora personas
const templates = [
  {
    id: 'image-generation',
    title: 'Geração de Imagens',
    description: 'Crie imagens profissionais para posts, anúncios e apresentações',
    category: 'design',
    type: 'NEW',
    usage: '2.1k',
    rating: 4.8,
    preview: '🎨',
    tags: ['DALL-E', 'Marketing', 'Social Media'],
    time: '2 min',
    persona: ['Carlos Marketing', 'Ana Criadora']
  },
  {
    id: 'social-media-posts',
    title: 'Posts para Redes Sociais',
    description: 'Templates otimizados para Instagram, Facebook, LinkedIn e Twitter',
    category: 'marketing',
    type: 'POPULAR',
    usage: '5.8k',
    rating: 4.9,
    preview: '📱',
    tags: ['Instagram', 'Facebook', 'Copywriting'],
    time: '1 min',
    persona: ['Carlos Marketing', 'Ana Criadora']
  },
  {
    id: 'video-scripts',
    title: 'Roteiros para Vídeos',
    description: 'Scripts envolventes para YouTube, TikTok e Reels',
    category: 'content',
    type: 'TRENDING',
    usage: '3.2k',
    rating: 4.7,
    preview: '🎬',
    tags: ['YouTube', 'TikTok', 'Scripts'],
    time: '3 min',
    persona: ['Ana Criadora']
  },
  {
    id: 'email-campaigns',
    title: 'Campanhas de Email',
    description: 'Templates de email marketing com alta taxa de conversão',
    category: 'marketing',
    type: 'PRO',
    usage: '1.9k',
    rating: 4.6,
    preview: '📧',
    tags: ['Email Marketing', 'Conversão', 'CRM'],
    time: '4 min',
    persona: ['Carlos Marketing']
  },
  {
    id: 'content-ideas',
    title: 'Gerador de Ideias',
    description: 'Ideias criativas baseadas em trends e seu nicho',
    category: 'content',
    type: 'AI',
    usage: '4.1k',
    rating: 4.8,
    preview: '💡',
    tags: ['Brainstorming', 'Trends', 'Criatividade'],
    time: '1 min',
    persona: ['Ana Criadora', 'Carlos Marketing']
  },
  {
    id: 'presentation-maker',
    title: 'Criador de Apresentações',
    description: 'Slides profissionais para reuniões e pitches',
    category: 'productivity',
    type: 'BUSINESS',
    usage: '2.7k',
    rating: 4.5,
    preview: '📊',
    tags: ['PowerPoint', 'Business', 'Profissional'],
    time: '5 min',
    persona: ['Carlos Marketing']
  },
  {
    id: 'hashtag-generator',
    title: 'Gerador de Hashtags',
    description: 'Hashtags estratégicas para maximizar alcance',
    category: 'marketing',
    type: 'FREE',
    usage: '7.3k',
    rating: 4.4,
    preview: '#️⃣',
    tags: ['Hashtags', 'Alcance', 'Engagement'],
    time: '30s',
    persona: ['Ana Criadora']
  },
  {
    id: 'voice-generation',
    title: 'Geração de Voz',
    description: 'Converta texto em áudio natural para podcasts e vídeos',
    category: 'media',
    type: 'NEW',
    usage: '1.2k',
    rating: 4.9,
    preview: '🎙️',
    tags: ['TTS', 'Podcast', 'Áudio'],
    time: '2 min',
    persona: ['Ana Criadora']
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
      case 'AI': return 'bg-orange-500'
      case 'BUSINESS': return 'bg-gray-500'
      case 'FREE': return 'bg-emerald-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Central de Ferramentas IA
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Acelere sua produtividade com templates e ferramentas de IA otimizadas para marketing e criação de conteúdo
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar templates e ferramentas..."
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
                  } else {
                    // Handle other templates
                    console.log('Template clicked:', template.id)
                  }
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Usar Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results info */}
      <div className="text-center text-muted-foreground">
        <p>Mostrando {sortedTemplates.length} de {templates.length} templates</p>
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
    </div>
  )
}