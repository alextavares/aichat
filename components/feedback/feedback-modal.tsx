"use client"

import { useState } from 'react'
import { Rating } from '@/components/ui/rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageSquare, Send, X } from 'lucide-react'
import { useToast } from '@/providers/toast-provider'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  templateId: string
  templateName: string
  category: string
  onSubmit?: (feedback: FeedbackData) => void
}

export interface FeedbackData {
  templateId: string
  rating: number
  comment: string
  category: string
  helpful: boolean
  tags: string[]
}

const FEEDBACK_TAGS = [
  'Útil', 'Fácil de usar', 'Bem explicado', 'Completo',
  'Rápido', 'Criativo', 'Profissional', 'Inovador'
]

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  templateId, 
  templateName, 
  category,
  onSubmit 
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [helpful, setHelpful] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Avaliação obrigatória', 'Por favor, selecione uma avaliação')
      return
    }

    setIsSubmitting(true)
    
    try {
      const feedbackData: FeedbackData = {
        templateId,
        rating,
        comment,
        category,
        helpful,
        tags: selectedTags
      }

      const response = await fetch('/api/feedback/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      })

      if (!response.ok) throw new Error('Erro ao enviar feedback')

      toast.feedbackSuccess()
      onSubmit?.(feedbackData)
      handleClose()
    } catch (error) {
      console.error('Feedback error:', error)
      toast.error('Erro', 'Não foi possível enviar o feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment('')
    setHelpful(false)
    setSelectedTags([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Avaliar Template
          </DialogTitle>
          <DialogDescription>
            Como foi sua experiência com "{templateName}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Avaliação geral</Label>
            <div className="flex items-center gap-3">
              <Rating 
                value={rating} 
                onChange={setRating}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 && `${rating} estrela${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Helpful toggle */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={helpful ? "default" : "outline"}
              size="sm"
              onClick={() => setHelpful(!helpful)}
              className="flex items-center gap-2"
            >
              <Heart className={`h-4 w-4 ${helpful ? 'fill-current' : ''}`} />
              {helpful ? 'Útil!' : 'Foi útil?'}
            </Button>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}