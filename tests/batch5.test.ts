import { describe, expect, test } from 'bun:test'
import { createGenerator, presetUno } from 'unocss'
import { batch5Rules } from '../src/rules/batch5.ts'
import { batch5Shortcuts } from '../src/shortcuts/batch5.ts'
import type { CRule } from './compat.ts'
import {
  parseCss,
  resolveFor,
  resolveVars,
  themeVars,
  tvar,
  winningDecl,
} from './compat.ts'

// Batch 5 compatibility suite (steps, swap, tab, table, textarea, textrotate,
// timeline, toast, toggle, tooltip, validator).
//
// Strategy mirrors tests/compat.ts, but against a standalone batch5 preset
// (batch5 files are additive and NOT wired into src/index.ts):
// 1. Generate CSS for a class list with {batch5 shortcuts + rules} + presetUno().
// 2. Smoke: every public class yields non-empty CSS (solo, or in a realistic
//    combo for classes that only exist inside compound selectors).
// 3. Cascade: winningDecl/resolveFor against real theme variables for every
//    color wiring; rule-decl lookup + resolveVars where upstream selectors are
//    pseudo/compound-only (never statically matchable); sizes vs upstream numerics.

interface Opts {
  prefix?: string
  include?: string[]
  exclude?: string[]
}

const genCache = new Map<string, Awaited<ReturnType<typeof createGenerator>>>()

async function gen(opts: Opts = {}): Promise<Awaited<ReturnType<typeof createGenerator>>> {
  const k = JSON.stringify([opts.prefix ?? '', opts.include ?? [], opts.exclude ?? []])
  const hit = genCache.get(k)
  if (hit !== undefined) return hit
  const ctx = { prefix: opts.prefix ?? '', include: opts.include ?? [], exclude: opts.exclude ?? [] }
  const uno = await createGenerator({
    presets: [
      presetUno(),
      { name: 'batch5test', shortcuts: batch5Shortcuts(ctx), rules: batch5Rules(ctx) ?? [] },
    ],
  })
  genCache.set(k, uno)
  return uno
}

async function cssFor5(classes: string, opts: Opts = {}): Promise<string> {
  const uno = await gen(opts)
  const { css } = await uno.generate(classes, { preflights: false })
  return css
}

async function rulesFor(classes: string, opts: Opts = {}): Promise<CRule[]> {
  return parseCss(await cssFor5(classes, opts))
}

/** First rule having a selector that contains `sub` (and declaring `prop`). */
function findRule(rules: CRule[], sub: string, prop?: string): CRule | undefined {
  return rules.find(
    (r) =>
      r.selectors.some((s) => s.includes(sub)) &&
      (prop === undefined || r.decls.some(([p]) => p === prop)),
  )
}

function decl(rule: CRule | undefined, prop: string): string {
  const d = rule?.decls.find(([p]) => p === prop)?.[1]
  expect(d, `missing ${prop} in ${rule?.selectors.join(', ')}`).toBeDefined()
  return d ?? ''
}

// ─── smoke ───────────────────────────────────────────────────────────────────

