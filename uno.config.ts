import { presetUno } from "unocss";
import { presetDaisy } from "./src/index.ts";

// Reference config (repo itself + playground). Docs scaffold + example carry
// the same `separators` + `content.pipeline` blocks (see example/uno.config.ts
// and docs/uno.config.ts). Full prose styling = add `presetTypography()` from
// `@unocss/preset-typography` after `presetDaisy()` (ships inside the `unocss`
// meta package — no new dep; docs/uno.config.ts shows the active wiring while
// this preset stays peer-only on `unocss`).

export default {
  // REQUIRED: colon-only separators. daisyUI class names such as
  // hover-3d, file-input-* and link-* collide with Uno's dash-form
  // variants (hover-*, file-*, link-*), which would swallow them before
  // exact matching. Colon-form variants (sm:, hover:) keep working.
  separators: [":"],
  // Docs content scanning (DOCS-SPIKE §1.6b): Uno's default pipeline include
  // covers .svelte/.md/.mdx/.html but NOT `.svx` (mdsvex) — the extra pattern
  // below closes the gap. `$$`-placeholder fences need nothing: previews
  // render from the live HTML above the fence (see
  // tests/extractor-coverage.test.ts).
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|svx|astro|elm|php|phtml|marko|html)($|\?)/,
        "src/**/*.{svelte,md,svx}",
      ],
    },
  },
  presets: [presetUno(), presetDaisy({ themes: ["light", "dark"] })],
};
