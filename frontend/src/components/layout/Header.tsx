'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/generate-post': 'Create Content',
  '/suggest-hashtags': 'Generate Hashtags',
  '/recommend-media': 'Recommend Media',
  '/files': 'Files Library',
  '/files/create': 'Upload File',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Amiri Content Agent';

  return (
    <header className="lg:hidden flex justify-between items-center w-full px-margin-page py-4 sticky top-0 bg-glass-surface backdrop-blur-[12px] border-b border-glass-border z-50 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
      <h1 className="font-sora text-headline-lg-mobile font-bold bg-gradient-to-r from-neon-violet to-neon-cyan bg-clip-text text-transparent">
        Amiri
      </h1>
    </header>
  );
}
