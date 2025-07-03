export interface ModelConfig {
  id: string
  name: string
  provider: string
  category: 'advanced' | 'balanced' | 'fast' | 'reasoning' | 'pro'
  isPro?: boolean
  description?: string
  contextWindow?: number
  strengths?: string[]
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Modelos Avançados
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    category: 'advanced',
    contextWindow: 128000,
    description: 'Modelo mais recente e poderoso da OpenAI'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai', 
    category: 'advanced',
    contextWindow: 128000,
    description: 'Modelo multimodal otimizado da OpenAI'
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'anthropic',
    category: 'advanced',
    contextWindow: 200000,
    description: 'Modelo mais recente da Anthropic'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    category: 'advanced',
    contextWindow: 1048576,
    description: 'Modelo avançado do Google com contexto massivo'
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'meta',
    category: 'advanced',
    contextWindow: 131072,
    description: 'Modelo open source mais poderoso da Meta'
  },
  {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    category: 'advanced',
    contextWindow: 200000,
    description: 'Modelo com pesquisa web integrada'
  },
  {
    id: 'sabia-3.1',
    name: 'Sabiá 3.1',
    provider: 'maritaca',
    category: 'advanced',
    contextWindow: 32768,
    description: 'Modelo brasileiro otimizado para português'
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'mistral',
    category: 'advanced',
    contextWindow: 131072,
    description: 'Modelo multilíngue avançado'
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    category: 'advanced',
    isPro: true,
    contextWindow: 131072,
    description: 'Modelo da xAI com personalidade única'
  },
  {
    id: 'amazon-nova-premier',
    name: 'Amazon Nova Premier',
    provider: 'amazon',
    category: 'advanced',
    contextWindow: 300000,
    description: 'Modelo mais poderoso da Amazon'
  },

  // Raciocínio Profundo
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    category: 'reasoning',
    isPro: true,
    contextWindow: 128000,
    description: 'Modelo de raciocínio profundo'
  },
  {
    id: 'o4-mini',
    name: 'o4 Mini',
    provider: 'openai',
    category: 'reasoning',
    isPro: true,
    contextWindow: 128000,
    description: 'Modelo de raciocínio otimizado'
  },
  {
    id: 'qwen-qwq',
    name: 'Qwen QwQ',
    provider: 'alibaba',
    category: 'reasoning',
    contextWindow: 131072,
    description: 'Modelo de raciocínio step-by-step'
  },
  {
    id: 'claude-4-sonnet-thinking',
    name: 'Claude 4 Sonnet Thinking',
    provider: 'anthropic',
    category: 'reasoning',
    isPro: true,
    contextWindow: 200000,
    description: 'Claude com modo de raciocínio avançado'
  },
  {
    id: 'deepseek-r1-small',
    name: 'Deepseek R1 Small',
    provider: 'deepseek',
    category: 'reasoning',
    contextWindow: 128000,
    description: 'Modelo de raciocínio eficiente'
  },
  {
    id: 'deepseek-r1',
    name: 'Deepseek R1',
    provider: 'deepseek',
    category: 'reasoning',
    isPro: true,
    contextWindow: 128000,
    description: 'Modelo de raciocínio avançado'
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    category: 'reasoning',
    isPro: true,
    contextWindow: 131072,
    description: 'Versão compacta do Grok com raciocínio'
  }
]

// Função para obter modelos por categoria
export function getModelsByCategory(category: ModelConfig['category']): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.category === category)
}

// Função para obter modelos Pro
export function getProModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.isPro === true)
}

// Função para obter modelo por ID
export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(model => model.id === id)
}

// Mapear IDs de modelo para IDs do OpenRouter
export const MODEL_MAPPING: Record<string, string> = {
  // OpenAI
  'gpt-4.1': 'openai/gpt-4-turbo-preview',
  'gpt-4o': 'openai/gpt-4o',
  'o3': 'openai/o1-preview',
  'o4-mini': 'openai/o1-mini',
  
  // Anthropic
  'claude-4-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-4-sonnet-thinking': 'anthropic/claude-3.5-sonnet',
  
  // Google
  'gemini-2.5-pro': 'google/gemini-2.0-pro-exp',
  
  // Meta
  'llama-4-maverick': 'meta-llama/llama-3.3-70b-instruct',
  
  // Perplexity
  'perplexity-sonar': 'perplexity/sonar-pro',
  
  // Sabiá (Maritaca AI)
  'sabia-3.1': 'maritaca/sabia-3',
  
  // Mistral
  'mistral-large-2': 'mistralai/mistral-large-2411',
  
  // xAI
  'grok-3': 'x-ai/grok-beta',
  'grok-3-mini': 'x-ai/grok-beta-mini',
  
  // Amazon
  'amazon-nova-premier': 'amazon/nova-pro-v1',
  
  // Alibaba
  'qwen-qwq': 'qwen/qwq-32b-preview',
  
  // DeepSeek
  'deepseek-r1-small': 'deepseek/deepseek-r1-lite-preview',
  'deepseek-r1': 'deepseek/deepseek-r1'
}