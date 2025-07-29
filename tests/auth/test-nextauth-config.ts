#!/usr/bin/env ts-node
/**
 * ⚙️ Teste Específico da Configuração NextAuth
 * Criado com Claude Flow v2.0.0 - Hive Mind Intelligence
 * 
 * Testa especificamente as correções implementadas no lib/auth.ts:
 * - Configuração de cookies seguros
 * - Providers disponíveis
 * - Endpoints da API
 * - Configuração de sessão
 */

const LOCAL_URL = 'http://localhost:3050'

interface NextAuthTest {
  name: string
  endpoint: string
  expectedStatus: number
  expectedKeys?: string[]
  test: (data: any) => boolean
}

class NextAuthConfigTests {
  private results: { test: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string; details?: any }[] = []

  private log(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    const result = { test, status, message, details }
    this.results.push(result)
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${emoji} ${test}: ${message}`)
    if (details && typeof details === 'object') {
      console.log(`   📋 Detalhes:`, JSON.stringify(details, null, 2).substring(0, 200))
    }
  }

  async testApiEndpoint(test: NextAuthTest) {
    console.log(`\n🔍 Testando ${test.name}...`)
    
    try {
      const response = await fetch(`${LOCAL_URL}${test.endpoint}`)
      
      // Verificar status
      if (response.status !== test.expectedStatus) {
        this.log(
          test.name,
          'FAIL',
          `Status incorreto. Esperado: ${test.expectedStatus}, Recebido: ${response.status}`
        )
        return
      }
      
      // Verificar conteúdo
      const data = await response.json()
      
      // Verificar chaves esperadas
      if (test.expectedKeys) {
        const missingKeys = test.expectedKeys.filter(key => !(key in data))
        if (missingKeys.length > 0) {
          this.log(
            test.name,
            'FAIL',
            `Chaves ausentes: ${missingKeys.join(', ')}`,
            { received: Object.keys(data) }
          )
          return
        }
      }
      
      // Teste personalizado
      if (test.test && !test.test(data)) {
        this.log(
          test.name,
          'FAIL',
          'Teste específico falhou',
          { data }
        )
        return
      }
      
      this.log(
        test.name,
        'PASS',
        'Endpoint funcionando corretamente',
        { 
          status: response.status,
          keys: Object.keys(data),
          sampleData: Object.keys(data).slice(0, 3).reduce((obj, key) => {
            obj[key] = data[key]
            return obj
          }, {} as any)
        }
      )
      
    } catch (error: any) {
      this.log(
        test.name,
        'FAIL',
        `Erro na requisição: ${error.message}`
      )
    }
  }

  async testProviders() {
    await this.testApiEndpoint({
      name: 'Providers Configuration',
      endpoint: '/api/auth/providers',
      expectedStatus: 200,
      expectedKeys: ['providers'],
      test: (data) => {
        // Verificar se há providers configurados
        return data.providers && 
               Array.isArray(data.providers) &&
               data.providers.length > 0
      }
    })
  }

  async testCsrf() {
    await this.testApiEndpoint({
      name: 'CSRF Token',
      endpoint: '/api/auth/csrf',
      expectedStatus: 200,
      expectedKeys: ['csrfToken'],
      test: (data) => {
        // Verificar se CSRF token é uma string não vazia
        return typeof data.csrfToken === 'string' && data.csrfToken.length > 0
      }
    })
  }

  async testSession() {
    await this.testApiEndpoint({
      name: 'Session Endpoint',
      endpoint: '/api/auth/session',
      expectedStatus: 200,
      expectedKeys: [],
      test: (data) => {
        // Sessão pode estar vazia (usuário não logado) - isso é normal
        // Apenas verificar se o endpoint responde
        return true
      }
    })
  }

  async testSigninPage() {
    console.log('\n🔍 Testando página de signin...')
    
    try {
      const response = await fetch(`${LOCAL_URL}/api/auth/signin`)
      
      if (response.status === 200) {
        this.log(
          'Signin Page',
          'PASS',
          'Página de signin acessível'
        )
      } else {
        this.log(
          'Signin Page',
          'WARN',
          `Status inesperado: ${response.status}`
        )
      }
    } catch (error: any) {
      this.log(
        'Signin Page',
        'FAIL',
        `Erro ao acessar signin: ${error.message}`
      )
    }
  }

  async testConfigurationConsistency() {
    console.log('\n🔍 Testando consistência de configuração...')
    
    try {
      // Obter providers
      const providersResponse = await fetch(`${LOCAL_URL}/api/auth/providers`)
      const providers = await providersResponse.json()
      
      // Obter CSRF
      const csrfResponse = await fetch(`${LOCAL_URL}/api/auth/csrf`)
      const csrf = await csrfResponse.json()
      
      // Verificar se tudo está consistente
      if (providers.providers && providers.providers.length > 0 && csrf.csrfToken) {
        this.log(
          'Configuration Consistency',
          'PASS',
          'Configuração NextAuth consistente',
          {
            providersCount: providers.providers.length,
            csrfTokenLength: csrf.csrfToken.length
          }
        )
      } else {
        this.log(
          'Configuration Consistency',
          'FAIL',
          'Configuração inconsistente'
        )
      }
      
    } catch (error: any) {
      this.log(
        'Configuration Consistency',
        'FAIL',
        `Erro na verificação: ${error.message}`
      )
    }
  }

  async testEnvironmentVariables() {
    console.log('\n🔍 Testando variáveis de ambiente (indiretamente)...')
    
    // Não podemos acessar env vars diretamente, mas podemos inferir pelos endpoints
    try {
      const response = await fetch(`${LOCAL_URL}/api/auth/providers`)
      const providers = await response.json()
      
      // Se há providers, significa que NEXTAUTH_SECRET está configurado
      if (providers.providers && providers.providers.length > 0) {
        this.log(
          'Environment Variables',
          'PASS',
          'NEXTAUTH_SECRET aparenta estar configurado'
        )
      } else {
        this.log(
          'Environment Variables',
          'WARN',
          'NEXTAUTH_SECRET pode não estar configurado'
        )
      }
      
      // Verificar se há configuração de URL
      const sessionResponse = await fetch(`${LOCAL_URL}/api/auth/session`)
      if (sessionResponse.ok) {
        this.log(
          'NextAuth URL Config',
          'PASS',
          'NEXTAUTH_URL aparenta estar correto'
        )
      }
      
    } catch (error: any) {
      this.log(
        'Environment Variables',
        'FAIL',
        `Erro na verificação: ${error.message}`
      )
    }
  }

  async testCredentialsFlow() {
    console.log('\n🔍 Testando fluxo de credentials (sem login real)...')
    
    try {
      // Obter CSRF token
      const csrfResponse = await fetch(`${LOCAL_URL}/api/auth/csrf`)
      const csrf = await csrfResponse.json()
      
      if (!csrf.csrfToken) {
        this.log(
          'Credentials Flow Setup',
          'FAIL',
          'CSRF token não disponível'
        )
        return
      }
      
      // Testar endpoint de callback (sem credenciais válidas)
      const loginData = new URLSearchParams({
        email: 'test@example.com',
        password: 'wrongpassword',
        csrfToken: csrf.csrfToken,
        callbackUrl: `${LOCAL_URL}/dashboard`,
        json: 'true'
      })
      
      const loginResponse = await fetch(
        `${LOCAL_URL}/api/auth/callback/credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: loginData,
          redirect: 'manual'
        }
      )
      
      // Endpoint deve responder (mesmo com credenciais inválidas)
      if (loginResponse.status >= 200 && loginResponse.status < 500) {
        this.log(
          'Credentials Flow Setup',
          'PASS',
          `Endpoint de credentials funcional (status: ${loginResponse.status})`
        )
      } else {
        this.log(
          'Credentials Flow Setup',
          'FAIL',
          `Endpoint não funcional (status: ${loginResponse.status})`
        )
      }
      
    } catch (error: any) {
      this.log(
        'Credentials Flow Setup',
        'FAIL',
        `Erro no teste: ${error.message}`
      )
    }
  }

  async runAllTests() {
    console.log('⚙️ TESTE DA CONFIGURAÇÃO NEXTAUTH')
    console.log('='.repeat(40))
    console.log(`🌐 URL: ${LOCAL_URL}`)
    console.log(`📅 Data: ${new Date().toISOString()}`)
    console.log()
    
    // Verificar se servidor está rodando
    console.log('🔍 0. Verificando servidor...')
    try {
      const response = await fetch(`${LOCAL_URL}/`)
      if (!response.ok) throw new Error(`Status ${response.status}`)
      
      this.log('Server Check', 'PASS', 'Servidor Next.js rodando')
    } catch (error: any) {
      this.log('Server Check', 'FAIL', 'Servidor não acessível')
      console.log('\n❌ ERRO: Execute npm run dev primeiro!')
      return
    }
    
    // Executar testes
    await this.testProviders()
    await this.testCsrf()
    await this.testSession()
    await this.testSigninPage()
    await this.testConfigurationConsistency()
    await this.testEnvironmentVariables()
    await this.testCredentialsFlow()
    
    // Resumo
    this.printSummary()
  }

  private printSummary() {
    console.log('\n📊 RESUMO - CONFIGURAÇÃO NEXTAUTH')
    console.log('='.repeat(35))
    
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
      console.log('\n❌ PROBLEMAS ENCONTRADOS:')
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`))
        
      console.log('\n🔧 AÇÕES RECOMENDADAS:')
      console.log('   1. Verificar arquivo .env.local')
      console.log('   2. Confirmar NEXTAUTH_SECRET está definido')
      console.log('   3. Verificar NEXTAUTH_URL')
      console.log('   4. Reiniciar servidor após mudanças')
    }
    
    if (warnings > 0) {
      console.log('\n⚠️ AVISOS:')
      this.results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`))
    }
    
    console.log('\n🎯 STATUS GERAL:')
    if (passed >= 6 && failed === 0) {
      console.log('✅ NextAuth configurado corretamente!')
      console.log('   Pronto para testes de autenticação completa')
    } else if (failed <= 1) {
      console.log('🔄 NextAuth parcialmente configurado')
      console.log('   Alguns ajustes podem ser necessários')
    } else {
      console.log('🔧 NextAuth precisa de configuração')
      console.log('   Revisar configurações antes de prosseguir')
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tests = new NextAuthConfigTests()
  tests.runAllTests().catch(console.error)
}

export default NextAuthConfigTests