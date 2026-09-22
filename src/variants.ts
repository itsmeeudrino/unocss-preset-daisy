import type { Preset } from 'unocss'

// Port of upstream addVariant('is-drawer-open'/'is-drawer-close') + breakpoints.js.
// Drawer variants must stay top-level (cannot nest in layers) — see upstream index.js.
// TODO(P2/P4): implement responsive (sm..2xl, max-*) + hover/focus/active handling.
export function daisyVariants(_opts: { prefix: string }): Preset['variants'] {
  return [
    // (matcher) => ({ matcher, selector: ... })
  ]
}
