# unocss-preset-daisy — Port Plan (daisyUI Tailwind → UnoCSS)

> Source: `https://github.com/saadeghi/daisyui` @ `v5.7.43` (`7fbfd0b`)
> Decisions locked 2026-09-22:
> - Dist: **Uno preset package** (`unocss-preset-daisy`)
> - Tailwind: **zero-Tailwind** (no `tailwindcss` runtime dep)
> - Scope: **full parity v5.7** (61 components + 4 utilities + 7 base + 35 themes)
> - Theming: **map to Uno `theme.extend.colors`**
> - `@apply/@utility`: **rewrite as `shortcuts`/`rules`**
> - Upstream: **one-time hard fork** (no auto-sync)

## 1. Inventory (what to port)

From `packages/daisyui`:

| Upstream | Count | Target |
|---|---|---|
| `src/base/*.css` (`properties, reset, rootcolor, rootscrollgutter, rootscrolllock, scrollbar, svg`) | 7 | `src/preflights/base.ts` |
| `src/components/*.css` (`button, card, modal, ...`) | 61 | 6 core → `src/shortcuts/components.ts` + `src/rules/components.ts`; 55 in `src/{shortcuts,rules}/batch1-5.ts` (all wired in `src/index.ts`) |
| `src/utilities/*.css` (`glass, join, radius, typography`) | 4 | `src/rules/utilities.ts` |
| `src/themes/*.css` (`light, dark, cupcake, ...`) | 35 | `src/theme/themes.css` + `src/theme/tokens.ts` |
| `functions/variables.js`, `theme/object.js` | 2 | `src/theme/tokens.ts` |
| `functions/generateColorRules.js`, `breakpoints.js` | 2 | `src/rules/colors.ts` + `src/variants.ts` |
| `functions/plugin.js`, `pluginOptionsHandler.js`, `addPrefix.js`, `nestCssLayers.js`, `themePlugin.js` | 5 | `src/index.ts` + `src/options.ts` + `src/layers.ts` |
| `build.js`, `index.js`, `imports.js` | 3 | `build.ts`, `src/index.ts` |

Key gotchas: `@apply` (e.g. `.btn { @apply inline-flex shrink-0 ... }`), `@utility`, `@variant`, `@layer daisyui.l1.l2.l3` specificity nesting, custom variants `is-drawer-open/close`, `prefix/include/exclude` options, `color-mix(in oklab, ...)` + oklch vars + `--depth/--noise`.

## 2. Target architecture

```
src/
  index.ts              # presetDaisy() entry, exports Preset
  options.ts            # prefix, include/exclude, themes, logs
  layers.ts             # layer order: base, daisy-l3, daisy-l2, daisy-l1, components, utilities
  preflights/base.ts    # 7 base files as preflight strings
  shortcuts/components.ts # 6 core static (button, badge, card, input, modal, menu)
  rules/components.ts   # 6 core dynamic: btn-xs/sm/lg, modal-open, per-size variants
  shortcuts/batch1-5.ts # remaining 55 components, static CSS (5 batches)
  rules/batch1-5.ts     # remaining 55 components, dynamic/sized/stateful rules
  rules/utilities.ts    # join, glass, radius, typography
  rules/colors.ts       # bg-*/text-*/border-* + hover/focus/active + sm..2xl/max-* + opacity
  theme/tokens.ts       # Uno theme.extend.colors bridge -> var(--color-*)
  theme/themes.css      # 35 themes verbatim (:root + [data-theme=...])
  variants.ts           # drawer-open/close, responsive, state variants
```

Public API (`uno.config.ts`):

```ts
import { presetUno } from 'unocss'
import { presetDaisy } from 'unocss-preset-daisy'

export default {
  presets: [presetUno(), presetDaisy({ themes: ['light','dark'], prefix: '', include: [], exclude: [] })]
}
```

HTML stays identical: `<button class="btn btn-primary">`, `<div data-theme="dark">`.

## 3. Conversion rules

