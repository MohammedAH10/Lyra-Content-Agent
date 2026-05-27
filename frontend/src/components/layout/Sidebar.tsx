'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/generate-post', label: 'Create', icon: 'edit' },
  { href: '/suggest-hashtags', label: 'Hashtags', icon: 'sell' },
  { href: '/recommend-media', label: 'Media', icon: 'photo' },
  { href: '/files', label: 'Library', icon: 'library' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-glass-surface backdrop-blur-[24px] border-r border-glass-border shadow-2xl shadow-deep-obsidian z-50 py-stack-sm">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-neon-cyan flex items-center justify-center neon-glow-violet">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h1 className="font-sora text-headline-lg font-black text-neon-violet leading-none">Amiri AI</h1>
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/80 mt-1">Cerebral-Neon Engine</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-body-md transition-all',
                isActive
                  ? 'text-neon-cyan border-r-2 border-neon-cyan bg-gradient-to-r from-neon-cyan/10 to-transparent'
                  : 'text-text-muted hover:text-on-surface hover:bg-white/5'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-auto space-y-4">
        <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-neon-violet to-neon-pink text-white font-bold neon-glow-violet active:scale-95 transition-all text-sm">
          Upgrade Pro
        </button>
        <div className="pt-4 border-t border-glass-border space-y-1">
          <a
            href="https://lyra-content-agent.vercel.app/health"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-text-muted hover:text-on-surface hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">monitor_heart</span>
            <span className="text-sm">API Status</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
