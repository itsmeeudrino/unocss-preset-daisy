import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import { parseCss } from "./compat.ts";

// Shared library for 1:1 behavior parity vs official daisyUI v5.7.43.
// See tests/parity-1to1.test.ts for the goal and method. Importable by
// debug scripts without running the suite (unlike the .test.ts file).

export const REF_URL =
  "https://cdn.jsdelivr.net/npm/daisyui@5.7.43/daisyui.css";
export const REF_CANDIDATES = [
  "tests/fixtures/daisy-ref.css",
  "/tmp/daisy-ref.css",
];

export const PARENT_SCOPED: Record<string, string> = {
  "collapse-close": "collapse",
  "indicator-item": "indicator",
  "list-row": "list",
  "list-col-grow": "list",
  "mockup-browser-toolbar": "mockup-browser",
  "row-hover": "table",
  step: "steps",
  "step-icon": "steps",
  "tooltip-content": "tooltip",
};

export const VARIANT_PREFIXES = new Set(["sm", "md", "lg", "xl", "hover"]);
export const LAYER_ARTIFACTS = new Set(["l1", "l2", "l3", "l4"]);
export const PREFLIGHT_KEYFRAMES = new Set(["set-page-has-scroll"]);

/** State/structural pseudos that must match. Anything else (e.g. `:aura`
 *  read off a `.sm\:aura` responsive selector) is a variant-prefix artifact
 *  and is ignored on both sides. */
export const KNOWN_PSEUDOS = new Set([
  "hover",
  "focus",
  "focus-visible",
  "focus-within",
  "active",
  "disabled",
  "enabled",
  "checked",
  "indeterminate",
  "valid",
  "invalid",
  "user-valid",
  "user-invalid",
  "required",
  "optional",
  "target",
  "open",
  "popover-open",
  "modal",
  "first-child",
  "last-child",
  "first-of-type",
  "last-of-type",
  "only-child",
  "only-of-type",
  "nth-child",
  "nth-of-type",
  "nth-last-child",
  "empty",
  "root",
  "link",
  "visited",
  "before",
  "after",
  "marker",
  "placeholder",
  "placeholder-shown",
  "backdrop",
  "selection",
  "file-selector-button",
  "picker",
  "part",
  "slotted",
  "dir",
  "lang",
  "scope",
  "defined",
  "host",
  "first-letter",
  "first-line",
  "scroll-marker",
  "-webkit-slider-thumb",
  "-webkit-slider-runnable-track",
  "-moz-range-thumb",
  "-moz-range-track",
  "-moz-focusring",
  "-moz-ui-invalid",
  "-webkit-search-decoration",
  "-webkit-details-marker",
]);

export function exactClassRe(token: string): RegExp {
  return new RegExp(
    `\\.${token.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`,
  );
}

export async function loadReference(): Promise<string> {
  for (const p of REF_CANDIDATES) {
    const f = Bun.file(p);
    if (await f.exists()) {
      const t = await f.text();
      if (t.length > 100_000) return t;
    }
  }
  const res = await fetch(REF_URL);
  if (!res.ok)
    throw new Error(
      `parity reference unavailable (offline, no cache). Fetch manually: curl -sL ${REF_URL} -o /tmp/daisy-ref.css`,
    );
  const text = await res.text();
  await Bun.write("/tmp/daisy-ref.css", text);
  return text;
}

export interface URule {
  selectors: string[];
  decls: Array<[string, string]>;
  layer: string;
}

type BodyItem =
  | { type: "decl"; text: string }
  | { type: "rule"; sel: string; body: string }
  | { type: "at"; header: string; body: string };

function bodyItems(body: string): BodyItem[] {
  const items: BodyItem[] = [];
  let i = 0;
  let cur = "";
  while (i < body.length) {
    const ch = body[i];
    if (ch === "{") {
      const header = cur.trim();
      cur = "";
      let d = 1;
      let j = i + 1;
      for (; j < body.length; j++) {
        if (body[j] === "{") d++;
        else if (body[j] === "}") {
          d--;
          if (d === 0) break;
        }
      }
      const inner = body.slice(i + 1, j);
      if (header.startsWith("@"))
        items.push({ type: "at", header, body: inner });
      else if (header) items.push({ type: "rule", sel: header, body: inner });
      i = j + 1;
    } else if (ch === ";") {
      if (cur.trim()) items.push({ type: "decl", text: cur.trim() });
      cur = "";
      i++;
    } else {
      cur += ch;
      i++;
    }
  }
  if (cur.trim() && !cur.includes("{") && !cur.includes("}"))
    items.push({ type: "decl", text: cur.trim() });
  return items;
}

