import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/chat/route';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db');
jest.mock('@/lib/ai/ai-service');

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should require authentication', async () => {
    // Mock no session
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
        model: 'gpt-3.5-turbo',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized',
    });
  });

  test('should process chat message', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'What is JavaScript?',
        model: 'gpt-3.5-turbo',
        conversationId: 'conv-123',
      },
    });

    // Mock AI response
    const mockAIService = {
      sendMessage: jest.fn().mockResolvedValue('JavaScript is a programming language...'),
    };
    jest.mock('@/lib/ai/ai-service', () => ({
      AIService: jest.fn(() => mockAIService),
    }));

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const response = JSON.parse(res._getData());
    expect(response).toHaveProperty('message');
    expect(response).toHaveProperty('conversationId');
  });

  test('should validate message input', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '', // Empty message
        model: 'gpt-3.5-turbo',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Message is required',
    });
  });

  test('should enforce usage limits', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    });

    // Mock usage limit reached
    const mockUsageTracker = {
      checkUsageLimit: jest.fn().mockResolvedValue(false),
    };
    jest.mock('@/lib/usage-tracker', () => ({
      UsageTracker: jest.fn(() => mockUsageTracker),
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
        model: 'gpt-3.5-turbo',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(429);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Usage limit reached',
    });
  });
});