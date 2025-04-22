import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000, // 1000 RPS
      timeUnit: '1s',
      duration: '5m', // Run for 5 minutes
      preAllocatedVUs: 500, // Pre-allocate VUs
      maxVUs: 1000, // Maximum VUs
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    http_reqs: ['rate>=1000'],        // Ensure we're maintaining 1000 RPS
  },
};

export default function () {
  const res = http.get('http://localhost:3030/services');
  check(res, { 
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}