#!/usr/bin/env node

/**
 * Quick TypeScript fixes for common errors
 * Fixes the most critical type errors identified
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.green.bold('🔧 Applying Quick TypeScript Fixes\n'));

// Fix 1: Add type definitions to global scope for missing modules
const typeDefinitionsPath = path.join(__dirname, '..', 'types', 'global.d.ts');
const globalTypes = `
// Global type definitions for missing modules
declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  
  function pdfParse(buffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  export = pdfParse;
}

declare module 'bun' {
  export function write(path: string, data: string): Promise<void>;
}

// Fix any context type issues
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      OPENAI_API_KEY?: string;
      OPENROUTER_API_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      MERCADOPAGO_ACCESS_TOKEN?: string;
    }
  }
}

export {};
`;

// Ensure types directory exists
const typesDir = path.dirname(typeDefinitionsPath);
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Write global type definitions
fs.writeFileSync(typeDefinitionsPath, globalTypes);
console.log(chalk.green('✅ Added global type definitions'));

// Fix 2: Update tsconfig to include the new types
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// Add types to include array if not present
if (!tsconfig.include.includes('types/**/*.d.ts')) {
  tsconfig.include.push('types/**/*.d.ts');
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log(chalk.green('✅ Updated tsconfig.json to include global types'));
}

// Fix 3: Create a simple type assertion helper
const typeHelpersPath = path.join(__dirname, '..', 'lib', 'type-helpers.ts');
const typeHelpers = `
/**
 * Type helper utilities
 */

// Safe type assertion for API responses
export function assertType<T>(value: any): T {
  return value as T;
}

// Safe JSON parsing with type assertion
export function parseJsonAs<T>(json: string): T {
  return JSON.parse(json) as T;
}

// Environment variable helper with defaults
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(\`Environment variable \${key} is required\`);
  }
  return value || defaultValue!;
}

export default { assertType, parseJsonAs, getEnvVar };
`;

fs.writeFileSync(typeHelpersPath, typeHelpers);
console.log(chalk.green('✅ Created type helper utilities'));

console.log(chalk.blue.bold('\n🎉 Quick TypeScript fixes applied!'));
console.log(chalk.yellow('Run "npm run validate-build" again to check for remaining errors.'));