import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PromptCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const whereClause: any = {
      isPublic: true
    }
    
    if (category) {
      whereClause.category = category.toUpperCase() as PromptCategory
    }

    const templates = await prisma.promptTemplate.findMany({
      where: whereClause,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, category, templateContent, variables, isPublic } = body

    if (!name || !templateContent || !category) {
      return NextResponse.json(
        { error: 'Name, template content and category are required' },
        { status: 400 }
      )
    }

    const template = await prisma.promptTemplate.create({
      data: {
        name,
        description,
        category: category.toUpperCase() as PromptCategory,
        templateContent,
        variables: variables || [],
        isPublic: isPublic ?? true,
        createdBy: user.id
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}