"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/incidents', label: 'Incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  { href: '/team', label: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
  { href: '/platform-diagnostics', label: 'Platform Diagnostics', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { href: '/burnout', label: 'Burnout Radar', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { href: '/deployments', label: 'Deployments', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [raftState, setRaftState] = useState<{state: string, term: number}>({ state: 'CONNECTING...', term: 0 });

  useEffect(() => {
    const fetchRaft = async () => {
      try {
        const res = await fetch('/api/system/raft');
        if (res.ok) {
          const data = await res.json();
          setRaftState({ state: data.state, term: data.currentTerm });
        }
      } catch (e) {}
    };
    fetchRaft();
    const interval = setInterval(fetchRaft, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/60 px-6">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">DevBoard</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 shadow-[inset_0_1px_0_0_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/60 p-4">
        <div className="flex flex-col gap-1 rounded-lg bg-slate-900/50 px-3 py-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Cluster Consensus Node</div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${raftState.state === 'LEADER' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${raftState.state === 'LEADER' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-medium text-slate-300">{raftState.state} (Term {raftState.term})</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
