#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Bulletproof Server Launcher
 * Permanent fix for TypeScript execution issues
 * Version: 3.0 FINAL
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
  maxRetries: 10,
  retryDelay: 2000,
  healthCheckInterval: 30000,
  memoryLimit: 4096,
  serverPort: 5000,
  logFile: 'server.log',
  pidFile: '.server.pid',
  hideFramework: true // Hide ESA LIFE CEO references in production
};

let serverProcess = null;
let retryCount = 0;
let isShuttingDown = false;

// Clean console output
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const output = `[${timestamp}] [${level}] ${message}`;
  
  // Hide framework references if configured
  if (CONFIG.hideFramework) {
    const cleanMessage = message
      .replace(/ESA LIFE CEO.*?\s/gi, '')
      .replace(/56x21/gi, '')
      .replace(/40x20s/gi, 'system')
      .replace(/41x21s/gi, 'enhanced');
    console.log(`[${level}] ${cleanMessage}`);
  } else {
    console.log(output);
  }
  
  // Also write to log file
  fs.appendFileSync(CONFIG.logFile, output + '\n');
}

// Clean up old processes
function cleanup() {
  log('Cleaning up old processes...');
  
  // Kill any existing server processes
  try {
    if (fs.existsSync(CONFIG.pidFile)) {
      const oldPid = fs.readFileSync(CONFIG.pidFile, 'utf8');
      try {
        process.kill(parseInt(oldPid), 'SIGTERM');
        log(`Killed old process: ${oldPid}`);
      } catch (e) {
        // Process already dead
      }
      fs.unlinkSync(CONFIG.pidFile);
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Kill any orphaned tsx processes
  try {
    require('child_process').execSync('pkill -f "tsx.*server" 2>/dev/null || true');
  } catch (e) {
    // Ignore
  }
}

// Health check
async function checkHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: CONFIG.serverPort,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(data.includes('healthy'));
      });
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Start server with proper configuration
function startServer() {
  if (isShuttingDown) return;
  
  log('Starting server with optimized configuration...');
  
  // Environment setup
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: `--max-old-space-size=${CONFIG.memoryLimit} --expose-gc`,
    PORT: CONFIG.serverPort,
    DISABLE_REDIS: 'true', // Prevent Redis connection issues
    SUPPRESS_NO_CONFIG_WARNING: 'true'
  };
  
  // Use npx tsx for reliable TypeScript execution
  serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    cwd: '/home/runner/workspace',
    env,
    stdio: ['inherit', 'pipe', 'pipe'],
    detached: false
  });
  
  // Save PID
  fs.writeFileSync(CONFIG.pidFile, serverProcess.pid.toString());
  log(`Server started with PID: ${serverProcess.pid}`);
  
  // Handle stdout (clean output)
  serverProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim() && !line.includes('ERR_UNKNOWN_FILE_EXTENSION')) {
        if (CONFIG.hideFramework) {
          // Filter out framework references
          const clean = line
            .replace(/ESA.*?56x21/gi, 'System')
            .replace(/Life CEO/gi, 'Service')
            .replace(/40x20s|41x21s/gi, 'Framework');
          console.log(clean);
        } else {
          console.log(line);
        }
      }
    });
  });
  
  // Handle stderr (filter errors)
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    // Only log real errors, not TypeScript loader warnings
    if (!error.includes('ERR_UNKNOWN_FILE_EXTENSION') && 
        !error.includes('tsx/cjs') &&
        !error.includes('Unknown file extension')) {
      log(error, 'ERROR');
    }
  });
  
  // Handle process exit
  serverProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      log(`Server exited with code ${code}, signal ${signal}`, 'WARN');
      
      if (retryCount < CONFIG.maxRetries) {
        retryCount++;
        log(`Restarting... (attempt ${retryCount}/${CONFIG.maxRetries})`);
        setTimeout(startServer, CONFIG.retryDelay);
      } else {
        log('Max retries reached. Server failed to start.', 'ERROR');
        process.exit(1);
      }
    }
  });
  
  // Reset retry count on successful start
  serverProcess.on('spawn', () => {
    setTimeout(async () => {
      const isHealthy = await checkHealth();
      if (isHealthy) {
        retryCount = 0;
        log('✅ Server is healthy and running on port ' + CONFIG.serverPort);
      }
    }, 5000);
  });
}

// Monitor server health
function startHealthMonitor() {
  setInterval(async () => {
    if (!isShuttingDown && serverProcess) {
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        log('Health check failed, restarting server...', 'WARN');
        if (serverProcess) {
          serverProcess.kill('SIGTERM');
        }
      }
    }
  }, CONFIG.healthCheckInterval);
}

// Graceful shutdown
function gracefulShutdown(signal) {
  log(`Received ${signal}, shutting down gracefully...`);
  isShuttingDown = true;
  
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  }
  
  // Clean up PID file
  if (fs.existsSync(CONFIG.pidFile)) {
    fs.unlinkSync(CONFIG.pidFile);
  }
  
  setTimeout(() => {
    log('Shutdown complete');
    process.exit(0);
  }, 1000);
}

// Handle signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`, 'ERROR');
  if (!isShuttingDown) {
    startServer();
  }
});

// Main execution
async function main() {
  log('=== ESA LIFE CEO 56x21 Bulletproof Launcher v3.0 ===');
  log('Initializing comprehensive server management...');
  
  // Clean up first
  cleanup();
  
  // Start server
  startServer();
  
  // Start health monitoring after 10 seconds
  setTimeout(() => {
    log('Starting health monitoring...');
    startHealthMonitor();
  }, 10000);
  
  log('Server launcher initialized. Press Ctrl+C to stop.');
}

// Start
main().catch(err => {
  log(`Fatal error: ${err.message}`, 'ERROR');
  process.exit(1);
});