"use client";

import { useState } from 'react';

export default function PlatformDiagnosticsPage() {
  
  // DevQL Compiler State
  const [devqlQuery, setDevqlQuery] = useState('SELECT id WHERE riskScore > 50');
  const [devqlResult, setDevqlResult] = useState<any>(null);
  const [compiling, setCompiling] = useState(false);

  // Columnar Engine State
  const [dbResult, setDbResult] = useState<any>(null);
  const [querying, setQuerying] = useState(false);

  // Stateful Actor System State
  const [actorResult, setActorResult] = useState<any>(null);
  const [acting, setActing] = useState(false);

  const testDevQL = async () => {
    setCompiling(true);
    try {
      const res = await fetch('/api/devql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: devqlQuery })
      });
      const data = await res.json();
      setDevqlResult(data);
    } catch (e) {
      setDevqlResult({ error: 'Compilation failed' });
    }
    setCompiling(false);
  };

  const testColumnarDB = async () => {
    setQuerying(true);
    try {
      for (let i = 0; i < 100; i++) {
        await fetch('/api/system/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'INSERT', payload: { riskScore: Math.random() * 100, impact: 5, devId: 1 } })
        });
      }
      const res = await fetch('/api/system/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'AGGREGATE' })
      });
      const data = await res.json();
      setDbResult(data);
    } catch (e) {
      setDbResult({ error: 'DB failed' });
    }
    setQuerying(false);
  };

  const testActorSystem = async () => {
    setActing(true);
    try {
      const devId = 'alpha_42';
      
      await Promise.all([
        fetch('/api/system/actor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SEND_MESSAGE', payload: { devId, messageType: 'PR_OPENED' } })
        }),
        fetch('/api/system/actor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SEND_MESSAGE', payload: { devId, messageType: 'PR_OPENED' } })
        }),
        fetch('/api/system/actor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SEND_MESSAGE', payload: { devId, messageType: 'INCIDENT_ASSIGNED' } })
        })
      ]);

      await new Promise(r => setTimeout(r, 100));

      const res = await fetch('/api/system/actor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GET_STATE', payload: { devId } })
      });
      const data = await res.json();
      setActorResult(data);
    } catch (e) {
      setActorResult({ error: 'Actor system failed' });
    }
    setActing(false);
  };

  return (
    <div className="flex h-full flex-col p-8 max-w-6xl mx-auto overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Diagnostics</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Live verification console for DevBoard's proprietary distributed systems architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Stateful Actor System */}
        <div className="bg-slate-900/60 border border-orange-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Stateful Developer Actors (Akka Model)</h2>
            <button 
              onClick={testActorSystem} 
              disabled={acting}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {acting ? 'Sending Messages...' : 'Blast Mailbox Queue'}
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Simulates massive concurrent webhooks hitting a single Developer's state. Bypasses Postgres entirely. Messages drop into an Actor mailbox and process strictly sequentially in RAM without Mutex locks.
          </p>
          {actorResult && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Final Actor State (RAM Snapshot)</label>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-orange-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(actorResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Columnar DB */}
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Hyper-Columnar Mmap Store</h2>
            <button 
              onClick={testColumnarDB} 
              disabled={querying}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {querying ? 'Querying...' : 'Mmap Aggregate Query'}
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Bypasses Postgres and interacts directly with raw OS file descriptors via Node.js fs.openSync. Memory-mapped float arrays allow instant aggregation.
          </p>
          {dbResult && (
            <div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-cyan-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(dbResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* DevQL Compiler */}
        <div className="bg-slate-900/60 border border-fuchsia-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">DevQL Domain-Specific JIT Compiler</h2>
            <button 
              onClick={testDevQL} 
              disabled={compiling}
              className="px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {compiling ? 'Compiling...' : 'Run JIT Compiler'}
            </button>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            A custom Domain-Specific Language (DSL) written from scratch. Tokenizes, parses into an Abstract Syntax Tree (AST), and JIT compiles into native V8 JavaScript for instant execution.
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Input Query String</label>
              <input 
                type="text" 
                value={devqlQuery}
                onChange={e => setDevqlQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </div>
          {devqlResult && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Compiler Output (AST & JIT Execution)</label>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(devqlResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
