import type { Preset, StaticRule } from "unocss";
import { shouldInclude } from "../options.ts";

// Port of `packages/daisyui/src/utilities/*.css`: glass, join, radius, typography.
// Upstream `@apply` deps are expanded to raw CSS (see `scripts/inventory-apply.ts`):
//   inline-flex -> display:inline-flex, items-stretch -> align-items:stretch,
//   flex-col -> flex-direction:column, flex-row -> flex-direction:row,
//   z-1/z-2 -> z-index:1/2.
//
// `join` covers the base + `@scope` descendants (focus/hover z-index,
// first/last/only-child radius vars, `:not(:first-child)` negative margins)
// expanded to flat selectors (`:scope` -> `.join`; `:where()` kept for
// zero-specificity parity). `join-item` covers base + child reset +
// enabled/disabled margin/border branches. `glass`/`radius` are verbatim ports
// (no `@apply` upstream; radius 3 kinds x 9 shapes = 27 rules, verified
// against `src/utilities/radius.css`). `typography` ports upstream
// `src/utilities/typography.css` fully (`:root .prose` vars + nested
// `:where(code)` block); full prose styling comes from
// `@unocss/preset-typography` alongside the preset (see docs/uno.config.ts).

interface UtilityOpts {
  prefix: string;
  include: string[];
  exclude: string[];
}

const LAYER = "utilities";

function stat(key: string, body: Record<string, string>): StaticRule {
  return [key, body, { layer: LAYER }];
}

// `.prose` CSS vars, verbatim from upstream `src/utilities/typography.css`.
const PROSE_VARS: Record<string, string> = {
  "--tw-prose-body":
    "color-mix(in oklab, var(--color-base-content) 80%, #0000)",
  "--tw-prose-headings": "var(--color-base-content)",
  "--tw-prose-lead": "var(--color-base-content)",
  "--tw-prose-links": "var(--color-base-content)",
  "--tw-prose-bold": "var(--color-base-content)",
  "--tw-prose-counters": "var(--color-base-content)",
  "--tw-prose-bullets":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--tw-prose-hr": "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--tw-prose-quotes": "var(--color-base-content)",
  "--tw-prose-quote-borders":
    "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--tw-prose-captions":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--tw-prose-code": "var(--color-base-content)",
  "--tw-prose-pre-code": "var(--color-neutral-content)",
  "--tw-prose-pre-bg": "var(--color-neutral)",
  "--tw-prose-th-borders":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--tw-prose-td-borders":
    "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--tw-prose-kbd": "color-mix(in oklab, var(--color-base-content) 80%, #0000)",
};

