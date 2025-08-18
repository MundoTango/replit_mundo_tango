#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Production Deployment Server
 * CommonJS version (.cjs extension for compatibility)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 ESA LIFE CEO 56x21 - Production Server Starting');
console.log('📌 Glassmorphic MT Ocean Theme - Locked Version');
console.log(`🌐 Port: ${PORT}`);

// Serve static files from dist/public
const publicPath = path.join(__dirname, 'dist', 'public');

if (!fs.existsSync(publicPath)) {
  console.error('❌ Error: dist/public not found. Please run build first.');
  process.exit(1);
}

// Static file serving
app.use(express.static(publicPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log('✅ Glassmorphic UI ready');
  console.log('✅ MT Ocean Theme active');
});