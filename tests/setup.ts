import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'FREE',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Web APIs for integration tests
global.Request = class Request {
  constructor(input: string | Request, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body || null;
  }
  url: string;
  method: string;
  headers: Headers;
  body: any;
  
  async json() { return {}; }
  async text() { return ''; }
  async formData() { return new FormData(); }
  clone() { return this; }
};

global.Response = class Response {
  constructor(body?: any, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Headers(init?.headers);
    this.body = body;
  }
  status: number;
  statusText: string;
  headers: Headers;
  body: any;
  ok = this.status >= 200 && this.status < 300;
  
  async json() { return this.body; }
  async text() { return String(this.body); }
  clone() { return this; }
  
  static json(data: any, init?: ResponseInit) {
    return new Response(data, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  }
};

global.Headers = class Headers extends Map {
  append(name: string, value: string) { this.set(name, value); }
  delete(name: string) { super.delete(name); }
  get(name: string) { return super.get(name) || null; }
  has(name: string) { return super.has(name); }
  set(name: string, value: string) { super.set(name, value); }
};

global.fetch = jest.fn();

// Silence console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});