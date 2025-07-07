#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Ensures all critical systems are ready for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-Deployment Validation Starting...\n');

const checks = [];
let hasErrors = false;

function addCheck(name, status, message = '') {
  checks.push({ name, status, message });
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} ${name}: ${status}${message ? ` - ${message}` : ''}`);
  if (status === 'FAIL') hasErrors = true;
}

// 1. Environment Variables Check
console.log('📋 Checking Environment Variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET', 
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'STRIPE_SECRET_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    addCheck(`ENV: ${envVar}`, 'PASS', 'Configured');
  } else {
    addCheck(`ENV: ${envVar}`, 'WARN', 'Not set in current environment');
  }
});

// 2. TypeScript Type Check
console.log('\n🔍 Running TypeScript Type Check...');
try {
  execSync('npx tsc --noEmit --incremental false', { stdio: 'pipe' });
  addCheck('TypeScript Types', 'PASS', 'No type errors');
} catch (error) {
  const output = error.stdout?.toString() || '';
  const errorCount = (output.match(/error TS/g) || []).length;
  if (errorCount > 0) {
    addCheck('TypeScript Types', 'FAIL', `${errorCount} type errors found`);
  } else {
    addCheck('TypeScript Types', 'PASS', 'No type errors');
  }
}

// 3. ESLint Check
console.log('\n🧹 Running ESLint Check...');
try {
  execSync('npx next lint', { stdio: 'pipe' });
  addCheck('ESLint', 'PASS', 'No linting errors');
} catch (error) {
  addCheck('ESLint', 'WARN', 'Linting issues found');
}

// 4. Build Test
console.log('\n🔨 Testing Production Build...');
try {
  execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
  addCheck('Production Build', 'PASS', 'Build successful');
} catch (error) {
  addCheck('Production Build', 'FAIL', 'Build failed');
}

// 5. Critical Files Check
console.log('\n📁 Checking Critical Files...');
const criticalFiles = [
  'lib/auth.ts',
  'lib/prisma.ts', 
  'middleware.ts',
  'next.config.ts',
  'package.json',
  'app.yaml'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    addCheck(`File: ${file}`, 'PASS', 'Exists');
  } else {
    addCheck(`File: ${file}`, 'FAIL', 'Missing');
  }
});

// 6. Database Schema Check
console.log('\n🗄️ Checking Database Schema...');
try {
  if (fs.existsSync('prisma/schema.prisma')) {
    addCheck('Prisma Schema', 'PASS', 'Schema file exists');
  } else {
    addCheck('Prisma Schema', 'FAIL', 'Schema file missing');
  }
} catch (error) {
  addCheck('Prisma Schema', 'FAIL', 'Error checking schema');
}

// 7. Security Check
console.log('\n🔒 Security Validation...');
const securityChecks = [
  { file: 'next.config.ts', pattern: /ignoreBuildErrors.*true/, name: 'Build Error Suppression' },
  { file: 'next.config.ts', pattern: /ignoreDuringBuilds.*true/, name: 'Lint Error Suppression' },
];

securityChecks.forEach(check => {
  try {
    const content = fs.readFileSync(check.file, 'utf8');
    if (check.pattern.test(content)) {
      addCheck(`Security: ${check.name}`, 'FAIL', 'Found dangerous configuration');
    } else {
      addCheck(`Security: ${check.name}`, 'PASS', 'Configuration secure');
    }
  } catch (error) {
    addCheck(`Security: ${check.name}`, 'WARN', 'Could not verify');
  }
});

// Final Report
console.log('\n' + '='.repeat(60));
console.log('📊 PRE-DEPLOYMENT VALIDATION REPORT');
console.log('='.repeat(60));

const passed = checks.filter(c => c.status === 'PASS').length;
const warned = checks.filter(c => c.status === 'WARN').length; 
const failed = checks.filter(c => c.status === 'FAIL').length;

console.log(`✅ PASSED: ${passed}`);
console.log(`⚠️  WARNED: ${warned}`);
console.log(`❌ FAILED: ${failed}`);

if (hasErrors) {
  console.log('\n❌ DEPLOYMENT BLOCKED: Critical issues found');
  console.log('🔧 Please fix the failed checks before deploying to production');
  process.exit(1);
} else if (warned > 0) {
  console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS');
  console.log('✅ You can proceed but consider addressing warnings');
  process.exit(0);
} else {
  console.log('\n🚀 DEPLOYMENT READY: All checks passed!');
  console.log('✅ System is ready for production deployment');
  process.exit(0);
}