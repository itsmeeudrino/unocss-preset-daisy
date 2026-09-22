import { presetUno } from 'unocss'
import { presetDaisy } from 'unocss-preset-daisy'

// Showcase config: UnoCSS core + daisyUI port. Every class used in
// index.html below is generated from these two presets — no Tailwind.
export default {
  presets: [
    presetUno(),
    presetDaisy({
      themes: ['light', 'dark', 'cupcake', 'synthwave', 'retro'],
    }),
  ],
}
