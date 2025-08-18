#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Simple Deployment Server
 * ES Module version for compatibility
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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