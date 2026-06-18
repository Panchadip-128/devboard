import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
