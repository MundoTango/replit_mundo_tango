#!/bin/bash
# ESA LIFE CEO 56x21 - Production Build Script
# Builds frontend only, avoiding module conflicts

echo "🚀 ESA LIFE CEO 56x21 - Production Build"
echo "📌 Preserving glassmorphic MT Ocean Theme"

# Build frontend
echo "📦 Building frontend..."
npm run build

echo "✅ Build complete"
echo "🎯 Ready for deployment with production-server.js"