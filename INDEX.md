# INDEX.md — LLM Navigation Index for `unocss-preset-daisy`

> Hard fork of `daisyui@v5.7.43` (commit `7fbfd0b`) → zero-Tailwind UnoCSS preset.
> Generated 2026-09-23 from 20-agent audit + `README/AGENTS/PLAN/FINALIZE/DOCS-SPIKE` + web research.
> For agent contract read `AGENTS.md` first. For port blueprint read `PLAN.md` (frozen). For active worklist read `FINALIZE.md`.

## 0. TL;DR for LLMs

- Entry: `src/index.ts` → `presetDaisy(opts)` composes `layers + preflights + shortcuts + rules + variants + theme`.
- Options: `src/options.ts` (`prefix, include, exclude, themes, logs`) — `themes` is **inert** (whole `themes.css` ships).
- Base: `src/preflights/base.ts` (7 upstream `base/*.css`).
- Components: 6 core in `src/shortcuts/components.ts` + `src/rules/components.ts`, 55 in `src/{shortcuts,rules}/batch1-5.ts`. All 61/61 wired.
- Utilities/colors/variants/theme: `src/rules/utilities.ts`, `src/rules/colors.ts`, `src/variants.ts`, `src/theme/tokens.ts` + `src/theme/themes.css` (35 verbatim).
- Layers: `src/layers.ts` = `base(-100) < daisy-l3(-30) < daisy-l2(-20) < daisy-l1(-10) < components(0) < utilities(10)` — outer wins.
- **REQUIRED user config:** `separators: [':']` + dual import `virtual:uno.css` + `unocss-preset-daisy/themes`.
- Gate: `bun run check` = `build + lint + test` (1220 pass / 21 files).
- Visual truth: `example/` (66 sections, Vite). `playground/` is obsolete P0 stub.
- Never invent class names. Fetch upstream source first (see §9).

## 1. Commands (repo root, Bun only)

| cmd | what |
|---|---|
| `bun install` | install deps |
| `bun run build` | `build.ts` → `dist/index.js` + `dist/themes.css` + 20× `.d.ts` |
| `bun run lint` | `tsc --noEmit` strict (lint-only) |
| `bun test` | all tests (1220 / 21 files) |
| `bun run check` | `build + lint + test` — full gate |
| `bun run format` | Biome 2.5.9 (`biome.json`; `themes.css` excluded, template-literal CSS untouched) |
| `bun run inventory` | `scripts/inventory-apply.ts` → `tests/fixtures/apply-inventory.json` |
| `bun run tokens` | `scripts/generate-tokens.ts` → `src/theme/tokens.ts` |
| `bun run playground` | `Bun.serve :3000` `playground/` stub |
| `cd example && bun install && bun run dev` | Vite showcase http://localhost:5173 |

Stack: `bun + TS ESM`, `unocss` peer-only (`>=0.60.0`, no `dependencies`, never `"latest"`), no `vitest/vite` in root, no `tailwindcss` runtime (throwaway `scripts/` only).

## 2. Doc files — which .md to read when

| file | read when | status |
|---|---|---|
| `README.md` (101 lines) | quickstart, migration Tailwind→Uno, known limitations, size table + dist hash `bd9096a5…` | quasi-stable, current 2026-09-22 |
| `AGENTS.md` (67 lines) | **agent contract**: layout, commands, 8 porting conventions, testing, no-fluff rule | authoritative, read before code change |
| `PLAN.md` (102 lines) | frozen port blueprint: v5.7.43 pin, inventory, `src/` arch, conversion rules, P0-P6 | frozen reference, don't edit decisions |
| `FINALIZE.md` (172 lines) | **active checklist**: resume cmds, done-list, DoD, workstreams A–I, known-issue log, human decisions §6 | only moving file; verify via `bun run check` not `git log` |
| `DOCS-SPIKE.md` (214 lines) | docs-fork research (SvelteKit/mdsvex/i18n/API); recommends minimal shell rebuild | read-only ref for workstream I (deferred); coverage counts stale post-61/61 |
| `INDEX.md` (this file) | LLM map: where is what, component→file lookup, resources | generated |

