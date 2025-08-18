#!/bin/bash

# Optimized build script with memory management

echo "🚀 Starting optimized build process..."

# Clear any existing build cache
echo "🧹 Clearing build cache..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf client/dist

# Export build environment variables
export NODE_OPTIONS="--max_old_space_size=8192"
export NODE_ENV="production"
export VITE_BUILD_SOURCEMAP="false"
export VITE_BUILD_MINIFY="true"

echo "📦 Building with 8GB memory allocation..."

# Run the build with increased memory
npm run build

echo "✅ Build completed successfully!"