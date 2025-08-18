#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Development Server Entry Point
 * Permanent fix for TypeScript execution in ES module environment
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsFile = join(__dirname, 'index.ts');

if (!existsSync(tsFile)) {
  console.error(`Error: ${tsFile} not found`);
  process.exit(1);
}

console.log('[ESA 56x21] Starting development server with TypeScript support...');
console.log('[ESA 56x21] Memory: 4GB heap allocated');
console.log('[ESA 56x21] Environment: development');

// Use tsx directly without the problematic -r flag
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: dirname(__dirname),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
    PORT: process.env.PORT || 5000
  }
});

server.on('error', (err) => {
  console.error('[ESA 56x21] Failed to start server:', err.message);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[ESA 56x21] Server terminated by signal ${signal}`);
  } else if (code !== 0) {
    console.error(`[ESA 56x21] Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle termination signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`[ESA 56x21] Received ${signal}, shutting down...`);
    server.kill(signal);
  });
});