const SOLO: Record<string, string[]> = {
  steps: [
    'steps', 'step-neutral', 'step-primary', 'step-secondary', 'step-accent',
    'step-info', 'step-success', 'step-warning', 'step-error',
    'steps-horizontal', 'steps-vertical',
  ],
  swap: ['swap', 'swap-on', 'swap-off', 'swap-indeterminate', 'swap-active', 'swap-rotate', 'swap-flip'],
  tab: [
    'tabs', 'tab', 'tab-content', 'tab-active', 'tab-disabled',
    'tabs-border', 'tabs-lift', 'tabs-top', 'tabs-bottom', 'tabs-box',
    'tabs-xs', 'tabs-sm', 'tabs-md', 'tabs-lg', 'tabs-xl',
  ],
  table: [
    'table', 'table-zebra', 'table-pin-rows', 'table-pin-cols',
    'table-xs', 'table-sm', 'table-md', 'table-lg', 'table-xl',
  ],
  textarea: [
    'textarea', 'textarea-ghost', 'textarea-neutral', 'textarea-primary',
    'textarea-secondary', 'textarea-accent', 'textarea-info', 'textarea-success',
    'textarea-warning', 'textarea-error',
    'textarea-xs', 'textarea-sm', 'textarea-md', 'textarea-lg', 'textarea-xl',
  ],
  textrotate: ['text-rotate'],
  timeline: [
    'timeline', 'timeline-box', 'timeline-start', 'timeline-middle', 'timeline-end',
    'timeline-compact', 'timeline-snap-icon', 'timeline-vertical', 'timeline-horizontal',
  ],
  toast: ['toast', 'toast-start', 'toast-center', 'toast-end', 'toast-top', 'toast-middle', 'toast-bottom'],
  toggle: [
    'toggle', 'toggle-primary', 'toggle-secondary', 'toggle-accent', 'toggle-neutral',
    'toggle-success', 'toggle-warning', 'toggle-info', 'toggle-error',
    'toggle-xs', 'toggle-sm', 'toggle-md', 'toggle-lg', 'toggle-xl',
  ],
  tooltip: [
    'tooltip', 'tooltip-open', 'tooltip-top', 'tooltip-bottom', 'tooltip-start',
    'tooltip-center', 'tooltip-end', 'tooltip-left', 'tooltip-right',
    'tooltip-primary', 'tooltip-secondary', 'tooltip-accent', 'tooltip-info',
    'tooltip-success', 'tooltip-warning', 'tooltip-error',
  ],
  validator: ['validator', 'validator-hint'],
}

describe('batch5 smoke', () => {
  for (const [component, classes] of Object.entries(SOLO)) {
    test(`${component}: every public class generates non-empty CSS`, async () => {
      for (const cls of classes) {
        const css = await cssFor5(cls)
        expect(css.length > 0, `${cls} generated empty CSS`).toBe(true)
        expect(css).not.toContain('@apply')
      }
    })
  }

  test('compound-only classes resolve in realistic combos', async () => {
    const steps = await cssFor5('steps step')
    expect(steps).toContain('.steps .step')
    const icon = await cssFor5('steps step-icon')
    expect(icon).toContain('.step-icon')
    const hover = await cssFor5('table row-hover')
    expect(hover).toContain('row-hover')
    const tip = await cssFor5('tooltip tooltip-content')
    expect(tip).toContain('.tooltip-content')
  })

  test('keyframes ride along with their components', async () => {
    expect(await cssFor5('toast')).toContain('@keyframes toast')
    expect(await cssFor5('text-rotate')).toContain('@keyframes rotator')
  })
})

// ─── steps ───────────────────────────────────────────────────────────────────

describe('steps', () => {
  test('base resets the counter', async () => {
    const rules = await rulesFor('steps')
    expect(winningDecl(rules, ['steps'], 'counter-reset')?.value).toBe('step')
    expect(winningDecl(rules, ['steps'], 'display')?.value).toBe('inline-grid')
  })

  test('step colors wire --step-bg/--step-fg to theme values', async () => {
    const colors = [
      ['step-neutral', 'neutral'], ['step-primary', 'primary'], ['step-secondary', 'secondary'],
      ['step-accent', 'accent'], ['step-info', 'info'], ['step-success', 'success'],
      ['step-warning', 'warning'], ['step-error', 'error'],
    ] as const
    for (const theme of ['light', 'dark'] as const) {
      const vars = await themeVars(theme)
      const rules = await rulesFor(
        'steps step-neutral step-primary step-secondary step-accent step-info step-success step-warning step-error',
      )
      for (const [cls, color] of colors) {
        const rule = findRule(rules, `.steps .${cls}:after`, '--step-bg')
        expect(rule, `${cls} rule`).toBeDefined()
        expect(resolveVars(decl(rule, '--step-bg'), vars)).toBe(tvar(vars, `--color-${color}`))
        expect(resolveVars(decl(rule, '--step-fg'), vars)).toBe(tvar(vars, `--color-${color}-content`))
      }
    }
  })

  test('orientations carry upstream geometry', async () => {
    const css = await cssFor5('steps-horizontal steps-vertical')
    expect(css).toContain('grid-auto-flow:row')
    expect(css).toContain('grid-template-columns:40px 1fr')
    expect(css).toContain('min-height:4rem')
    expect(css).toContain('[dir="rtl"]')
  })
})

