import prisma from '@/lib/prisma';
import IncidentsClient from './IncidentsClient';

export const dynamic = 'force-dynamic';

async function fetchIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        repository: { select: { name: true } },
        updates: { orderBy: { createdAt: 'asc' } },
        _count: { select: { updates: true } },
      },
      orderBy: { openedAt: 'desc' },
    });
    return incidents;
  } catch {
    // Fallback mock data
    return [
      {
        id: 'inc-1', title: 'API Gateway 502 errors spike', state: 'resolved',
        severity: 'critical', rootCause: 'Connection pool misconfiguration',
        postmortem: '## Summary\nConnection pool exhausted under load.\n\n## Impact\n320 requests affected.\n\n## Lessons Learned\n- Added connection pool monitoring\n- Implemented circuit breaker',
        actionItems: ['Add alerting threshold', 'Write regression test', 'Update runbook'],
        openedAt: new Date(Date.now() - 5 * 86400000), resolvedAt: new Date(Date.now() - 4.5 * 86400000),
        repository: { name: 'api-gateway' },
        updates: [
          { id: 'u1', status: 'investigating', message: 'Alert triggered. Investigating root cause.', authorId: 'alice', createdAt: new Date(Date.now() - 5 * 86400000) },
          { id: 'u2', status: 'identified', message: 'Root cause: connection pool misconfiguration.', authorId: 'bob', createdAt: new Date(Date.now() - 4.8 * 86400000) },
          { id: 'u3', status: 'monitoring', message: 'Fix deployed. Monitoring for regression.', authorId: 'alice', createdAt: new Date(Date.now() - 4.6 * 86400000) },
          { id: 'u4', status: 'resolved', message: 'Incident resolved. All systems nominal.', authorId: 'charlie', createdAt: new Date(Date.now() - 4.5 * 86400000) },
        ],
        _count: { updates: 4 },
      },
      {
        id: 'inc-2', title: 'Database connection pool exhausted', state: 'open',
        severity: 'high', rootCause: null, postmortem: null, actionItems: [],
        openedAt: new Date(Date.now() - 1 * 86400000), resolvedAt: null,
        repository: { name: 'data-pipeline' },
        updates: [
          { id: 'u5', status: 'investigating', message: 'High latency detected on data-pipeline queries.', authorId: 'diana', createdAt: new Date(Date.now() - 1 * 86400000) },
          { id: 'u6', status: 'identified', message: 'Root cause identified: connection leak in batch processor.', authorId: 'eve', createdAt: new Date(Date.now() - 0.8 * 86400000) },
        ],
        _count: { updates: 2 },
      },
      {
        id: 'inc-3', title: 'Auth service returning 401 for valid tokens', state: 'resolved',
        severity: 'medium', rootCause: 'Expired TLS certificate', postmortem: '## Summary\nTLS cert expiration caused token validation failures.\n\n## Impact\n~150 users affected for 2 hours.',
        actionItems: ['Automate certificate renewal', 'Add cert expiry monitoring'],
        openedAt: new Date(Date.now() - 12 * 86400000), resolvedAt: new Date(Date.now() - 11.9 * 86400000),
        repository: { name: 'auth-service' },
        updates: [
          { id: 'u7', status: 'investigating', message: 'Users reporting 401 errors.', authorId: 'frank', createdAt: new Date(Date.now() - 12 * 86400000) },
          { id: 'u8', status: 'resolved', message: 'Certificate renewed. Issue resolved.', authorId: 'grace', createdAt: new Date(Date.now() - 11.9 * 86400000) },
        ],
        _count: { updates: 2 },
      },
    ];
  }
}

export default async function IncidentsPage() {
  const incidents = await fetchIncidents();
  return <IncidentsClient incidents={JSON.parse(JSON.stringify(incidents))} />;
}
