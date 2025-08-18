#!/bin/bash

echo "🚀 ESA LIFE CEO 56x21 - Simple Build Process"
echo "📌 Building glassmorphic MT Ocean Theme"

# Clean previous builds
rm -rf dist

# Build frontend only (backend runs from source)
echo "📦 Building frontend..."
npm run build

# Check if build succeeded
if [ -d "dist/public" ]; then
  echo "✅ Build successful"
  echo "📁 Frontend built to dist/public"
else
  echo "❌ Build failed - dist/public not created"
  exit 1
fi

echo "✨ Ready for deployment"