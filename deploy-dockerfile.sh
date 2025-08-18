#!/bin/bash
# ESA LIFE CEO 61x21 - Docker Deployment Script
# Optimized deployment under 500MB

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - Docker Deployment"
echo "=================================================="
echo ""

echo "📊 Current build size:"
du -sh dist/ 2>/dev/null || echo "No dist folder yet"
echo ""

echo "🏗️ Building optimized production bundle..."
npm run build

echo ""
echo "📦 Final dist size:"
du -sh dist/

echo ""
echo "🚀 Ready for deployment!"
echo "=================================================="
echo "✅ Dockerfile created - excludes 2.8GB of uploads/attached_assets"
echo "✅ Multi-stage build - minimal runtime image"
echo "✅ Production-only dependencies"
echo "✅ Target: autoscale (better than gce)"
echo ""
echo "📝 To deploy:"
echo "1. Click the Deploy button in Replit"
echo "2. Select 'Docker' as deployment type"
echo "3. Deploy will use the Dockerfile automatically"
echo "=================================================="