// ─── swap ────────────────────────────────────────────────────────────────────

describe('swap', () => {
  test('base is an inline-grid switch', async () => {
    const rules = await rulesFor('swap')
    expect(winningDecl(rules, ['swap'], 'display')?.value).toBe('inline-grid')
    expect(winningDecl(rules, ['swap'], 'cursor')?.value).toBe('pointer')
  })

  test('checkbox hack + active switch + rotate/flip', async () => {
    const css = await cssFor5('swap swap-on swap-off swap-indeterminate swap-active swap-rotate swap-flip')
    expect(css).toContain('input:checked~.swap-on')
    expect(css).toContain('input:indeterminate~.swap-indeterminate')
    expect(css).toContain('backface-visibility:visible')
    expect(css).toContain('.swap-active .swap-off')
    expect(css).toContain('rotate:45deg')
    expect(css).toContain('rotate:-45deg')
    expect(css).toContain('rotateY(180deg)')
    expect(css).toContain('perspective:20rem')
    expect(css).toContain('prefers-reduced-motion')
  })
})

// ─── tab ─────────────────────────────────────────────────────────────────────

describe('tab', () => {
  test('container + tab frame vars', async () => {
    const rules = await rulesFor('tabs tab')
    expect(winningDecl(rules, ['tabs'], 'display')?.value).toBe('flex')
    expect(winningDecl(rules, ['tab'], '--tab-p')?.value).toBe('0.75rem')
    expect(winningDecl(rules, ['tab'], 'height')?.value).toBe('var(--tab-height)')
    expect(winningDecl(rules, ['tab'], 'display')?.value).toBe('inline-flex')
  })

  test('tab-content is hidden order-1 box', async () => {
    const rules = await rulesFor('tab-content')
    expect(winningDecl(rules, ['tab-content'], 'display')?.value).toBe('none')
    expect(winningDecl(rules, ['tab-content'], '--tabcontent-order')?.value).toBe('1')
  })

  test('tab-disabled is inert', async () => {
    const rules = await rulesFor('tab-disabled')
    expect(winningDecl(rules, ['tab-disabled'], 'pointer-events')?.value).toBe('none')
    expect(winningDecl(rules, ['tab-disabled'], 'opacity')?.value).toBe('0.4')
  })

  test('checked/active tabs reveal content', async () => {
    const css = await cssFor5('tab tab-active tab-content')
    expect(css).toContain('+.tab-content{display:block;}')
    expect(css).toContain('&:checked,&:is(label:has(:checked))')
    expect(css).toContain('label:has(:checked)')
  })

  test('variants keep upstream structure', async () => {
    const css = await cssFor5('tabs-border tabs-lift tabs-top tabs-bottom tabs-box')
    for (const needle of [
      '.tabs-border>.tab', '.tabs-lift>.tab', '.tabs-top>.tab',
      '.tabs-bottom>.tab', 'radial-gradient(circle at top left',
      'radial-gradient(circle at bottom left', '--tabcontent-order:0',
    ]) {
      expect(css, needle).toContain(needle)
    }
  })

  test('tabs-box active maps to base-100', async () => {
    const vars = await themeVars('dark')
    const rules = await rulesFor('tabs-box tab')
    const rule = findRule(rules, '.tabs-box>:is(input:checked)', 'background-color')
    expect(rule).toBeDefined()
    expect(resolveVars(decl(rule, 'background-color'), vars)).toBe(tvar(vars, '--color-base-100'))
  })

  test('sizes match upstream numeric values', async () => {
    const rules = await rulesFor('tabs-xs tabs-sm tabs-md tabs-lg tabs-xl tab')
    const expected: Record<string, [string, string, string]> = {
      'tabs-xs': ['calc(var(--size-field, 0.25rem) * 6)', '0.375rem', '0.75rem'],
      'tabs-sm': ['calc(var(--size-field, 0.25rem) * 8)', '0.5rem', '0.875rem'],
      'tabs-md': ['calc(var(--size-field, 0.25rem) * 10)', '0.75rem', '0.875rem'],
      'tabs-lg': ['calc(var(--size-field, 0.25rem) * 12)', '1rem', '1.125rem'],
      'tabs-xl': ['calc(var(--size-field, 0.25rem) * 14)', '1.25rem', '1.125rem'],
    }
    for (const [cls, [h, p, fs]] of Object.entries(expected)) {
      expect(winningDecl(rules, ['tabs', cls], '--tab-height')?.value).toBe(h)
      const rule = findRule(rules, `.${cls}>.tab`, '--tab-p')
      expect(decl(rule, '--tab-p')).toBe(p)
      expect(decl(rule, 'font-size')).toBe(fs)
    }
  })
})

