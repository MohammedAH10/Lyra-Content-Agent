'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/generate-post', label: 'Create Post' },
  { href: '/suggest-hashtags', label: 'Hashtags' },
  { href: '/recommend-media', label: 'Recommend Media' },
  { href: '/files', label: 'File Library' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={cn(
          'fixed bottom-0 left-0 w-full bg-deep-obsidian/95 backdrop-blur-[20px] border-t border-glass-border lg:hidden z-50 transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex justify-around items-start py-4 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors text-center',
                  isActive ? 'text-neon-cyan' : 'text-text-muted hover:text-on-surface'
                )}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.href === '/' && 'dashboard'}
                  {item.href === '/generate-post' && 'edit'}
                  {item.href === '/suggest-hashtags' && 'local_offer'}
                  {item.href === '/recommend-media' && 'collections'}
                  {item.href === '/files' && 'folder'}
                </span>
                <span className="font-label-sm text-[10px] tracking-wide leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 lg:hidden w-12 h-12 rounded-full bg-neon-violet/90 backdrop-blur-md border border-neon-violet/50 shadow-[0_4px_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-white active:scale-90 transition-all"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? 'close' : 'menu'}
        </span>
      </button>
    </>
  );
}
