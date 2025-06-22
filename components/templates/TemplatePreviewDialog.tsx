"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Copy, 
  Check, 
  Star, 
  TrendingUp, 
  Calendar,
  User,
  Hash,
  Sparkles,
  Code,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface TemplatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: {
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
  onUse: () => void
}

export function TemplatePreviewDialog({ 
  open, 
  onOpenChange, 
  template,
  onUse
}: TemplatePreviewDialogProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.templateContent)
    setIsCopied(true)
    toast({
      title: "Conteúdo copiado!",
      description: "O template foi copiado para a área de transferência.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleUse = () => {
    onUse()
    onOpenChange(false)
  }

  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  const gradient = template.gradient || 'blue'
  const gradientClass = gradients[gradient as keyof typeof gradients] || gradients.blue

  // Extract variables from template content
  const extractVariables = (content: string) => {
    const matches = content.match(/\[([^\]]+)\]/g)
    return matches ? matches.map(match => match.slice(1, -1)) : []
  }

  const variables = extractVariables(template.templateContent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0",
              `bg-gradient-to-br ${gradientClass} text-white shadow-lg`
            )}>
              {template.icon || '📝'}
            </div>

            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {template.name}
                {template.isFeatured && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {template.description}
              </DialogDescription>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{template.usageCount.toLocaleString()} usos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {template.createdBy && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{template.createdBy}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Código
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="font-semibold mb-4">Template Preview</h3>
              
              {/* Variables */}
              {variables.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Variáveis detectadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-mono"
                      >
                        [{variable}]
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <ScrollArea className="h-[300px] w-full rounded-md border bg-background p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {template.templateContent}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/50">
                <pre className="p-4 text-sm font-mono">
                  <code>{template.templateContent}</code>
                </pre>
              </ScrollArea>
              
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={handleUse}
            className="gradient-primary text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Usar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}