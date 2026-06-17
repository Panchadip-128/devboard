import { getContributorRankings } from '@/lib/metrics/contributors';
import TeamClient from './TeamClient';

export const dynamic = 'force-dynamic';

async function fetchTeamData() {
  try {
    const rankings = await getContributorRankings('demo-repo-id', 30);
    return rankings;
  } catch {
    // Fallback mock data
    return [
      { authorId: 'alice', commits: 142, prsOpened: 18, prsMerged: 15, avgPrMergeTimeHours: 8.2, reviewResponsivenessScore: 88, loadPercentage: 22.1 },
      { authorId: 'bob', commits: 118, prsOpened: 14, prsMerged: 12, avgPrMergeTimeHours: 14.5, reviewResponsivenessScore: 72, loadPercentage: 18.4 },
      { authorId: 'charlie', commits: 95, prsOpened: 11, prsMerged: 9, avgPrMergeTimeHours: 22.0, reviewResponsivenessScore: 55, loadPercentage: 14.8 },
      { authorId: 'diana', commits: 87, prsOpened: 9, prsMerged: 8, avgPrMergeTimeHours: 6.1, reviewResponsivenessScore: 94, loadPercentage: 13.6 },
      { authorId: 'eve', commits: 72, prsOpened: 8, prsMerged: 7, avgPrMergeTimeHours: 18.3, reviewResponsivenessScore: 62, loadPercentage: 11.2 },
      { authorId: 'frank', commits: 65, prsOpened: 7, prsMerged: 5, avgPrMergeTimeHours: 28.7, reviewResponsivenessScore: 41, loadPercentage: 10.1 },
      { authorId: 'grace', commits: 42, prsOpened: 5, prsMerged: 4, avgPrMergeTimeHours: 12.0, reviewResponsivenessScore: 78, loadPercentage: 6.5 },
      { authorId: 'heidi', commits: 21, prsOpened: 3, prsMerged: 2, avgPrMergeTimeHours: 36.4, reviewResponsivenessScore: 35, loadPercentage: 3.3 },
    ];
  }
}

export default async function TeamPage() {
  const contributors = await fetchTeamData();
  return <TeamClient contributors={contributors} />;
}
