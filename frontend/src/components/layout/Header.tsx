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
          <span>API</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </header>
  );
}
