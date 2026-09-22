import { describe, expect, test } from 'bun:test'
import { createGenerator } from 'unocss'
import type { Preset } from 'unocss'
import { presetUno } from 'unocss'
import { batch2Shortcuts } from '../src/shortcuts/batch2.ts'
import { batch2Rules } from '../src/rules/batch2.ts'
import { parseCss, resolveFor, resolveVars, themeVars, tvar, winningDecl } from './compat.ts'

// Batch 2 compatibility suite: divider, dock, drawer, dropdown, fab,
// fieldset, fileinput (.file-input), filter, footer, hero, hover3d (.hover-3d).
//
// Strategy mirrors tests/compat.ts: generate CSS through a standalone
// `{name:'batch2test', ...}` preset composed with presetUno(), emulate the
// cascade (winningDecl), and resolve var() chains against the real theme maps.
//
// NOTE on `separators: [':']`: presetUno registers `file:` and `hover:`
// variants that tokenize on `-`. Under the default `[':', '-']` separators,
// `file-input*` and `hover-3d` are peeled as variant+body before shortcut/rule
// matching ever sees them, so they generate nothing. Restricting the *test*
// generator to ':' keeps every colon-variant working while letting those two
// classes match literally. Full presetDaisy composition inherits the same
// hazard (see report); `d-`-prefixed usage is immune.

interface Batch2Opts {
  prefix: string
  include: string[]
  exclude: string[]
}

const baseOpts: Batch2Opts = { prefix: '', include: [], exclude: [] }

const cssCache = new Map<string, string>()

async function cssForBatch2(classes: string, opts: Batch2Opts = baseOpts): Promise<string> {
  const cacheKey = `${opts.prefix}|${opts.include.join(',')}|${opts.exclude.join(',')}|${classes}`
  const hit = cssCache.get(cacheKey)
  if (hit !== undefined) return hit
  const testPreset: Preset = {
    name: 'batch2test',
    separators: [':'],
    shortcuts: batch2Shortcuts(opts),
    rules: batch2Rules(opts) ?? [],
  }
  const uno = await createGenerator({ presets: [presetUno(), testPreset] })
  const { css } = await uno.generate(classes, { preflights: false })
  cssCache.set(cacheKey, css)
  return css
}

async function smoked(token: string, opts: Batch2Opts = baseOpts): Promise<void> {
  const input = `${opts.prefix}${token}`
  const css = await cssForBatch2(input, opts)
  expect(css, `expected CSS for .${input}`).toContain(`.${input}`)
  expect(css.length, `non-empty CSS for .${input}`).toBeGreaterThan(0)
}

// ─── divider ────────────────────────────────────────────────────────────────

const DIVIDER_TOKENS = [
  'divider',
  'divider-horizontal',
  'divider-vertical',
  'divider-neutral',
  'divider-primary',
  'divider-secondary',
  'divider-accent',
  'divider-success',
  'divider-warning',
  'divider-info',
  'divider-error',
  'divider-start',
  'divider-end',
]

const DIVIDER_COLORS = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'info',
  'error',
] as const

