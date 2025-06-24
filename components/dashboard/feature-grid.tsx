"use client"

import { useRouter } from "next/navigation"
import { ToolCard } from "./tool-card"
import { 
  MessageSquare, 
  Image, 
  Video, 
  FileText, 
  Code, 
  Mic, 
  PenTool,
  Sparkles,
  BookOpen,
  Zap,
  Database,
  Globe
} from "lucide-react"

const tools = [
  {
    id: "chat",
    title: "Chat com IA",
    description: "Converse com modelos avançados de IA como GPT-4, Claude e outros",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/dashboard/chat",
    badge: "Popular",
    badgeVariant: "default" as const,
    preview: "gradient"
  },
  {
    id: "image-generation",
    title: "Geração de Imagens",
    description: "Crie imagens incríveis com DALL-E 3 e outros modelos",
    icon: <Image className="h-5 w-5" />,
    href: "/dashboard/images",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "video-transcription",
    title: "Transcrição de Vídeo",
    description: "Transcreva vídeos e gere legendas automaticamente",
    icon: <Video className="h-5 w-5" />,
    href: "/dashboard/transcribe",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "document-analysis",
    title: "Análise de Documentos",
    description: "Analise PDFs e documentos com IA",
    icon: <FileText className="h-5 w-5" />,
    href: "/dashboard/documents",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "code-assistant",
    title: "Assistente de Código",
    description: "Ajuda para programação e desenvolvimento",
    icon: <Code className="h-5 w-5" />,
    href: "/dashboard/code",
    badge: "Beta",
    badgeVariant: "outline" as const
  },
  {
    id: "voice-synthesis",
    title: "Síntese de Voz",
    description: "Converta texto em fala natural",
    icon: <Mic className="h-5 w-5" />,
    href: "/dashboard/voice",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "writing-assistant",
    title: "Assistente de Escrita",
    description: "Melhore seus textos e crie conteúdo profissional",
    icon: <PenTool className="h-5 w-5" />,
    href: "/dashboard/writing"
  },
  {
    id: "creative-tools",
    title: "Ferramentas Criativas",
    description: "Templates e assistentes para projetos criativos",
    icon: <Sparkles className="h-5 w-5" />,
    href: "/dashboard/creative"
  },
  {
    id: "knowledge-base",
    title: "Base de Conhecimento",
    description: "Armazene e consulte seus documentos com IA",
    icon: <Database className="h-5 w-5" />,
    href: "/dashboard/knowledge",
    badge: "Novo",
    badgeVariant: "default" as const
  },
  {
    id: "learning-assistant",
    title: "Assistente de Estudos",
    description: "Aprenda qualquer assunto com ajuda da IA",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/dashboard/learn"
  },
  {
    id: "automation",
    title: "Automação",
    description: "Crie workflows automatizados com IA",
    icon: <Zap className="h-5 w-5" />,
    href: "/dashboard/automation",
    badge: "Pro",
    badgeVariant: "destructive" as const
  },
  {
    id: "web-search",
    title: "Pesquisa Web",
    description: "Busque informações atualizadas na internet",
    icon: <Globe className="h-5 w-5" />,
    href: "/dashboard/search"
  }
]

export function FeatureGrid() {
  const router = useRouter()

  const handleToolClick = (href: string) => {
    router.push(href)
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-animation">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          title={tool.title}
          description={tool.description}
          icon={tool.icon}
          badge={tool.badge}
          badgeVariant={tool.badgeVariant}
          onClick={() => handleToolClick(tool.href)}
          disabled={tool.disabled}
          preview={tool.preview}
        />
      ))}
    </div>
  )
}