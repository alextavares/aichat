"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface SocialLoginButtonsProps {
  className?: string
  callbackUrl?: string
}

export function SocialLoginButtons({ 
  className,
  callbackUrl = "/dashboard" 
}: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: Icons.google,
      className: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    },
    {
      id: "azure-ad",
      name: "Microsoft", 
      icon: Icons.microsoft,
      className: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    },
    {
      id: "apple",
      name: "Apple",
      icon: Icons.apple,
      className: "bg-black hover:bg-gray-900 text-white"
    },
    {
      id: "github",
      name: "GitHub",
      icon: Icons.gitHub,
      className: "bg-gray-900 hover:bg-gray-800 text-white"
    }
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      {socialProviders.map((provider) => {
        const Icon = provider.icon
        return (
          <Button
            key={provider.id}
            variant="outline"
            className={cn(
              "relative w-full",
              provider.className
            )}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading !== null}
          >
            {isLoading === provider.id ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon className="mr-2 h-4 w-4" />
            )}
            Continuar com {provider.name}
          </Button>
        )
      })}
    </div>
  )
}