import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock database - stores users in memory
const mockUsers = new Map()

export async function POST(request: NextRequest) {
  console.log("=== MOCK REGISTER API CALLED ===")
  
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

    // Verificar se usuário já existe no mock
    if (mockUsers.has(email)) {
      return NextResponse.json(
        { message: "Usuário já existe com este email" },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12)

    // Criar usuário mock
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      passwordHash,
      profession,
      organization,
      planType: "FREE",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Salvar no mock database
    mockUsers.set(email, user)
    console.log("Mock user created:", { ...user, passwordHash: "[HIDDEN]" })

    // Retornar dados do usuário (sem senha)
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso (MODO MOCK - apenas para testes)", 
        user: userWithoutPassword,
        isMock: true 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("=== MOCK REGISTER ERROR ===")
    console.error("Error:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor (mock)", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// Mock users storage (internal only)
// Export moved to separate file if needed for testing