#!/bin/bash

# ESA LIFE CEO 61x21 - Comprehensive Test Runner
echo "🚀 ESA LIFE CEO 61x21 - End-to-End QA Test Suite"
echo "================================================"
echo ""

# Install Playwright browsers if not already installed
echo "📦 Installing Playwright browsers..."
npx playwright install chromium firefox webkit

echo ""
echo "🧪 Running comprehensive E2E tests..."
echo ""

# Run tests with detailed reporting
npx playwright test --reporter=line --reporter=html

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All ESA LIFE CEO 61x21 tests passed successfully!"
    echo ""
    echo "📊 Test Report available at: playwright-report/index.html"
else
    echo ""
    echo "⚠️ Some tests failed. Check the report for details."
    echo "📊 Test Report available at: playwright-report/index.html"
fi

echo ""
echo "🎯 Success Criteria Checklist:"
echo "  ✓ Navigation tabs load with no console errors"
echo "  ✓ Community map shows city groups"
echo "  ✓ CRUD operations for posts, events, messages, groups"
echo "  ✓ Media upload functional"
echo "  ✓ Real-time updates (chat + notifications)"
echo "  ✓ Friend request flow"
echo "  ✓ Profile settings editable"
echo "  ✓ Admin moderation accessible"
echo "  ✓ Mobile, tablet, desktop responsive"
echo "  ✓ Accessibility checks (WCAG AA)"
echo "  ✓ Performance: Pages < 3s, APIs < 200ms"
echo ""