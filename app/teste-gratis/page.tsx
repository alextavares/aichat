"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Check, 
  Star, 
  Zap, 
  Brain, 
  MessageSquare, 
  FileText, 
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Play
} from 'lucide-react'

export default function TesteGratisPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirecionar para signup com email preenchido
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">AI</span>
              </div>
              <span className="text-xl font-semibold">InnerAI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#recursos" className="text-sm hover:text-primary transition-colors">
                Recursos
              </Link>
              <Link href="#planos" className="text-sm hover:text-primary transition-colors">
                Planos
              </Link>
              <Link href="#depoimentos" className="text-sm hover:text-primary transition-colors">
                Depoimentos
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/signin">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="gradient-primary text-white">
                <Link href="/auth/signup">Começar Grátis</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-muted-foreground">+5.000 profissionais já usam</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Transforme sua produtividade com{' '}
                <span className="text-primary">Inteligência Artificial</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Crie conteúdo, automatize tarefas e acelere seu trabalho com a plataforma de IA mais completa do mercado.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12"
                />
                <Button type="submit" size="lg" className="gradient-primary text-white h-12 px-8">
                  Testar Grátis por 7 Dias
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Cancele quando quiser
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-primary" />
                  Suporte 24/7
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="InnerAI Dashboard"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <Button 
                  size="lg" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-16 w-16"
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              </div>
              <div className="absolute -top-4 -right-4 bg-primary text-white p-4 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">+500%</p>
                    <p className="text-xs text-muted-foreground">Produtividade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas poderosas para acelerar seu trabalho
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat Inteligente</h3>
              <p className="text-muted-foreground">
                Converse com múltiplos modelos de IA e obtenha respostas precisas instantaneamente.
              </p>
            </Card>

            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Templates Prontos</h3>
              <p className="text-muted-foreground">
                Biblioteca com centenas de templates para acelerar sua criação de conteúdo.
              </p>
            </Card>

            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automação Inteligente</h3>
              <p className="text-muted-foreground">
                Automatize tarefas repetitivas e foque no que realmente importa.
              </p>
            </Card>

            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Total</h3>
              <p className="text-muted-foreground">
                Seus dados protegidos com criptografia de ponta e conformidade LGPD.
              </p>
            </Card>

            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Colaboração em Equipe</h3>
              <p className="text-muted-foreground">
                Trabalhe em conjunto com sua equipe em tempo real.
              </p>
            </Card>

            <Card className="p-6 hover-elevation">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
              <p className="text-muted-foreground">
                Acompanhe seu progresso e otimize seu uso com insights detalhados.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">+5.000</p>
              <p className="text-muted-foreground">Usuários Ativos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">+1M</p>
              <p className="text-muted-foreground">Mensagens Processadas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">98%</p>
              <p className="text-muted-foreground">Satisfação</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">24/7</p>
              <p className="text-muted-foreground">Suporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-muted-foreground">
              Comece grátis e faça upgrade quando precisar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Para começar a explorar</p>
              <p className="text-4xl font-bold mb-6">
                R$ 0<span className="text-lg font-normal">/mês</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>50 mensagens/dia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>GPT-3.5 Turbo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Templates básicos</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Começar Grátis
              </Button>
            </Card>

            <Card className="p-8 relative border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">Para profissionais</p>
              <p className="text-4xl font-bold mb-6">
                R$ 47<span className="text-lg font-normal">/mês</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>1.000 mensagens/dia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>GPT-4 + Claude 3</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Todos os templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>API Access</span>
                </li>
              </ul>
              <Button className="w-full gradient-primary text-white">
                Testar 7 Dias Grátis
              </Button>
            </Card>

            <Card className="p-8 relative">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-6">Para empresas</p>
              <p className="text-4xl font-bold mb-6">
                Custom
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Mensagens ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Todos os modelos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>SLA garantido</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Suporte dedicado</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Falar com Vendas
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Junte-se a milhares de profissionais satisfeitos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "O InnerAI revolucionou minha forma de trabalhar. Consigo criar conteúdo 10x mais rápido!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div>
                  <p className="font-semibold">Maria Silva</p>
                  <p className="text-sm text-muted-foreground">Marketing Manager</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "A melhor ferramenta de IA que já usei. Interface intuitiva e resultados impressionantes."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div>
                  <p className="font-semibold">João Santos</p>
                  <p className="text-sm text-muted-foreground">Desenvolvedor</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Economizo horas todos os dias. O suporte é excepcional e sempre pronto para ajudar."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div>
                  <p className="font-semibold">Ana Costa</p>
                  <p className="text-sm text-muted-foreground">CEO</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para transformar seu trabalho?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comece agora mesmo com 7 dias grátis. Sem cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary text-white">
              Começar Teste Grátis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
              <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">AI</span>
                </div>
                <span className="text-xl font-semibold">InnerAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma de IA mais completa para acelerar seu trabalho.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Recursos</Link></li>
                <li><Link href="#" className="hover:text-primary">Planos</Link></li>
                <li><Link href="#" className="hover:text-primary">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Sobre</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Carreiras</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Central de Ajuda</Link></li>
                <li><Link href="#" className="hover:text-primary">Contato</Link></li>
                <li><Link href="#" className="hover:text-primary">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 InnerAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}