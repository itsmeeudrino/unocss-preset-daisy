import { describe, expect, test } from 'bun:test'
import {
  cssFor,
  oklchLightness,
  parseCss,
  resolveFor,
  themeVars,
  tvar,
  winningDecl,
} from './compat.ts'

// Regression tests for the reported mismatch: in dark theme, daisyUI renders
// Accent/Info/Success/Warning/Error buttons with DARK text, but the preset
// rendered WHITE text because .btn base (daisy-l3) outranked .btn-{color}
// (daisy-l2). daisyUI's effective order is outer-wins (saadeghi/daisyui#4209):
// states > modifiers > base. These tests resolve the winning declarations
// against real theme variables and compare with the theme's own values.

const BTN_COLORS = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'info',
  'success',
  'warning',
  'error',
] as const

describe('button color matrix resolves to theme values', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const color of BTN_COLORS) {
      test(`${theme}: btn-${color} text = ${color}-content, bg = ${color}`, async () => {
        const classes = ['btn', `btn-${color}`]
        const css = await cssFor(classes.join(' '))
        const rules = parseCss(css)
        const vars = await themeVars(theme)
        const fg = winningDecl(rules, classes, 'color')
        const bg = winningDecl(rules, classes, 'background-color')
        expect(fg).not.toBeNull()
        expect(bg).not.toBeNull()
        expect(resolveFor(rules, classes, vars, fg?.value ?? '')).toBe(tvar(vars, `--color-${color}-content`))
        expect(resolveFor(rules, classes, vars, bg?.value ?? '')).toBe(tvar(vars, `--color-${color}`))
      })
    }
  }

  test('dark: accent/info/success/warning/error text is dark (reference rendering)', async () => {
    const vars = await themeVars('dark')
    const css = await cssFor('btn btn-accent btn-info btn-success btn-warning btn-error')
    const rules = parseCss(css)
    for (const color of ['accent', 'info', 'success', 'warning', 'error'] as const) {
      const classes = ['btn', `btn-${color}`]
      const fg = winningDecl(rules, classes, 'color')
      const l = oklchLightness(resolveFor(rules, classes, vars, fg?.value ?? ''))
      expect(l).not.toBeNull()
      expect(l ?? 100).toBeLessThan(50)
    }
  })

  test('dark: neutral text is light, primary text is light', async () => {
    const vars = await themeVars('dark')
    const css = await cssFor('btn btn-neutral btn-primary')
    const rules = parseCss(css)
    for (const color of ['neutral', 'primary'] as const) {
      const classes = ['btn', `btn-${color}`]
      const fg = winningDecl(rules, classes, 'color')
      const l = oklchLightness(resolveFor(rules, classes, vars, fg?.value ?? ''))
      expect(l).not.toBeNull()
      expect(l ?? 0).toBeGreaterThan(80)
    }
  })

  test('plain btn uses base colors', async () => {
    const vars = await themeVars('dark')
    const rules = parseCss(await cssFor('btn'))
    expect(resolveFor(rules, ['btn'], vars, winningDecl(rules, ['btn'], 'color')?.value ?? '')).toBe(
      tvar(vars, '--color-base-content'),
    )
    expect(resolveFor(rules, ['btn'], vars, winningDecl(rules, ['btn'], 'background-color')?.value ?? '')).toBe(
      tvar(vars, '--color-base-200'),
    )
  })
})

describe('button style variants', () => {
  test('outline primary: primary text on transparent bg', async () => {
    const vars = await themeVars('dark')
    const classes = ['btn', 'btn-outline', 'btn-primary']
    const rules = parseCss(await cssFor(classes.join(' ')))
    expect(resolveFor(rules, classes, vars, winningDecl(rules, classes, 'color')?.value ?? '')).toBe(
      tvar(vars, '--color-primary'),
    )
    expect(resolveFor(rules, classes, vars, winningDecl(rules, classes, 'background-color')?.value ?? '')).toBe(
      '#0000',
    )
  })

  test('ghost: transparent bg and border', async () => {
    const vars = await themeVars('light')
    const classes = ['btn', 'btn-ghost']
    const rules = parseCss(await cssFor(classes.join(' ')))
    expect(resolveFor(rules, classes, vars, winningDecl(rules, classes, '--btn-bg')?.value ?? '')).toBe('#0000')
  })

  test('link: underline with primary color', async () => {
    const vars = await themeVars('light')
    const classes = ['btn', 'btn-link']
    const rules = parseCss(await cssFor(classes.join(' ')))
    expect(winningDecl(rules, classes, 'text-decoration-line')?.value).toBe('underline')
    expect(resolveFor(rules, classes, vars, winningDecl(rules, classes, 'color')?.value ?? '')).toBe(
      tvar(vars, '--color-primary'),
    )
  })

  test('sizes match upstream values', async () => {
    const rules = parseCss(await cssFor('btn btn-xs btn-sm btn-md btn-lg btn-xl'))
    const expected: Record<string, [string, string]> = {
      'btn-xs': ['0.6875rem', '0.5rem'],
      'btn-sm': ['0.75rem', '0.75rem'],
      'btn-md': ['0.875rem', '1rem'],
      'btn-lg': ['1.125rem', '1.25rem'],
      'btn-xl': ['1.375rem', '1.5rem'],
    }
    for (const [cls, [fs, p]] of Object.entries(expected)) {
      expect(winningDecl(rules, ['btn', cls], '--fontsize')?.value).toBe(fs)
      expect(winningDecl(rules, ['btn', cls], '--btn-p')?.value).toBe(p)
    }
  })
})

describe('button states keep modifier colors', () => {
  test('hover inherits --btn-fg (never hardcodes base-content)', async () => {
    const rules = parseCss(await cssFor('btn btn-accent'))
    const hover = rules.find((r) => r.media !== null && r.selectors.some((s) => s.includes(':hover')))
    expect(hover).toBeDefined()
    expect(hover?.decls.find(([p]) => p === 'color')?.[1]).toBe('var(--btn-fg)')
  })

  test('disabled (bare layer) beats base', async () => {
    const rules = parseCss(await cssFor('btn btn-disabled'))
    const w = winningDecl(rules, ['btn', 'btn-disabled'], 'color')
    expect(w?.layer).toBe('daisy-l1')
    expect(w?.value.startsWith('color-mix(in oklch, var(--color-base-content)')).toBe(true)
  })
})
