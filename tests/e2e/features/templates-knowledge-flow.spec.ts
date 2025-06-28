import { test, expect } from '@playwright/test'
import { testConfig } from '../test.config'
import { login } from '../../helpers/auth.helpers'
import testUsers from '../../config/test-users.json'

test.describe('Templates & Knowledge Base Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.validUser.email, testUsers.validUser.password)
  })

  test.describe('Templates', () => {
    test('should create and use a template', async ({ page }) => {
      await page.goto('/templates')

      // Verify templates page
      await expect(page.locator('h1:has-text("Templates")')).toBeVisible()

      // Click create new template
      await page.click('button:has-text("Novo template")')

      // Fill template form
      await page.fill('input[name="name"]', 'Template de Review de Código')
      await page.fill('textarea[name="description"]', 'Template para revisar código e sugerir melhorias')
      
      // Select category
      await page.selectOption('select[name="category"]', 'CODING')

      // Add template content with variables
      const templateContent = `Revise o seguinte código {{language}}:

\`\`\`{{language}}
{{code}}
\`\`\`

Por favor, analise:
1. Qualidade do código
2. Possíveis bugs
3. Sugestões de melhoria
4. Boas práticas`

      await page.fill('textarea[name="content"]', templateContent)

      // Add variables
      await page.click('button:has-text("Adicionar variável")')
      await page.fill('input[placeholder="Nome da variável"]', 'language')
      await page.fill('input[placeholder="Descrição"]', 'Linguagem de programação')

      await page.click('button:has-text("Adicionar variável")')
      await page.fill('input[placeholder="Nome da variável"]', 'code')
      await page.fill('input[placeholder="Descrição"]', 'Código a ser revisado')

      // Save template
      await page.click('button:has-text("Salvar template")')

      // Verify success
      await expect(page.locator('text=Template criado com sucesso')).toBeVisible()

      // Use the template
      await page.click('text=Template de Review de Código')
      await page.click('button:has-text("Usar template")')

      // Fill variables
      await page.fill('input[name="language"]', 'JavaScript')
      await page.fill('textarea[name="code"]', 'function sum(a, b) { return a + b }')

      // Generate from template
      await page.click('button:has-text("Gerar")')

      // Verify redirect to chat with filled content
      await expect(page).toHaveURL('/chat')
      await expect(page.locator('textarea')).toContainText('Revise o seguinte código JavaScript')
    })

    test('should manage template categories', async ({ page }) => {
      await page.goto('/templates')

      // Filter by category
      const categories = ['GENERAL', 'CODING', 'WRITING', 'BUSINESS', 'CREATIVE']
      
      for (const category of categories) {
        await page.click(`button:has-text("${category}")`)
        
        // Verify filtered results
        const templates = page.locator('[data-testid="template-card"]')
        const count = await templates.count()
        
        if (count > 0) {
          // Verify all templates have the selected category
          for (let i = 0; i < count; i++) {
            await expect(templates.nth(i)).toContainText(category)
          }
        }
      }

      // Clear filter
      await page.click('button:has-text("Todos")')
    })

    test('should search templates', async ({ page }) => {
      await page.goto('/templates')

      // Search for templates
      await page.fill('input[placeholder="Buscar templates"]', 'email')

      // Verify search results
      await page.waitForTimeout(500) // Debounce
      
      const templates = page.locator('[data-testid="template-card"]')
      const count = await templates.count()
      
      if (count > 0) {
        // Verify results contain search term
        for (let i = 0; i < count; i++) {
          const text = await templates.nth(i).textContent()
          expect(text?.toLowerCase()).toContain('email')
        }
      }
    })

    test('should edit template', async ({ page }) => {
      await page.goto('/templates')

      // Find a user template
      const userTemplate = page.locator('[data-testid="template-card"][data-owner="user"]').first()
      
      if (await userTemplate.isVisible()) {
        await userTemplate.hover()
        await userTemplate.locator('button[aria-label="Editar"]').click()

        // Edit template
        await page.fill('input[name="name"]', 'Template Editado')
        await page.click('button:has-text("Salvar alterações")')

        // Verify success
        await expect(page.locator('text=Template atualizado')).toBeVisible()
        await expect(page.locator('text=Template Editado')).toBeVisible()
      }
    })

    test('should share template publicly', async ({ page }) => {
      await page.goto('/templates')

      // Find a user template
      const userTemplate = page.locator('[data-testid="template-card"][data-owner="user"]').first()
      
      if (await userTemplate.isVisible()) {
        await userTemplate.hover()
        await userTemplate.locator('button[aria-label="Compartilhar"]').click()

        // Toggle public sharing
        await page.click('text=Tornar público')
        await page.click('button:has-text("Confirmar")')

        // Verify template is now public
        await expect(page.locator('text=Template compartilhado publicamente')).toBeVisible()
        await expect(userTemplate.locator('[data-testid="public-badge"]')).toBeVisible()
      }
    })

    test('should duplicate template', async ({ page }) => {
      await page.goto('/templates')

      // Find any template
      const template = page.locator('[data-testid="template-card"]').first()
      
      if (await template.isVisible()) {
        const originalName = await template.locator('[data-testid="template-name"]').textContent()
        
        await template.hover()
        await template.locator('button[aria-label="Duplicar"]').click()

        // Verify duplication form
        await expect(page.locator(`input[value="${originalName} (Cópia)"]`)).toBeVisible()
        
        // Save duplicate
        await page.click('button:has-text("Duplicar")')

        // Verify success
        await expect(page.locator('text=Template duplicado')).toBeVisible()
        await expect(page.locator(`text=${originalName} (Cópia)`)).toBeVisible()
      }
    })

    test('should delete template', async ({ page }) => {
      await page.goto('/templates')

      // Find a user template
      const userTemplate = page.locator('[data-testid="template-card"][data-owner="user"]').last()
      
      if (await userTemplate.isVisible()) {
        const templateName = await userTemplate.locator('[data-testid="template-name"]').textContent()
        
        await userTemplate.hover()
        await userTemplate.locator('button[aria-label="Excluir"]').click()

        // Confirm deletion
        await expect(page.locator('text=Confirmar exclusão')).toBeVisible()
        await page.click('button:has-text("Excluir")')

        // Verify deletion
        await expect(page.locator('text=Template excluído')).toBeVisible()
        await expect(page.locator(`text=${templateName}`)).toBeHidden()
      }
    })
  })

  test.describe('Knowledge Base', () => {
    test('should add document to knowledge base', async ({ page }) => {
      await page.goto('/knowledge')

      // Verify knowledge base page
      await expect(page.locator('h1:has-text("Base de Conhecimento")')).toBeVisible()

      // Click add new
      await page.click('button:has-text("Adicionar conhecimento")')

      // Select document type
      await page.click('button:has-text("Documento")')

      // Fill document form
      await page.fill('input[name="title"]', 'Guia de Boas Práticas')
      await page.fill('textarea[name="content"]', `# Boas Práticas de Desenvolvimento

## Clean Code
- Use nomes descritivos
- Funções pequenas e focadas
- Evite comentários desnecessários

## SOLID Principles
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion`)

      // Add tags
      await page.fill('input[placeholder="Adicionar tag"]', 'desenvolvimento')
      await page.keyboard.press('Enter')
      await page.fill('input[placeholder="Adicionar tag"]', 'boas-praticas')
      await page.keyboard.press('Enter')

      // Save document
      await page.click('button:has-text("Salvar")')

      // Verify success
      await expect(page.locator('text=Documento adicionado')).toBeVisible()
      await expect(page.locator('text=Guia de Boas Práticas')).toBeVisible()
    })

    test('should add webpage to knowledge base', async ({ page }) => {
      await page.goto('/knowledge')

      // Add new webpage
      await page.click('button:has-text("Adicionar conhecimento")')
      await page.click('button:has-text("Página Web")')

      // Fill webpage form
      await page.fill('input[name="url"]', 'https://example.com/docs')
      await page.fill('input[name="title"]', 'Documentação Externa')
      
      // Fetch content (mock)
      await page.click('button:has-text("Buscar conteúdo")')
      
      // Wait for content
      await expect(page.locator('text=Conteúdo carregado')).toBeVisible()

      // Save webpage
      await page.click('button:has-text("Salvar")')

      // Verify success
      await expect(page.locator('text=Página web adicionada')).toBeVisible()
    })

    test('should add FAQ to knowledge base', async ({ page }) => {
      await page.goto('/knowledge')

      // Add new FAQ
      await page.click('button:has-text("Adicionar conhecimento")')
      await page.click('button:has-text("FAQ")')

      // Fill FAQ form
      await page.fill('input[name="title"]', 'Perguntas Frequentes do Produto')

      // Add Q&A pairs
      await page.click('button:has-text("Adicionar pergunta")')
      await page.fill('input[placeholder="Pergunta"]', 'Como faço para resetar minha senha?')
      await page.fill('textarea[placeholder="Resposta"]', 'Clique em "Esqueci minha senha" na tela de login')

      await page.click('button:has-text("Adicionar pergunta")')
      await page.fill('input[placeholder="Pergunta"]', 'Qual o limite de mensagens?')
      await page.fill('textarea[placeholder="Resposta"]', 'O plano gratuito permite 10 mensagens por dia')

      // Save FAQ
      await page.click('button:has-text("Salvar")')

      // Verify success
      await expect(page.locator('text=FAQ adicionado')).toBeVisible()
    })

    test('should upload PDF document', async ({ page }) => {
      await page.goto('/knowledge')

      // Add document via upload
      await page.click('button:has-text("Adicionar conhecimento")')
      await page.click('button:has-text("Upload de arquivo")')

      // Upload file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Mock PDF content'),
      })

      // Wait for processing
      await expect(page.locator('text=Processando arquivo')).toBeVisible()
      await expect(page.locator('text=Arquivo processado')).toBeVisible({ timeout: 10000 })

      // Add metadata
      await page.fill('input[name="title"]', 'Documento Importado')
      await page.click('button:has-text("Salvar")')

      // Verify success
      await expect(page.locator('text=Documento adicionado')).toBeVisible()
    })

    test('should search knowledge base', async ({ page }) => {
      await page.goto('/knowledge')

      // Search knowledge base
      await page.fill('input[placeholder="Buscar na base de conhecimento"]', 'boas práticas')
      
      // Verify search results
      await page.waitForTimeout(500) // Debounce
      
      const results = page.locator('[data-testid="knowledge-item"]')
      const count = await results.count()
      
      if (count > 0) {
        // Verify results are relevant
        for (let i = 0; i < count; i++) {
          const text = await results.nth(i).textContent()
          expect(text?.toLowerCase()).toMatch(/boas práticas|best practices/)
        }
      }
    })

    test('should use knowledge in chat', async ({ page }) => {
      await page.goto('/knowledge')

      // Find a knowledge item
      const knowledgeItem = page.locator('[data-testid="knowledge-item"]').first()
      
      if (await knowledgeItem.isVisible()) {
        const title = await knowledgeItem.locator('[data-testid="knowledge-title"]').textContent()
        
        // Use in chat
        await knowledgeItem.click()
        await page.click('button:has-text("Usar no chat")')

        // Verify redirect to chat
        await expect(page).toHaveURL('/chat')
        
        // Verify knowledge context is added
        await expect(page.locator(`text=Contexto: ${title}`)).toBeVisible()
      }
    })

    test('should edit knowledge item', async ({ page }) => {
      await page.goto('/knowledge')

      // Find an editable item
      const item = page.locator('[data-testid="knowledge-item"]').first()
      
      if (await item.isVisible()) {
        await item.hover()
        await item.locator('button[aria-label="Editar"]').click()

        // Edit content
        const contentField = page.locator('textarea[name="content"]')
        await contentField.fill(await contentField.inputValue() + '\n\n## Seção Adicionada')

        // Save changes
        await page.click('button:has-text("Salvar alterações")')

        // Verify success
        await expect(page.locator('text=Conhecimento atualizado')).toBeVisible()
      }
    })

    test('should organize with tags', async ({ page }) => {
      await page.goto('/knowledge')

      // Filter by tag
      const tagButton = page.locator('[data-testid="tag-filter"]').first()
      
      if (await tagButton.isVisible()) {
        const tagName = await tagButton.textContent()
        await tagButton.click()

        // Verify filtered results
        const items = page.locator('[data-testid="knowledge-item"]')
        const count = await items.count()
        
        for (let i = 0; i < count; i++) {
          await expect(items.nth(i).locator(`[data-testid="tag"]:has-text("${tagName}")`)).toBeVisible()
        }
      }
    })

    test('should export knowledge base', async ({ page }) => {
      await page.goto('/knowledge')

      // Click export
      await page.click('button:has-text("Exportar base")')

      // Select export options
      await page.click('text=Formato JSON')
      await page.check('input[value="documents"]')
      await page.check('input[value="faqs"]')

      // Export
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("Exportar")')
      ])

      expect(download.suggestedFilename()).toMatch(/knowledge-base.*\.json/)
    })

    test('should show knowledge statistics', async ({ page }) => {
      await page.goto('/knowledge')

      // Open statistics
      await page.click('button:has-text("Estatísticas")')

      // Verify statistics modal
      await expect(page.locator('text=Estatísticas da base')).toBeVisible()
      await expect(page.locator('text=/Total de itens:.*\\d+/')).toBeVisible()
      await expect(page.locator('text=/Documentos:.*\\d+/')).toBeVisible()
      await expect(page.locator('text=/FAQs:.*\\d+/')).toBeVisible()
      await expect(page.locator('text=/Tags únicas:.*\\d+/')).toBeVisible()
    })
  })

  test('should integrate templates with knowledge base', async ({ page }) => {
    await page.goto('/templates')

    // Create template that uses knowledge base
    await page.click('button:has-text("Novo template")')
    
    await page.fill('input[name="name"]', 'Template com Conhecimento')
    await page.fill('textarea[name="content"]', 'Baseado na nossa documentação sobre {{topic}}, responda: {{question}}')
    
    // Link knowledge base
    await page.click('button:has-text("Vincular conhecimento")')
    
    // Select knowledge items
    const knowledgeModal = page.locator('[role="dialog"]')
    await knowledgeModal.locator('input[type="checkbox"]').first().check()
    await knowledgeModal.locator('button:has-text("Vincular")').click()

    // Save template
    await page.click('button:has-text("Salvar template")')

    // Verify template shows linked knowledge
    await expect(page.locator('[data-testid="linked-knowledge-badge"]')).toBeVisible()
  })
})