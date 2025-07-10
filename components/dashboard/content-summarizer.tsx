"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Loader2,
  Copy,
  Check,
  FileText,
  Clock,
  Target,
  Zap,
  Upload
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ContentSummarizerProps {
  userPlan: string
}

interface SummaryResult {
  id: string
  type: string
  content: string
  originalLength: number
  summaryLength: number
  timestamp: Date
}

const summaryTypes = [
  {
    id: 'bullet-points',
    name: 'Bullet Points',
    description: 'Pontos principais em lista',
    icon: Target,
    prompt: 'Crie um resumo em bullet points dos pontos principais:'
  },
  {
    id: 'executive-summary',
    name: 'Resumo Executivo',
    description: 'Resumo profissional e conciso',
    icon: FileText,
    prompt: 'Crie um resumo executivo profissional:'
  },
  {
    id: 'key-insights',
    name: 'Insights Principais',
    description: 'Principais insights e conclusões',
    icon: Zap,
    prompt: 'Extraia os principais insights e conclusões:'
  },
  {
    id: 'action-items',
    name: 'Itens de Ação',
    description: 'Ações práticas extraídas do conteúdo',
    icon: Clock,
    prompt: 'Identifique os itens de ação e próximos passos:'
  }
]

const lengthOptions = [
  { value: 'very-short', label: 'Muito Curto (2-3 frases)' },
  { value: 'short', label: 'Curto (1 parágrafo)' },
  { value: 'medium', label: 'Médio (2-3 parágrafos)' },
  { value: 'detailed', label: 'Detalhado (4+ parágrafos)' }
]

const languageOptions = [
  { value: 'same', label: 'Mesmo idioma do original' },
  { value: 'portuguese', label: 'Português' },
  { value: 'english', label: 'Inglês' },
  { value: 'spanish', label: 'Espanhol' }
]

export function ContentSummarizer({ userPlan }: ContentSummarizerProps) {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState(summaryTypes[0])
  const [length, setLength] = useState('medium')
  const [language, setLanguage] = useState('same')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<SummaryResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setContent(text)
          toast({
            title: "Arquivo carregado!",
            description: `${file.name} foi carregado com sucesso`
          })
        }
        reader.readAsText(file)
      } else {
        toast({
          title: "Formato não suportado",
          description: "Apenas arquivos .txt são suportados no momento",
          variant: "destructive"
        })
      }
    }
  }

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Adicione o conteúdo que deseja resumir",
        variant: "destructive"
      })
      return
    }

    if (content.trim().length < 100) {
      toast({
        title: "Conteúdo muito curto",
        description: "Adicione pelo menos 100 caracteres para um resumo eficaz",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const languageInstruction = language === 'same' 
        ? 'Responda no mesmo idioma do conteúdo original'
        : `Responda em ${language === 'portuguese' ? 'português' : language === 'english' ? 'inglês' : 'espanhol'}`

      const lengthInstruction = {
        'very-short': 'Seja extremamente conciso (2-3 frases)',
        'short': 'Seja conciso (1 parágrafo)',
        'medium': 'Use tamanho médio (2-3 parágrafos)',
        'detailed': 'Seja detalhado (4+ parágrafos)'
      }[length]

      const prompt = `${selectedType.prompt}

CONTEÚDO:
${content}

INSTRUÇÕES:
- ${languageInstruction}
- ${lengthInstruction}
- ${selectedType.id === 'bullet-points' ? 'Use bullet points (•) para organizar as informações' : ''}
- ${selectedType.id === 'executive-summary' ? 'Mantenha tom profissional e objetivo' : ''}
- ${selectedType.id === 'key-insights' ? 'Foque nos insights mais valiosos e surpreendentes' : ''}
- ${selectedType.id === 'action-items' ? 'Liste ações específicas e práticas que podem ser implementadas' : ''}
- Mantenha a essência e informações mais importantes
- Use linguagem clara e objetiva`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-4o-mini' // Free model for summarization
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar resumo')
      }

      const data = await response.json()
      const newResult: SummaryResult = {
        id: Date.now().toString(),
        type: selectedType.name,
        content: data.content,
        originalLength: content.length,
        summaryLength: data.content.length,
        timestamp: new Date()
      }

      setResults(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 results
      
      toast({
        title: "Resumo Criado!",
        description: `${selectedType.name} gerado com sucesso`
      })
    } catch (error) {
      console.error('Error generating summary:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar resumo",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copiado!",
        description: "Resumo copiado para a área de transferência"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar texto",
        variant: "destructive"
      })
    }
  }

  const compressionRatio = (original: number, summary: number) => {
    return Math.round((1 - summary / original) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          Resumidor de Conteúdo
        </h2>
        <p className="text-muted-foreground">
          Resuma textos longos em formatos úteis e concisos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo para Resumir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Upload de Arquivo (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload de um arquivo .txt
                  </p>
                </label>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Conteúdo de Texto *
              </label>
              <Textarea
                placeholder="Cole aqui o texto que deseja resumir (artigo, documento, transcrição, etc.)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {content.length} caracteres
              </p>
            </div>

            {/* Summary Type */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tipo de Resumo</label>
              <div className="grid grid-cols-2 gap-2">
                {summaryTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      variant={selectedType.id === type.id ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setSelectedType(type)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs text-center">{type.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tamanho</label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Idioma</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleSummarize} 
              disabled={isProcessing || !content.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Resumo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resumos Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.slice(0, 3).map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.type}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {compressionRatio(result.originalLength, result.summaryLength)}% menor
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(result.content, result.id)}
                      >
                        {copiedId === result.id ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedId === result.id ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">{result.content}</pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {result.originalLength} → {result.summaryLength} caracteres
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Adicione conteúdo e gere seu resumo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}