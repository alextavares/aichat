'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu, X, Home, MessageSquare, Settings, CreditCard, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const publicNavItems: NavigationItem[] = [
  { href: '/', label: 'Início', icon: Home, description: 'Página inicial' },
  { href: '/pricing', label: 'Preços', icon: CreditCard, description: 'Planos e preços' },
  { href: '/demo-chat', label: 'Demo', icon: MessageSquare, description: 'Experimente grátis' },
]

const dashboardNavItems: NavigationItem[] = [
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare, description: 'Conversar com IA' },
  { href: '/dashboard/templates', label: 'Templates', icon: BookOpen, description: 'Modelos de conversa' },
  { href: '/dashboard/knowledge', label: 'Conhecimento', icon: BookOpen, description: 'Base de conhecimento' },
  { href: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard, description: 'Gerenciar plano' },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings, description: 'Configurações da conta' },
  { href: '/dashboard/profile', label: 'Perfil', icon: User, description: 'Perfil do usuário' },
]

interface ResponsiveNavigationProps {
  items?: NavigationItem[]
  className?: string
  showMobileMenu?: boolean
}

export function ResponsiveNavigation({ 
  items = publicNavItems, 
  className,
  showMobileMenu = true 
}: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav 
      className={cn(
        "flex gap-1",
        mobile ? "flex-col space-y-2" : "flex-row"
      )}
      role="navigation"
      aria-label={mobile ? "Menu de navegação móvel" : "Menu de navegação principal"}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              isActive && "bg-accent text-accent-foreground",
              mobile && "w-full justify-start"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-describedby={mobile ? `${item.href}-description` : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
            {mobile && item.description && (
              <span id={`${item.href}-description`} className="sr-only">
                {item.description}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className={cn("flex items-center", className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <NavItems />
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu de navegação"
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[300px] sm:w-[400px]"
              id="mobile-navigation"
            >
              <SheetHeader>
                <SheetTitle className="text-left">Menu de Navegação</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}

// Responsive container with proper breakpoints
export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "7xl" 
}: { 
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
}) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  }

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive grid with proper breakpoints
export function ResponsiveGrid({ 
  children, 
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4
  }
}: { 
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}) {
  const gridClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridClasses,
      className
    )}>
      {children}
    </div>
  )
}

export { dashboardNavItems, publicNavItems }