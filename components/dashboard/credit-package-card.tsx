"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Coins, Check, Star, Loader2 } from 'lucide-react'

interface CreditPackageCardProps {
  credits: number
  price: number
  originalPrice?: number | null
  discount?: number | null
  isPopular?: boolean
  features: string[]
}

export function CreditPackageCard({
  credits,
  price,
  originalPrice,
  discount,
  isPopular = false,
  features
}: CreditPackageCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement purchase logic
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          price
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment or success page
        window.location.href = data.paymentUrl || '/dashboard/credits/success'
      } else {
        throw new Error('Failed to initiate purchase')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      // Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isPopular 
        ? 'border-purple-500/50 bg-purple-900/10 scale-105' 
        : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/30'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 text-white px-3 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Mais Popular
          </Badge>
        </div>
      )}
      
      {discount && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="bg-green-500 text-white">
            {discount}% OFF
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-xl font-bold text-white">
            {credits.toLocaleString('pt-BR')} créditos
          </CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">
              R$ {price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                R$ {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <CardDescription className="text-gray-400">
            {(price / credits * 1000).toFixed(3)} por 1000 créditos
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-white text-sm">Com {credits.toLocaleString('pt-BR')} créditos você pode:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Purchase Button */}
        <Button 
          onClick={handlePurchase}
          disabled={isLoading}
          className={`w-full ${
            isPopular 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-gray-700 hover:bg-gray-600'
          } text-white transition-colors`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Comprar Agora
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Pagamento seguro • Créditos não expiram
          </p>
          {isPopular && (
            <p className="text-xs text-purple-400 mt-1">
              Economia de R$ {((originalPrice || 0) - price).toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}