import { NextRequest, NextResponse } from 'next/server';
import redis from './redis';
import { metrics } from '@opentelemetry/api';

let shedCounter: any = null;
try {
  const meter = metrics.getMeter('devboard-api');
  shedCounter = meter.createCounter('http_requests_shed_total', {
    description: 'Total number of HTTP requests shed due to high load'
  });
} catch (e) {
  // Gracefully handle if telemetry isn't fully initialized in some environments
  console.warn('OpenTelemetry meter not available for shedCounter');
}

export function withLoadShedding(
  handler: (req: NextRequest, params: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, params: any) => {
    try {
      // Check if we are in an overload state from the Redis flag
      const isOverloaded = await redis.get('system:overload');
      
      if (isOverloaded === '1') {
        if (shedCounter) {
          shedCounter.add(1, { route: req.nextUrl.pathname });
        }
        
        console.warn(`[Load Shedding] Shedding request to ${req.nextUrl.pathname}`);
        return NextResponse.json(
          { 
            error: 'Service temporarily unavailable due to high load.',
            code: 'LOAD_SHEDDING_ACTIVE' 
          }, 
          { 
            status: 503,
            headers: {
              'Retry-After': '10', // Ask clients to back off for 10 seconds
            }
          }
        );
      }
    } catch (error) {
      // If Redis fails, we should 'fail open' so a cache issue doesn't take down the API
      console.error('[Load Shedding] Failed to check Redis status, failing open:', error);
    }

    return handler(req, params);
  };
}
