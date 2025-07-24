// Implementar um Context API para gerenciar o tema
// Deve incluir:
// - Estado do tema atual (light/dark)
// - Função para alternar tema
// - Persistência no localStorage
// - Aplicação das variáveis CSS no :root
// - Hook useTheme para consumir o contexto

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes } from '@/lib/themes'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light') // Padrão agora é light

  useEffect(() => {
    // Carregar tema salvo ou usar light como padrão
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Aplicar variáveis CSS
    const root = document.documentElement
    const themeColors = themes[theme]
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    // Adicionar classe para Tailwind
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}