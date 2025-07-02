// Script para corrigir assinatura manualmente
// Execute com: npx tsx scripts/fix-subscription.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSubscription() {
  try {
    // ID do usuário que precisa ser corrigido
    const userId = 'cmc410nrb00009te15vuhi44r' // Alexandre
    
    // Verificar se já existe uma assinatura ativa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    })
    
    if (existingSubscription) {
      console.log('✅ Assinatura ativa já existe:', existingSubscription.id)
      return
    }
    
    // Criar nova assinatura
    const startDate = new Date()
    const expiresDate = new Date(startDate)
    expiresDate.setMonth(startDate.getMonth() + 1) // 1 mês
    
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType: 'PRO',
        status: 'ACTIVE',
        mercadoPagoPaymentId: 'manual_fix_' + Date.now(),
        startedAt: startDate,
        expiresAt: expiresDate
      }
    })
    
    console.log('✅ Assinatura criada com sucesso:', subscription)
    
    // Verificar se o usuário está com o plano correto
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (user?.planType !== 'PRO') {
      await prisma.user.update({
        where: { id: userId },
        data: { planType: 'PRO' }
      })
      console.log('✅ Plano do usuário atualizado para PRO')
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir assinatura:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscription()