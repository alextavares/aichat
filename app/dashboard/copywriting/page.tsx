"use client"

import { CopywritingGenerator } from '@/components/dashboard/copywriting-generator'

export default function CopywritingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Copywriting</h1>
        <p className="text-muted-foreground">
          Crie copies persuasivos para suas campanhas de marketing usando IA avançada
        </p>
      </div>
      
      <CopywritingGenerator />
    </div>
  )
}