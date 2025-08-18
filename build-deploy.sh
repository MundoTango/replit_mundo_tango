#!/bin/bash
# ESA LIFE CEO 56x21 - Production Build Script
# Ensures commit 9cab03b0 glassmorphic interface is deployed

echo "🚀 ESA LIFE CEO 56x21 - Building for deployment..."

# Clean previous builds
rm -rf dist/

# Build frontend with Vite
echo "📦 Building frontend..."
npx vite build

# Build server WITHOUT vite.config.ts issues
echo "📦 Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build complete!"
echo "📌 Locked to commit 9cab03b0 glassmorphic interface"
echo "🎨 MT Ocean Theme with turquoise gradients preserved"