describe('divider', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of DIVIDER_TOKENS) await smoked(t)
  })

  test('base is a stretched flex row with themed line color', async () => {
    const rules = parseCss(await cssForBatch2('divider'))
    expect(winningDecl(rules, ['divider'], 'display')?.value).toBe('flex')
    expect(winningDecl(rules, ['divider'], 'height')?.value).toBe('1rem')
    expect(winningDecl(rules, ['divider'], 'flex-direction')?.value).toBe('row')
    expect(winningDecl(rules, ['divider'], 'margin')?.value).toBe('var(--divider-m, 1rem 0)')
    const css = await cssForBatch2('divider')
    expect(css).toContain('height:0.125rem')
    expect(css).toContain('flex-grow:1')
    expect(css).toContain('gap:1rem')
    expect(css).toContain('@media print')
  })

  test('orientations flip axis and margins', async () => {
    const rules = parseCss(await cssForBatch2('divider divider-horizontal divider-vertical'))
    expect(winningDecl(rules, ['divider-horizontal'], '--divider-m')?.value).toBe('0 1rem')
    expect(winningDecl(rules, ['divider-vertical'], '--divider-m')?.value).toBe('1rem 0')
    const css = await cssForBatch2('divider divider-horizontal divider-vertical')
    expect(css).toContain('.divider-horizontal.divider')
    expect(css).toContain('flex-direction:column')
    expect(css).toContain('width:1rem')
    expect(css).toContain('.divider-vertical.divider')
    expect(css).toContain('flex-direction:row')
  })

  test('line colors resolve to theme colors', async () => {
    const vars = await themeVars('light')
    const rules = parseCss(await cssForBatch2('divider ' + DIVIDER_COLORS.map((c) => `divider-${c}`).join(' ')))
    for (const color of DIVIDER_COLORS) {
      const rule = rules.find((r) => r.selectors.some((s) => s === `.divider-${color}:before`))
      expect(rule, `rule for divider-${color}`).toBeDefined()
      const bg = rule?.decls.find(([p]) => p === 'background-color')?.[1]
      expect(resolveVars(bg ?? '', vars)).toBe(tvar(vars, `--color-${color}`))
    }
  })

  test('start/end hide one line', async () => {
    const rules = parseCss(await cssForBatch2('divider divider-start divider-end'))
    const start = rules.find((r) => r.selectors.some((s) => s === '.divider-start:before'))
    const end = rules.find((r) => r.selectors.some((s) => s === '.divider-end:after'))
    expect(start?.decls.find(([p]) => p === 'display')?.[1]).toBe('none')
    expect(end?.decls.find(([p]) => p === 'display')?.[1]).toBe('none')
  })
})

// ─── dock ───────────────────────────────────────────────────────────────────

const DOCK_TOKENS = ['dock', 'dock-label', 'dock-active', 'dock-xs', 'dock-sm', 'dock-md', 'dock-lg', 'dock-xl']

describe('dock', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of DOCK_TOKENS) await smoked(t)
  })

  test('base is a fixed bottom bar with safe-area height', async () => {
    const rules = parseCss(await cssForBatch2('dock'))
    const classes = ['dock']
    expect(winningDecl(rules, classes, 'position')?.value).toBe('fixed')
    expect(winningDecl(rules, classes, 'bottom')?.value).toBe('0')
    expect(winningDecl(rules, classes, 'z-index')?.value).toBe('1')
    expect(winningDecl(rules, classes, 'background-color')?.value).toBe('var(--color-base-100)')
    expect(winningDecl(rules, classes, 'height')?.value).toContain('calc(4rem + env(safe-area-inset-bottom))')
    const css = await cssForBatch2('dock')
    expect(css).toContain('max-width:8rem')
    expect(css).toContain('flex-basis:100%')
    expect(css).toContain('opacity:0.8')
  })

  test('sizes match upstream heights and label sizes', async () => {
    const sizes: Array<[string, string, string]> = [
      ['dock-xs', '3rem', '0.625rem'],
      ['dock-sm', '3.5rem', '0.625rem'],
      ['dock-md', '4rem', '0.6875rem'],
      ['dock-lg', '4.5rem', '0.6875rem'],
      ['dock-xl', '5rem', '0.75rem'],
    ]
    const rules = parseCss(await cssForBatch2(sizes.map(([s]) => s).join(' ')))
    for (const [name, h, labelFs] of sizes) {
      expect(winningDecl(rules, [name], 'height')?.value).toContain(`calc(${h} + env(safe-area-inset-bottom))`)
      const label = rules.find((r) => r.selectors.some((s) => s === `.${name} .dock-label`))
      expect(label?.decls.find(([p]) => p === 'font-size')?.[1], `${name} label`).toBe(labelFs)
    }
    const xsAfter = rules.find((r) => r.selectors.some((s) => s.includes('.dock-xs') && s.includes(':after')))
    expect(xsAfter?.decls.find(([p]) => p === 'bottom')?.[1]).toBe('-0.1rem')
    const lgAfter = rules.find((r) => r.selectors.some((s) => s.includes('.dock-lg') && s.includes(':after')))
    expect(lgAfter?.decls.find(([p]) => p === 'bottom')?.[1]).toBe('0.4rem')
  })

  test('active indicator and base label', async () => {
    const rules = parseCss(await cssForBatch2('dock dock-label dock-active'))
    const active = rules.find((r) => r.selectors.some((s) => s === '.dock-active:after'))
    expect(active?.decls.find(([p]) => p === 'width')?.[1]).toBe('2.5rem')
    expect(active?.decls.find(([p]) => p === 'background-color')?.[1]).toBe('currentColor')
    const label = rules.find((r) => r.selectors.some((s) => s.endsWith('.dock-label') && s.includes('> *:not(')))
    expect(label?.decls.find(([p]) => p === 'font-size')?.[1]).toBe('0.6875rem')
  })
})

