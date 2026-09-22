import type { Preset } from 'unocss'
import { DaisyOptions, resolveOptions } from './options.js'
import { layerOrder } from './layers.js'
import { basePreflights } from './preflights/base.js'
import { componentShortcuts } from './shortcuts/components.js'
import { componentRules } from './rules/components.js'
import { utilityRules } from './rules/utilities.js'
import { colorRules } from './rules/colors.js'
import { daisyTheme } from './theme/tokens.js'
import { daisyVariants } from './variants.js'

export type { DaisyOptions }

export function presetDaisy(userOptions: DaisyOptions = {}): Preset {
  const opts = resolveOptions(userOptions)
  return {
    name: 'unocss-preset-daisy',
    layers: layerOrder,
    preflights: basePreflights(opts),
    shortcuts: componentShortcuts(opts),
    rules: [...componentRules(opts), ...utilityRules(opts), ...colorRules(opts)],
    variants: daisyVariants(opts),
    theme: daisyTheme(opts),
  }
}

export default presetDaisy
