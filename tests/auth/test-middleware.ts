#!/usr/bin/env ts-node
/**
 * 🛡️ Teste Específico do Middleware de Autenticação
 * Criado com Claude Flow v2.0.0 - Hive Mind Intelligence
 * 
 * Testa especificamente as correções implementadas no middleware.ts:
 * - Verificação robusta de tokens
 * - Headers de debug
 * - Redirecionamentos corretos
 * - Proteção de rotas específicas
 */

const LOCAL_URL = 'http://localhost:3050'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

class MiddlewareTests {
  private results: TestResult[] = []

  private log(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    const result = { test, status, message, details }
    this.results.push(result)
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${emoji} ${test}: ${message}`)
    if (details) console.log(`   📋 Detalhes:`, details)
  }

  async testUnauthorizedAccess() {
    console.log('\n🔍 1. Testando acesso não autorizado ao dashboard...')
    
    try {
      const response = await fetch(`${LOCAL_URL}/dashboard`, {
        redirect: 'manual'
      })
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location')
        this.log(
          'Redirecionamento Dashboard',
          'PASS',
          `Redirecionamento correto (${response.status})`,
          { location }
        )
      } else {
        this.log(
          'Redirecionamento Dashboard',
          'FAIL',
          `Dashboard acessível sem auth (${response.status})`
        )
      }
    } catch (error: any) {
      this.log(
        'Redirecionamento Dashboard',
        'FAIL',
        `Erro na requisição: ${error.message}`
      )
    }
  }

  async testChatRouteProtection() {
    console.log('\n🔍 2. Testando proteção específica da rota /dashboard/chat...')
    
    try {
      const response = await fetch(`${LOCAL_URL}/dashboard/chat`, {
        redirect: 'manual'
      })
      
      // Verificar status
      if (response.status === 302 || response.status === 307) {
        this.log(
          'Proteção Chat Route',
          'PASS',
          `Chat protegido corretamente (${response.status})`
        )
      } else {
        this.log(
          'Proteção Chat Route',
          'FAIL',
          `Chat acessível sem auth (${response.status})`
        )
      }
      
      // Verificar headers de debug
      const authDebug = response.headers.get('x-auth-debug')
      if (authDebug) {
        this.log(
          'Debug Headers',
          'PASS',
          'Header de debug presente',
          { debugInfo: authDebug }
        )
      } else {
        this.log(
          'Debug Headers',
          'WARN',
          'Header de debug não encontrado'
        )
      }
      
    } catch (error: any) {
      this.log(
        'Proteção Chat Route',
        'FAIL',
        `Erro na requisição: ${error.message}`
      )
    }
  }

  async testOtherProtectedRoutes() {
    console.log('\n🔍 3. Testando outras rotas protegidas...')
    
    const protectedRoutes = [
      '/dashboard/models',
      '/dashboard/history',
      '/dashboard/settings',
      '/dashboard/profile'
    ]
    
    for (const route of protectedRoutes) {
      try {
        const response = await fetch(`${LOCAL_URL}${route}`, {
          redirect: 'manual'
        })
        
        if (response.status === 302 || response.status === 307) {
          this.log(
            `Proteção ${route}`,
            'PASS',
            `Rota protegida (${response.status})`
          )
        } else if (response.status === 404) {
          this.log(
            `Proteção ${route}`,
            'WARN',
            'Rota não existe (404)'
          )
        } else {
          this.log(
            `Proteção ${route}`,
            'FAIL',
            `Rota acessível sem auth (${response.status})`
          )
        }
      } catch (error: any) {
        this.log(
          `Proteção ${route}`,
          'WARN',
          `Erro na requisição: ${error.message}`
        )
      }
    }
  }

  async testPublicRoutes() {
    console.log('\n🔍 4. Testando rotas públicas (devem ser acessíveis)...')
    
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/pricing',
      '/about'
    ]
    
    for (const route of publicRoutes) {
      try {
        const response = await fetch(`${LOCAL_URL}${route}`, {
          redirect: 'manual'
        })
        
        if (response.status === 200) {
          this.log(
            `Acesso Público ${route}`,
            'PASS',
            'Rota pública acessível'
          )
        } else if (response.status === 404) {
          this.log(
            `Acesso Público ${route}`,
            'WARN',
            'Rota não existe (404)'
          )
        } else {
          this.log(
            `Acesso Público ${route}`,
            'WARN',
            `Status inesperado (${response.status})`
          )
        }
      } catch (error: any) {
        this.log(
          `Acesso Público ${route}`,
          'FAIL',
          `Erro na requisição: ${error.message}`
        )
      }
    }
  }

  async testTokenValidation() {
    console.log('\n🔍 5. Testando validação de tokens (simulação)...')
    
    // Testar com cookie falso
    try {
      const response = await fetch(`${LOCAL_URL}/dashboard`, {
        headers: {
          'Cookie': 'next-auth.session-token=fake-token; next-auth.csrf-token=fake-csrf'
        },
        redirect: 'manual'
      })
      
      if (response.status === 302 || response.status === 307) {
        this.log(
          'Validação Token Falso',
          'PASS',
          'Token falso rejeitado corretamente'
        )
      } else {
        this.log(
          'Validação Token Falso',
          'FAIL',
          'Token falso aceito incorretamente'
        )
      }
    } catch (error: any) {
      this.log(
        'Validação Token Falso',
        'WARN',
        `Erro na requisição: ${error.message}`
      )
    }
  }

  async testServerReachability() {
    console.log('\n🔍 0. Verificando se servidor local está rodando...')
    
    try {
      const response = await fetch(`${LOCAL_URL}/`, {
        timeout: 5000
      } as any)
      
      if (response.status === 200) {
        this.log(
          'Servidor Local',
          'PASS',
          'Servidor Next.js está rodando'
        )
        return true
      } else {
        this.log(
          'Servidor Local',
          'WARN',
          `Servidor responde mas status ${response.status}`
        )
        return true
      }
    } catch (error: any) {
      this.log(
        'Servidor Local',
        'FAIL',
        'Servidor não está rodando ou inacessível',
        { error: error.message }
      )
      return false
    }
  }

  async runAllTests() {
    console.log('🛡️ TESTE ESPECÍFICO DO MIDDLEWARE DE AUTENTICAÇÃO')
    console.log('='.repeat(50))
    console.log(`🌐 URL: ${LOCAL_URL}`)
    console.log(`📅 Data: ${new Date().toISOString()}`)
    console.log()
    
    // Verificar se servidor está rodando
    const serverRunning = await this.testServerReachability()
    
    if (!serverRunning) {
      console.log('\n❌ ERRO: Servidor não está rodando!')
      console.log('💡 Execute: npm run dev')
      return
    }
    
    // Executar testes em sequência
    await this.testUnauthorizedAccess()
    await this.testChatRouteProtection()
    await this.testOtherProtectedRoutes()
    await this.testPublicRoutes()
    await this.testTokenValidation()
    
    // Resumo final
    this.printSummary()
  }

  private printSummary() {
    console.log('\n📊 RESUMO DOS TESTES')
    console.log('='.repeat(30))
    
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warnings = this.results.filter(r => r.status === 'WARN').length
    const total = this.results.length
    
    console.log(`✅ Passou: ${passed}`)
    console.log(`❌ Falhou: ${failed}`)
    console.log(`⚠️ Avisos: ${warnings}`)
    console.log(`📊 Total: ${total}`)
    
    const successRate = Math.round((passed / total) * 100)
    console.log(`\n🎯 Taxa de sucesso: ${successRate}%`)
    
    if (failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:')
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`))
    }
    
    if (warnings > 0) {
      console.log('\n⚠️ AVISOS:')
      this.results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`))
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:')
    if (failed === 0 && warnings <= 2) {
      console.log('✅ Middleware funcionando corretamente!')
      console.log('   Pode prosseguir para testes de autenticação completa')
    } else {
      console.log('🔧 Verificar e corrigir problemas identificados')
      console.log('   Especialmente rotas que deveriam estar protegidas')
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tests = new MiddlewareTests()
  tests.runAllTests().catch(console.error)
}

export default MiddlewareTests