'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">Inner AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="ghost">Preços</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Conte para gente de qual time você faz parte...
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 mb-8">
            {[
              "Marketing",
              "Jurídico", 
              "Design",
              "Operações",
              "Finanças",
              "Vendas",
              "Engenharia",
              "Criador de Conteúdo",
              "Recursos Humanos",
              "Outro..."
            ].map((area) => (
              <Button
                key={area}
                variant="outline"
                className="h-12 text-sm"
              >
                {area}
              </Button>
            ))}
          </div>

          <div className="max-w-md mx-auto mt-12 p-6 border border-border rounded-lg bg-card">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-4">Escolher Foto</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input placeholder="Alexandre" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobrenome</label>
                  <Input placeholder="tavares moraes" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input placeholder="alexandretmoraes110@gmail.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Organização</label>
                <Input placeholder="Organização Pessoal" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Número de Telefone</label>
                <Input placeholder="Telefone" />
              </div>
            </div>
            
            <Link href="/auth/signup" className="block">
              <Button className="w-full mt-6">
                Próximo →
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; 2024 Inner AI Clone. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
