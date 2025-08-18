/**
 * ESA LIFE CEO 56x21 - Ultimate TypeScript Loader Override
 * Completely bypasses ES module errors by intercepting Node.js execution
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're loading a TypeScript file
const tsFileArg = process.argv.find(arg => arg.endsWith('.ts'));

if (tsFileArg) {
  console.log('[ESA 56x21] TypeScript file detected, bypassing ES module loader...');
  
  // Find the actual TypeScript file to run
  let fileToRun = tsFileArg;
  if (fileToRun.endsWith('server/index.ts')) {
    const actualFile = fileToRun.replace('index.ts', 'index-actual.ts');
    if (fs.existsSync(actualFile)) {
      fileToRun = actualFile;
    }
  }
  
  console.log('[ESA 56x21] Starting server with full TypeScript support...');
  
  // Launch the server with tsx which properly handles ES modules and TypeScript
  const child = spawn('npx', ['tsx', fileToRun], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development',
      NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
      PORT: process.env.PORT || 5000,
      DISABLE_REDIS: 'true'
    }
  });
  
  child.on('error', (err) => {
    console.error('[ESA 56x21] Server start failed:', err.message);
    process.exit(1);
  });
  
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[ESA 56x21] Server terminated by signal ${signal}`);
    } else if (code !== 0) {
      console.error(`[ESA 56x21] Server exited with code ${code}`);
    }
    process.exit(code || 0);
  });
  
  // Forward termination signals
  ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach(signal => {
    process.on(signal, () => {
      console.log(`[ESA 56x21] Forwarding ${signal} to server...`);
      child.kill(signal);
    });
  });
  
  // Prevent Node.js from continuing its normal execution
  // This stops the ES module loader from trying to load the .ts file
  process.argv = process.argv.slice(0, 2); // Clear command line arguments
  
  // Keep the process alive
  setInterval(() => {}, 1 << 30);
} else {
  console.log('[ESA 56x21] No TypeScript file in command line');
}