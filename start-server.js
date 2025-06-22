const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor Next.js...');

const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

nextProcess.on('close', (code) => {
  console.log(`📊 Servidor encerrado com código: ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});