## 3. `src/` map (the preset — only thing shipped)

```
src/index.ts (79) — presetDaisy() entry, daisyThemeBridge() fallback
src/options.ts (66) — DaisyOptions + resolveOptions + applyPrefix + shouldInclude
src/layers.ts (20) — layerOrder
src/variants.ts (101) — is-drawer-open/close + sm..2xl/max-* stubs
src/preflights/base.ts (232) — 7 base files
src/shortcuts/components.ts (579) — 6 core static
src/rules/components.ts (519) — 6 core dynamic
src/shortcuts/batch1.ts (807) / rules/batch1.ts (2097)
src/shortcuts/batch2.ts (512) / rules/batch2.ts (778)
src/shortcuts/batch3.ts (528) / rules/batch3.ts (610)
src/shortcuts/batch4.ts (474) / rules/batch4.ts (639)
src/shortcuts/batch5.ts (517) / rules/batch5.ts (922)
src/rules/utilities.ts (149) — join, glass, radius, typography-stub
src/rules/colors.ts (72) — bg/text/border ×20 + /opacity
src/theme/tokens.ts (110) — var-name bridge, no oklch values
src/theme/themes.css (1159 lines, 43.8KB) — 35 themes verbatim, never hand-edit
```

- `shortcuts/*`: flat single-selector bases + color/size variants (expanded `@apply` inline). `layer: daisy-l3` base, `daisy-l2` colors/modifiers, `daisy-l1` overrides.
- `rules/*`: nested/state/media/keyframes as raw-CSS strings via internal `__daisy-*` tokens (`internal:true`) + public size/modifier/position rules. All selectors via `applyPrefix()`.
- `utilityRules`, `colorRules`, `daisyVariants`, `daisyThemeBridge` wired in `index.ts`.

## 4. Component → file lookup (61/61)

Core (6): `button, badge, card, input, modal, menu` → `shortcuts/components.ts` + `rules/components.ts`.

| batch | file pair | components (11 each) |
|---|---|---|
| 1 | `batch1.ts` | `alert, aura, avatar, breadcrumbs, calendar, carousel, chat, checkbox, collapse, countdown, diff` |
| 2 | `batch2.ts` | `divider, dock, drawer, dropdown, fab, fieldset, fileinput(file-input), filter, footer, hero, hover3d(hover-3d)` |
| 3 | `batch3.ts` | `hovergallery(hover-gallery), indicator, kbd, label(+floating-label), link, list, loading, mask, megamenu, mockup, navbar` |
| 4 | `batch4.ts` | `otp, progress, radial-progress, radio, range, rating, select, skeleton, stack, stat(+stats), status` |
| 5 | `batch5.ts` | `steps, swap, tab, table, textarea, textrotate, timeline, toast, toggle, tooltip, validator` |

Upstream names with dashes: `file-input, hover-3d, hover-gallery, radial-progress` etc. — never invent names; check `tests/fixtures/batchN-tokens.json` (80+ tokens per batch) + `apply-inventory.json`.

Notable deviations (locked in `tests/deviations.test.ts`):
- `.tab` flat vs upstream `.tab:is(.tabs>.tab)` — intentional.
- `file-input :disabled` in `daisy-l2` (align with `input`).
- `validator-hint` unhide in `utilities` layer.
- `link :focus` keeps `--tw-outline-style` + forced-colors compiled form.
- `mask-position:center` (=50%), `grid-column/row:1/1` (=grid-area), `rounded-full: calc(infinity*1px)` (=`3.40282e38px`), `diff , solid` fallback.
- `tabs-lifted` / `tooltip-neutral` verified absent upstream. `collapse-close` behavior-only (no rule).

## 5. Theme / options / layers / variants cheat-sheet

