"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Github, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { SocialLoginButtons } from "@/components/auth/social-login-buttons"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profession: "",
    organization: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
    
    // Real-time validation for password confirmation
    if (name === "confirmPassword" && value && formData.password && value !== formData.password) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: "Senhas não coincidem"
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted", formData)
    setError("")
    setSuccess("")

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem")
      return
    }

    // Set loading immediately after validation
    setLoading(true)

    try {
      console.log("Sending POST to /api/auth/register")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profession: formData.profession,
          organization: formData.organization,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess("Conta criada com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/auth/signin?message=account-created")
        }, 2000)
      } else {
        // Check if it's a database connection error
        if (response.status === 503 || data.error?.includes("connect") || data.error?.includes("timed out")) {
          setError(`${data.message || "Erro de conexão com o banco de dados"}\n\nTente o modo de teste sem banco.`)
        } else {
          setError(data.message || "Erro ao criar conta. Verifique os dados informados.")
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("Erro ao criar conta. Verifique a conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-lg transition-opacity duration-200 ${loading ? 'opacity-90' : ''}`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Criar sua conta</CardTitle>
          <CardDescription className="text-center">
            Junte-se ao InnerAI e comece sua jornada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Providers */}
          // <SocialLoginButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou cadastre-se com email
              </span>
            </div>
          </div>
          {/* Email/Password Form */}
          <form data-testid="signup-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </label>
                <Input
                  id="name" data-testid="name-input"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email" data-testid="email-input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="profession" className="text-sm font-medium">
                  Profissão
                </label>
                <Input
                  id="profession"
                  name="profession"
                  type="text"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Marketing, Dev..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="organization" className="text-sm font-medium">
                  Organização
                </label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Empresa"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Input
                  id="password" data-testid="password-input"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar senha
                </label>
                <Input
                  id="confirmPassword" data-testid="confirm-password-input"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                </Alert>
                {error.includes("banco") && (
                  <Link href="/auth/signup-mock">
                    <Button type="button" variant="outline" className="w-full">
                      🧪 Usar Modo de Teste (sem banco de dados)
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {success && (
              <Alert className="border-green-500 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit" data-testid="signup-button"
              disabled={loading || !formData.email || !formData.password || !formData.name}
              className="w-full transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}