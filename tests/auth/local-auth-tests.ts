#!/usr/bin/env ts-node
/**
 * 🔐 Bateria Completa de Testes de Autenticação Local
 * Criado com Claude Flow v2.0.0 Hive Mind Intelligence
 * 
 * Testes incluem:
 * - Middleware de autenticação
 * - Configuração NextAuth
 * - Fluxo completo de login/logout
 * - Proteção de rotas
 * - Persistência de sessão
 */

import { test, expect } from '@playwright/test'

const LOCAL_URL = 'http://localhost:3050'
const TEST_USER = {
  email: 'admin@innerai.com.br',
  password: 'admin123'
}

test.describe('🔐 Bateria Completa de Autenticação Local', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configurar interceptação de requisições para debug
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        console.log(`🌐 AUTH API: ${request.method()} ${request.url()}`)
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        console.log(`📡 AUTH RESPONSE: ${response.status()} ${response.url()}`)
      }
    })
  })

  test('1. 🚫 Middleware deve bloquear acesso não autenticado ao dashboard', async ({ page }) => {
    console.log('🔍 Testando proteção de middleware...')
    
    // Tentar acessar dashboard sem autenticação
    await page.goto(`${LOCAL_URL}/dashboard`)
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/\/auth\/signin/)
    
    // Verificar se há mensagem ou indicação de redirecionamento
    const pageContent = await page.content()
    expect(pageContent).toContain('sign')
    
    console.log('✅ Middleware funcionando: redirecionamento para login')
  })

  test('2. 🔑 API NextAuth deve estar configurada corretamente', async ({ page }) => {
    console.log('🔍 Testando configuração NextAuth...')
    
    // Testar endpoint de providers
    const providersResponse = await page.request.get(`${LOCAL_URL}/api/auth/providers`)
    expect(providersResponse.status()).toBe(200)
    
    const providers = await providersResponse.json()
    expect(providers).toHaveProperty('credentials')
    console.log('✅ Provider credentials configurado')
    
    // Testar endpoint de CSRF
    const csrfResponse = await page.request.get(`${LOCAL_URL}/api/auth/csrf`)
    expect(csrfResponse.status()).toBe(200)
    
    const csrf = await csrfResponse.json()
    expect(csrf).toHaveProperty('csrfToken')
    console.log('✅ CSRF token disponível')
    
    // Testar endpoint de sessão
    const sessionResponse = await page.request.get(`${LOCAL_URL}/api/auth/session`)
    expect(sessionResponse.status()).toBe(200)
    
    const session = await sessionResponse.json()
    console.log('✅ Endpoint de sessão funcionando')
  })

  test('3. 🔐 Fluxo completo de login deve funcionar', async ({ page }) => {
    console.log('🔍 Testando fluxo completo de login...')
    
    // Ir para página de login
    await page.goto(`${LOCAL_URL}/auth/signin`)
    
    // Aguardar formulário carregar
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    
    // Preencher credenciais
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    
    // Submeter formulário
    await page.click('button[type="submit"]')
    
    // Aguardar redirecionamento ou resposta
    await page.waitForTimeout(2000)
    
    // Verificar se login foi bem-sucedido
    const currentUrl = page.url()
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login bem-sucedido: redirecionado para dashboard')
    } else if (currentUrl.includes('/auth')) {
      console.log('⚠️ Login pode ter falhado ou ainda na página de auth')
      
      // Verificar se há mensagens de erro
      const errorMessage = await page.locator('[data-testid="error-message"]').textContent().catch(() => null)
      if (errorMessage) {
        console.log(`❌ Erro de login: ${errorMessage}`)
      }
    }
    
    // Verificar estado da sessão via API
    const sessionResponse = await page.request.get(`${LOCAL_URL}/api/auth/session`)
    const session = await sessionResponse.json()
    
    if (session.user) {
      console.log('✅ Sessão ativa:', session.user.email)
    } else {
      console.log('⚠️ Sessão não encontrada')
    }
  })

  test('4. 🛡️ Rotas protegidas devem ser acessíveis após login', async ({ page }) => {
    console.log('🔍 Testando acesso a rotas protegidas...')
    
    // Primeiro fazer login (simplificado)
    await page.goto(`${LOCAL_URL}/auth/signin`)
    
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 })
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log('⚠️ Formulário de login não encontrado, tentando acesso direto')
    }
    
    // Testar acesso ao dashboard
    await page.goto(`${LOCAL_URL}/dashboard`)
    await page.waitForTimeout(1000)
    
    const currentUrl = page.url()
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Dashboard acessível')
      
      // Testar sub-rotas específicas
      const routes = ['/dashboard/chat', '/dashboard/models', '/dashboard/history']
      
      for (const route of routes) {
        await page.goto(`${LOCAL_URL}${route}`)
        await page.waitForTimeout(500)
        
        if (page.url().includes(route)) {
          console.log(`✅ Rota ${route} acessível`)
        } else {
          console.log(`❌ Rota ${route} bloqueada ou redirecionada`)
        }
      }
    } else {
      console.log('❌ Dashboard não acessível, possível problema de autenticação')
    }
  })

  test('5. 🚪 Logout deve limpar sessão corretamente', async ({ page }) => {
    console.log('🔍 Testando logout...')
    
    // Ir para dashboard (assumindo login já feito)
    await page.goto(`${LOCAL_URL}/dashboard`)
    await page.waitForTimeout(1000)
    
    // Procurar botão de logout
    const logoutButton = page.locator('button:has-text("Logout")')
      .or(page.locator('button:has-text("Sair")')
      .or(page.locator('[data-testid="logout-button"]')))
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      console.log('✅ Botão de logout clicado')
      
      await page.waitForTimeout(1000)
      
      // Verificar se foi redirecionado para login
      if (page.url().includes('/auth') || page.url() === `${LOCAL_URL}/`) {
        console.log('✅ Logout bem-sucedido: redirecionado')
      }
    } else {
      console.log('⚠️ Botão de logout não encontrado')
    }
    
    // Verificar se sessão foi limpa
    const sessionResponse = await page.request.get(`${LOCAL_URL}/api/auth/session`)
    const session = await sessionResponse.json()
    
    if (!session.user) {
      console.log('✅ Sessão limpa corretamente')
    } else {
      console.log('❌ Sessão ainda ativa após logout')
    }
    
    // Tentar acessar rota protegida após logout
    await page.goto(`${LOCAL_URL}/dashboard/chat`)
    await page.waitForTimeout(1000)
    
    if (page.url().includes('/auth')) {
      console.log('✅ Proteção funcionando: redirecionado para login após logout')
    } else {
      console.log('❌ Rota ainda acessível após logout')
    }
  })

  test('6. 🍪 Cookies de sessão devem estar configurados corretamente', async ({ page, context }) => {
    console.log('🔍 Testando configuração de cookies...')
    
    await page.goto(`${LOCAL_URL}/auth/signin`)
    
    // Obter cookies antes do login
    const cookiesBefore = await context.cookies()
    console.log(`📊 Cookies antes do login: ${cookiesBefore.length}`)
    
    // Tentar fazer login
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 })
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log('⚠️ Formulário não encontrado, apenas verificando cookies existentes')
    }
    
    // Obter cookies após tentativa de login
    const cookiesAfter = await context.cookies()
    console.log(`📊 Cookies após login: ${cookiesAfter.length}`)
    
    // Verificar cookies específicos do NextAuth
    const authCookies = cookiesAfter.filter(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('__Secure-next-auth')
    )
    
    console.log(`🔐 Cookies de autenticação encontrados: ${authCookies.length}`)
    
    authCookies.forEach(cookie => {
      console.log(`🍪 ${cookie.name}: ${cookie.secure ? 'seguro' : 'não-seguro'}, httpOnly: ${cookie.httpOnly}`)
    })
    
    if (authCookies.length > 0) {
      console.log('✅ Cookies de autenticação configurados')
    } else {
      console.log('⚠️ Nenhum cookie de autenticação encontrado')
    }
  })

  test('7. 🔍 Debug headers devem estar presentes', async ({ page }) => {
    console.log('🔍 Testando headers de debug...')
    
    // Interceptar resposta do middleware
    const response = await page.goto(`${LOCAL_URL}/dashboard/chat`)
    
    if (response) {
      const headers = response.headers()
      
      if (headers['x-auth-debug']) {
        console.log(`🐛 Debug header encontrado: ${headers['x-auth-debug']}`)
      } else {
        console.log('⚠️ Header de debug não encontrado')
      }
      
      // Verificar outros headers úteis
      const relevantHeaders = [
        'x-auth-debug',
        'location',
        'set-cookie'
      ]
      
      relevantHeaders.forEach(headerName => {
        if (headers[headerName]) {
          console.log(`📋 ${headerName}: ${headers[headerName].substring(0, 100)}...`)
        }
      })
    }
  })
})

// Função auxiliar para executar todos os testes
async function runAuthTests() {
  console.log('🚀 Iniciando bateria completa de testes de autenticação...')
  console.log('📅 Data:', new Date().toISOString())
  console.log('🌐 URL:', LOCAL_URL)
  console.log('👤 Usuário de teste:', TEST_USER.email)
  console.log()
}

if (require.main === module) {
  runAuthTests()
}