# docs/ — Option A full fork: chrome + content pipeline port

1:1 port of `saadeghi/daisyui@master` `packages/docs`, Tailwind swapped for
`unocss-preset-daisy`. Upstream ref for every file below is
`https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/docs/<path>`;
files marked **verbatim** are byte-identical to upstream at port time except
`$lib/`/`$components` import paths (identical aliases in `vite.config.js`).
No `tailwindcss` anywhere in this dir (`bun run inventory` equivalent:
`grep -ri tailwindcss docs/ --include='*.json' --include='*.js' --include='*.ts'`
must be empty outside this README).

Scaffold ownership: `package.json`, `svelte.config.js`, `vite.config.js`,
`uno.config.ts`, `src/app.css` (global.css port), `src/routes/+layout.svelte`
(drawer stub), `+page.svelte` belong to the scaffold track. This README
covers the **chrome + content pipeline** track (everything under
`src/components/`, `src/lib/`, `src/translation/`, the `(routes)` layout,
route servers, and `scripts/`).

## Mirrored upstream files

### Chrome components (`src/components/`) — daisy classes kept verbatim

| File | Upstream source | Notes |
|---|---|---|
| `ThemeChange.svelte` | `src/components/ThemeChange.svelte` | **verbatim**. CSS-agnostic (`theme-change` lib, `data-set-theme`, 4-dot preview, localStorage) — works as-is with the preset |
| `Navbar.svelte` | `src/components/Navbar.svelte` | **verbatim** (`navbar`, `btn btn-square btn-ghost drawer-button`, `tooltip`, `tabs tabs-border`, `tab tab-active`, `kbd`, `shadow-xs`, popover nav). Discount fetch already try/catch; `null` hides countdown |
| `Sidebar.svelte` | `src/components/Sidebar.svelte` | **verbatim** (`menu`, `menu-title`, `input input-ghost`, `kbd kbd-sm`) |
| `Search.svelte` | `src/components/Search.svelte` | **verbatim** (`modal max-md:modal-bottom`, `modal-box`, `input input-lg/lg:input-xl`, `btn btn-ghost btn-xs btn-square`, `badge badge-xs`, `loading loading-dots`, `rounded-box`). Fetches `/search.csv` (content-backed glob over real `.md` routes, same `parseSearchCsv` shape) |
| `Footer.svelte` | `src/components/Footer.svelte` | **verbatim** (`footer md:footer-horizontal`, `footer-title`, `link link-hover`, `join join-item`, `input`, `checkbox`, `mask mask-squircle`) |
| `Component.svelte` | `src/components/Component.svelte` | **verbatim** preview renderer (`tabs tabs-lift`, `tab`, `tab-content`, `preview`, `code-wrapper`, `use:prefixClassNames` `$$`→prefix store, `use:htmlToJsx`) |
| `ComponentPageTabs.svelte` | `src/components/ComponentPageTabs.svelte` | **verbatim** (`tabs tabs-lift`) |
| `Translate.svelte` | `src/components/Translate.svelte` | **verbatim** |
| `Clipboard.svelte` | `src/components/Clipboard.svelte` | **verbatim** (`btn btn-square btn-sm btn-neutral`) |
| `PrefixEdit.svelte` | `src/components/PrefixEdit.svelte` | **verbatim** (`tooltip`, `input input-bordered input-xs`) |
| `LangChange.svelte` | `src/components/LangChange.svelte` | **verbatim** (language dropdown over `i18n.svelte.js`) |
| `ChangelogMenu.svelte` | `src/components/ChangelogMenu.svelte` | **verbatim** |
| `DiscountCountdown.svelte` | `src/components/DiscountCountdown.svelte` | **verbatim** (uses local `discountCountdown.js`, no `svelte-countdown` dep) |
| `TopBanner.svelte` | `src/components/TopBanner.svelte` | **verbatim** (`alert`) |
| `LogoHorizontal.svelte` | `src/components/LogoHorizontal.svelte` | **verbatim** |
| `AlternativeSidebar.svelte` | `src/components/AlternativeSidebar.svelte` | **verbatim** (Carbon ad slot collapses when ads unavailable) |
| `ComponentFooter.svelte` | `src/components/ComponentFooter.svelte` | **verbatim** |
| `ComponentCopyDocsDropdown.svelte` | `src/components/ComponentCopyDocsDropdown.svelte` | **verbatim** |
| `BrowserSupport.svelte` | `src/components/BrowserSupport.svelte` | **verbatim** |
| `SEO.svelte` | `src/components/SEO.svelte` | **verbatim** |
| `Carbon.svelte` | `src/components/Carbon.svelte` | **verbatim** (ad script is external/optional; renders nothing offline) |

### Lib (`src/lib/`)