- **Themes**: `themes.css` = 35 banners `/* --- <name> --- */` (`abyss, acid, aqua, autumn, black, bumblebee, business, caramellatte, cmyk, coffee, corporate, cupcake, cyberpunk, dark, dim, dracula, emerald, fantasy, forest, garden, halloween, lemonade, light, lofi, luxury, night, nord, pastel, retro, silk, sunset, synthwave, valentine, winter, wireframe`). Only `light` prepends bare `:root`. Every block: `:root:has(input.theme-controller[value=X]:checked),[data-theme="X"]`. `tokens.ts` exports names only (`daisyThemeVars` 28, `daisyColors` 20 → `var(--color-*)`). `daisyThemeBridge()` merges fallback + extend + nested. `themes` option inert — slice `themes.css` manually to subset (keep `light`).
- **Options**: `prefix` (default `""`) via regex `/(?<![0-9A-Za-z_-])\.([a-zA-Z][a-zA-Z0-9-]*)/g`; quote/comment-aware via `prefixSelectorSegment`; keyframes unprefixed. `include/exclude` via `shouldInclude` at generation time. `logs` prints resolved opts. Test with `prefix:'d-'` (`tests/prefix-e2e.test.ts` — checks `tr.row-hover`, no `0.d-2`, theme vars resolve).
- **Layers**: `base < daisy-l3 < daisy-l2 < daisy-l1 < components < utilities`. States/modifiers beat base (upstream #4209). Snapshot ignores layer-name strings; allow oklch ±1.
- **Variants**: drawer `is-drawer-open/close` top-level (cannot nest in layers), prefix+separator aware. Responsive `sm..2xl/max-*` stubs (`width >=|< 40/48/64/80/96rem`). States (`hover:/focus:`) come from `presetUno` — never duplicate. `colors.ts` emits plain decls for passthrough.
- **Colors**: `bg|text|border` ×20 names → `var(--color-*)`; `/0-100` → `color-mix(in oklab, … #0000)`; `layer: utilities`.
- **Utilities**: `join` (+vertical/horizontal, join-item + `@scope` descendants flat), `glass` verbatim, `rounded-box/field/selector` + 8 directional splits, `.prose` full port (vars + `:where(code)` block; engine styling via preset-typography).

## 6. Tests map (21 files, 1220 pass)

| file | covers |
|---|---|
| `tests/batch1-5.test.ts` (5) | per-batch smoke + cascade + sizes + states + prefix/include |
| `tests/compat-buttons.test.ts` | btn 8 colors × light/dark, sizes, hover/disabled precedence |
| `tests/compat-components.test.ts` | badge/input/card/modal/menu/join/glass/color rules |
| `tests/compat-extended.test.ts` | alert/chat/checkbox/radio/select/textarea/toggle/range/rating/tooltip/steps/table/dropdown/modal/menu |
| `tests/compat-themes.test.ts` | 35-theme contract (28 vars), light/dark spot values |
| `tests/compat.ts` | harness: `winningDecl/resolveFor/themeVars`, LAYER_RANK, `separators:[':']` |
| `tests/deviations.test.ts` | workstream A locks A1-A7 |
| `tests/prefix-e2e.test.ts` | workstream B: real `prefix:'d-'` generator, leak scan |
| `tests/composed.test.ts` | workstream C: `presetUno+presetDaisy` winners, `.filter` shadowing |
| `tests/separators.test.ts` | 463-token sweep, 9 `PARENT_SCOPED`, default-separator collisions |
| `tests/options.test.ts` | `applyPrefix` decimals/URLs/attrs, `shouldInclude`, defaults |
| `tests/snapshot.test.ts` | existence + var wiring + prefix + theme bridge |
| `tests/parity-1to1.test.ts` + `tests/parity-lib.ts` | 1:1 upstream behavior parity: every official class ships same decls as `daisyui@5.7.43` (no-loss rule coverage; layers/spelling/rounding ignored; A5 allowlisted) |
| `tests/example-coverage.test.ts` | every ported class demoed in `example/`, every token generates |

Fixtures: `tests/fixtures/apply-inventory.json` (617 `@apply`, 408 utils), `batch1-5-tokens.json`.

## 7. Scripts / build / playground / example

- `scripts/inventory-apply.ts` (`bun run inventory`): scans 72 upstream CSS via GitHub API + `FALLBACK_FILES`, extracts `@apply` → JSON (never runtime).
- `scripts/generate-tokens.ts` (`bun run tokens`): var names from `variables.js/css` + `light.css` → `tokens.ts` (offline fallback included).
- `build.ts`: `rm -rf dist` → `Bun.build` (external `unocss`) → `cp themes.css` → temp-`tsc` `.d.ts` emit + `.ts→.js` rewrite. Outputs `dist/index.js` (302KB/50KB gzip) + `themes.css` (43KB/7KB) + 20 `.d.ts`. `package.json` `files:[dist]`, `exports .: index.js/.d.ts`, `./themes: themes.css`.
- `uno.config.ts`: dev ref `presets:[presetUno(), presetDaisy({themes:['light','dark']})]`.
- `playground/` (2 files): obsolete P0 stub (`serve.ts` Bun :3000, single btn). Use for smoke only.
- `example/` (Vite 8 showcase, visual truth): `index.html` 1693 lines (66 `<h2>`), `uno.config.ts` canonical (`separators:[':']`, 5 themes), `src/main.ts` dual-import + theme switcher + modal demo, `sections/batch1-5.html` snippet sources, `dist/` prebuilt. Visual sign-off surface (workstream E).

## 8. LLM task recipes

- **Add/fix component CSS**: 1) fetch upstream `…/src/components/<name>.css` at `v5.7.43` (§9). 2) run `bun run inventory` to see `@apply` list. 3) expand to raw CSS in `shortcuts/batchN.ts` (flat) / `rules/batchN.ts` (nested) with correct `daisy-l*` + `applyPrefix` + `shouldInclude`. 4) add token to `batchN-tokens.json`, test in `batchN.test.ts` + snapshot entry, verify `prefix:'d-'` + `separators:[':']`. 5) `bun run check`.
- **Theme work**: never edit oklch values. Edit `tokens.ts` bridge only; regen via `bun run tokens`. Verify `compat-themes`.
- **Debug cascade**: use `tests/compat.ts:winningDecl/resolveFor` — layer rank → specificity → source order; check `src/layers.ts` order.
- **Prefix bug**: repro in `prefix-e2e`, check `applyPrefix` regex + `prefixSelectorSegment` quote handling + nested `tr.row-hover`-style compounds.
- **Dash-variant eaten (`hover-3d/file-input/link-*` empty/wrong)**: user config missing `separators:[':']` — see `separators.test.ts`.
- **Release**: shipped `5.7-uno.0` (preset + docs 1:1 fork + GH Pages). Marketing/SEO long-tail out of scope; fork stays at v5.7.43.

