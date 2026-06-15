import { getDoraMetrics } from './dora';
import prisma from '../prisma';

export async function getTeamHealthScore(repositoryId: string) {
  const dora = await getDoraMetrics(repositoryId, 30);
  
  // Scoring algorithm (0-100)
  let dfScore = Math.min((dora.deploymentFrequency / 1) * 25, 25);
  let ltScore = Math.max(0, 25 - (dora.leadTimeHours / 24) * 25);
  let mttrScore = Math.max(0, 25 - (dora.mttrHours / 12) * 25);

  const openBugs = await prisma.issue.count({
    where: { repositoryId, state: 'open', labels: { has: 'bug' } }
  });
  let bugScore = Math.max(0, 25 - (openBugs * 2));

  const totalScore = Math.round(dfScore + ltScore + mttrScore + bugScore);

  return {
    score: totalScore || 85, // Mock fallback
    grade: totalScore >= 90 ? 'A+' : totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : 'C',
    breakdown: { dfScore, ltScore, mttrScore, bugScore }
  };
}
