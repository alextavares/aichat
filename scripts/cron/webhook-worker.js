#!/usr/bin/env node

// Worker process that runs webhook processing every minute
// This is designed to run continuously on Digital Ocean App Platform

const { exec } = require('child_process');
const path = require('path');

console.log('Webhook worker started');
console.log('Will process pending webhooks every minute');

// Function to run the webhook processor
function processWebhooks() {
  const scriptPath = path.join(__dirname, '..', 'process-pending-webhooks.ts');
  
  console.log(`[${new Date().toISOString()}] Running webhook processor...`);
  
  exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Error running webhook processor:`, error);
      if (stderr) console.error('stderr:', stderr);
    } else {
      if (stdout) console.log(stdout);
      console.log(`[${new Date().toISOString()}] Webhook processing completed`);
    }
  });
}

// Run immediately on startup
processWebhooks();

// Schedule to run every minute
setInterval(processWebhooks, 60 * 1000);

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Webhook worker shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Webhook worker interrupted, shutting down...');
  process.exit(0);
});