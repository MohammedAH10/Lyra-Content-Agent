'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Home', icon: 'dashboard' },
  { href: '/generate-post', label: 'Create', icon: 'add_circle' },
  { href: '/suggest-hashtags', label: 'Tags', icon: 'tag' },
  { href: '/recommend-media', label: 'Media', icon: 'image' },
  { href: '/files', label: 'Files', icon: 'folder' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 px-4 bg-glass-surface/80 backdrop-blur-[16px] border-t border-glass-border lg:hidden z-50 rounded-t-xl shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center active:scale-90 transition-transform',
              isActive
                ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                : 'text-text-muted hover:text-on-surface'
            )}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {item.icon}
            </span>
            <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
