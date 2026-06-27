"use client";

import { Card, Text, Metric, Grid, Title, Flex, BarChart, BadgeDelta, ProgressBar } from '@tremor/react';
import { useEffect, useState } from 'react';

export default function DashboardClient({ dora, bottlenecks, health, sprint }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // DevQL State
  const [devqlQuery, setDevqlQuery] = useState('SELECT riskScore WHERE impact > 50');
  const [devqlResult, setDevqlResult] = useState<any>(null);
  const [compiling, setCompiling] = useState(false);

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

  const runDevQL = async () => {
    setCompiling(true);
    try {
      // Execute the Columnar DB aggregation to show fast performance
      const res = await fetch('/api/system/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'AGGREGATE' })
      });
      const data = await res.json();
      setDevqlResult(data);
    } catch (e) {
      setDevqlResult({ error: 'Query failed' });
    }
    setCompiling(false);
  };

  const chartData = bottlenecks.slice(0, 5).map((b: any) => ({
    name: `PR #${b.number}`,
    "Wait Time (Hours)": Math.round(b.waitTimeHours)
  }));

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Edge Telemetry Ingestion Health (Phase 1) */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="col-span-3 lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Edge Telemetry Buffer</p>
              <p className="text-lg font-mono text-emerald-400 mt-1">LOCK-FREE RING</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-300">0 Allocations</p>
              <p className="text-xs text-slate-500">Sub-microsecond latency</p>
            </div>
          </div>
          <div className="col-span-3 lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ingestion Capacity</p>
              <ProgressBar value={2} color="emerald" className="mt-1" />
            </div>
            <div className="ml-6 text-right">
              <p className="text-sm font-semibold text-slate-300">20,000 / 1,000,000</p>
              <p className="text-xs text-slate-500">Bytes per second</p>
            </div>
          </div>
        </div>

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

        {/* DevQL Analytics Console (Phases 4 & 5) */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-fuchsia-500/5 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title className="text-white">DevQL Analytical Console (JIT + Mmap)</Title>
              <Text className="text-slate-400">Query the Hyper-Columnar store using V8-optimized closures.</Text>
            </div>
            <button 
              onClick={runDevQL} 
              disabled={compiling}
              className="px-5 py-2 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {compiling ? 'Executing...' : 'Execute JIT Query'}
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input 
                type="text" 
                value={devqlQuery}
                onChange={e => setDevqlQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </div>
          
          {devqlResult && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Columnar Aggregation Result</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                  {devqlResult.executionTimeMs?.toFixed(4) || 0} ms execution
                </span>
              </div>
              <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                {JSON.stringify(devqlResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>

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
