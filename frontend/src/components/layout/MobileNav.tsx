'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Home', icon: '📊' },
  { href: '/generate-post', label: 'Post', icon: '✍️' },
  { href: '/suggest-hashtags', label: 'Tags', icon: '🏷️' },
  { href: '/recommend-media', label: 'Media', icon: '🖼️' },
  { href: '/files', label: 'Files', icon: '📁' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors',
              isActive ? 'text-lyra-600' : 'text-gray-400'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
