import { presetUno } from 'unocss'
import { presetDaisy } from 'unocss-preset-daisy'
// Full prose styling (optional): `import presetTypography from
// '@unocss/preset-typography'` (ships inside the `unocss` meta package — no
// new dep) and add `presetTypography()` after `presetDaisy()`. The preset's
// own `.prose` vars + `:where(code)` block (src/rules/utilities.ts) cover
// standalone use; with the engine, theme via
// `presetTypography({ cssExtend: DAISY_PROSE_CSS_EXTEND })` (snippet in
// tests/docs-gaps.test.ts — the engine's `prose` shortcut shadows the
// standalone bridge). Live wiring: docs/uno.config.ts.

// Showcase config: UnoCSS core + daisyUI port. Every class used in
// index.html below is generated from these two presets — no Tailwind.
export default {
  // REQUIRED: colon-only separators. daisyUI class names such as
  // hover-3d, file-input-* and link-* collide with Uno's dash-form
  // variants (hover-*, file-*, link-*), which would swallow them before
  // exact matching. Colon-form variants (sm:, hover:) keep working.
  separators: [':'],
  // Content scanning (DOCS-SPIKE §1.6b): default pipeline covers
  // .svelte/.md/.mdx/.html but NOT `.svx` — the pattern below closes it.
  // `$$`-placeholder fences need nothing (live HTML above the fence
  // extracts; see tests/extractor-coverage.test.ts).
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|svx|astro|elm|php|phtml|marko|html)($|\?)/,
        'src/**/*.{svelte,md,svx}',
      ],
    },
  },
  presets: [
    presetUno(),
    presetDaisy({
      themes: ['light', 'dark', 'cupcake', 'synthwave', 'retro'],
    }),
  ],
}
