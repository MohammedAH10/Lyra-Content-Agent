'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/generate-post', label: 'Create Post', icon: 'edit' },
  { href: '/suggest-hashtags', label: 'Hashtags', icon: 'local_offer' },
  { href: '/recommend-media', label: 'Recommend Media', icon: 'collections' },
  { href: '/files', label: 'File Library', icon: 'folder' },
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
        className="fixed bottom-4 right-4 z-50 lg:hidden w-10 h-10 rounded-full bg-neon-violet/90 backdrop-blur-md border border-neon-violet/50 shadow-[0_4px_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-white active:scale-90 transition-all"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        <span className="material-symbols-outlined text-xl">
          {open ? 'close' : 'menu'}
        </span>
      </button>
    </>
  );
}
