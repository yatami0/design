// Tailwind v4 の配線。PoC 側では未着手のため、ここが初出になる。
// v4 は tailwind.config.js を持たず、PostCSS プラグイン 1 個 + CSS の @import だけで動く
// （トークンは CSS 側の @theme / @theme inline で宣言する → 手2）。
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
