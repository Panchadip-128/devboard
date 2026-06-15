import { getDoraMetrics } from '@/lib/metrics/dora';
import { getPrBottlenecks } from '@/lib/metrics/pr';
import { getTeamHealthScore } from '@/lib/metrics/health';
import { getSprintIntelligence } from '@/lib/metrics/sprint';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

async function fetchDashboardData() {
  const mockRepoId = 'demo-repo-id';
  const mockSprintId = 'demo-sprint-id';
  
  try {
    const dora = await getDoraMetrics(mockRepoId, 30);
    const bottlenecks = await getPrBottlenecks(mockRepoId);
    const health = await getTeamHealthScore(mockRepoId);
    const sprint = await getSprintIntelligence(mockSprintId);
    return { dora, bottlenecks, health, sprint };
  } catch (e) {
    // Fallback Mock Data for 2026 UI presentation
    return {
      dora: { deploymentFrequency: 4.2, leadTimeHours: 12.5, mttrHours: 2.1, totalDeployments: 126, totalIncidents: 4 },
      health: { score: 92, grade: 'A+', breakdown: { dfScore: 25, ltScore: 20, mttrScore: 22, bugScore: 25 } },
      sprint: { velocity: 14, completionRate: 82, scopeCreep: 3, blockedCount: 2, blockedIssues: [] },
      bottlenecks: [
        { number: 1042, title: "Refactor job queue", authorId: "alice", waitTimeHours: 48 },
        { number: 1045, title: "Update Tremor charts", authorId: "bob", waitTimeHours: 24 }
      ]
    }
  }
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  return <DashboardClient {...data} />;
}
