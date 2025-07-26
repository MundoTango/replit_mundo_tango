import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Life CEO 40x20s Phase 1 Foundation Load Test
// Testing database connections, health checks, and basic APIs

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '2m', target: 100 },   // Ramp to 100 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.1'],             // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Test 1: Health Check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(0.5);

  // Test 2: Database Connection via Auth
  const authRes = http.get(`${BASE_URL}/api/auth/user`);
  check(authRes, {
    'auth status is 200': (r) => r.status === 200,
    'auth response has user data': (r) => r.json('id') !== undefined,
    'database query time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  sleep(0.5);

  // Test 3: Cache Performance
  const feedRes = http.get(`${BASE_URL}/api/posts/feed`);
  check(feedRes, {
    'feed status is 200': (r) => r.status === 200,
    'feed has data': (r) => r.json('data') !== undefined,
    'cache hit (fast response)': (r) => r.timings.duration < 50,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'phase1-results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  return `
Phase 1 Foundation Test Results:
================================
✓ Checks passed: ${metrics.checks.values.passes}/${metrics.checks.values.passes + metrics.checks.values.fails}
✓ Error rate: ${(metrics.errors.values.rate * 100).toFixed(2)}%
✓ Avg response time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
✓ P95 response time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
✓ Total requests: ${metrics.http_reqs.values.count}
`;
}