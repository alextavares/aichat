"use client"

import { useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Paperclip, Globe, MapPin, Send, Bot, User, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatInput() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setChatStarted(true)

    try {
      console.log('Enviando requisição para /api/chat...')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: 'gpt-3.5-turbo'
        }),
      })

      console.log('Resposta recebida:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na API:', errorData)
        throw new Error(errorData.message || 'Falha na requisição')
      }

      const data = await response.json()
      console.log('Dados recebidos:', data)

      if (!data.message) {
        throw new Error('Resposta da API não contém mensagem')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro no chat:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (chatStarted) {
    return (
      <div className="space-y-4">
        {/* Chat Messages */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500/20">
                          <Bot className="h-4 w-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 bg-blue-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-blue-500/20">
                          <User className="h-4 w-4 text-blue-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                      <AvatarFallback className="bg-purple-500/20">
                        <Bot className="h-4 w-4 text-purple-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">Digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="bg-gray-900 border-gray-700 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px',
                      maxHeight: '120px',
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-500">
                Digite sua mensagem e pressione Enter para enviar
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <Card className="bg-gray-900 border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte para Inner AI"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </button>
                {input.trim() && (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            Adicionar • Pesquisa na web • Conhecimento
          </div>
        </CardContent>
      </Card>
    </div>
  )
}