import { describe, expect, test } from 'bun:test'
import { createGenerator } from 'unocss'
import { presetUno } from 'unocss'
import { presetDaisy } from '../src/index.ts'

// Per-component snapshot: same HTML in Tailwind+daisyUI vs Uno+preset should match (ignoring layer names).
// TODO(P3): add cases per batch. Start with button/card/badge.
describe('daisy snapshot', () => {
  test('btn exists', async () => {
    const uno = await createGenerator({ presets: [presetUno(), presetDaisy()] })
    const { css } = await uno.generate('<button class="btn btn-primary"></button>', { preflights: true })
    expect(css).toContain('btn')
  })
})
