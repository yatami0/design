import type { ReactNode } from 'react';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProviders } from '@/components/providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = { title: 'design — UI 検証' };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="ja" className={cn('font-sans', geist.variable)}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
