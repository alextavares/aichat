import { renderHook, act, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { mockSession, mockUsers } from '../fixtures/auth.fixtures';

// Mock next-auth
jest.mock('next-auth/react');

describe('React Hooks', () => {
  describe('useAuth', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return user session when authenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.isLoading).toBe(false);
    });

    test('should return null user when unauthenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    test('should show loading state', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    test('should check user permissions', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, role: 'admin' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('user')).toBe(false);
      expect(result.current.isAdmin()).toBe(true);
    });

    test('should check plan permissions', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, plan: 'PRO' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasPlan('PRO')).toBe(true);
      expect(result.current.hasPlan('FREE')).toBe(false);
      expect(result.current.canUseFeature('gpt-4')).toBe(true);
      expect(result.current.canUseFeature('unlimited-messages')).toBe(true);
    });
  });

  describe('useChat', () => {
    test('should manage chat state', async () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Send message
      await act(async () => {
        await result.current.sendMessage('Hello AI');
      });

      expect(result.current.messages).toHaveLength(2); // User + AI response
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hello AI');
    });

    test('should handle streaming responses', async () => {
      const { result } = renderHook(() => useChat());
      const chunks: string[] = [];

      await act(async () => {
        await result.current.streamMessage('Tell me a story', {
          onChunk: (chunk) => chunks.push(chunk),
        });
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(result.current.isStreaming).toBe(false);
    });

    test('should handle errors', async () => {
      const { result } = renderHook(() => useChat());

      // Mock API error
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.isLoading).toBe(false);
    });

    test('should clear chat', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({ role: 'user', content: 'Test' });
        result.current.addMessage({ role: 'assistant', content: 'Response' });
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearChat();
      });

      expect(result.current.messages).toEqual([]);
    });

    test('should manage conversation history', async () => {
      const { result } = renderHook(() => useChat());

      // Load conversation
      await act(async () => {
        await result.current.loadConversation('conv-123');
      });

      expect(result.current.conversationId).toBe('conv-123');
      expect(result.current.messages.length).toBeGreaterThan(0);

      // Save conversation
      await act(async () => {
        await result.current.saveConversation();
      });

      expect(result.current.isSaved).toBe(true);
    });
  });

  describe('useSubscription', () => {
    test('should get current subscription', async () => {
      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.subscription).toBeDefined();
        expect(result.current.plan).toBe('FREE');
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('should check feature access', () => {
      const { result } = renderHook(() => useSubscription('PRO'));

      expect(result.current.hasFeature('unlimited-messages')).toBe(true);
      expect(result.current.hasFeature('api-access')).toBe(true);
      expect(result.current.hasFeature('custom-models')).toBe(false); // Enterprise only
    });

    test('should upgrade subscription', async () => {
      const { result } = renderHook(() => useSubscription());

      await act(async () => {
        const checkoutUrl = await result.current.upgradeToPlan('PRO');
        expect(checkoutUrl).toContain('checkout.stripe.com');
      });

      expect(result.current.isUpgrading).toBe(false);
    });

    test('should cancel subscription', async () => {
      const { result } = renderHook(() => useSubscription('PRO'));

      await act(async () => {
        await result.current.cancelSubscription();
      });

      expect(result.current.isCanceling).toBe(false);
      expect(result.current.subscription?.cancelAtPeriodEnd).toBe(true);
    });

    test('should calculate days remaining', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const { result } = renderHook(() => useSubscription('PRO', {
        currentPeriodEnd: futureDate,
      }));

      expect(result.current.daysRemaining).toBe(15);
      expect(result.current.isExpiring).toBe(true); // Within 30 days
    });
  });

  describe('useUsageTracking', () => {
    test('should track daily usage', async () => {
      const { result } = renderHook(() => useUsageTracking());

      await waitFor(() => {
        expect(result.current.dailyUsage).toBeDefined();
        expect(result.current.dailyUsage.messages).toBeGreaterThanOrEqual(0);
        expect(result.current.dailyUsage.tokens).toBeGreaterThanOrEqual(0);
      });
    });

    test('should check usage limits', () => {
      const { result } = renderHook(() => useUsageTracking({
        plan: 'FREE',
        dailyMessages: 45,
        dailyTokens: 8000,
      }));

      expect(result.current.canSendMessage).toBe(true);
      expect(result.current.messagesRemaining).toBe(5); // 50 - 45
      expect(result.current.usagePercentage).toBe(90); // 45/50 * 100
    });

    test('should prevent usage when limit reached', () => {
      const { result } = renderHook(() => useUsageTracking({
        plan: 'FREE',
        dailyMessages: 50,
      }));

      expect(result.current.canSendMessage).toBe(false);
      expect(result.current.messagesRemaining).toBe(0);
      expect(result.current.limitReached).toBe(true);
    });

    test('should track usage in real-time', async () => {
      const { result } = renderHook(() => useUsageTracking());

      const initialMessages = result.current.dailyUsage.messages;

      await act(async () => {
        await result.current.trackMessage('gpt-3.5-turbo', 150, 200);
      });

      expect(result.current.dailyUsage.messages).toBe(initialMessages + 1);
      expect(result.current.dailyUsage.tokens).toBeGreaterThan(0);
    });

    test('should show usage alerts', () => {
      const { result } = renderHook(() => useUsageTracking({
        plan: 'FREE',
        dailyMessages: 40, // 80% of 50
      }));

      expect(result.current.showUsageWarning).toBe(true);
      expect(result.current.warningMessage).toContain('80%');
    });
  });

  describe('useDebounce', () => {
    jest.useFakeTimers();

    test('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial'); // Still initial

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    test('should cancel previous debounce on new value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'first' } }
      );

      rerender({ value: 'second' });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      rerender({ value: 'third' });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('third');
    });
  });

  describe('useLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('should read and write to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

      expect(result.current[0]).toBe('defaultValue');

      act(() => {
        result.current[1]('newValue');
      });

      expect(result.current[0]).toBe('newValue');
      expect(localStorage.getItem('testKey')).toBe('"newValue"');
    });

    test('should handle objects', () => {
      const { result } = renderHook(() => useLocalStorage('objKey', { count: 0 }));

      expect(result.current[0]).toEqual({ count: 0 });

      act(() => {
        result.current[1]({ count: 5 });
      });

      expect(result.current[0]).toEqual({ count: 5 });
      expect(JSON.parse(localStorage.getItem('objKey')!)).toEqual({ count: 5 });
    });

    test('should sync across hooks', () => {
      const { result: hook1 } = renderHook(() => useLocalStorage('sharedKey', 'initial'));
      const { result: hook2 } = renderHook(() => useLocalStorage('sharedKey', 'initial'));

      act(() => {
        hook1.current[1]('updated');
      });

      expect(hook2.current[0]).toBe('updated');
    });
  });

  describe('useOnClickOutside', () => {
    test('should call handler when clicking outside', () => {
      const handler = jest.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      renderHook(() => useOnClickOutside(ref, handler));

      // Click outside
      act(() => {
        document.body.click();
      });

      expect(handler).toHaveBeenCalled();

      // Click inside
      handler.mockClear();
      act(() => {
        ref.current.click();
      });

      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(ref.current);
    });
  });

  describe('useMediaQuery', () => {
    test('should detect media query matches', () => {
      // Mock matchMedia
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(true);

      const { result: mobileResult } = renderHook(() => useMediaQuery('(max-width: 767px)'));
      expect(mobileResult.current).toBe(false);
    });
  });
});

