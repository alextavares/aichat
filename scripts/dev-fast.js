#!/usr/bin/env node

/**
 * 🚀 DESENVOLVIMENTO ULTRA-RÁPIDO
 * Script para iniciar desenvolvimento com todas otimizações
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🚀 Iniciando Modo de Desenvolvimento Rápido...\n'));

// Configurações de ambiente otimizadas
const devEnv = {
  ...process.env,
  NODE_ENV: 'development',
  NEXT_TELEMETRY_DISABLED: '1',
  WATCHPACK_POLLING: 'false',
  NODE_OPTIONS: '--max-old-space-size=8192', // 8GB de RAM
  FORCE_COLOR: '1',
  
  // Desabilita verificações em dev
  SKIP_ENV_VALIDATION: 'true',
  ANALYZE: 'false',
  
  // Cache agressivo
  NEXT_PRIVATE_PREBUNDLE: '1',
  __NEXT_PRIVATE_PREBUNDLED_REACT: '1'
};

// Comandos para executar em paralelo
const commands = [
  {
    name: '🔥 Next.js Dev Server',
    command: 'next',
    args: ['dev', '--turbo', '--port', '3000'],
    color: chalk.cyan
  },
  {
    name: '📊 TypeScript Watch',
    command: 'tsc',
    args: ['--watch', '--project', 'tsconfig.dev.json', '--preserveWatchOutput'],
    color: chalk.yellow
  }
];

// Executar comandos
commands.forEach(({ name, command, args, color }) => {
  console.log(color(`Starting ${name}...`));
  
  const proc = spawn(command, args, {
    env: devEnv,
    stdio: 'pipe',
    shell: true
  });

  // Colorir output
  proc.stdout.on('data', (data) => {
    process.stdout.write(color(data.toString()));
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(chalk.red(data.toString()));
  });

  proc.on('error', (error) => {
    console.error(chalk.red(`Error in ${name}:`, error));
  });
});

// Mensagem de sucesso
setTimeout(() => {
  console.log(chalk.green.bold('\n✅ Modo de Desenvolvimento Rápido Ativo!'));
  console.log(chalk.gray('\nDicas para máxima velocidade:'));
  console.log(chalk.gray('- Use "npm run dev:fast" ao invés de "npm run dev"'));
  console.log(chalk.gray('- Alterações em código são instantâneas'));
  console.log(chalk.gray('- TypeScript roda em paralelo (não bloqueia)'));
  console.log(chalk.gray('- Build de produção ainda valida tudo\n'));
}, 2000);

// Capturar Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Encerrando modo de desenvolvimento...'));
  process.exit(0);
});