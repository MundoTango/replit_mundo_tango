#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Deployment Wrapper
 * Pure CommonJS with zero module conflicts
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 ESA LIFE CEO 56x21 - Starting Production Server');
console.log('📌 Glassmorphic MT Ocean Theme - Locked Version');

// Ensure dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist directory not found. Run build first.');
  process.exit(1);
}

// Check for public files
const publicPath = path.join(distPath, 'public');
if (!fs.existsSync(publicPath)) {
  console.error('❌ Error: dist/public not found. Frontend not built.');
  process.exit(1);
}

// Start the server using tsx to handle TypeScript
const serverProcess = spawn('node', [
  '--max-old-space-size=4096',
  '--expose-gc',
  '-r', 'tsx/cjs',
  path.join(__dirname, 'server', 'index.ts')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000'
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('⏹ Shutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⏹ Shutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});