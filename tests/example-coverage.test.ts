import { describe, expect, test } from 'bun:test'
import { cssFor } from './compat.ts'

// Coverage gate for example/index.html: the showcase must demo 100% of the
// ported component API — and nothing it demos may render unstyled.
// 1. Every ported public class appears in the example (completeness).
// 2. Every daisy-flavored token in the example generates CSS solo
//    (validity: no unstyled leftovers).
// 3. No unported upstream component classes sneak in (ban list).

const COLORS = [
  'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error',
] as const

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const EXPECTED_TOKENS = new Set<string>([
  'btn',
  ...COLORS.map((c) => `btn-${c}`),
  'btn-outline', 'btn-dash', 'btn-soft', 'btn-ghost', 'btn-link',
  'btn-active', 'btn-disabled',
  ...SIZES.map((s) => `btn-${s}`),
  'btn-wide', 'btn-block', 'btn-square', 'btn-circle',
  'badge',
  ...COLORS.map((c) => `badge-${c}`),
  'badge-outline', 'badge-dash', 'badge-soft', 'badge-ghost',
  ...SIZES.map((s) => `badge-${s}`),
  'card', 'card-body', 'card-title', 'card-actions', 'card-border', 'card-dash',
  'card-side', 'image-full',
  ...SIZES.map((s) => `card-${s}`),
  'input',
  ...COLORS.map((c) => `input-${c}`),
  'input-ghost',
  ...SIZES.map((s) => `input-${s}`),
  'modal', 'modal-toggle', 'modal-open', 'modal-backdrop', 'modal-action', 'modal-box',
  'modal-top', 'modal-middle', 'modal-bottom', 'modal-start', 'modal-end',
  'menu', 'menu-title', 'menu-active', 'menu-disabled',
  'menu-horizontal', 'menu-vertical',
  ...SIZES.map((s) => `menu-${s}`),
  'menu-paged',
  'join', 'join-item', 'join-vertical', 'join-horizontal',
  'glass',
  'rounded-selector', 'rounded-field', 'rounded-box',
  'sm:card-side',
  'bg-primary', 'bg-secondary', 'bg-accent', 'bg-neutral', 'bg-info',
  'bg-success', 'bg-warning', 'bg-error', 'bg-base-200', 'bg-primary/20',
  'bg-success/40', 'text-primary-content', 'text-base-content', 'text-error',
  'border-error',
])

// Upstream components with NO port yet: using any of these classes would
// render unstyled, so they are banned from the showcase.
const BANNED = [
  'accordion', 'alert', 'avatar', 'breadcrumbs', 'calendar', 'carousel', 'chat',
  'checkbox', 'collapse', 'countdown', 'diff', 'divider', 'dock', 'drawer',
  'dropdown', 'fab', 'fieldset', 'file-input', 'filter', 'footer', 'hero',
  'indicator', 'kbd', 'label', 'link', 'list', 'loading', 'mask', 'navbar',
  'progress', 'radial-progress', 'radio', 'range', 'rating', 'select',
  'skeleton', 'stack', 'stat', 'status', 'steps', 'swap', 'table', 'tabs',
  'textarea', 'timeline', 'toast', 'toggle', 'tooltip', 'validator',
]

const DAISY_COLORS = [
  'base-100', 'base-200', 'base-300', 'base-content', 'primary',
  'primary-content', 'secondary', 'secondary-content', 'accent',
  'accent-content', 'neutral', 'neutral-content', 'info', 'info-content',
  'success', 'success-content', 'warning', 'warning-content', 'error',
  'error-content',
]

function isDaisyToken(tok: string): boolean {
  const base = tok.split(':').pop() ?? tok
  const plain = base.split('/')[0] ?? base
  if (/^(btn|badge|card|input|modal|menu|join|glass|rounded|prose)(-|$)/.test(plain)) return true
  const m = /^(bg|text|border)-(.+)$/.exec(plain)
  return m?.[2] !== undefined && DAISY_COLORS.includes(m[2])
}

async function exampleTokens(): Promise<Set<string>> {
  const htmlUrl = new URL('../example/index.html', import.meta.url)
  const tsUrl = new URL('../example/src/main.ts', import.meta.url)
  const html = await Bun.file(htmlUrl).text()
  const ts = await Bun.file(tsUrl).text()
  const out = new Set<string>()
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    const cls = m[1]
    if (cls !== undefined) for (const t of cls.split(/\s+/)) if (t) out.add(t)
  }
  for (const m of html.matchAll(/data-place="([\w-]+)"/g)) {
    const v = m[1]
    if (v !== undefined) out.add(v)
  }
  // Runtime-added classes referenced in TS source.
  for (const m of ts.matchAll(/'((?:modal|btn|badge|card|input|menu|join)[\w-]*)'/g)) {
    const v = m[1]
    if (v !== undefined) out.add(v)
  }
  return out
}

describe('example coverage', () => {
  test('every ported public class is demoed', async () => {
    const tokens = await exampleTokens()
    const missing = [...EXPECTED_TOKENS].filter((t) => !tokens.has(t))
    expect(missing).toEqual([])
  })

  test('every daisy token in the example generates CSS', async () => {
    const tokens = await exampleTokens()
    const daisy = [...tokens].filter(isDaisyToken)
    expect(daisy.length).toBeGreaterThan(100)
    // Full-page generation like real usage: contextual selectors
    // (li.menu-disabled, sm:card-side, …) only match in composed output.
    const uno = await cssFor([...tokens].join(' '))
    const dead: string[] = []
    for (const t of daisy) {
      const base = t.split(':').pop()?.split('/')[0] ?? t
      const esc = `.${t.replace(/:/g, '\\:').replace(/\//g, '\\/')}`
      if (!uno.includes(esc) && !uno.includes(`.${base}`)) dead.push(t)
    }
    expect(dead).toEqual([])
  })

  test('no unported upstream component classes', async () => {
    const tokens = await exampleTokens()
    const banned = [...tokens].filter((t) => {
      const base = t.split(':').pop() ?? t
      return BANNED.some((b) => base === b || base.startsWith(`${b}-`))
    })
    expect(banned).toEqual([])
  })
})
