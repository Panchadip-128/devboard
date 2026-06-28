'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, Mail, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Left Side - Visuals */}
      <div className="relative hidden md:flex flex-col flex-1 overflow-hidden border-r border-white/5 bg-slate-950/50">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px]" />
          
          {/* Abstract Grid Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-16 xl:px-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <span className="flex w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Engineering Intelligence
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 leading-tight">
            Monitor, Analyze, and <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Optimize Velocity.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-12">
            Sign in to DevBoard to access real-time telemetry, team analytics, and automated bottleneck detection for your engineering org.
          </p>

          {/* Social Proof / Stats */}
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Join 10,000+ engineers</span>
              <span className="text-xs text-slate-500">improving their DORA metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex flex-col justify-center flex-1 p-8 sm:p-12 lg:p-24 bg-black">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-500/20 text-indigo-400">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">DevBoard</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 mb-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or continue with</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all hover:border-white/20"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub
            </button>
          </div>
          
          <div className="mt-10 text-center text-sm text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-500/70" />
            Secure & encrypted access
          </div>
        </div>
      </div>
    </div>
  );
}
