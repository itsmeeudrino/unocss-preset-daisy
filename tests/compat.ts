import { createGenerator } from 'unocss'
import { presetUno } from 'unocss'
import { presetDaisy } from '../src/index.ts'

// Shared harness for daisyUI-compatibility tests.
//
// Strategy (no browser needed):
// 1. Generate the preset's CSS for a class list with UnoCSS.
// 2. Emulate the cascade for an element carrying exactly those classes:
//    only simple (no pseudo/combinator/attribute) selectors match;
//    winner = highest layer rank, then specificity, then source order.
//    Layer ranks mirror src/layers.ts (outer-wins per saadeghi/daisyui#4209).
// 3. Resolve var(--x, fallback) chains against a theme's variable map
//    parsed from src/theme/themes.css.
// 4. Compare the resolved value with the theme's own variable value
//    (structure: right variable wired) and with hardcoded upstream spot
//    values (values: match daisyUI v5.7.43).

export const LAYER_RANK: Record<string, number> = {
  base: -100,
  'daisy-l3': -30,
  'daisy-l2': -20,
  'daisy-l1': -10,
  components: 0,
  utilities: 10,
  default: 0,
}

export interface CRule {
  selectors: string[]
  decls: Array<[string, string]>
  layer: string
  media: string | null
  order: number
}

const cssCache = new Map<string, string>()

export async function cssFor(classes: string): Promise<string> {
  const hit = cssCache.get(classes)
  if (hit !== undefined) return hit
  const uno = await createGenerator({ presets: [presetUno(), presetDaisy()] })
  const { css } = await uno.generate(classes, { preflights: false })
  cssCache.set(classes, css)
  return css
}

/** Split a rule body into top-level `prop: value` pairs (skips nested rules). */
function splitDecls(body: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  let depth = 0
  let cur = ''
  const flush = (): void => {
    const seg = cur.trim()
    cur = ''
    if (!seg || seg.includes('{') || seg.includes('}')) return
    const colon = seg.indexOf(':')
    if (colon === -1) return
    out.push([seg.slice(0, colon).trim(), seg.slice(colon + 1).trim()])
  }
  for (const ch of body) {
    if (ch === '{') depth++
    else if (ch === '}') depth--
    if (ch === ';' && depth === 0) flush()
    else cur += ch
  }
  flush()
  return out
}

/** Split a selector list on top-level commas (parens-aware). */
function splitSelectors(sel: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of sel) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export function parseCss(css: string): CRule[] {
  const rules: CRule[] = []
  let order = 0
  const pushBlock = (block: string, layer: string, media: string | null): void => {
    const b = block.trim()
    if (!b || b.startsWith('@')) return
    const brace = b.indexOf('{')
    if (brace === -1) return
    const sel = b.slice(0, brace).trim()
    const body = b.slice(brace + 1, b.lastIndexOf('}'))
    rules.push({ selectors: splitSelectors(sel), decls: splitDecls(body), layer, media, order: order++ })
  }
  // Walk top-level blocks, tracking /* layer: X */ markers and @media wrappers.
  let layer = 'default'
  const scan = (text: string, media: string | null): void => {
    let depth = 0
    let start = 0
    for (let k = 0; k < text.length; k++) {
      const ch = text[k]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          const block = text.slice(start, k + 1)
          start = k + 1
          const t = block.trim()
          if (t.startsWith('@media')) {
            const innerStart = t.indexOf('{')
            const inner = t.slice(innerStart + 1, t.lastIndexOf('}'))
            scan(inner, t.slice(0, innerStart).trim())
          } else {
            pushBlock(block, layer, media)
          }
        }
      }
    }
  }
  // Split input on layer comments first so each chunk shares one layer.
  const parts = css.split(/\/\* layer: ([^*]+) \*\//)
  // parts[0] = before first marker (default layer), then pairs [name, chunk].
  scan(parts[0] ?? '', null)
  for (let p = 1; p < parts.length; p += 2) {
    layer = (parts[p] ?? 'default').trim()
    scan(parts[p + 1] ?? '', null)
  }
  return rules
}

/** Strip :where(...) wrappers (zero specificity, transparent for matching). */
function stripWhere(sel: string): string {
  let out = sel
  for (;;) {
    const k = out.indexOf(':where(')
    if (k === -1) return out
    let depth = 0
    let j = k + 7
    for (; j < out.length; j++) {
      if (out[j] === '(') depth++
      else if (out[j] === ')') {
        if (depth === 0) break
        depth--
      }
    }
    if (j >= out.length) return out
    out = out.slice(0, k) + out.slice(k + 7, j) + out.slice(j + 1)
  }
}

/** Does a static selector match an element with exactly these classes? */
export function matchesStatic(selector: string, classes: Set<string>): boolean {
  // Unescape selector escapes (UnoCSS emits .bg-success\/50 for bg-success/50).
  const unescaped = selector.replace(/\\(.)/g, '$1')
  const plain = stripWhere(unescaped)
  if (/[>\s+~]/.test(plain)) return false
  if (plain.includes('[')) return false
  if (plain.includes(':')) return false
  const needs = [...plain.matchAll(/\.([a-z0-9-/]+)/gi)].map((m) => m[1])
  if (needs.length === 0) return false
  return needs.every((c) => c !== undefined && classes.has(c))
}

const specificity = (sel: string): number => (sel.match(/\./g) ?? []).length

