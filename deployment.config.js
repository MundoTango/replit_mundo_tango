// ESA LIFE CEO 56x21 - Deployment Configuration
// This file ensures proper deployment settings

module.exports = {
  // Memory settings for production
  memoryLimit: '512MB',
  
  // Build optimization
  buildOptions: {
    sourcemap: false,
    minify: true,
    target: 'node18'
  },
  
  // Runtime settings
  runtime: {
    nodeVersion: '20.x',
    maxOldSpaceSize: 512
  }
};