| File | Upstream source | Notes |
|---|---|---|
| `stores.js` | `src/lib/stores.js` | **verbatim** (`prefix` writable) |
| `actions.svelte.js` | `src/lib/actions.svelte.js` | **verbatim** (`prefixClassNames`, `htmlToJsx`) |
| `i18n.svelte.js` | `src/lib/i18n.svelte.js` | **verbatim** chunked lazy structure (`import.meta.glob`, 5 chunks, `?lang=` + `localStorage["lang"]`, English fallback) |
| `util.js` | `src/lib/util.js` | **verbatim** (`subString` powers i18n chunk discovery) |
| `searchCsv.js` | `src/lib/searchCsv.js` | **verbatim** (CSV serialize/parse + strict header check) |
| `storeDiscount.js` | `src/lib/storeDiscount.js` | **verbatim** (pure fetch/validate helpers; callers degrade to `null`) |
| `discountCountdown.js` | `src/lib/discountCountdown.js` | **verbatim** (dependency-free duration math) |
| `analytics.svelte.js` | `src/lib/analytics.svelte.js` | **adapted**: same `track(actionName)` signature; dynamic-imports `@minimal-analytics/ga4`, no-ops when absent (upstream hard-required it) |
| `themes.js` | `daisyui/functions/themeOrder` | **generated** (`bun run sync:themes`); 35-theme list with no `daisyui` dep |
| `external.js` | various (see header) | **new**: graceful-degrade for stats/discount/testimonials/ads/confetti → `null`/`[]`/no-op |
| `scripts/translationConfig.js` | `src/lib/scripts/translationConfig.js` | **verbatim** (drives `translate.js` remark plugin) |

### mdsvex pipeline (`src/lib/mdsvex/`)

| File | Upstream source | Notes |
|---|---|---|
| `mdsvex.config.js` | `src/lib/mdsvex/mdsvex.config.js` | **adapted**: same 10-transform order/options/layouts; highlighter init lazy with passthrough fallback (see below) |
| `visit.js`, `headingIds.js`, `heading-links.js`, `external-links.js`, `github-links.js`, `code-titles.js`, `render-component.js`, `translate.js`, `markdown-text.js`, `syntax-highlighter.js` | `src/lib/mdsvex/*` | **verbatim** (10 remark plugins + AST helper + highlighter re-export) |
| `highlighting/{index,renderer,textmate-engine}.js` | `src/lib/mdsvex/highlighting/*` | **verbatim** (engine needs `vscode-textmate` + `vscode-oniguruma`; NOT in package.json yet — config falls back) |
| `syntax-theme.json` | `src/lib/mdsvex/syntax-theme.json` | **verbatim** |
| `layout-{components,blog,docs,content,contentLanding}.svelte` | `src/lib/mdsvex/*` | **verbatim** |

### Routes

| File | Upstream source | Notes |
|---|---|---|
| `(routes)/+layout.svelte` | `src/routes/(routes)/+layout.svelte` | **verbatim** except `minimal-analytics` → `$lib/analytics.svelte.js` (drawer shell, oklch-fallback toast, Navbar/Sidebar/Search wiring) |
| `(routes)/+layout.server.js` | `src/routes/(routes)/+layout.server.js` | **adapted**: `themeOrder` from `$lib/themes.js`, stats via `$lib/external.js`, navigation from `$lib/data/navigation.yaml` (verbatim) + blog sidebar from `$lib/data/blogTags.js` (verbatim glob over vendored posts, `[]` fallback) |
| `search.csv/+server.js` | `src/routes/search.csv/+server.js` | **adapted**: upstream glob + `extractTableColumn` + heading index over real `.md` content through the same `$lib/searchCsv.js` serializer; store entries static (no `/store/` routes vendored — `$lib/server/content/store.js` toolchain stays out) |
| `sitemap.xml/+server.js` | `src/routes/sitemap.xml/+server.js` | **adapted**: hand-rolled XML graph over real routes (docs `.md` glob + changelog + skill slugs from `codingTools.js` + blog posts/tags/rss), no `super-sitemap` dep |
| `SKILL.md/+server.js` | `src/routes/SKILL.md/+server.js` | **adapted**: upstream glob-concat over repo-root `skills/` (vendored verbatim, 74 files); glob depth 5→4 for the flatter fork layout |
| `llms.txt/+server.js` | `src/routes/llms.txt/+server.js` | **adapted**: same as `SKILL.md` + verbatim runtime frontmatter transform (`source:`/`alwaysApply`/`applyTo:`) |
| `src/app.html` | `src/app.html` | **verbatim** (pre-hydration `data-theme` script — no FOUC) |
| `src/routes/+layout.js` | `src/routes/+layout.js` | **verbatim** (`prerender`, `trailingSlash: "always"`) |

### Docs-section content (`(routes)/docs/`, `(routes)/blog/`, `skills/`) — content track