## 9. Upstream daisyUI resources (pin `v5.7.43`, never `master`)

- Repo: https://github.com/saadeghi/daisyui — fork point tag `v5.7.43` → commit `7fbfd0b3f82d3ff3898868028c0bdaf941361e61`
- Raw pattern: `https://raw.githubusercontent.com/saadeghi/daisyui/v5.7.43/packages/daisyui/src/<area>/<name>.css`
- Sample component (canonical `@apply`+`@layer`+`&:hover`): https://raw.githubusercontent.com/saadeghi/daisyui/v5.7.43/packages/daisyui/src/components/button.css
- Sample theme: https://raw.githubusercontent.com/saadeghi/daisyui/v5.7.43/packages/daisyui/src/themes/light.css
- Base/utility samples: `…/src/base/reset.css`, `…/src/utilities/glass.css`
- Plugin wiring: `…/packages/daisyui/index.js`, `functions/pluginOptionsHandler.js`, `functions/addPrefix.js`, `functions/nestCssLayers.js`, `functions/themePlugin.js`
- Generation: `functions/generateColorRules.js`, `functions/breakpoints.js` (`sm:640 md:768 lg:1024 xl:1280 2xl:1536`), `functions/variables.{js,css}`, `functions/themeOrder.js`
- Layout: `src/base/` (7) `src/components/` (61) `src/themes/` (35) `src/utilities/` (4: `glass, join, radius, typography`)
- Dir listing: `https://api.github.com/repos/saadeghi/daisyui/contents/packages/daisyui/src/components?ref=v5.7.43`
- Docs: https://daisyui.com/components/ (markup), https://daisyui.com/docs/v5/, https://daisyui.com/docs/upgrade/, https://daisyui.com/docs/utilities/
- Re-fetch compiled ref: `curl -s https://cdn.jsdelivr.net/npm/daisyui@5.7.43/daisyui.css -o /tmp/daisy-ref.css`
- Layers: nested `@layer daisyui.l1.l2.l3` (`l3` base → `l1` overrides); drawer variants top-level per `index.js` comment.

