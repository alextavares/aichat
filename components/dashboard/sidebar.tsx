"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  CreditCard,
  FileText,
  Brain,
  History,
  User,
  LogOut,
  Home,
  Briefcase,
  GraduationCap,
  Library,
  Sparkles,
  ChevronDown,
  Headphones,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'

const menuItems = [
  {
    title: 'Início',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    title: 'Templates',
    href: '/dashboard/templates',
    icon: FileText,
  },
  {
    title: 'Base de Conhecimento',
    href: '/dashboard/knowledge',
    icon: BookOpen,
  },
  {
    title: 'Cursos',
    href: '/dashboard/courses',
    icon: GraduationCap,
  },
  {
    title: 'Ferramentas',
    href: '/dashboard/tools',
    icon: Briefcase,
  },
  {
    title: 'Biblioteca',
    href: '/dashboard/library',
    icon: Library,
    hasDropdown: true,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userPlan, setUserPlan] = useState('FREE')
  
  // Load user plan
  const fetchUserPlan = useCallback(async () => {
    if (session?.user) {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.planType || 'FREE')
        }
      } catch (error) {
        console.error('Error fetching user plan:', error)
      }
    }
  }, [session])

  useEffect(() => {
    fetchUserPlan()
  }, [fetchUserPlan])

  return (
    <Sidebar className="w-[280px] border-r-0 bg-gray-900 text-white">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-xl font-bold text-purple-400">AI</span>
          </div>
          <span className="text-xl font-semibold text-white">Inner AI</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className="h-12 rounded-xl hover:bg-gray-800/50 data-[active=true]:bg-gray-800 text-gray-300 hover:text-white data-[active=true]:text-white"
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.title}</span>
                      {item.hasDropdown && (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade Section */}
        <div className="mt-auto mb-4 mx-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-2xl text-white">
            <h3 className="font-semibold mb-1">Você está no plano {userPlan === 'FREE' ? 'Free' : userPlan}</h3>
            <p className="text-sm opacity-90 mb-3">
              Faça upgrade para desbloquear funcionalidades disponíveis
            </p>
            <Button 
              asChild
              variant="secondary" 
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white border-0"
            >
              <Link href="/dashboard/subscription">
                <Sparkles className="h-4 w-4 mr-2" />
                Fazer upgrade
              </Link>
            </Button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-gray-800">
        <div className="space-y-2">
          <SidebarMenuButton 
            asChild
            className="h-12 rounded-xl hover:bg-gray-800/50 justify-start text-gray-300 hover:text-white"
          >
            <Link href="/support" className="flex items-center gap-3 px-3">
              <Headphones className="h-5 w-5" />
              <span className="text-base">Suporte</span>
            </Link>
          </SidebarMenuButton>
          
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-500/20 text-purple-400">
                {session?.user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium truncate text-white">
                {session?.user?.name || 'Usuário'}
              </p>
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                {userPlan}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}