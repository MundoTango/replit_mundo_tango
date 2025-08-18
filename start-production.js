#!/usr/bin/env node
// ESA LIFE CEO 56x21 - Production Launcher
// Bypasses module system conflicts

const { spawn } = require('child_process');

console.log('🚀 ESA LIFE CEO 56x21 - Starting production server...');
console.log('📌 Preserving glassmorphic MT Ocean Theme');

// Run the TypeScript server directly with tsx to avoid module conflicts
const server = spawn('node', [
  '--max-old-space-size=4096',
  '--expose-gc',
  '-r', 'tsx/cjs',
  'server/index.ts'
], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code);
});