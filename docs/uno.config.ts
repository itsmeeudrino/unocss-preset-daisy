import { presetUno } from "unocss"
import presetTypography from "@unocss/preset-typography"
import { presetDaisy } from "../src/index.ts"

// Port of the packages/docs/src/global.css plugin block:
//   @plugin "@tailwindcss/typography" + @plugin "daisyui" { themes: all }
// `themes: false` is the preset's "all 35 themes" selector (see src/options.ts).
export default {
  // REQUIRED (see tests/separators.test.ts): colon-only separators. daisyUI
  // class names such as hover-3d, file-input-* and link-* collide with Uno's
  // dash-form variants (hover-*, file-*, link-*). Colon-form variants
  // (sm:, hover:) keep working.
  separators: [":"],
  // WORKAROUND (docs-only; preset owns the real fix): `rtl:tooltip-left`
  // (PrefixEdit.svelte, verbatim upstream) makes the preset emit
  // `[dir="rtl"] $$ .rtl\:tooltip-left>...` — the `$$` multi-parent join
  // (see src/variants.ts) leaks into the selector and lightningcss minify
  // rejects it as a dangling combinator. Verified via full content scan:
  // this is the ONLY `$$` leak across all docs tokens, and browsers would
  // drop the invalid rule anyway, so blocking generation is a no-op visually.
  // Remove once the preset expands `$$` parents for rtl x nested rules.
  blocklist: ["rtl:tooltip-left"],
  presets: [presetUno(), presetDaisy({ themes: false }), presetTypography()],
}
