#!/bin/bash
# Life CEO Production Build Script
# Simple wrapper for deployment with memory optimizations

echo "🧠 Life CEO: Preparing production build..."

# Set environment variables
export NODE_OPTIONS="--max_old_space_size=8192"
export GENERATE_SOURCEMAP=false

# Run the build
echo "🏗️ Building for production..."
npm run build

echo "✅ Build completed!"