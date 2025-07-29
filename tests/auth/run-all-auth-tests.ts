#!/usr/bin/env ts-node
/**
 * 🚀 Coordenador de Testes de Autenticação
 * Criado com Claude Flow v2.0.0 - Hive Mind Intelligence
 * 
 * Executa todos os testes de autenticação em sequência ou paralelo:
 * - Middleware tests
 * - NextAuth configuration tests 
 * - End-to-end authentication flow tests
 * - Production readiness tests
 */

import { spawn } from 'child_process'
import { promisify } from 'util'

interface TestSuite {
  name: string
  script: string
  description: string
  critical: boolean
}

class AuthTestCoordinator {
  private testSuites: TestSuite[] = [
    {
      name: 'Middleware Protection',
      script: 'tests/auth/test-middleware.ts',
      description: 'Testa proteção de rotas e redirecionamentos',
      critical: true
    },
    {
      name: 'NextAuth Configuration',
      script: 'tests/auth/test-nextauth-config.ts', 
      description: 'Testa configuração e endpoints NextAuth',
      critical: true
    },
    {
      name: 'Production Auth Test',
      script: 'scripts/test-auth-production.ts',
      description: 'Testa autenticação em ambiente de produção',
      critical: false
    }
  ]

  private results: {
    suite: string
    status: 'PASS' | 'FAIL' | 'SKIP'
    duration: number
    output: string
    error?: string
  }[] = []

  async runTest(suite: TestSuite): Promise<'PASS' | 'FAIL' | 'SKIP'> {
    console.log(`\n🔍 Executando: ${suite.name}`)
    console.log(`📋 ${suite.description}`)
    console.log('─'.repeat(50))
    
    const startTime = Date.now()
    
    return new Promise((resolve) => {
      const child = spawn('npx', ['tsx', suite.script], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd()
      })
      
      let output = ''
      let error = ''
      
      child.stdout?.on('data', (data) => {
        const text = data.toString()
        output += text
        process.stdout.write(text)
      })
      
      child.stderr?.on('data', (data) => {
        const text = data.toString()
        error += text
        process.stderr.write(text)
      })
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime
        const status = code === 0 ? 'PASS' : 'FAIL'
        
        this.results.push({
          suite: suite.name,
          status,
          duration,
          output,
          error: error || undefined
        })
        
        const emoji = status === 'PASS' ? '✅' : '❌'
        console.log(`\n${emoji} ${suite.name}: ${status} (${duration}ms)`)
        
        resolve(status)
      })
      
