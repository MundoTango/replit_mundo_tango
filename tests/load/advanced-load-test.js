import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiTrend = new Trend('api_response_time');
const memoryTrend = new Trend('memory_response_time');

export const options = {
  scenarios: {
    // Scenario 1: Normal load
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
    },
    // Scenario 2: Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 0 },
      ],
      startTime: '10m',
    },
    // Scenario 3: Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 200 },
        { duration: '10m', target: 200 },
        { duration: '5m', target: 300 },
        { duration: '10m', target: 300 },
        { duration: '5m', target: 0 },
      ],
      startTime: '20m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.05'],
    api_response_time: ['p(95)<500'],
    memory_response_time: ['p(95)<800'],
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Test different user journeys
  const journey = Math.random();
  
  if (journey < 0.4) {
    // 40% - Browse memories
    browseMemories();
  } else if (journey < 0.7) {
    // 30% - Create content
    createContent();
  } else if (journey < 0.9) {
    // 20% - Social interactions
    socialInteractions();
  } else {
    // 10% - Heavy operations
    heavyOperations();
  }
}

function browseMemories() {
  group('Browse Memories', () => {
    // Load homepage
    const homepage = http.get(`${BASE_URL}/`);
    check(homepage, {
      'homepage loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(1);
    
    // Load memories feed
    const start = Date.now();
    const memories = http.get(`${BASE_URL}/api/posts/feed`);
    const responseTime = Date.now() - start;
    
    memoryTrend.add(responseTime);
    check(memories, {
      'memories load': (r) => r.status === 200,
      'memories fast': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    
    sleep(2);
    
    // Load user profile
    const profile = http.get(`${BASE_URL}/api/user/profile/7`);
    check(profile, {
      'profile loads': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(1);
  });
}

function createContent() {
  group('Create Content', () => {
    // Post a memory
    const postData = {
      content: `Load test memory ${Date.now()}`,
      emotionTags: ['happy', 'excited'],
      location: 'Buenos Aires, Argentina',
    };
    
    const start = Date.now();
    const response = http.post(
      `${BASE_URL}/api/posts`,
      JSON.stringify(postData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const responseTime = Date.now() - start;
    
    apiTrend.add(responseTime);
    check(response, {
      'post created': (r) => r.status === 201 || r.status === 200,
      'post fast': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
    
    sleep(2);
  });
}

function socialInteractions() {
  group('Social Interactions', () => {
    // Get friends list
    const friends = http.get(`${BASE_URL}/api/friends`);
    check(friends, {
      'friends load': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(1);
    
    // Get notifications
    const notifications = http.get(`${BASE_URL}/api/notifications`);
    check(notifications, {
      'notifications load': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(1);
    
    // Like a post
    const like = http.post(`${BASE_URL}/api/posts/123/like`);
    check(like, {
      'like successful': (r) => r.status === 200 || r.status === 201,
    }) || errorRate.add(1);
    
    sleep(1);
  });
}

function heavyOperations() {
  group('Heavy Operations', () => {
    // Search
    const search = http.get(`${BASE_URL}/api/search?q=tango`);
    check(search, {
      'search works': (r) => r.status === 200,
      'search reasonable': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
    
    sleep(1);
    
    // Get events
    const events = http.get(`${BASE_URL}/api/events?city=Buenos Aires`);
    check(events, {
      'events load': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    sleep(2);
    
    // Get analytics
    const analytics = http.get(`${BASE_URL}/api/analytics/dashboard`);
    check(analytics, {
      'analytics load': (r) => r.status === 200,
      'analytics acceptable': (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);
    
    sleep(1);
  });
}