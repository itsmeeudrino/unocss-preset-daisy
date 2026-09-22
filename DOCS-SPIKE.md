# daisyUI docs → UnoCSS preset: port spike

Date: 2026-09-22. Upstream ref: `saadeghi/daisyui@master` (docs), fork point `v5.7.43`.
Local preset: `/home/void/unocss-preset-daisy` (unocss `66.10.5`, Vite `8.3.0`, zero-Tailwind).
Method: `curl` against `raw.githubusercontent.com` + GitHub contents API only. No clone.

## 1. Inventory — docs stack, configs, integration points

### 1.1 `packages/docs/package.json` (full dep list)

```json
devDeps: @sveltejs/adapter-static 3.0.10, @sveltejs/kit 2.70.1,
  @sveltejs/vite-plugin-svelte 7.2.0, @tailwindcss/typography 0.5.20,
  daisyui workspace:*, json-diff 1.0.6, mdsvex 0.12.8, super-sitemap 2.0.6,
  svelte 5.56.8, theme-change 3.0.4, vite 8.1.5,
  vscode-oniguruma 2.0.1, vscode-textmate 9.3.2
deps: @minimal-analytics/ga4 1.8.7, @neoconfetti/svelte 2.2.2, culori 4.0.2,
  js-yaml 5.2.2, pako 3.0.1, svelte-countdown 1.1.2, svelte-countup 0.2.8
scripts: dev/build/preview (vite), test (bun test src),
  lang:add/prune/report/validate, verify:build (src/lib/scripts/verifyBuild.js)
engines: node >=20.18.1
```

Notable: **no direct `tailwindcss` dep in docs** — `tailwindcss@4.3.3` + `@tailwindcss/vite@4.3.3`
live in the **monorepo root** `package.json` devDeps and resolve into docs via Bun workspaces
(`workspaces: ["packages/*"]`, `packageManager: bun@1.4.0`).

### 1.2 Config files

| File | Contents |
|---|---|
| `packages/docs/vite.config.js` | `tailwindcss()` (`@tailwindcss/vite`) + `sveltekit()` plugins; `resolve.alias.$components → src/components` |
| `packages/docs/svelte.config.js` | `adapter-static` (`pages/assets: build`, `fallback: null` → fully prerendered); `preprocess: [mdsvexConfig]`; `extensions: [.svelte, ...mdsvexExtensions]`; a11y warn suppression |
| `packages/docs/src/routes/+layout.js` | `prerender = true`, `trailingSlash = "always"` |
| `packages/docs/src/app.html` | Pre-hydration inline script: `document.documentElement.setAttribute("data-theme", localStorage.getItem("theme"))`; Google fonts, manifest, icons |
| `packages/docs/src/global.css` | `@import "tailwindcss"`; `@source "./**/*.{html,js,svelte,ts,svx,md,json}"`; `@plugin "@tailwindcss/typography"`; `@plugin "daisyui" { themes: all }`; `@theme` font-title/sans/mono; ~560 lines docs-specific CSS (below) |
| `packages/docs/src/homepage.css` | Same shape but `@import "tailwindcss" source(none)` + **explicit `@source` allowlist** (layout, page, 16 named components, `components/homepage/**`) — perf scoping for the landing page |
| `packages/docs/.env` | `PUBLIC_DAISYUI_API_PATH=https://api.daisyui.com` |
| `packages/docs/AGENTS.md` | Svelte 5 runes only; translation chunk rules (see §1.5) |

`global.css` docs-specific blocks (must be carried over verbatim, they are Tailwind-independent
except where noted): `#carbon-responsive` ad styling; `.prose` tweaks (title font, code direction,
`lg:ps-8`, blockquote `:where` reset); `pre.syntax:focus-visible` uses **`@apply outline-base-300
outline-2 -outline-offset-4`** (only `@apply` in docs chrome — trivially expandable);
`.code-wrapper` + `.component-preview` (checkerboard `repeating-linear-gradient` preview bg,
`--radius-box` code radius); `.changelog-body`; `.syntax` token vars (`--syntax-bg/token/comment/
attr-name/attr-value/punctuation/added/deleted`, all `color-mix(in oklab, …)`); `.gallery-column-reveal`
uses **`@apply` ~15×** (`grid place-items-center`, `size-full`, `opacity-0/100`, `scale-100` —
all plain utilities, mechanically expandable); `@keyframes bounce-horizontal/reveal*`.

### 1.3 Theme switching

