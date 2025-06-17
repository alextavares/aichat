import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  console.log("=== REGISTER API CALLED ===")
  
  try {
    const body = await request.json()
    console.log("Request body:", { ...body, password: "[HIDDEN]" })
    
    const { name, email, password, profession, organization } = body

    // Validar dados
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    console.log("Checking if user exists with email:", email)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log("Existing user check result:", existingUser ? "User exists" : "User not found")

    if (existingUser) {
      return NextResponse.json(
        { message: "Usuário já existe com este email" },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profession,
        organization,
        planType: "FREE", // Plano inicial gratuito
      }
    })

    // Retornar dados do usuário (sem senha)
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("=== REGISTER ERROR ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Full error:", error)
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("P2002")) {
        return NextResponse.json(
          { message: "Email já está em uso" },
          { status: 400 }
        )
      }
      if (error.message.includes("connect") || error.message.includes("timed out")) {
        return NextResponse.json(
          { message: "Erro de conexão com o banco de dados. Por favor, tente novamente." },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Erro interno do servidor", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}