#!/usr/bin/env bash
set -euo pipefail
echo "🧹 Clean"; rm -rf dist
echo "📦 Install deps"; npm ci
echo "🏗️ Build"; npm run build
echo "📁 Built: dist/"; du -sh dist || true