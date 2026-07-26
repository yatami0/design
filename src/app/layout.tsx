import type { ReactNode } from 'react';
import './globals.css';

export const metadata = { title: 'design — UI 検証' };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
