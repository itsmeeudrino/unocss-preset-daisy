import { describe, expect, test } from 'bun:test'
import { cssFor, parseCss, resolveFor, themeVars, tvar, winningDecl } from './compat.ts'

const COLORS = [
  'neutral',
  'primary',
  'secondary',
  'accent',
  'info',
  'success',
  'warning',
  'error',
] as const

describe('badge matrix resolves to theme values', () => {
  for (const color of COLORS) {
    test(`dark: badge-${color}`, async () => {
      const classes = ['badge', `badge-${color}`]
      const vars = await themeVars('dark')
      const rules = parseCss(await cssFor(classes.join(' ')))
      const fg = winningDecl(rules, classes, '--badge-fg')
      const bg = winningDecl(rules, classes, 'background-color')
      expect(fg).not.toBeNull()
      expect(bg).not.toBeNull()
      expect(resolveFor(rules, classes, vars, fg?.value ?? '')).toBe(tvar(vars, `--color-${color}-content`))
      expect(resolveFor(rules, classes, vars, bg?.value ?? '')).toBe(tvar(vars, `--color-${color}`))
    })
  }
})

describe('input colors', () => {
  test('input-primary sets --input-color', async () => {
    const vars = await themeVars('light')
    const classes = ['input', 'input-primary']
    const rules = parseCss(await cssFor(classes.join(' ')))
    expect(resolveFor(rules, classes, vars, winningDecl(rules, classes, '--input-color')?.value ?? '')).toBe(
      tvar(vars, '--color-primary'),
    )
  })
})

describe('card, modal, menu, join, glass', () => {
  test('card-border references base-200', async () => {
    const rules = parseCss(await cssFor('card card-border'))
    expect(winningDecl(rules, ['card', 'card-border'], 'border')?.value).toContain('var(--color-base-200)')
  })

  test('modal-box uses base-100', async () => {
    const vars = await themeVars('dark')
    const rules = parseCss(await cssFor('modal-box'))
    expect(resolveFor(rules, ['modal-box'], vars, winningDecl(rules, ['modal-box'], 'background-color')?.value ?? '')).toBe(
      tvar(vars, '--color-base-100'),
    )
  })

  test('menu-active hides outline', async () => {
    const rules = parseCss(await cssFor('menu-active'))
    // Standalone rule (group-hover use case); stateful menu rules also mention
    // .menu-active but only inside :hover/:active/:focus selectors.
    const rule = rules.find((r) =>
      r.selectors.some(
        (s) =>
          s.includes('.menu-active') &&
          !s.includes(':hover') &&
          !s.includes(':active') &&
          !s.includes(':focus'),
      ),
    )
    expect(rule).toBeDefined()
    expect(rule?.decls.find(([p]) => p === 'outline-style')?.[1]).toBe('hidden')
  })

  test('join-item radii follow join vars', async () => {
    const rules = parseCss(await cssFor('join-item'))
    expect(winningDecl(rules, ['join-item'], 'border-start-start-radius')?.value).toBe('var(--join-ss)')
    expect(winningDecl(rules, ['join-item'], 'border-width')?.value).toBe('var(--border, 1px)')
  })

  test('glass is frosted', async () => {
    const rules = parseCss(await cssFor('glass'))
    expect(winningDecl(rules, ['glass'], 'backdrop-filter')?.value).toContain('blur(')
    expect(winningDecl(rules, ['glass'], 'background-color')?.value).toBe('#0000')
  })
})

describe('theme color utilities', () => {
  test('bg-/text-/border- map to theme vars with opacity via color-mix', async () => {
    const rules = parseCss(await cssFor('bg-primary text-accent border-error bg-success/50'))
    expect(winningDecl(rules, ['bg-primary'], 'background-color')?.value).toBe('var(--color-primary)')
    expect(winningDecl(rules, ['text-accent'], 'color')?.value).toBe('var(--color-accent)')
    expect(winningDecl(rules, ['border-error'], 'border-color')?.value).toBe('var(--color-error)')
    expect(winningDecl(rules, ['bg-success/50'], 'background-color')?.value).toBe(
      'color-mix(in oklab, var(--color-success) 50%, #0000)',
    )
  })
})
