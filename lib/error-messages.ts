export const ErrorMessages = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha incorretos',
    EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',
    WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente',
    UNAUTHORIZED: 'Você precisa estar logado para acessar esta página',
  },
  
  // Payment errors
  PAYMENT: {
    INVALID_PLAN: 'Plano selecionado inválido',
    PAYMENT_FAILED: 'O pagamento não pôde ser processado. Verifique seus dados',
    SUBSCRIPTION_EXISTS: 'Você já possui uma assinatura ativa',
    WEBHOOK_FAILED: 'Erro ao processar webhook de pagamento',
    CARD_DECLINED: 'Cartão recusado. Verifique os dados ou tente outro cartão',
  },
  
  // Chat/AI errors
  CHAT: {
    MESSAGE_LIMIT_REACHED: 'Você atingiu o limite de mensagens do seu plano',
    TOKEN_LIMIT_REACHED: 'Você atingiu o limite de tokens do seu plano',
    AI_SERVICE_ERROR: 'Erro ao processar sua mensagem. Tente novamente',
    MODEL_NOT_AVAILABLE: 'Este modelo não está disponível para seu plano',
  },
  
  // Database errors
  DATABASE: {
    CONNECTION_ERROR: 'Erro de conexão com o banco de dados',
    QUERY_FAILED: 'Erro ao executar operação no banco de dados',
    RECORD_NOT_FOUND: 'Registro não encontrado',
  },
  
  // Network errors
  NETWORK: {
    NO_INTERNET: 'Sem conexão com a internet',
    TIMEOUT: 'A requisição demorou muito para responder',
    SERVER_ERROR: 'Erro no servidor. Por favor, tente novamente',
  },
  
  // Validation errors
  VALIDATION: {
    REQUIRED_FIELDS: 'Por favor, preencha todos os campos obrigatórios',
    INVALID_EMAIL: 'Email inválido',
    PASSWORDS_DONT_MATCH: 'As senhas não coincidem',
    INVALID_PHONE: 'Número de telefone inválido',
  },
  
  // Generic errors
  GENERIC: {
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Por favor, tente novamente',
    TRY_AGAIN: 'Por favor, tente novamente',
    CONTACT_SUPPORT: 'Se o problema persistir, entre em contato com o suporte',
  }
}

// Helper function to get user-friendly error message
export function getUserFriendlyError(error: any): string {
  // Check for specific error codes or messages
  if (error.code === 'P2002') {
    return ErrorMessages.AUTH.EMAIL_ALREADY_EXISTS
  }
  
  if (error.code === 'P2025') {
    return ErrorMessages.DATABASE.RECORD_NOT_FOUND
  }
  
  if (error.message?.includes('connect')) {
    return ErrorMessages.DATABASE.CONNECTION_ERROR
  }
  
  if (error.message?.includes('timeout')) {
    return ErrorMessages.NETWORK.TIMEOUT
  }
  
  if (error.message?.includes('Network')) {
    return ErrorMessages.NETWORK.NO_INTERNET
  }
  
  // Default to the error message or generic error
  return error.message || ErrorMessages.GENERIC.UNKNOWN_ERROR
}