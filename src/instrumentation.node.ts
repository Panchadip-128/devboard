import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { startGithubWorker } from './workers/githubWorker';

const sdk = new NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Start the pg-boss background worker to process incoming GitHub webhooks
startGithubWorker().catch(console.error);