/** Winning declaration for `prop` on an element with `classes` (static state). */
export function winningDecl(
  rules: CRule[],
  classes: string[],
  prop: string,
): { value: string; layer: string; selector: string } | null {
  const set = new Set(classes)
  type Cand = { value: string; layer: string; selector: string; spec: number; order: number }
  const cands: Cand[] = []
  for (const r of rules) {
    if (r.media !== null) continue
    for (const sel of r.selectors) {
      if (!matchesStatic(sel, set)) continue
      for (const [p, v] of r.decls) {
        if (p === prop) cands.push({ value: v, layer: r.layer, selector: sel, spec: specificity(sel), order: r.order })
      }
    }
  }
  cands.sort(
    (a, b) =>
      (LAYER_RANK[a.layer] ?? 0) - (LAYER_RANK[b.layer] ?? 0) || a.spec - b.spec || a.order - b.order,
  )
  const w = cands[cands.length - 1]
  return w === undefined ? null : { value: w.value, layer: w.layer, selector: w.selector }
}

let themesCssCache: string | null = null

async function themesCss(): Promise<string> {
  if (themesCssCache !== null) return themesCssCache
  const url = new URL('../src/theme/themes.css', import.meta.url)
  themesCssCache = await Bun.file(url).text()
  return themesCssCache
}

/** Raw variable map for one `[data-theme="name"]` block. */
export async function themeVars(theme: string): Promise<Map<string, string>> {
  const css = await themesCss()
  const anchor = `[data-theme="${theme}"]`
  const ai = css.indexOf(anchor)
  if (ai === -1) throw new Error(`theme ${theme} not found`)
  const open = css.indexOf('{', ai)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const vars = new Map<string, string>()
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const name = m[1]
    const val = m[2]
    if (name !== undefined && val !== undefined) vars.set(name.trim(), val.trim())
  }
  return vars
}

/** All theme names declared in themes.css. */
export async function themeNames(): Promise<string[]> {
  const css = await themesCss()
  const names = new Set<string>()
  for (const m of css.matchAll(/\[data-theme="([\w-]+)"\]/g)) {
    const n = m[1]
    if (n !== undefined) names.add(n)
  }
  return [...names].sort()
}

/** Resolve a value in element scope (winning custom-property declarations)
 *  falling back to inherited theme variables. Mirrors browser behavior for
 *  our flat selectors: custom props resolve against the element first. */
export function resolveFor(
  rules: CRule[],
  classes: string[],
  theme: Map<string, string>,
  value: string,
  depth = 0,
): string {
  if (depth > 12 || !value.includes('var(')) return value
  let out = ''
  let i = 0
  while (true) {
    const k = value.indexOf('var(', i)
    if (k === -1) {
      out += value.slice(i)
      break
    }
    out += value.slice(i, k)
    let d = 0
    let j = k + 4
    for (; j < value.length; j++) {
      if (value[j] === '(') d++
      else if (value[j] === ')') {
        if (d === 0) break
        d--
      }
    }
    if (j >= value.length) {
      out += value.slice(k)
      break
    }
    const inner = value.slice(k + 4, j)
    let dd = 0
    let c = -1
    for (let t = 0; t < inner.length; t++) {
      if (inner[t] === '(') dd++
      else if (inner[t] === ')') dd--
      else if (inner[t] === ',' && dd === 0) {
        c = t
        break
      }
    }
    const name = (c === -1 ? inner : inner.slice(0, c)).trim()
    const fb = c === -1 ? undefined : inner.slice(c + 1).trim()
    const inline = winningDecl(rules, classes, name)
    if (inline !== null) out += resolveFor(rules, classes, theme, inline.value, depth + 1)
    else {
      const v = theme.get(name)
      out +=
        v !== undefined
          ? resolveFor(rules, classes, theme, v, depth + 1)
          : fb !== undefined
            ? resolveFor(rules, classes, theme, fb, depth + 1)
            : `var(${inner})`
    }
    i = j + 1
  }
  return out
}

/** Resolve var(--x, fallback) chains against a variable map. */
export function resolveVars(value: string, vars: Map<string, string>, depth = 0): string {
  if (depth > 12 || !value.includes('var(')) return value
  let out = ''
  let i = 0
  while (true) {
    const k = value.indexOf('var(', i)
    if (k === -1) {
      out += value.slice(i)
      break
    }
    out += value.slice(i, k)
    let d = 0
    let j = k + 4
    for (; j < value.length; j++) {
      if (value[j] === '(') d++
      else if (value[j] === ')') {
        if (d === 0) break
        d--
      }
    }
    if (j >= value.length) {
      out += value.slice(k)
      break
    }
    const inner = value.slice(k + 4, j)
    let dd = 0
    let c = -1
    for (let t = 0; t < inner.length; t++) {
      if (inner[t] === '(') dd++
      else if (inner[t] === ')') dd--
      else if (inner[t] === ',' && dd === 0) {
        c = t
        break
      }
    }
    const name = (c === -1 ? inner : inner.slice(0, c)).trim()
    const fb = c === -1 ? undefined : inner.slice(c + 1).trim()
    const v = vars.get(name)
    out +=
      v !== undefined
        ? resolveVars(v, vars, depth + 1)
        : fb !== undefined
          ? resolveVars(fb, vars, depth + 1)
          : `var(${inner})`
    i = j + 1
  }
  return out
}

/** Non-null theme variable lookup (throws when the contract is broken). */
export function tvar(vars: Map<string, string>, name: string): string {
  const v = vars.get(name)
  if (v === undefined) throw new Error(`theme variable missing: ${name}`)
  return v
}

/** Lightness (0-100) of an `oklch(L% ...)` value, or null if not plain oklch. */
export function oklchLightness(value: string): number | null {
  const m = /oklch\(\s*([\d.]+)%/.exec(value)
  return m?.[1] === undefined ? null : Number(m[1])
}
