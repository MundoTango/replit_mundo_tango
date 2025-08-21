#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Ultimate Server Launcher
 * This ES module starts the server without workflow errors
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('[ESA 56x21] Ultimate server launcher starting...');
console.log('[ESA 56x21] Memory allocation: 4GB');
console.log('[ESA 56x21] Environment: ' + (process.env.NODE_ENV || 'development'));

// Start the TypeScript server
const serverProcess = spawn('npx', ['tsx', join(__dirname, 'server/index-actual.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
    PORT: process.env.PORT || 5000,
    DISABLE_REDIS: 'true'
  }
});

serverProcess.on('error', (error) => {
  console.error('[ESA 56x21] Server start failed:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[ESA 56x21] Server terminated by signal ${signal}`);
  } else if (code !== 0) {
    console.error(`[ESA 56x21] Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle termination signals
['SIGTERM', 'SIGINT', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(`[ESA 56x21] Received ${signal}, shutting down...`);
    serverProcess.kill(signal);
  });
});