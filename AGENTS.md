# AGENTS.md

## Workspace rules

- Single package repo (not a monorepo): `unocss-preset-daisy`.
- Runtime: Bun.js + TypeScript ESM. Package manager: `bun`.
- Do NOT add any new dependency without asking first. Especially do NOT add `tailwindcss` as a runtime dep (dev-only throwaway scripts in `scripts/` may use it for `@apply` expansion, never in `src/`).
- One-time hard fork of `saadeghi/daisyui@v5.7.43`. Do not attempt upstream sync automation.
- Preset is peer-only on `unocss` (no `dependencies`; never ship `"latest"`).

## Stack

- `unocss` (`presetUno` / `presetMini` compatible), plain CSS strings, `bun test`. No `vitest`, no `vite` — Bun only (`tsc --noEmit` lint-only via `bun run lint`).
- `src/` is the preset. `scripts/` is throwaway codegen. `tests/` is snapshots + ported upstream tests. `playground/` is manual visual check. Never ship `scripts/` or `playground/`.

## Layout

- `src/index.ts` — `presetDaisy()` entry, composes preflights/shortcuts/rules/variants/theme.
- `src/options.ts` — `prefix, include, exclude, themes, logs` (port of `pluginOptionsHandler.js` + `addPrefix.js`).
- `src/layers.ts` — layer order (`base < daisy-l3 < daisy-l2 < daisy-l1 < components < utilities`; outer wins, see layers.ts comment).
- `src/preflights/base.ts` — port of `src/base/*.css` (7 files).
- `src/shortcuts/components.ts` + `src/rules/components.ts` — 6 core components (button, badge, card, input, modal, menu).
- `src/shortcuts/batch1-5.ts` + `src/rules/batch1-5.ts` — remaining 55 components in 5 batches; all 61/61 wired via `src/index.ts`.
- `src/rules/utilities.ts` — `join, glass, radius, typography`.
- `src/rules/colors.ts` — port of `generateColorRules.js` + `breakpoints.js` states.
- `src/theme/tokens.ts` — Uno `theme.extend.colors` bridge to `var(--color-*)`.
- `src/theme/themes.css` — 35 upstream themes verbatim.
- `src/variants.ts` — `is-drawer-open/close` + responsive stubs (state variants come from `presetUno`, never duplicated).
- `scripts/inventory-apply.ts` — list every Tailwind util used in upstream `@apply`.
- `scripts/generate-tokens.ts` — upstream themes → `tokens.ts`.
- `tests/snapshot.test.ts` — Tailwind-vs-Uno CSS diff per component.

## Commands (repo root)

- `bun install` — install deps
- `bun run build` — `build.ts` → `dist/` (`daisy.css` + preset JS)
- `bun run lint` — `tsc --noEmit` against strict `tsconfig.json` (lint-only; build/test stay Bun)
- `bun run format` — Biome (`biome.json`); raw CSS in template literals is untouched, `src/theme/themes.css` excluded
- `bun test` — all tests (1220 pass / 21 files)
- `bun run check` — `build + lint + test`
- `bun run inventory` — `bun scripts/inventory-apply.ts` (writes `tests/fixtures/apply-inventory.json`)
- `bun run tokens` — `bun scripts/generate-tokens.ts` (writes `src/theme/tokens.ts`)
- `bun run playground` — serve `playground/` with Uno + preset for visual check (Bun-only, see `playground/serve.ts`)

## Porting conventions

1. Read upstream file first: `https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/<area>/<name>.css`. Never invent class names.
2. `@apply A B C` → expand via inventory script output, then emit raw CSS in `shortcuts`, NOT Tailwind class strings. Example: `.btn { @apply inline-flex ... }` → `shortcuts: [{ btn: '<expanded css>' }]`.
3. `@layer daisyui.l1.l2.l3` → assign correct Uno `layer` (`daisy-l1/2/3`). Keep nesting semantics; add snapshot.
4. Themes: never hand-edit oklch values. Copy `src/themes/*.css` verbatim into `src/theme/themes.css`; expose via `tokens.ts` bridge only.
5. Prefix: every selector — including nested ones like `tr.row-hover` — goes through `applyPrefix()` in `src/options.ts`. Test each batch with `prefix: 'd-'` (see `tests/prefix-e2e.test.ts`).
6. `include/exclude`: filter at preset-generation time (port `shouldIncludeItem` from upstream `index.js`).
7. Drawer variants stay top-level (cannot nest in layers) — see upstream `index.js` comment.
8. Keep functions small, one file per concern. Mirror upstream `functions/*.js` names where possible for traceability.

## Testing rules

- Every component batch needs: (a) snapshot entry in `tests/snapshot.test.ts`, (b) theme matrix check, (c) prefix on/off check.
- Snapshot compares computed CSS, ignoring layer-name strings. Allow oklch rounding ±1.
- Full gate: 1220 pass / 21 files — `batch1-5`, `compat-*` (buttons/components/extended/themes), `deviations` (workstream A resolutions), `prefix-e2e` (B), `composed` (C), `separators` sweep, `options`, `snapshot`, `example-coverage`, `parity-1to1` + `parity-lib` (1:1 upstream behavior parity), `docs-chrome` + `docs-gaps` + `extractor-coverage` + `verify-docs` (docs fork).
- User Uno config MUST set `separators: [':']` — Uno's dash-form variants eat `hover-3d`, `file-input*`, `link-*` (locked by `tests/separators.test.ts`; README quickstart).

## Communication rules

- Do not explain unless asked. Do not confirm/deny unless 100% sure. Fact-check against upstream `master`.
- If unsure, say "I don't know".
- No intro/outro fluff. Just do the task.
