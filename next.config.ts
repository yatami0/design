import type { NextConfig } from 'next';

// PoC（apps/redmine/next.config.ts）との差分:
//   output: 'standalone' と outputFileTracingRoot は monorepo でのコンテナ配布用。
//   本 repo は単体アプリでコンテナ配布もしないため落とす（移送時は PoC 側の設定が正）。
const nextConfig: NextConfig = {};

export default nextConfig;
