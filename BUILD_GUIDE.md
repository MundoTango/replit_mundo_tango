# Build Guide - Mundo Tango Platform

## Overview
This guide explains how to build the Mundo Tango platform with memory optimizations to avoid "JavaScript heap out of memory" errors.

## Quick Build Command
```bash
NODE_OPTIONS="--max_old_space_size=8192" npm run build
```

## Alternative: Use the Build Script
```bash
./build-optimize.sh
```

## Build Process Details

### Memory Optimization
The build process requires increased memory allocation due to:
- Large bundle sizes (especially the profile page at ~31MB)
- Complex TypeScript compilation
- Multiple lazy-loaded components

### What the Build Does
1. **Frontend Build (Vite)**
   - Compiles TypeScript to JavaScript
   - Bundles all React components
   - Optimizes assets (images, CSS, etc.)
   - Implements code splitting for lazy-loaded components

2. **Backend Build (esbuild)**
   - Compiles server TypeScript code
   - Bundles server dependencies
   - Creates production-ready server files

### Build Output
- Frontend assets: `../dist/public/`
- Backend server: `dist/index.js`

## Troubleshooting

### If Build Fails with Memory Error
1. Ensure you're using the NODE_OPTIONS environment variable
2. Check available system memory (minimum 8GB recommended)
3. Close other memory-intensive applications

### Large Bundle Warnings
The build will warn about chunks larger than 500KB. This is expected for:
- `profile-*.js` (~31MB) - Complex profile components
- `AdminCenter-*.js` (~930KB) - Admin dashboard
- `CommunityMapWithLayers-*.js` (~170KB) - Map functionality

Future optimization opportunities:
- Further code splitting for profile components
- Dynamic imports for admin features
- Lazy loading for map libraries

## Development vs Production
- Development: `npm run dev` (no memory issues, uses HMR)
- Production: Use the commands above with memory optimization

## Build Time
Expect the build to take 1-2 minutes depending on your system specifications.