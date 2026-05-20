'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/generate-post': 'Generate Post',
  '/suggest-hashtags': 'Suggest Hashtags',
  '/recommend-media': 'Recommend Media',
  '/files': 'Files Library',
  '/files/create': 'Upload File',

};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Lyra Content Agent';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <a
          href="https://lyra-content-agent.vercel.app"
          target="_blank"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          API ↗
        </a>
      </div>
    </header>
  );
}
