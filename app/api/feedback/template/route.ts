import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      templateId,
      rating,
      comment,
      category,
      helpful,
      tags
    } = body

    // Validate required fields
    if (!templateId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Create feedback record
    const feedback = await prisma.templateFeedback.create({
      data: {
        templateId,
        userId: session.user.id,
        rating,
        comment: comment || null,
        category,
        helpful: helpful || false,
        tags: tags || [],
        metadata: JSON.stringify({
          userAgent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
          source: 'marketplace'
        })
      }
    })

    // Update template average rating
    const avgRating = await prisma.templateFeedback.aggregate({
      where: { templateId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    await prisma.template.update({
      where: { templateId },
      data: {
        averageRating: avgRating._avg.rating || 0,
        feedbackCount: avgRating._count.rating || 0
      }
    }).catch(() => {
      // Template might not exist yet, ignore error
    })

    return NextResponse.json({ 
      success: true, 
      id: feedback.id,
      averageRating: avgRating._avg.rating,
      feedbackCount: avgRating._count.rating
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get('templateId')
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Get feedback summary
    const feedback = await prisma.templateFeedback.findMany({
      where: { templateId },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const summary = await prisma.templateFeedback.aggregate({
      where: { templateId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    // Rating distribution
    const ratingDistribution = await prisma.templateFeedback.groupBy({
      by: ['rating'],
      where: { templateId },
      _count: { rating: true }
    })

    // Most common tags
    const allTags = feedback.flatMap(f => f.tags as string[])
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    return NextResponse.json({
      summary: {
        averageRating: summary._avg.rating || 0,
        totalFeedback: summary._count.rating || 0,
        helpfulCount: feedback.filter(f => f.helpful).length
      },
      feedback: feedback.map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        helpful: f.helpful,
        tags: f.tags,
        createdAt: f.createdAt,
        user: {
          name: f.user.name,
          image: f.user.profileImage
        }
      })),
      ratingDistribution,
      topTags
    })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}