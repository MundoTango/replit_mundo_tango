#!/usr/bin/env bash
# ESA LIFE CEO 61x21 - Optimized Docker Build Script
set -euo pipefail

echo "🧹 Clean previous build…"
rm -rf dist

echo "📦 Install deps…"
npm ci

echo "🏗️ Build…"
npm run build

echo "✅ Build complete. dist/ ready."