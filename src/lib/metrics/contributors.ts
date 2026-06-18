import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

/**
 * Contributor Analytics Engine
 *
 * Aggregates per-developer contribution patterns across commits,
 * PR authorship, and review responsiveness to produce ranked
 * leaderboards and load distribution breakdowns.
 */

export type ContributorStats = {
  authorId: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  avgPrMergeTimeHours: number;
  reviewResponsivenessScore: number; // 0-100
  loadPercentage: number;
};

export async function getContributorRankings(
  repositoryId: string,
  days: number = 30
): Promise<ContributorStats[]> {
  const cacheKey = `repo:${repositoryId}:contributors:${days}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    console.log(`[Redis] Cache HIT for ${cacheKey}`);
    return JSON.parse(cachedData);
  }

  console.log(`[Redis] Cache MISS for ${cacheKey}. Calculating...`);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const [commits, pullRequests] = await Promise.all([
    prisma.commit.findMany({
      where: { repositoryId, createdAt: { gte: since } },
      select: { authorId: true },
    }),
    prisma.pullRequest.findMany({
      where: { repositoryId, createdAt: { gte: since } },
      select: {
        authorId: true,
        state: true,
        mergedAt: true,
        createdAt: true,
        reviewRequestedAt: true,
        reviewedAt: true,
      },
    }),
  ]);

  // Group by author
  const authorMap = new Map<string, {
    commits: number;
    prsOpened: number;
    prsMerged: number;
    mergeTimesMs: number[];
    reviewTimesMs: number[];
  }>();

  for (const commit of commits) {
    const entry = authorMap.get(commit.authorId) || {
      commits: 0, prsOpened: 0, prsMerged: 0, mergeTimesMs: [], reviewTimesMs: []
    };
    entry.commits++;
    authorMap.set(commit.authorId, entry);
  }

  for (const pr of pullRequests) {
    const entry = authorMap.get(pr.authorId) || {
      commits: 0, prsOpened: 0, prsMerged: 0, mergeTimesMs: [], reviewTimesMs: []
    };
    entry.prsOpened++;
    if (pr.mergedAt) {
      entry.prsMerged++;
      entry.mergeTimesMs.push(pr.mergedAt.getTime() - pr.createdAt.getTime());
    }
    if (pr.reviewRequestedAt && pr.reviewedAt) {
      entry.reviewTimesMs.push(pr.reviewedAt.getTime() - pr.reviewRequestedAt.getTime());
    }
    authorMap.set(pr.authorId, entry);
  }

  const totalCommits = commits.length || 1;
  const results: ContributorStats[] = [];

  for (const [authorId, data] of authorMap) {
    const avgMergeMs = data.mergeTimesMs.length > 0
      ? data.mergeTimesMs.reduce((a, b) => a + b, 0) / data.mergeTimesMs.length
      : 0;

    const avgReviewMs = data.reviewTimesMs.length > 0
      ? data.reviewTimesMs.reduce((a, b) => a + b, 0) / data.reviewTimesMs.length
      : 0;

    // Review responsiveness: faster review = higher score (max 100)
    // Baseline: 24 hours = 50 score. Under 4h = 100. Over 72h = 0.
    const reviewHours = avgReviewMs / (1000 * 60 * 60);
    const reviewScore = Math.max(0, Math.min(100, 100 - (reviewHours / 72) * 100));

    results.push({
      authorId,
      commits: data.commits,
      prsOpened: data.prsOpened,
      prsMerged: data.prsMerged,
      avgPrMergeTimeHours: parseFloat((avgMergeMs / (1000 * 60 * 60)).toFixed(1)),
      reviewResponsivenessScore: Math.round(reviewScore),
      loadPercentage: parseFloat(((data.commits / totalCommits) * 100).toFixed(1)),
    });
  }

  const sortedResults = results.sort((a, b) => b.commits - a.commits);
  
  // Cache the result for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(sortedResults));
  
  return sortedResults;
}