      child.on('error', (err) => {
        const duration = Date.now() - startTime
        
        this.results.push({
          suite: suite.name,
          status: 'FAIL',
          duration,
          output,
          error: err.message
        })
        
        console.log(`\n❌ ${suite.name}: ERRO (${err.message})`)
        resolve('FAIL')
      })
    })
  }

  async runSequential() {
    console.log('🔄 Executando testes em SEQUÊNCIA...')
    
    for (const suite of this.testSuites) {
      const result = await this.runTest(suite)
      
      // Se teste crítico falha, parar execução
      if (suite.critical && result === 'FAIL') {
        console.log(`\n🛑 Teste crítico falhou: ${suite.name}`)
        console.log('   Interrompendo execução para evitar testes dependentes')
        break
      }
    }
  }

  async runParallel() {
    console.log('⚡ Executando testes em PARALELO...')
    
    const promises = this.testSuites.map(suite => this.runTest(suite))
    await Promise.all(promises)
  }

  async checkPrerequisites(): Promise<boolean> {
    console.log('🔍 Verificando pré-requisitos...')
    
    // Verificar se servidor está rodando
    try {
      const response = await fetch('http://localhost:3050/')
      if (response.ok) {
        console.log('✅ Servidor Next.js está rodando')
        return true
      } else {
        console.log('❌ Servidor responde mas com erro')
        return false
      }
    } catch (error) {
      console.log('❌ Servidor Next.js não está rodando')
      console.log('💡 Execute: npm run dev')
      return false
    }
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO FINAL DE TESTES DE AUTENTICAÇÃO')
    console.log('='.repeat(60))
    
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length
    
    console.log(`📈 Resumo:`)
    console.log(`   ✅ Passou: ${passed}`)
    console.log(`   ❌ Falhou: ${failed}`)
    console.log(`   ⏭️ Pulou: ${skipped}`)
    console.log(`   📊 Total: ${total}`)
    
    if (total > 0) {
      const successRate = Math.round((passed / total) * 100)
      console.log(`   🎯 Taxa de sucesso: ${successRate}%`)
    }
    
    console.log(`\n📋 Detalhes por teste:`)
    this.results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
      console.log(`   ${emoji} ${result.suite}: ${result.status} (${result.duration}ms)`)
      
      if (result.error) {
        console.log(`      ⚠️ Erro: ${result.error.substring(0, 100)}...`)
      }
    })
    
    // Análise e recomendações
    console.log(`\n🎯 ANÁLISE E RECOMENDAÇÕES:`)
    
    if (failed === 0) {
      console.log('🎉 EXCELENTE! Todos os testes passaram!')
      console.log('   ✅ Sistema de autenticação está funcionando corretamente')
      console.log('   ✅ Pronto para deploy ou testes E2E com Playwright')
      console.log('   ✅ Middleware protegendo rotas adequadamente')
      console.log('   ✅ NextAuth configurado corretamente')
    } else if (failed === 1) {
      console.log('🔄 BOM! Apenas um teste falhou')
      console.log('   🔧 Revisar o teste que falhou antes de prosseguir')
      console.log('   ✅ Sistema geralmente funcional')
    } else {
      console.log('🔧 ATENÇÃO! Múltiplos testes falharam')
      console.log('   🛠️ Revisar configurações de autenticação')
      console.log('   🔍 Verificar variáveis de ambiente')
      console.log('   📝 Confirmar correções implementadas')
    }
    
    // Testes críticos
    const criticalSuites = this.testSuites.filter(s => s.critical)
    const criticalResults = this.results.filter(r => 
      criticalSuites.some(s => s.name === r.suite)
    )
    const criticalFailed = criticalResults.filter(r => r.status === 'FAIL').length
    
    if (criticalFailed > 0) {
      console.log(`\n🚨 CRÍTICO: ${criticalFailed} teste(s) crítico(s) falharam!`)
      console.log('   Resolver antes de continuar desenvolvimento')
    }
    
    console.log(`\n🚀 PRÓXIMOS PASSOS:`)
    if (failed === 0) {
      console.log('   1. Executar testes E2E com Playwright')
      console.log('   2. Testar fluxo completo no navegador')
      console.log('   3. Preparar para deploy em produção')
    } else {
      console.log('   1. Corrigir testes que falharam')
      console.log('   2. Re-executar bateria de testes')
      console.log('   3. Verificar logs detalhados se necessário')
    }
    
    // Informações adicionais
    console.log(`\n📖 COMANDOS ÚTEIS:`)
    console.log('   npm run dev          # Iniciar servidor de desenvolvimento')
    console.log('   npm run test:e2e      # Testes E2E com Playwright')
    console.log('   npm run build         # Build de produção')
    console.log('   npm run type-check    # Verificar tipos TypeScript')
  }

  async run(mode: 'sequential' | 'parallel' = 'sequential') {
    console.log('🚀 CLAUDE FLOW v2.0.0 - COORDENADOR DE TESTES DE AUTENTICAÇÃO')
    console.log('='.repeat(70))
    console.log(`⏰ Início: ${new Date().toISOString()}`)
    console.log(`🔄 Modo: ${mode.toUpperCase()}`)
    console.log(`📊 Testes: ${this.testSuites.length}`)
    console.log()
    
    // Verificar pré-requisitos
    const prerequisitesOk = await this.checkPrerequisites()
    if (!prerequisitesOk) {
      console.log('\n❌ Pré-requisitos não atendidos. Abortando.')
      return
    }
    
    // Executar testes
    const startTime = Date.now()
    
    if (mode === 'parallel') {
      await this.runParallel()
    } else {
      await this.runSequential()
    }
    
    const totalDuration = Date.now() - startTime
    
    console.log(`\n⏰ Tempo total: ${totalDuration}ms`)
    
    // Gerar relatório
    this.generateReport()
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const mode = args.includes('--parallel') ? 'parallel' : 'sequential'
  
  if (args.includes('--help')) {
    console.log('🚀 Coordenador de Testes de Autenticação - Claude Flow v2.0.0')
    console.log('')
    console.log('Uso:')
    console.log('  npx tsx tests/auth/run-all-auth-tests.ts [opções]')
    console.log('')
    console.log('Opções:')
    console.log('  --parallel     Executar testes em paralelo (padrão: sequencial)')
    console.log('  --help         Mostrar esta ajuda')
    console.log('')
    console.log('Pré-requisitos:')
    console.log('  - Servidor Next.js rodando (npm run dev)')
    console.log('  - Configurações de autenticação implementadas')
    console.log('')
    return
  }
  
  const coordinator = new AuthTestCoordinator()
  await coordinator.run(mode)
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

export default AuthTestCoordinator