// Mock AI providers and responses

export const mockAIModels = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OPENAI',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    inputCost: 0.0005,
    outputCost: 0.0015,
    supportedPlans: ['FREE', 'LITE', 'PRO', 'ENTERPRISE'],
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OPENAI',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    inputCost: 0.03,
    outputCost: 0.06,
    supportedPlans: ['PRO', 'ENTERPRISE'],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'OPENROUTER',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    inputCost: 0.015,
    outputCost: 0.075,
    supportedPlans: ['PRO', 'ENTERPRISE'],
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'OPENROUTER',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    inputCost: 0.0025,
    outputCost: 0.01,
    supportedPlans: ['LITE', 'PRO', 'ENTERPRISE'],
  },
];

export const mockChatResponses = {
  simple: {
    id: 'chatcmpl-mock-1',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Esta é uma resposta de teste do assistente de IA.',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 15,
      total_tokens: 25,
    },
  },
  streaming: {
    chunks: [
      { content: 'Esta ', finish_reason: null },
      { content: 'é ', finish_reason: null },
      { content: 'uma ', finish_reason: null },
      { content: 'resposta ', finish_reason: null },
      { content: 'em ', finish_reason: null },
      { content: 'streaming.', finish_reason: 'stop' },
    ],
  },
  error: {
    error: {
      message: 'Limite de rate excedido',
      type: 'rate_limit_error',
      code: 'rate_limit_exceeded',
    },
  },
};

export const mockStreamGenerator = async function* (message: string) {
  const words = message.split(' ');
  for (const word of words) {
    yield {
      choices: [
        {
          delta: {
            content: word + ' ',
          },
          finish_reason: null,
        },
      ],
    };
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  yield {
    choices: [
      {
        delta: {},
        finish_reason: 'stop',
      },
    ],
  };
};

export const mockTokenEstimates = {
  short: { tokens: 25, cost: 0.0000375 },
  medium: { tokens: 150, cost: 0.000225 },
  long: { tokens: 500, cost: 0.00075 },
};

export const mockUsageStats = {
  daily: {
    messages: 5,
    tokens: 1250,
    cost: 0.001875,
  },
  monthly: {
    messages: 150,
    tokens: 37500,
    cost: 0.05625,
  },
};

// Mock OpenAI/OpenRouter client
export class MockAIClient {
  async createChatCompletion(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (params.stream) {
      return {
        async *[Symbol.asyncIterator]() {
          yield* mockStreamGenerator('Esta é uma resposta em streaming de teste.');
        },
      };
    }
    
    return mockChatResponses.simple;
  }
  
  async createCompletion(params: any) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockChatResponses.simple;
  }
}