import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user data
export const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    role: 'user',
    plan: 'FREE',
    image: null,
  },
  {
    id: '2',
    email: 'premium@example.com',
    password: 'Premium123!@#',
    name: 'Premium User',
    role: 'user',
    plan: 'PRO',
    image: null,
  },
  {
    id: '3',
    email: 'admin@innerai.com',
    password: 'Admin123!@#',
    name: 'Admin User',
    role: 'admin',
    plan: 'ENTERPRISE',
    image: null,
  },
];

// Mock NextAuth configuration for testing
export const mockAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = mockUsers.find(u => 
          u.email === credentials.email && 
          u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan,
            image: user.image,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Mock session data
export const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    plan: 'FREE',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// Mock auth responses
export const mockAuthResponses = {
  success: {
    url: '/dashboard',
    ok: true,
    error: null,
    status: 200,
  },
  invalidCredentials: {
    url: null,
    ok: false,
    error: 'CredentialsSignin',
    status: 401,
  },
  networkError: {
    url: null,
    ok: false,
    error: 'NetworkError',
    status: 500,
  },
};