import { prisma } from '../prisma';

/**
 * Predictive heuristics analyzing engineering metadata to flag burnout risks.
 * Detects prolonged late-night coding and excessive weekend deployments.
 */
export async function predictBurnoutRisk(authorId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const commits = await prisma.commit.findMany({
    where: { authorId, createdAt: { gte: since } }
  });

  if (commits.length === 0) return { risk: 'UNKNOWN', score: 0 };

  let weekendCommits = 0;
  let lateNightCommits = 0;

  for (const commit of commits) {
    const date = new Date(commit.createdAt);
    const day = date.getDay();
    const hour = date.getHours();

    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      weekendCommits++;
    }

    // Between 10 PM and 4 AM local server time
    if (hour >= 22 || hour <= 4) {
      lateNightCommits++;
    }
  }

  const weekendRatio = weekendCommits / commits.length;
  const lateNightRatio = lateNightCommits / commits.length;

  let score = 0;
  score += weekendRatio * 50;   // Max 50 points from excessive weekends
  score += lateNightRatio * 50; // Max 50 points from late nights

  let risk = 'LOW';
  if (score >= 60) risk = 'CRITICAL';
  else if (score >= 40) risk = 'HIGH';
  else if (score >= 20) risk = 'MEDIUM';

  return {
    authorId,
    risk,
    score: Math.round(score),
    metrics: {
      totalCommits: commits.length,
      weekendRatio: Math.round(weekendRatio * 100) + '%',
      lateNightRatio: Math.round(lateNightRatio * 100) + '%'
    }
  };
}
