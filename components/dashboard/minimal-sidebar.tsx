"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  Home,
  Wrench,
  LogOut,
  Bot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { ChatHistory } from './chat-history'
import { LibrarySection } from './library-section'
import { UsageIndicator } from './usage-indicator'

const menuItems = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Tools',
    href: '/dashboard/tools',
    icon: Wrench,
  },
]

export function MinimalSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  return (
    <div className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">Inner AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.title}</span>
            </Link>
          ))}
          
          {/* Library Section */}
          <LibrarySection 
            isExpanded={isLibraryOpen}
            onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
          />
        </div>

        {/* Chat History Section */}
        <div className="mt-8">
          <ChatHistory />
        </div>
      </nav>

      {/* Usage Indicator */}
      <div className="p-4 border-t border-gray-100">
        <UsageIndicator />
      </div>

      {/* Language Selector */}
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-gray-600 border-gray-200"
        >
          <span>Language</span>
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="w-8 h-8 text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}