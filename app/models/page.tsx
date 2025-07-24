"use client"

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ModelsPage() {
  useEffect(() => {
    // Redireciona para a página de modelos no dashboard
    redirect('/dashboard/models')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Redirecionando...</h1>
        <p className="text-muted-foreground">Você será redirecionado para a página de modelos.</p>
      </div>
    </div>
  )
}