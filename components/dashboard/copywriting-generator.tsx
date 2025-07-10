"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CopywritingGeneratorProps {
  userPlan: string
}

interface CopyResult {
  id: string
  type: string
  content: string
  timestamp: Date
}

const copyTypes = [
  {
    id: 'sales-page',
    name: 'Página de Vendas',
    description: 'Headlines e copy persuasivo para landing pages',
    icon: Target,
    color: 'bg-red-500',
    prompt: 'Crie uma página de vendas persuasiva para:'
  },
  {
    id: 'social-media',
    name: 'Posts para Redes Sociais',
    description: 'Conteúdo engajante para Instagram, Facebook, LinkedIn',
    icon: TrendingUp,
    color: 'bg-blue-500',
    prompt: 'Crie posts para redes sociais sobre:'
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Emails que convertem e engajam',
    icon: Zap,
    color: 'bg-green-500',
    prompt: 'Crie um email marketing para:'
  },
  {
    id: 'ads-copy',
    name: 'Anúncios Pagos',
    description: 'Copy para Google Ads, Facebook Ads, etc.',
    icon: Sparkles,
    color: 'bg-purple-500',
    prompt: 'Crie copy para anúncios sobre:'
  }
]

const toneOptions = [
  { value: 'professional', label: 'Profissional' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasivo' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'friendly', label: 'Amigável' },
  { value: 'authoritative', label: 'Autoritativo' }
]

const lengthOptions = [
  { value: 'short', label: 'Curto (1-2 parágrafos)' },
  { value: 'medium', label: 'Médio (3-5 parágrafos)' },
  { value: 'long', label: 'Longo (6+ parágrafos)' }
]

export function CopywritingGenerator({ userPlan }: CopywritingGeneratorProps) {
  const [selectedType, setSelectedType] = useState(copyTypes[0])
  const [product, setProduct] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('persuasive')
  const [length, setLength] = useState('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<CopyResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast({
        title: "Erro",
        description: "Descreva seu produto ou serviço",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const prompt = `${selectedType.prompt} ${product}

Público-alvo: ${targetAudience || 'Geral'}
Tom: ${tone}
Tamanho: ${length}

Crie um copy ${selectedType.name.toLowerCase()} que seja:
- Persuasivo e envolvente
- Focado em benefícios (não apenas recursos)
- Com call-to-action claro
- Otimizado para conversão
- Adequado ao tom e público especificado

${selectedType.id === 'sales-page' ? 'Inclua: headline principal, subheadlines, bullet points de benefícios, prova social, call-to-action' : ''}
${selectedType.id === 'social-media' ? 'Inclua: hook inicial, conteúdo principal, hashtags relevantes, call-to-action' : ''}
${selectedType.id === 'email-marketing' ? 'Inclua: assunto atrativo, abertura personalizada, corpo do email, call-to-action' : ''}
${selectedType.id === 'ads-copy' ? 'Inclua: headline, descrição, call-to-action, variações para A/B testing' : ''}`

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
          model: 'gpt-4o-mini' // Free model for copywriting
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar copy')
      }

      const data = await response.json()
      const newResult: CopyResult = {
        id: Date.now().toString(),
        type: selectedType.name,
        content: data.content,
        timestamp: new Date()
      }

      setResults(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 results
      
      toast({
        title: "Copy Gerado!",
        description: `${selectedType.name} criado com sucesso`
      })
    } catch (error) {
      console.error('Error generating copy:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar copy",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copiado!",
        description: "Copy copiado para a área de transferência"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar texto",
        variant: "destructive"
      })
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Zap className="h-6 w-6" />
          Gerador de Copywriting
        </h2>
        <p className="text-muted-foreground">
          Crie copy persuasivo para vendas, marketing e redes sociais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Copy Type Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tipo de Copy</label>
              <div className="grid grid-cols-2 gap-2">
                {copyTypes.map((type) => {
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

            {/* Product/Service Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Produto ou Serviço *
              </label>
              <Textarea
                placeholder="Ex: Curso online de marketing digital para empreendedores iniciantes..."
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Público-alvo (opcional)
              </label>
              <Input
                placeholder="Ex: Empreendedores de 25-45 anos, empresários iniciantes..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Tone and Length */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tom</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !product.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Copy
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados</span>
              {results.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regerar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <Tabs defaultValue={results[0]?.id} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {results.slice(0, 2).map((result, index) => (
                    <TabsTrigger key={result.id} value={result.id}>
                      Versão {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {results.slice(0, 2).map((result) => (
                  <TabsContent key={result.id} value={result.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{result.type}</Badge>
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
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{result.content}</pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure e gere seu copy personalizado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}