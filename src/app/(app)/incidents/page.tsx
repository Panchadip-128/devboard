import prisma from '@/lib/prisma';
import IncidentsClient from './IncidentsClient';

export const dynamic = 'force-dynamic';

async function fetchIncidents() {
  const incidents = await prisma.incident.findMany({
    include: {
      repository: { select: { name: true } },
      updates: { orderBy: { createdAt: 'asc' } },
      _count: { select: { updates: true } },
    },
    orderBy: { openedAt: 'desc' },
  });
  return incidents;
}

export default async function IncidentsPage() {
  const incidents = await fetchIncidents();
  return <IncidentsClient incidents={JSON.parse(JSON.stringify(incidents))} />;
}
