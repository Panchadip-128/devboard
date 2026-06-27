import { monitorEventLoopDelay } from 'perf_hooks';
import { metrics } from '@opentelemetry/api';
import redis from '../redis';
import { getQueue } from '../queue';

const EVENT_LOOP_MAX_LAG_MS = 100; // Trigger shedding if lag > 100ms
const MAX_QUEUE_DEPTH = 1000;      // Trigger shedding if queue > 1000 items
const CHECK_INTERVAL_MS = 5000;    // Check every 5 seconds
const REDIS_KEY = 'system:overload';

export async function startHealthMonitor() {
  const histogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();

  const meter = metrics.getMeter('devboard-health');
  
  const overloadStatusMetric = meter.createObservableGauge('system_overload_status', {
    description: 'Indicates if the system is currently shedding load (1 = Overloaded, 0 = Healthy)'
  });

  let isOverloaded = false;

  overloadStatusMetric.addCallback((result) => {
    result.observe(isOverloaded ? 1 : 0);
  });

  const eventLoopLagMetric = meter.createObservableGauge('nodejs_eventloop_lag_ms', {
    description: 'Mean event loop lag in milliseconds'
  });

  eventLoopLagMetric.addCallback((result) => {
    // Mean is in nanoseconds, convert to ms
    result.observe(histogram.mean / 1e6);
  });

  console.info('[Health Monitor] Started adaptive load shedding monitor.');

  setInterval(async () => {
    try {
      const queue = await getQueue();
      // Check the depth of our background job queue
      const queueDepth = await (queue as any).getQueueSize('github-webhook');
      
      const meanLagMs = histogram.mean / 1e6;
      
      if (meanLagMs > EVENT_LOOP_MAX_LAG_MS || queueDepth > MAX_QUEUE_DEPTH) {
        if (!isOverloaded) {
          console.warn(`[Health Monitor] SYSTEM OVERLOADED. Event loop lag: ${meanLagMs.toFixed(2)}ms, Queue depth: ${queueDepth}. Entering Load Shedding state.`);
        }
        isOverloaded = true;
        // Set with 6-second TTL, since interval is 5 seconds
        await redis.set(REDIS_KEY, '1', 'EX', 6);
      } else {
        if (isOverloaded) {
          console.info(`[Health Monitor] System recovered. Event loop lag: ${meanLagMs.toFixed(2)}ms, Queue depth: ${queueDepth}. Disabling Load Shedding.`);
        }
        isOverloaded = false;
        // Clean up the flag on recovery
        await redis.del(REDIS_KEY);
      }
      
      // Reset histogram for the next time window
      histogram.reset();
    } catch (error) {
      console.error('[Health Monitor] Error checking health metrics:', error);
    }
  }, CHECK_INTERVAL_MS);
}
