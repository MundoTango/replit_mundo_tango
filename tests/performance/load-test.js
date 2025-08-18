import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 10 },  // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.05'],            // Error rate under 5%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function() {
  // Test health endpoint
  let healthResponse = http.get(`${BASE_URL}/api/health`);
  check(healthResponse, {
    'health endpoint status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  errorRate.add(healthResponse.status !== 200);
  responseTimeTrend.add(healthResponse.timings.duration);

  // Test unauthorized access (should return 401)
  let authResponse = http.get(`${BASE_URL}/api/auth/user`);
  check(authResponse, {
    'auth endpoint properly returns 401': (r) => r.status === 401,
    'auth response time < 50ms': (r) => r.timings.duration < 50,
  });

  // Test posts feed (unauthorized)
  let postsResponse = http.get(`${BASE_URL}/api/posts/feed`);
  check(postsResponse, {
    'posts endpoint properly handles auth': (r) => r.status === 401,
    'posts response time < 50ms': (r) => r.timings.duration < 50,
  });

  sleep(1); // Wait between iterations
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}