import type { Preset, Variant } from 'unocss'

// Port of upstream drawer `addVariant()` calls + responsive color states from
// `packages/daisyui/index.js` (and breakpoint widths from
// `functions/generateColorRules.js` -> `getBreakpointWidth()`).
//
// Drawer variants must stay top-level (cannot nest in layers) — see the
// upstream `index.js` comment ("drawer variants. Can not be nested in layers
// so defined here"). The same applies here: these are Uno `variants`, not
// layered rules.
//
// NOTE: state variants (`hover:`/`focus:`/`active:`/...) are NOT duplicated
// here — they come from `presetUno`. Color/utility rules in this preset emit
// plain declarations so those variants wrap them (passthrough). The responsive
// stubs below only take effect when `presetDaisy` is used standalone; in the
// recommended `[presetUno(), presetDaisy()]` setup, presetUno's breakpoints
// match first.
// TODO(P4-full): align standalone breakpoint widths with presetUno and verify
// no double `@media` nesting in composed mode.

type DaisyVariant = Variant<object>

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const separatorsOf = (ctx: { generator: { config: { separators?: unknown } } }): string => {
  const raw = (ctx.generator.config.separators ?? [':', '-']) as string | string[]
  return (Array.isArray(raw) ? raw : [raw]).map(escapeRegExp).join('|')
}

// Upstream `getBreakpointWidth()` in `functions/generateColorRules.js`.
const MIN_WIDTH: Record<string, string> = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
}

function drawerVariant(prefix: string, kind: 'open' | 'close'): DaisyVariant {
  // Upstream: addVariant(`${prefix}is-drawer-open`,
  //   `&:where(.${prefix}drawer-toggle:checked ~ .${prefix}drawer-side, ...)`)
  const name = `${prefix}is-drawer-${kind}`
  const toggle = `.${prefix}drawer-toggle${kind === 'open' ? ':checked' : ':not(:checked)'}`
  const scope = `${toggle} ~ .${prefix}drawer-side`
  return {
    name,
    match(matcher, ctx) {
      const m = matcher.match(new RegExp(`^${escapeRegExp(name)}(?:${separatorsOf(ctx as never)})`))
      if (!m) return
      const rest = matcher.slice(m[0].length)
      if (!rest) return
      return {
        matcher: rest,
        selector: (s: string) => `${s}:where(${scope}, ${scope} *)`,
      }
    },
  }
}

function responsiveVariant(bp: string, query: string): DaisyVariant {
  return {
    name: bp,
    match(matcher, ctx) {
      const m = matcher.match(new RegExp(`^${escapeRegExp(bp)}(?:${separatorsOf(ctx as never)})`))
      if (!m) return
      const rest = matcher.slice(m[0].length)
      if (!rest || rest === 'container') return
      return {
        matcher: rest,
        handle: (input, next) =>
          next({ ...input, parent: input.parent ? `${input.parent} $$ ${query}` : query }),
      }
    },
  }
}

export function daisyVariants(opts: { prefix: string }): Exclude<Preset['variants'], undefined> {
  const prefix = opts.prefix ?? ''
  const out: DaisyVariant[] = [drawerVariant(prefix, 'open'), drawerVariant(prefix, 'close')]
  for (const [bp, width] of Object.entries(MIN_WIDTH)) {
    out.push(responsiveVariant(bp, `@media (width >= ${width})`))
    out.push(responsiveVariant(`max-${bp}`, `@media (width < ${width})`))
  }
  return out
}