export function utilityRules(opts: UtilityOpts): Preset["rules"] {
  const p = opts.prefix ?? "";
  const rules: StaticRule[] = [];
  // Raw-string rules (child selectors a static key cannot express).
  const rawRules: Array<[string, string[], { layer: string }]> = [];
  const inc = (name: string) =>
    shouldInclude(name, opts.include ?? [], opts.exclude ?? []);

  if (inc("join")) {
    rules.push(
      stat(`${p}join`, {
        display: "inline-flex",
        "align-items": "stretch",
        "--join-ss": "0",
        "--join-se": "0",
        "--join-es": "0",
        "--join-ee": "0",
        "--join-ml": "0",
        "--join-mt": "0",
        "--join-v": "0",
        "--join-h": "1",
      }),
      // NOTE: no `join-item` stat() here — its base + child reset +
      // enabled/disabled branches live together in one raw rule below
      // (duplicate keys would collide).
      stat(`${p}join-vertical`, {
        "flex-direction": "column",
        "--join-v": "1",
        "--join-h": "0",
      }),
      stat(`${p}join-horizontal`, {
        "flex-direction": "row",
        "--join-v": "0",
        "--join-h": "1",
      }),
    );
    // Upstream `@scope (&)` descendants, expanded flat (`:scope` -> `.join`).
    // Focus/hover z-index (`z-2`/`z-1` -> `z-index`), first/last/only-child
    // radius vars, `:not(:first-child)` negative margins — verified against
    // `packages/daisyui/src/utilities/join.css`. `:where()` wrappers kept so
    // var-setting rules stay zero-specificity (source order decides
    // first/last/only overlap, as upstream). Nested `.btn` is prefixed too.
    const J = `.${p}join`;
    const B = `.${p}btn`;
    const BD = `.${p}btn-disabled`;
    const JI = `.${p}join-item`;
    rawRules.push([
      `${p}join-item`,
      [
        // join-item base + `> *` var reset (upstream l1.l2.l3.l4).
        `${JI}{border-style:solid;border-width:var(--border, 1px);border-start-start-radius:var(--join-ss);border-start-end-radius:var(--join-se);border-end-start-radius:var(--join-es);border-end-end-radius:var(--join-ee);}` +
          `${JI}>*{--join-ss:initial;--join-se:initial;--join-es:initial;--join-ee:initial;}` +
          // join-item enabled/disabled branches (upstream, verbatim).
          `${JI}:not(:disabled, [disabled], ${BD}){margin-inline-start:var(--join-ml, 0);margin-block-start:var(--join-mt, 0);}` +
          `${JI}:is(:disabled, [disabled], ${BD}){border-width:var(--border, 1px);border-inline-end-width:calc(var(--border, 1px) * var(--join-v));border-block-end-width:calc(var(--border, 1px) * var(--join-h));}` +
          // @scope descendants: focus/hover elevation.
          `${J}>:where(:focus, :has(:focus)){z-index:2;}` +
          `@media (hover:hover){${J}>:where(${B}:hover, :has(${B}:hover)){z-index:1;}}` +
          // @scope descendants: first/last/only radius vars + collapse margins.
          `:where(${J}>:first-child){--join-ss:var(--radius-field);--join-se:calc(var(--radius-field) * var(--join-v));--join-es:calc(var(--radius-field) * var(--join-h));--join-ee:0;}` +
          `:where(${J}>:last-child){--join-ss:0;--join-se:calc(var(--radius-field) * var(--join-h));--join-es:calc(var(--radius-field) * var(--join-v));--join-ee:var(--radius-field);}` +
          `:where(${J}>:only-child){--join-ss:var(--radius-field);--join-se:var(--radius-field);--join-es:var(--radius-field);--join-ee:var(--radius-field);}` +
          `:where(${J}>:not(:first-child)){--join-ml:calc(var(--border, 1px) * -1 * var(--join-h));--join-mt:calc(var(--border, 1px) * -1 * var(--join-v));}`,
      ],
      { layer: LAYER },
    ]);
  }

  if (inc("glass")) {
    rules.push(
      stat(`${p}glass`, {
        border: "none",
        "backdrop-filter": "blur(var(--glass-blur, 40px))",
        "background-color": "#0000",
        "background-image":
          "linear-gradient(135deg, oklch(100% 0 0 / var(--glass-opacity, 30%)) 0%, oklch(0% 0 0 / 0%) 100%), " +
          "linear-gradient(var(--glass-reflect-degree, 100deg), oklch(100% 0 0 / var(--glass-reflect-opacity, 5%)) 25%, oklch(0% 0 0 / 0%) 25%)",
        "box-shadow":
          "0 0 0 1px oklch(100% 0 0 / var(--glass-border-opacity, 20%)) inset, 0 0 0 2px oklch(0% 0 0 / 5%)",
        "text-shadow":
          "0 1px oklch(0% 0 0 / var(--glass-text-shadow-opacity, 5%))",
      }),
    );
  }

  if (inc("radius")) {
    const vars: Record<string, string> = {
      box: "var(--radius-box)",
      field: "var(--radius-field)",
      selector: "var(--radius-selector)",
    };
    for (const [kind, v] of Object.entries(vars)) {
      rules.push(stat(`${p}rounded-${kind}`, { "border-radius": v }));
    }
    const dirs: Record<string, string[]> = {
      t: ["border-top-left-radius", "border-top-right-radius"],
      b: ["border-bottom-left-radius", "border-bottom-right-radius"],
      l: ["border-top-left-radius", "border-bottom-left-radius"],
      r: ["border-top-right-radius", "border-bottom-right-radius"],
      tl: ["border-top-left-radius"],
      tr: ["border-top-right-radius"],
      br: ["border-bottom-right-radius"],
      bl: ["border-bottom-left-radius"],
    };
    for (const [kind, v] of Object.entries(vars)) {
      for (const [dir, props] of Object.entries(dirs)) {
        rules.push(
          stat(
            `${p}rounded-${dir}-${kind}`,
            Object.fromEntries(props.map((k) => [k, v])),
          ),
        );
      }
    }
  }

  if (inc("typography")) {
    // Full port of upstream `src/utilities/typography.css` (`:root .prose`
    // vars + nested `:where(code):not(pre > code)` block). Key is the `prose`
    // token; bodies keep the upstream `:root .prose` selector (every `.prose`
    // is inside `:root`, so matching is identical to bare `.prose` with
    // upstream's higher specificity). Prefix applies to `.prose` only.
    // Full prose *styling* (headings/lists/quotes) comes from
    // `@unocss/preset-typography` alongside this preset (see docs/uno.config.ts
    // + example/uno.config.ts); these vars bridge it to daisy theme colors.
    const PR = `.${p}prose`;
    const varsBody = Object.entries(PROSE_VARS)
      .map(([k, v]) => `${k}:${v};`)
      .join("");
    rawRules.push([
      `${p}prose`,
      [
        `:root ${PR}{${varsBody}}` +
          `:root ${PR} :where(code):not(pre > code){background-color:var(--color-base-200);border-radius:var(--radius-selector);border:var(--border) solid var(--color-base-300);padding-inline:0.5em;padding-block:0.2em;font-weight:inherit;}` +
          `:root ${PR} :where(code):not(pre > code):before,:root ${PR} :where(code):not(pre > code):after{display:none;}`,
      ],
      { layer: LAYER },
    ]);
  }

  return [...rules, ...rawRules] as Preset["rules"];
}
