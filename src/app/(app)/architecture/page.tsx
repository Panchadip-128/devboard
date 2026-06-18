"use client";

import { useState } from 'react';

const MOCK_ADRS = [
  { id: 'adr-1', title: 'Adopt Redis for Aggregation Caching', status: 'ACCEPTED', date: 'Oct 12, 2026', author: 'Alice Chen' },
  { id: 'adr-2', title: 'Migrate to pg-boss for Webhook Queuing', status: 'ACCEPTED', date: 'Sep 28, 2026', author: 'Bob Smith' },
  { id: 'adr-3', title: 'Implement GraphQL API for Frontend', status: 'PROPOSED', date: 'Nov 02, 2026', author: 'Charlie Davis' },
  { id: 'adr-4', title: 'Use WebSockets over SSE', status: 'REJECTED', date: 'Aug 15, 2026', author: 'Alice Chen' },
];

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div className="flex h-full flex-col p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Architectural Decision Records</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            A formal log of all architectural decisions. Propose changes, gather engineering consensus, and record the rationale for future reference.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5">
          + New Proposal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800/60 pb-px">
        {['ALL', 'PROPOSED', 'ACCEPTED', 'REJECTED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={"px-4 py-2 text-sm font-medium border-b-2 transition-colors " + (activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ADR List */}
      <div className="grid gap-4">
        {MOCK_ADRS.filter(adr => activeTab === 'ALL' || adr.status === activeTab).map((adr) => (
          <div key={adr.id} className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={"text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full " + (adr.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : adr.status === 'PROPOSED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')}>
                    {adr.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{adr.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {adr.title}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">{adr.date}</div>
                <div className="text-xs text-slate-500 mt-1">by {adr.author}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
