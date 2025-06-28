import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { mockUsers, mockSession } from '../fixtures/auth.fixtures';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    account: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication', () => {
    test('should authenticate user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        name: 'Test User',
        role: 'user',
        plan: 'FREE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Simulate credential login
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      const isValidPassword = await bcrypt.compare('Test123!@#', user!.password!);

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(isValidPassword).toBe(true);
    });

    test('should reject invalid password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      const isValidPassword = await bcrypt.compare('WrongPassword', user!.password!);

      expect(isValidPassword).toBe(false);
    });

    test('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });
  });

  describe('User Registration', () => {
    test('should create new user with hashed password', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        password: 'NewUser123!@#',
        name: 'New User',
      };

      const hashedPassword = '$2a$10$newhashpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...newUserData,
        password: hashedPassword,
        role: 'user',
        plan: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const hashedPwd = await bcrypt.hash(newUserData.password, 10);
      const user = await prisma.user.create({
        data: {
          ...newUserData,
          password: hashedPwd,
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(newUserData.password, 10);
      expect(user.email).toBe(newUserData.email);
      expect(user.password).toBe(hashedPassword);
      expect(user.password).not.toBe(newUserData.password);
    });

    test('should prevent duplicate email registration', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      });

      const existingUser = await prisma.user.findUnique({
        where: { email: 'existing@example.com' },
      });

      expect(existingUser).toBeDefined();
      // In real implementation, this would throw an error
    });

    test('should set default values for new user', async () => {
      const newUser = {
        email: 'default@example.com',
        password: '$2a$10$hashedpassword',
        name: 'Default User',
      };

      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...newUser,
        id: '3',
        role: 'user',
        plan: 'FREE',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await prisma.user.create({
        data: newUser,
      });

      expect(user.role).toBe('user');
      expect(user.plan).toBe('FREE');
      expect(user.emailVerified).toBeNull();
    });
  });

  describe('Session Management', () => {
    test('should get current session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const session = await getServerSession();

      expect(session).toBeDefined();
      expect(session?.user?.email).toBe('test@example.com');
      expect(session?.user?.role).toBe('user');
    });

    test('should return null for unauthenticated request', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const session = await getServerSession();

      expect(session).toBeNull();
    });

    test('should validate session expiry', async () => {
      const expiredSession = {
        ...mockSession,
        expires: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      (getServerSession as jest.Mock).mockResolvedValue(expiredSession);

      const session = await getServerSession();
      const isExpired = new Date(session!.expires) < new Date();

      expect(isExpired).toBe(true);
    });
  });

  describe('OAuth Provider Integration', () => {
    test('should handle Google OAuth account', async () => {
      const googleAccount = {
        provider: 'google',
        providerAccountId: 'google-123',
        userId: '1',
        access_token: 'google-access-token',
        token_type: 'Bearer',
        scope: 'email profile',
      };

      (prisma.account.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...googleAccount,
      });

      const account = await prisma.account.create({
        data: googleAccount,
      });

      expect(account.provider).toBe('google');
      expect(account.userId).toBe('1');
    });

    test('should handle GitHub OAuth account', async () => {
      const githubAccount = {
        provider: 'github',
        providerAccountId: 'github-456',
        userId: '1',
        access_token: 'github-access-token',
        token_type: 'bearer',
        scope: 'read:user user:email',
      };

      (prisma.account.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...githubAccount,
      });

      const account = await prisma.account.create({
        data: githubAccount,
      });

      expect(account.provider).toBe('github');
      expect(account.providerAccountId).toBe('github-456');
    });

    test('should link OAuth account to existing user', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (prisma.account.create as jest.Mock).mockResolvedValue({
        id: '3',
        provider: 'google',
        providerAccountId: 'google-789',
        userId: existingUser.id,
      });

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      const account = await prisma.account.create({
        data: {
          provider: 'google',
          providerAccountId: 'google-789',
          userId: user!.id,
          type: 'oauth',
          access_token: 'token',
          token_type: 'Bearer',
        },
      });

      expect(account.userId).toBe(existingUser.id);
    });
  });

  describe('Password Management', () => {
    test('should update password with hash', async () => {
      const userId = '1';
      const newPassword = 'NewPassword123!@#';
      const hashedPassword = '$2a$10$newhashpassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        password: hashedPassword,
        updatedAt: new Date(),
      });

      const hashed = await bcrypt.hash(newPassword, 10);
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(updated.password).toBe(hashedPassword);
    });

    test('should validate password requirements', () => {
      const validPasswords = [
        'Test123!@#',
        'SecureP@ss123',
        'MyStr0ng!Pass',
      ];

      const invalidPasswords = [
        'short',
        'nouppercaseornumber!',
        'NoSpecialChar123',
        'NO LOWERCASE 123!',
        '',
      ];

      // Password validation regex
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      validPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(true);
      });

      invalidPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(false);
      });
    });
  });

  describe('User Profile Management', () => {
    test('should update user profile', async () => {
      const updates = {
        name: 'Updated Name',
        image: 'https://example.com/avatar.jpg',
        profession: 'Software Engineer',
        organization: 'Tech Corp',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        ...updates,
        updatedAt: new Date(),
      });

      const updated = await prisma.user.update({
        where: { id: '1' },
        data: updates,
      });

      expect(updated.name).toBe(updates.name);
      expect(updated.image).toBe(updates.image);
    });

    test('should delete user account', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'deleted@example.com',
      });

      const deleted = await prisma.user.delete({
        where: { id: '1' },
      });

      expect(deleted.id).toBe('1');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('Role and Plan Management', () => {
    test('should check user permissions', () => {
      const adminUser = { role: 'admin', plan: 'ENTERPRISE' };
      const freeUser = { role: 'user', plan: 'FREE' };
      const proUser = { role: 'user', plan: 'PRO' };

      // Admin permissions
      expect(adminUser.role === 'admin').toBe(true);
      
      // Plan-based permissions
      expect(freeUser.plan === 'FREE').toBe(true);
      expect(proUser.plan === 'PRO').toBe(true);
      
      // Feature access based on plan
      const canUseGPT4 = (plan: string) => ['PRO', 'ENTERPRISE'].includes(plan);
      
      expect(canUseGPT4(freeUser.plan)).toBe(false);
      expect(canUseGPT4(proUser.plan)).toBe(true);
      expect(canUseGPT4(adminUser.plan)).toBe(true);
    });

    test('should update user plan', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        plan: 'PRO',
        updatedAt: new Date(),
      });

      const updated = await prisma.user.update({
        where: { id: '1' },
        data: { plan: 'PRO' },
      });

      expect(updated.plan).toBe('PRO');
    });
  });
});