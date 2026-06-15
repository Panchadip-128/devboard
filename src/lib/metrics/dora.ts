import prisma from '../prisma';
import { subDays } from 'date-fns';

export async function getDoraMetrics(repositoryId: string, days: number = 30) {
  const since = subDays(new Date(), days);

  const deployments = await prisma.deployment.count({
    where: { repositoryId, status: 'success', createdAt: { gte: since } }
  });
  const deploymentFrequency = deployments / days;

  const prs = await prisma.pullRequest.findMany({
    where: { repositoryId, state: 'closed', mergedAt: { not: null, gte: since } },
    select: { createdAt: true, mergedAt: true }
  });

  const leadTimes = prs.map(pr => pr.mergedAt!.getTime() - pr.createdAt.getTime());
  const avgLeadTimeMs = leadTimes.length > 0 ? leadTimes.reduce((a,b) => a+b, 0) / leadTimes.length : 0;
  const leadTimeHours = avgLeadTimeMs / (1000 * 60 * 60);

  const incidents = await prisma.incident.findMany({
    where: { repositoryId, resolvedAt: { not: null }, openedAt: { gte: since } },
    select: { openedAt: true, resolvedAt: true }
  });

  const recoveryTimes = incidents.map(inc => inc.resolvedAt!.getTime() - inc.openedAt.getTime());
  const avgRecoveryTimeMs = recoveryTimes.length > 0 ? recoveryTimes.reduce((a,b) => a+b, 0) / recoveryTimes.length : 0;
  const mttrHours = avgRecoveryTimeMs / (1000 * 60 * 60);

  return {
    deploymentFrequency,
    leadTimeHours,
    mttrHours,
    totalDeployments: deployments,
    totalIncidents: incidents.length
  };
}
