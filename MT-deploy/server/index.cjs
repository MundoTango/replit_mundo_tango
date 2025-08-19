#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - CommonJS Launcher for Workflow Compatibility
 * This file bypasses the ES module TypeScript loader issue
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('[ESA 56x21] Starting server with TypeScript support...');

// Start the real TypeScript server
const server = spawn('npx', ['tsx', path.join(__dirname, 'index.real.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
    PORT: 5000,
    DISABLE_REDIS: 'true'
  }
});

server.on('error', (err) => {
  console.error('[ESA 56x21] Server start failed:', err.message);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`[ESA 56x21] Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Handle shutdown signals
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`[ESA 56x21] Received ${signal}, shutting down...`);
    server.kill(signal);
  });
});