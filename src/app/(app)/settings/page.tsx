'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, Key, Database, Paintbrush } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full text-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-slate-400">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Demo" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 mb-2">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <input type="text" defaultValue="Demo" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <input type="text" defaultValue="User" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input type="email" defaultValue="demo@example.com" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" disabled />
                    <p className="text-xs text-slate-500 mt-1">Your email address cannot be changed from this panel.</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-semibold text-white mb-6">Theme Preferences</h2>
              <p className="text-slate-400 mb-6">Customize the look and feel of your dashboard.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border-2 border-indigo-500 bg-slate-950 rounded-xl flex items-center justify-center cursor-pointer">
                  <span className="text-sm font-medium text-white">Dark (Default)</span>
                </div>
                <div className="p-4 border-2 border-slate-800 hover:border-slate-700 bg-slate-900 rounded-xl flex items-center justify-center cursor-pointer opacity-50">
                  <span className="text-sm font-medium text-slate-400">Light (Coming Soon)</span>
                </div>
                <div className="p-4 border-2 border-slate-800 hover:border-slate-700 bg-slate-900 rounded-xl flex items-center justify-center cursor-pointer opacity-50">
                  <span className="text-sm font-medium text-slate-400">System</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">Alert Routing & Webhooks</h2>
                <div className="space-y-4">
                  {['Incident Creation (P1/P2)', 'Deployment Success', 'High CPU Utilization (>90%)', 'DevQL Syntax Errors'].map((alert) => (
                    <div key={alert} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{alert}</p>
                        <p className="text-xs text-slate-500 mt-1">Route to configured Slack channels.</p>
                      </div>
                      <button className="w-11 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">Security & Authentication</h2>
                <div className="p-4 border-2 border-emerald-500/30 bg-emerald-500/10 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-emerald-500/70 mt-1">Your account is highly secure. Authenticator App is enabled.</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium border border-emerald-500/30 rounded-lg transition-colors">
                    Manage 2FA
                  </button>
                </div>
                
                <h3 className="text-sm font-bold text-slate-300 mt-8 mb-4">Active Sessions</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Mac OS • Chrome</p>
                    <p className="text-xs text-slate-500 mt-1">Seattle, WA • IP: 192.168.1.1 (Current Session)</p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-500/30">Active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">DevBoard API Keys</h2>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
                    Generate New Key
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="pb-3 font-semibold">Key Name</th>
                        <th className="pb-3 font-semibold">Token Preview</th>
                        <th className="pb-3 font-semibold">Last Used</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-slate-800/50">
                        <td className="py-4 font-medium text-slate-300">Production CI/CD</td>
                        <td className="py-4 font-mono text-slate-500">devboard_prod_8f92...</td>
                        <td className="py-4 text-slate-500">2 minutes ago</td>
                        <td className="py-4 text-right">
                          <button className="text-rose-400 hover:text-rose-300 text-xs font-semibold">Revoke</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-slate-900/50 border border-slate-800/60 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">External Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'GitHub Enterprise', status: 'Connected', desc: 'Sync PR metrics and commits.', color: 'text-slate-200', bg: 'bg-slate-800' },
                    { name: 'Slack', status: 'Connect', desc: 'Route alerts to #incidents.', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
                    { name: 'Datadog', status: 'Connect', desc: 'Ingest raw metric streams.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' }
                  ].map((intg) => (
                    <div key={intg.name} className={`p-5 border border-slate-800 rounded-xl flex flex-col justify-between h-32`}>
                      <div>
                        <h3 className={`text-sm font-bold ${intg.color}`}>{intg.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{intg.desc}</p>
                      </div>
                      <div className="flex justify-end">
                        <button className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors ${intg.status === 'Connected' ? 'bg-slate-800 text-slate-400 border-slate-700' : intg.bg + ' ' + intg.color + ' hover:opacity-80'}`}>
                          {intg.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
