"use client";

import { Card, Text, Metric, Grid, Title, Flex, BarChart, BadgeDelta, ProgressBar } from '@tremor/react';

export default function DashboardClient({ dora, bottlenecks, health, sprint }: any) {
  const chartData = bottlenecks.slice(0, 5).map((b: any) => ({
    name: `PR #${b.number}`,
    "Wait Time (Hours)": Math.round(b.waitTimeHours)
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              Engineering Intelligence
            </h1>
            <p className="text-slate-400">Real-time telemetry and team health overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              SSE Live Stream Active
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {health.grade}
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health Score: {health.score}/100</span>
            </div>
          </div>
        </div>

        {/* DORA Metrics Grid */}
        <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-emerald-500/5">
            <Flex alignItems="start">
              <div className="truncate">
                <Text className="text-slate-400 font-medium">Deployment Frequency</Text>
                <Metric className="text-white mt-2 truncate">{dora.deploymentFrequency.toFixed(1)} / day</Metric>
              </div>
              <BadgeDelta deltaType="moderateIncrease">12%</BadgeDelta>
            </Flex>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-blue-500/5">
            <Flex alignItems="start">
              <div className="truncate">
                <Text className="text-slate-400 font-medium">Lead Time</Text>
                <Metric className="text-white mt-2 truncate">{dora.leadTimeHours.toFixed(1)} hrs</Metric>
              </div>
              <BadgeDelta deltaType="moderateDecrease">4h</BadgeDelta>
            </Flex>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-amber-500/5">
            <Flex alignItems="start">
              <div className="truncate">
                <Text className="text-slate-400 font-medium">MTTR</Text>
                <Metric className="text-white mt-2 truncate">{dora.mttrHours.toFixed(1)} hrs</Metric>
              </div>
              <BadgeDelta deltaType="unchanged">Stable</BadgeDelta>
            </Flex>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-purple-500/5">
            <Flex alignItems="start">
              <div className="truncate">
                <Text className="text-slate-400 font-medium">Sprint Velocity</Text>
                <Metric className="text-white mt-2 truncate">{sprint?.velocity || 0} pts</Metric>
              </div>
            </Flex>
            <ProgressBar value={sprint?.completionRate || 0} color="purple" className="mt-4" />
          </Card>
        </Grid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <Title className="text-white">PR Review Bottlenecks</Title>
            <Text className="text-slate-400 mb-6">Longest waiting pull requests across repositories</Text>
            <BarChart
              className="h-72"
              data={chartData}
              index="name"
              categories={["Wait Time (Hours)"]}
              colors={["rose"]}
              yAxisWidth={48}
              showAnimation={true}
            />
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <Title className="text-white">Active PR Queue</Title>
            <div className="mt-6 space-y-4">
              {bottlenecks.slice(0, 5).map((pr: any) => (
                <div key={pr.number} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/60 shadow-inner group hover:border-slate-700 transition-colors">
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-slate-200 font-medium truncate group-hover:text-indigo-400 transition-colors">{pr.title}</span>
                    <span className="text-slate-500 text-sm mt-1">#{pr.number} opened by @{pr.authorId}</span>
                  </div>
                  <div className="flex items-center flex-shrink-0 text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-lg border border-rose-400/20">
                    <span className="font-bold">{Math.round(pr.waitTimeHours)}h</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
