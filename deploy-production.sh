#!/bin/bash
# ESA LIFE CEO 56x21 - Production Deployment Script
# Fixes module system conflicts

echo "🚀 ESA LIFE CEO 56x21 - Production Deployment"
echo "📌 Preserving glassmorphic MT Ocean Theme"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

echo "✅ Build complete - ready for deployment"
echo "🔧 Deployment will run: npm run start:production"