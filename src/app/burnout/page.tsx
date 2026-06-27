'use client';

import { useEffect, useState } from 'react';
import { Card, DonutChart, Title, Text, Badge, Metric, Flex, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { ShieldAlert, Activity, BrainCircuit, Zap } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function BurnoutRadar() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchRadar = () => {
    fetch('/api/burnout')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRadar();
    // Poll to show live actor updates
    const interval = setInterval(fetchRadar, 3000);
    return () => clearInterval(interval);
  }, []);

  const blastActor = async (devId: string) => {
    setActing(true);
    await fetch('/api/system/actor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'SEND_MESSAGE', payload: { devId, messageType: 'INCIDENT_ASSIGNED' } })
    });
    fetchRadar();
    setActing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Engineering Burnout Radar</h1>
            <p className="text-slate-400">Powered by Stateful Developer Actors (Erlang/Akka Model) & AI Telemetry.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <Activity className="animate-spin mr-2" /> Analyzing RAM Actor states...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Summary Card */}
            <Card className="lg:col-span-3 bg-indigo-900/10 border-indigo-500/20 ring-0">
              <Flex alignItems="start" className="gap-4">
                <BrainCircuit className="text-indigo-400 flex-shrink-0" size={24} />
                <div>
                  <Title className="text-indigo-100">Gemini Team Health Summary</Title>
                  <Text className="text-indigo-200/80 mt-2 text-base leading-relaxed">
                    {data?.summary}
                  </Text>
                </div>
              </Flex>
            </Card>

            {/* Donut Chart */}
            <Card className="bg-white/[0.02] border-white/5 ring-0">
              <Title className="text-slate-200">Risk Distribution</Title>
              <Text className="text-slate-400">Live Memory State</Text>
              <div className="mt-8 flex justify-center">
                <DonutChart
                  className="h-48"
                  data={data?.distribution || []}
                  category="value"
                  index="name"
                  colors={['emerald', 'amber', 'rose']}
                  showAnimation={true}
                  variant="pie"
                />
              </div>
            </Card>

            {/* Leaderboard Table with Actor Interaction */}
            <Card className="lg:col-span-2 bg-slate-900/40 border-orange-500/20 ring-0 overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.05)]">
              <div className="flex justify-between items-center">
                <div>
                  <Title className="text-slate-200">Live Actor Registry</Title>
                  <Text className="text-orange-400/80 text-xs">Each row is an isolated Stateful Actor in memory (No Database Locks)</Text>
                </div>
              </div>
              <div className="mt-4 overflow-auto max-h-[300px]">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-slate-400">Actor ID</TableHeaderCell>
                      <TableHeaderCell className="text-slate-400">Risk Level</TableHeaderCell>
                      <TableHeaderCell className="text-slate-400">Burnout Score</TableHeaderCell>
                      <TableHeaderCell className="text-slate-400">Active PRs</TableHeaderCell>
                      <TableHeaderCell className="text-slate-400">Actor Mailbox</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.developers?.map((dev: any) => (
                      <TableRow key={dev.authorId}>
                        <TableCell className="text-slate-200 font-medium">dev_{dev.authorId}</TableCell>
                        <TableCell>
                          <Badge color={dev.risk === 'CRITICAL' ? 'rose' : dev.risk === 'HIGH' ? 'orange' : dev.risk === 'MEDIUM' ? 'amber' : 'emerald'}>
                            {dev.risk}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 font-mono text-lg">{dev.score}</TableCell>
                        <TableCell className="text-slate-300 font-mono">{dev.actorState?.activePRs || 0}</TableCell>
                        <TableCell>
                          <button 
                            onClick={() => blastActor(dev.authorId)}
                            disabled={acting}
                            className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 px-2 py-1 rounded border border-orange-400/20 transition-colors"
                          >
                            <Zap size={12} /> Send INCIDENT_ASSIGNED
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
        
        {/* Tailwind v4 Safelist Hack for Tremor DonutChart */}
        <div className="hidden bg-emerald-500 fill-emerald-500 text-emerald-500 ring-emerald-500 stroke-emerald-500" />
        <div className="hidden bg-amber-500 fill-amber-500 text-amber-500 ring-amber-500 stroke-amber-500" />
        <div className="hidden bg-rose-500 fill-rose-500 text-rose-500 ring-rose-500 stroke-rose-500" />
      </div>
    </DashboardLayout>
  );
}

