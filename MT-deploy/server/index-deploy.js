// ESA LIFE CEO 56x21 - Production Server
// This file runs in production without vite or tsx dependencies

const express = require('express');
const path = require('path');
const { createServer } = require('http');
const compression = require('compression');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Essential middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    version: 'ESA LIFE CEO 56x21',
    commit: '9cab03b0',
    theme: 'glassmorphic MT Ocean'
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

// Start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ ESA LIFE CEO 56x21 Server running on port ${port}`);
  console.log(`🎨 Glassmorphic interface preserved`);
  console.log(`🔒 Locked to commit 9cab03b0`);
});