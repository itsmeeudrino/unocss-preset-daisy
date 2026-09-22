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

- [ ] P0 scaffold
- [ ] P1 tooling (`bun run inventory`, `bun run tokens`)
- [ ] P2 base + 35 themes
- [ ] P3 61 components
- [ ] P4 utilities + color rules
- [ ] P5 options + bundle
- [ ] P6 freeze `v5.7-uno.0`
