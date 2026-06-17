"use client";

import { Card, Text, Metric, Grid, Title, Flex, BarChart, BadgeDelta, ProgressBar } from '@tremor/react';
import { useEffect, useState } from 'react';

export default function DashboardClient({ dora, bottlenecks, health, sprint }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Fetch anomaly alerts
  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((data) => setAlerts(data.alerts || []))
      .catch(() => {});
  }, []);

  // SSE connection for live updates
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');
    eventSource.onopen = () => setSseStatus('connected');
    eventSource.onerror = () => setSseStatus('error');
    return () => eventSource.close();
  }, []);

  const chartData = bottlenecks.slice(0, 5).map((b: any) => ({
    name: `PR #${b.number}`,
    "Wait Time (Hours)": Math.round(b.waitTimeHours)
  }));

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Anomaly Alert Banner */}
        {criticalAlerts.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-400">Anomaly Detected</p>
              <p className="text-xs text-red-400/70 mt-0.5">
                {criticalAlerts[0].metric}: {criticalAlerts[0].type} detected on {criticalAlerts[0].date} (z-score: {criticalAlerts[0].zScore})
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Engineering Intelligence</h1>
            <p className="text-slate-400">Real-time telemetry and team health overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border ${
              sseStatus === 'connected'
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  sseStatus === 'connected' ? 'bg-indigo-400' : 'bg-yellow-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  sseStatus === 'connected' ? 'bg-indigo-500' : 'bg-yellow-500'
                }`}></span>
              </span>
              {sseStatus === 'connected' ? 'SSE Live' : 'Connecting...'}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {health.grade}
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health: {health.score}/100</span>
            </div>
          </div>
        </div>

        {/* DORA Metrics Grid */}
        <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-emerald-500/5">
            <Flex alignItems="start">
              <div className="truncate">
                <Text className="text-slate-400 font-medium">Deploy Frequency</Text>
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
                    <span className="text-slate-500 text-sm mt-1">#{pr.number} by @{pr.authorId}</span>
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
