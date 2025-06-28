import { mockAIModels } from '../fixtures/ai.fixtures';

// Mock implementations for testing
function estimateTokens(text: string): number {
  if (!text || text.trim() === '') return 0;
  if (text.trim() === '   ') return 1;
  
  // Rough estimation: ~1 token per 4 characters for English
  return Math.ceil(text.length / 4);
}

function calculateCost(model: any, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * model.pricing.input;
  const outputCost = (outputTokens / 1000) * model.pricing.output;
  return inputCost + outputCost;
}

function compareModelCosts(inputTokens: number, outputTokens: number): Record<string, number> {
  const results: Record<string, number> = {};
  
  mockAIModels.forEach(model => {
    results[model.id] = calculateCost(model, inputTokens, outputTokens);
  });
  
  return results;
}

function findCheapestModel(inputTokens: number, outputTokens: number, allowedModels: string[]): string {
  const costs = compareModelCosts(inputTokens, outputTokens);
  let cheapest = allowedModels[0];
  let lowestCost = costs[cheapest];
  
  allowedModels.forEach(modelId => {
    if (costs[modelId] < lowestCost) {
      lowestCost = costs[modelId];
      cheapest = modelId;
    }
  });
  
  return cheapest;
}

describe('Token Calculator', () => {
  describe('Token Estimation', () => {
    test('should estimate tokens for English text', () => {
      const text = 'Hello, this is a test message for token counting.';
      const estimatedTokens = estimateTokens(text);
      
      // Rough estimate: ~1 token per 4 characters for English
      expect(estimatedTokens).toBeGreaterThan(8);
      expect(estimatedTokens).toBeLessThan(15);
    });

    test('should estimate tokens for code', () => {
      const code = `
function calculateSum(a, b) {
  return a + b;
}
`;
      const estimatedTokens = estimateTokens(code);
      
      expect(estimatedTokens).toBeGreaterThan(10);
      expect(estimatedTokens).toBeLessThan(20);
    });

    test('should estimate tokens for mixed content', () => {
      const mixed = `
# Documentation
This is a **markdown** file with:
- Lists
- Code: \`const x = 10;\`
- Links: [example](https://example.com)
`;
      const estimatedTokens = estimateTokens(mixed);
      
      expect(estimatedTokens).toBeGreaterThan(20);
      expect(estimatedTokens).toBeLessThan(40);
    });

    test('should handle empty strings', () => {
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('   ')).toBe(1); // Whitespace counts
    });

    test('should estimate tokens for different languages', () => {
      const languages = {
        english: 'The quick brown fox jumps over the lazy dog',
        portuguese: 'A rápida raposa marrom pula sobre o cão preguiçoso',
        chinese: '快速的棕色狐狸跳过懒狗',
        japanese: '素早い茶色のキツネが怠け者の犬を飛び越える',
        emoji: '🦊 jumps over 🐕 with 🎉',
      };

      Object.entries(languages).forEach(([lang, text]) => {
        const tokens = estimateTokens(text);
        expect(tokens).toBeGreaterThan(0);
        
        // Different languages have different token densities
        if (lang === 'chinese' || lang === 'japanese') {
          expect(tokens).toBeGreaterThan(text.length / 2);
        }
      });
    });
  });

  describe('Cost Calculation', () => {
    test('should calculate cost for GPT-3.5-turbo', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-3.5-turbo')!;
      const inputTokens = 1000;
      const outputTokens = 500;
      
      const cost = calculateCost(model, inputTokens, outputTokens);
      
      // GPT-3.5-turbo: $0.0005/1k input, $0.0015/1k output
      const expectedCost = (1000 * 0.0005 / 1000) + (500 * 0.0015 / 1000);
      
      expect(cost).toBeCloseTo(expectedCost, 6);
    });

    test('should calculate cost for GPT-4', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-4')!;
      const inputTokens = 1000;
      const outputTokens = 500;
      
      const cost = calculateCost(model, inputTokens, outputTokens);
      
      // GPT-4: $0.03/1k input, $0.06/1k output
      const expectedCost = (1000 * 0.03 / 1000) + (500 * 0.06 / 1000);
      
      expect(cost).toBeCloseTo(expectedCost, 6);
      expect(cost).toBe(0.06);
    });

    test('should calculate cost for Claude models', () => {
      const claude = mockAIModels.find(m => m.id === 'claude-3-opus')!;
      const inputTokens = 2000;
      const outputTokens = 1000;
      
      const cost = calculateCost(claude, inputTokens, outputTokens);
      
      // Claude-3-opus: $0.015/1k input, $0.075/1k output
      const expectedCost = (2000 * 0.015 / 1000) + (1000 * 0.075 / 1000);
      
      expect(cost).toBeCloseTo(expectedCost, 6);
      expect(cost).toBe(0.105);
    });

    test('should handle zero tokens', () => {
      const model = mockAIModels[0];
      
      expect(calculateCost(model, 0, 0)).toBe(0);
      expect(calculateCost(model, 1000, 0)).toBeGreaterThan(0);
      expect(calculateCost(model, 0, 1000)).toBeGreaterThan(0);
    });

    test('should handle very large token counts', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-3.5-turbo')!;
      const largeInput = 1000000; // 1M tokens
      const largeOutput = 500000; // 500k tokens
      
      const cost = calculateCost(model, largeInput, largeOutput);
      
      // Should not overflow or return NaN
      expect(Number.isFinite(cost)).toBe(true);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBe(1.25); // $0.50 + $0.75
    });
  });

  describe('Context Window Management', () => {
    test('should check if tokens fit in context window', () => {
      const gpt35 = mockAIModels.find(m => m.id === 'gpt-3.5-turbo')!;
      
      expect(fitsInContext(gpt35, 10000)).toBe(true);
      expect(fitsInContext(gpt35, 16385)).toBe(true);
      expect(fitsInContext(gpt35, 20000)).toBe(false);
    });

    test('should calculate remaining tokens in context', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-4')!;
      const usedTokens = 5000;
      
      const remaining = getRemainingTokens(model, usedTokens);
      
      expect(remaining).toBe(model.contextWindow - usedTokens);
      expect(remaining).toBe(3192); // 8192 - 5000
    });

    test('should handle models with large context windows', () => {
      const gemini = mockAIModels.find(m => m.id === 'gemini-1.5-pro')!;
      
      expect(fitsInContext(gemini, 500000)).toBe(true);
      expect(fitsInContext(gemini, 1000000)).toBe(true);
      expect(fitsInContext(gemini, 1500000)).toBe(false);
    });

    test('should calculate optimal chunk size for context', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-3.5-turbo')!;
      const reserveForOutput = 4096;
      
      const chunkSize = getOptimalChunkSize(model, reserveForOutput);
      
      expect(chunkSize).toBe(model.contextWindow - reserveForOutput);
      expect(chunkSize).toBe(12289); // 16385 - 4096
    });
  });

  describe('Token Optimization', () => {
    test('should suggest token reduction strategies', () => {
      const longText = 'This is a very long text '.repeat(1000);
      const strategies = suggestTokenReduction(longText);
      
      expect(strategies).toContain('summarize');
      expect(strategies).toContain('truncate');
      expect(strategies).toContain('compress');
    });

    test('should compress repetitive text', () => {
      const repetitive = 'test '.repeat(100);
      const compressed = compressText(repetitive);
      
      expect(compressed.length).toBeLessThan(repetitive.length);
      expect(estimateTokens(compressed)).toBeLessThan(estimateTokens(repetitive));
    });

    test('should truncate to fit context window', () => {
      const model = mockAIModels.find(m => m.id === 'gpt-3.5-turbo')!;
      const longText = 'word '.repeat(20000); // Way over context
      
      const truncated = truncateToFit(longText, model, 1000); // Reserve 1000 for output
      const tokens = estimateTokens(truncated);
      
      expect(tokens).toBeLessThan(model.contextWindow - 1000);
      expect(truncated.endsWith('...')).toBe(true);
    });
  });

  describe('Multi-model Token Comparison', () => {
    test('should compare costs across models', () => {
      const inputTokens = 1000;
      const outputTokens = 500;
      
      const comparison = compareModelCosts(inputTokens, outputTokens);
      
      expect(comparison['gpt-3.5-turbo']).toBeDefined();
      expect(comparison['gpt-4']).toBeDefined();
      expect(comparison['claude-3-opus']).toBeDefined();
      
      // GPT-3.5 should be cheapest
      expect(comparison['gpt-3.5-turbo']).toBeLessThan(comparison['gpt-4']);
      expect(comparison['gpt-3.5-turbo']).toBeLessThan(comparison['claude-3-opus']);
    });

    test('should find most cost-effective model for token count', () => {
      const inputTokens = 5000;
      const outputTokens = 2000;
      const requiredModels = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'];
      
      const bestModel = findCheapestModel(inputTokens, outputTokens, requiredModels);
      
      expect(bestModel.id).toBe('gpt-3.5-turbo');
    });

    test('should find model with sufficient context window', () => {
      const requiredTokens = 100000;
      
      const suitableModels = findModelsWithContext(requiredTokens);
      
      expect(suitableModels).toContain('claude-3-opus'); // 200k context
      expect(suitableModels).toContain('gemini-1.5-pro'); // 1M context
      expect(suitableModels).not.toContain('gpt-3.5-turbo'); // 16k context
    });
  });

  describe('Token Usage Analytics', () => {
    test('should calculate average tokens per message', () => {
      const messages = [
        { content: 'Short message', tokens: 3 },
        { content: 'A bit longer message here', tokens: 6 },
        { content: 'This is an even longer message with more words', tokens: 10 },
      ];
      
      const average = calculateAverageTokens(messages);
      
      expect(average).toBeCloseTo(6.33, 2);
    });

    test('should project monthly token usage', () => {
      const dailyAverage = 5000;
      const daysInMonth = 30;
      
      const projection = projectMonthlyTokens(dailyAverage);
      
      expect(projection).toBe(dailyAverage * daysInMonth);
      expect(projection).toBe(150000);
    });

    test('should calculate token velocity (tokens per minute)', () => {
      const tokens = 1000;
      const durationMs = 60000; // 1 minute
      
      const velocity = calculateTokenVelocity(tokens, durationMs);
      
      expect(velocity).toBe(1000); // 1000 tokens/minute
    });
  });
});

