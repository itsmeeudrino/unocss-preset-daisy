import { describe, expect, test } from 'bun:test'
import { createGenerator } from 'unocss'
import { presetUno } from 'unocss'
import { presetDaisy } from '../src/index.ts'
import { DAISY_COLORS } from '../src/rules/colors.ts'
import type { DaisyOptions } from '../src/index.ts'

// Per-component snapshot: same HTML rendered with Tailwind+daisyUI vs
// Uno+preset should match (ignoring layer names).
// P4-infra status: btn/badge/card assert the infra placeholder base styles
// (full P3 ports will tighten these to exact upstream CSS).
// TODO(P3): replace placeholder assertions with Tailwind-vs-Uno diffs per batch.
// TODO(P5): port upstream plugin/themes/contrast/validatecss tests.

async function cssFor(html: string, daisyOpts: DaisyOptions = {}): Promise<string> {
  const uno = await createGenerator({ presets: [presetUno(), presetDaisy(daisyOpts)] })
  const { css } = await uno.generate(html, { preflights: false })
  return css
}

describe('daisy snapshot', () => {
  test('btn exists', async () => {
    const css = await cssFor('<button class="btn"></button>')
    expect(css).toContain('.btn')
    expect(css).toContain('display:inline-flex')
  })

  test('btn-primary maps to theme vars', async () => {
    const css = await cssFor('<button class="btn btn-primary"></button>')
    expect(css).toContain('--btn-color:var(--color-primary)')
    expect(css).toContain('var(--color-primary-content)')
  })

  test('badge exists', async () => {
    const css = await cssFor('<span class="badge badge-secondary"></span>')
    expect(css).toContain('.badge')
    expect(css).toContain('--badge-color:var(--color-secondary)')
    expect(css).toContain('var(--color-secondary-content)')
  })

  test('card exists', async () => {
    const css = await cssFor('<div class="card card-border"></div>')
    expect(css).toContain('.card')
    expect(css).toContain('flex-direction:column')
    expect(css).toContain('var(--radius-box)')
    expect(css).toContain('var(--color-base-200)')
  })

  test('prefix option renames utilities and variants', async () => {
    const css = await cssFor('<button class="d-btn d-bg-primary d-is-drawer-open:d-text-accent"></button>', {
      prefix: 'd-',
    })
    expect(css).toContain('.d-btn')
    expect(css).toContain('background-color:var(--color-primary)')
    expect(css).toContain(':where(.d-drawer-toggle:checked ~ .d-drawer-side')
  })

  test('theme tokens present', () => {
    for (const opts of [{}, { themes: ['light', 'dark'] }] as DaisyOptions[]) {
      const preset = presetDaisy(opts)
      const colors = (preset.theme as unknown as { colors?: Record<string, string> })?.colors
      expect(colors).toBeDefined()
      for (const c of DAISY_COLORS) {
        expect(colors?.[c]).toBe(`var(--color-${c})`)
      }
    }
  })

  test('join utilities work', async () => {
    const css = await cssFor('<div class="join join-horizontal"><button class="join-item"></button></div>')
    expect(css).toContain('display:inline-flex')
    expect(css).toContain('--join-h:1')
    expect(css).toContain('.join-item')
    expect(css).toContain('flex-direction:row')
  })

  test('color rules with opacity + hover passthrough', async () => {
    const css = await cssFor(
      '<div class="bg-primary text-base-content border-error/50 hover:bg-secondary"></div>',
    )
    expect(css).toContain('background-color:var(--color-primary)')
    expect(css).toContain('color:var(--color-base-content)')
    expect(css).toContain('color-mix(in oklab, var(--color-error) 50%, #0000)')
    expect(css).toContain(':hover')
  })

  test('drawer variants stay top-level', async () => {
    const css = await cssFor('<div class="is-drawer-open:bg-primary is-drawer-close:text-accent"></div>')
    expect(css).toContain(':where(.drawer-toggle:checked ~ .drawer-side')
    expect(css).toContain('background-color:var(--color-primary)')
    expect(css).toContain(':where(.drawer-toggle:not(:checked) ~ .drawer-side')
    expect(css).toContain('color:var(--color-accent)')
  })

  test('exclude option filters components', async () => {
    const css = await cssFor('<button class="btn"></button><span class="badge"></span>', {
      exclude: ['button'],
    })
    expect(css).not.toContain('.btn{')
    expect(css).toContain('.badge')
  })
})
