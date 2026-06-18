import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDoraMetrics } from '@/lib/metrics/dora';
import { getTeamHealthScore } from '@/lib/metrics/health';
import { predictBurnoutRisk } from '@/lib/metrics/burnout';
import redis from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const includeBreakdown = searchParams.get('includeBreakdown') === 'true';

    // 1. Check Redis Cache
    const cacheKey = `team:${teamId}:metrics:${days}:${includeBreakdown}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`[Redis] Cache HIT for ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(`[Redis] Cache MISS for ${cacheKey}. Calculating metrics...`);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        repositories: true,
        members: { select: { userId: true, role: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Aggregate DORA metrics across all team repositories
    const repoMetrics = await Promise.all(
      team.repositories.map(async (repo) => {
        const dora = await getDoraMetrics(repo.id, days);
        const health = await getTeamHealthScore(repo.id);
        return { repositoryId: repo.id, repositoryName: repo.name, dora, health };
      })
    );

    // Aggregate burnout risks across all team members
    const burnoutRisks = await Promise.all(
      team.members.map(async (member) => {
        const risk = await predictBurnoutRisk(member.userId, days);
        return risk;
      })
    );

    const response: Record<string, any> = {
      teamId: team.id,
      teamName: team.name,
      period: { days },
      repositories: repoMetrics,
      burnoutRisks: burnoutRisks.filter((r) => r.risk !== 'UNKNOWN'),
      summary: {
        totalRepositories: team.repositories.length,
        totalMembers: team.members.length,
        averageHealthScore:
          repoMetrics.length > 0
            ? Math.round(repoMetrics.reduce((sum, r) => sum + r.health.score, 0) / repoMetrics.length)
            : 0,
        criticalBurnouts: burnoutRisks.filter((r) => r.risk === 'CRITICAL').length,
      },
    };

    if (includeBreakdown) {
      response.healthBreakdowns = repoMetrics.map((r) => ({
        repository: r.repositoryName,
        breakdown: r.health.breakdown,
      }));
    }

    // 2. Set Redis Cache (Expire after 5 minutes to keep dashboard fresh but reduce load)
    await redis.setex(cacheKey, 300, JSON.stringify(response));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch team metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
