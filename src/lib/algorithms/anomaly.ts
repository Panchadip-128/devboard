/**
 * Statistical Anomaly Detection Engine
 *
 * Uses a sliding window Z-score algorithm over historical DORA metric
 * time series. When a metric deviates more than 2 standard deviations
 * from its 30-day rolling mean, it flags an anomaly.
 */

export type MetricDataPoint = {
  date: string;   // ISO date string
  value: number;
};

export type Anomaly = {
  metric: string;
  date: string;
  value: number;
  mean: number;
  stdDev: number;
  zScore: number;
  type: 'spike' | 'drop';
  severity: 'warning' | 'critical';
};

export function detectAnomalies(
  series: MetricDataPoint[],
  metricName: string,
  windowSize: number = 30,
  threshold: number = 2.0
): Anomaly[] {
  if (series.length < windowSize + 1) return [];

  const anomalies: Anomaly[] = [];

  for (let i = windowSize; i < series.length; i++) {
    const window = series.slice(i - windowSize, i);
    const current = series[i];

    const mean = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    const variance = window.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / window.length;
    const stdDev = Math.sqrt(variance);

    // Avoid division by zero for flat metrics
    if (stdDev === 0) continue;

    const zScore = (current.value - mean) / stdDev;

    if (Math.abs(zScore) >= threshold) {
      anomalies.push({
        metric: metricName,
        date: current.date,
        value: current.value,
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        zScore: parseFloat(zScore.toFixed(2)),
        type: zScore > 0 ? 'spike' : 'drop',
        severity: Math.abs(zScore) >= 3.0 ? 'critical' : 'warning',
      });
    }
  }

  return anomalies;
}

/**
 * Builds a daily time series from an array of timestamped records.
 * Groups records by calendar date and counts occurrences per day.
 */
export function buildDailyTimeSeries(
  records: { createdAt: Date }[],
  days: number = 90
): MetricDataPoint[] {
  const now = new Date();
  const series: MetricDataPoint[] = [];
  const countMap = new Map<string, number>();

  for (const record of records) {
    const dateKey = record.createdAt.toISOString().split('T')[0];
    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
  }

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateKey = date.toISOString().split('T')[0];
    series.push({ date: dateKey, value: countMap.get(dateKey) || 0 });
  }

  return series;
}
