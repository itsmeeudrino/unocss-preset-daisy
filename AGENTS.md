# AGENTS.md

## Workspace rules

- Single package repo (not a monorepo): `unocss-preset-daisy`.
- Runtime: Bun.js + TypeScript ESM. Package manager: `bun`.
- Do NOT add any new dependency without asking first. Especially do NOT add `tailwindcss` as a runtime dep (dev-only throwaway scripts in `scripts/` may use it for `@apply` expansion, never in `src/`).
- One-time hard fork of `saadeghi/daisyui@v5.7.43`. Do not attempt upstream sync automation.

## Stack

- `unocss` (`presetUno` / `presetMini` compatible), plain CSS strings, `bun test`. No `vitest`, no `tsc`, no `vite` — Bun only.
- `src/` is the preset. `scripts/` is throwaway codegen. `tests/` is snapshots + ported upstream tests. `playground/` is manual visual check. Never ship `scripts/` or `playground/`.

## Layout

- `src/index.ts` — `presetDaisy()` entry, composes preflights/shortcuts/rules/variants/theme.
- `src/options.ts` — `prefix, include, exclude, themes, logs` (port of `pluginOptionsHandler.js` + `addPrefix.js`).
- `src/layers.ts` — layer order (`base < daisy-l3 < daisy-l2 < daisy-l1 < components < utilities`; outer wins, see layers.ts comment).
- `src/preflights/base.ts` — port of `src/base/*.css` (7 files).
- `src/shortcuts/components.ts` — static component CSS (61 components).
- `src/rules/components.ts` — dynamic/sized component rules.
- `src/rules/utilities.ts` — `join, glass, radius, typography`.
- `src/rules/colors.ts` — port of `generateColorRules.js` + `breakpoints.js` states.
- `src/theme/tokens.ts` — Uno `theme.extend.colors` bridge to `var(--color-*)`.
- `src/theme/themes.css` — 35 upstream themes verbatim.
- `src/variants.ts` — `is-drawer-open/close`, responsive, state variants.
- `scripts/inventory-apply.ts` — list every Tailwind util used in upstream `@apply`.
- `scripts/generate-tokens.ts` — upstream themes → `tokens.ts`.
- `tests/snapshot.test.ts` — Tailwind-vs-Uno CSS diff per component.

## Commands (repo root)

- `bun install` — install deps
- `bun run build` — `build.ts` → `dist/` (`daisy.css` + preset JS)
- `bun run lint` — `tsc --noEmit` against strict `tsconfig.json` (lint-only; build/test stay Bun)
- `bun test` — all tests (`bun test --parallel=4` in CI)
- `bun run check` — `build + test + validatecss`
- `bun run inventory` — `bun scripts/inventory-apply.ts` (writes `tests/fixtures/apply-inventory.json`)
- `bun run tokens` — `bun scripts/generate-tokens.ts` (writes `src/theme/tokens.ts`)
- `bun run playground` — serve `playground/` with Uno + preset for visual check (Bun-only, see `playground/serve.ts`)

## Porting conventions

1. Read upstream file first: `https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/<area>/<name>.css`. Never invent class names.
2. `@apply A B C` → expand via inventory script output, then emit raw CSS in `shortcuts`, NOT Tailwind class strings. Example: `.btn { @apply inline-flex ... }` → `shortcuts: [{ btn: '<expanded css>' }]`.
3. `@layer daisyui.l1.l2.l3` → assign correct Uno `layer` (`daisy-l1/2/3`). Keep nesting semantics; add snapshot.
4. Themes: never hand-edit oklch values. Copy `src/themes/*.css` verbatim into `src/theme/themes.css`; expose via `tokens.ts` bridge only.
5. Prefix: all selectors go through `applyPrefix()` in `src/options.ts`. Test each batch with `prefix: 'd-'`.
6. `include/exclude`: filter at preset-generation time (port `shouldIncludeItem` from upstream `index.js`).
7. Drawer variants stay top-level (cannot nest in layers) — see upstream `index.js` comment.
8. Keep functions small, one file per concern. Mirror upstream `functions/*.js` names where possible for traceability.

## Testing rules

- Every component batch needs: (a) snapshot entry in `tests/snapshot.test.ts`, (b) theme matrix check, (c) prefix on/off check.
- Snapshot compares computed CSS, ignoring layer-name strings. Allow oklch rounding ±1.
- Port upstream `plugin.test, themes.test, contrast.test, validatecss.test` before marking P5 done.

## Communication rules

- Do not explain unless asked. Do not confirm/deny unless 100% sure. Fact-check against upstream `master`.
- If unsure, say "I don't know".
- No intro/outro fluff. Just do the task.