- **Not** `theme-controller` (that's only a documented component). Site chrome uses the
**`theme-change@3.0.4` npm package**: `src/components/ThemeChange.svelte` calls
`themeChange(false)` on mount; each theme row is `<button data-set-theme={theme}
data-act-class="[&_svg]:visible">` with a 4-dot preview (`data-theme={theme}` div +
`bg-base-content/primary/secondary/accent` dots) inside a `dropdown dropdown-end` popover.
- Persistence: `localStorage["theme"]` + the `app.html` pre-hydration script (avoids FOUC).
`theme-change` is **CSS-agnostic** (only sets `data-theme` attr) → works unchanged with our preset.
- Theme list comes from the daisyui package itself: `(routes)/+layout.server.js` imports
`daisyui/functions/themeOrder` + `daisyui/package.json` version. Port must re-export
`themeOrder` (or read it from our `themes.css`).

### 1.4 Layout / chrome components (daisy classes used)

- `(routes)/+layout.svelte`: `drawer` shell (`drawer-toggle`, `drawer-content`,
`drawer-side`, `drawer-overlay`, `lg:drawer-open`, `bg-base-100`, `max-w-[100rem]`);
`toast toast-center` + `alert alert-warning` oklch-fallback warning
(`[@supports(color:oklch(0%_0_0))]:hidden`); renders `Navbar`, `Sidebar`, `Search`.
- `Navbar.svelte`: `navbar`, `navbar-start/center`, `btn btn-square btn-ghost drawer-button`,
`tooltip tooltip-bottom before:content-[attr(data-tip)]`, `tabs tabs-border tabs-xs/xl:tabs-sm`,
`tab tab-active`, `kbd`, `shadow-xs`, `backdrop-blur-sm`; popover nav (`popovertarget`,
`anchor-name`, `position-anchor`); store-discount countdown tooltip.
- `Sidebar.svelte`: `menu` (+`menu-title`), `input input-ghost`, `kbd kbd-sm`.
- `Search.svelte`: `modal (max-md:modal-bottom)`, `modal-box`, `input input-lg/lg:input-xl`,
`btn btn-ghost btn-xs btn-square`, `badge badge-xs`, `loading loading-dots loading-xs`,
`rounded-box`; custom `has-[a:focus-visible]:`, `aria-selected:` selectors.
- `Footer.svelte`: `footer (md:footer-horizontal)`, `footer-title`, `link link-hover`,
`join join-item`, `input`, `checkbox`, `mask mask-squircle`.
- `Component.svelte` (preview renderer): `tabs tabs-lift`, `tab` (`[--tab-p:.75rem]`,
`checked:[--tab-bg:var(--color-neutral)]`), `tab-content`, `preview`, `code-wrapper`;
`use:prefixClassNames` (`$$` → prefix store) + `use:htmlToJsx` actions.
- Homepage (`(routes)/+page.svelte`, 2367 lines): `hero hero-content`, `card card-body
card-title`, `mockup-code/mockup-window`, `menu menu-title`, `alert`, `join join-item`,
`tooltip tooltip-accent`, `tabs`, heavy `btn` matrix.
- Heavy Tailwind-utility use throughout: `size-*`, `max-w-[100rem]`, `grid-cols-[auto]`,
`[mask-image:...]`, `*:[grid-area:1/1]`, `border-(length:--border)`, `outline-(length:--border)`,
`sm:/md:/lg:/xl:` responsive (incl. responsive daisy sizes like `sm:btn-sm`),
`rtl:` variants, `print:hidden`. All covered by `presetUno` except `prose` (needs typography).

### 1.5 Content structure, previews, i18n, API

- **Components**: `src/routes/(routes)/components/*/+page.md` — **one dir per component**
(71 entries: index + ~64 component pages + `+layout.svelte`), mdsvex markdown with frontmatter
`title/desc/source/layout/showComponentPageTabs/classnames/browserSupport`. Live examples are
real daisy HTML (`<button class="btn …">`) + fenced ` ```html ` blocks using the **`$$`
prefix placeholder** (`$$btn` → replaced at runtime from `$lib/stores.js` `prefix` writable,
edited via `PrefixEdit.svelte`). `ComponentPageTabs.svelte` (`tabs tabs-lift tabs-lg`) +
`Translate.svelte`, `Clipboard.svelte` (`btn btn-square btn-xs btn-neutral`, tooltips).
- **Docs**: `src/routes/(routes)/docs/*/` — 21 entries (`install/cdn/use/mcp/skill/plugin/
customize/config/colors/themes/layout-and-typography/utilities/base/cdn/changelog/editor/faq/
intro/roadmap/v5/upgrade`). `install/+page.md` teaches Tailwind-plugin install (would need
rewrite for a Uno port). `+layout.svelte` per section imports `../../../global.css`.
- **mdsvex pipeline** (`src/lib/mdsvex/mdsvex.config.js` + ~10 local remark plugins):
`syntax-highlighter.js` (textmate/oniguruma, `syntax-theme.json`), `render-component.js`,
`translate.js`, `github-links.js`, `code-titles.js`, `heading-links.js`, `external-links.js`.
Uno must scan `.md/.svx` (+ the `$$`-placeholder code fences won't match extractors — previews
render from the *live* HTML above the fence, so extraction still works, but verify).
- **i18n**: `src/translation/` — **135 files = 27 langs × 5 chunks**
(`<lang>.{common,home,docs,components,other}.json`; langs: ar bn ca cs de el en es fa fr he hu
id it ja ko ms pl pt ro ru tr uk ur vi zh_hans zh_hant). `src/lib/i18n.svelte.js`: chunked lazy
`import.meta.glob`, `?lang=` + `localStorage["lang"]`, English fallback; scripts
`lang:add/prune/report/validate` + root `bun run check` gates on `lang:validate`.
`AGENTS.md` mandates key-sync across all 27 langs per chunk.
- **External `daisyui-api`** (all optional-at-runtime, degrade gracefully): `+layout.server.js`
fetches `${PUBLIC_DAISYUI_API_PATH}/stats.json` (stargazers, 2-attempt retry → `null`);
`Navbar` → `storeDiscount.js` fetches `discount_shorttime/special.json`; root `+page.server.js`
fetches testimonials from `img.daisyui.com`; `search.csv/+server.js` + `searchCsv.js`;
`sitemap.xml` via `super-sitemap`; `SKILL.md`/`llms.txt` routes glob `../../../../../skills/`
(lives **outside** `packages/docs` — a fork must include `skills/` too); `Carbon.svelte` ads,
`@neoconfetti/svelte`, countdown/countup widgets on marketing pages.

### 1.6 UnoCSS + SvelteKit integration (version check)

- Installed `unocss@66.10.5` ships `@unocss/vite@66.10.5` (verified present in
`node_modules/@unocss/vite`). Its peer range is `vite: ^5 || ^6 || ^7 || ^8` → **compatible
with docs' Vite 8.1.5** (and our repo's Vite 8.3.0). `@unocss/preset-typography@66.10.5`
also present (replaces `@tailwindcss/typography`).
- Standard path (already proven by our `example/vite.config.ts` + `uno.config.ts`):
replace `tailwindcss()` with `UnoCSS()` in `vite.config.js`, add `uno.config.ts` with
`presetUno() + presetDaisy() + presetTypography()`, keep `$components` alias and
`adapter-static`. Svelte 5 runes are CSS-independent — no Svelte compat risk. Two config
details: (a) Uno's default extractor must include `.svelte/.md/.svx` (the Svelte extractor
handles `.svelte`; add `*.md/*.svx` content glob — our `example/` only proves `.html/.ts`);
(b) `homepage.css`'s explicit `@source` allowlist becomes Uno `content.pipeline` include
scoping (or just scan everything — docs build is static, correctness > build ms).

## 2. Gap analysis — what docs needs vs the preset

Docs chrome (shell) needs: `drawer*`, `navbar*`, `menu*`, `tabs/tab*`, `tooltip*`,
`modal*`, `toast*`, `alert*`, `btn*`, `badge*`, `input*`, `kbd*`, `link*`, `footer*`,
`join*`, `dropdown*`, `loading*`, `mask*`, `checkbox*`, `prose` + `theme-change` (JS, fine).

Previews need **all 61 components** (each component page renders live examples of itself).

Preset status measured 2026-09-22 (`shouldInclude("…")` in `src/shortcuts|rules/batch*.ts`,
`components.ts`): **39/61 component names present** — alert, aura, avatar, badge,
breadcrumbs, button, calendar, card, carousel, chat, checkbox, collapse, countdown, diff,
hovergallery, indicator, input, kbd, label, link, list, loading, mask, megamenu, menu,
mockup, modal, navbar, otp, progress, radialprogress, radio, range, rating, select,
skeleton, stack, stat, status (+ utilities join/glass/radius/typography-stub, colors,
35 themes).

**Missing 22/61** (no batch file yet): divider, dock, **drawer**, **dropdown**, fab,
fieldset, fileinput, filter, **footer**, hero, hover3d, steps, swap, **tab**, table,
textarea, textrotate, timeline, **toast**, toggle, **tooltip**, validator. (Bold = docs-shell
critical: without drawer/tabs/tooltip/toast/footer the layout itself renders unstyled.)

Covered-even-after-batches gaps (need work outside the 55-batch track):

1. `theme-controller` — not a component file; the hook `:root:has(input.theme-controller
[value="…"]:checked)` is **generated per-theme by `functions/themePlugin.js:22`**. Our
`src/theme/themes.css` must preserve these selectors verbatim (verify in snapshot), else the
theme-controller docs page demos silently stop working.
2. `typography` — ours is a **vars-only stub** (`src/rules/utilities.ts` TODO: nested
`:where(code)` etc.). Docs prose pages lean on `@tailwindcss/typography`; port needs
`@unocss/preset-typography` + parity check of `.prose` overrides in `global.css`.
3. `join` `@scope` descendants + `radius`/`glass` edge cases — flagged TODO in our
`utilities.ts`; docs previews exercise `join-item`, first/last radius vars.
4. `global.css` `@apply` sites (§1.2) — expand once (same inventory-script technique as P1).
5. `docs`-specific JS with no preset equivalent needed: `theme-change` lib works as-is;
`PrefixEdit`+`$$` placeholder system works as-is (pure Svelte), but **prefixed snapshots
must cover it** since every code sample flows through it.

## 3. Recommended approach

| Option | Verdict |
|---|---|
| A. Fork `packages/docs` 1:1, swap Tailwind→Uno | **Not recommended now.** Drags the full toolchain (mdsvex + 10 remark plugins, 135 i18n files with cross-lang sync gates, external API + testimonials + ads + sitemap/skill routes, `workspace:*-daisyui` + `skills/` dir coupling). Every upstream docs edit conflicts; build breaks until all 22 missing components land. |
| B. Minimal docs shell rebuild (new SvelteKit app, own routes) | **Recommended.** Scaffold a fresh Kit app reusing *only* `Navbar/Sidebar/Search/ThemeChange/Component` patterns + `global.css` docs blocks, with `UnoCSS()` + `presetDaisy()` + `presetTypography()`. Component pages generated from our own snapshot fixtures (we already render every component in `example/`+`tests/`). No mdsvex/i18n/API at first; add back incrementally. Validates the preset instead of the docs toolchain. |
| C. Wait for full 61/61 + typography, then fork | Viable fallback if goal is pixel-faithful docs. Cheapest in rework, but defers all integration learning and leaves Uno+SvelteKit+mdsvex risks undiscovered. |

Tradeoff reasoning: the docs' cost is 10% daisy classes / 90% content toolchain (i18n sync,
mdsvex AST plugins, external services). Option B captures the 10% that actually exercises our
preset (drawer/navbar/menu/tabs/tooltip/modal/toast shell + all-component previews) at a
fraction of the cost, and its `uno.config.ts` + extractor config become the reference for any
later full fork. Choose C only if the requirement is "official docs, Uno-powered" rather than
"docs that prove the preset works".

## 4. Effort estimate + blockers

T-shirt size: **B = M (1–2 weeks, one person)**; A = L–XL (4–8 weeks + ongoing toolchain tax);
C = S now, L later.

Stepwise plan (option B):

1. S (1–2d): scaffold Kit app (`adapter-static`, `svelte 5`, `vite 8`, `UnoCSS()` plugin,
`uno.config.ts`: `presetUno + presetDaisy({themes:'all'}) + presetTypography`); port
`app.html` theme script + `global.css` docs blocks with `@apply` expanded. Blocker: none.
2. M (2–3d): port shell `Navbar/Sidebar/Search/ThemeChange` (needs **drawer, tabs, tooltip,
toast, dropdown, footer** — either land those batches first or stub with static CSS).
3. M (3–5d): component gallery routes (generate from `tests/` fixtures, `$$`/prefix toggle
included); theme switcher against all 35 themes; `data-theme` + `theme-controller` checks.
4. S (1–2d): `prefers-color-scheme`, RTL (`fa/ar/he` smoke), `print:hidden`, responsive
`sm:btn-sm` matrix; `lang:validate`-free minimal i18n (or English-only + TODO).
5. S: cut over `example/` to the shell; document delta vs official docs (install page rewrite,
no API/stats/testimonials/ads).

Blockers, ordered: (1) **batch completion** — drawer/tabs/tooltip/toast/footer/toggle/dropdown
before shell looks right; (2) **typography parity** (stub → preset-typography + `.prose`
snapshot); (3) **theme-controller selector preservation** in `themes.css` (one-line verify);
(4) **extractor coverage** for `.svelte/.md/.svx` + `$$`-placeholder fences (test, not assumed);
(5) **scope decision** — i18n (27 langs) + `daisyui-api`/testimonials/ads are the long tail;
defer or mock. `theme-change`, Svelte 5 runes, Vite 8, adapter-static: no risk (verified above).
