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

          {/* Placeholders for other tabs */}
          {['notifications', 'security', 'api', 'integrations'].includes(activeTab) && (
            <div className="p-12 border-2 border-dashed border-slate-800/60 rounded-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 mb-4">
                {tabs.find(t => t.id === activeTab)?.icon({ size: 24 })}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{tabs.find(t => t.id === activeTab)?.label} configuration</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                This feature module is currently under development. Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
