'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/formatters';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/generate-post', label: 'Generate Post', icon: '✍️' },
  { href: '/suggest-hashtags', label: 'Hashtags', icon: '🏷️' },
  { href: '/recommend-media', label: 'Recommend Media', icon: '🖼️' },
  { href: '/files', label: 'Files Library', icon: '📁' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lyra-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            L
          </div>
          <span className="font-semibold text-gray-900">Lyra Agent</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-lyra-50 text-lyra-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <a
          href="https://lyra-content-agent.vercel.app/health"
          target="_blank"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          API Status
        </a>
      </div>
    </aside>
  );
}
