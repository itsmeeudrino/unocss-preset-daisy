import type { Preset } from 'unocss'

// Port of packages/daisyui/src/base/*.css (7 files):
// properties.css, reset.css, rootcolor.css, rootscrollgutter.css,
// rootscrolllock.css, scrollbar.css, svg.css
// TODO(P2): paste expanded upstream CSS here, one preflight per file.
export function basePreflights(_opts: { prefix: string }): Preset['preflights'] {
  return [
    // { layer: 'base', getCSS: () => `/* rootcolor */` },
  ]
}
