# FINALIZE — unocss-preset-daisy port completion plan

> Snapshot: master @ `778dd75` — 61/61 components wired, 592 tests green, tsc clean.
> This file is the resumption checklist. Work top to bottom; each workstream
> lists goal → files → verification. Do not skip the verification steps.

## 0. Resume here

```sh
cd /home/void/unocss-preset-daisy
git log --oneline -3          # expect 778dd75 on top
bun install
bun run check                 # build + lint + test; expect 592 pass / 0 fail
cd example && bun install && bun run build   # expect ✓ built, ~74KB+ CSS
```

Regenerate references if `/tmp` was wiped (all fetchable, nothing local-only):

```sh
curl -s https://cdn.jsdelivr.net/npm/daisyui@5.7.43/daisyui.css -o /tmp/daisy-ref.css
# per-component sources:
# https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/<name>.css
```

Upstream pin for everything below: **daisyUI v5.7.43** (`7fbfd0b`). One-time hard fork — no sync automation (locked decision).

## 1. What is done (do not redo)

- **61/61 components**: 6 core (`src/shortcuts/components.ts` 580 lines + `src/rules/components.ts` 519 lines: button, badge, card, input, modal, menu) + 55 in `src/{shortcuts,rules}/batch{1..5}.ts`, all wired in `src/index.ts` via `presetDaisy()`.
- **7 base files** → `src/preflights/base.ts`; **35 themes verbatim** → `src/theme/themes.css` + `theme.extend` bridge (`src/theme/tokens.ts`); **4 utilities** → `src/rules/utilities.ts`; **color rules** → `src/rules/colors.ts`; drawer/responsive variants → `src/variants.ts`.
- **3 Converter bugs found & fixed**: inverted daisy layer priority (now `base < daisy-l3 < daisy-l2 < daisy-l1 < components < utilities`, outer-wins per saadeghi/daisyui#4209), `applyPrefix` decimal/URL corruption (lookbehind fix in `src/options.ts`), stray `]` in btn selectors.
- **Hard requirement discovered**: `separators: [':']` in user Uno config — `hover-3d`, `file-input*`, `link-*` collide with Uno's dash-form variants (a 463-token sweep proved `file-input` rendered *wrong* styles, others empty). Enforced in: `tests/compat.ts` harness, `example/uno.config.ts`, README quickstart.
- **Tests**: 592 pass across 11 files (compat matrices resolve cascade+vars against real themes; 35-theme contract; example coverage gate over ~550 tokens; options/prefix unit tests; snapshot tests).
- **Example**: 66 sections (`example/index.html` + `example/sections/batch{1..5}.html`), builds clean.

## 2. Definition of done

1. `bun run check` green (build + `tsc --noEmit` + all tests).
2. Every workstream below verified per its own step.
3. `example/` visually matches daisyUI reference for all 61 components (human sign-off with screenshots, light + dark minimum).
4. Published `unocss-preset-daisy@5.7-uno.0` on npm with working install instructions tested from a blank project.
5. This file's workstreams all checked off.

## 3. Workstreams (in order)

### A. Batch deviation review (correctness sweep)

Each batch agent logged intentional deviations — re-verify the risky ones against `/tmp/daisy-ref.css` (compiled declarations per class):

| # | Location | Question to settle |
|---|---|---|
| A1 | `src/rules/batch5.ts` `.tab` | Emitted as plain `.tab`; upstream nests `.tab:is(.tabs>.tab)`. Confirm no observable difference (specificity/order) or re-nest. |
| A2 | `src/rules/batch2.ts` file-input `:disabled` in `daisy-l2` | P3 input keeps states in l1; batch2 put file-input `:disabled` in l2 "mirroring P3 input" — contradictory notes. Decide one rule, align both. |
| A3 | `src/rules/batch5.ts` validator-hint in `utilities` layer | Confirm intentional vs upstream comment; keep or move with justification comment. |
| A4 | batch3 `link :focus` (dropped `--tw-outline-style`/forced-colors), `mask-position:center` vs compiled `50%`, `grid-column/row:1/1` vs `grid-area`, `[dir=rtl]` quotes | Each is a source-vs-compiled normalization choice — spot-check 3 rendered cases or align to compiled form. |
| A5 | batch1 `diff` outline fallback (`, solid` added), `collapse-close` (no upstream rule — demo asserts style-less; keep or drop from demo/tokens). | Keep fallback; decide on collapse-close demo. |
| A6 | batch4 `rounded-full` as `calc(infinity*1px)` vs compiled `3.40282e38px` | Computed-identical; keep, but add comment citing equivalence. |
| A7 | batch5 `.tab` reveal-slice, `tabs-lifted`/`tooltip-neutral` absent upstream | Already verified absent — no action, note here as closed. |

Verify with: targeted `winningDecl`/`resolveFor` assertions added to the relevant `tests/batchN.test.ts` (not just eyeballing).

### B. Prefix-mode end-to-end (`prefix: 'd-'`)

Unit-tested at `applyPrefix` level only. With the decimal fix in, run the real thing:

1. `tests/prefix-e2e.test.ts` (new): build generator with `presetDaisy({ prefix: 'd-' })`, generate a matrix (`d-btn d-btn-primary`, `d-menu d-menu-active`, `d-card`, `d-input`, `d-join d-join-item`, `d-modal d-modal-box`, plus one batch token per batch file) and assert: no unprefixed `.btn`-style selectors leak, no `d-` inside values (`0.d-2`, `url()`, `oklch()` args), theme vars still resolve.
2. Example smoke: temporarily set prefix in `example/uno.config.ts`? No — instead generate the example token set with prefix in the test above and assert non-empty output per token.

### C. Composed-mode duplicate output (presetUno + presetDaisy)

P4 noted our color rules and presetUno's theme-bridge rules both fire for `bg-primary` etc. (harmless but noisy). Decide: keep (documented duplication, first-match-wins is deterministic) or narrow `src/rules/colors.ts` to daisy-only names already covered (it already is — then just document). Verify identical winning declarations either way; add one test locking the winner for `bg-primary text-accent border-error`.

Also resolve: `filter` component shadows presetUno's `filter` utility (same class name — upstream name, unavoidable). Document in README known-limitations; add test pinning OUR `filter` output when presetDaisy is composed (order-dependent — lock current behavior).

### D. Compat matrices beyond button/badge

`tests/compat-buttons/components` cover button/badge deeply; batches 1–5 carry their own cascade tests, but coverage is uneven. Extend `tests/compat-components.test.ts` (or per-batch files) with resolved-value matrices for: alert colors, chat bubbles, checkbox/radio/range/rating/select/textarea/toggle colors (fg+bg resolve to content/color vars, light+dark), tooltip colors, steps colors, table zebra (declaration-level), dropdown/modal/menu states. Reuse `resolveFor`/`themeVars` — no new harness needed.

### E. Visual sign-off (human)

Automated tests assert resolved values, not pixels. Required before release:

1. `cd example && bun run dev`, screenshot every section in **light + dark** (min).
2. Side-by-side against https://daisyui.com/components/ reference for the same classes. Known-good areas (button matrix, themes) get a quick pass; focus on complex components: calendar, carousel, drawer, dropdown, mask shapes, mockup-phone, rating, swap, timeline, toast positions, tooltip positions, modal placements.
3. File mismatches as GitHub issues in-repo (or fix directly if one-liners); link them here.

### F. Packaging & bundle

1. `dist/*.d.ts` generation (currently JS+CSS only). Bun-only constraint: generate via `bun build --external` + a `.d.ts` bundling step that stays in the Bun toolchain (document the choice in build.ts header).
2. `themes` option actually filters: today the whole 43KB `themes.css` ships regardless. Either implement subset emission or change the option to document current behavior. Do not leave the lie in the API.
3. `package.json`: verify `files`, `exports` (`./themes`), `peerDependencies`; `bun publish --dry-run`.
4. Size report: port the `wallace` script idea (`bunx wallace-cli` is npm-based — find a Bun-compatible CSS analyzer or record raw/gzip sizes of `dist/` in README).
5. `README.md`: blank-project install test (follow your own instructions in /tmp and confirm dev+build work), migration notes (Tailwind `@apply`→Uno, `@plugin`→`presetDaisy()`, `separators` requirement, `themes.css` import requirement), known limitations (filter shadowing, dash-variant loss, typography stub).

### G. Repo hygiene

1. No formatter is configured (P4 noted `prettier --check` fails repo-wide). Decide: add `bunx @biomejs/biome` (single binary, Bun-friendly) or document no-format policy. Apply whatever is decided to the whole tree once.
2. `AGENTS.md`/`PLAN.md` already updated for layers/separators — re-read after the above and fix drift.
3. Delete dead code found during review (e.g. stray `void applyPrefix;` if still present in `src/shortcuts/components.ts`).

### H. Release

1. Version `5.7-uno.0`, `CHANGELOG.md` (new file: port notes + known limitations + upgrade path from daisyUI).
2. `git tag v5.7-uno.0`, GitHub release with example screenshots.
3. `bun publish` (needs npm auth — human step).

### I. Docs shell rebuild (unblocks on A–E; spike at /tmp/daisy-docs-spike.md — COPY ESSENTIALS HERE since /tmp may vanish)

- Docs stack: SvelteKit 2 + Svelte 5 + Vite 8 + `@tailwindcss/vite` + `daisyui: workspace:*` + mdsvex + `@tailwindcss/typography` + `theme-change@3.0.4` + 27-lang i18n (135 JSON) + optional external `daisyui-api`.
- Theme switching is `theme-change` JS + `localStorage["theme"]` pre-hydration — CSS-agnostic, works as-is. Verified our `themes.css` carries all 35 `:root:has(input.theme-controller[value="…"]:checked)` selectors in upstream's exact format.
- Shell needs: drawer, tabs, tooltip, toast, footer, dropdown (all ported ✓); previews need all 61 (✓ after this plan).
- Remaining docs gaps: typography stub → real preset-typography, docs `global.css` `@apply` expansion, `.svelte/.md/.svx` extractor coverage.
- Recommendation: rebuild a minimal docs shell (M, 1–2 wks), NOT a 1:1 fork (L–XL). Uno 66's Vite plugin covers Vite 8 — standard `UnoCSS()` swap.

## 4. Known-issue log (fixed — regression-covered, do not regress)

| Issue | Fix | Test |
|---|---|---|
| White text on colored buttons (base beat modifiers) | Layer priority `base < daisy-l3 < daisy-l2 < daisy-l1` (outer-wins, #4209) | `compat-buttons` matrix |
| `applyPrefix` corrupted decimals/URLs | Lookbehind + letter-start regex | `options.test.ts` |
| `hover-3d`/`file-input*`/`link-*` eaten by dash variants | Require `separators: [':']` | sweep in CI? (see §5) |
| Stray `]` in btn `:active`/`:is` selectors | Removed, matches upstream | example `vite build` (lightningcss minify) |
| Missing theme vars in example | Import `unocss-preset-daisy/themes` | README documents both imports |

## 5. Suggested final CI (`bun run check` extension)

Current `check` = build + lint + test. Add when resuming: variant-sweep test (the 463-token script from integration — port `/tmp/sweep.ts` content into `tests/separators.test.ts` asserting exact-match generation under `[':']` for every fixture token) so future components can't reintroduce eaten classes silently.

## 6. Decisions needed from a human (not blockers for A–G)

1. Publish scope: npm public + GitHub release, or internal only?
2. `themes` option: implement subset emission (F.2) or document whole-file behavior?
3. Formatter: biome vs none (G.1)?
4. Docs shell: greenlight rebuild (I) after release, or defer?
5. `filter`-utility shadowing + dash-variant loss: accept + document (recommended), or invest more?
