"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Search, BookOpen, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ModelSelector } from './model-selector'
import { UsageIndicator } from './usage-indicator'
import { FileUpload } from './file-upload'
import { WebSearch } from './web-search'
import { KnowledgeBase } from './knowledge-base'

const toolCards = [
  {
    id: 'image-generation',
    title: 'Image Generation',
    description: 'Produce images in various sizes and styles from text prompts, perfect for all your creative needs.',
    color: 'from-blue-500 to-purple-600',
    preview: '🎨',
    gradientStyle: 'bg-gradient-to-br from-blue-100 to-purple-100'
  },
  {
    id: 'transcribe-video',
    title: 'Transcribe Video',
    description: 'Transcribe videos files. From there, start a conversation, generate subtitles, ask for summaries.',
    color: 'from-green-500 to-teal-600',
    preview: '📹',
    gradientStyle: 'bg-gradient-to-br from-green-100 to-teal-100'
  },
  {
    id: 'text-translation',
    title: 'Text Translation',
    description: 'As an expert translator, your task is to provide a high-quality translation that is accurate.',
    color: 'from-purple-500 to-pink-600',
    preview: '🌐',
    gradientStyle: 'bg-gradient-to-br from-purple-100 to-pink-100'
  },
  {
    id: 'video-generation',
    title: 'Generate Video Based on Image',
    description: 'Generate videos based on existing image, adapting scenes and details to match your vision.',
    color: 'from-orange-500 to-red-600',
    preview: '🎬',
    gradientStyle: 'bg-gradient-to-br from-orange-100 to-red-100'
  }
]

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

  const handleToolClick = (toolId: string) => {
    // Navigate to specific tool or start a chat with tool context
    router.push(`/dashboard/tools/${toolId}`)
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
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-80 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Usage Indicator Compact */}
          {session?.user && (
            <UsageIndicator compact className="hidden md:flex" />
          )}

          {/* Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Auth Buttons */}
          {!session?.user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Log in</Button>
              <Button size="sm" className="bg-gray-800 hover:bg-gray-900">Sign up</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {session.user.name || 'User'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello,</h1>
            <p className="text-2xl text-gray-500">What can I do for you today?</p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {toolCards.map((tool) => (
              <Card 
                key={tool.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md"
                onClick={() => handleToolClick(tool.id)}
              >
                <CardContent className="p-0">
                  <div className="relative bg-white">
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {tool.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {tool.description}
                          </p>
                        </div>
                        
                        {/* Enhanced Preview */}
                        <div className={`w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 ${tool.gradientStyle} border border-gray-100`}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-3xl opacity-80">
                              {tool.preview}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Use Button */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToolClick(tool.id)
                          }}
                        >
                          Use This Tool →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Message Inner AI"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pr-32 py-4 text-base border-gray-300 rounded-2xl"
              />
              
              {/* Action Buttons */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleModalOpen('file-upload')}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleModalOpen('web-search')}
                >
                  <Search className="w-4 h-4" />
                  Web Search
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleModalOpen('knowledge')}
                >
                  <BookOpen className="w-4 h-4" />
                  Knowledge
                </Button>
              </div>
            </div>
            
            <Button 
              size="icon" 
              className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900"
              disabled={!message.trim() || isCreatingChat}
              onClick={handleSendMessage}
            >
              <Send className="w-5 h-5" />
            </Button>
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