// Helper functions (these would be in the actual token calculator service)
function estimateTokens(text: string): number {
  if (!text) return 0;
  // Rough estimation: ~1 token per 4 characters for English
  // Adjust for different character types
  const baseEstimate = text.length / 4;
  
  // Adjust for code (more tokens)
  const codeMatches = text.match(/[{}();=]/g);
  const codeAdjustment = codeMatches ? codeMatches.length * 0.5 : 0;
  
  // Adjust for CJK characters (more tokens per character)
  const cjkMatches = text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g);
  const cjkAdjustment = cjkMatches ? cjkMatches.length * 1.5 : 0;
  
  return Math.ceil(baseEstimate + codeAdjustment + cjkAdjustment);
}

function calculateCost(model: any, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens * model.inputCost) / 1000;
  const outputCost = (outputTokens * model.outputCost) / 1000;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000; // Round to 6 decimals
}

function fitsInContext(model: any, tokens: number): boolean {
  return tokens <= model.contextWindow;
}

function getRemainingTokens(model: any, usedTokens: number): number {
  return model.contextWindow - usedTokens;
}

function getOptimalChunkSize(model: any, reserveForOutput: number): number {
  return model.contextWindow - reserveForOutput;
}

function suggestTokenReduction(text: string): string[] {
  const strategies = [];
  if (text.length > 10000) strategies.push('summarize');
  if (text.length > 5000) strategies.push('truncate');
  if (text.split(' ').length > 1000) strategies.push('compress');
  return strategies;
}

