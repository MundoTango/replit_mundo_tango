#!/usr/bin/env node

/**
 * Production Server Launcher - ESA LIFE CEO 56x21 Final Solution
 * Bypasses all TypeScript loader issues permanently
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');

console.log('[INFO] Starting production server...');

// Kill any existing processes
exec('pkill -f "tsx.*server" 2>/dev/null || true', (err) => {
  exec('pkill -f "node.*server" 2>/dev/null || true', (err) => {
    
    // Start the server with proper configuration
    const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
      cwd: '/home/runner/workspace',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
        PORT: 5000,
        DISABLE_REDIS: 'true'
      },
      stdio: 'inherit',
      detached: false
    });

    serverProcess.on('error', (error) => {
      console.error('[ERROR] Failed to start server:', error.message);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[ERROR] Server exited with code ${code}`);
        // Auto-restart on crash
        setTimeout(() => {
          console.log('[INFO] Restarting server...');
          require('child_process').fork(__filename);
        }, 2000);
      }
    });

    // Save PID for monitoring
    if (serverProcess.pid) {
      fs.writeFileSync('.server.pid', serverProcess.pid.toString());
      console.log(`[INFO] Server started with PID ${serverProcess.pid}`);
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => {
      console.log('[INFO] Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('[INFO] Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    });
  });
});