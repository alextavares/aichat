"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ChatItem {
  id: string
  title: string
  lastMessage?: string
  updatedAt: string
  messageCount: number
}

interface ChatHistoryProps {
  className?: string
}

export function ChatHistory({ className }: ChatHistoryProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [chats, setChats] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all')

  // Load chat history
  useEffect(() => {
    const loadChats = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setChats(data.conversations || [])
        }
      } catch (error) {
        console.error('Failed to load chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [session])

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/conversations/${chatId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== chatId))
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredChats = chats.filter(chat => {
    const chatDate = new Date(chat.updatedAt)
    const now = new Date()
    
    switch (filter) {
      case 'today':
        return chatDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return chatDate >= weekAgo
      default:
        return true
    }
  })

  if (!session?.user) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-gray-900">Chats</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
          >
            All
          </Button>
        </div>

        {/* Login Prompt */}
        <div className="mx-4 p-4 rounded-xl border border-gray-200 bg-gray-50 text-center">
          <div className="text-sm text-gray-600 mb-3">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Log in
            </Link>
            {' or '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            to view chat history
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Filter */}
      <div className="flex items-center justify-between px-4">
        <span className="text-sm font-medium text-gray-900">Chats</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
            >
              {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'Week'}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-24">
            <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('today')}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('week')}>Week</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* New Chat Button */}
      <div className="px-4">
        <Link href="/dashboard/chat">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Chat List */}
      <div className="space-y-1 px-4">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No chats yet</p>
            <p className="text-xs text-gray-400">Start a conversation to see it here</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors",
                pathname.includes(chat.id) && "bg-blue-50 border border-blue-100"
              )}
            >
              <Link href={`/dashboard/chat/${chat.id}`} className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {chat.title || 'Untitled Chat'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {chat.lastMessage || `${chat.messageCount} messages`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {getTimeAgo(chat.updatedAt)}
                  </span>
                </div>
              </Link>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-sm text-red-600"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  )
}