function splitDecl(text: string): [string, string] | null {
  if (!text || text.includes("{") || text.includes("}")) return null;
  const c = text.indexOf(":");
  if (c === -1) return null;
  return [text.slice(0, c).trim(), text.slice(c + 1).trim()];
}

function splitSelectors(sel: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    else if (ch === ")" && depth > 0) depth--;
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Recursive @layer/@media/@supports/@starting-style/`&`-nesting-aware parse. */
export function parseUpstream(css: string): {
  rules: URule[];
  keyframes: Set<string>;
  properties: Set<string>;
} {
  const rules: URule[] = [];
  const keyframes = new Set<string>();
  const properties = new Set<string>();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

  const emitRule = (
    selectors: string[],
    items: BodyItem[],
    layer: string,
  ): void => {
    const decls: Array<[string, string]> = [];
    for (const it of items) {
      if (it.type === "decl") {
        const d = splitDecl(it.text);
        if (d !== null && d[0] && d[1]) decls.push(d);
      } else if (it.type === "at") {
        const lm = /^@layer\s+([^{\s]+)/.exec(it.header);
        if (lm?.[1] !== undefined) {
          emitRule(selectors, bodyItems(it.body), lm[1]);
        } else if (
          it.header.startsWith("@media") ||
          it.header.startsWith("@supports") ||
          it.header.startsWith("@starting-style")
        ) {
          emitRule(selectors, bodyItems(it.body), layer);
        }
      } else {
        const resolved: string[] = [];
        for (const parent of selectors) {
          if (it.sel.includes("&"))
            for (const s of splitSelectors(it.sel)) {
              const r = s.replace(/&/g, parent).trim();
              if (r) resolved.push(r);
            }
          else resolved.push(`${parent} ${it.sel}`.trim());
        }
        emitRule(resolved, bodyItems(it.body), layer);
      }
    }
    if (decls.length > 0 && selectors.some(Boolean))
      rules.push({ selectors: selectors.filter(Boolean), decls, layer });
  };

  const walk = (text: string, layer: string): void => {
    for (const it of bodyItems(text)) {
      if (it.type === "decl") continue;
      if (it.type === "at") {
        if (it.header.startsWith("@keyframes")) {
          const nm = /@keyframes\s+([\w-]+)/.exec(it.header)?.[1];
          if (nm) keyframes.add(nm);
        } else if (it.header.startsWith("@property")) {
          const nm = /@property\s+(--[\w-]+)/.exec(it.header)?.[1];
          if (nm) properties.add(nm);
        } else {
          const lm = /^@layer\s+([^{\s]+)/.exec(it.header);
          if (lm?.[1] !== undefined) walk(it.body, lm[1]);
          else if (
            it.header.startsWith("@media") ||
            it.header.startsWith("@supports") ||
            it.header.startsWith("@starting-style")
          )
            walk(it.body, layer);
        }
      } else {
        if (it.sel.startsWith("@")) continue;
        const selectors = splitSelectors(it.sel);
        if (selectors.length === 0) continue;
        emitRule(selectors, bodyItems(it.body), layer);
      }
    }
  };
  walk(clean, "top");
  return { rules, keyframes, properties };
}

/** Undo CSS escapes relevant here (`\:` → `:`, `\32 ` → `2`, `\/` → `/`). */
export function unescapeSel(sel: string): string {
  return sel.replace(/\\32\s/g, "2").replace(/\\(.)/g, "$1");
}

/** Strip responsive/state variant prefixes (`.sm\:btn` → `.btn`). */
export function stripVariants(sel: string): string {
  return sel.replace(
    /(^|[\s,>+~(.])(?:sm|md|lg|xl|2xl|max-[\w-]+|min-[\w-]+|hover|focus|active|disabled|dark|light|rtl|ltr|print|motion-safe|motion-reduce|contrast-more|forced-colors):/g,
    "$1",
  );
}

/** Parse Uno-generated CSS (with `/* layer: X * /` markers) with the same
 *  nesting-aware machinery as upstream: wrap each layer chunk in `@layer`
 *  so nested `&` / `@media` resolve identically on both sides. */
export function parseUno(css: string): URule[] {
  const parts = css.split(/\/\* layer: ([^*]+) \*\//);
  let wrapped = parts[0] ?? "";
  for (let p = 1; p < parts.length; p += 2) {
    const layer = (parts[p] ?? "default").trim().replace(/[^\w.-]/g, "");
    wrapped += `@layer ${layer || "default"}{${parts[p + 1] ?? ""}}`;
  }
  return parseUpstream(wrapped).rules;
}

/** Classes living in @layer daisyui* (official component classes). */
export function upstreamDaisyClasses(rules: URule[]): string[] {
  const out = new Set<string>();
  for (const r of rules) {
    if (!r.layer.startsWith("daisyui")) continue;
    for (const sel of r.selectors) {
      for (const m of unescapeSel(sel).matchAll(/\.([a-z][a-z0-9-_]*)/gi)) {
        const c = m[1]?.toLowerCase();
        if (c && !VARIANT_PREFIXES.has(c) && !LAYER_ARTIFACTS.has(c))
          out.add(c);
      }
    }
  }
  return [...out].sort();
}

/** Split on a delimiter ignoring paren-nested occurrences. */
function splitTop(s: string, delim: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")" && depth > 0) depth--;
    if (ch === delim && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function normVal(v: string, prop?: string): string {
  let s = v.trim().replace(/\s+/g, " ").toLowerCase();
  // Slash separators never depend on surrounding whitespace.
  s = s.replace(/\s*\/\s*/g, "/");
  s = s.replace(/3\.40282e38px/g, "calc(infinity * 1px)");
  // `transparent` ≡ `#0000` (both transparent black, computed-identical).
  s = s.replace(/\btransparent\b/g, "#0000");
  // LightningCSS drops whitespace after commas (`var(--x,#0000)`);
  // our ports keep the source form (`var(--x, #0000)`). Same behavior.
  s = s.replace(/,\s*/g, ",");
  // ...and between `)` and a function name (`scaleY(5)translate(`).
  s = s.replace(/\)\s+(?=[a-z])/g, ")");
  // oklch alpha as fraction ≡ percent (`0% 0 0/.05` ≡ `0% 0 0/5%`).
  s = s.replace(
    /\/\s*0?\.(\d+)/g,
    (_m, d: string) => `/${Number(`0.${d}`) * 100}%`,
  );
  s = s.replace(/\/\s*0\b(?!%)/g, "/0%");
  // `<time>ms` ≡ `<time/1000>s` (`20ms` ≡ `0.02s`).
  s = s.replace(/(\d[\d.]*)ms\b/g, (_m, n: string) => `${Number(n) / 1000}s`);
  // `scale:95%` ≡ `scale:.95`, `opacity:40%` ≡ `opacity:.4` (percent form).
  if (prop === "scale" || prop === "opacity") {
    s = s.replace(/(\d[\d.]*)%/g, (_m, n: string) => {
      const v = Number(n) / 100;
      return `${Math.round(v * 10000) / 10000}`;
    });
  }
  // `transform-origin:50% 50%` ≡ `50%` (LightningCSS drops the repeat).
  if (prop === "transform-origin" || prop === "perspective-origin") {
    const parts = s.split(/\s+/);
    if (parts.length === 2 && parts[0] === parts[1] && parts[0] !== undefined)
      s = parts[0];
  }
  // Bare zero ≡ zero with any length/angle/time unit (`0px` ≡ `0`).
  s = s.replace(
    /\b0(px|rem|em|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|q|in|pt|pc|deg|grad|rad|turn|s|ms)\b/g,
    "0",
  );
  if (prop === "translate") {
    s = s.replace(/\s+0(%|px|rem|em)?$/u, "");
    if (s === "") s = "0";
  }
  if (prop === "aspect-ratio") {
    const m = /^([\d.]+)\s*\/\s*\1$/.exec(s);
    if (m?.[1] !== undefined) s = m[1];
  }
  // `background:0 0` ≡ `background:transparent` (both reset to transparent).
  if (
    prop === "background" &&
    (s === "0 0" || s === "transparent" || s === "#0")
  )
    s = "bg-reset";
  // (`currentColor -1% 10%` ≡ `currentColor -1%,currentColor 10%`).
  s = s.replace(/([^\s,()]+)\s+(-?[\d.]+%)\s+(-?[\d.]+%)/g, "$1 $2,$1 $3");
  // Omitted spread ≡ `0` (`0 1px 3px oklch(...)` ≡ `0 1px 3px 0 oklch(...)`).
  // `inset` position is insignificant (`inset 0 1px ...` ≡ `0 1px ... inset`).
  if (prop === "box-shadow" || prop === "text-shadow") {
    const canon = (part: string): string => {
      const inset = /\binset\b/.test(part);
      const noInset = part
        .replace(/\binset\b\s*/g, "")
        .replace(/\s+\binset\b/g, "")
        .trim();
      const toks = splitTop(noInset, " ").filter(Boolean);
      if (
        toks.length === 4 &&
        toks[3] !== undefined &&
        /^(?:oklch|oklab|rgb|rgba|hsl|hsla|color|var|#)/.test(toks[3])
      )
        return `${inset ? "inset " : ""}${toks[0]} ${toks[1]} ${toks[2]} 0 ${toks[3]}`;
      return `${inset ? "inset " : ""}${noInset}`;
    };
    s = splitTop(s, ",")
      .map((part) => canon(part.trim()))
      .join(",");
  }
  // Trailing zero translate ≡ single value (`-100% 0` ≡ `-100%`).
  // Round all numbers first so later token sorting sees canonical forms
  // (`0.2s` ≡ `.2s`; otherwise sort order diverges on leading zeros).
  s = s.replace(/-?\d*\.?\d+(e-?\d+)?/g, (m) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m;
    return String(Math.round(n * 1000) / 1000);
  });
  // Animation/transition keyword order is insignificant; sort tokens per
  // comma-part so `progress 5s ease-in-out infinite` ≡ the compiled order.
  // (Duration-vs-delay position only matters with two time values from
  // different sources — not the case for same-source ports.)
  if (prop === "animation" || prop === "transition") {
    s = splitTop(s, ",")
      .map((part) =>
        splitTop(part, " ")
          .map((t) => t.trim())
          .filter(Boolean)
          .sort()
          .join(" "),
      )
      .join(",");
  }
  return s;
}

/** Value equivalence incl. mask/background-position keywords and
 *  `outline` color default (`2px solid` ≡ `2px solid currentColor`). */
export function equivVal(prop: string, a: string, b: string): boolean {
  const na = normVal(a, prop);
  const nb = normVal(b, prop);
  if (na === nb) return true;
  if (prop === "outline") {
    const withColor = (v: string): string =>
      /^\S+ \S+$/.test(v) ? `${v} currentcolor` : v;
    if (withColor(na) === withColor(nb)) return true;
  }
  if (prop === "mask-position" || prop === "background-position") {
    const eq = (v: string): string =>
      v === "50%"
        ? "center"
        : v === "0%" || v === "0"
          ? "left"
          : v === "100%"
            ? "right"
            : v;
    if (eq(na) === eq(nb)) return true;
  }
  return false;
}

export interface SelSig {
  classes: Set<string>;
  negated: Set<string>;
  pseudos: Set<string>;
}

/** Normalized selector signature: required classes, :not() classes,
 *  known pseudos. `:first-child` ≡ `:nth-child(1)`, `::x` ≡ `:x`. */
export function selSig(sel: string): SelSig {
  const classes = new Set<string>();
  const negated = new Set<string>();
  const pseudos = new Set<string>();
  let s = stripVariants(unescapeSel(sel));
  // Attribute quote style is insignificant for matching
  // (`[dir=rtl]` ≡ `[dir="rtl"]`, compiled form drops quotes).
  s = s.replace(/\[([\w-]+)="([\w-]+)"\]/g, "[$1=$2]");
  // Pull :not(...) args into negated (handle one nesting level).
  s = s.replace(
    /:not\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
    (_m, args: string) => {
      for (const m of String(args).matchAll(/\.([a-z][a-z0-9-_]*)/gi)) {
        const c = m[1]?.toLowerCase();
        if (c) negated.add(c);
      }
      return "";
    },
  );
  for (const m of s.matchAll(/\.([a-z][a-z0-9-_]*)/gi)) {
    const c = m[1]?.toLowerCase();
    if (c && !VARIANT_PREFIXES.has(c) && !LAYER_ARTIFACTS.has(c))
      classes.add(c);
  }
  for (const m of s.matchAll(/::?([\w-]+)(\([^)]*\))?/g)) {
    let name = m[1]?.toLowerCase();
    if (name === undefined) continue;
    if (name === "where" || name === "is" || name === "not" || name === "has")
      continue;
    let args = (m[2] ?? "").toLowerCase().replace(/\s+/g, "");
    if (name === "nth-child" && args === "(1)") {
      name = "first-child";
      args = "";
    }
    if (name === "nth-of-type" && args === "(1)") {
      name = "first-of-type";
      args = "";
    }
    if (name === "nth-last-child" && args === "(1)") {
      name = "last-child";
      args = "";
    }
    if (!KNOWN_PSEUDOS.has(name)) continue;
    pseudos.add(`:${name}${args}`);
  }
  return { classes, negated, pseudos };
}

function setEq(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function setSub(a: Set<string>, b: Set<string>): boolean {
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export interface FlatRule {
  sig: SelSig;
  decls: Array<[string, string]>;
  raw: string;
}

export function flattenRules(rules: URule[]): FlatRule[] {
  const out: FlatRule[] = [];
  for (const r of rules)
    for (const s of r.selectors)
      for (const v of expandBranches(s))
        out.push({ sig: selSig(v), decls: r.decls, raw: s });
  return out;
}

/**
 * Expand top-level `:is(a,b)` / `:where(a,b)` branches into variants so a
 * combined upstream selector is covered branch-wise (our ports split such
 * selectors into per-branch rules with identical declarations — same
 * behavior, different grouping). Recursion capped to avoid blowup.
 */
function expandBranches(sel: string, depth = 0): string[] {
  if (depth > 3) return [sel];
  const s = sel;
  let i = 0;
  while (i < s.length) {
    const k =
      s.startsWith(":is(", i) || s.startsWith(":where(", i)
        ? i
        : s.startsWith(":not(", i) || s.startsWith(":has(", i)
          ? -2
          : -1;
    if (k === -1) {
      i++;
      continue;
    }
    if (k === -2) {
      // Skip :not/:has blocks entirely (args handled by selSig).
      let d = 0;
      let j = i;
      for (; j < s.length; j++) {
        if (s[j] === "(") d++;
        else if (s[j] === ")") {
          d--;
          if (d === 0) break;
        }
      }
      i = j + 1;
      continue;
    }
    const open = s.indexOf("(", k);
    let d = 0;
    let j = open;
    for (; j < s.length; j++) {
      if (s[j] === "(") d++;
      else if (s[j] === ")") {
        d--;
        if (d === 0) break;
      }
    }
    const inner = s.slice(open + 1, j);
    const args = splitSelectors(inner);
    if (args.length < 2) {
      i = j + 1;
      continue;
    }
    const out: string[] = [];
    for (const a of args)
      out.push(
        ...expandBranches(s.slice(0, k) + a.trim() + s.slice(j + 1), depth + 1),
      );
    return out;
  }
  return [sel];
}

export interface CoverageMiss {
  selector: string;
  reason: string;
}

const SKIP_PROPS = new Set(["scrollbar-color", "position-anchor"]);

/**
 * No-loss coverage: every upstream selector must be matched by Uno
 * selectors that are wider-or-equal (Uno requires a subset of the classes,
 * same negated set, same pseudos) whose UNION carries every declaration
 * (normalized, grid-area/border expandable). Union semantics mirror the
 * browser cascade for split rules (our base object + size object both feed
 * `.dock`); state overrides live under different pseudos so they can't
 * leak across sigs. Widening (our flat `.tab` vs upstream
 * `.tab:is(.tabs>.tab)`) passes; narrowing fails.
 */
export function coverageMisses(
  upstreamFlat: FlatRule[],
  unoFlat: FlatRule[],
): CoverageMiss[] {
  // Index Uno selectors by first class for speed.
  const byClass = new Map<string, FlatRule[]>();
  for (const u of unoFlat)
    for (const c of u.sig.classes) {
      let arr = byClass.get(c);
      if (arr === undefined) {
        arr = [];
        byClass.set(c, arr);
      }
      arr.push(u);
    }
  const misses: CoverageMiss[] = [];
  for (const up of upstreamFlat) {
    if (up.sig.classes.size === 0) continue;
    const first = [...up.sig.classes][0];
    if (first === undefined) continue;
    const cands =
      byClass.get(first) ?? unoFlat.filter((u) => u.sig.classes.size === 0);
    // Union declarations across all compatible Uno selectors.
    const have = new Map<string, string[]>();
    let sigHit = false;
    for (const u of cands) {
      if (!setSub(u.sig.classes, up.sig.classes)) continue;
      if (!setEq(u.sig.negated, up.sig.negated)) continue;
      if (!setEq(u.sig.pseudos, up.sig.pseudos)) continue;
      sigHit = true;
      for (const [p, v] of u.decls) {
        const arr = have.get(p) ?? [];
        arr.push(v);
        have.set(p, arr);
        if (p === "grid-area") {
          for (const g of ["grid-column", "grid-row"]) {
            const ga = have.get(g) ?? [];
            ga.push(v);
            have.set(g, ga);
          }
        }
      }
    }
    if (!sigHit) {
      misses.push({
        selector: up.raw.length > 160 ? `${up.raw.slice(0, 160)}…` : up.raw,
        reason: "no selector",
      });
      continue;
    }
    {
      // Declaration check against the union.
      const lacking: string[] = [];
      for (const [p, v] of up.decls) {
        if (SKIP_PROPS.has(p)) continue;
        if (p === "grid-area") {
          const gc = have.get("grid-column");
          const gr = have.get("grid-row");
          if (have.get(p) !== undefined || (gc && gr)) continue;
          lacking.push(p);
          continue;
        }
        if (p === "overflow") {
          // Two-value `overflow: auto hidden` ≡ `overflow-x: auto` +
          // `overflow-y: hidden` (our ports split the axes). Order: x y.
          const ours = have.get(p);
          if (ours !== undefined && [...ours].some((o) => equivVal(p, v, o)))
            continue;
          const parts = normVal(v, p).split(/\s+/);
          // A bare `overflow` shorthand on our side doubles as the missing
          // axis (`overflow:hidden` + `overflow-x:auto` ≡ `auto hidden`).
          const oxRaw = have.get("overflow-x");
          const oyRaw = have.get("overflow-y");
          const single = (have.get("overflow") ?? []).find(
            (o) => !o.includes(" "),
          );
          const ox = oxRaw ?? (single !== undefined ? [single] : undefined);
          const oy = oyRaw ?? (single !== undefined ? [single] : undefined);
          if (
            parts.length === 2 &&
            ox !== undefined &&
            oy !== undefined &&
            parts[0] !== undefined &&
            parts[1] !== undefined &&
            [...ox].some((o) =>
              equivVal("overflow-x", parts[0] as string, o),
            ) &&
            [...oy].some((o) => equivVal("overflow-y", parts[1] as string, o))
          )
            continue;
          lacking.push(`${p}: ${v}`);
          continue;
        }
        if (p === "border") {
          // Upstream keeps `border: <width> solid <color>`; our ports
          // expand the shorthand to longhands. Same computed behavior.
          const ours = have.get(p);
          if (ours !== undefined && [...ours].some((o) => equivVal(p, v, o)))
            continue;
          const parts = normVal(v).split(/\s+/);
          const w = parts[0];
          const s = parts[1];
          const c = parts.slice(2).join(" ");
          const matchLong = (lp: string, lv: string | undefined): boolean => {
            if (lv === undefined) return false;
            const vs = have.get(lp);
            return vs !== undefined && vs.some((o) => equivVal(lp, lv, o));
          };
          if (
            parts.length >= 3 &&
            matchLong("border-width", w) &&
            matchLong("border-style", s) &&
            matchLong("border-color", c)
          )
            continue;
          lacking.push(`${p}: ${v}`);
          continue;
        }
        if (p === "gap") {
          // Two-value `gap: row col` ≡ `row-gap` + `column-gap`.
          const ours = have.get(p);
          if (ours !== undefined && [...ours].some((o) => equivVal(p, v, o)))
            continue;
          const parts = normVal(v, p).split(/\s+/);
          const gr = have.get("row-gap");
          const gc = have.get("column-gap");
          if (
            parts.length === 2 &&
            gr !== undefined &&
            gc !== undefined &&
            parts[0] !== undefined &&
            parts[1] !== undefined &&
            [...gr].some((o) => equivVal("row-gap", parts[0] as string, o)) &&
            [...gc].some((o) => equivVal("column-gap", parts[1] as string, o))
          )
            continue;
          lacking.push(`${p}: ${v}`);
          continue;
        }
        if (
          p === "place-items" ||
          p === "place-self" ||
          p === "place-content"
        ) {
          // `place-items: A B` ≡ `align-items:A` + `justify-items:B`
          // (single value feeds both axes).
          const ours = have.get(p);
          if (ours !== undefined && [...ours].some((o) => equivVal(p, v, o)))
            continue;
          const axis =
            p === "place-items"
              ? "items"
              : p === "place-self"
                ? "self"
                : "content";
          const parts = normVal(v, p).split(/\s+/);
          const one = parts.length === 1 ? parts[0] : undefined;
          const first = parts.length === 2 ? parts[0] : one;
          const second = parts.length === 2 ? parts[1] : one;
          const va = have.get(`align-${axis}`);
          const vj = have.get(`justify-${axis}`);
          if (
            first !== undefined &&
            second !== undefined &&
            va !== undefined &&
            vj !== undefined &&
            [...va].some((o) => equivVal(`align-${axis}`, first, o)) &&
            [...vj].some((o) => equivVal(`justify-${axis}`, second, o))
          )
            continue;
          lacking.push(`${p}: ${v}`);
          continue;
        }
        if (
          p === "margin-inline" ||
          p === "padding-inline" ||
          p === "inset-inline"
        ) {
          // `margin-inline: A B` ≡ `-start:A` + `-end:B` (LightningCSS
          // merges our split longhands; same computed behavior).
          const ours = have.get(p);
          if (ours !== undefined && [...ours].some((o) => equivVal(p, v, o)))
            continue;
          const base = p.slice(0, -7);
          const parts = normVal(v, p).split(/\s+/);
          const ss = have.get(`${base}-start`);
          const se = have.get(`${base}-end`);
          const one = parts.length === 1 ? parts[0] : undefined;
          const first = parts.length === 2 ? parts[0] : one;
          const second = parts.length === 2 ? parts[1] : one;
          if (
            first !== undefined &&
            second !== undefined &&
            ss !== undefined &&
            se !== undefined &&
            [...ss].some((o) => equivVal(`${base}-start`, first, o)) &&
            [...se].some((o) => equivVal(`${base}-end`, second, o))
          )
            continue;
          lacking.push(`${p}: ${v}`);
          continue;
        }
        const vs = have.get(p);
        if (vs === undefined) {
          lacking.push(p);
          continue;
        }
        if (!vs.some((o) => equivVal(p, v, o))) {
          lacking.push(`${p}: ${v}`);
          break;
        }
      }
      if (lacking.length > 0)
        misses.push({
          selector: up.raw.length > 160 ? `${up.raw.slice(0, 160)}…` : up.raw,
          reason: `decls [${lacking.join("; ")}]`,
        });
    }
  }
  return misses;
}

export async function unoBulk(
  classes: string[],
  opts: { preflights?: boolean } = {},
): Promise<{ css: string; rules: ReturnType<typeof parseCss> }> {
  const gen = await createGenerator({
    presets: [presetUno(), presetDaisy()],
    separators: [":"],
  });
  const { css } = await gen.generate(classes.join(" "), {
    preflights: opts.preflights ?? false,
  });
  return { css, rules: parseCss(css) };
}