// ─── table ───────────────────────────────────────────────────────────────────

describe('table', () => {
  test('base is separated with box radius', async () => {
    const rules = await rulesFor('table')
    expect(winningDecl(rules, ['table'], 'border-collapse')?.value).toBe('separate')
    expect(winningDecl(rules, ['table'], 'border-radius')?.value).toBe('var(--radius-box)')
    expect(winningDecl(rules, ['table'], 'font-size')?.value).toBe('0.875rem')
  })

  test('cells + head + row hover', async () => {
    const css = await cssFor5('table')
    expect(css).toContain('.table :where(th, td)')
    expect(css).toContain('padding-inline:1rem')
    expect(css).toContain('tr.row-hover')
    expect(css).toContain('@media (hover:hover)')
    expect(css).toContain('background-color:var(--color-base-200)')
  })

  test('zebra striping', async () => {
    const css = await cssFor5('table-zebra')
    expect(css).toContain('.table-zebra tbody tr:where(:nth-child(2n))')
    expect(css).toContain('background-color:var(--color-base-200)')
    expect(css).toContain('background-color:var(--color-base-300)')
  })

  test('pin rows + cols stick', async () => {
    const css = await cssFor5('table-pin-rows table-pin-cols')
    expect(css).toContain('position:sticky')
    expect(css).toContain('top:0')
    expect(css).toContain('bottom:0')
    expect(css).toContain('left:0')
    expect(css).toContain('right:0')
  })

  test('sizes match upstream numeric values', async () => {
    const rules = await rulesFor('table-xs table-sm table-md table-lg table-xl')
    const expected: Record<string, [string, string, string]> = {
      'table-xs': ['0.6875rem', '0.25rem', '0.5rem'],
      'table-sm': ['0.75rem', '0.5rem', '0.75rem'],
      'table-md': ['0.875rem', '0.75rem', '1rem'],
      'table-lg': ['1.125rem', '1rem', '1.25rem'],
      'table-xl': ['1.375rem', '1.25rem', '1.5rem'],
    }
    for (const [cls, [fs, pb, pi]] of Object.entries(expected)) {
      expect(findRule(rules, `.${cls} :not(thead, tfoot) tr`, 'font-size')?.decls.find(([p]) => p === 'font-size')?.[1]).toBe(fs)
      const cell = findRule(rules, `.${cls} :where(th, td)`)
      expect(decl(cell, 'padding-block')).toBe(pb)
      expect(decl(cell, 'padding-inline')).toBe(pi)
    }
  })
})

// ─── textarea ────────────────────────────────────────────────────────────────

