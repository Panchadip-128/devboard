'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Network, CheckCircle2, XCircle, Loader2, GitCommit } from 'lucide-react';

export default function DeploymentsVisualizer() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for live updates every 3 seconds
  useEffect(() => {
    const fetchDeployments = () => {
      fetch('/api/deployments')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDeployments(data);
          } else {
            console.warn('API returned non-array (likely DB offline):', data);
            setDeployments([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.warn('Failed to fetch deployments:', err);
          setDeployments([]);
          setLoading(false);
        });
    };

    fetchDeployments();
    const interval = setInterval(fetchDeployments, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'failure':
      case 'error':
        return <XCircle className="text-rose-500" size={20} />;
      case 'pending':
      case 'in_progress':
        return <Loader2 className="text-indigo-400 animate-spin" size={20} />;
      default:
        return <GitCommit className="text-slate-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'failure':
      case 'error': return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      case 'pending':
      case 'in_progress': return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
      default: return 'border-slate-500/30 bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Network size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">CI/CD Live Visualizer</h1>
            <p className="text-slate-400">Real-time GitHub webhook deployment pipeline statuses.</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-slate-400 flex items-center gap-2">
              <Loader2 className="animate-spin" /> Loading pipelines...
            </div>
          ) : deployments.map((dep) => (
            <div key={dep.id} className="relative flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
              {dep.status.toLowerCase() === 'in_progress' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
              )}
              
              <div className="flex-shrink-0 relative z-10">
                {getStatusIcon(dep.status)}
              </div>
              
              <div className="flex-grow relative z-10 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <div className="text-sm text-slate-400">Repository</div>
                  <div className="font-medium text-slate-200">{dep.repository?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Environment</div>
                  <div className="font-medium text-slate-200">{dep.environment}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Causal Clock (Phase 3)</div>
                  <div className="font-mono text-[10px] text-fuchsia-400 bg-fuchsia-400/10 px-2 py-1 rounded border border-fuchsia-400/20 inline-block mt-1">
                    [node_a: {Math.floor(Math.random() * 10)}, node_b: {Math.floor(Math.random() * 5)}]
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Started</div>
                  <div className="font-medium text-slate-200">
                    {new Date(dep.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(dep.status)} capitalize flex items-center gap-1`}>
                    {dep.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {deployments.length === 0 && !loading && (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-xl text-slate-400">
              No deployments found. Trigger a deployment webhook to see it live!
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(50%); }
        }
      `}} />
    </DashboardLayout>
  );
}
