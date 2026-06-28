import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { startGithubWorker } from './workers/githubWorker';
import { startHealthMonitor } from './lib/metrics/healthMonitor';

const sdk = new NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Start the pg-boss background worker to process incoming GitHub webhooks
startGithubWorker().catch(console.error);

// Start the adaptive load shedding health monitor
startHealthMonitor().catch(console.error);

import { Worker } from 'worker_threads';
import path from 'path';

// --- Phase 1: Zero-Allocation Telemetry Ring Buffer Initialization ---
const globalSymbol = Symbol.for('global_ring_buffer');
if (!(global as any)[globalSymbol]) {
  const capacity = 10000;
  const byteLength = 8 + (capacity * 8);
  const sharedBuffer = new SharedArrayBuffer(byteLength);
  (global as any)[globalSymbol] = sharedBuffer;

  // Boot the background worker thread.
  try {
    // We point to the pre-compiled worker built by tsc during build step
    const workerPath = path.resolve(process.cwd(), 'dist/workers/telemetryWorker.js');
    const worker = new Worker(workerPath, { workerData: { sharedBuffer } });
    worker.on('error', (err) => console.error('[Telemetry Worker Error]', err));
    worker.on('exit', (code) => console.log(`[Telemetry Worker] exited with code ${code}`));
  } catch (e) {
    console.warn('[Telemetry Worker] Failed to start worker in this dev context. Architecture is set up.');
  }
}

// --- Phase 2: Raft Consensus Initialization ---
import { RaftNode } from './lib/consensus/RaftNode';
const raftSymbol = Symbol.for('global_raft_node');
if (!(global as any)[raftSymbol]) {
  // In a real cloud setup, we would dynamically resolve other pod IPs via DNS
  const mockPeers = [
    'http://node-2.internal:3000',
    'http://node-3.internal:3000'
  ];
  
  const raftNode = new RaftNode(mockPeers);
  (global as any)[raftSymbol] = raftNode;
}
