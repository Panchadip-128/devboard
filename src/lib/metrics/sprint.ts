import prisma from '../prisma';

export async function getSprintIntelligence(sprintId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { issues: true }
  });

  if (!sprint) return null;

  const totalIssues = sprint.issues.length;
  const completedIssues = sprint.issues.filter(i => i.state === 'closed').length;
  const scopeCreepIssues = sprint.issues.filter(i => i.createdAt > sprint.startDate);
  const blockedIssues = sprint.issues.filter(i => i.labels.includes('blocked'));

  return {
    velocity: completedIssues,
    completionRate: totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0,
    scopeCreep: scopeCreepIssues.length,
    blockedCount: blockedIssues.length,
    blockedIssues
  };
}
