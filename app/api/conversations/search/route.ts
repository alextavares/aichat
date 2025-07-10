import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const model = searchParams.get('model')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const messageCount = searchParams.get('messageCount')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where conditions
    const whereConditions: any = {
      userId: session.user.id,
      isArchived: false
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereConditions.createdAt = {}
      if (dateFrom) {
        whereConditions.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.createdAt.lte = new Date(dateTo)
      }
    }

    // Model filter
    if (model && model !== '') {
      whereConditions.modelUsed = model
    }

    // Text search in conversation title and messages
    if (query.trim()) {
      whereConditions.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          messages: {
            some: {
              content: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        }
      ]
    }

    // Message count filter - we'll handle this after the main query
    // since it requires aggregation
    let conversations = await prisma.conversation.findMany({
      where: whereConditions,
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
      take: limit * 2, // Get more initially for message count filtering
      skip: (page - 1) * limit
    })

    // Apply message count filter
    if (messageCount) {
      conversations = conversations.filter(conv => {
        const msgCount = conv._count.messages
        switch (messageCount) {
          case 'short':
            return msgCount >= 1 && msgCount <= 10
          case 'medium':
            return msgCount >= 11 && msgCount <= 50
          case 'long':
            return msgCount > 50
          default:
            return true
        }
      })
    }

    // Apply final pagination after filtering
    conversations = conversations.slice(0, limit)

    // Sort by relevance if requested (basic implementation)
    if (sortBy === 'relevance' && query.trim()) {
      conversations.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, query)
        const bScore = calculateRelevanceScore(b, query)
        return bScore - aScore
      })
    }

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: whereConditions
    })

    // Format response with highlights
    const formattedConversations = conversations.map(conv => {
      // Find matching messages for context
      const matchingMessages = query.trim() 
        ? conv.messages.filter(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 3) // Max 3 matching messages per conversation
        : []

      // Generate title if missing
      const title = conv.title || generateTitleFromMessages(conv.messages)

      return {
        id: conv.id,
        title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        modelUsed: conv.modelUsed,
        messageCount: conv._count.messages,
        matchingMessages: matchingMessages.map(msg => ({
          id: msg.id,
          content: highlightText(msg.content, query),
          role: msg.role,
          createdAt: msg.createdAt
        })),
        preview: generatePreview(conv.messages, query)
      }
    })

    return NextResponse.json({
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      filters: {
        query,
        dateFrom,
        dateTo,
        model,
        sortBy,
        messageCount
      }
    })

  } catch (error) {
    console.error('Conversation search error:', error)
    return NextResponse.json(
      { error: 'Failed to search conversations' },
      { status: 500 }
    )
  }
}

// Helper function to calculate relevance score
function calculateRelevanceScore(conversation: any, query: string): number {
  let score = 0
  const lowerQuery = query.toLowerCase()

  // Title match (highest weight)
  if (conversation.title?.toLowerCase().includes(lowerQuery)) {
    score += 10
  }

  // Message content matches
  const messageMatches = conversation.messages.filter((msg: any) =>
    msg.content.toLowerCase().includes(lowerQuery)
  ).length

  score += messageMatches * 2

  // Recency bonus (newer conversations get slight boost)
  const daysSince = (Date.now() - new Date(conversation.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  score += Math.max(0, 5 - daysSince / 30) // Bonus decreases over time

  return score
}

// Helper function to generate title from messages
function generateTitleFromMessages(messages: any[]): string {
  if (messages.length === 0) return 'Conversa vazia'
  
  const firstUserMessage = messages.find(msg => msg.role === 'USER')
  if (firstUserMessage) {
    const content = firstUserMessage.content.slice(0, 50)
    return content.length > 47 ? content + '...' : content
  }
  
  return 'Nova conversa'
}

// Helper function to highlight matching text
function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Helper function to generate conversation preview
function generatePreview(messages: any[], query: string): string {
  if (messages.length === 0) return 'Sem mensagens'

  // If there's a search query, try to find relevant context
  if (query.trim()) {
    const matchingMessage = messages.find(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    )
    
    if (matchingMessage) {
      const content = matchingMessage.content
      const queryIndex = content.toLowerCase().indexOf(query.toLowerCase())
      
      // Get context around the match
      const start = Math.max(0, queryIndex - 50)
      const end = Math.min(content.length, queryIndex + query.length + 50)
      let preview = content.slice(start, end)
      
      if (start > 0) preview = '...' + preview
      if (end < content.length) preview = preview + '...'
      
      return preview
    }
  }

  // Default: show beginning of first user message
  const firstUserMessage = messages.find(msg => msg.role === 'USER')
  if (firstUserMessage) {
    const content = firstUserMessage.content.slice(0, 100)
    return content.length > 97 ? content + '...' : content
  }

  return 'Conversa sem conteúdo'
}