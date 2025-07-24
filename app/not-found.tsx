import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao início
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                <Search className="mr-2 h-4 w-4" />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}