// ─── drawer ─────────────────────────────────────────────────────────────────

const DRAWER_TOKENS = ['drawer', 'drawer-content', 'drawer-side', 'drawer-overlay', 'drawer-toggle', 'drawer-end', 'drawer-open']

describe('drawer', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of DRAWER_TOKENS) await smoked(t)
  })

  test('drawer/content/side/toggle base values', async () => {
    const rules = parseCss(await cssForBatch2('drawer drawer-content drawer-side drawer-toggle'))
    expect(winningDecl(rules, ['drawer'], 'display')?.value).toBe('grid')
    expect(winningDecl(rules, ['drawer'], 'grid-auto-columns')?.value).toBe('max-content auto')
    expect(winningDecl(rules, ['drawer-content'], 'grid-column-start')?.value).toBe('2')
    expect(winningDecl(rules, ['drawer-side'], 'visibility')?.value).toBe('hidden')
    expect(winningDecl(rules, ['drawer-side'], 'position')?.value).toBe('fixed')
    expect(winningDecl(rules, ['drawer-side'], 'opacity')?.value).toBe('0')
    expect(winningDecl(rules, ['drawer-toggle'], 'position')?.value).toBe('fixed')
    expect(winningDecl(rules, ['drawer-toggle'], 'appearance')?.value).toBe('none')
    const css = await cssForBatch2('drawer drawer-content drawer-side drawer-toggle')
    expect(css).toContain('height:100dvh')
    expect(css).toContain('translate:-100%')
    expect(css).toContain('--page-scroll-lock')
  })

  test('overlay, end placement and open state', async () => {
    const rules = parseCss(await cssForBatch2('drawer drawer-overlay drawer-end drawer-open drawer-toggle drawer-side drawer-content'))
    const overlay = rules.find((r) => r.selectors.some((s) => s === '.drawer-side > .drawer-overlay'))
    expect(overlay?.decls.find(([p]) => p === 'position')?.[1]).toBe('sticky')
    expect(overlay?.decls.find(([p]) => p === 'background-color')?.[1]).toBe('oklch(0% 0 0 / 40%)')
    expect(winningDecl(rules, ['drawer-end'], 'grid-auto-columns')?.value).toBe('auto max-content')
    const css = await cssForBatch2('drawer-open drawer-toggle drawer-side drawer-overlay')
    expect(css).toContain('.drawer-open > .drawer-toggle{display:none;}')
    expect(css).toContain('translate:0%')
    expect(css).toContain('scrollbar-color:revert-layer')
  })
})

// ─── dropdown ───────────────────────────────────────────────────────────────

const DROPDOWN_TOKENS = [
  'dropdown',
  'dropdown-content',
  'dropdown-open',
  'dropdown-close',
  'dropdown-hover',
  'dropdown-start',
  'dropdown-center',
  'dropdown-end',
  'dropdown-left',
  'dropdown-right',
  'dropdown-top',
  'dropdown-bottom',
]