describe('textarea', () => {
  test('base geometry', async () => {
    const rules = await rulesFor('textarea')
    expect(winningDecl(rules, ['textarea'], 'min-height')?.value).toBe('5rem')
    expect(winningDecl(rules, ['textarea'], 'width')?.value).toBe('clamp(3rem, 20rem, 100%)')
    expect(winningDecl(rules, ['textarea'], 'border-radius')?.value).toBe('var(--radius-field)')
  })

  test('ghost is transparent until focus', async () => {
    const vars = await themeVars('light')
    const rules = await rulesFor('textarea textarea-ghost')
    expect(winningDecl(rules, ['textarea', 'textarea-ghost'], 'background-color')?.value).toBe('#0000')
    // The focus block is a nested rule (not statically matchable); verify the
    // exact upstream wiring declarations in the emitted CSS instead.
    const css = await cssFor5('textarea textarea-ghost')
    expect(css).toContain('&:focus,&:focus-within{background-color:var(--color-base-100);color:var(--color-base-content);')
    expect(resolveVars('var(--color-base-content)', vars)).toBe(tvar(vars, '--color-base-content'))
  })

  for (const color of ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const) {
    test(`textarea-${color} wires --input-color to theme`, async () => {
      for (const theme of ['light', 'dark'] as const) {
        const vars = await themeVars(theme)
        const classes = ['textarea', `textarea-${color}`]
        const rules = await rulesFor(classes.join(' '))
        const w = winningDecl(rules, classes, '--input-color')
        expect(w).not.toBeNull()
        expect(resolveFor(rules, classes, vars, w?.value ?? '')).toBe(tvar(vars, `--color-${color}`))
      }
    })
  }

  test('sizes match upstream numeric values', async () => {
    const rules = await rulesFor('textarea textarea-xs textarea-sm textarea-md textarea-lg textarea-xl')
    const expected: Record<string, [string, string]> = {
      'textarea-xs': ['0.6875rem', '3'],
      'textarea-sm': ['0.75rem', '4'],
      'textarea-md': ['0.875rem', '5'],
      'textarea-lg': ['1.125rem', '6'],
      'textarea-xl': ['1.375rem', '7'],
    }
    for (const [cls, [fs, top]] of Object.entries(expected)) {
      expect(winningDecl(rules, ['textarea', cls], '--font-size-min')?.value).toBe(fs)
      const fl = findRule(rules, `.floating-label:has(.${cls})`, '--top-mul')
      expect(decl(fl, '--top-mul')).toBe(top)
      expect(decl(fl, '--font-size')).toBe(fs)
    }
  })
})

// ─── textrotate ──────────────────────────────────────────────────────────────

describe('textrotate', () => {
  test('base is a clipped inline block, exactly as upstream does', async () => {
    const rules = await rulesFor('text-rotate')
    expect(winningDecl(rules, ['text-rotate'], 'height')?.value).toBe('1lh')
    expect(winningDecl(rules, ['text-rotate'], 'display')?.value).toBe('inline-block')
    expect(winningDecl(rules, ['text-rotate'], 'overflow')?.value).toBe('hidden')
    const css = await cssFor5('text-rotate')
    expect(css).toContain('--items:6')
    expect(css).toContain('animation-play-state:paused')
  })
})

// ─── timeline ────────────────────────────────────────────────────────────────

describe('timeline', () => {
  test('base + boxes + slots', async () => {
    const vars = await themeVars('dark')
    const rules = await rulesFor('timeline timeline-box timeline-start timeline-middle timeline-end')
    expect(winningDecl(rules, ['timeline'], 'display')?.value).toBe('flex')
    const box = winningDecl(rules, ['timeline-box'], 'background-color')
    expect(resolveFor(rules, ['timeline-box'], vars, box?.value ?? '')).toBe(tvar(vars, '--color-base-100'))
    expect(winningDecl(rules, ['timeline-start'], 'grid-area')?.value).toBe('1/1/2/4')
    expect(winningDecl(rules, ['timeline-middle'], 'grid-column-start')?.value).toBe('2')
    expect(winningDecl(rules, ['timeline-end'], 'grid-area')?.value).toBe('3/1/4/4')
  })

  test('orientations + compact + snap keep upstream selectors', async () => {
    const css = await cssFor5('timeline-vertical timeline-horizontal timeline-compact timeline-snap-icon')
    for (const needle of [
      '.timeline-vertical>li', 'flex-direction:column', 'flex-direction:row',
      '.timeline-horizontal>li', '--timeline-row-start:0', '--timeline-col-start:0.5rem',
      'grid-area:1/1/4/2', 'place-self:center flex-end',
    ]) {
      expect(css, needle).toContain(needle)
    }
  })
})

// ─── toast ───────────────────────────────────────────────────────────────────

