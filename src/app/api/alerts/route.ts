import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { detectAnomalies, buildDailyTimeSeries } from '@/lib/algorithms/anomaly';

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [deployments, commits, incidents] = await Promise.all([
      prisma.deployment.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.commit.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.incident.findMany({
        where: { openedAt: { gte: since } },
        select: { openedAt: true },
        orderBy: { openedAt: 'asc' },
      }),
    ]);

    const deploymentSeries = buildDailyTimeSeries(deployments, 90);
    const commitSeries = buildDailyTimeSeries(commits, 90);
    const incidentSeries = buildDailyTimeSeries(
      incidents.map((i) => ({ createdAt: i.openedAt })),
      90
    );

    const allAnomalies = [
      ...detectAnomalies(deploymentSeries, 'Deployment Frequency'),
      ...detectAnomalies(commitSeries, 'Commit Volume'),
      ...detectAnomalies(incidentSeries, 'Incident Rate'),
    ];

    // Sort by date descending, most recent first
    allAnomalies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      alerts: allAnomalies.slice(0, 20),
      totalAlerts: allAnomalies.length,
      criticalCount: allAnomalies.filter((a) => a.severity === 'critical').length,
      warningCount: allAnomalies.filter((a) => a.severity === 'warning').length,
    });
  } catch (error) {
    console.error('Failed to compute anomaly alerts:', error);
    return NextResponse.json({ alerts: [], totalAlerts: 0, criticalCount: 0, warningCount: 0 });
  }
}