describe('dropdown', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of DROPDOWN_TOKENS) await smoked(t)
  })

  test('base anchor positioning and content hook', async () => {
    const rules = parseCss(await cssForBatch2('dropdown dropdown-content'))
    expect(winningDecl(rules, ['dropdown'], 'display')?.value).toBe('inline-block')
    expect(winningDecl(rules, ['dropdown'], 'position')?.value).toBe('relative')
    expect(winningDecl(rules, ['dropdown'], 'position-area')?.value).toBe(
      'var(--anchor-v, block-end) var(--anchor-h, span-inline-end)',
    )
    const content = rules.find(
      (r) => r.selectors.length === 1 && r.selectors[0] === '.dropdown .dropdown-content',
    )
    expect(content?.decls.find(([p]) => p === 'position')?.[1]).toBe('absolute')
    const css = await cssForBatch2('dropdown dropdown-content')
    expect(css).toContain('@keyframes dropdown')
    expect(css).toContain('outline-style:none')
  })

  test('placements set anchors and content geometry', async () => {
    const classes = ['dropdown-start', 'dropdown-center', 'dropdown-end', 'dropdown-left', 'dropdown-right', 'dropdown-top', 'dropdown-bottom']
    const rules = parseCss(await cssForBatch2(classes.join(' ')))
    expect(winningDecl(rules, ['dropdown-start'], '--anchor-h')?.value).toBe('span-inline-end')
    expect(winningDecl(rules, ['dropdown-center'], '--anchor-h')?.value).toBe('center')
    expect(winningDecl(rules, ['dropdown-end'], '--anchor-h')?.value).toBe('span-inline-start')
    expect(winningDecl(rules, ['dropdown-left'], '--anchor-h')?.value).toBe('left')
    expect(winningDecl(rules, ['dropdown-right'], '--anchor-h')?.value).toBe('right')
    expect(winningDecl(rules, ['dropdown-top'], '--anchor-v')?.value).toBe('block-start')
    expect(winningDecl(rules, ['dropdown-bottom'], '--anchor-v')?.value).toBe('block-end')
    const left = rules.find((r) => r.selectors.some((s) => s === '.dropdown-left .dropdown-content'))
    expect(left?.decls.find(([p]) => p === 'inset-inline-end')?.[1]).toBe('100%')
    expect(left?.decls.find(([p]) => p === 'transform-origin')?.[1]).toBe('100%')
    const top = rules.find((r) => r.selectors.some((s) => s === '.dropdown-top .dropdown-content'))
    expect(top?.decls.find(([p]) => p === 'transform-origin')?.[1]).toBe('bottom')
    expect(top?.decls.find(([p]) => p === 'bottom')?.[1]).toBe('100%')
  })

  test('open shows, close hides', async () => {
    const rules = parseCss(await cssForBatch2('dropdown dropdown-open dropdown-close dropdown-hover dropdown-content'))
    const shown = rules.find((r) => r.selectors.some((s) => s.includes('.dropdown-open .dropdown-content')))
    expect(shown?.decls.find(([p]) => p === 'opacity')?.[1]).toBe('1')
    const hidden = rules.find((r) => r.selectors.some((s) => s === '.dropdown.dropdown-close .dropdown-content'))
    expect(hidden?.decls.find(([p]) => p === 'display')?.[1]).toBe('none')
    expect(hidden?.decls.find(([p]) => p === 'scale')?.[1]).toBe('95%')
  })
})

// ─── fab ────────────────────────────────────────────────────────────────────

const FAB_TOKENS = ['fab', 'fab-close', 'fab-main-action', 'fab-flower']

describe('fab', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of FAB_TOKENS) await smoked(t)
  })

  test('base pins to the viewport corner', async () => {
    const rules = parseCss(await cssForBatch2('fab'))
    expect(winningDecl(rules, ['fab'], 'position')?.value).toBe('fixed')
    expect(winningDecl(rules, ['fab'], 'bottom')?.value).toBe('1rem')
    expect(winningDecl(rules, ['fab'], 'inset-inline-end')?.value).toBe('1rem')
    expect(winningDecl(rules, ['fab'], 'z-index')?.value).toBe('999')
    expect(winningDecl(rules, ['fab'], 'flex-direction')?.value).toBe('column-reverse')
    const css = await cssForBatch2('fab')
    expect(css).toContain('transition-delay:30ms')
    expect(css).toContain('transition-delay:120ms')
    expect(css).toContain('rotate:90deg')
  })

  test('close/main-action pin and flower fans out', async () => {
    const rules = parseCss(await cssForBatch2('fab fab-close fab-main-action fab-flower'))
    for (const name of ['fab-close', 'fab-main-action']) {
      const pinned = rules.find((r) => r.selectors.some((s) => s === `.fab .${name}`))
      expect(pinned?.decls.find(([p]) => p === 'position')?.[1], name).toBe('absolute')
      expect(pinned?.decls.find(([p]) => p === 'bottom')?.[1], name).toBe('0')
    }
    const flower = rules.find((r) => r.selectors.some((s) => s === '.fab-flower'))
    expect(flower?.decls.find(([p]) => p === 'display')?.[1]).toBe('grid')
    expect(flower?.decls.find(([p]) => p === '--position')?.[1]).toBe('0rem')
    const css = await cssForBatch2('fab fab-flower')
    expect(css).toContain('--position:140%')
    expect(css).toContain('--position:220%')
    expect(css).toContain('--degree:135deg')
    expect(css).toContain('--degree:90deg')
  })
})

