#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testAPI() {
  console.log(`${colors.blue}🧪 Inner AI Clone - API Test Suite${colors.reset}\n`);
  
  let token = null;
  let conversationId = null;
  const results = { passed: 0, failed: 0 };

  // Helper function to make requests
  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers.Cookie = `next-auth.session-token=${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
      });
      
      const data = response.headers.get('content-type')?.includes('json') 
        ? await response.json() 
        : await response.text();
      
      return { ok: response.ok, status: response.status, data, headers: response.headers };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  // Helper to log test results
  function logTest(name, passed, details = '') {
    if (passed) {
      console.log(`${colors.green}✅ ${name}${colors.reset}`);
      results.passed++;
    } else {
      console.log(`${colors.red}❌ ${name}${colors.reset} ${details}`);
      results.failed++;
    }
  }

  // Test 1: Homepage
  console.log(`\n${colors.yellow}📋 Testing Homepage...${colors.reset}`);
  const home = await request('/');
  logTest('Homepage loads', home.ok);

  // Test 2: Authentication API
  console.log(`\n${colors.yellow}📋 Testing Authentication...${colors.reset}`);
  
  // Try to create account first
  const register = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User'
    })
  });
  
  if (!register.ok && register.data?.message?.includes('já existe')) {
    logTest('User already exists', true, '(expected)');
  } else {
    logTest('Register endpoint', register.ok);
  }

  // Sign in
  const signIn = await request('/api/auth/callback/credentials', {
    method: 'POST',
    body: new URLSearchParams({
      username: 'test@example.com',
      password: 'test123',
      csrfToken: 'test'
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  // Extract session token from cookies
  const cookies = signIn.headers.get('set-cookie');
  if (cookies) {
    const match = cookies.match(/next-auth\.session-token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }
  
  logTest('Sign in', !!token, token ? '' : 'No session token received');

  // Test 3: Templates API
  console.log(`\n${colors.yellow}📋 Testing Templates API...${colors.reset}`);
  
  const templates = await request('/api/templates');
  logTest('Get templates', templates.ok && Array.isArray(templates.data));
  
  if (templates.ok && templates.data.length > 0) {
    logTest('Templates populated', templates.data.length >= 6, 
      `Found ${templates.data.length} templates`);
    
    // Test template usage tracking
    const templateId = templates.data[0].id;
    const useTemplate = await request(`/api/templates/${templateId}/use`, {
      method: 'POST'
    });
    logTest('Track template usage', useTemplate.ok);
  }

  // Test 4: Chat API
  console.log(`\n${colors.yellow}📋 Testing Chat API...${colors.reset}`);
  
  const chatMessage = await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello, how are you?' }
      ],
      model: 'gpt-3.5-turbo'
    })
  });
  
  logTest('Send chat message', chatMessage.ok);
  
  if (chatMessage.ok) {
    conversationId = chatMessage.data.conversationId;
    logTest('Conversation created', !!conversationId, 
      `ID: ${conversationId}`);
    logTest('AI response received', !!chatMessage.data.message);
  }

  // Test 5: Streaming Chat API
  console.log(`\n${colors.yellow}📋 Testing Streaming Chat...${colors.reset}`);
  
  const streamChat = await request('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Tell me a short joke' }
      ],
      model: 'gpt-3.5-turbo',
      conversationId
    })
  });
  
  logTest('Streaming endpoint', streamChat.ok);

  // Test 6: Conversations API
  console.log(`\n${colors.yellow}📋 Testing Conversations API...${colors.reset}`);
  
  const conversations = await request('/api/conversations');
  logTest('Get conversations', conversations.ok && Array.isArray(conversations.data));
  
  if (conversations.ok && conversationId) {
    const conversation = await request(`/api/conversations/${conversationId}`);
    logTest('Get single conversation', conversation.ok);
    logTest('Messages loaded', 
      conversation.ok && conversation.data.messages?.length > 0,
      conversation.data?.messages ? `${conversation.data.messages.length} messages` : ''
    );
  }

  // Test 7: Usage API
  console.log(`\n${colors.yellow}📋 Testing Usage Tracking...${colors.reset}`);
  
  const usage = await request('/api/usage/today');
  logTest('Get today usage', usage.ok);
  
  if (usage.ok) {
    logTest('Usage data structure', 
      typeof usage.data.count === 'number' && 
      typeof usage.data.limit === 'number'
    );
    logTest('Usage tracked', usage.data.count > 0, 
      `${usage.data.count}/${usage.data.limit} messages`);
  }

  // Test 8: Dashboard APIs
  console.log(`\n${colors.yellow}📋 Testing Dashboard APIs...${colors.reset}`);
  
  const stats = await request('/api/dashboard/stats');
  logTest('Get usage stats', stats.ok);
  
  const plan = await request('/api/dashboard/plan');
  logTest('Get plan info', plan.ok);
  
  if (plan.ok) {
    logTest('Plan type', plan.data.type === 'FREE', 
      `Current plan: ${plan.data.type}`);
  }

  // Summary
  console.log(`\n${colors.blue}📊 Test Results Summary:${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`📋 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 All API tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the errors above.${colors.reset}`);
  }
}

// Run tests
console.log('Starting API tests...\n');
testAPI().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});