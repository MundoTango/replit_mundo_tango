/**
 * Load Testing Script
 * Phase 12: Load Testing & Scalability (40L Framework)
 * 
 * Usage: npm run load-test
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const profileLoadTime = new Rate('profile_load_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.1'],             // Error rate must be below 10%
    profile_load_time: ['p(95)<2000'] // Profile page 95% under 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test scenarios
export default function () {
  // Scenario 1: Homepage load
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loads quickly': (r) => r.timings.duration < 300,
  });
  errorRate.add(res.status !== 200);
  
  sleep(1);
  
  // Scenario 2: User profile load
  const profileStart = new Date();
  res = http.get(`${BASE_URL}/api/user/admin3304`);
  const profileDuration = new Date() - profileStart;
  
  check(res, {
    'Profile status is 200': (r) => r.status === 200,
    'Profile has user data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data;
    },
  });
  profileLoadTime.add(profileDuration < 2000);
  
  sleep(1);
  
  // Scenario 3: Travel details load
  res = http.get(`${BASE_URL}/api/user/travel-details`, {
    headers: { 'Cookie': 'session=test-session' },
  });
  check(res, {
    'Travel details status is 200': (r) => r.status === 200,
  });
  
  sleep(2);
  
  // Scenario 4: Event search
  res = http.get(`${BASE_URL}/api/events?q=Buenos%20Aires`);
  check(res, {
    'Event search status is 200': (r) => r.status === 200,
    'Event search returns results': (r) => {
      const body = JSON.parse(r.body);
      return body.data && Array.isArray(body.data);
    },
  });
  
  sleep(1);
  
  // Scenario 5: Groups API
  res = http.get(`${BASE_URL}/api/groups`);
  check(res, {
    'Groups API responds': (r) => r.status === 200,
    'Groups data structure valid': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.groups;
    },
  });
  
  sleep(2);
  
  // Scenario 6: Concurrent API calls (simulate real usage)
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/notifications/count`],
    ['GET', `${BASE_URL}/api/friends/requests/count`],
    ['GET', `${BASE_URL}/api/posts/feed`],
  ]);
  
  responses.forEach((res) => {
    check(res, {
      'Batch request successful': (r) => r.status === 200,
    });
  });
  
  sleep(3);
}

// Smoke test configuration
export function smokeTest() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'Health check passes': (r) => r.status === 200,
  });
}

// Stress test configuration  
export function stressTest() {
  // Simulate heavy profile creation
  const payload = JSON.stringify({
    eventName: `Stress Test Event ${Date.now()}`,
    eventType: 'festival',
    city: 'Buenos Aires',
    country: 'Argentina',
    startDate: '2025-08-01',
    endDate: '2025-08-05',
    status: 'planned',
    notes: 'Load test event',
    isPublic: true
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'session=test-session'
    },
  };
  
  const res = http.post(`${BASE_URL}/api/user/travel-details`, payload, params);
  check(res, {
    'Can create travel detail under load': (r) => r.status === 200 || r.status === 201,
  });
}

// Soak test for memory leaks
export function soakTest() {
  // Run for extended period with constant load
  const res = http.get(`${BASE_URL}/api/posts/feed?limit=50`);
  check(res, {
    'Feed loads with large dataset': (r) => r.status === 200,
    'Response time stable': (r) => r.timings.duration < 1000,
  });
  sleep(5);
}