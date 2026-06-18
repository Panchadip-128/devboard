'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, User, Users, BookOpen, AlertTriangle } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const router = useRouter();

  // Toggle the menu when ⌘K or CTRL+K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch search results when search changes (with basic debounce)
  React.useEffect(() => {
    if (!search) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
        <Command
          className="flex flex-col"
          shouldFilter={false} // Backend filtering
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div className="flex items-center border-b border-slate-800 px-4">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Command.Input
              autoFocus
              className="flex-1 bg-transparent py-4 outline-none text-slate-100 placeholder-slate-500 text-lg"
              placeholder="Search repositories, incidents, users..."
              value={search}
              onValueChange={setSearch}
            />
            <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">ESC</div>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {loading && <div className="p-6 text-center text-sm text-slate-400">Searching across workspace...</div>}
            
            {!loading && !results && !search && (
              <div className="p-6 text-center text-sm text-slate-500">Type a query to begin searching.</div>
            )}

            {!loading && results && (
               Object.values(results).every((arr: any) => arr.length === 0) ? (
                 <Command.Empty className="p-6 text-center text-sm text-slate-400">No results found for "{search}".</Command.Empty>
               ) : (
                 <div className="space-y-4">
                   {results.repositories?.length > 0 && (
                     <Command.Group heading="Repositories" className="text-xs font-semibold text-slate-500 px-2">
                       <div className="mt-2 space-y-1">
                         {results.repositories.map((repo: any) => (
                           <Command.Item
                             key={repo.id}
                             onSelect={() => {
                               setOpen(false);
                               router.push('/dashboard');
                             }}
                             className="flex items-center px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white rounded-md cursor-pointer transition-colors"
                           >
                             <BookOpen className="w-4 h-4 mr-3 text-blue-400" />
                             {repo.name}
                           </Command.Item>
                         ))}
                       </div>
                     </Command.Group>
                   )}

                   {results.incidents?.length > 0 && (
                     <Command.Group heading="Incidents" className="text-xs font-semibold text-slate-500 px-2">
                       <div className="mt-2 space-y-1">
                         {results.incidents.map((inc: any) => (
                           <Command.Item
                             key={inc.id}
                             onSelect={() => {
                               setOpen(false);
                               router.push('/incidents');
                             }}
                             className="flex items-center px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white rounded-md cursor-pointer transition-colors"
                           >
                             <AlertTriangle className="w-4 h-4 mr-3 text-amber-400" />
                             {inc.title}
                             <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                               {inc.severity}
                             </span>
                           </Command.Item>
                         ))}
                       </div>
                     </Command.Group>
                   )}

                   {results.users?.length > 0 && (
                     <Command.Group heading="Team Members" className="text-xs font-semibold text-slate-500 px-2">
                       <div className="mt-2 space-y-1">
                         {results.users.map((user: any) => (
                           <Command.Item
                             key={user.id}
                             onSelect={() => {
                               setOpen(false);
                               router.push('/team');
                             }}
                             className="flex items-center px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-white rounded-md cursor-pointer transition-colors"
                           >
                             <User className="w-4 h-4 mr-3 text-emerald-400" />
                             {user.name} <span className="ml-2 text-slate-500">({user.email})</span>
                           </Command.Item>
                         ))}
                       </div>
                     </Command.Group>
                   )}
                 </div>
               )
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