// ─── fieldset ───────────────────────────────────────────────────────────────

const FIELDSET_TOKENS = ['fieldset', 'fieldset-legend', 'fieldset-label']

describe('fieldset', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of FIELDSET_TOKENS) await smoked(t)
  })

  test('legend and label wire to base-content', async () => {
    const vars = await themeVars('light')
    const rules = parseCss(await cssForBatch2('fieldset fieldset-legend fieldset-label'))
    expect(winningDecl(rules, ['fieldset'], 'grid-template-columns')?.value).toBe('1fr')
    expect(winningDecl(rules, ['fieldset'], 'font-size')?.value).toBe('0.75rem')
    const legend = winningDecl(rules, ['fieldset-legend'], 'color')
    expect(resolveFor(rules, ['fieldset-legend'], vars, legend?.value ?? '')).toBe(tvar(vars, '--color-base-content'))
    expect(winningDecl(rules, ['fieldset-legend'], 'font-weight')?.value).toBe('600')
    expect(winningDecl(rules, ['fieldset-legend'], 'margin-bottom')?.value).toBe('-0.25rem')
    const label = winningDecl(rules, ['fieldset-label'], 'color')
    expect(resolveFor(rules, ['fieldset-label'], vars, label?.value ?? '')).toContain(tvar(vars, '--color-base-content'))
    const css = await cssForBatch2('fieldset-label')
    expect(css).toContain('.fieldset-label:has(input)')
    expect(css).toContain('cursor:pointer')
  })
})

// ─── fileinput (.file-input) ────────────────────────────────────────────────

const FILEINPUT_COLORS = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'info',
  'success',
  'warning',
  'error',
] as const

const FILEINPUT_TOKENS = [
  'file-input',
  'file-input-ghost',
  ...FILEINPUT_COLORS.map((c) => `file-input-${c}`),
  'file-input-xs',
  'file-input-sm',
  'file-input-md',
  'file-input-lg',
  'file-input-xl',
]

