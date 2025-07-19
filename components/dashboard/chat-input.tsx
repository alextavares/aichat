"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Paperclip, Globe, MapPin } from 'lucide-react'

export function ChatInput() {
  const router = useRouter()

  const handleChatClick = () => {
    router.push('/dashboard/chat')
  }

  return (
    <div className="relative">
      <Card className="bg-gray-900 border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pergunte para Inner AI"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  onClick={handleChatClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleChatClick()
                    }
                  }}
                  readOnly
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={handleChatClick}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={handleChatClick}
              >
                <Globe className="h-5 w-5" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={handleChatClick}
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            Adicionar • Pesquisa na web • Conhecimento
          </div>
        </CardContent>
      </Card>
    </div>
  )
}