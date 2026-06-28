import Link from 'next/link';
import { ArrowRight, Activity, ShieldAlert, Users, Network, Braces } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      {/* Header/Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-500/20 text-indigo-400">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">DevBoard</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/incidents" className="hover:text-white transition-colors">Incidents</Link>
          <Link href="/burnout" className="hover:text-white transition-colors">Burnout Radar</Link>
          <Link href="/deployments" className="hover:text-white transition-colors">CI/CD</Link>
        </nav>
        <div>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Open App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="flex w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Real-time Engineering Telemetry
        </div>
        
        <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6">
          Engineering Intelligence, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Delivered in Real-Time.
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
          Transform raw development events into actionable insights. Monitor DORA metrics, track incident resolution, and visualize your team's workflow bottlenecks instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all backdrop-blur-sm"
          >
            Explore Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mt-32 text-left">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-4">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">DORA Metrics</h3>
            <p className="text-sm text-slate-400">
              Track Deployment Frequency, Lead Time, MTTR, and Change Failure Rate in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Anomaly Detection</h3>
            <p className="text-sm text-slate-400">
              Statistical Z-score algorithms automatically flag deviations in your engineering velocity.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Analytics</h3>
            <p className="text-sm text-slate-400">
              Identify bottlenecks, balance workloads, and track contributor responsiveness easily.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 mb-4">
              <Network size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Architecture Map</h3>
            <p className="text-sm text-slate-400">
              Visualize pull request dependencies and critical path blockers dynamically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
