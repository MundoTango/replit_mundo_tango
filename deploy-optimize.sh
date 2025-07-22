#!/bin/bash
# Life CEO Deployment Optimization Script
# Fixes JavaScript heap out of memory errors during Vite build

echo "🧠 Life CEO: Starting optimized deployment process..."

# Run Life CEO Build Optimizer
node life-ceo-build-optimizer.js

# Set memory allocation to 8GB with garbage collection
export NODE_OPTIONS="--max_old_space_size=8192 --expose-gc"
export GENERATE_SOURCEMAP=false

echo "💾 Memory allocation set to 8GB with GC enabled"

# Clear cache before build
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite

# Run the build with optimizations
echo "🏗️ Building with memory optimizations..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Life CEO: Deployment build completed successfully!"
    echo "📦 Build artifacts created in ./dist"
else
    echo "❌ Build failed. Check build-stats.json for details."
    exit 1
fi