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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { templateCategories } from './TemplateCategories'

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTemplateDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateTemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    templateContent: '',
    icon: '📝',
    gradient: 'blue',
    tags: '',
    isPublic: false,
    isFeatured: false,
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.templateContent) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Template criado com sucesso.",
        })
        onSuccess()
        resetForm()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      templateContent: '',
      icon: '📝',
      gradient: 'blue',
      tags: '',
      isPublic: false,
      isFeatured: false,
    })
  }

  const gradientOptions = [
    { value: 'blue', label: 'Azul', className: 'from-blue-500 to-blue-600' },
    { value: 'purple', label: 'Roxo', className: 'from-purple-500 to-purple-600' },
    { value: 'pink', label: 'Rosa', className: 'from-pink-500 to-pink-600' },
    { value: 'green', label: 'Verde', className: 'from-green-500 to-green-600' },
    { value: 'orange', label: 'Laranja', className: 'from-orange-500 to-orange-600' },
    { value: 'indigo', label: 'Índigo', className: 'from-indigo-500 to-indigo-600' },
  ]

  const iconOptions = ['📝', '💡', '🚀', '✨', '📊', '💼', '🎯', '📈', '🔥', '⚡']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogDescription>
            Crie um template personalizado para usar em suas conversas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Gerador de Ideias de Conteúdo"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrição do que o template faz"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {templateCategories.slice(1).map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon and Gradient */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${
                      formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Gradiente</Label>
              <div className="flex flex-wrap gap-2">
                {gradientOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gradient: option.value })}
                    className={`w-20 h-10 rounded-lg bg-gradient-to-r ${option.className} border-2 transition-all hover:scale-110 ${
                      formData.gradient === option.value ? 'border-primary' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Template *</Label>
            <Textarea
              id="content"
              value={formData.templateContent}
              onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
              placeholder="Digite o prompt do template. Use [VARIÁVEL] para criar campos substituíveis..."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use [TÓPICO], [NOME], [EMPRESA] etc. para criar variáveis dinâmicas
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="marketing, vendas, email"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
                Tornar este template público
              </Label>
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="gradient-primary text-white"
          >
            {isLoading ? "Criando..." : "Criar Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}