1. **`@apply` → shortcuts/rules.** Run `scripts/inventory-apply.ts` to list every Tailwind utility used in `@apply`. Expand once with throwaway Tailwind v4 compile, then codemod raw CSS into `shortcuts` (static) or `rules` (dynamic/size-dependent). Never hand-translate blind. Match the compiled Tailwind v4 form (e.g. link `:focus` keeps `--tw-outline-style` + the forced-colors fallback exactly as compiled daisyui.css carries it).
2. **Theming.** Keep oklch `themes.css` verbatim as source of truth. Generate `tokens.ts` bridge: `primary: 'var(--color-primary)'`, `base-100: ...`, plus `--depth, --noise, --radius-field, --size-field`. See `scripts/generate-tokens.ts`.
3. **Layers.** Map `daisyui.l1.l2.l3` → Uno layers `daisy-l3 < daisy-l2 < daisy-l1` (outer wins per saadeghi/daisyui#4209: states > modifiers > base). Preserve names; snapshot-test specificity.
4. **Variants.** Port `breakpoints.js` → Uno variants; `is-drawer-open/close` `addVariant` → `variant()` fns; color states → rules with variants, not static CSS.
5. **Prefix/include/exclude.** Route every selector — including nested ones like `tr.row-hover` — through `applyPrefix()` at preset-generation time (port `addPrefix.js` + `pluginOptionsHandler.js`). Test with `prefix: 'd-'` (see `tests/prefix-e2e.test.ts`).
6. **No Tailwind at runtime.** Tailwind CLI allowed only in `scripts/` throwaway step. `package.json` must NOT depend on `tailwindcss`; the preset is peer-only on `unocss` (no `dependencies`).
7. **Separators.** User Uno config MUST set `separators: [':']` — Uno's dash-form variants swallow `hover-3d`, `file-input*`, `link-*` (a 463-token sweep proved `file-input` rendered wrong styles under defaults). Locked by `tests/separators.test.ts`; the `tests/compat.ts` harness and `example/uno.config.ts` use it.

## 4. Phases

- **P0 scaffold (1–2d):** this repo. Stub `presetDaisy()`, `bun test + playground`. Done when `bun test` + `bun run build` pass on stubs.
- **P1 tooling (2–3d):** finish `scripts/inventory-apply.ts`, `scripts/generate-tokens.ts`. Output: `tests/fixtures/apply-inventory.json`, `src/theme/tokens.ts` draft.
- **P2 base+themes (3–4d):** port 7 base → preflights, 35 themes → `themes.css`. Validate theme switching in `playground/`.
- **P3 components (2–3w):** 61 files in alpha batches. Order: 6 core (`button, badge, card, input, modal, menu`) first (pattern discovery), then bulk in `src/{shortcuts,rules}/batch1-5.ts`. Each batch needs a `tests/batchN.test.ts` suite (+ snapshot entry).
- **P4 utilities+colors (1w):** `join, glass, radius, typography` + `generateColorRules` port.
- **P5 options+polish (1w):** prefix/include/exclude/logs, minify, `daisy.css` bundle, migration guide in `README.md`.
- **P6 freeze:** tag `v5.7-uno.0`. Fork point recorded; no upstream sync.

## 5. Validation

- Compatibility suites (`tests/compat-*.test.ts` + harness `tests/compat.ts`, colon-only `separators: [':']`): resolve winning declarations per class combo through emulated cascade (layer rank + specificity + source order) and `var()` chains against real theme values. Cover button/badge color matrices in light+dark (text/bg resolve to the right content/color vars), sizes vs upstream values, states/variants precedence, 35-theme variable contract + upstream spot values; `compat-extended` adds alert/chat/form-control colors plus tooltip/steps/table/dropdown/modal/menu states.
- Deviation locks (`tests/deviations.test.ts`, workstream A): `.tab` flat-vs-nested scoping, file-input `:disabled` layer alignment, validator-hint layer, link `:focus` compiled form, diff outline fallback, `rounded-full` equivalence.
- Prefix end-to-end (`tests/prefix-e2e.test.ts`, workstream B): real generator with `prefix: 'd-'` — no unprefixed leaks (incl. the `tr.row-hover` fix), no `d-` inside values, theme vars still resolve.
- Composed mode (`tests/composed.test.ts`, workstream C): `presetUno() + presetDaisy()` winner for overlapping utilities (`bg-primary` etc.) + OUR `.filter` beating presetUno's `filter` utility.
- Per-component snapshot: same HTML rendered with Tailwind+daisyUI vs Uno+preset; diff CSS ignoring layer names. See `tests/snapshot.test.ts`.
- Separators sweep (`tests/separators.test.ts`): all 463 fixture/core tokens styled under `[':']`; documents the default-separator collisions justifying the requirement.
- Matrix: core + extended components × light/dark × `hover/focus/disabled/rtl` + prefix on/off.
- `bun run check` must pass: `build + lint + test` (664 pass / 16 files).

## 6. Risks

- Full parity + manual rewrite = 3–5 weeks. If slipping, precompile remaining components to static CSS (allowed fallback) and rewrite hot paths only.
- `color-mix`/oklch output differs between LightningCSS/Uno — pin expected values in snapshots, allow ±1 rounding.
- Drawer variants can't nest in layers — keep as top-level variants (as upstream does).

## 7. References

- Upstream build: `packages/daisyui/build.js`, `index.js`, `functions/*`
- Sample: `src/components/button.css` (canonical `@apply` + `@layer` + `&:hover` example)
- Fork point: commit `7fbfd0b` (v5.7.43)
