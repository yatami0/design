import type { ReactNode } from 'react';

import { Container } from '@/components/Layout/Container';
import { Section } from '@/components/Layout/Section';
import { Stack } from '@/components/Layout/Stack';

// 手3 で製品層の最初の利用者になった。
// 🟥 手0 の版は `p-8` / `mt-2` / `text-gray-600` を直書きしており、
//    D4=B′ の lint（数値の段・パレット色の禁止）で 3 行が赤になった。
//    ここを書き直すことが「枠が本当に閉じたか」の最初の実証になる。
export default function Home(): ReactNode {
  return (
    <Container width="content">
      <Stack gap="lg" inset="lg">
        <Section heading="design — UI 検証" gap="sm">
          <p className="text-body text-muted-foreground">
            手3（② Components
            層）。素材層（shadcn）と製品層（自作共通部品）の境界を 引き、Layout
            プリミティブを製品層に置いた。
          </p>
        </Section>

        <Section heading="このページが証明していること" gap="sm">
          <Stack gap="sm">
            <p className="text-body text-muted-foreground">
              このファイルには数値の段（`p-8`）もパレット色（`text-gray-600`）も
              1 つも無い。余白は Layout の props で、色は semantic
              な用途名で指定している。
            </p>
            <p className="text-label text-muted-foreground">
              枠を守っているのは lint ではなく props の型（DR-0032）。lint
              は補助として `cva` / `cn` / `className` の 3
              文脈を見ている（DR-0033）。
            </p>
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
