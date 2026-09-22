import { describe, expect, test } from 'bun:test'
import { applyPrefix, resolveOptions, shouldInclude } from '../src/options.ts'

describe('applyPrefix', () => {
  test('empty prefix returns selector untouched', () => {
    expect(applyPrefix('.btn:hover', '')).toBe('.btn:hover')
  })

  test('prefixes classes incl. pseudo/combinator contexts', () => {
    expect(applyPrefix('.btn:active:not(.btn-active)', 'd-')).toBe('.d-btn:active:not(.d-btn-active)')
    expect(applyPrefix('.join > :where(.btn)', 'd-')).toBe('.d-join > :where(.d-btn)')
    expect(applyPrefix('.menu :where(li)', 'd-')).toBe('.d-menu :where(li)')
  })

  test('never corrupts decimals, urls or attribute values', () => {
    expect(applyPrefix('.btn{transition-timing-function:cubic-bezier(0, 0, 0.2, 1)}', 'd-')).toBe(
      '.d-btn{transition-timing-function:cubic-bezier(0, 0, 0.2, 1)}',
    )
    expect(applyPrefix('.a{width:0.5rem;gap:.25rem}', 'd-')).toBe('.d-a{width:0.5rem;gap:.25rem}')
    expect(applyPrefix('.a{background:url("icon.svg")}', 'd-')).toBe('.d-a{background:url("icon.svg")}')
    expect(applyPrefix('[aria-current="false"]', 'd-')).toBe('[aria-current="false"]')
  })
})

describe('shouldInclude', () => {
  test('empty lists include everything', () => {
    expect(shouldInclude('btn', [], [])).toBe(true)
  })

  test('include/exclude matrix (mirrors upstream index.js)', () => {
    expect(shouldInclude('btn', ['btn'], [])).toBe(true)
    expect(shouldInclude('card', ['btn'], [])).toBe(false)
    expect(shouldInclude('btn', [], ['btn'])).toBe(false)
    expect(shouldInclude('card', [], ['btn'])).toBe(true)
    expect(shouldInclude('btn', ['btn'], ['btn'])).toBe(false)
  })
})

describe('resolveOptions', () => {
  test('defaults', () => {
    expect(resolveOptions({})).toEqual({ themes: false, prefix: '', include: [], exclude: [], logs: false })
  })
})
