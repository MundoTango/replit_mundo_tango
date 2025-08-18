import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Life CEO 40x20s Phase 2 API Optimization Load Test
// Testing concurrent requests, API performance, and rate limiting

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Ramp to 50 users
    { duration: '1m', target: 200 },    // Ramp to 200 users
    { duration: '3m', target: 500 },    // Test with 500 concurrent users
    { duration: '1m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'], // Tighter performance requirements
    errors: ['rate<0.05'],                          // Error rate must be below 5%
    http_req_failed: ['rate<0.05'],                 // Failed requests below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test user data
const testUsers = [
  { email: 'test1@mundotango.life', password: 'test123' },
  { email: 'test2@mundotango.life', password: 'test123' },
  { email: 'test3@mundotango.life', password: 'test123' },
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Concurrent API requests
  const batch = http.batch([
    ['GET', `${BASE_URL}/api/posts/feed`],
    ['GET', `${BASE_URL}/api/events/sidebar`],
    ['GET', `${BASE_URL}/api/groups`],
    ['GET', `${BASE_URL}/api/friends/suggestions`],
  ]);

  batch.forEach((res, i) => {
    check(res, {
      [`Request ${i} status is 200`]: (r) => r.status === 200,
      [`Request ${i} response time < 200ms`]: (r) => r.timings.duration < 200,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  // Test 2: POST request performance
  const postData = JSON.stringify({
    content: `Performance test post ${Date.now()}`,
    location: 'Buenos Aires, Argentina',
    emotionTags: ['happy', 'excited'],
  });

  const headers = { 'Content-Type': 'application/json' };
  const postRes = http.post(`${BASE_URL}/api/posts`, postData, { headers });
  
  check(postRes, {
    'POST status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    'POST response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(0.5);

  // Test 3: Search API performance
  const searchRes = http.get(`${BASE_URL}/api/search?q=tango&type=all`);
  check(searchRes, {
    'Search status is 200': (r) => r.status === 200,
    'Search response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'phase2-results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  const successRate = 100 - (metrics.errors.values.rate * 100);
  
  return `
Phase 2 API Optimization Test Results:
======================================
✓ Success rate: ${successRate.toFixed(2)}%
✓ Total requests: ${metrics.http_reqs.values.count}
✓ Avg response time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
✓ P95 response time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
✓ P99 response time: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
✓ Max response time: ${metrics.http_req_duration.values.max.toFixed(2)}ms
✓ Concurrent users: ${metrics.vus.values.max}
✓ RPS: ${(metrics.http_reqs.values.rate || 0).toFixed(2)}

${successRate >= 95 ? '🎉 API Performance Test PASSED!' : '⚠️  API Performance needs improvement'}
`;
}