describe('toast', () => {
  test('base is fixed bottom-end width-capped', async () => {
    const rules = await rulesFor('toast')
    expect(winningDecl(rules, ['toast'], 'position')?.value).toBe('fixed')
    expect(winningDecl(rules, ['toast'], 'width')?.value).toBe('max-content')
    expect(winningDecl(rules, ['toast'], 'bottom')?.value).toBe('1rem')
  })

  test('positions set toast offsets', async () => {
    const rules = await rulesFor('toast-start toast-center toast-end toast-top toast-middle toast-bottom')
    const expected: Record<string, [string, string]> = {
      'toast-start': ['--toast-x', '0'],
      'toast-center': ['--toast-x', '-50%'],
      'toast-end': ['--toast-x', '0'],
      'toast-top': ['--toast-y', '0'],
      'toast-middle': ['--toast-y', '-50%'],
      'toast-bottom': ['--toast-y', '0'],
    }
    for (const [cls, [prop, val]] of Object.entries(expected)) {
      expect(winningDecl(rules, [cls], prop)?.value).toBe(val)
    }
    const css = await cssFor5('toast-center')
    expect(css).toContain(':dir(rtl)')
    expect(css).toContain('--toast-x:50%')
    expect(winningDecl(rules, ['toast-middle'], 'top')?.value).toBe('50%')
    expect(winningDecl(rules, ['toast-top'], 'top')?.value).toBe('1rem')
  })
})

// ─── toggle ──────────────────────────────────────────────────────────────────

