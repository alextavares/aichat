import { prisma } from './prisma'
import { CreditTransactionType } from '@prisma/client'

export class CreditService {
  // Get user's current credit balance
  static async getUserBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true }
    })
    
    return user?.creditBalance || 0
  }

  // Consume credits for AI model usage
  static async consumeCreditsForModel(
    userId: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number,
    conversationId: string
  ): Promise<{ success: boolean; message?: string; creditsConsumed?: number }> {
    const model = await prisma.aIModel.findUnique({
      where: { id: modelId },
      select: { creditsPerInputToken: true, creditsPerOutputToken: true, name: true }
    })

    if (!model) {
      return { success: false, message: 'Model not found' }
    }

    const creditsNeeded = (inputTokens * model.creditsPerInputToken) + (outputTokens * model.creditsPerOutputToken)
    
    return this.consumeCredits(
      userId,
      creditsNeeded,
      `Chat with ${model.name} (${inputTokens} input + ${outputTokens} output tokens)`,
      conversationId,
      'conversation'
    )
  }

  // Consume credits for tool usage
  static async consumeCreditsForTool(
    userId: string,
    toolId: string,
    usageId: string
  ): Promise<{ success: boolean; message?: string; creditsConsumed?: number }> {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { creditsPerUse: true, name: true }
    })

    if (!tool) {
      return { success: false, message: 'Tool not found' }
    }

    return this.consumeCredits(
      userId,
      tool.creditsPerUse,
      `Tool usage: ${tool.name}`,
      usageId,
      'tool_usage'
    )
  }

  // Generic credit consumption with transaction
  static async consumeCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<{ success: boolean; message?: string; creditsConsumed?: number }> {
    if (amount <= 0) {
      return { success: false, message: 'Invalid credit amount' }
    }

    return prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true }
      })

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      // Check if user has enough credits
      if (user.creditBalance < amount) {
        return { 
          success: false, 
          message: `Insufficient credits. Required: ${amount}, Available: ${user.creditBalance}` 
        }
      }

      const newBalance = user.creditBalance - amount

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: newBalance }
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.CONSUMPTION,
          amount: -amount, // negative for consumption
          description,
          referenceId,
          referenceType,
          balanceBefore: user.creditBalance,
          balanceAfter: newBalance
        }
      })

      return { success: true, creditsConsumed: amount }
    })
  }

  // Add credits to user account
  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    packageId?: string,
    type: CreditTransactionType = CreditTransactionType.PURCHASE
  ): Promise<{ success: boolean; message?: string; newBalance?: number }> {
    if (amount <= 0) {
      return { success: false, message: 'Invalid credit amount' }
    }

    return prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true }
      })

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      const newBalance = user.creditBalance + amount

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: newBalance }
      })

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount, // positive for additions
          description,
          packageId,
          balanceBefore: user.creditBalance,
          balanceAfter: newBalance
        }
      })

      return { success: true, newBalance }
    })
  }

  // Get credit transaction history
  static async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        package: {
          select: { name: true, credits: true }
        }
      }
    })
  }

  // Get available credit packages
  static async getAvailablePackages() {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { credits: 'asc' }
    })
  }

  // Check if user has enough credits for operation
  static async checkCreditsAvailable(
    userId: string,
    creditsNeeded: number
  ): Promise<{ available: boolean; currentBalance: number; needed: number }> {
    const currentBalance = await this.getUserBalance(userId)
    
    return {
      available: currentBalance >= creditsNeeded,
      currentBalance,
      needed: creditsNeeded
    }
  }

  // Get user's credit statistics
  static async getUserCreditStats(userId: string) {
    const [balance, totalConsumed, totalPurchased] = await Promise.all([
      this.getUserBalance(userId),
      prisma.creditTransaction.aggregate({
        where: { 
          userId,
          type: CreditTransactionType.CONSUMPTION
        },
        _sum: { amount: true }
      }),
      prisma.creditTransaction.aggregate({
        where: { 
          userId,
          type: CreditTransactionType.PURCHASE
        },
        _sum: { amount: true }
      })
    ])

    return {
      currentBalance: balance,
      totalConsumed: Math.abs(totalConsumed._sum.amount || 0),
      totalPurchased: totalPurchased._sum.amount || 0
    }
  }
}