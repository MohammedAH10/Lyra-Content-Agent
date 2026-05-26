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
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-2 bg-deep-obsidian/95 backdrop-blur-[20px] border-t border-glass-border lg:hidden z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-200',
              isActive
                ? 'text-neon-cyan'
                : 'text-text-muted hover:text-on-surface'
            )}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px] mt-0.5 tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
