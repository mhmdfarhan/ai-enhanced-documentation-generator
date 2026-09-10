'use client';
import { useAuth } from '@/components/auth/auth-provider';
import { Code2, LayoutDashboard, FolderKanban, LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export function DashboardNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const nav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard', icon: FolderKanban },
  ];
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-zinc-200/60">
      <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center"><Code2 className="w-4 h-4 text-white" /></div>
            <span className="font-semibold tracking-tight text-sm">graphify</span>
            <span className="hidden sm:inline-flex text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 font-medium">AI EDG</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {nav.map(i => {
              const Icon = i.icon;
              const active = pathname === i.href || pathname.startsWith(i.href + '/');
              return (
                <Link key={i.name} href={i.href} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
                  <Icon className="w-4 h-4" />{i.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Online</span>
          <div className="hidden md:flex flex-col items-end leading-none">
            <span className="text-sm font-medium">{user?.full_name || '—'}</span>
            <span className="text-xs text-zinc-500">{user?.email}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">{(user?.email?.[0] || '?').toUpperCase()}</div>
          <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-200 bg-white text-sm hover:bg-zinc-50"><LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span></button>
        </div>
      </div>
    </nav>
  );
}