## 10. UnoCSS resources

- Guide (custom `Preset{name,rules,variants,shortcuts}`): https://unocss.dev/guide/
- Config (`rules,shortcuts,theme,variants,preflights,layers,separators`): https://unocss.dev/config/
- Rules (static/dynamic, `symbols.*`, ordering): https://unocss.dev/config/rules
- Shortcuts (object + `RegExp`): https://unocss.dev/config/shortcuts
- Variants (`matcher/selector`, `hover:m-2` walkthrough): https://unocss.dev/config/variants — advanced: https://github.com/unocss/unocss/tree/main/packages-presets/preset-mini/src/_variants
- Preflights (`getCSS:({theme})=>string`): https://unocss.dev/config/preflights
- Layers (custom order, `outputToCssLayers`, `uno-layer-*:`): https://unocss.dev/config/layers
- Theme (`theme.colors`, `extendTheme`, breakpoints override-not-merge): https://unocss.dev/config/theme
- Presets (`definePreset` factory): https://unocss.dev/config/presets — refs: https://unocss.dev/presets/mini, https://unocss.dev/presets/wind4, https://unocss.dev/presets/
- Processors: https://unocss.dev/config/processors
- Pitfalls: default `separators:[':','-']` eats `-` names → require `[':']`; custom variants use `separatorsOf()` not hardcoded `:`; don't reimplement `hover:/focus:` (from `presetUno`); responsive stubs risk double-`@media` when composed.

## 11. Known gaps / risks (don't regress)

1. `themes` option inert (F.2) — whole file ships; needs API change or manual slice.
2. `typography` stub — `.prose` vars only.
3. `.filter` shadows presetUno `filter` utility — OUR win locked, order-dependent.
4. Dash-variant loss — `separators:[':']` mandatory; silent footgun.
5. Visual sign-off (E) blocks release (H) — 5 gaps: rating masks, toast children, drawer-menu, validator-invalid + 2 demo gaps.
6. Released `5.7-uno.0` — CHANGELOG entry + tag; npm auth resolved at publish time.
7. Docs shipped as 1:1 fork (68 components, 20 sections, 33 posts) — not minimal shell.
8. Source-vs-compiled normalizations locked (±1 oklch, ignore layer names).
9. Composed duplication (`colors.ts` + presetUno bridge) — harmless, winner locked.
10. `dist/` hash staleness — re-measure after rebuild; `example/` vs `playground/` dual paths.

---
*Audit: 20 subagents (entry, options, base, core, batch1-5, theme, colors/utils/variants, build, snapshot/compat, extended-tests, scripts, docs-MDs, playground/example, upstream-web, unocss-web, risks) + Firecrawl web search + README/AGENTS/PLAN/FINALIZE/DOCS-SPIKE.*
