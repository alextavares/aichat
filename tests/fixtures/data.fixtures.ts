// Mock data for various entities

export const mockConversations = [
  {
    id: '1',
    userId: '1',
    title: 'Conversa sobre programação',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    messages: [
      {
        id: '1',
        conversationId: '1',
        role: 'user',
        content: 'Como criar um servidor Express?',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        conversationId: '1',
        role: 'assistant',
        content: 'Para criar um servidor Express, você precisa...',
        model: 'gpt-3.5-turbo',
        tokens: 150,
        createdAt: new Date('2024-01-01'),
      },
    ],
  },
  {
    id: '2',
    userId: '1',
    title: 'Dúvidas sobre React',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    messages: [],
  },
];

export const mockTemplates = [
  {
    id: '1',
    title: 'Email Profissional',
    description: 'Template para escrever emails profissionais',
    content: 'Escreva um email profissional sobre: {topic}',
    category: 'TRABALHO',
    tags: ['email', 'comunicação', 'profissional'],
    isPublic: true,
    userId: null,
    usageCount: 150,
  },
  {
    id: '2',
    title: 'Post para LinkedIn',
    description: 'Crie posts engajadores para o LinkedIn',
    content: 'Crie um post para LinkedIn sobre: {topic}\n\nTom: {tone}\nObjetivo: {goal}',
    category: 'MARKETING',
    tags: ['linkedin', 'social media', 'marketing'],
    isPublic: true,
    userId: null,
    usageCount: 230,
  },
  {
    id: '3',
    title: 'Análise SWOT',
    description: 'Template para análise SWOT de negócios',
    content: 'Faça uma análise SWOT para: {business}\n\nSetor: {industry}\nContexto: {context}',
    category: 'NEGOCIOS',
    tags: ['análise', 'estratégia', 'negócios'],
    isPublic: true,
    userId: null,
    usageCount: 89,
  },
];

export const mockKnowledgeBase = [
  {
    id: '1',
    userId: '1',
    title: 'Documentação do Projeto X',
    content: 'Esta é a documentação completa do projeto X...',
    type: 'text',
    metadata: {
      wordCount: 1500,
      language: 'pt-BR',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '1',
    title: 'Relatório Q4 2023',
    content: 'Resultados do quarto trimestre de 2023...',
    type: 'pdf',
    metadata: {
      pages: 25,
      size: '2.5MB',
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export const mockUsageData = {
  today: {
    date: new Date().toISOString().split('T')[0],
    messages: 12,
    tokens: 3500,
    cost: 0.00525,
  },
  monthly: {
    period: '2024-01',
    totalMessages: 350,
    totalTokens: 87500,
    totalCost: 0.13125,
    dailyBreakdown: Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      messages: Math.floor(Math.random() * 20) + 5,
      tokens: Math.floor(Math.random() * 5000) + 1000,
      cost: Math.random() * 0.01 + 0.002,
    })),
  },
  limits: {
    plan: 'FREE',
    messagesPerDay: 50,
    messagesUsedToday: 12,
    tokensPerMonth: 100000,
    tokensUsedThisMonth: 87500,
  },
};

export const mockAnalyticsData = {
  overview: {
    totalConversations: 45,
    totalMessages: 892,
    totalTokens: 223000,
    totalCost: 0.3345,
    averageMessagesPerConversation: 19.8,
    mostUsedModel: 'gpt-3.5-turbo',
    modelUsage: [
      { model: 'gpt-3.5-turbo', count: 750, percentage: 84.1 },
      { model: 'gpt-4', count: 100, percentage: 11.2 },
      { model: 'claude-3-opus', count: 42, percentage: 4.7 },
    ],
  },
  timeline: {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      conversations: Math.floor(Math.random() * 5) + 1,
      messages: Math.floor(Math.random() * 50) + 10,
      tokens: Math.floor(Math.random() * 10000) + 2000,
    })),
  },
  categories: [
    { name: 'Programação', count: 156, percentage: 35 },
    { name: 'Marketing', count: 112, percentage: 25 },
    { name: 'Negócios', count: 89, percentage: 20 },
    { name: 'Educação', count: 67, percentage: 15 },
    { name: 'Outros', count: 22, percentage: 5 },
  ],
};

export const mockNotifications = [
  {
    id: '1',
    userId: '1',
    type: 'usage_warning',
    title: 'Limite de mensagens próximo',
    message: 'Você usou 80% do seu limite diário de mensagens',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    userId: '1',
    type: 'feature_update',
    title: 'Novo modelo disponível',
    message: 'O modelo Gemini 1.5 Pro agora está disponível para uso',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Mock database operations
export const mockDatabase = {
  users: mockUsers,
  conversations: mockConversations,
  templates: mockTemplates,
  knowledgeBase: mockKnowledgeBase,
  
  async findUser(email: string) {
    return this.users.find(u => u.email === email);
  },
  
  async createUser(data: any) {
    const newUser = {
      id: String(this.users.length + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  },
  
  async findConversations(userId: string) {
    return this.conversations.filter(c => c.userId === userId);
  },
  
  async createConversation(userId: string, title: string) {
    const newConversation = {
      id: String(this.conversations.length + 1),
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.push(newConversation);
    return newConversation;
  },
};

// Import mock users from auth fixtures
import { mockUsers } from './auth.fixtures';