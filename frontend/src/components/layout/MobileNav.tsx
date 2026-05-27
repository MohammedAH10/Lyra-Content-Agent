'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [open]);

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
        <div className="relative">
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-deep-obsidian/80 to-transparent pointer-events-none z-10" />
          )}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-1 py-2 px-2 scrollbar-none snap-x snap-mandatory"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-center snap-start shrink-0',
                    isActive ? 'text-neon-cyan' : 'text-text-muted hover:text-on-surface'
                  )}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-sm text-[9px] tracking-wide leading-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 lg:hidden h-7 px-6 rounded-t-lg bg-deep-obsidian/80 backdrop-blur-md border-t border-l border-r border-glass-border flex items-center justify-center text-text-muted hover:text-on-surface active:scale-95 transition-all"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        <span className="material-symbols-outlined text-lg">
          {open ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
        </span>
      </button>
    </>
  );
}
