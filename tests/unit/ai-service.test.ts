import { AIService } from '@/lib/ai/ai-service';
import { OpenAIProvider } from '@/lib/ai/openai-provider';

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Test response from AI'
            }
          }]
        })
      }
    }
  }))
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  test('should send message and receive response', async () => {
    const response = await aiService.sendMessage(
      'Hello AI',
      'test-conversation-id',
      'gpt-3.5-turbo'
    );

    expect(response).toBe('Test response from AI');
  });

  test('should handle streaming responses', async () => {
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [{ delta: { content: 'Hello' } }] };
        yield { choices: [{ delta: { content: ' World' } }] };
      }
    };

    // Mock streaming response
    const openaiProvider = new OpenAIProvider();
    jest.spyOn(openaiProvider, 'streamMessage').mockResolvedValue(mockStream as any);

    const chunks: string[] = [];
    const stream = await aiService.streamMessage(
      'Hello',
      'test-conversation-id',
      'gpt-3.5-turbo'
    );

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Hello', ' World']);
  });

  test('should validate model selection', () => {
    const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    
    validModels.forEach(model => {
      expect(() => aiService.validateModel(model)).not.toThrow();
    });

    expect(() => aiService.validateModel('invalid-model')).toThrow();
  });

  test('should handle errors gracefully', async () => {
    // Mock error response
    jest.spyOn(aiService, 'sendMessage').mockRejectedValue(
      new Error('API Error')
    );

    await expect(
      aiService.sendMessage('test', 'conv-id', 'gpt-3.5-turbo')
    ).rejects.toThrow('API Error');
  });
});