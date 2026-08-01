import type { ReactNode } from 'react';
import './globals.css';
import { AppProviders } from '@/components/providers';

// 手6 D8=D（DR-0058）: next/font の Geist を外した。
// 🟥 理由は「Geist が悪い」ではなく **デザインシステムが sans を持っていなかった**こと。
//    トークン哲学の正本（tmp-admin）は `--font-mono` は定義するが `--font-sans` は定義しない。
//    Geist は layout.tsx だけの選択で、`--font-sans` を `<html>` に挿して
//    Tailwind の既定を上書きしていた＝**本体だけが他と違うフォントで描いていた**。
//    Storybook も プレビューも 移送先（PoC）も layout.tsx を実行しないので追従できない。
// 🟦 いまは本体・Storybook・プレビュー・Claude Design が同じ既定スタックを見る。
//    Geist を「デザインシステムのフォント」にするなら、置き場は layout.tsx ではなく
//    ① Tokens 層で、フォント実体も同梱する必要がある（手8b / 手9 の材料）。

export const metadata = { title: 'design — UI 検証' };

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="ja" className="font-sans">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