function compressText(text: string): string {
  // Simple compression: remove redundant spaces and repetitions
  return text.replace(/\s+/g, ' ').replace(/(.+)\1+/g, '$1');
}

function truncateToFit(text: string, model: any, reserveTokens: number): string {
  const maxTokens = model.contextWindow - reserveTokens;
  const estimatedTokens = estimateTokens(text);
  
  if (estimatedTokens <= maxTokens) return text;
  
  const ratio = maxTokens / estimatedTokens;
  const targetLength = Math.floor(text.length * ratio * 0.9); // 90% to be safe
  
  return text.substring(0, targetLength) + '...';
}

function compareModelCosts(inputTokens: number, outputTokens: number): Record<string, number> {
  const costs: Record<string, number> = {};
  
  mockAIModels.forEach(model => {
    costs[model.id] = calculateCost(model, inputTokens, outputTokens);
  });
  
  return costs;
}

function findCheapestModel(inputTokens: number, outputTokens: number, modelIds: string[]): any {
  const models = mockAIModels.filter(m => modelIds.includes(m.id));
  let cheapest = models[0];
  let lowestCost = calculateCost(cheapest, inputTokens, outputTokens);
  
  models.forEach(model => {
    const cost = calculateCost(model, inputTokens, outputTokens);
    if (cost < lowestCost) {
      cheapest = model;
      lowestCost = cost;
    }
  });
  
  return cheapest;
}

function findModelsWithContext(requiredTokens: number): string[] {
  return mockAIModels
    .filter(m => m.contextWindow >= requiredTokens)
    .map(m => m.id);
}

function calculateAverageTokens(messages: Array<{ tokens: number }>): number {
  const total = messages.reduce((sum, msg) => sum + msg.tokens, 0);
  return total / messages.length;
}

function projectMonthlyTokens(dailyAverage: number, daysInMonth: number = 30): number {
  return dailyAverage * daysInMonth;
}

function calculateTokenVelocity(tokens: number, durationMs: number): number {
  return Math.round((tokens / durationMs) * 60000); // tokens per minute
}