'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-deep-obsidian flex">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-neon-violet/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-neon-cyan/5 rounded-full blur-[100px]" />
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 px-margin-page py-stack-md lg:py-stack-lg pb-10 lg:pb-12 overflow-auto max-w-container-max mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
