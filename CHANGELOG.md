# Changelog (fork pointer)

This repo is a one-time hard fork of
[`saadeghi/daisyui@v5.7.43`](https://github.com/saadeghi/daisyui) (UnoCSS
preset port — no upstream sync automation, never `"latest"`).

Upstream release history lives at
[`saadeghi/daisyui/CHANGELOG.md`](https://github.com/saadeghi/daisyui/blob/master/CHANGELOG.md).

The docs site renders that upstream changelog at `/docs/changelog/`
(`docs/src/routes/(routes)/docs/changelog/+page.svelte` imports this file).

## 5.7.0-uno.0 (2026-09-23)

First release. daisyUI v5.7.43 ported to UnoCSS — zero Tailwind.

- 61/61 components (6 core + 55 in 5 batches), 35 verbatim oklch themes
- `themeOrder` export, `theme-controller` + `data-theme` selectors intact
- Full `.prose` vars + `:where(code)` port; join `@scope` flattened; `separators: [':']` required
- Responsive/state variants wrap raw-string rules via `src/variantWrap.ts`
- Docs: 1:1 fork of upstream `packages/docs` (68 component pages, 20 docs
  sections, 33 blog posts, mdsvex + 4 filled i18n langs), deployed to GitHub Pages
- Marketing/SEO long-tail (`compare/`, `store/`, `blueprint/`, SEO families)
  intentionally out of scope; upstream drift stays at v5.7.43
