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
    <nav className="fixed bottom-4 left-4 right-4 flex justify-around items-center py-2 px-2 bg-glass-surface/90 backdrop-blur-[20px] border border-glass-border lg:hidden z-50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center relative py-2 px-3 rounded-xl transition-all duration-300',
              isActive
                ? 'text-neon-cyan'
                : 'text-text-muted hover:text-on-surface'
            )}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 shadow-[inset_0_0_12px_rgba(34,211,238,0.15)]" />
            )}
            <span
              className="material-symbols-outlined relative z-10 text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={cn(
              'relative z-10 font-label-sm text-[10px] mt-0.5 tracking-wide',
              isActive ? 'font-semibold' : ''
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
