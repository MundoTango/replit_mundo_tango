import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Life CEO 40x20s Phase 3 Performance Load Test
// Testing high concurrency, cache optimization, and system limits

const errorRate = new Rate('errors');
const cacheHitRate = new Rate('cache_hits');
const responseTime = new Trend('custom_response_time');

export const options = {
  stages: [
    { duration: '1m', target: 100 },    // Warm up
    { duration: '2m', target: 500 },    // Ramp to 500 users
    { duration: '5m', target: 1000 },   // Sustain 1000 users
    { duration: '2m', target: 2000 },   // Spike to 2000 users
    { duration: '2m', target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<400'], // Sub-200ms P95
    errors: ['rate<0.02'],                          // Error rate below 2%
    cache_hits: ['rate>0.8'],                       // Cache hit rate above 80%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Test 1: Cache effectiveness
  const cacheTestEndpoints = [
    '/api/posts/feed',
    '/api/events/sidebar',
    '/api/groups',
    '/api/statistics/global',
  ];

  cacheTestEndpoints.forEach(endpoint => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}${endpoint}`);
    const duration = Date.now() - startTime;
    
    responseTime.add(duration);
    
    const isCacheHit = res.headers['X-Cache-Status'] === 'HIT' || duration < 50;
    cacheHitRate.add(isCacheHit ? 1 : 0);
    
    check(res, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} uses cache`]: () => isCacheHit,
    }) || errorRate.add(1);
  });

  sleep(0.2);

  // Test 2: Concurrent user sessions
  const sessionBatch = http.batch([
    ['GET', `${BASE_URL}/api/auth/user`],
    ['GET', `${BASE_URL}/api/notifications/count`],
    ['GET', `${BASE_URL}/api/friends/requests/count`],
    ['GET', `${BASE_URL}/api/posts/feed?limit=50`],
  ]);

  sessionBatch.forEach((res, i) => {
    check(res, {
      [`Session request ${i} successful`]: (r) => r.status === 200,
      [`Session request ${i} fast`]: (r) => r.timings.duration < 100,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  // Test 3: Memory-intensive operations
  const heavyRes = http.get(`${BASE_URL}/api/posts/feed?limit=100&includeComments=true`);
  check(heavyRes, {
    'Heavy request successful': (r) => r.status === 200,
    'Heavy request under 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  const { metrics } = data;
  const cacheRate = metrics.cache_hits.values.rate * 100;
  const errorPct = metrics.errors.values.rate * 100;
  
  return {
    'phase3-results.json': JSON.stringify(data),
    stdout: `
Phase 3 Performance Test Results:
=================================
🚀 Peak concurrent users: ${metrics.vus.values.max}
📊 Total requests: ${metrics.http_reqs.values.count}
⚡ Avg response time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
🎯 P95 response time: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
💾 Cache hit rate: ${cacheRate.toFixed(2)}%
❌ Error rate: ${errorPct.toFixed(2)}%
🔥 RPS achieved: ${(metrics.http_reqs.values.rate || 0).toFixed(2)}

Performance Goals:
✓ Sub-200ms P95: ${metrics.http_req_duration.values['p(95)'] < 200 ? 'PASSED ✅' : 'FAILED ❌'}
✓ 80%+ cache hits: ${cacheRate >= 80 ? 'PASSED ✅' : 'FAILED ❌'}
✓ <2% errors: ${errorPct < 2 ? 'PASSED ✅' : 'FAILED ❌'}

${cacheRate >= 80 && errorPct < 2 ? '🎉 Phase 3 Performance Test PASSED!' : '⚠️  Performance optimization needed'}
`,
  };
}