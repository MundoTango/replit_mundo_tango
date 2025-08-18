#!/bin/bash

# Life CEO 40x20s Load Testing Runner
# Run all phase load tests and generate reports

echo "🚀 Life CEO 40x20s Load Testing Suite"
echo "====================================="
echo ""

BASE_URL=${BASE_URL:-"http://localhost:5000"}

# Create results directory
mkdir -p test-results

# Phase 1: Foundation
echo "📊 Running Phase 1 Foundation Tests..."
k6 run -e BASE_URL=$BASE_URL tests/k6/phase1-foundation.js
mv phase1-results.json test-results/ 2>/dev/null || true
echo ""

# Phase 2: API Optimization
echo "⚡ Running Phase 2 API Optimization Tests..."
k6 run -e BASE_URL=$BASE_URL tests/k6/phase2-api-optimization.js
mv phase2-results.json test-results/ 2>/dev/null || true
echo ""

# Phase 3: Performance
echo "🏎️  Running Phase 3 Performance Tests..."
k6 run -e BASE_URL=$BASE_URL tests/k6/phase3-performance.js
mv phase3-results.json test-results/ 2>/dev/null || true
echo ""

# Phase 4: Intelligent Optimization
echo "🧠 Running Phase 4 Intelligent Optimization Tests..."
k6 run -e BASE_URL=$BASE_URL tests/k6/phase4-intelligent-optimization.js
mv phase4-results.json test-results/ 2>/dev/null || true
echo ""

echo "✅ All load tests completed!"
echo "📁 Results saved in test-results/"
echo ""
echo "🎯 40x20s Learning: Load testing across all phases provides comprehensive performance validation"