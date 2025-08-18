#!/bin/bash
# Push TypeScript fixes to GitHub for CI/CD pipeline

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - TypeScript Fix Push"
echo "=================================================="
echo ""

echo "📊 Current TypeScript errors check..."
ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "error" || echo "0")
echo "Found $ERROR_COUNT TypeScript errors"
echo ""

if [ "$ERROR_COUNT" -eq "0" ]; then
    echo "✅ No TypeScript errors - ready to push!"
else
    echo "⚠️ Warning: $ERROR_COUNT TypeScript errors remain"
    echo "CI/CD may still fail, but pushing current fixes..."
fi
echo ""

echo "🚀 Pushing fixes to GitHub..."
git add -A
git commit -m "Fix TypeScript errors in GroupDetailPage and groups-old for CI/CD pipeline" || true
git push origin main

echo ""
echo "✅ Push complete! Check GitHub Actions for CI/CD status."
echo "=================================================="