describe('toggle', () => {
  test('base geometry', async () => {
    const rules = await rulesFor('toggle')
    expect(winningDecl(rules, ['toggle'], 'display')?.value).toBe('inline-grid')
    expect(winningDecl(rules, ['toggle'], 'grid-template-columns')?.value).toBe('0fr 1fr 1fr')
    expect(winningDecl(rules, ['toggle'], 'height')?.value).toBe('var(--size)')
  })

  test('states keep knob + focus + disabled', async () => {
    const css = await cssFor5('toggle')
    expect(css).toContain('.toggle:before')
    expect(css).toContain('background-color:currentColor')
    expect(css).toContain('.toggle:checked,.toggle[aria-checked=true],.toggle:has(>input:checked)')
    expect(css).toContain('grid-template-columns:1fr 1fr 0fr')
    expect(css).toContain('.toggle:indeterminate')
    expect(css).toContain('.toggle:disabled')
    expect(css).toContain('forced-colors')
  })

  for (const color of ['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'info', 'error'] as const) {
    test(`toggle-${color} wires checked --input-color to theme`, async () => {
      for (const theme of ['light', 'dark'] as const) {
        const vars = await themeVars(theme)
        const rules = await rulesFor(`toggle toggle-${color}`)
        const rule = findRule(rules, `.toggle-${color}:checked`, '--input-color')
        expect(rule, `${color} rule`).toBeDefined()
        expect(resolveVars(decl(rule, '--input-color'), vars)).toBe(tvar(vars, `--color-${color}`))
      }
    })
  }

  test('sizes match upstream numeric values', async () => {
    const rules = await rulesFor('toggle-xs toggle-sm toggle-md toggle-lg toggle-xl')
    const expected: Record<string, string> = {
      'toggle-xs': 'calc(var(--size-selector, 0.25rem) * 4)',
      'toggle-sm': 'calc(var(--size-selector, 0.25rem) * 5)',
      'toggle-md': 'calc(var(--size-selector, 0.25rem) * 6)',
      'toggle-lg': 'calc(var(--size-selector, 0.25rem) * 7)',
      'toggle-xl': 'calc(var(--size-selector, 0.25rem) * 8)',
    }
    for (const [cls, size] of Object.entries(expected)) {
      const rule = findRule(rules, `.${cls}:is([type=checkbox])`, '--size')
      expect(decl(rule, '--size')).toBe(size)
    }
  })
})

// ─── tooltip ─────────────────────────────────────────────────────────────────

describe('tooltip', () => {
  test('base vars point at neutral', async () => {
    const vars = await themeVars('dark')
    const rules = await rulesFor('tooltip')
    const bg = winningDecl(rules, ['tooltip'], '--tt-bg')
    expect(resolveFor(rules, ['tooltip'], vars, bg?.value ?? '')).toBe(tvar(vars, '--color-neutral'))
    const css = await cssFor5('tooltip')
    expect(css).toContain('.tooltip>.tooltip-content,.tooltip[data-tip]:before')
    expect(css).toContain('.tooltip:after')
    expect(css).toContain('mask-image:var(--mask-tooltip)')
  })

  test('open reveals bubble + tail', async () => {
    const css = await cssFor5('tooltip tooltip-open')
    expect(css).toContain('opacity:1')
    expect(css).toContain('--tt-pos:0rem')
  })

  test('positions keep upstream transforms', async () => {
    const rules = await rulesFor('tooltip-start tooltip-center tooltip-end')
    expect(winningDecl(rules, ['tooltip-start'], '--tt-trans')?.value).toBe('0')
    expect(winningDecl(rules, ['tooltip-center'], '--tt-trans')?.value).toBe('-50%')
    expect(winningDecl(rules, ['tooltip-end'], '--tt-tail-inset')?.value).toBe('auto var(--tt-tail-off)')
    const css = await cssFor5('tooltip-top tooltip-bottom tooltip-left tooltip-right')
    for (const needle of [
      '.tooltip-top>.tooltip-content', '.tooltip-bottom:after', 'rotate(180deg)',
      '.tooltip-left>.tooltip-content', 'rotate(-90deg)',
      '.tooltip-right>.tooltip-content', 'rotate(90deg)',
    ]) {
      expect(css, needle).toContain(needle)
    }
  })

  for (const color of ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const) {
    test(`tooltip-${color} wires bubble + text to theme`, async () => {
      for (const theme of ['light', 'dark'] as const) {
        const vars = await themeVars(theme)
        const classes = ['tooltip', `tooltip-${color}`]
        const rules = await rulesFor(classes.join(' '))
        const bg = winningDecl(rules, classes, '--tt-bg')
        expect(resolveFor(rules, classes, vars, bg?.value ?? '')).toBe(tvar(vars, `--color-${color}`))
        const text = findRule(rules, `.tooltip-${color}>.tooltip-content`, 'color')
        expect(resolveVars(decl(text, 'color'), vars)).toBe(tvar(vars, `--color-${color}-content`))
      }
    })
  }
})

// ─── validator ───────────────────────────────────────────────────────────────

describe('validator', () => {
  test('hint starts hidden', async () => {
    const rules = await rulesFor('validator-hint')
    expect(winningDecl(rules, ['validator-hint'], 'visibility')?.value).toBe('hidden')
    expect(winningDecl(rules, ['validator-hint'], 'font-size')?.value).toBe('0.75rem')
  })

  test(':user-valid/:user-invalid wire --input-color, verbatim selectors', async () => {
    const vars = await themeVars('light')
    const rules = await rulesFor('validator validator-hint')
    const ok = findRule(rules, ':is(.validator:user-valid,.validator:has(:user-valid))', '--input-color')
    expect(ok).toBeDefined()
    expect(resolveVars(decl(ok, '--input-color'), vars)).toBe(tvar(vars, '--color-success'))
    const bad = findRule(
      rules,
      ':is(.validator:user-invalid,.validator:has(:user-invalid),.validator[aria-invalid]:not([aria-invalid=false]),.validator:has([aria-invalid]:not([aria-invalid=false])))',
      '--input-color',
    )
    expect(bad).toBeDefined()
    expect(resolveVars(decl(bad, '--input-color'), vars)).toBe(tvar(vars, '--color-error'))
  })

  test('invalid reveals the hint, unhide wins from utilities layer', async () => {
    const vars = await themeVars('dark')
    const rules = await rulesFor('validator validator-hint')
    const hint = findRule(rules, ')~.validator-hint', 'visibility')
    expect(hint).toBeDefined()
    expect(decl(hint, 'visibility')).toBe('visible')
    expect(resolveVars(decl(hint, 'color'), vars)).toBe(tvar(vars, '--color-error'))
    const unhide = findRule(rules, ')~.validator-hint', 'display')
    expect(unhide?.layer).toBe('utilities')
    expect(decl(unhide, 'display')).toBe('revert-layer')
  })
})

// ─── tokens fixture ──────────────────────────────────────────────────────────

describe('batch5 tokens fixture', () => {
  // Every public class demoed in example/sections/batch5.html must generate CSS.
  // Compound-only classes (no standalone rule) are covered via realistic combos.
  test('tests/fixtures/batch5-tokens.json matches the demo and generates CSS', async () => {
    const url = new URL('./fixtures/batch5-tokens.json', import.meta.url)
    const tokens = (await Bun.file(url).json()) as string[]
    expect(Array.isArray(tokens)).toBe(true)
    expect(tokens.length).toBeGreaterThan(100)
    expect([...tokens].sort()).toEqual(tokens)
    const html = await Bun.file(new URL('../example/sections/batch5.html', import.meta.url)).text()
    const used = new Set<string>()
    for (const m of html.matchAll(/class="([^"]+)"/g)) {
      const cls = m[1]
      if (cls !== undefined) for (const t of cls.split(/\s+/)) if (t) used.add(t)
    }
    const demoed = [...used].filter(
      (t) =>
        /^(steps|step|swap|tabs|tab|table|textarea|text-rotate|timeline|toast|toggle|tooltip|validator|row-hover)/.test(
          t,
        ),
    )
    expect(new Set(tokens)).toEqual(new Set(demoed))
    const comboOnly: Record<string, string> = {
      step: 'steps step',
      'step-icon': 'steps step-icon',
      'row-hover': 'table row-hover',
      'tooltip-content': 'tooltip tooltip-content',
    }
    for (const tok of tokens) {
      const css = await cssFor5(comboOnly[tok] ?? tok)
      expect(css.length > 0, `${tok} generated empty CSS`).toBe(true)
    }
  })
})

