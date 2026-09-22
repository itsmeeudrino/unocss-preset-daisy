import { presetUno } from 'unocss'
import { presetDaisy } from 'unocss-preset-daisy'

// Showcase config: UnoCSS core + daisyUI port. Every class used in
// index.html below is generated from these two presets — no Tailwind.
export default {
  // REQUIRED: colon-only separators. daisyUI class names such as
  // hover-3d, file-input-* and link-* collide with Uno's dash-form
  // variants (hover-*, file-*, link-*), which would swallow them before
  // exact matching. Colon-form variants (sm:, hover:) keep working.
  separators: [':'],
  presets: [
    presetUno(),
    presetDaisy({
      themes: ['light', 'dark', 'cupcake', 'synthwave', 'retro'],
    }),
  ],
}
