import type { Preset } from 'unocss'

// Port of functions/generateColorRules.js:
// bg-*/text-*/border-* x breakpoints(sm..2xl, max-*) x states(hover/focus/active) x opacity(10..90)
// TODO(P4): generate rules programmatically instead of static CSS.
export function colorRules(_opts: { prefix: string }): Preset['rules'] {
  return []
}
