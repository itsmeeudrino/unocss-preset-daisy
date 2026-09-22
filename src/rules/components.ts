import type { Preset } from 'unocss'

// Dynamic component rules: btn-xs/sm/lg, modal-open, dropdown-open, etc.
// TODO(P3): one rule per sized/modifier variant, ported from src/components/*.css
export function componentRules(_opts: { prefix: string }): Preset['rules'] {
  return []
}
