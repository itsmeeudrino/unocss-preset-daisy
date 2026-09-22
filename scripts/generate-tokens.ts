// scripts/generate-tokens.ts — upstream themes -> src/theme/tokens.ts bridge.
// Source: https://github.com/saadeghi/daisyui @ v5.7.43 (one-time hard fork, no auto-sync)
// Reads variable *names* (never oklch values) from:
//   - packages/daisyui/functions/variables.js   (colors + borderRadius map)
//   - packages/daisyui/functions/variables.css  (@theme var declarations)
//   - packages/daisyui/src/themes/light.css     (depth/noise/size/border verification)
// Emits: src/theme/tokens.ts exporting daisyTheme() returning
//   { extend: { colors: { <name>: 'var(--color-<name>)', ... } } }
//   plus radius/size/depth/noise/border var bridges.
// Usage: bun run tokens  (bun scripts/generate-tokens.ts)
// Notes: Bun + ESM only, no new deps. Fetch failures fall back to the v5.7.43
// var set so the file is always (re)generatable offline. Never emit oklch values.

export {};

const RAW_BASE =
  "https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui";
const OUT_PATH = "src/theme/tokens.ts";
const FORK_REF = "daisyui@v5.7.43";

// Fallback var set for daisyui@v5.7.43 (mirrors functions/variables.js +
// functions/variables.css + src/themes/light.css). Used when fetch fails.
const FALLBACK_COLORS = [
  "base-100",
  "base-200",
  "base-300",
  "base-content",
  "primary",
  "primary-content",
  "secondary",
  "secondary-content",
  "accent",
  "accent-content",
  "neutral",
  "neutral-content",
  "info",
  "info-content",
  "success",
  "success-content",
  "warning",
  "warning-content",
  "error",
  "error-content",
];
const FALLBACK_RADIUS = ["selector", "field", "box"];
const FALLBACK_SIZE = ["selector", "field"];
const FALLBACK_SINGLETONS = ["border", "depth", "noise"];

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/plain, */*",
        "User-Agent": "unocss-preset-daisy-tokens",
      },
    });
    if (!res.ok) {
      console.warn(`warn: fetch ${url} -> HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(
      `warn: fetch ${url} failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

/** Collect all `var(--...)` names referenced in a file. */
function collectVarRefs(text: string): Set<string> {
  const out = new Set<string>();
  const re = /var\(\s*(--[\w-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    if (name !== undefined) out.add(name);
  }
  return out;
}

/** Collect all `--var: ...` declarations in a CSS file. */
function collectVarDecls(css: string): Set<string> {
  const out = new Set<string>();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /(--[\w-]+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const name = m[1];
    if (name !== undefined) out.add(name);
  }
  return out;
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const [variablesJs, variablesCss, lightCss] = await Promise.all([
  fetchText(`${RAW_BASE}/functions/variables.js`),
  fetchText(`${RAW_BASE}/functions/variables.css`),
  fetchText(`${RAW_BASE}/src/themes/light.css`),
]);

let colors = [...FALLBACK_COLORS];
let radius = [...FALLBACK_RADIUS];
let sizes = [...FALLBACK_SIZE];
let singletons = [...FALLBACK_SINGLETONS];
let fromNetwork = false;

if (variablesJs || variablesCss || lightCss) {
  // Union of every var name seen across the three sources.
  const seen = new Set<string>();
  if (variablesJs) for (const v of collectVarRefs(variablesJs)) seen.add(v);
  if (variablesCss) {
    for (const v of collectVarRefs(variablesCss)) seen.add(v);
    for (const v of collectVarDecls(variablesCss)) seen.add(v);
  }
  if (lightCss) for (const v of collectVarDecls(lightCss)) seen.add(v);

  if (seen.size > 0) {
    const pick = (prefix: string): string[] =>
      [...seen]
        .filter((v) => v.startsWith(prefix))
        .map((v) => v.slice(prefix.length))
        .filter(Boolean);
    // Preserve upstream canonical order (fallback order); append any new
    // vars alphabetically so diffs stay stable across runs.
    const orderByFallback = (got: string[], fallback: string[]): string[] => {
      const set = new Set(got);
      const ordered = fallback.filter((w) => set.has(w));
      const extras = got.filter((g) => !fallback.includes(g)).sort();
      return [...ordered, ...extras];
    };
    const c = pick("--color-");
    const r = pick("--radius-");
    const s = pick("--size-");
    // Only adopt network values when they cover the known fallback set
    // (guards against truncated/rate-limited responses).
    const covers = (got: string[], want: string[]): boolean =>
      want.every((w) => got.includes(w));
    if (c.length > 0 && covers(c, FALLBACK_COLORS)) {
      colors = orderByFallback(c, FALLBACK_COLORS);
      fromNetwork = true;
    } else if (c.length > 0) {
      console.warn(
        `warn: upstream colors incomplete (${c.length}), keeping fallback set`,
      );
    }
    if (r.length > 0 && covers(r, FALLBACK_RADIUS))
      radius = orderByFallback(r, FALLBACK_RADIUS);
    if (s.length > 0 && covers(s, FALLBACK_SIZE))
      sizes = orderByFallback(s, FALLBACK_SIZE);
    const singles = FALLBACK_SINGLETONS.filter((n) => seen.has(`--${n}`));
    if (singles.length === FALLBACK_SINGLETONS.length) singletons = singles;
    console.log(
      `tokens: discovered ${seen.size} vars from network (colors=${c.length} radius=${r.length} size=${s.length})`,
    );
  } else {
    console.warn("warn: no vars discovered from network, using fallback set");
  }
} else {
  console.warn(
    "warn: all theme fetches failed (offline?). Using fallback var set.",
  );
}

const lines: string[] = [];
lines.push(`// Generated by \`bun run tokens\` from ${FORBID_OKLCH()}`);
lines.push(
  `// Do not hand-edit oklch values. Values live verbatim in src/theme/themes.css.`,
);
lines.push(
  `// Bridge: upstream CSS vars (packages/daisyui functions/variables.js + variables.css,`,
);
lines.push(
  `// verified against src/themes/light.css) -> Uno theme.extend.colors.`,
);
lines.push(``);
lines.push(
  `/** All daisyUI theme variable names (values live in themes.css). */`,
);
lines.push(`export const daisyThemeVars = [`);
for (const c of colors) lines.push(`  '--color-${esc(c)}',`);
for (const r of radius) lines.push(`  '--radius-${esc(r)}',`);
for (const s of sizes) lines.push(`  '--size-${esc(s)}',`);
for (const n of singletons) lines.push(`  '--${esc(n)}',`);
lines.push(`] as const;`);
lines.push(``);
lines.push(`/** \`--color-*\` bridge: Uno color name -> CSS var reference. */`);
lines.push(`export const daisyColors = {`);
for (const c of colors) {
  const key =
    /^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(c) && !c.includes("-")
      ? c
      : `'${esc(c)}'`;
  // Keys with dashes need quoting; keep simple: always quote dashed names.
  if (c.includes("-")) lines.push(`  '${esc(c)}': 'var(--color-${esc(c)})',`);
  else lines.push(`  ${key}: 'var(--color-${esc(c)})',`);
}
lines.push(`} as const;`);
lines.push(``);
lines.push(
  `/** \`--radius-*\` bridge. Mirrors upstream variables.js borderRadius. */`,
);
lines.push(`export const daisyBorderRadius = {`);
for (const r of radius) lines.push(`  ${r}: 'var(--radius-${esc(r)})',`);
lines.push(`} as const;`);
lines.push(``);
lines.push(`/** \`--size-*\` bridge (field/selector sizing vars). */`);
lines.push(`export const daisySizes = {`);
for (const s of sizes) lines.push(`  ${s}: 'var(--size-${esc(s)})',`);
lines.push(`} as const;`);
lines.push(``);
lines.push(`/** Singleton theme vars: depth / noise / border. */`);
lines.push(`export const daisySingletons = {`);
for (const n of singletons) lines.push(`  ${n}: 'var(--${esc(n)})',`);
lines.push(`} as const;`);
lines.push(``);
lines.push(`/**`);
lines.push(` * Uno theme bridge for daisyUI themes.`);
lines.push(` *`);
lines.push(
  ` * Maps Uno \`theme.extend.colors\` to the CSS vars declared by themes.css,`,
);
lines.push(
  ` * so \`bg-primary\` / \`text-base-content\` etc. resolve to the active theme`,
);
lines.push(
  ` * (\`:root\` or \`[data-theme=...]\`). Radius/size/depth/noise/border vars`,
);
lines.push(` * are exposed alongside colors for shortcuts/rules to consume.`);
lines.push(` *`);
lines.push(
  ` * Accepts the resolved preset options (only \`themes\` is read; present for`,
);
lines.push(
  ` * API symmetry with the other preset parts). Never contains oklch values.`,
);
lines.push(` */`);
lines.push(
  `export function daisyTheme(_opts: { themes?: string[] | false } = {}): Record<string, any> {`,
);
lines.push(`  void _opts;`);
lines.push(`  return {`);
lines.push(`    extend: {`);
lines.push(`      colors: { ...daisyColors },`);
lines.push(`      borderRadius: { ...daisyBorderRadius },`);
lines.push(
  `      // daisyUI-specific vars (verbatim names; values in themes.css)`,
);
lines.push(`      size: { ...daisySizes },`);
lines.push(`      depth: 'var(--depth)',`);
lines.push(`      noise: 'var(--noise)',`);
lines.push(`      border: 'var(--border)',`);
lines.push(`    },`);
lines.push(`  };`);
lines.push(`}`);
lines.push(``);
lines.push(`export default daisyTheme;`);
lines.push(``);

function FORBID_OKLCH(): string {
  return `${FORK_REF}. Source: packages/daisyui/functions/variables.{js,css} + src/themes/light.css.`;
}

await Bun.write(OUT_PATH, lines.join("\n"));
console.log(
  `tokens: colors=${colors.length} radius=${radius.length} sizes=${sizes.length} singletons=${singletons.length} ${fromNetwork ? "(from network)" : "(fallback)"} -> ${OUT_PATH}`,
);
