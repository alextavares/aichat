"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Send, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModelSelector } from './model-selector'
import { UsageIndicator } from './usage-indicator'
import { FileUpload } from './file-upload'
import { WebSearch } from './web-search'
import { KnowledgeBase } from './knowledge-base'

export function MainChatLayout() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [message, setMessage] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [activeModal, setActiveModal] = useState<'file-upload' | 'web-search' | 'knowledge' | null>(null)

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.user) return

    setIsCreatingChat(true)
    try {
      // Create new conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          model: selectedModel
        })
      })

      if (response.ok) {
        const { id } = await response.json()
        // Navigate to the new chat with the initial message
        router.push(`/dashboard/chat/${id}?message=${encodeURIComponent(message)}`)
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }


  const handleModalOpen = (modal: 'file-upload' | 'web-search' | 'knowledge') => {
    setActiveModal(modal)
  }

  const handleModalClose = () => {
    setActiveModal(null)
  }

  const handleFilesUploaded = (files: any[]) => {
    console.log('Files uploaded:', files)
    // TODO: Add files to chat context
    setActiveModal(null)
  }

  const handleSearchResults = (results: any[]) => {
    console.log('Search results:', results)
    // TODO: Add search results to chat context
    setActiveModal(null)
  }

  const handleKnowledgeItems = (items: any[]) => {
    console.log('Knowledge items:', items)
    // TODO: Add knowledge items to chat context
    setActiveModal(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-medium text-gray-900">Inner AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            {session?.user && (
              <UsageIndicator compact className="hidden lg:flex" />
            )}
          </div>
        </div>
      </header>

      {/* Clean Main Content */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-8 py-16 w-full">
          {/* Simple Welcome */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              How can I help you today?
            </h2>
            <p className="text-gray-500 text-lg">
              Ask me anything or start a conversation
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Chat Input */}
      <div className="border-t border-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              placeholder="Message Inner AI..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="w-full py-4 px-6 pr-16 text-base border-gray-200 rounded-full shadow-sm focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
            
            <Button 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 shadow-sm"
              disabled={!message.trim() || isCreatingChat}
              onClick={handleSendMessage}
            >
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Subtle feature hints */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
            <button 
              onClick={() => handleModalOpen('file-upload')}
              className="hover:text-gray-600 transition-colors"
            >
              Upload files
            </button>
            <button 
              onClick={() => handleModalOpen('web-search')}
              className="hover:text-gray-600 transition-colors"
            >
              Web search
            </button>
            <button 
              onClick={() => handleModalOpen('knowledge')}
              className="hover:text-gray-600 transition-colors"
            >
              Knowledge base
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'file-upload' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            onClose={handleModalClose}
            className="w-full max-w-2xl"
          />
        </div>
      )}

      {activeModal === 'web-search' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <WebSearch
            onResultsSelected={handleSearchResults}
            onClose={handleModalClose}
            className="w-full max-w-3xl"
          />
        </div>
      )}

      {activeModal === 'knowledge' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <KnowledgeBase
            onItemsSelected={handleKnowledgeItems}
            onClose={handleModalClose}
            className="w-full max-w-4xl"
          />
        </div>
      )}
    </div>
  )
}