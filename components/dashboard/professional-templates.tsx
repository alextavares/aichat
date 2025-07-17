"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Megaphone, 
  HelpCircle, 
  BarChart3, 
  FileIcon,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

const professionalTemplates = [
  {
    id: "resumo-executivo",
    title: "Resumo Executivo",
    description: "Crie um resumo conciso e impactante que destaque os principais pontos e recomendações",
    icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
    prompt: "Preciso de um resumo executivo profissional sobre",
    category: "Trabalho"
  },
  {
    id: "comunicado-imprensa",
    title: "Comunicado de Imprensa",
    description: "Elabore um comunicado de imprensa profissional para divulgar notícias importantes",
    icon: <Megaphone className="h-8 w-8 text-green-500" />,
    prompt: "Crie um comunicado de imprensa profissional sobre",
    category: "Trabalho"
  },
  {
    id: "artigo-suporte",
    title: "Artigo de Suporte",
    description: "Desenvolva artigos de suporte detalhados para orientar os usuários",
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    prompt: "Escreva um artigo de suporte completo sobre como",
    category: "Trabalho"
  },
  {
    id: "faqs",
    title: "Perguntas Frequentes (FAQs)",
    description: "Compile uma lista de perguntas frequentes e suas respostas detalhadas",
    icon: <HelpCircle className="h-8 w-8 text-orange-500" />,
    prompt: "Crie uma seção de perguntas frequentes (FAQ) sobre",
    category: "Trabalho"
  },
  {
    id: "resumo-documento",
    title: "Resumo",
    description: "Resuma de forma eficiente conteúdo extenso mantendo os pontos principais",
    icon: <FileIcon className="h-8 w-8 text-indigo-500" />,
    prompt: "Faça um resumo detalhado e organizado sobre",
    category: "Trabalho"
  }
]

const professionalCategories = [
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "juridico", name: "Jurídico", icon: "⚖️" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "operacoes", name: "Operações", icon: "⚙️" },
  { id: "financas", name: "Finanças", icon: "💰" },
  { id: "vendas", name: "Vendas", icon: "📈" },
  { id: "engenharia", name: "Engenharia", icon: "🔧" },
  { id: "conteudo", name: "Criador de Conteúdo", icon: "📝" },
  { id: "rh", name: "Recursos Humanos", icon: "👥" },
  { id: "outro", name: "Outro...", icon: "📋" }
]

interface ProfessionalTemplatesProps {
  className?: string
}

export function ProfessionalTemplates({ className }: ProfessionalTemplatesProps) {
  const router = useRouter()

  const handleTemplateClick = (template: typeof professionalTemplates[0]) => {
    // Redireciona para o chat com o prompt pré-preenchido
    const encodedPrompt = encodeURIComponent(template.prompt)
    router.push(`/dashboard/chat?prompt=${encodedPrompt}`)
  }

  const handleCategoryClick = (category: typeof professionalCategories[0]) => {
    // Redireciona para o chat com contexto da categoria
    const prompt = `Como especialista em ${category.name.toLowerCase()}, me ajude com:`
    const encodedPrompt = encodeURIComponent(prompt)
    router.push(`/dashboard/chat?prompt=${encodedPrompt}`)
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Categorias Profissionais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Conte para gente de qual time você faz parte...</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {professionalCategories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors text-white"
              onClick={() => handleCategoryClick(category)}
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Profissionais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Templates Profissionais</h3>
            <p className="text-sm text-gray-400">
              Modelos prontos para acelerar seu trabalho
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex bg-purple-600 text-white">
            Trabalho
          </Badge>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {professionalTemplates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
              onClick={() => handleTemplateClick(template)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                    {template.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm leading-tight text-white">
                      {template.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Botão de Chat Personalizado */}
      <div className="flex justify-center">
        <Button
          onClick={() => router.push('/dashboard/chat')}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Iniciar Chat Personalizado</span>
        </Button>
      </div>
    </div>
  )
}