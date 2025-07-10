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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ImageIcon,
  Loader2,
  Download,
  Sparkles,
  Palette,
  Zap,
  Settings
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ImageGeneratorProps {
  userPlan: string
}

interface GeneratedImage {
  url: string
  revised_prompt?: string
}

const presetPrompts = [
  {
    title: "Post Instagram Profissional",
    prompt: "Modern minimalist social media post design for a tech company, clean typography, gradient background, professional branding",
    category: "marketing"
  },
  {
    title: "Ilustração para Blog", 
    prompt: "Colorful flat design illustration representing digital marketing concepts, friendly and approachable style",
    category: "content"
  },
  {
    title: "Avatar Profissional",
    prompt: "Professional business avatar illustration, modern flat design, friendly and trustworthy appearance",
    category: "design"
  },
  {
    title: "Capa de Apresentação",
    prompt: "Modern presentation cover design with geometric patterns, corporate colors, clean and professional layout",
    category: "business"
  }
]

export function ImageGenerator({ userPlan }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [model, setModel] = useState('dall-e-3')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [style, setStyle] = useState('vivid')
  const [showSettings, setShowSettings] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma descrição para a imagem",
        variant: "destructive"
      })
      return
    }

    if (userPlan === 'FREE') {
      toast({
        title: "Upgrade Necessário",
        description: "Geração de imagens disponível apenas para planos LITE e PRO",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model,
          size,
          quality,
          style
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar imagem')
      }

      const result = await response.json()
      setGeneratedImages(result.images)
      
      toast({
        title: "Imagem Gerada!",
        description: `${result.images.length} imagem(ns) criada(s) com sucesso`
      })
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar imagem",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt)
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `innerai-generated-${Date.now()}-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar a imagem",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Palette className="h-6 w-6" />
          Gerador de Imagens IA
        </h2>
        <p className="text-muted-foreground">
          Crie imagens profissionais para seu marketing e conteúdo
        </p>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Criar Imagem</span>
              <div className="flex gap-2">
                {userPlan !== 'FREE' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {userPlan}
                  </Badge>
                )}
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurações Avançadas</DialogTitle>
                      <DialogDescription>
                        Ajuste as configurações de geração de imagem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Modelo</label>
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dall-e-3">DALL-E 3 (Recomendado)</SelectItem>
                            <SelectItem value="dall-e-2">DALL-E 2 (Mais Rápido)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tamanho</label>
                        <Select value={size} onValueChange={setSize}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1024x1024">Quadrado (1024x1024)</SelectItem>
                            <SelectItem value="1792x1024">Paisagem (1792x1024)</SelectItem>
                            <SelectItem value="1024x1792">Retrato (1024x1792)</SelectItem>
                            {model === 'dall-e-2' && (
                              <>
                                <SelectItem value="512x512">Médio (512x512)</SelectItem>
                                <SelectItem value="256x256">Pequeno (256x256)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {model === 'dall-e-3' && (
                        <>
                          <div>
                            <label className="text-sm font-medium">Qualidade</label>
                            <Select value={quality} onValueChange={setQuality}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Padrão</SelectItem>
                                <SelectItem value="hd">HD (Mais Detalhes)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Estilo</label>
                            <Select value={style} onValueChange={setStyle}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vivid">Vibrante</SelectItem>
                                <SelectItem value="natural">Natural</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Templates */}
            <div>
              <label className="text-sm font-medium mb-2 block">Templates Rápidos</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetPrompts.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-2"
                    onClick={() => handlePresetClick(preset.prompt)}
                  >
                    <div>
                      <div className="font-medium text-xs">{preset.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Descreva sua imagem
              </label>
              <Textarea
                placeholder="Ex: Um logotipo moderno para uma empresa de tecnologia, estilo minimalista, cores azul e branco..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim() || userPlan === 'FREE'}
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
                  Gerar Imagem
                </>
              )}
            </Button>

            {userPlan === 'FREE' && (
              <p className="text-sm text-muted-foreground text-center">
                💎 Geração de imagens disponível nos planos LITE e PRO
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Imagens Geradas</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImages.length > 0 ? (
              <div className="space-y-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => handleDownload(image.url, index)}
                        variant="secondary"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                    {image.revised_prompt && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <strong>Prompt otimizado:</strong> {image.revised_prompt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Suas imagens aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}