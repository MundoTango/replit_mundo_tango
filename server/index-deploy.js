
// ESA LIFE CEO 61x21 - Deployment Hardened Server
const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 5000;

// Essential middleware only for deployment
app.use(compression());
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint for Autoscale
app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

// Catch-all handler for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[ESA 61x21] Server listening on 0.0.0.0:${port}`);
  console.log(`[ESA 61x21] Health check available at /healthz`);
  console.log(`[ESA 61x21] Memory limit: ${process.env.NODE_OPTIONS || 'default'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ESA 61x21] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[ESA 61x21] Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('[ESA 61x21] SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('[ESA 61x21] Process terminated');
  });
});

module.exports = app;
