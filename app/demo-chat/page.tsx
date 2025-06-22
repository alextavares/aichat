"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function DemoChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    console.log("Sending message:", input)
    const messageContent = input // Save input before clearing
    
    setError("") // Clear previous errors
    const userMessage = { role: 'user', content: messageContent }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Add placeholder for assistant
    const assistantMessage = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])

    try {
      console.log("Sending POST to /api/demo-stream")
      // Direct OpenAI call for demo
      const response = await fetch('/api/demo-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.token) {
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content += data.token
                    return newMessages
                  })
                } else if (data.error) {
                  setError(data.error)
                  // Remove the empty assistant message
                  setMessages(prev => prev.slice(0, -1))
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError("Erro ao enviar mensagem. Verifique se a API está configurada.")
      // Remove the empty assistant message
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🚀 Demo: Chat com Streaming</h1>
        
        <div className="border rounded-lg p-4 h-[500px] overflow-y-auto mb-4 bg-card" data-testid="chat-messages">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center" data-testid="empty-state">
              Digite uma mensagem para começar...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
                data-testid={`message-container-${msg.role}-${idx}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                  data-testid={`message-bubble-${msg.role}`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && loading && idx === messages.length - 1 && (
                    <span className="inline-block w-1 h-4 bg-foreground animate-pulse ml-1" data-testid="typing-indicator" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4" data-testid="error-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="error-message">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            data-testid="chat-input"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading}
            data-testid="send-button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg" data-testid="status-panel">
          <p className="text-sm" data-testid="status-indicator">
            <strong>Status:</strong> {loading ? '🟡 Gerando resposta...' : '🟢 Pronto'}
          </p>
          <p className="text-sm mt-1" data-testid="streaming-indicator">
            <strong>Streaming:</strong> ✅ Ativo - Respostas aparecem em tempo real
          </p>
        </div>
      </div>
    </div>
  )
}