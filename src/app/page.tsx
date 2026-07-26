import type { ReactNode } from 'react';

// 手0 の疎通確認ページ。Tailwind のユーティリティが効いていれば余白・文字色・罫線が乗る。
// 手1 以降でここは shadcn の部品カタログに置き換わる。
export default function Home(): ReactNode {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">design — UI 検証</h1>
      <p className="mt-2 text-sm text-gray-600">
        手0（土台）完了。Tailwind v4 が配線され、PoC と同一版・同一 lint
        で動いている。
      </p>
      <ul className="mt-6 space-y-1 border-t border-gray-200 pt-4 text-sm">
        <li>手1: shadcn デフォルト導入 + 役割 9 カテゴリへの割り当て</li>
        <li>手2: トークン語彙のマッピング（値はデフォルトのまま）</li>
        <li>手3: Components 層（Layout / Overlay の自作テンプレ）</li>
      </ul>
    </main>
  );
}
