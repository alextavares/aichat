#!/usr/bin/env tsx

// Teste das variáveis de ambiente
console.log('🔍 TESTANDO VARIÁVEIS DE AMBIENTE\n')

console.log('Variáveis carregadas:')
console.log(`  • NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`  • OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA'}`)
console.log(`  • NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
console.log(`  • DATABASE_URL: ${process.env.DATABASE_URL}`)

if (process.env.OPENROUTER_API_KEY) {
  console.log(`  • Chave começa com: ${process.env.OPENROUTER_API_KEY.substring(0, 10)}...`)
} else {
  console.log('❌ OPENROUTER_API_KEY não foi carregada!')
  
  // Tentar carregar manualmente
  try {
    const fs = require('fs')
    const path = require('path')
    
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      console.log('\n📄 Conteúdo do .env.local:')
      console.log(envContent)
    } else {
      console.log('❌ Arquivo .env.local não encontrado!')
    }
  } catch (error) {
    console.error('Erro ao ler .env.local:', error)
  }
}