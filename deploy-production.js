#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Production Deployment
 * Full backend + frontend with database
 */

// Simple launcher that runs the actual server
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 ESA LIFE CEO 56x21 - Starting Production Server');
console.log('📌 Full-Stack with Live Database');
console.log('🗄️ PostgreSQL Connected');

// Run the actual server that already handles everything
const server = spawn('node', [
  '--max-old-space-size=4096',
  'server/index.js'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  },
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));