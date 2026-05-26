import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Lyra Content Agent',
  description: 'AI-powered social media content creation and media management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-inter antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
