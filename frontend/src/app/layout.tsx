import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Amiri Content Agent',
  description: 'AI-powered social media content creation and media management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-inter antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
