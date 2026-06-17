import { NextRequest, NextResponse } from 'next/server';
import { getDoraMetrics } from '@/lib/metrics/dora';
import { getPrBottlenecks } from '@/lib/metrics/pr';
import { getTeamHealthScore } from '@/lib/metrics/health';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { repoId } = params;
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);

    const repository = await prisma.repository.findUnique({ where: { id: repoId } });
    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const [dora, bottlenecks, health] = await Promise.all([
      getDoraMetrics(repoId, days),
      getPrBottlenecks(repoId),
      getTeamHealthScore(repoId),
    ]);

    return NextResponse.json({
      repository: { id: repository.id, name: repository.name, fullName: repository.fullName },
      period: { days },
      dora,
      health,
      bottlenecks: bottlenecks.slice(0, 10),
    });
  } catch (error) {
    console.error('Failed to fetch repository analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
