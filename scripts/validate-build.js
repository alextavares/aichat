#!/usr/bin/env node

/**
 * Build Validation Script
 * Validates TypeScript and ESLint without hanging
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

const TIMEOUT = 30000; // 30 seconds timeout

function runCommand(command, args, description) {
  return new Promise((resolve) => {
    console.log(chalk.blue(`🔍 ${description}...`));
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      timeout: TIMEOUT
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data;
    });
    
    child.stderr.on('data', (data) => {
      stderr += data;
    });
    
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        success: false,
        error: `Command timed out after ${TIMEOUT/1000}s`,
        stdout,
        stderr
      });
    }, TIMEOUT);
    
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        success: code === 0,
        code,
        stdout,
        stderr
      });
    });
    
    child.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        error: error.message,
        stdout,
        stderr
      });
    });
  });
}

async function validateBuild() {
  console.log(chalk.green.bold('🚀 Starting Build Validation\n'));
  
  const results = [];
  
  // 1. TypeScript Check (with stricter timeout)
  console.log(chalk.yellow('Step 1: TypeScript Validation'));
  const tsResult = await runCommand('npx', ['tsc', '--noEmit', '--incremental', 'false'], 'Checking TypeScript');
  
  if (tsResult.success) {
    console.log(chalk.green('✅ TypeScript: No errors found'));
  } else {
    console.log(chalk.red('❌ TypeScript: Errors found'));
    if (tsResult.stdout) {
      console.log(chalk.gray('Output:'));
      console.log(tsResult.stdout.slice(0, 1000)); // First 1000 chars
    }
    if (tsResult.stderr) {
      console.log(chalk.gray('Errors:'));
      console.log(tsResult.stderr.slice(0, 1000));
    }
  }
  results.push({ name: 'TypeScript', ...tsResult });
  
  // 2. ESLint Check
  console.log(chalk.yellow('\nStep 2: ESLint Validation'));
  const lintResult = await runCommand('npx', ['next', 'lint', '--max-warnings', '0'], 'Running ESLint');
  
  if (lintResult.success) {
    console.log(chalk.green('✅ ESLint: No errors found'));
  } else {
    console.log(chalk.red('❌ ESLint: Errors found'));
    if (lintResult.stdout) {
      console.log(chalk.gray('Output:'));
      console.log(lintResult.stdout.slice(0, 1000));
    }
  }
  results.push({ name: 'ESLint', ...lintResult });
  
  // 3. Build Test (dry run)
  console.log(chalk.yellow('\nStep 3: Build Dry Run'));
  const buildResult = await runCommand('npx', ['next', 'build', '--dry-run'], 'Testing build configuration');
  
  if (buildResult.success) {
    console.log(chalk.green('✅ Build Config: Valid'));
  } else {
    console.log(chalk.red('❌ Build Config: Issues found'));
    if (buildResult.stdout) {
      console.log(chalk.gray('Output:'));
      console.log(buildResult.stdout.slice(0, 1000));
    }
  }
  results.push({ name: 'Build Config', ...buildResult });
  
  // Summary
  console.log(chalk.blue.bold('\n📊 Validation Summary:'));
  let allPassed = true;
  
  results.forEach(result => {
    const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    console.log(`${status} ${result.name}`);
    if (!result.success) allPassed = false;
  });
  
  console.log(chalk.blue('\n' + '='.repeat(50)));
  
  if (allPassed) {
    console.log(chalk.green.bold('🎉 All validations passed! Build is ready for production.'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('🚨 Some validations failed. Fix errors before deploying.'));
    process.exit(1);
  }
}

// Run validation
validateBuild().catch(error => {
  console.error(chalk.red.bold('💥 Validation script error:'), error);
  process.exit(1);
});