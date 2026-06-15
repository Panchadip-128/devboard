import prisma from '../prisma';

export async function getPrBottlenecks(repositoryId: string) {
  const prs = await prisma.pullRequest.findMany({
    where: { repositoryId, reviewRequestedAt: { not: null } },
    select: { number: true, title: true, authorId: true, reviewRequestedAt: true, reviewedAt: true, mergedAt: true },
    orderBy: { reviewRequestedAt: 'desc' },
    take: 50
  });

  return prs.map(pr => {
    let waitTimeMs = 0;
    if (pr.reviewedAt && pr.reviewRequestedAt) {
      waitTimeMs = pr.reviewedAt.getTime() - pr.reviewRequestedAt.getTime();
    } else if (pr.reviewRequestedAt) {
      waitTimeMs = Date.now() - pr.reviewRequestedAt.getTime();
    }
    return { ...pr, waitTimeHours: waitTimeMs / (1000 * 60 * 60) };
  }).sort((a,b) => b.waitTimeHours - a.waitTimeHours);
}
