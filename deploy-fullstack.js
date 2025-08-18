#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Full-Stack Production Server
 * Includes backend API and frontend with live data
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

console.log('🚀 ESA LIFE CEO 56x21 - Full-Stack Production Server');
console.log('📌 Glassmorphic MT Ocean Theme with Live Data');
console.log(`🌐 Port: ${PORT}`);
console.log('🗄️ Database: Connected');

// Check if dist/public exists
const publicPath = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(publicPath)) {
  console.error('❌ Error: dist/public not found. Please run build first.');
  process.exit(1);
}

// Start the backend server using tsx
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
    PORT: PORT
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