// Hook implementations (these would be in actual hook files)
function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    hasRole: (role: string) => session?.user?.role === role,
    isAdmin: () => session?.user?.role === 'admin',
    hasPlan: (plan: string) => session?.user?.plan === plan,
    canUseFeature: (feature: string) => {
      // Feature logic based on plan
      const planFeatures: Record<string, string[]> = {
        PRO: ['gpt-4', 'unlimited-messages', 'api-access'],
        ENTERPRISE: ['gpt-4', 'unlimited-messages', 'api-access', 'custom-models'],
      };
      return planFeatures[session?.user?.plan || 'FREE']?.includes(feature) || false;
    },
  };
}

function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      
      // Mock AI response
      const aiResponse = { role: 'assistant', content: 'This is a mock response' };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const streamMessage = async (content: string, options?: any) => {
    setIsStreaming(true);
    // Mock streaming
    const chunks = ['Hello', ' from', ' AI'];
    for (const chunk of chunks) {
      if (options?.onChunk) options.onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsStreaming(false);
  };

  const clearChat = () => setMessages([]);
  const addMessage = (msg: any) => setMessages(prev => [...prev, msg]);
  const loadConversation = async (id: string) => {
    setConversationId(id);
    // Mock loading
    setMessages([{ role: 'user', content: 'Previous message' }]);
  };
  const saveConversation = async () => setIsSaved(true);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    conversationId,
    isSaved,
    sendMessage,
    streamMessage,
    clearChat,
    addMessage,
    loadConversation,
    saveConversation,
  };
}

function useSubscription(initialPlan = 'FREE', initialSub?: any) {
  const [subscription, setSubscription] = useState(initialSub);
  const [plan] = useState(initialPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const hasFeature = (feature: string) => {
    const features: Record<string, string[]> = {
      PRO: ['unlimited-messages', 'api-access'],
      ENTERPRISE: ['unlimited-messages', 'api-access', 'custom-models'],
    };
    return features[plan]?.includes(feature) || false;
  };

  const upgradeToPlan = async (newPlan: string) => {
    setIsUpgrading(true);
    // Mock checkout
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsUpgrading(false);
    return 'https://checkout.stripe.com/mock';
  };

  const cancelSubscription = async () => {
    setIsCanceling(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscription({ ...subscription, cancelAtPeriodEnd: true });
    setIsCanceling(false);
  };

  const daysRemaining = initialSub?.currentPeriodEnd
    ? Math.ceil((initialSub.currentPeriodEnd - new Date()) / (24 * 60 * 60 * 1000))
    : 0;

  return {
    subscription,
    plan,
    isLoading,
    isUpgrading,
    isCanceling,
    hasFeature,
    upgradeToPlan,
    cancelSubscription,
    daysRemaining,
    isExpiring: daysRemaining > 0 && daysRemaining < 30,
  };
}

function useUsageTracking(config?: any) {
  const [dailyUsage] = useState({
    messages: config?.dailyMessages || 0,
    tokens: config?.dailyTokens || 0,
  });

  const limits = {
    FREE: { messages: 50, tokens: 100000 },
    PRO: { messages: -1, tokens: -1 },
  };

  const planLimits = limits[config?.plan || 'FREE'];
  const messagesRemaining = Math.max(0, planLimits.messages - dailyUsage.messages);
  const canSendMessage = planLimits.messages === -1 || dailyUsage.messages < planLimits.messages;
  const limitReached = !canSendMessage;
  const usagePercentage = planLimits.messages > 0 ? (dailyUsage.messages / planLimits.messages) * 100 : 0;
  const showUsageWarning = usagePercentage >= 80;

  const trackMessage = async (model: string, input: number, output: number) => {
    // Mock tracking
  };

  return {
    dailyUsage,
    canSendMessage,
    messagesRemaining,
    limitReached,
    usagePercentage,
    showUsageWarning,
    warningMessage: `You've used ${Math.round(usagePercentage)}% of your daily limit`,
    trackMessage,
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Missing imports
import { useState, useEffect } from 'react';