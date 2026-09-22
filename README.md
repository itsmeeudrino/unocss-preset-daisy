# unocss-preset-daisy

daisyUI v5 ported to UnoCSS. Zero-Tailwind preset. Hard fork of `daisyui@5.7.43`.

See `PLAN.md` for full port plan, `AGENTS.md` for agent instructions.

## Quickstart

```ts
// uno.config.ts
import { presetUno } from 'unocss'
import { presetDaisy } from 'unocss-preset-daisy'
export default { presets: [presetUno(), presetDaisy({ themes: ['light','dark'] })] }
```

```html
<button class="btn btn-primary">Hi</button>
```

## Status

- [x] P0 scaffold
- [x] P1 tooling (`bun run inventory`, `bun run tokens`)
- [x] P2 base + 35 themes
- [x] P3 6 core components (button, badge, card, input, modal, menu)
- [x] P4 utilities + color rules + variants + infra (`bun run check` green)
- [ ] P5 remaining 55 components + options polish
- [ ] P6 freeze `v5.7-uno.0`

## Example app

`example/` is a Vite + UnoCSS showcase (buttons, badges, cards, inputs,
modal, menu, join, glass, theme switcher). Needs a fresh preset build first:

```sh
bun run build          # repo root → dist/
cd example && bun install && bun run dev   # http://localhost:5173
```
