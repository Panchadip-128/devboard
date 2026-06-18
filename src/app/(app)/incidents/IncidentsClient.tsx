"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Title, Text, Badge, Button } from '@tremor/react';
import { Sparkles } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  investigating: 'bg-red-500',
  identified: 'bg-orange-500',
  monitoring: 'bg-yellow-500',
  resolved: 'bg-emerald-500',
};

export default function IncidentsClient({ incidents }: { incidents: any[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0]?.id || null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateRootCause = async () => {
    if (!selectedId) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/incidents/${selectedId}/analyze`, { method: 'POST' });
      if (res.ok) {
        router.refresh(); // Refresh server data to get the new root cause
      }
    } catch (error) {
      console.error('Failed to generate root cause:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filtered = incidents.filter((inc) => {
    if (filter === 'open') return inc.state === 'open';
    if (filter === 'resolved') return inc.state === 'resolved';
    return true;
  });

  const selected = incidents.find((i) => i.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Incident Management</h1>
          <p className="text-slate-400">Timeline view of production incidents across all repositories</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-2 text-xs opacity-60">
                ({incidents.filter((i) => f === 'all' ? true : i.state === f).length})
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Incident List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedId(inc.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedId === inc.id
                    ? 'bg-slate-800/80 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{inc.repository?.name || 'unknown'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 ${SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.medium}`}>
                    {inc.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span>{inc.state === 'resolved' ? 'Resolved' : 'Open'}</span>
                  <span>{new Date(inc.openedAt).toLocaleDateString()}</span>
                  <span>{inc.updates?.length || inc._count?.updates || 0} updates</span>
                </div>
              </button>
            ))}
          </div>

          {/* Incident Detail + Timeline */}
          <div className="lg:col-span-3">
            {selected ? (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Title className="text-white text-xl">{selected.title}</Title>
                    <Text className="text-slate-400 mt-1">{selected.repository?.name}</Text>
                  </div>
                  <Badge color={selected.state === 'resolved' ? 'emerald' : 'red'}>
                    {selected.state}
                  </Badge>
                </div>

                {selected.rootCause ? (
                  <div className="mb-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <p className="text-xs uppercase tracking-wider font-semibold text-indigo-400">AI Root Cause Analysis</p>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{selected.rootCause}</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <Button 
                      onClick={generateRootCause} 
                      loading={isAnalyzing}
                      icon={Sparkles}
                      className="bg-indigo-600 hover:bg-indigo-500 border-none text-white"
                    >
                      Generate AI Root Cause Analysis
                    </Button>
                  </div>
                )}

                {/* Timeline */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-300 mb-4">Timeline</p>
                  <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                    {(selected.updates || []).map((update: any) => (
                      <div key={update.id} className="relative">
                        <div className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full ${STATUS_COLORS[update.status] || 'bg-slate-500'} ring-4 ring-slate-950`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 uppercase">{update.status}</span>
                            <span className="text-xs text-slate-600">{new Date(update.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{update.message}</p>
                          <p className="text-xs text-slate-600 mt-1">by @{update.authorId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                {selected.actionItems?.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-300 mb-3">Action Items</p>
                    <ul className="space-y-2">
                      {selected.actionItems.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Postmortem */}
                {selected.postmortem && (
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/40">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Postmortem</p>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selected.postmortem}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="bg-slate-900/50 border-slate-800/50 p-12 text-center">
                <Text className="text-slate-500">Select an incident to view its timeline</Text>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
