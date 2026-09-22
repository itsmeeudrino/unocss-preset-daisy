import type { Preset } from 'unocss'
import { resolveOptions } from './options.ts'
import type { DaisyOptions } from './options.ts'
import { layerOrder } from './layers.ts'
import { basePreflights } from './preflights/base.ts'
import { componentShortcuts } from './shortcuts/components.ts'
import { componentRules } from './rules/components.ts'
import { utilityRules } from './rules/utilities.ts'
import { DAISY_COLORS, colorRules } from './rules/colors.ts'
import { daisyTheme } from './theme/tokens.ts'
import { daisyVariants } from './variants.ts'

export type { DaisyOptions }

// Normalize the P2 theme bridge (`tokens.ts`) into Uno's `theme.colors` shape.
// Falls back to the `var(--color-*)` bridge so `bg-primary` etc. resolve even
// if tokens are partial.
function daisyThemeBridge(opts: { themes: string[] | false }): Record<string, unknown> {
  const fromTokens = (daisyTheme(opts) as unknown as Record<string, unknown>) ?? {}
  const nested = (fromTokens['colors'] ?? {}) as Record<string, unknown>
  const extended = ((fromTokens['extend'] ?? {}) as Record<string, unknown>)['colors'] ?? {}
  const fallback = Object.fromEntries(DAISY_COLORS.map((c) => [c, `var(--color-${c})`]))
  return { colors: { ...fallback, ...(extended as object), ...nested } }
}

export function presetDaisy(userOptions: DaisyOptions = {}): Preset {
  const opts = resolveOptions(userOptions)
  if (opts.logs) {
    const themes = opts.themes === false ? 'all' : opts.themes.join(',')
    // eslint-disable-next-line no-console
    console.log(
      `[unocss-preset-daisy] prefix=${JSON.stringify(opts.prefix)} themes=${themes} ` +
        `include=${opts.include.join(',') || '-'} exclude=${opts.exclude.join(',') || '-'}`,
    )
  }
  return {
    name: 'unocss-preset-daisy',
    layers: layerOrder,
    preflights: basePreflights(opts),
    shortcuts: componentShortcuts(opts),
    rules: [
      ...(componentRules(opts) ?? []),
      ...(utilityRules(opts) ?? []),
      ...(colorRules(opts) ?? []),
    ],
    variants: daisyVariants(opts),
    theme: daisyThemeBridge(opts),
  }
}

export default presetDaisy
