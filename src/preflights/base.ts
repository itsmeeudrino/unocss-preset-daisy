import type { Preset } from 'unocss'

// Port of packages/daisyui/src/base/*.css (7 files) @ daisyui v5.7.43.
// Upstream wraps these in `@layer base` at build time (see functions/generateRawStyles.js);
// the raw sources below contain no @layer wrappers (verified), so they are kept verbatim
// and attached to Uno's `base` layer instead. No tailwindcss import.

// packages/daisyui/src/base/properties.css (verbatim)
const properties = `@property --radialprogress {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 0%;
}

@property --aura-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
`

// packages/daisyui/src/base/reset.css (verbatim)
const reset = `/* a smaller version of Tailwind CSS 4 preflight.css - MIT License - Copyright (c) Tailwind Labs, Inc. */
*,
::after,
::backdrop,
::before,
::file-selector-button {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}

:host,
html {
  line-height: 1.5;
  font-family: var(
    --default-font-family,
    ui-sans-serif,
    system-ui,
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji"
  );
  -webkit-tap-highlight-color: #0000;
}

body {
  line-height: inherit;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

a {
  color: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
}

table {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}

::file-selector-button,
button,
input,
optgroup,
select,
textarea {
  font: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  letter-spacing: inherit;
  color: inherit;
  background: 0 0;
}

input:where(:not([type="button"], [type="reset"], [type="submit"])),
select,
textarea {
  border-width: 1px;
}

::file-selector-button,
button,
input:where([type="button"], [type="reset"], [type="submit"]) {
  appearance: button;
}

:-moz-focusring {
  outline: auto;
}

:-moz-ui-invalid {
  box-shadow: none;
}

::-webkit-search-decoration {
  -webkit-appearance: none;
}

menu,
ol,
ul {
  list-style: none;
}

textarea {
  resize: vertical;
}

::placeholder {
  opacity: 1;
  color: color-mix(in oklch, currentColor 50%, #0000);
}

audio,
canvas,
embed,
iframe,
img,
object,
svg,
video {
  display: block;
  vertical-align: middle;
}

img,
video {
  max-width: 100%;
  height: auto;
}
`

// packages/daisyui/src/base/rootcolor.css (verbatim)
const rootColor = `:root,
[data-theme] {
  background-color: var(--root-bg);
  color: var(--color-base-content);
}

:root {
  background-color: var(--page-scroll-bg, var(--root-bg));
}

:where(:root, [data-theme]) {
  --root-bg: var(--color-base-100);
}
`

// packages/daisyui/src/base/rootscrollgutter.css (verbatim)
const rootScrollgutter = `:root {
  --page-has-backdrop: var(--page-scroll-lock) 1;
  --page-scroll-bg: var(--page-scroll-lock)
    color-mix(in srgb, var(--root-bg, #0000), oklch(0% 0 0) calc(var(--page-has-backdrop, 0) * 40%));
  background-image: var(--page-scroll-lock)
    linear-gradient(var(--root-bg, #0000), var(--root-bg, #0000));

  transition: var(--page-scroll-lock) background-color 0.3s ease-out;
  animation: var(--page-scroll-lock) set-page-has-scroll forwards;
  animation-timeline: var(--page-scroll-lock) scroll();

  --page-has-scroll: initial;
  scrollbar-gutter: var(--page-has-scroll) var(--page-scroll-lock) stable;
}

@keyframes set-page-has-scroll {
  0%,
  to {
    --page-has-scroll: ;
  }
}
`

// packages/daisyui/src/base/rootscrolllock.css (verbatim)
const rootScrolllock = `:root {
  --page-scroll-lock: initial;
  --page-overflow: var(--page-scroll-lock) hidden;
}

/* force higher specificity */
:root:not(span) {
  overflow: var(--page-overflow);
}
`

// packages/daisyui/src/base/scrollbar.css (verbatim)
const scrollbar = `:root {
  scrollbar-color: color-mix(in oklch, currentColor 35%, #0000) #0000;
}
`

// packages/daisyui/src/base/svg.css (verbatim)
const svg = `:root {
  --fx-noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.34' numOctaves='4' stitchTiles='stitch'%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23a)' opacity='0.2'%3E%3C/rect%3E%3C/svg%3E");
}
`

export function basePreflights(_opts: { prefix: string }): Exclude<Preset['preflights'], undefined> {
  // Base selectors (:root, *, element resets) carry no component classes, so prefix does not apply.
  return [
    { layer: 'base', getCSS: () => properties },
    { layer: 'base', getCSS: () => reset },
    { layer: 'base', getCSS: () => rootColor },
    { layer: 'base', getCSS: () => rootScrollgutter },
    { layer: 'base', getCSS: () => rootScrolllock },
    { layer: 'base', getCSS: () => scrollbar },
    { layer: 'base', getCSS: () => svg },
  ]
}