describe('file-input', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of FILEINPUT_TOKENS) await smoked(t)
  })

  test('base sizes off --size like input', async () => {
    const rules = parseCss(await cssForBatch2('file-input'))
    expect(winningDecl(rules, ['file-input'], 'height')?.value).toBe('var(--size)')
    expect(winningDecl(rules, ['file-input'], 'width')?.value).toBe('clamp(3rem, 20rem, 100%)')
    expect(winningDecl(rules, ['file-input'], '--size')?.value).toBe('calc(var(--size-field, 0.25rem) * 10)')
    const css = await cssForBatch2('file-input')
    expect(css).toContain('::file-selector-button')
    expect(css).toContain('outline-offset:2px')
  })

  test('colors wire --input-color, --btn-color and button fg', async () => {
    const vars = await themeVars('light')
    const classes = ['file-input', ...FILEINPUT_COLORS.map((c) => `file-input-${c}`)]
    const rules = parseCss(await cssForBatch2(classes.join(' ')))
    for (const color of FILEINPUT_COLORS) {
      const cls = [`file-input`, `file-input-${color}`]
      expect(resolveFor(rules, cls, vars, winningDecl(rules, cls, '--input-color')?.value ?? '')).toBe(
        tvar(vars, `--color-${color}`),
      )
      expect(resolveFor(rules, cls, vars, winningDecl(rules, cls, '--btn-color')?.value ?? '')).toBe(
        tvar(vars, `--color-${color}`),
      )
      const btn = rules.find((r) => r.selectors.some((s) => s === `.file-input-${color}::file-selector-button`))
      expect(resolveVars(btn?.decls.find(([p]) => p === 'color')?.[1] ?? '', vars)).toBe(
        tvar(vars, `--color-${color}-content`),
      )
    }
  })

  test('sizes match upstream numeric values', async () => {
    const sizes: Array<[string, string, string, string]> = [
      ['file-input-xs', '* 6', '0.6875rem', '1rem'],
      ['file-input-sm', '* 8', '0.75rem', '1.5rem'],
      ['file-input-md', '* 10', '0.875rem', '2'],
      ['file-input-lg', '* 12', '1.125rem', '2.5rem'],
      ['file-input-xl', '* 14', '1.125rem', '3rem'],
    ]
    const rules = parseCss(await cssForBatch2(sizes.map(([s]) => s).join(' ')))
    for (const [name, mul, fs, lh] of sizes) {
      expect(winningDecl(rules, [name], '--size')?.value).toContain(mul)
      expect(winningDecl(rules, [name], 'font-size')?.value).toBe(fs)
      expect(winningDecl(rules, [name], 'line-height')?.value).toBe(lh)
    }
    expect(winningDecl(rules, ['file-input-xl'], 'padding-inline-end')?.value).toBe('1.5rem')
  })

  test('ghost is transparent until focus', async () => {
    const rules = parseCss(await cssForBatch2('file-input-ghost'))
    expect(winningDecl(rules, ['file-input-ghost'], 'background-color')?.value).toBe('#0000')
    const focus = rules.find((r) => r.selectors.some((s) => s === '.file-input-ghost:focus'))
    expect(focus?.decls.find(([p]) => p === 'background-color')?.[1]).toBe('var(--color-base-100)')
  })
})

// ─── filter ─────────────────────────────────────────────────────────────────

const FILTER_TOKENS = ['filter', 'filter-reset']

describe('filter', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of FILTER_TOKENS) await smoked(t)
  })

  test('children layout and :has collapse', async () => {
    const rules = parseCss(await cssForBatch2('filter filter-reset'))
    expect(winningDecl(rules, ['filter'], 'display')?.value).toBe('flex')
    expect(winningDecl(rules, ['filter'], 'flex-wrap')?.value).toBe('wrap')
    const reset = rules.find((r) => r.selectors.some((s) => s === '.filter input.filter-reset'))
    expect(reset?.decls.find(([p]) => p === 'aspect-ratio')?.[1]).toBe('1')
    const cross = rules.find((r) => r.selectors.some((s) => s === '.filter input.filter-reset::after'))
    expect(cross?.decls.find(([p]) => p === '--tw-content')?.[1]).toContain('×')
    expect(cross?.decls.find(([p]) => p === 'content')?.[1]).toBe('var(--tw-content)')
    const css = await cssForBatch2('filter')
    expect(css).toContain(':has(:checked')
    expect(css).toContain('visibility:hidden')
    expect(css).toContain('scale:0')
    expect(css).toContain('margin-inline-end:0.25rem')
  })
})

// ─── footer ─────────────────────────────────────────────────────────────────

const FOOTER_TOKENS = ['footer', 'footer-title', 'footer-center', 'footer-horizontal', 'footer-vertical']

describe('footer', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of FOOTER_TOKENS) await smoked(t)
  })

  test('base grid and title', async () => {
    const rules = parseCss(await cssForBatch2('footer footer-title'))
    expect(winningDecl(rules, ['footer'], 'display')?.value).toBe('grid')
    expect(winningDecl(rules, ['footer'], 'font-size')?.value).toBe('0.875rem')
    expect(winningDecl(rules, ['footer'], 'row-gap')?.value).toBe('2.5rem')
    expect(winningDecl(rules, ['footer'], 'column-gap')?.value).toBe('1rem')
    expect(winningDecl(rules, ['footer-title'], 'text-transform')?.value).toBe('uppercase')
    expect(winningDecl(rules, ['footer-title'], 'opacity')?.value).toBe('0.6')
    const css = await cssForBatch2('footer')
    expect(css).toContain('.footer > *:not(script, style, template)')
  })

  test('center/horizontal/vertical flows', async () => {
    const rules = parseCss(await cssForBatch2('footer-center footer-horizontal footer-vertical'))
    expect(winningDecl(rules, ['footer-center'], 'text-align')?.value).toBe('center')
    expect(winningDecl(rules, ['footer-center'], 'grid-auto-flow')?.value).toBe('column dense')
    expect(winningDecl(rules, ['footer-horizontal'], 'grid-auto-flow')?.value).toBe('column')
    expect(winningDecl(rules, ['footer-vertical'], 'grid-auto-flow')?.value).toBe('row')
    const css = await cssForBatch2('footer-center footer-horizontal footer-vertical')
    expect(css).toContain('.footer-horizontal.footer-center')
    expect(css).toContain('.footer-vertical.footer-center')
  })
})

