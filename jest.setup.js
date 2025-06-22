// Jest setup
require('dotenv').config({ path: '.env.test' });

// Mock do Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    usage: {
      create: jest.fn(),
      aggregate: jest.fn(),
    }
  }
}));
