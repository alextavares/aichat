import { aiService } from '@/lib/ai/ai-service';
import { OpenAIProvider } from '@/lib/ai/openai-provider';
import { OpenRouterProvider } from '@/lib/ai/openrouter-provider';
import { AIMessage, AIModel } from '@/lib/ai/types';
import { mockAIModels, mockChatResponses, MockAIClient } from '../fixtures/ai.fixtures';

// Mock providers
jest.mock('@/lib/ai/openai-provider');
jest.mock('@/lib/ai/openrouter-provider');

describe('AIService', () => {
  let mockOpenAIProvider: jest.Mocked<OpenAIProvider>;
  let mockOpenRouterProvider: jest.Mocked<OpenRouterProvider>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock providers
    mockOpenAIProvider = new OpenAIProvider() as jest.Mocked<OpenAIProvider>;
    mockOpenRouterProvider = new OpenRouterProvider() as jest.Mocked<OpenRouterProvider>;
    
    // Mock isConfigured
    mockOpenAIProvider.isConfigured.mockReturnValue(true);
    mockOpenRouterProvider.isConfigured.mockReturnValue(true);
    
    // Mock getAvailableModels
    const openAIModels = mockAIModels.filter(m => m.provider === 'OPENAI');
    const openRouterModels = mockAIModels.filter(m => m.provider === 'OPENROUTER');
    
    mockOpenAIProvider.getAvailableModels.mockReturnValue(openAIModels);
    mockOpenRouterProvider.getAvailableModels.mockReturnValue(openRouterModels);
  });

  describe('Provider Management', () => {
    test('should initialize with OpenAI and OpenRouter providers', () => {
      expect(() => aiService.getProvider('openai')).not.toThrow();
      expect(() => aiService.getProvider('openrouter')).not.toThrow();
    });

    test('should throw error for unknown provider', () => {
      expect(() => aiService.getProvider('unknown')).toThrow('Provider unknown not found');
    });

    test('should get correct provider for model', () => {
      // Test OpenAI models
      mockOpenAIProvider.isConfigured.mockReturnValue(true);
      expect(() => aiService['getProviderForModel']('gpt-3.5-turbo')).not.toThrow();
      
      // Test OpenRouter models
      mockOpenRouterProvider.isConfigured.mockReturnValue(true);
      expect(() => aiService['getProviderForModel']('claude-3-opus')).not.toThrow();
    });

    test('should fallback to OpenRouter for OpenAI models if OpenAI not configured', () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(false);
      mockOpenRouterProvider.isConfigured.mockReturnValue(true);
      
      expect(() => aiService['getProviderForModel']('gpt-4')).not.toThrow();
    });

    test('should throw error if no provider configured for model', () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(false);
      mockOpenRouterProvider.isConfigured.mockReturnValue(false);
      
      expect(() => aiService['getProviderForModel']('gpt-4')).toThrow('No configured provider found for model: gpt-4');
    });
  });

  describe('Message Generation', () => {
    const testMessages: AIMessage[] = [
      { role: 'user', content: 'Hello AI' }
    ];

    test('should generate response successfully', async () => {
      mockOpenAIProvider.generateResponse.mockResolvedValue({
        content: 'Test response',
        tokensUsed: { input: 10, output: 15, total: 25 },
        cost: 0.0000375,
        model: 'gpt-3.5-turbo'
      });

      const response = await aiService.generateResponse(testMessages, 'gpt-3.5-turbo');
      
      expect(response.content).toBe('Test response');
      expect(response.tokensUsed.total).toBe(25);
      expect(mockOpenAIProvider.generateResponse).toHaveBeenCalledWith(
        testMessages,
        'gpt-3.5-turbo',
        undefined
      );
    });

    test('should pass options to provider', async () => {
      const options = {
        maxTokens: 1000,
        temperature: 0.7,
        stream: false
      };

      mockOpenAIProvider.generateResponse.mockResolvedValue({
        content: 'Test response',
        tokensUsed: { input: 10, output: 15, total: 25 },
        cost: 0.0000375,
        model: 'gpt-3.5-turbo'
      });

      await aiService.generateResponse(testMessages, 'gpt-3.5-turbo', options);
      
      expect(mockOpenAIProvider.generateResponse).toHaveBeenCalledWith(
        testMessages,
        'gpt-3.5-turbo',
        options
      );
    });

    test('should handle provider errors', async () => {
      mockOpenAIProvider.generateResponse.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(
        aiService.generateResponse(testMessages, 'gpt-3.5-turbo')
      ).rejects.toThrow('API rate limit exceeded');
    });
  });

  describe('Streaming', () => {
    const testMessages: AIMessage[] = [
      { role: 'user', content: 'Tell me a story' }
    ];

    test('should stream response successfully', async () => {
      const mockGenerator = async function* () {
        yield 'Once ';
        yield 'upon ';
        yield 'a ';
        yield 'time...';
      };

      mockOpenAIProvider.streamResponse = jest.fn().mockResolvedValue(mockGenerator());

      const stream = await aiService.streamResponse(testMessages, 'gpt-3.5-turbo');
      const chunks: string[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Once ', 'upon ', 'a ', 'time...']);
    });

    test('should throw error if streaming not supported', async () => {
      mockOpenAIProvider.streamResponse = undefined;

      await expect(
        aiService.streamResponse(testMessages, 'gpt-3.5-turbo')
      ).rejects.toThrow('Streaming not supported for model gpt-3.5-turbo');
    });

    test('should handle streaming with callbacks', async () => {
      const mockGenerator = async function* () {
        yield 'Hello ';
        yield 'World';
      };

      mockOpenAIProvider.streamResponse = jest.fn().mockResolvedValue(mockGenerator());
      mockOpenAIProvider.estimateTokens = jest.fn()
        .mockReturnValueOnce(5) // input tokens
        .mockReturnValueOnce(10); // output tokens

      const tokens: string[] = [];
      let completionData: any = null;

      await aiService.streamResponseWithCallbacks(testMessages, 'gpt-3.5-turbo', {
        onToken: (token) => tokens.push(token),
        onComplete: (data) => completionData = data,
      });

      expect(tokens).toEqual(['Hello ', 'World']);
      expect(completionData).toEqual({
        tokensUsed: { input: 5, output: 10, total: 15 },
        cost: expect.any(Number)
      });
    });

    test('should handle streaming errors with callback', async () => {
      mockOpenAIProvider.streamResponse = jest.fn().mockRejectedValue(
        new Error('Stream error')
      );

      let capturedError: Error | null = null;

      await aiService.streamResponseWithCallbacks(testMessages, 'gpt-3.5-turbo', {
        onError: (error) => capturedError = error,
      });

      expect(capturedError?.message).toBe('Stream error');
    });
  });

  describe('Token Estimation', () => {
    test('should estimate tokens for text', () => {
      mockOpenAIProvider.estimateTokens.mockReturnValue(150);

      const tokens = aiService.estimateTokens('This is a test message', 'gpt-3.5-turbo');
      
      expect(tokens).toBe(150);
      expect(mockOpenAIProvider.estimateTokens).toHaveBeenCalledWith(
        'This is a test message',
        'gpt-3.5-turbo'
      );
    });

    test('should use correct provider for token estimation', () => {
      mockOpenRouterProvider.estimateTokens.mockReturnValue(200);

      const tokens = aiService.estimateTokens('Test message', 'claude-3-opus');
      
      expect(tokens).toBe(200);
      expect(mockOpenRouterProvider.estimateTokens).toHaveBeenCalled();
    });
  });

  describe('Model Management', () => {
    test('should get all available models', () => {
      const models = aiService.getAllAvailableModels();
      
      expect(models).toHaveLength(mockAIModels.length);
      expect(models).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-3.5-turbo' }),
        expect.objectContaining({ id: 'claude-3-opus' })
      ]));
    });

    test('should filter models by plan - FREE', () => {
      const freeModels = aiService.getModelsForPlan('FREE');
      
      expect(freeModels).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-3.5-turbo' })
      ]));
      expect(freeModels).not.toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-4' })
      ]));
    });

    test('should filter models by plan - PRO', () => {
      const proModels = aiService.getModelsForPlan('PRO');
      
      expect(proModels).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-3.5-turbo' }),
        expect.objectContaining({ id: 'gpt-4' })
      ]));
    });

    test('should return all models for ENTERPRISE', () => {
      const enterpriseModels = aiService.getModelsForPlan('ENTERPRISE');
      
      expect(enterpriseModels).toHaveLength(mockAIModels.length);
    });

    test('should return empty array for invalid plan', () => {
      const models = aiService.getModelsForPlan('INVALID' as any);
      
      expect(models).toEqual([]);
    });
  });

  describe('Cost Calculation', () => {
    test('should calculate cost correctly in streamResponseWithCallbacks', async () => {
      const mockGenerator = async function* () {
        yield 'Test ';
        yield 'response';
      };

      mockOpenAIProvider.streamResponse = jest.fn().mockResolvedValue(mockGenerator());
      mockOpenAIProvider.estimateTokens = jest.fn()
        .mockReturnValueOnce(10) // input tokens
        .mockReturnValueOnce(20); // output tokens

      let completionData: any = null;

      await aiService.streamResponseWithCallbacks(
        [{ role: 'user', content: 'Hello' }],
        'gpt-3.5-turbo',
        {
          onComplete: (data) => completionData = data,
        }
      );

      // gpt-3.5-turbo costs: input $0.0005/1k, output $0.0015/1k
      const expectedCost = (10 * 0.0005 / 1000) + (20 * 0.0015 / 1000);
      
      expect(completionData.cost).toBeCloseTo(expectedCost, 6);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mockOpenAIProvider.generateResponse.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        aiService.generateResponse([{ role: 'user', content: 'Hi' }], 'gpt-3.5-turbo')
      ).rejects.toThrow('Network error');
    });

    test('should handle authentication errors', async () => {
      mockOpenAIProvider.generateResponse.mockRejectedValue(
        new Error('Invalid API key')
      );

      await expect(
        aiService.generateResponse([{ role: 'user', content: 'Hi' }], 'gpt-3.5-turbo')
      ).rejects.toThrow('Invalid API key');
    });

    test('should handle rate limit errors', async () => {
      mockOpenAIProvider.generateResponse.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        aiService.generateResponse([{ role: 'user', content: 'Hi' }], 'gpt-3.5-turbo')
      ).rejects.toThrow('Rate limit exceeded');
    });
  });
});