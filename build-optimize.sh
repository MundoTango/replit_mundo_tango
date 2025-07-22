#!/bin/bash
# Optimized build script with memory management

# Load build environment variables
if [ -f .env.build ]; then
  export $(cat .env.build | xargs)
fi

# Set Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=8192"

# Clear cache before build
rm -rf node_modules/.vite
rm -rf dist

# Run the build with optimized settings
echo "Starting optimized build process..."

# Build frontend with Vite
echo "Building frontend..."
NODE_OPTIONS="--max_old_space_size=8192" vite build

# Build backend with esbuild
echo "Building backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"