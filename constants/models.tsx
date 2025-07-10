import { Sparkles, Brain, Code, Zap } from 'lucide-react'
import { ModelCategory } from '@/types/chat'

// Categorias de modelos para melhor organização seguindo a estrutura da imagem
export const MODEL_CATEGORIES: Record<string, ModelCategory> = {
  FAST: {
    name: 'Modelos Rápidos (Ilimitados)',
    icon: Zap,
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'FREE' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', tier: 'FREE' },
      { id: 'gemini-2-flash-free', name: 'Gemini 2 Flash Free', tier: 'FREE' },
      { id: 'mistral-7b', name: 'Mistral 7B', tier: 'FREE' },
      { id: 'deepseek-r1-small', name: 'Deepseek R1 Small', tier: 'FREE' },
      { id: 'qwen-qwq', name: 'Qwen QwQ', tier: 'FREE' },
      { id: 'llama-2-13b', name: 'Llama 2 13B', tier: 'LITE' },
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'LITE' },
      { id: 'deepseek-r1', name: 'Deepseek R1', tier: 'LITE' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', tier: 'LITE' },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar', tier: 'LITE' },
      { id: 'sabia-3.1', name: 'Sabiá 3.1', tier: 'LITE' },
    ]
  },
  ADVANCED: {
    name: 'Modelos Avançados',
    icon: Sparkles,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', tier: 'LITE' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'LITE' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', tier: 'PRO' },
      { id: 'gemini-2-flash', name: 'Gemini 2 Flash', tier: 'LITE' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tier: 'LITE' },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', tier: 'PRO' },
      { id: 'o1-preview', name: 'o1-preview', tier: 'PRO' },
      { id: 'o1-mini', name: 'o1-mini', tier: 'LITE' },
      { id: 'grok-3', name: 'Grok 3', tier: 'PRO' },
      { id: 'claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct)', tier: 'PRO' },
    ]
  },
  REASONING: {
    name: 'Modelos de Raciocínio',
    icon: Brain,
    models: [
      { id: 'o1', name: 'OpenAI o1', tier: 'PRO' },
      { id: 'o1-pro', name: 'OpenAI o1-pro', tier: 'ENTERPRISE' },
      { id: 'deepseek-r1-full', name: 'Deepseek R1 Full', tier: 'PRO' },
      { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', tier: 'LITE' },
    ]
  },
  CODE: {
    name: 'Modelos de Código',
    icon: Code,
    models: [
      { id: 'claude-3.5-sonnet-computer', name: 'Claude 3.5 Sonnet (Computer Use)', tier: 'PRO' },
      { id: 'codegemma-7b', name: 'CodeGemma 7B', tier: 'FREE' },
      { id: 'deepseek-coder-v2', name: 'Deepseek Coder V2', tier: 'LITE' },
      { id: 'codellama-34b', name: 'CodeLlama 34B', tier: 'LITE' },
    ]
  }
}

export const getAllModels = () => {
  return Object.values(MODEL_CATEGORIES).flatMap(category => category.models)
}

export const getModelById = (id: string) => {
  return getAllModels().find(model => model.id === id)
}

export const getModelsByTier = (tier: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE') => {
  return getAllModels().filter(model => model.tier === tier)
}