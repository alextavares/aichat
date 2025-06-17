"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem")
      setLoading(false)
      return
    }

    try {
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
        router.push("/auth/signin?message=account-created")
      } else {
        // Check if it's a database connection error
        if (response.status === 503 || data.error?.includes("connect") || data.error?.includes("timed out")) {
          setError(`${data.message || "Erro de conexão com o banco de dados"}\n\nTente o modo de teste sem banco.`)
        } else {
          setError(data.message || "Erro ao criar conta")
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
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Criar sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ou{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              entrar na sua conta existente
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nome completo
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="profession" className="block text-sm font-medium">
                Profissão
              </label>
              <Input
                id="profession"
                name="profession"
                type="text"
                value={formData.profession}
                onChange={handleChange}
                className="mt-1"
                placeholder="Ex: Marketing, Desenvolvedor"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium">
                Organização
              </label>
              <Input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                className="mt-1"
                placeholder="Nome da empresa"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="space-y-3">
              <div className="text-red-500 text-sm text-center whitespace-pre-line">{error}</div>
              {error.includes("banco") && (
                <Link href="/auth/signup-mock">
                  <Button type="button" variant="outline" className="w-full">
                    🧪 Usar Modo de Teste (sem banco de dados)
                  </Button>
                </Link>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  )
}