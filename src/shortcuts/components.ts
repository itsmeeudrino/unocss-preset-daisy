import type { Preset } from 'unocss'
import { applyPrefix, shouldInclude } from '../options.js'

// Port of packages/daisyui/src/components/*.css (61 files).
// Static CSS goes here as shortcuts; sized/dynamic variants go in rules/components.ts.
// Rewrite rule: expand upstream `@apply` to raw CSS first (see scripts/inventory-apply.ts).
export function componentShortcuts(opts: { prefix: string; include: string[]; exclude: string[] }): Preset['shortcuts'] {
  const out: Preset['shortcuts'] = []
  // Example (TODO P3, verify against expanded button.css):
  // if (shouldInclude('button', opts.include, opts.exclude)) {
  //   out.push({ [applyPrefix('btn', opts.prefix)]: 'display:inline-flex;...' })
  // }
  void applyPrefix
  void shouldInclude
  void out
  return out
}
