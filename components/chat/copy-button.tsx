"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function CopyButton({ 
  text, 
  className, 
  size = 'sm',
  variant = 'ghost' 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência.",
      })
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "gap-1.5 transition-all",
        copied && "text-green-600 dark:text-green-400",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copiar
        </>
      )}
    </Button>
  )
}