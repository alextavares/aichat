"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import ChatInterfaceStreaming from "@/components/chat/chat-interface-streaming"
import ConversationHistory from "@/components/chat/conversation-history"
import UsageIndicator from "@/components/usage/usage-indicator"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">Inner AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Olá, {session.user?.name}
            </span>
            <Button variant="ghost" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Navigation */}
        <aside className="w-64 bg-card border-r border-border min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  🏠 Início
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  🎓 Cursos
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  🛠️ Ferramentas
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  📚 Biblioteca
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start">
                  💬 Suporte
                </Button>
              </li>
            </ul>
          </nav>

          {/* Usage and Plan Info */}
          <div className="absolute bottom-4 left-4 right-4 space-y-4">
            <UsageIndicator />
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm font-medium">Você está no plano Free</p>
              <p className="text-xs text-muted-foreground mt-1">
                Faça upgrade para desbloquear funcionalidades
              </p>
              <Button size="sm" className="w-full mt-2">
                🚀 Fazer upgrade
              </Button>
            </div>
          </div>
        </aside>

        {/* Conversation History */}
        <aside className="w-80 bg-card border-r border-border min-h-screen">
          <ConversationHistory
            currentConversationId={currentConversationId}
            onSelectConversation={setCurrentConversationId}
            onNewConversation={() => setCurrentConversationId(undefined)}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Olá {session.user?.name} 👋
              </h2>
              <p className="text-muted-foreground">
                Como posso ajudar hoje?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                "Resumo Executivo",
                "Comunicado de Imprensa", 
                "Artigo de Suporte",
                "Perguntas Frequentes (FAQs)",
                "Resumo",
                "Publicação no LinkedIn"
              ].map((template) => (
                <div
                  key={template}
                  className="p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-foreground mb-2">{template}</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie um {template.toLowerCase()} profissional
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Interface */}
            <div className="border border-border rounded-lg bg-card h-96">
              <ChatInterfaceStreaming
                conversationId={currentConversationId}
                onNewConversation={setCurrentConversationId}
                model={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}