import { UsageTracker } from '@/lib/usage-tracker';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    userUsage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
    planLimit: {
      findFirst: jest.fn(),
    },
  },
}));

describe('UsageTracker', () => {
  let tracker: UsageTracker;
  const mockUserId = 'user-123';

  beforeEach(() => {
    tracker = new UsageTracker();
    jest.clearAllMocks();
  });

  test('should track message usage', async () => {
    // Mock existing usage
    (prisma.userUsage.findFirst as jest.Mock).mockResolvedValue({
      id: 'usage-1',
      messagesUsed: 5,
      tokensUsed: 1000,
    });

    // Mock update
    (prisma.userUsage.update as jest.Mock).mockResolvedValue({
      id: 'usage-1',
      messagesUsed: 6,
      tokensUsed: 1150,
    });

    const result = await tracker.trackUsage(mockUserId, 1, 150);

    expect(prisma.userUsage.update).toHaveBeenCalledWith({
      where: { id: 'usage-1' },
      data: {
        messagesUsed: 6,
        tokensUsed: 1150,
      },
    });

    expect(result.messagesUsed).toBe(6);
    expect(result.tokensUsed).toBe(1150);
  });

  test('should create new usage record if none exists', async () => {
    // Mock no existing usage
    (prisma.userUsage.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock create
    (prisma.userUsage.create as jest.Mock).mockResolvedValue({
      id: 'usage-new',
      userId: mockUserId,
      messagesUsed: 1,
      tokensUsed: 150,
    });

    const result = await tracker.trackUsage(mockUserId, 1, 150);

    expect(prisma.userUsage.create).toHaveBeenCalledWith({
      data: {
        userId: mockUserId,
        messagesUsed: 1,
        tokensUsed: 150,
        usageDate: expect.any(Date),
      },
    });
  });

  test('should check usage limits for free tier', async () => {
    // Mock user with free subscription
    (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
      planId: 'free',
    });

    // Mock plan limits
    (prisma.planLimit.findFirst as jest.Mock).mockResolvedValue({
      messagesPerDay: 10,
      tokensPerDay: 10000,
    });

    // Mock current usage
    (prisma.userUsage.findFirst as jest.Mock).mockResolvedValue({
      messagesUsed: 9,
      tokensUsed: 9000,
    });

    const canUse = await tracker.checkUsageLimit(mockUserId);
    expect(canUse).toBe(true);

    // Test when limit reached
    (prisma.userUsage.findFirst as jest.Mock).mockResolvedValue({
      messagesUsed: 10,
      tokensUsed: 10000,
    });

    const cannotUse = await tracker.checkUsageLimit(mockUserId);
    expect(cannotUse).toBe(false);
  });

  test('should calculate usage statistics', async () => {
    const mockUsageData = [
      { usageDate: new Date('2024-01-01'), messagesUsed: 5, tokensUsed: 1000 },
      { usageDate: new Date('2024-01-02'), messagesUsed: 8, tokensUsed: 1600 },
      { usageDate: new Date('2024-01-03'), messagesUsed: 3, tokensUsed: 600 },
    ];

    const stats = tracker.calculateStats(mockUsageData);

    expect(stats.totalMessages).toBe(16);
    expect(stats.totalTokens).toBe(3200);
    expect(stats.averageMessagesPerDay).toBe(5.33);
    expect(stats.estimatedCost).toBeGreaterThan(0);
  });
});