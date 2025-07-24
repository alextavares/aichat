// Criar um botão bonito para alternar entre temas
// Usar ícones de sol/lua
// Adicionar animação suave na transição
// Posicionar no header ou sidebar

'use client'

import { useTheme } from '@/contexts/theme-context'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-surface hover:bg-surface-hover 
                 border border-border hover:border-border-hover
                 shadow-soft hover:shadow-soft-md
                 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 transform transition-all duration-300
                     ${theme === 'light' 
                       ? 'rotate-0 scale-100 opacity-100' 
                       : 'rotate-90 scale-0 opacity-0'}`}
          size={20}
        />
        <Moon 
          className={`absolute inset-0 transform transition-all duration-300
                     ${theme === 'dark' 
                       ? 'rotate-0 scale-100 opacity-100' 
                       : '-rotate-90 scale-0 opacity-0'}`}
          size={20}
        />
      </div>
    </button>
  )
}