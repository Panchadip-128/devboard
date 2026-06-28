'use client';

import { useState } from 'react';
import { Terminal, Play, Zap, Braces, Database, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function DevQLStudio() {
  const [query, setQuery] = useState('SELECT message, authorId WHERE authorId = "alice"');
  const [results, setResults] = useState<any[] | null>(null);
  const [ast, setAst] = useState<any | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeQuery = async () => {
    setIsExecuting(true);
    setError(null);
    setResults(null);
    setAst(null);
    setExecutionTime(null);

    try {
      const res = await fetch('/api/devql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }

      setResults(data.results);
      setAst(data.ast);
      setExecutionTime(data.executionTimeMs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Terminal size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">DevQL Studio</h1>
            <p className="text-slate-400">JIT-compiled query engine for ultra-fast telemetry analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                  <Database size={16} /> query.dql
                </div>
                <button
                  onClick={executeQuery}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  {isExecuting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={16} fill="currentColor" />}
                  Run Query
                </button>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-48 bg-slate-900 text-indigo-300 font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Results Table */}
            {results && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">Execution Results</h3>
                  <Badge count={results.length} />
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/30 sticky top-0">
                      <tr>
                        {results.length > 0 ? Object.keys(results[0]).map((key) => (
                          <th key={key} className="px-6 py-3 font-semibold">{key}</th>
                        )) : (
                          <th className="px-6 py-3">No columns</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {results.length > 0 ? results.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-6 py-4 font-mono text-slate-300">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-6 py-8 text-center text-slate-500">Zero rows returned.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - AST & Stats */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Zap size={20} className={isExecuting ? "animate-pulse" : ""} />
                <h3 className="font-semibold">V8 Compilation Engine</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Execution Time</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {executionTime !== null ? `${executionTime.toFixed(4)} ms` : '--'}
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                  DevQL compiles your declarative queries into raw V8 JavaScript using <code>new Function()</code>. This completely bypasses iterative AST interpretation, evaluating millions of objects at native memory speeds.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 flex flex-col h-[500px]">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                <Braces size={20} className="text-fuchsia-400" />
                <h3 className="font-semibold text-slate-200">Abstract Syntax Tree</h3>
              </div>
              <div className="flex-1 p-5 overflow-auto bg-slate-950/50">
                {ast ? (
                  <pre className="text-xs font-mono text-fuchsia-300/80 leading-relaxed">
                    {JSON.stringify(ast, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-500">
                    Run a query to inspect the generated AST.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-100 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]">
      {count} rows
    </span>
  );
}
