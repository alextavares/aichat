#!/usr/bin/env node

// Script para monitorar logs em tempo real
const logUrl = "https://proxy-nyc1-08c13dfea8d2.ondigitalocean.app/?token=1GoRi2PiyVS7DKVjCincpY2TCjIYq9ogQwr0gptJXHO-YFty4jXiFcbSg4nTOkkGElDSeEybt9r1OSBx-J0fgwnXwi2Y1a73mUWjKK1-FZyuFB0JdOMRcJEd0aodp8UNuwZ1OY7droT1iUCU1iH9QZg6yRrznZaeWt6kW00KUQ7nYuycUaQ6k_5MJlZtC22pyNjG-LsJzdgwLgFTq-EXTddKz2rHb9P5B6nlFrr3KZAz3P_MC--Vs1FcScwAdoKnPWcYmiDDjkWZxMOkIVjl9pvN8QZL5lVA3ddNIheVLkjzuficbl7xypHVCe9L8KmfUg86qiX0kaIvbLEeNZ2Xdp3XtKbr66qT2EtFNH4UNFPXxzQefJxNONLtYlQN3Lgqi08o7kxdJXy-3LoDSkz081s="

let lastContent = ""

async function monitorLogs() {
  console.log('🔍 Monitorando logs em tempo real...')
  console.log('📅 Aguardando atividade de pagamento...\n')
  
  while (true) {
    try {
      const response = await fetch(logUrl)
      const content = await response.text()
      
      if (content !== lastContent) {
        // Extrai apenas as novas linhas
        const newLines = content.split('\n').slice(lastContent.split('\n').length - 1)
        
        if (newLines.length > 0 && newLines.some(line => line.trim())) {
          console.log('🆕 Novos logs:')
          newLines.forEach(line => {
            if (line.trim()) {
              const timestamp = new Date().toLocaleTimeString()
              console.log(`[${timestamp}] ${line}`)
            }
          })
          console.log('\n---\n')
        }
        
        lastContent = content
      }
      
      // Aguarda 2 segundos antes da próxima verificação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error.message)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

// Intercepta Ctrl+C para sair graciosamente
process.on('SIGINT', () => {
  console.log('\n👋 Parando monitoramento de logs...')
  process.exit(0)
})

monitorLogs()