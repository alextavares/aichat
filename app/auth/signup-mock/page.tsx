"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUpMock() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      profession: formData.get("profession"),
      organization: formData.get("organization"),
      password: formData.get("password"),
    }

    const confirmPassword = formData.get("confirmPassword")

    if (data.password !== confirmPassword) {
      setError("As senhas não correspondem")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Erro ao criar conta")
      }

      setSuccess(true)
      
      // Show success message before redirecting
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Criar sua conta (Modo Mock)
          </h2>
          <div className="mt-2 text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Modo de teste sem banco de dados
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Os dados não serão persistidos
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ou{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              entrar na sua conta existente
            </Link>
          </p>
        </div>

        {success && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">
              ✅ Conta criada com sucesso! Redirecionando...
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nome completo
              </label>
              <Input
                id="name"
                name="name"
                type="text"
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
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  )
}