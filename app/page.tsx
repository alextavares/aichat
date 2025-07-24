'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientText } from "@/components/ui/gradient-text";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border hover:border-border-hover bg-card shadow-soft">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">
              <GradientText>Inner AI</GradientText>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/pricing">
              <Button variant="ghost" className="hover:bg-surface hover:text-primary">
                Preços
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" className="hover:bg-surface hover:text-primary">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary-hover text-white shadow-soft hover:shadow-soft-md">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-text-primary mb-4">
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
                className="h-12 text-sm bg-card hover:bg-card-hover border-border hover:border-primary/50 
                          hover:text-primary transition-all duration-300 shadow-soft hover:shadow-soft-md"
              >
                {area}
              </Button>
            ))}
          </div>

          <div className="max-w-md mx-auto mt-12 p-6 border border-border rounded-lg bg-card shadow-soft-md">
            <div className="w-24 h-24 bg-background-secondary rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary mb-4">Escolher Foto</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-primary">Nome</label>
                  <Input placeholder="Alexandre" className="bg-background border-border focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-primary">Sobrenome</label>
                  <Input placeholder="tavares moraes" className="bg-background border-border focus:border-primary" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-text-primary">Email</label>
                <Input placeholder="alexandretmoraes110@gmail.com" className="bg-background border-border focus:border-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-text-primary">Organização</label>
                <Input placeholder="Organização Pessoal" className="bg-background border-border focus:border-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-text-primary">Número de Telefone</label>
                <Input placeholder="Telefone" className="bg-background border-border focus:border-primary" />
              </div>
            </div>
            
            <Link href="/auth/signup" className="block">
              <Button className="w-full mt-6 bg-primary hover:bg-primary-hover text-white shadow-soft hover:shadow-soft-md">
                Próximo →
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-text-secondary">
          <p>&copy; 2024 Inner AI Clone. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
