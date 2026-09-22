import type { CSSEntries, Preset } from 'unocss'

// Port of `functions/generateColorRules.js`:
// `bg-*`/`text-*`/`border-*` x daisy color names x opacity (`/10`..`/90`).
// Upstream property map (`getStyleProperty()`), trimmed to the three color
// utilities this preset owns; the rest (fill/stroke/ring/...) stay with
// presetUno's theme bridge.
// TODO(P4-full): responsive (`sm:`..`2xl:`, `max-*`) + state (`hover:`/...) codegen
// parity with `generateResponsiveContent`/`generateStatesContent`. Those work
// today via passthrough: rules below emit plain declarations, so presetUno's
// `hover:`/`focus:`/`active:`/breakpoint variants wrap them (see snapshot tests).

export const DAISY_COLORS = [
  'base-100',
  'base-200',
  'base-300',
  'base-content',
  'primary',
  'primary-content',
  'secondary',
  'secondary-content',
  'accent',
  'accent-content',
  'neutral',
  'neutral-content',
  'info',
  'info-content',
  'success',
  'success-content',
  'warning',
  'warning-content',
  'error',
  'error-content',
] as const

const PROP_TO_CSS: Record<string, string> = {
  bg: 'background-color',
  text: 'color',
  border: 'border-color',
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function colorRules(opts: { prefix: string }): Preset['rules'] {
  const p = escapeRegExp(opts.prefix ?? '')
  const colors = DAISY_COLORS.join('|')
  // `bg-primary`, `text-base-content`, `border-error/50`, ...
  // Only daisy color names match here; presetUno keeps handling the rest
  // of the palette (red-500, ...), so the two presets compose.
  return [
    [
      new RegExp(`^${p}(bg|text|border)-(${colors})(?:\\/(\\d{1,3}))?$`),
      (match): CSSEntries | undefined => {
        const [, style, color, opacity] = match
        if (style === undefined || color === undefined) return
        const prop = PROP_TO_CSS[style]
        if (prop === undefined) return
        if (opacity !== undefined) {
          const n = Number(opacity)
          if (!Number.isInteger(n) || n < 0 || n > 100) return
          // Upstream `generateOpacityVariants()`:
          // `{prop}:color-mix(in oklab,var(--color-{c}){n}%,#0000);`
          return [[prop, `color-mix(in oklab, var(--color-${color}) ${n}%, #0000)`]]
        }
        return [[prop, `var(--color-${color})`]]
      },
      { layer: 'utilities' },
    ],
  ]
}
