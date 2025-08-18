// ESA LIFE CEO 56x21 - Production Server
// CommonJS launcher that bypasses all module conflicts

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ESA LIFE CEO 56x21 - Starting production server...');
console.log('📌 Preserving glassmorphic MT Ocean Theme');
console.log('💾 Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

// Check if tsx is available
const tsx = spawn('node', [
  '--max-old-space-size=4096',
  '--expose-gc',
  '-r', 'tsx/cjs',
  'server/index.ts'
], {
  env: { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  },
  stdio: 'inherit',
  cwd: __dirname
});

tsx.on('error', (err) => {
  console.error('Failed to start server:', err);
  console.log('Falling back to built version...');
  
  // Fallback to built version if tsx fails
  const fallback = spawn('node', ['dist/index.js'], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit'
  });
  
  fallback.on('exit', (code) => {
    process.exit(code);
  });
});

tsx.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
  }
  process.exit(code);
});