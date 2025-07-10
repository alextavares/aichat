// Simple language detection based on common patterns
export function detectLanguage(text: string): 'pt' | 'en' | 'es' | 'other' {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase()
  
  // Portuguese patterns
  const portuguesePatterns = [
    /\b(ola|olá|oi|bom dia|boa tarde|boa noite|tudo bem|como vai|obrigad[oa]|por favor|com licença|desculp[ae]|até|tchau|adeus)\b/,
    /\b(eu|você|voce|nós|nos|eles|elas|meu|minha|seu|sua|nosso|nossa)\b/,
    /\b(que|como|quando|onde|porque|por que|qual|quais|quanto[as]?)\b/,
    /\b(sim|não|nao|talvez|claro|certo|errado)\b/,
    /\b(fazer|ter|ser|estar|poder|querer|precisar|gostar|achar|saber|conseguir)\b/,
    /\b(hoje|amanhã|amanha|ontem|agora|depois|antes|sempre|nunca|já|ja)\b/,
    /[ção|ões|ção|ães|ãos|ém|êm]/,
    /[àáâãéêíóôõúç]/
  ]
  
  // Spanish patterns
  const spanishPatterns = [
    /\b(hola|buenos días|buenas tardes|buenas noches|cómo está|gracias|por favor|disculpe|perdón|hasta|adiós)\b/,
    /\b(yo|tú|usted|nosotros|ellos|ellas|mi|tu|su|nuestro)\b/,
    /\b(qué|cómo|cuándo|dónde|por qué|cuál|cuáles|cuánto[as]?)\b/,
    /\b(sí|no|quizás|claro|cierto)\b/,
    /\b(hacer|tener|ser|estar|poder|querer|necesitar|gustar|pensar|saber)\b/,
    /\b(hoy|mañana|ayer|ahora|después|antes|siempre|nunca|ya)\b/,
    /[ción|ciones|sión|siones]/,
    /[áéíóúñ]/
  ]
  
  // English patterns
  const englishPatterns = [
    /\b(hello|hi|good morning|good afternoon|good evening|how are you|thank you|please|excuse me|sorry|bye|goodbye)\b/,
    /\b(i|you|we|they|my|your|our|their|me|him|her|us|them)\b/,
    /\b(what|how|when|where|why|which|who|whom)\b/,
    /\b(yes|no|maybe|sure|right|wrong)\b/,
    /\b(do|have|be|can|will|would|should|could|want|need|like|think|know)\b/,
    /\b(today|tomorrow|yesterday|now|later|before|always|never|already)\b/,
    /\b(the|a|an|is|are|was|were|been|being)\b/
  ]
  
  // Count matches for each language
  let portugueseScore = 0
  let spanishScore = 0
  let englishScore = 0
  
  portuguesePatterns.forEach(pattern => {
    const matches = lowerText.match(pattern)
    if (matches) portugueseScore += matches.length
  })
  
  spanishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern)
    if (matches) spanishScore += matches.length
  })
  
  englishPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern)
    if (matches) englishScore += matches.length
  })
  
  // Determine language based on highest score
  if (portugueseScore > englishScore && portugueseScore > spanishScore) {
    return 'pt'
  } else if (spanishScore > englishScore && spanishScore > portugueseScore) {
    return 'es'
  } else if (englishScore > 0) {
    return 'en'
  }
  
  return 'other'
}

// Get system prompt for language
export function getLanguageSystemPrompt(language: string): string {
  switch (language) {
    case 'pt':
      return 'Você é um assistente de IA útil e inteligente. IMPORTANTE: Você DEVE SEMPRE responder em português brasileiro, independentemente do idioma em que a pergunta foi feita. Use linguagem clara, natural e amigável. Mantenha suas respostas concisas e diretas ao ponto.'
    case 'es':
      return 'Eres un asistente de IA útil e inteligente. IMPORTANTE: SIEMPRE debes responder en español, sin importar el idioma en que se haga la pregunta. Usa un lenguaje claro, natural y amigable. Mantén tus respuestas concisas y directas al punto.'
    case 'en':
    default:
      return 'You are a helpful and intelligent AI assistant. IMPORTANT: You MUST ALWAYS respond in English, regardless of the language the question was asked in. Use clear, natural, and friendly language. Keep your responses concise and to the point.'
  }
}

// Detect language from conversation history
export function detectLanguageFromConversation(messages: Array<{role: string, content: string}>): 'pt' | 'en' | 'es' | 'other' {
  // Combine all user messages for better detection
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ')
  
  return detectLanguage(userMessages)
}