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
    icon: <MessageSquare className="h-8 w-8" />,
    href: "/dashboard/chat",
    badge: "Popular",
    badgeVariant: "default" as const,
    preview: "gradient"
  },
  {
    id: "image-generation",
    title: "Geração de Imagens",
    description: "Crie imagens incríveis com DALL-E 3 e outros modelos",
    icon: <Image className="h-8 w-8" />,
    href: "/dashboard/images",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "video-transcription",
    title: "Transcrição de Vídeo",
    description: "Transcreva vídeos e gere legendas automaticamente",
    icon: <Video className="h-8 w-8" />,
    href: "/dashboard/transcribe",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "document-analysis",
    title: "Análise de Documentos",
    description: "Analise PDFs e documentos com IA",
    icon: <FileText className="h-8 w-8" />,
    href: "/dashboard/documents",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  },
  {
    id: "video-generation",
    title: "Gerar Vídeo com Base em Imagem",
    description: "Gere vídeos com base em uma imagem",
    icon: <Video className="h-8 w-8" />,
    href: "/dashboard/video-generation",
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    disabled: true
  }
]

export function FeatureGrid() {
  const router = useRouter()

  const handleToolClick = (href: string) => {
    router.push(href)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {tools.map((tool, index) => (
        <div key={tool.id} className="flex-shrink-0 w-80">
          <ToolCard
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            badge={tool.badge}
            badgeVariant={tool.badgeVariant}
            onClick={() => handleToolClick(tool.href)}
            disabled={tool.disabled}
            preview={tool.preview}
          />
        </div>
      ))}
    </div>
  )
}