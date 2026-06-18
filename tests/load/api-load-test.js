import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 50 },  // Ramp up to 50 virtual users
    { duration: '15s', target: 50 },  // Stay at 50 VUs hitting the cache
    { duration: '5s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of cached requests should be < 100ms
  },
};

export default function () {
  // Hit the DORA metrics endpoint to benchmark the LRU cache
  const res = http.get('http://localhost:3000/api/teams/demo-team/metrics');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(0.5);
}
