#!/usr/bin/env node

// Monitor específico para pagamento com cartão de crédito
const logUrl = "https://proxy-nyc1-08c13dfea8d2.ondigitalocean.app/?token=3TQlnb5cB_gCS4OYRvIBaggc6U-Dal1vn3tNygbS63qblgqhwz1H-iJAON9ZoOY8fxvtVFlHj-0XLX2pvF6Raz6Io5bmel10phAhhL8E2Nkf0rboqf4VRkW5I4M74D1Q-C1zRPfBuASlgPk0qoCQza1wYcRJPF3UOkzzNKGsKGQcEvjSeT1X_UAKgkurpqj0LqFp1J4qO6lce3YhQsSrkBvCsahmYIv4cG-T5axbAlG9HegHLdV15lhJMaGw-Rso0IBsvekB9YK0xov01n6xBwLSFCOh7fClQozKdbE_pzs0jqkV2IdMSRXFJQdkaNerKsaqoAVoa7EnJVPSRaXRi3vIyFBI9daunEKwOEI1m7H7baL-cttj5xavYZeZ0q4jr5oKKRkuojAXl4prDiDEYFI="

let lastLogLength = 0

function formatTimestamp() {
  return new Date().toLocaleTimeString('pt-BR')
}

function isPaymentRelated(line) {
  const keywords = [
    'MercadoPago',
    'payment',
    'webhook',
    'checkout',
    'subscription',
    'approved',
    'pending',
    'rejected'
  ]
  return keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))
}

async function monitorPayment() {
  console.log('🔍 MONITORAMENTO ATIVO - Pagamento com Cartão de Crédito')
  console.log('💳 Aguardando atividade de checkout...')
  console.log('⏰ Timestamp:', formatTimestamp())
  console.log('🔄 Atualizando a cada 1 segundo...\n')
  
  while (true) {
    try {
      const response = await fetch(logUrl)
      const content = await response.text()
      const lines = content.split('\n')
      
      // Verifica apenas linhas novas
      if (lines.length > lastLogLength) {
        const newLines = lines.slice(lastLogLength)
        
        newLines.forEach(line => {
          if (line.trim()) {
            if (isPaymentRelated(line)) {
              console.log(`🟢 [${formatTimestamp()}] ${line}`)
            } else if (line.includes('Error') || line.includes('error')) {
              console.log(`🔴 [${formatTimestamp()}] ${line}`)
            }
          }
        })
        
        lastLogLength = lines.length
      }
      
      // Verificação mais rápida para capturar webhooks instantâneos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ [${formatTimestamp()}] Erro ao monitorar:`, error.message)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
}

// Intercepta Ctrl+C
process.on('SIGINT', () => {
  console.log('\n✅ Monitoramento finalizado!')
  console.log('📊 Resumo capturado com sucesso')
  process.exit(0)
})

console.log('🚀 Iniciando monitoramento...')
monitorPayment()