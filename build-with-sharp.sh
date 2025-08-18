#!/bin/bash
# ESA LIFE CEO 61x21 - Build Script with Sharp Fix

echo "Installing Sharp with Linux binaries..."
npm install --platform=linux --arch=x64 sharp --force

echo "Rebuilding Sharp for Linux..."
npm rebuild sharp --platform=linux --arch=x64

echo "Building with optimized script..."
./build-optimized.sh

echo "Build complete!"