| Path | Upstream source | Notes |
|---|---|---|
| `(routes)/docs/*/+page.md` (83 files, 20 subdirs + `+layout.svelte`) | `src/routes/(routes)/docs/*` | **verbatim**, frontmatter byte-identical (verified all 189 `.md`). EXCEPTION: `install/+page.md` — Tailwind-plugin instructions rewritten for the Uno port (`presetUno`+`presetDaisy`+`presetTypography`, `UnoCSS()` vite plugin, `separators:[':']`, `uno.css` + `themes` imports); frontmatter + framework grid + skill/MCP tail kept verbatim |
| `(routes)/docs/*/​+page.server.js` + `+layout.server.js` | same | `mcp/+layout.server.js`, `skill/+layout.server.js`, `skill/[slug]/+page.server.js` **verbatim** (local `codingTools.js` data). `install/+layout.server.js`, `cdn/+page.server.js`, `roadmap/+page.server.js` **adapted**: same data shape, empty offline values (`$lib/server/content/*` toolchain + API/disk deps not vendored) |
| `(routes)/docs/changelog/+page.svelte` | same | **verbatim** except `CHANGELOG.md` import depth 7→6 (fork root) + pointer `CHANGELOG.md` at repo root |
| `(routes)/docs/+layout.svelte`, `(routes)/blog/+layout.svelte` | same | **verbatim** except `global.css`→`app.css` (Uno port entry) |
| `(routes)/blog/` (33 posts + layout/page/tag/rss servers) | `src/routes/(routes)/blog/*` | **verbatim** (posts, `+layout.server.js`, `+page.server.js`, `tag/[tag]/`, `rss.xml`) |
| `src/lib/data/{navigation.yaml,blogTags.js,codingTools.js}` | `src/lib/data/*` | **verbatim** (wired into `(routes)/+layout.server.js`, sitemap, skill pages) |
| `src/components/ThemePreviews.svelte` | `src/components/ThemePreviews.svelte` | **verbatim** (needed by `docs/themes/`; `theme-change` dep already present) |
| `skills/` (repo root, 74 files) | repo-root `skills/` | **verbatim** vendored copy (lives outside `packages/docs` upstream too); backs `SKILL.md`/`llms.txt` |

### i18n (`src/translation/` — 27 langs × 5 chunks)

- `en.{common,home,docs,components,other}.json` — **verbatim** (source of truth).
- `de.{common,home,docs,components,other}.json` — **verbatim** (sample lang, fully translated).
- `fr + ja × 5 chunks` — **verbatim** from upstream `packages/docs/src/translation/` (fully translated, content keys 1:1 with en: 228 common + 136 home + 1743 docs + 677 components + 571 other; `__todo` dropped).
- Remaining 23 langs × 5 chunks — `{"__todo": true}` stubs with `__name/__code/__direction` metadata.
- `bun run lang:validate` enforces English key-sync for non-todo files, reports TODOs, exits 0. Fill order: `common` → route chunk → rest (upstream `lang:add` equivalent: copy en keys, translate values, drop `__todo`).

## themeOrder — verified

`src/theme/order.ts` (preset export) → `docs/scripts/syncThemes.js` →
`docs/src/lib/themes.js`. Chain verified two ways: the sync script itself
(order.ts array ≡ `themes.css` `--- name ---` banners, 35/35) and
`tests/docs-chrome.test.ts` (`themes.js` ≡ preset export ≡ banners).
Upstream order (`daisyui/functions/themeOrder.js`) matches verbatim.

## TODOs for incremental fill

1. **TODO(deps)**: `bun install` in `docs/` (adds `theme-change`, `mdsvex`, `js-yaml`; all other upstream docs deps stay OUT — see degrade table). Wire `mdsvexConfig` into `svelte.config.js` (upstream 3-line diff, noted in-file).
2. **TODO(highlight)**: vendor `highlighting/grammars.json` + `grammar-manifest.json` (1.8MB, deliberately omitted) + `vscode-textmate`/`vscode-oniguruma` for token-color parity.
3. **TODO(content)** — docs-section remainder LANDED (content track): `docs/*/` (20 subdirs + `+layout.svelte`, 92 files, 83 `.md` verbatim except `install/+page.md` Uno rewrite), `navigation.yaml` + `blogTags.js` + `codingTools.js` (verbatim), blog routes/tags/rss (33 posts, 7 tags), `search.csv` glob (148 indexed pages + 846 headings), hand-rolled sitemap graph (135 URLs), repo-root `skills/` (74 files) backing `SKILL.md`/`llms.txt`. REMAINING for other tracks: `(routes)/components/*/+page.md` (components track — 70 dirs already landing in parallel), marketing/store/blueprint/theme-generator routes + `$lib/server/content/*` toolchain (not vendored; cdn/roadmap/install servers degrade offline with the same data shape). Route entries above name their upstream originals.
4. **DONE(i18n)**: `fr` + `ja` filled fully (5 chunks each, verbatim upstream, `__todo` dropped; `bun run lang:validate` passes, 115 stubs = 23 langs remain). `translate.js` skips stub files per `translationConfig.js` until filled.
5. **DONE(api)**: `PUBLIC_DAISYUI_API_PATH` documented in `.env.example` with degrade table; verified offline (`external.js` → `null`/`[]`/no-op, `+layout.server.js` stats → `null`, Navbar discount try/catch → hidden, roadmap → `{ roadmap: [] }`). Everything renders without it.
6. **TODO(ads)**: Carbon slot + `@neoconfetti/svelte` + countup/countdown marketing widgets (all optional, stubbed in `external.js`).
