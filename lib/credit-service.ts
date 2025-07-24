import { prisma } from './prisma'

export class CreditService {
  // Get user's current credit balance
  static async getUserBalance(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true }
      })
      
      return user?.creditBalance || 0
    } catch (error) {
      console.error('Error getting user balance:', error)
      // Return 0 if creditBalance column doesn't exist yet
      return 0
    }
  }

  // Alias for getUserBalance (for dashboard compatibility)
  static async getBalance(userId: string): Promise<number> {
    return this.getUserBalance(userId)
  }

  // Get monthly statistics for credit usage
  static async getMonthlyStats(userId: string): Promise<{
    consumed: number
    purchased: number
  }> {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date()
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)
      endOfMonth.setHours(23, 59, 59, 999)

      const transactions = await prisma.creditTransaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          amount: true,
          type: true
        }
      })

      const consumed = transactions
        .filter(t => t.type === 'CONSUMPTION')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const purchased = transactions
        .filter(t => t.type === 'PURCHASE')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        consumed,
        purchased
      }
    } catch (error) {
      console.error('Error getting monthly stats:', error)
      // Return default values if tables don't exist yet
      return {
        consumed: 0,
        purchased: 0
      }
    }
  }

  // Removidos métodos que dependem de tabelas não existentes
  // consumeCreditsForModel e consumeCreditsForTool
  // Agora usamos apenas o método genérico consumeCredits

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
          type: 'CONSUMPTION',
          amount: -amount, // negative for consumption
          description,
          relatedId: referenceId
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
    type: string = 'PURCHASE'
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
          relatedId: packageId
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
      skip: offset
    })
  }

  // Get available credit packages (hardcoded for now)
  static async getAvailablePackages() {
    // Retornar pacotes hardcoded por enquanto
    // Em produção, isso viria de uma tabela no banco
    return [
      {
        id: 'basic',
        name: 'Pacote Básico',
        credits: 5000,
        price: 59.00,
        isActive: true
      },
      {
        id: 'popular',
        name: 'Pacote Popular',
        credits: 10000,
        price: 99.00,
        isActive: true
      },
      {
        id: 'premium',
        name: 'Pacote Premium',
        credits: 20000,
        price: 159.00,
        isActive: true
      }
    ]
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
          type: 'CONSUMPTION'
        },
        _sum: { amount: true }
      }),
      prisma.creditTransaction.aggregate({
        where: { 
          userId,
          type: 'PURCHASE'
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