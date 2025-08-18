// ESA LIFE CEO 56x21 - Server startup with proper memory configuration
const { spawn } = require('child_process');

console.log('🚀 ESA: Starting server with 4GB heap for video uploads...');
console.log('Memory: --max-old-space-size=4096 (4GB)');

// Start the server with proper memory settings
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
  }
  process.exit(code);
});