// ─── hero ───────────────────────────────────────────────────────────────────

const HERO_TOKENS = ['hero', 'hero-overlay', 'hero-content']

describe('hero', () => {
  test('smoke: every public class emits CSS', async () => {
    for (const t of HERO_TOKENS) await smoked(t)
  })

  test('overlay dims with neutral, content caps width', async () => {
    const vars = await themeVars('light')
    const rules = parseCss(await cssForBatch2('hero hero-overlay hero-content'))
    expect(winningDecl(rules, ['hero'], 'display')?.value).toBe('grid')
    expect(winningDecl(rules, ['hero'], 'background-size')?.value).toBe('cover')
    const overlay = winningDecl(rules, ['hero-overlay'], 'background-color')
    expect(overlay?.value).toContain('var(--color-neutral)')
    expect(resolveFor(rules, ['hero-overlay'], vars, overlay?.value ?? '')).toContain(tvar(vars, '--color-neutral'))
    expect(winningDecl(rules, ['hero-content'], 'max-width')?.value).toBe('80rem')
    expect(winningDecl(rules, ['hero-content'], 'isolation')?.value).toBe('isolate')
    const css = await cssForBatch2('hero')
    expect(css).toContain('.hero > *')
  })
})

// ─── hover3d (.hover-3d) ────────────────────────────────────────────────────

describe('hover-3d', () => {
  test('smoke: every public class emits CSS', async () => {
    await smoked('hover-3d')
  })

  test('perspective stage with tilt zones', async () => {
    const rules = parseCss(await cssForBatch2('hover-3d'))
    expect(winningDecl(rules, ['hover-3d'], 'display')?.value).toBe('inline-grid')
    expect(winningDecl(rules, ['hover-3d'], 'perspective')?.value).toBe('75rem')
    const css = await cssForBatch2('hover-3d')
    expect(css).toContain('rotate3d(var(--transform), 0, 10deg)')
    expect(css).toContain('radial-gradient')
    expect(css).toContain(':has(> :nth-child(9):hover)')
    expect(css).toContain('--transform:1, -1')
    expect(css).toContain('grid-area:3/3/4/4')
  })
})

// ─── prefix + include/exclude ───────────────────────────────────────────────

describe('batch2 options', () => {
  test('prefix d- applies to every component key', async () => {
    const opts: Batch2Opts = { prefix: 'd-', include: [], exclude: [] }
    for (const t of [...DIVIDER_TOKENS, ...DOCK_TOKENS, ...DRAWER_TOKENS, ...DROPDOWN_TOKENS, ...FAB_TOKENS, ...FIELDSET_TOKENS, ...FILEINPUT_TOKENS, ...FILTER_TOKENS, ...FOOTER_TOKENS, ...HERO_TOKENS, 'hover-3d']) {
      await smoked(t, opts)
    }
    const css = await cssForBatch2('d-divider d-divider-primary', opts)
    expect(css).toContain('.d-divider-primary:before')
    expect(css).toContain('display:flex')
  })

  test('include/exclude gate per component', async () => {
    expect(await cssForBatch2('divider', { prefix: '', include: [], exclude: ['divider'] })).not.toContain('.divider')
    expect(await cssForBatch2('dock', { prefix: '', include: ['dock'], exclude: [] })).toContain('.dock')
    expect(await cssForBatch2('divider', { prefix: '', include: ['dock'], exclude: [] })).not.toContain('.divider')
  })
})
