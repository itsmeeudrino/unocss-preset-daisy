import type { Preset, StaticRule } from 'unocss'
import { shouldInclude } from '../options.js'

// Port of `packages/daisyui/src/utilities/*.css`: glass, join, radius, typography.
// Upstream `@apply` deps are expanded to raw CSS (see `scripts/inventory-apply.ts`):
//   inline-flex -> display:inline-flex, items-stretch -> align-items:stretch,
//   flex-col -> flex-direction:column, flex-row -> flex-direction:row.
//
// `join` base classes are fully working. `glass`/`radius` are verbatim ports
// (no `@apply` upstream). `typography` is a stub: `.prose` CSS vars only.
// TODO(P4-full): join `@scope` descendants (focus/hover z-index,
// first/last/only-child radius vars, `:not(:first-child)` negative margins),
// typography nested `:where(code)` block, `join-item` disabled/margin branches.

interface UtilityOpts {
  prefix: string
  include: string[]
  exclude: string[]
}

const LAYER = 'utilities'

function stat(key: string, body: Record<string, string>): StaticRule {
  return [key, body, { layer: LAYER }]
}

// `.prose` CSS vars, verbatim from upstream `src/utilities/typography.css`.
const PROSE_VARS: Record<string, string> = {
  '--tw-prose-body': 'color-mix(in oklab, var(--color-base-content) 80%, #0000)',
  '--tw-prose-headings': 'var(--color-base-content)',
  '--tw-prose-lead': 'var(--color-base-content)',
  '--tw-prose-links': 'var(--color-base-content)',
  '--tw-prose-bold': 'var(--color-base-content)',
  '--tw-prose-counters': 'var(--color-base-content)',
  '--tw-prose-bullets': 'color-mix(in oklab, var(--color-base-content) 50%, #0000)',
  '--tw-prose-hr': 'color-mix(in oklab, var(--color-base-content) 20%, #0000)',
  '--tw-prose-quotes': 'var(--color-base-content)',
  '--tw-prose-quote-borders': 'color-mix(in oklab, var(--color-base-content) 20%, #0000)',
  '--tw-prose-captions': 'color-mix(in oklab, var(--color-base-content) 50%, #0000)',
  '--tw-prose-code': 'var(--color-base-content)',
  '--tw-prose-pre-code': 'var(--color-neutral-content)',
  '--tw-prose-pre-bg': 'var(--color-neutral)',
  '--tw-prose-th-borders': 'color-mix(in oklab, var(--color-base-content) 50%, #0000)',
  '--tw-prose-td-borders': 'color-mix(in oklab, var(--color-base-content) 20%, #0000)',
  '--tw-prose-kbd': 'color-mix(in oklab, var(--color-base-content) 80%, #0000)',
}

export function utilityRules(opts: UtilityOpts): Preset['rules'] {
  const p = opts.prefix ?? ''
  const rules: StaticRule[] = []
  const inc = (name: string) => shouldInclude(name, opts.include ?? [], opts.exclude ?? [])

  if (inc('join')) {
    rules.push(
      stat(`${p}join`, {
        display: 'inline-flex',
        'align-items': 'stretch',
        '--join-ss': '0',
        '--join-se': '0',
        '--join-es': '0',
        '--join-ee': '0',
        '--join-ml': '0',
        '--join-mt': '0',
        '--join-v': '0',
        '--join-h': '1',
      }),
      stat(`${p}join-item`, {
        'border-style': 'solid',
        'border-width': 'var(--border, 1px)',
        'border-start-start-radius': 'var(--join-ss)',
        'border-start-end-radius': 'var(--join-se)',
        'border-end-start-radius': 'var(--join-es)',
        'border-end-end-radius': 'var(--join-ee)',
      }),
      stat(`${p}join-vertical`, {
        'flex-direction': 'column',
        '--join-v': '1',
        '--join-h': '0',
      }),
      stat(`${p}join-horizontal`, {
        'flex-direction': 'row',
        '--join-v': '0',
        '--join-h': '1',
      }),
    )
  }

  if (inc('glass')) {
    rules.push(
      stat(`${p}glass`, {
        border: 'none',
        'backdrop-filter': 'blur(var(--glass-blur, 40px))',
        'background-color': '#0000',
        'background-image':
          'linear-gradient(135deg, oklch(100% 0 0 / var(--glass-opacity, 30%)) 0%, oklch(0% 0 0 / 0%) 100%), ' +
          'linear-gradient(var(--glass-reflect-degree, 100deg), oklch(100% 0 0 / var(--glass-reflect-opacity, 5%)) 25%, oklch(0% 0 0 / 0%) 25%)',
        'box-shadow':
          '0 0 0 1px oklch(100% 0 0 / var(--glass-border-opacity, 20%)) inset, 0 0 0 2px oklch(0% 0 0 / 5%)',
        'text-shadow': '0 1px oklch(0% 0 0 / var(--glass-text-shadow-opacity, 5%))',
      }),
    )
  }

  if (inc('radius')) {
    const vars: Record<string, string> = {
      box: 'var(--radius-box)',
      field: 'var(--radius-field)',
      selector: 'var(--radius-selector)',
    }
    for (const [kind, v] of Object.entries(vars)) {
      rules.push(stat(`${p}rounded-${kind}`, { 'border-radius': v }))
    }
    const dirs: Record<string, string[]> = {
      t: ['border-top-left-radius', 'border-top-right-radius'],
      b: ['border-bottom-left-radius', 'border-bottom-right-radius'],
      l: ['border-top-left-radius', 'border-bottom-left-radius'],
      r: ['border-top-right-radius', 'border-bottom-right-radius'],
      tl: ['border-top-left-radius'],
      tr: ['border-top-right-radius'],
      br: ['border-bottom-right-radius'],
      bl: ['border-bottom-left-radius'],
    }
    for (const [kind, v] of Object.entries(vars)) {
      for (const [dir, props] of Object.entries(dirs)) {
        rules.push(stat(`${p}rounded-${dir}-${kind}`, Object.fromEntries(props.map((k) => [k, v]))))
      }
    }
  }

  if (inc('typography')) {
    // Stub: prose vars only. TODO(P4-full): nested `:where(code)` block.
    rules.push(stat(`${p}prose`, { ...PROSE_VARS }))
  }

  return rules
}
