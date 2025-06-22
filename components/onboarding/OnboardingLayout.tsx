"use client"

import { ReactNode } from 'react'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  title: string
  subtitle: string
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card p-8">
        <div className="w-full max-w-sm">
          {/* Mock Interface Preview */}
          <div className="bg-background rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-card border-b border-border p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IA</span>
              </div>
              <div>
                <div className="font-medium">Inner AI</div>
                <div className="text-xs text-muted-foreground">GPT-4o</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm">Hello! What can I do for you today?</div>
                  </div>
                </div>
              </div>

              {/* Template Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg p-3">
                  <div className="text-xs font-medium">Marketing</div>
                  <div className="text-xs text-muted-foreground mt-1">Create campaigns</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg p-3">
                  <div className="text-xs font-medium">Writing</div>
                  <div className="text-xs text-muted-foreground mt-1">Improve content</div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <div className="text-sm text-muted-foreground flex-1">Message Inner AI</div>
                <div className="w-4 h-4 bg-primary/50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}