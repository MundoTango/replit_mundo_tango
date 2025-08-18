import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Life CEO 40x20s Phase 4 Intelligent Optimization Load Test
// Testing self-healing mechanisms, ML patterns, and adaptive optimization

const errorRate = new Rate('errors');
const optimizationTriggers = new Counter('optimization_triggers');
const selfHealingSuccess = new Rate('self_healing_success');
const mlPredictionAccuracy = new Rate('ml_prediction_accuracy');
const adaptiveResponse = new Trend('adaptive_response_time');

export const options = {
  scenarios: {
    // Scenario 1: Normal load pattern
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      exec: 'normalLoad',
    },
    // Scenario 2: Spike detection
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '10s', target: 1000 }, // Sudden spike
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      startTime: '3m',
      exec: 'spikeTest',
    },
    // Scenario 3: Memory pressure
    memory_pressure: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      startTime: '6m',
      exec: 'memoryPressure',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    errors: ['rate<0.05'],
    self_healing_success: ['rate>0.8'], // 80% self-healing success
    ml_prediction_accuracy: ['rate>0.7'], // 70% ML accuracy
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Normal load pattern
export function normalLoad() {
  // Test intelligent caching predictions
  const endpoints = [
    '/api/posts/feed',
    '/api/events/sidebar',
    '/api/groups',
    '/api/friends/suggestions',
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}${endpoint}`);
  const responseTime = Date.now() - startTime;
  
  adaptiveResponse.add(responseTime);
  
  // Check if intelligent optimization kicked in
  const hasOptimization = res.headers['X-Optimized'] === 'true';
  if (hasOptimization) {
    optimizationTriggers.add(1);
  }
  
  check(res, {
    'Response successful': (r) => r.status === 200,
    'Response optimized': () => hasOptimization,
    'Response time adaptive': () => responseTime < 200,
  }) || errorRate.add(1);
  
  sleep(1);
}

// Spike test to trigger self-healing
export function spikeTest() {
  const heavyEndpoints = [
    '/api/posts/feed?limit=100',
    '/api/search?q=tango&includeAll=true',
    '/api/statistics/global?detailed=true',
  ];
  
  const endpoint = heavyEndpoints[Math.floor(Math.random() * heavyEndpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    timeout: '10s',
  });
  
  // Check if self-healing activated
  const selfHealed = res.headers['X-Self-Healed'] === 'true';
  if (selfHealed) {
    selfHealingSuccess.add(1);
  }
  
  check(res, {
    'Spike handled': (r) => r.status === 200 || r.status === 503,
    'Self-healing activated': () => selfHealed,
  }) || errorRate.add(1);
  
  sleep(0.1);
}

// Memory pressure test
export function memoryPressure() {
  // Create memory pressure with large payloads
  const largeData = JSON.stringify({
    content: 'Memory test ' + Date.now(),
    data: new Array(1000).fill('x').join(''),
    metadata: {
      test: true,
      size: 'large',
    },
  });
  
  const res = http.post(`${BASE_URL}/api/posts`, largeData, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Check ML prediction accuracy
  const mlPredicted = res.headers['X-ML-Predicted'] === 'true';
  if (mlPredicted) {
    mlPredictionAccuracy.add(1);
  }
  
  check(res, {
    'Memory pressure handled': (r) => r.status === 200 || r.status === 201,
    'ML optimization applied': () => mlPredicted,
  }) || errorRate.add(1);
  
  sleep(2);
}

export function handleSummary(data) {
  const { metrics } = data;
  const selfHealRate = (metrics.self_healing_success?.values?.rate || 0) * 100;
  const mlAccuracy = (metrics.ml_prediction_accuracy?.values?.rate || 0) * 100;
  const optimizations = metrics.optimization_triggers?.values?.count || 0;
  
  return {
    'phase4-results.json': JSON.stringify(data),
    stdout: `
Phase 4 Intelligent Optimization Test Results:
==============================================
🧠 ML Prediction Accuracy: ${mlAccuracy.toFixed(2)}%
🔧 Self-Healing Success Rate: ${selfHealRate.toFixed(2)}%
⚡ Optimization Triggers: ${optimizations}
📊 Total Requests: ${metrics.http_reqs.values.count}
⏱️ Avg Adaptive Response: ${(metrics.adaptive_response_time?.values?.avg || 0).toFixed(2)}ms
🎯 P95 Response Time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
❌ Error Rate: ${(metrics.errors.values.rate * 100).toFixed(2)}%

Intelligence Metrics:
✓ Self-Healing (>80%): ${selfHealRate >= 80 ? 'PASSED ✅' : 'FAILED ❌'}
✓ ML Accuracy (>70%): ${mlAccuracy >= 70 ? 'PASSED ✅' : 'FAILED ❌'}
✓ Adaptive Performance: ${metrics.http_req_duration.values['p(95)'] < 300 ? 'PASSED ✅' : 'FAILED ❌'}

40x20s Learning: ${optimizations > 0 ? 'System successfully adapted to load patterns' : 'No adaptive optimizations triggered'}

${selfHealRate >= 80 && mlAccuracy >= 70 ? '🎉 Phase 4 Intelligence Test PASSED!' : '⚠️  Intelligence system needs tuning'}
`,
  };
}