'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, Code2, Trash2, Save, Play, Activity, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Widget = {
  id: string;
  title: string;
  query: string;
  type: 'line' | 'bar' | 'number';
  data: any[];
  error?: string;
  loading?: boolean;
};

export default function CustomDashboardsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      title: 'CPU Usage Tracker',
      query: 'SELECT cpu_usage WHERE service = "api"',
      type: 'line',
      data: []
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addWidget = () => {
    setWidgets([...widgets, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Widget',
      query: 'SELECT memory_mb WHERE service = "db"',
      type: 'bar',
      data: []
    }]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidget = (id: string, key: keyof Widget, value: any) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, [key]: value } : w));
  };

  const runQuery = async (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    updateWidget(id, 'loading', true);
    updateWidget(id, 'error', undefined);

    try {
      const res = await fetch('/api/devql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: widget.query })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to execute query');
      }

      // Format data for Recharts (assuming DevQL returns an array of objects)
      // Limit to 50 points so the chart isn't overcrowded
      const chartData = data.results.slice(0, 50).map((row: any, i: number) => {
        const val = Object.values(row)[0] as number;
        return {
          name: `T-${50 - i}`,
          value: val || 0
        };
      });

      updateWidget(id, 'data', chartData);
    } catch (e: any) {
      updateWidget(id, 'error', e.message);
    } finally {
      updateWidget(id, 'loading', false);
    }
  };

  const runAllQueries = () => {
    widgets.forEach(w => runQuery(w.id));
  };

  const saveDashboard = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const renderChart = (widget: Widget) => {
    if (widget.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
          <AlertCircle size={24} />
          <span className="text-sm font-mono text-center px-4">{widget.error}</span>
        </div>
      );
    }

    if (widget.loading) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-indigo-400 gap-3">
          <Activity size={24} className="animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-wider">Compiling DevQL...</span>
        </div>
      );
    }

    if (!widget.data || widget.data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          Run query to visualize data
        </div>
      );
    }

    if (widget.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={widget.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (widget.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={widget.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} cursor={{ fill: '#1e293b' }} />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Custom Metrics Builder</h1>
                <p className="text-sm text-slate-400">Design your own dashboards using the custom DevQL JIT Compiler.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={runAllQueries}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Play size={16} /> Run All
              </button>
              <button 
                onClick={saveDashboard}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Dashboard'}
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                {/* Widget Header */}
                <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <input
                    type="text"
                    value={widget.title}
                    onChange={(e) => updateWidget(widget.id, 'title', e.target.value)}
                    className="bg-transparent border-none text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded px-1 -ml-1"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={widget.type}
                      onChange={(e) => updateWidget(widget.id, 'type', e.target.value)}
                      className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                    </select>
                    <button onClick={() => removeWidget(widget.id)} className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* DevQL Query Input */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 size={14} className="text-indigo-400" />
                    <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">DevQL Data Source</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={widget.query}
                      onChange={(e) => updateWidget(widget.id, 'query', e.target.value)}
                      placeholder="SELECT metric WHERE condition"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                    <button
                      onClick={() => runQuery(widget.id)}
                      disabled={widget.loading}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Execute
                    </button>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="p-6 h-[250px] relative">
                  {renderChart(widget)}
                </div>
              </div>
            ))}

            {/* Add Widget Button */}
            <button
              onClick={addWidget}
              className="h-[350px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="p-4 rounded-full bg-slate-800/50 group-hover:bg-indigo-500/20 mb-3 transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-semibold text-lg">Add New Widget</span>
              <span className="text-sm mt-1">Connect a new DevQL query</span>
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
