'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, Key, Database, Paintbrush, Check } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Interactive State for Mockups
  const [firstName, setFirstName] = useState('Demo');
  const [lastName, setLastName] = useState('User');
  const [theme, setTheme] = useState('dark');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Incident Creation (P1/P2)': true,
    'Deployment Success': false,
    'High CPU Utilization (>90%)': true,
    'DevQL Syntax Errors': false
  });
  const [twoFactor, setTwoFactor] = useState(true);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    'GitHub Enterprise': true,
    'Slack': false,
    'Datadog': false
  });
  
  const [keys, setKeys] = useState([
    { id: 1, name: 'Production CI/CD', token: 'devboard_prod_8f92...', lastUsed: '2 minutes ago' }
  ]);

  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const generateKey = () => {
    setKeys([...keys, {
      id: Date.now(),
      name: 'New API Key',
      token: `devboard_live_${Math.random().toString(36).substring(2, 10)}...`,
      lastUsed: 'Never'
    }]);
    showToast('New API key generated successfully');
  };

  const revokeKey = (id: number) => {
    setKeys(keys.filter(k => k.id !== id));
    showToast('API key revoked');
  };

  const toggleIntegration = (name: string) => {
    setIntegrations(prev => {
      const newState = !prev[name];
      showToast(newState ? `Connected to ${name}` : `Disconnected from ${name}`);
      return { ...prev, [name]: newState };
    });
  };

  const toggleAlert = (name: string) => {
    setToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full text-slate-50 min-h-screen relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl font-medium text-sm flex items-center gap-2">
            <Check size={16} />
            {toast}
          </div>
        </div>
      )}

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
                    <button onClick={() => showToast('Avatar updated')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 mb-2">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input type="email" defaultValue="demo@example.com" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" disabled />
                    <p className="text-xs text-slate-500 mt-1">Your email address cannot be changed from this panel.</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => showToast('Profile settings saved successfully')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20">
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
                <div onClick={() => setTheme('dark')} className={`p-4 border-2 ${theme === 'dark' ? 'border-indigo-500 bg-slate-950' : 'border-slate-800 bg-slate-900'} rounded-xl flex items-center justify-center cursor-pointer transition-all`}>
                  <span className="text-sm font-medium text-white">Dark (Default)</span>
                </div>
                <div onClick={() => { setTheme('light'); showToast('Light mode coming soon'); }} className={`p-4 border-2 ${theme === 'light' ? 'border-indigo-500 bg-slate-950' : 'border-slate-800 bg-slate-900'} rounded-xl flex items-center justify-center cursor-pointer transition-all opacity-50`}>
                  <span className="text-sm font-medium text-slate-400">Light (Coming Soon)</span>
                </div>
                <div onClick={() => { setTheme('system'); showToast('System theme synced'); }} className={`p-4 border-2 ${theme === 'system' ? 'border-indigo-500 bg-slate-950' : 'border-slate-800 bg-slate-900'} rounded-xl flex items-center justify-center cursor-pointer transition-all`}>
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
                  {Object.entries(toggles).map(([alert, isEnabled]) => (
                    <div key={alert} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{alert}</p>
                        <p className="text-xs text-slate-500 mt-1">Route to configured Slack channels.</p>
                      </div>
                      <button 
                        onClick={() => toggleAlert(alert)}
                        className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
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
                <div className={`p-4 border-2 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${twoFactor ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                  <div>
                    <h3 className={`text-sm font-bold ${twoFactor ? 'text-emerald-400' : 'text-rose-400'}`}>Two-Factor Authentication (2FA)</h3>
                    <p className={`text-xs mt-1 ${twoFactor ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                      {twoFactor ? 'Your account is highly secure. Authenticator App is enabled.' : 'Your account is currently at risk. Enable 2FA.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setTwoFactor(!twoFactor);
                      showToast(twoFactor ? '2FA Disabled' : '2FA Enabled successfully');
                    }}
                    className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${twoFactor ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30'}`}
                  >
                    {twoFactor ? 'Disable 2FA' : 'Enable 2FA'}
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
                  <button onClick={generateKey} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
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
                      {keys.map((key) => (
                        <tr key={key.id} className="border-b border-slate-800/50 animate-in fade-in duration-300">
                          <td className="py-4 font-medium text-slate-300">{key.name}</td>
                          <td className="py-4 font-mono text-slate-500">{key.token}</td>
                          <td className="py-4 text-slate-500">{key.lastUsed}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => revokeKey(key.id)} className="text-rose-400 hover:text-rose-300 text-xs font-semibold">Revoke</button>
                          </td>
                        </tr>
                      ))}
                      {keys.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">No active API keys found.</td>
                        </tr>
                      )}
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
                    { name: 'GitHub Enterprise', desc: 'Sync PR metrics and commits.', color: 'text-slate-200', activeBg: 'bg-slate-800', inactiveBg: 'bg-slate-900 border-slate-800' },
                    { name: 'Slack', desc: 'Route alerts to #incidents.', color: 'text-sky-400', activeBg: 'bg-sky-500/20 border-sky-500/50', inactiveBg: 'bg-sky-500/5 border-sky-500/20' },
                    { name: 'Datadog', desc: 'Ingest raw metric streams.', color: 'text-purple-400', activeBg: 'bg-purple-500/20 border-purple-500/50', inactiveBg: 'bg-purple-500/5 border-purple-500/20' }
                  ].map((intg) => {
                    const isConnected = integrations[intg.name];
                    return (
                      <div key={intg.name} className={`p-5 border rounded-xl flex flex-col justify-between h-32 transition-all ${isConnected ? intg.activeBg : intg.inactiveBg}`}>
                        <div>
                          <h3 className={`text-sm font-bold ${intg.color}`}>{intg.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{intg.desc}</p>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => toggleIntegration(intg.name)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isConnected ? 'bg-slate-950/50 text-slate-400 border-slate-700' : 'bg-transparent text-slate-300 border-slate-600 hover:bg-slate-800'}`}
                          >
                            {isConnected ? 'Connected' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
