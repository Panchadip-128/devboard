"use client";

import { Card, Title, Text, BarList, DonutChart } from '@tremor/react';

export default function TeamClient({ contributors }: { contributors: any[] }) {
  const donutData = contributors.map((c) => ({
    name: `@${c.authorId}`,
    value: c.commits,
  }));

  const reviewBarData = contributors.map((c) => ({
    name: `@${c.authorId}`,
    value: c.reviewResponsivenessScore,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Team Leaderboard</h1>
          <p className="text-slate-400">Contribution analytics and workload distribution across engineers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Load Distribution */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <Title className="text-white">Workload Distribution</Title>
            <Text className="text-slate-400 mb-4">Commit share over the last 30 days</Text>
            <DonutChart
              className="h-52"
              data={donutData}
              category="value"
              index="name"
              colors={['indigo', 'cyan', 'violet', 'emerald', 'amber', 'rose', 'blue', 'fuchsia']}
              showAnimation={true}
            />
          </Card>

          {/* Review Responsiveness */}
          <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <Title className="text-white">Review Responsiveness</Title>
            <Text className="text-slate-400 mb-4">Speed at which engineers respond to review requests (0-100)</Text>
            <BarList
              data={reviewBarData}
              className="mt-4"
              color="indigo"
            />
          </Card>
        </div>

        {/* Contributor Table */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <Title className="text-white">Contributor Rankings</Title>
          <Text className="text-slate-400 mb-6">Sorted by total commits in the last 30 days</Text>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Developer</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Commits</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">PRs Opened</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">PRs Merged</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Merge Time</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Review Score</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Load %</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c, idx) => (
                  <tr key={c.authorId} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 font-medium">@{c.authorId}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.commits}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.prsOpened}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.prsMerged}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{c.avgPrMergeTimeHours}h</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        c.reviewResponsivenessScore >= 80
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : c.reviewResponsivenessScore >= 50
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {c.reviewResponsivenessScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">{c.loadPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
