export const testConfig = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User'
  },
  timeouts: {
    navigation: 10000,
    element: 5000,
    api: 30000
  }
}
