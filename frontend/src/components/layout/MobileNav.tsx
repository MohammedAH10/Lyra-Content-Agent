'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';
import { Icon } from '@/components/ui/Icons';

const navItems = [
  { href: '/', label: 'Home', icon: 'grid' as const },
  { href: '/generate-post', label: 'Create', icon: 'edit' as const },
  { href: '/suggest-hashtags', label: 'Tags', icon: 'tag' as const },
  { href: '/recommend-media', label: 'Media', icon: 'image' as const },
  { href: '/files', label: 'Files', icon: 'folder' as const },
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
            <Icon name={item.icon} className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
