'use client';

import { useState } from 'react';
import { Network, Code2, Cpu, Braces, GitMerge } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AlgorithmShowcase() {
  // AST State
  const [query, setQuery] = useState('SELECT user, action WHERE action = "login"');
  const [astNodes, setAstNodes] = useState<{type: string, val: string, depth: number}[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Vector Clock State
  const [clockA, setClockA] = useState({ nodeA: 1, nodeB: 0 });
  const [clockB, setClockB] = useState({ nodeA: 0, nodeB: 2 });
  const [merged, setMerged] = useState<{nodeA: number, nodeB: number} | null>(null);

  const simulateParse = () => {
    setIsParsing(true);
    setAstNodes([]);
    
    const parts = query.split(' ');
    let nodes: typeof astNodes = [];
    
    // Simulate Recursive Descent Parsing visualization
    setTimeout(() => { nodes.push({ type: 'Root (SelectAST)', val: 'SELECT', depth: 0 }); setAstNodes([...nodes]); }, 200);
    setTimeout(() => { nodes.push({ type: 'FieldsArray (Leaf)', val: parts[1] || 'user', depth: 1 }); setAstNodes([...nodes]); }, 600);
    setTimeout(() => { nodes.push({ type: 'Condition (BinaryExpr)', val: 'WHERE', depth: 1 }); setAstNodes([...nodes]); }, 1000);
    setTimeout(() => { nodes.push({ type: 'LeftNode (Leaf)', val: parts[3] || 'action', depth: 2 }); setAstNodes([...nodes]); }, 1400);
    setTimeout(() => { nodes.push({ type: 'Operator (Leaf)', val: parts[4] || '=', depth: 2 }); setAstNodes([...nodes]); }, 1800);
    setTimeout(() => { nodes.push({ type: 'RightNode (Leaf)', val: parts[5] || '"login"', depth: 2 }); setAstNodes([...nodes]); setIsParsing(false); }, 2200);
  };

  const mergeClocks = () => {
    setMerged({
      nodeA: Math.max(clockA.nodeA, clockB.nodeA),
      nodeB: Math.max(clockA.nodeB, clockB.nodeB),
    });
  };

  const incrementA = () => setClockA({ ...clockA, nodeA: clockA.nodeA + 1 });
  const incrementB = () => setClockB({ ...clockB, nodeB: clockB.nodeB + 1 });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
              <Cpu size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Algorithm Showcase</h1>
              <p className="text-slate-400">CS Fundamentals visualizer for technical interviews (Trees, Graphs, Recursion).</p>
            </div>
          </div>

          {/* Compiler / AST Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
              <Braces size={20} className="text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-200">1. Recursive Descent Parser (Trees)</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Demonstrates how the <code className="text-indigo-300">Lexer</code> and <code className="text-indigo-300">Parser</code> process a custom DevQL query string in <strong className="text-emerald-400 font-mono">O(N) time</strong>. The recursive algorithm traverses the tokens and builds an Abstract Syntax Tree (AST) in memory.
                </p>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Input String</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
                    />
                    <button 
                      onClick={simulateParse}
                      disabled={isParsing}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      <Code2 size={16} /> Parse
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[250px] relative">
                <span className="absolute top-3 right-4 text-xs font-mono text-slate-600">AST Memory</span>
                
                {astNodes.length === 0 && !isParsing && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Click Parse to visualize tree construction
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  {astNodes.map((node, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ paddingLeft: `${node.depth * 24}px` }}
                    >
                      <div className="h-4 w-4 border-l-2 border-b-2 border-slate-700 rounded-bl-lg" />
                      <span className="px-2 py-1 bg-slate-800/80 border border-slate-700 rounded text-slate-300 font-mono">
                        {node.type}
                      </span>
                      <span className="text-indigo-300 font-mono">{node.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vector Clock Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
              <Network size={20} className="text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-200">2. Vector Clocks (Graphs / Causal Ordering)</h2>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Demonstrates how distributed systems use Directed Acyclic Graphs (DAGs) mathematically represented as vectors to resolve race conditions. Merging takes <strong className="text-emerald-400 font-mono">O(K) time</strong> where K is the number of nodes.
                </p>
                
                <div className="flex gap-8">
                  <div className="space-y-3">
                    <div className="text-center font-bold text-indigo-400">Node A</div>
                    <div className="font-mono text-sm p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                      [A: {clockA.nodeA}, B: {clockA.nodeB}]
                    </div>
                    <button onClick={incrementA} className="w-full py-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded hover:bg-indigo-500/30">
                      + Local Event
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center font-bold text-purple-400">Node B</div>
                    <div className="font-mono text-sm p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                      [A: {clockB.nodeA}, B: {clockB.nodeB}]
                    </div>
                    <button onClick={incrementB} className="w-full py-1.5 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded hover:bg-purple-500/30">
                      + Local Event
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button onClick={mergeClocks} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <GitMerge size={18} /> Network Sync (Merge DAGs)
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 flex flex-col items-center justify-center relative">
                <span className="absolute top-3 left-4 text-xs font-mono text-slate-600">Sync Result</span>
                
                {merged ? (
                  <div className="animate-in zoom-in duration-300 text-center space-y-3">
                    <div className="text-emerald-400 font-semibold uppercase tracking-widest text-sm">Resolved State</div>
                    <div className="text-3xl font-mono font-bold text-white bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl shadow-2xl">
                      [A: {merged.nodeA}, B: {merged.nodeB}]
                    </div>
                    <p className="text-xs text-slate-500 max-w-[200px] mt-2">
                      Math.max() applied across the vectors to establish absolute causal order without NTP clocks.
                    </p>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">
                    Click "Network Sync" to resolve conflicts
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
