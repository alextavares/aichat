'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  announcements: string[]
  setHighContrast: (enabled: boolean) => void
  setReducedMotion: (enabled: boolean) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  announce: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [announcements, setAnnouncements] = useState<string[]>([])

  // Detect user preferences on mount
  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement

    if (highContrast) {
      root.classList.add('accessibility-high-contrast')
    } else {
      root.classList.remove('accessibility-high-contrast')
    }

    if (reducedMotion) {
      root.classList.add('accessibility-reduced-motion')
    } else {
      root.classList.remove('accessibility-reduced-motion')
    }

    root.classList.remove('accessibility-font-small', 'accessibility-font-medium', 'accessibility-font-large')
    root.classList.add(`accessibility-font-${fontSize}`)
  }, [highContrast, reducedMotion, fontSize])

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message])
    // Remove announcement after a delay to keep the array manageable
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 1000)
  }

  const value = {
    highContrast,
    reducedMotion,
    fontSize,
    announcements,
    setHighContrast,
    setReducedMotion,
    setFontSize,
    announce,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        data-testid="accessibility-announcer"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  )
}

// Accessibility CSS classes to be added to globals.css
export const accessibilityStyles = `
/* High Contrast Mode */
.accessibility-high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 90%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 90%;
  --muted-foreground: 0 0% 0%;
  --accent: 0 0% 90%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84% 40%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 50%;
  --input: 0 0% 90%;
  --ring: 0 0% 0%;
}

.accessibility-high-contrast.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 0%;
  --card-foreground: 0 0% 100%;
  --popover: 0 0% 0%;
  --popover-foreground: 0 0% 100%;
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 20%;
  --secondary-foreground: 0 0% 100%;
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 100%;
  --accent: 0 0% 20%;
  --accent-foreground: 0 0% 100%;
  --border: 0 0% 50%;
  --input: 0 0% 20%;
  --ring: 0 0% 100%;
}

/* Reduced Motion */
.accessibility-reduced-motion *,
.accessibility-reduced-motion *::before,
.accessibility-reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Font Sizes */
.accessibility-font-small {
  font-size: 14px;
}

.accessibility-font-medium {
  font-size: 16px;
}

.accessibility-font-large {
  font-size: 18px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`