// ─── prefix + include/exclude ────────────────────────────────────────────────

describe('batch5 prefix', () => {
  test('d- prefix renames every base selector without touching values', async () => {
    const opts = { prefix: 'd-' }
    for (const cls of [
      'd-steps', 'd-swap', 'd-tabs', 'd-tab', 'd-table', 'd-textarea',
      'd-text-rotate', 'd-timeline', 'd-toast', 'd-toggle', 'd-tooltip',
      'd-validator', 'd-validator-hint', 'd-tab-content',
    ]) {
      const css = await cssFor5(cls, opts)
      expect(css.length > 0, `${cls} empty`).toBe(true)
      expect(css).toContain(`.${cls}`)
    }
    const css = await cssFor5('d-toggle d-tooltip d-steps', opts)
    expect(css).toContain('.d-toggle:before')
    expect(css).toContain('.d-tooltip:after')
    expect(css).toContain('.d-steps .d-step')
    // Decimal values, svg payload and timings must survive prefixing intact.
    expect(css).not.toMatch(/\.d-\d/)
    expect(css).toContain('M0.500009')
    expect(css).toContain('cubic-bezier(0.4, 0, 0.2, 1)')
    expect(css).toContain('padding:0.125rem')
  })

  test('prefixed modifiers + states keep wiring', async () => {
    const opts = { prefix: 'd-' }
    const vars = await themeVars('dark')
    const classes = ['d-textarea', 'd-textarea-primary']
    const rules = await rulesFor(classes.join(' '), opts)
    const w = winningDecl(rules, classes, '--input-color')
    expect(resolveFor(rules, classes, vars, w?.value ?? '')).toBe(tvar(vars, '--color-primary'))
    const css = await cssFor5('d-toggle-primary', opts)
    expect(css).toContain('.d-toggle-primary:checked')
  })
})

describe('batch5 include/exclude', () => {
  test('exclude filters whole components', async () => {
    const css = await cssFor5('toggle toast', { exclude: ['toggle'] })
    expect(css).not.toContain('.toggle')
    expect(css).toContain('.toast')
  })

  test('include keeps only listed components', async () => {
    const css = await cssFor5('toggle toast steps', { include: ['toast'] })
    expect(css).not.toContain('.toggle')
    expect(css).not.toContain('.steps')
    expect(css).toContain('.toast')
  })
})
