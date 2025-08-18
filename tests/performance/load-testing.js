import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

const BASE_URL = 'http://localhost:5000';

// Test authentication token (should be replaced with actual auth flow)
const AUTH_TOKEN = 'Bearer test-token';

export default function () {
  // Test 1: Homepage load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads within 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: API endpoint - Posts feed
  response = http.get(`${BASE_URL}/api/posts/feed`, {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  check(response, {
    'posts feed status is 200 or 401': (r) => [200, 401].includes(r.status),
    'posts feed responds within 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: API endpoint - Events sidebar
  response = http.get(`${BASE_URL}/api/events/sidebar`, {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  check(response, {
    'events sidebar status is 200 or 401': (r) => [200, 401].includes(r.status),
    'events sidebar responds within 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: User search
  response = http.get(`${BASE_URL}/api/users/search?q=test`, {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  check(response, {
    'user search status is 200 or 401': (r) => [200, 401].includes(r.status),
    'user search responds within 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(2);
}

// Scenario for authenticated user workflow
export function authenticatedUserFlow() {
  // Test post creation
  const postData = {
    content: `Load test post created at ${new Date().toISOString()}`,
    isPublic: true,
    location: 'Buenos Aires, Argentina'
  };

  let response = http.post(`${BASE_URL}/api/posts`, JSON.stringify(postData), {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'post creation status is 201 or 401': (r) => [201, 401].includes(r.status),
    'post creation responds within 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test event creation
  const eventData = {
    title: `Load Test Event ${Date.now()}`,
    description: 'Performance testing event',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    location: 'Test Venue, Buenos Aires',
    eventType: 'milonga'
  };

  response = http.post(`${BASE_URL}/api/events`, JSON.stringify(eventData), {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'event creation status is 201 or 401': (r) => [201, 401].includes(r.status),
    'event creation responds within 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(2);
}

// Database-intensive operations test
export function databaseStressTest() {
  // Test with pagination to stress database
  const page = Math.floor(Math.random() * 10) + 1;
  
  let response = http.get(`${BASE_URL}/api/posts/feed?page=${page}&limit=20`, {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'paginated feed status is 200 or 401': (r) => [200, 401].includes(r.status),
    'paginated feed responds within 1.5s': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  // Test events with filters
  response = http.get(`${BASE_URL}/api/events?eventType=milonga&city=Buenos Aires`, {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'filtered events status is 200 or 401': (r) => [200, 401].includes(r.status),
    'filtered events responds within 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);
}

// Export scenarios for different test types
export const scenarios = {
  default: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: options.stages,
    gracefulRampDown: '30s',
  },
  authenticated_flow: {
    executor: 'constant-vus',
    vus: 5,
    duration: '5m',
    exec: 'authenticatedUserFlow',
  },
  database_stress: {
    executor: 'constant-arrival-rate',
    rate: 10,
    timeUnit: '1s',
    duration: '3m',
    preAllocatedVUs: 5,
    maxVUs: 20,
    exec: 'databaseStressTest',
  },
};