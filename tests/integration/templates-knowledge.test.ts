import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { mockUsers, mockSessions } from '../fixtures/auth.fixtures'
import { mockTemplates, mockKnowledgeBase } from '../fixtures/data.fixtures'

// Import route handlers
import { GET as getTemplatesHandler, POST as createTemplateHandler } from '@/app/api/templates/route'
import { GET as getTemplateHandler, PUT as updateTemplateHandler, DELETE as deleteTemplateHandler } from '@/app/api/templates/[id]/route'
import { POST as useTemplateHandler } from '@/app/api/templates/[id]/use/route'
import { GET as getKnowledgeHandler, POST as createKnowledgeHandler } from '@/app/api/knowledge/route'
import { GET as getKnowledgeItemHandler, PUT as updateKnowledgeItemHandler, DELETE as deleteKnowledgeItemHandler } from '@/app/api/knowledge/[id]/route'

// Mock external dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    template: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    knowledgeBase: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Mock PDF extraction
jest.mock('pdf-parse', () => jest.fn())

describe('Templates & Knowledge Base Integration Tests', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Templates API', () => {
    describe('GET /api/templates', () => {
      test('should return user and public templates', async () => {
        const mockRequest = new NextRequest('http://localhost:3000/api/templates')

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findMany as jest.Mock).mockResolvedValue([
          mockTemplates.codeReview,
          mockTemplates.emailDraft,
          mockTemplates.public,
        ])

        const response = await getTemplatesHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(3)
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: mockTemplates.codeReview.id,
              name: mockTemplates.codeReview.name,
              category: 'CODING',
              isPublic: false,
            }),
            expect.objectContaining({
              id: mockTemplates.public.id,
              name: mockTemplates.public.name,
              isPublic: true,
            }),
          ])
        )

        expect(prisma.template.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { userId: mockSessions.pro.user.id },
              { isPublic: true },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })
      })

      test('should filter templates by category', async () => {
        const mockRequest = new NextRequest(
          'http://localhost:3000/api/templates?category=CODING'
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findMany as jest.Mock).mockResolvedValue([
          mockTemplates.codeReview,
        ])

        const response = await getTemplatesHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(1)
        expect(data[0].category).toBe('CODING')

        expect(prisma.template.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { userId: mockSessions.pro.user.id },
              { isPublic: true },
            ],
            category: 'CODING',
          },
          orderBy: { createdAt: 'desc' },
        })
      })

      test('should search templates by name', async () => {
        const mockRequest = new NextRequest(
          'http://localhost:3000/api/templates?search=review'
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findMany as jest.Mock).mockResolvedValue([
          mockTemplates.codeReview,
        ])

        const response = await getTemplatesHandler(mockRequest)

        expect(response.status).toBe(200)
        expect(prisma.template.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { userId: mockSessions.pro.user.id },
              { isPublic: true },
            ],
            name: {
              contains: 'review',
              mode: 'insensitive',
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      })
    })

    describe('POST /api/templates', () => {
      test('should create new template', async () => {
        const requestData = {
          name: 'New Template',
          description: 'A new template for testing',
          content: 'Template content with {{variable}}',
          category: 'GENERAL',
          variables: ['variable'],
          isPublic: false,
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/templates', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.create as jest.Mock).mockResolvedValue({
          id: 'new-template-id',
          ...requestData,
          userId: mockSessions.pro.user.id,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = await createTemplateHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data).toMatchObject({
          id: 'new-template-id',
          name: requestData.name,
          content: requestData.content,
        })

        expect(prisma.template.create).toHaveBeenCalledWith({
          data: {
            ...requestData,
            userId: mockSessions.pro.user.id,
          },
        })
      })

      test('should validate template variables', async () => {
        const requestData = {
          name: 'Invalid Template',
          content: 'Content with {{var1}} and {{var2}}',
          category: 'GENERAL',
          variables: ['var1'], // Missing var2
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/templates', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)

        const response = await createTemplateHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('variáveis')
      })

      test('should enforce template limits for free users', async () => {
        const requestData = {
          name: 'Template',
          content: 'Content',
          category: 'GENERAL',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/templates', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
        ;(prisma.template.findMany as jest.Mock).mockResolvedValue(
          Array(5).fill(mockTemplates.codeReview) // Already at limit
        )

        const response = await createTemplateHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Limite de templates atingido para o plano gratuito')
      })
    })

    describe('POST /api/templates/[id]/use', () => {
      test('should use template and track usage', async () => {
        const templateId = mockTemplates.codeReview.id
        const requestData = {
          variables: {
            code: 'function test() { return true; }',
            language: 'JavaScript',
          },
        }

        const mockRequest = new NextRequest(
          `http://localhost:3000/api/templates/${templateId}/use`,
          {
            method: 'POST',
            body: JSON.stringify(requestData),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplates.codeReview)
        ;(prisma.template.update as jest.Mock).mockResolvedValue({
          ...mockTemplates.codeReview,
          usageCount: mockTemplates.codeReview.usageCount + 1,
        })

        const response = await useTemplateHandler(
          mockRequest,
          { params: { id: templateId } }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.content).toContain('function test() { return true; }')
        expect(data.content).toContain('JavaScript')

        expect(prisma.template.update).toHaveBeenCalledWith({
          where: { id: templateId },
          data: { usageCount: { increment: 1 } },
        })
      })

      test('should handle missing variables', async () => {
        const templateId = mockTemplates.codeReview.id
        const requestData = {
          variables: {
            code: 'test code',
            // Missing 'language' variable
          },
        }

        const mockRequest = new NextRequest(
          `http://localhost:3000/api/templates/${templateId}/use`,
          {
            method: 'POST',
            body: JSON.stringify(requestData),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplates.codeReview)

        const response = await useTemplateHandler(
          mockRequest,
          { params: { id: templateId } }
        )
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Variáveis faltando')
      })
    })

    describe('PUT /api/templates/[id]', () => {
      test('should update own template', async () => {
        const templateId = mockTemplates.codeReview.id
        const updateData = {
          name: 'Updated Code Review',
          description: 'Updated description',
        }

        const mockRequest = new NextRequest(
          `http://localhost:3000/api/templates/${templateId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateData),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplates.codeReview)
        ;(prisma.template.update as jest.Mock).mockResolvedValue({
          ...mockTemplates.codeReview,
          ...updateData,
          updatedAt: new Date(),
        })

        const response = await updateTemplateHandler(
          mockRequest,
          { params: { id: templateId } }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.name).toBe(updateData.name)
        expect(data.description).toBe(updateData.description)
      })

      test('should not allow updating other users templates', async () => {
        const templateId = mockTemplates.codeReview.id
        const mockRequest = new NextRequest(
          `http://localhost:3000/api/templates/${templateId}`,
          {
            method: 'PUT',
            body: JSON.stringify({ name: 'Hacked' }),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.basic) // Different user
        ;(prisma.template.findUnique as jest.Mock).mockResolvedValue({
          ...mockTemplates.codeReview,
          userId: 'other-user-id',
        })

        const response = await updateTemplateHandler(
          mockRequest,
          { params: { id: templateId } }
        )

        expect(response.status).toBe(403)
      })
    })

    describe('DELETE /api/templates/[id]', () => {
      test('should delete own template', async () => {
        const templateId = mockTemplates.codeReview.id
        const mockRequest = new NextRequest(
          `http://localhost:3000/api/templates/${templateId}`,
          { method: 'DELETE' }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.template.findUnique as jest.Mock).mockResolvedValue(mockTemplates.codeReview)
        ;(prisma.template.delete as jest.Mock).mockResolvedValue(mockTemplates.codeReview)

        const response = await deleteTemplateHandler(
          mockRequest,
          { params: { id: templateId } }
        )

        expect(response.status).toBe(204)
        expect(prisma.template.delete).toHaveBeenCalledWith({
          where: { id: templateId },
        })
      })
    })
  })

  describe('Knowledge Base API', () => {
    describe('GET /api/knowledge', () => {
      test('should return user knowledge base items', async () => {
        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge')

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([
          mockKnowledgeBase.document,
          mockKnowledgeBase.webpage,
          mockKnowledgeBase.faq,
        ])

        const response = await getKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(3)
        expect(data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'DOCUMENT',
              title: mockKnowledgeBase.document.title,
            }),
            expect.objectContaining({
              type: 'WEBPAGE',
              url: mockKnowledgeBase.webpage.url,
            }),
            expect.objectContaining({
              type: 'FAQ',
              faqs: expect.any(Array),
            }),
          ])
        )
      })

      test('should filter by type', async () => {
        const mockRequest = new NextRequest(
          'http://localhost:3000/api/knowledge?type=DOCUMENT'
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([
          mockKnowledgeBase.document,
        ])

        const response = await getKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(1)
        expect(data[0].type).toBe('DOCUMENT')
      })

      test('should search knowledge base', async () => {
        const mockRequest = new NextRequest(
          'http://localhost:3000/api/knowledge?search=api'
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.knowledgeBase.findMany as jest.Mock).mockResolvedValue([
          mockKnowledgeBase.document,
        ])

        const response = await getKnowledgeHandler(mockRequest)

        expect(response.status).toBe(200)
        expect(prisma.knowledgeBase.findMany).toHaveBeenCalledWith({
          where: {
            userId: mockSessions.pro.user.id,
            OR: [
              { title: { contains: 'api', mode: 'insensitive' } },
              { content: { contains: 'api', mode: 'insensitive' } },
              { tags: { has: 'api' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })
      })
    })

    describe('POST /api/knowledge', () => {
      test('should create document knowledge base item', async () => {
        const requestData = {
          type: 'DOCUMENT',
          title: 'New Documentation',
          content: 'This is the document content',
          tags: ['docs', 'api'],
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(5)
        ;(prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
          id: 'new-kb-id',
          ...requestData,
          userId: mockSessions.pro.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = await createKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data).toMatchObject({
          id: 'new-kb-id',
          type: 'DOCUMENT',
          title: requestData.title,
        })
      })

      test('should create webpage knowledge base item with URL validation', async () => {
        const requestData = {
          type: 'WEBPAGE',
          title: 'External API Docs',
          url: 'https://api.example.com/docs',
          content: 'Extracted content from webpage',
          tags: ['external', 'api'],
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(5)
        ;(prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
          id: 'new-webpage-kb',
          ...requestData,
          userId: mockSessions.pro.user.id,
        })

        const response = await createKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.url).toBe(requestData.url)
      })

      test('should create FAQ knowledge base item', async () => {
        const requestData = {
          type: 'FAQ',
          title: 'Product FAQs',
          faqs: [
            { question: 'What is InnerAI?', answer: 'InnerAI is an AI assistant.' },
            { question: 'How much does it cost?', answer: 'Plans start at R$39.90/month.' },
          ],
          tags: ['faq', 'product'],
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(5)
        ;(prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
          id: 'new-faq-kb',
          ...requestData,
          userId: mockSessions.pro.user.id,
        })

        const response = await createKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.faqs).toHaveLength(2)
      })

      test('should enforce knowledge base limits', async () => {
        const requestData = {
          type: 'DOCUMENT',
          title: 'New Doc',
          content: 'Content',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
        ;(prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(10) // At limit

        const response = await createKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Limite de itens na base de conhecimento atingido')
      })

      test('should handle PDF extraction', async () => {
        const pdfParse = jest.fn().mockResolvedValue({
          text: 'Extracted PDF content',
          numpages: 5,
          info: { Title: 'PDF Document' },
        })

        const requestData = {
          type: 'DOCUMENT',
          title: 'PDF Upload',
          fileData: 'base64-pdf-data',
          fileType: 'application/pdf',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/knowledge', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.knowledgeBase.count as jest.Mock).mockResolvedValue(5)
        ;(prisma.knowledgeBase.create as jest.Mock).mockResolvedValue({
          id: 'pdf-kb-id',
          type: 'DOCUMENT',
          title: 'PDF Upload',
          content: 'Extracted PDF content',
          metadata: { pages: 5, originalTitle: 'PDF Document' },
          userId: mockSessions.pro.user.id,
        })

        const response = await createKnowledgeHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.content).toBe('Extracted PDF content')
        expect(data.metadata.pages).toBe(5)
      })
    })

    describe('PUT /api/knowledge/[id]', () => {
      test('should update knowledge base item', async () => {
        const itemId = mockKnowledgeBase.document.id
        const updateData = {
          title: 'Updated Documentation',
          tags: ['updated', 'docs'],
        }

        const mockRequest = new NextRequest(
          `http://localhost:3000/api/knowledge/${itemId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateData),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
          mockKnowledgeBase.document
        )
        ;(prisma.knowledgeBase.update as jest.Mock).mockResolvedValue({
          ...mockKnowledgeBase.document,
          ...updateData,
          updatedAt: new Date(),
        })

        const response = await updateKnowledgeItemHandler(
          mockRequest,
          { params: { id: itemId } }
        )
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.title).toBe(updateData.title)
        expect(data.tags).toEqual(updateData.tags)
      })

      test('should not allow updating other users items', async () => {
        const itemId = mockKnowledgeBase.document.id
        const mockRequest = new NextRequest(
          `http://localhost:3000/api/knowledge/${itemId}`,
          {
            method: 'PUT',
            body: JSON.stringify({ title: 'Hacked' }),
          }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue({
          ...mockKnowledgeBase.document,
          userId: 'other-user-id',
        })

        const response = await updateKnowledgeItemHandler(
          mockRequest,
          { params: { id: itemId } }
        )

        expect(response.status).toBe(403)
      })
    })

    describe('DELETE /api/knowledge/[id]', () => {
      test('should delete knowledge base item', async () => {
        const itemId = mockKnowledgeBase.document.id
        const mockRequest = new NextRequest(
          `http://localhost:3000/api/knowledge/${itemId}`,
          { method: 'DELETE' }
        )

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.knowledgeBase.findUnique as jest.Mock).mockResolvedValue(
          mockKnowledgeBase.document
        )
        ;(prisma.knowledgeBase.delete as jest.Mock).mockResolvedValue(
          mockKnowledgeBase.document
        )

        const response = await deleteKnowledgeItemHandler(
          mockRequest,
          { params: { id: itemId } }
        )

        expect(response.status).toBe(204)
        expect(prisma.knowledgeBase.delete).toHaveBeenCalledWith({
          where: { id: itemId },
        })
      })
    })
  })

  describe('Cross-Feature Integration', () => {
    test('should use knowledge base in template', async () => {
      // Create a template that references knowledge base
      const templateData = {
        name: 'KB Template',
        content: 'Based on our docs: {{knowledge}}',
        category: 'GENERAL',
        variables: ['knowledge'],
      }

      const createTemplateRequest = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        body: JSON.stringify(templateData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.template.create as jest.Mock).mockResolvedValue({
        id: 'kb-template',
        ...templateData,
        userId: mockSessions.pro.user.id,
      })

      const templateResponse = await createTemplateHandler(createTemplateRequest)
      expect(templateResponse.status).toBe(201)

      // Use template with knowledge base content
      const useTemplateRequest = new NextRequest(
        'http://localhost:3000/api/templates/kb-template/use',
        {
          method: 'POST',
          body: JSON.stringify({
            variables: {
              knowledge: mockKnowledgeBase.document.content,
            },
          }),
        }
      )

      ;(prisma.template.findUnique as jest.Mock).mockResolvedValue({
        id: 'kb-template',
        ...templateData,
        userId: mockSessions.pro.user.id,
      })
      ;(prisma.template.update as jest.Mock).mockResolvedValue({
        id: 'kb-template',
        ...templateData,
        usageCount: 1,
      })

      const useResponse = await useTemplateHandler(
        useTemplateRequest,
        { params: { id: 'kb-template' } }
      )
      const useData = await useResponse.json()

      expect(useResponse.status).toBe(200)
      expect(useData.content).toContain(mockKnowledgeBase.document.content)
    })
  })
})