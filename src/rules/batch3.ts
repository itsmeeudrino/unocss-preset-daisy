import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 3 (11 components).
// Dynamic, sized and stateful classes live here as Uno rules.
// Two rule kinds:
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS for a
//     base class. They never match user code directly; the base shortcut in
//     src/shortcuts/batch3.ts references them by token so they emit together
//     with the base (Uno merges a shortcut into a single selector, so :hover and
//     friends cannot live in the shortcut object itself).
//  2. Public rules: size/modifier/position classes and standalone state classes.
//     Static rules carry flat declaration objects; anything with nested selectors
//     is a raw CSS string (static rule with a string body emits it verbatim,
//     preserving &, media queries and @supports blocks as modern CSS nesting).
// Upstream at-apply utilities are expanded to raw CSS inline. No at-apply remains.
// Selector strings go through applyPrefix(); keyframes/data-URL names are left
// unprefixed. Layer intent per block in comments: daisyui.l1.l2.l3 -> `daisy-l3`,
// .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`, bare daisyui (outermost/lowest) ->
// `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch3Rules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  // Prefix a selector string (all .classes inside are prefixed, pseudos kept).
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  // Public rule name (plain class, prefixed).
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── hovergallery ─────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hovergallery.css
  if (shouldInclude("hovergallery", opts.include, opts.exclude)) {
    // All nested behavior, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: hidden->display:none. Compiled normalizes :nth-child(1) to
    // :first-child and > *:hover to >:hover; source forms kept with a note.
    const hg = sel(".hover-gallery");
    rules.push([
      "__daisy-hovergallery-nested",
      [
        `${hg},${hg}:is(figure){display:inline-grid;}` +
          `${hg}:has(> :nth-child(3)){--items:2;}` +
          `${hg}:has(> :nth-child(4)){--items:3;}` +
          `${hg}:has(> :nth-child(5)){--items:4;}` +
          `${hg}:has(> :nth-child(6)){--items:5;}` +
          `${hg}:has(> :nth-child(7)){--items:6;}` +
          `${hg}:has(> :nth-child(8)){--items:7;}` +
          `${hg}:has(> :nth-child(9)){--items:8;}` +
          `${hg}:has(> :nth-child(10)){--items:9;}` +
          `${hg} > *{opacity:0;height:100%;grid-row:1;object-fit:cover;width:100%;` +
          `&:first-child{grid-column:1 / -1;opacity:1;}` +
          `&:nth-child(2){grid-column:1;}` +
          `&:nth-child(3){grid-column:2;}` +
          `&:nth-child(4){grid-column:3;}` +
          `&:nth-child(5){grid-column:4;}` +
          `&:nth-child(6){grid-column:5;}` +
          `&:nth-child(7){grid-column:6;}` +
          `&:nth-child(8){grid-column:7;}` +
          `&:nth-child(9){grid-column:8;}` +
          `&:nth-child(10){grid-column:9;}` +
          `&:nth-child(n + 11){display:none;}}` +
          `${hg} > *:hover{grid-column:1 / -1;opacity:1;}` +
          `${hg}:has(*:hover) > :first-child{display:none;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── indicator ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/indicator.css
  if (shouldInclude("indicator", opts.include, opts.exclude)) {
    // Item positioning, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: absolute->position:absolute,
    // whitespace-nowrap->white-space:nowrap.
    const item = sel(".indicator :where(.indicator-item)");
    rules.push([
      "__daisy-indicator-item",
      [
        `${item}{z-index:1;position:absolute;white-space:nowrap;` +
          `top:var(--indicator-t, 0);bottom:var(--indicator-b, auto);` +
          `left:var(--indicator-s, auto);right:var(--indicator-e, 0);` +
          `translate:var(--indicator-x, 50%) var(--indicator-y, -50%);}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Position modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    const sStart = sel(".indicator-start");
    const sCenter = sel(".indicator-center");
    const sEnd = sel(".indicator-end");
    const sTop = sel(".indicator-top");
    const sMid = sel(".indicator-middle");
    const sBot = sel(".indicator-bottom");
    rules.push([
      key("indicator-start"),
      [
        `${sStart}{--indicator-s:0;--indicator-e:auto;--indicator-x:-50%;}` +
          `[dir="rtl"] ${sStart}{--indicator-s:auto;--indicator-e:0;--indicator-x:50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("indicator-center"),
      [
        `${sCenter}{--indicator-s:50%;--indicator-e:auto;--indicator-x:-50%;}` +
          `[dir="rtl"] ${sCenter}{--indicator-e:50%;--indicator-x:50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("indicator-end"),
      [
        `${sEnd}{--indicator-s:auto;--indicator-e:0;--indicator-x:50%;}` +
          `[dir="rtl"] ${sEnd}{--indicator-s:0;--indicator-e:auto;--indicator-x:-50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("indicator-top"),
      [`${sTop}{--indicator-t:0;--indicator-b:auto;--indicator-y:-50%;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("indicator-middle"),
      [`${sMid}{--indicator-t:50%;--indicator-b:auto;--indicator-y:-50%;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("indicator-bottom"),
      [`${sBot}{--indicator-t:auto;--indicator-b:0;--indicator-y:50%;}`],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── kbd ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/kbd.css
  // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
  if (shouldInclude("kbd", opts.include, opts.exclude)) {
    const kbdSizes: Array<[string, string, string]> = [
      ["kbd-xs", "4", "0.625rem"],
      ["kbd-sm", "5", "0.75rem"],
      ["kbd-md", "6", "0.875rem"],
      ["kbd-lg", "7", "1rem"],
      ["kbd-xl", "8", "1.125rem"],
    ];
    for (const [name, mul, fs] of kbdSizes) {
      rules.push([
        key(name),
        [
          {
            "--size": `calc(var(--size-selector, 0.25rem) * ${mul})`,
            "font-size": fs,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── label ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/label.css
  if (shouldInclude("label", opts.include, opts.exclude)) {
    // .label nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: cursor-pointer->cursor:pointer, flex->display:flex,
    // h-[calc(100%-0.5rem)]->height, items-center->align-items,
    // px-3->padding-inline:0.75rem, whitespace-nowrap->white-space:nowrap,
    // -ms-3->margin-inline-start:-0.75rem, me-3->margin-inline-end:0.75rem,
    // ms-3->margin-inline-start:0.75rem, -me-3->margin-inline-end:-0.75rem.
    const label = sel(".label");
    rules.push([
      "__daisy-label-nested",
      [
        `${label}:has(input){cursor:pointer;}` +
          `${sel(".label:is(.input > *, .select > *)")}{display:flex;height:calc(100% - 0.5rem);align-items:center;padding-inline:0.75rem;white-space:nowrap;font-size:inherit;` +
          `&:first-child{margin-inline-start:-0.75rem;margin-inline-end:0.75rem;border-inline-end:var(--border) solid color-mix(in oklab, currentColor 10%, #0000);}` +
          `&:last-child{margin-inline-start:0.75rem;margin-inline-end:-0.75rem;border-inline-start:var(--border) solid color-mix(in oklab, currentColor 10%, #0000);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .floating-label nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: bg-base-100->background-color, absolute->position:absolute,
    // start-3->inset-inline-start:0.75rem, z-1->z-index:1, px-1->padding-inline:0.25rem,
    // opacity-0/100->opacity:0/1.
    const fl = sel(".floating-label");
    const flFocus = `:is(${fl}:focus-within,${fl}:not(:has(input:placeholder-shown, textarea:placeholder-shown)))`;
    rules.push([
      "__daisy-floating-nested",
      [
        `${fl} ::placeholder{transition:top 0.1s ease-out, translate 0.1s ease-out, scale 0.1s ease-out, opacity 0.1s ease-out;}` +
          `${fl} > span{background-color:var(--color-base-100);position:absolute;inset-inline-start:0.75rem;z-index:1;padding-inline:0.25rem;opacity:0;` +
          `font-size:var(--font-size, 0.875rem);top:calc(var(--size-field, 0.25rem) * var(--top-mul, 5));line-height:1;border-radius:2px;pointer-events:none;translate:0 -50%;` +
          `transition:top 0.1s ease-out, translate 0.1s ease-out, scale 0.1s ease-out, opacity 0.1s ease-out;}` +
          `${flFocus} ::placeholder{opacity:0;top:0;translate:-12.5% calc(-50% - 0.125em);scale:0.75;pointer-events:auto;}` +
          `${flFocus} :dir(rtl)::placeholder{translate:12.5% calc(-50% - 0.125em);}` +
          `${flFocus} > span{opacity:1;top:0;translate:-12.5% calc(-50% - 0.125em);scale:0.75;pointer-events:auto;z-index:2;&:dir(rtl){translate:12.5% calc(-50% - 0.125em);}}` +
          `${fl}:has(:disabled, [disabled]) > span{opacity:0;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── link ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/link.css
  if (shouldInclude("link", opts.include, opts.exclude)) {
    // :focus states, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: outline-hidden->outline-style:none (Tailwind --tw var and
    // forced-colors fallback omitted like P3 batch 1).
    const link = sel(".link");
    rules.push([
      "__daisy-link-state",
      [
        `${link}:focus{outline-style:none;}` +
          `${link}:focus-visible{outline:2px solid currentColor;outline-offset:2px;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .link-hover, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: no-underline->text-decoration-line:none,
    // hover:underline->@media (hover:hover) &:hover underline.
    rules.push([
      key("link-hover"),
      [
        `${sel(".link-hover")}{text-decoration-line:none;}` +
          `@media (hover:hover){${sel(".link-hover")}:hover{text-decoration-line:underline;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. Flat color plus
    // hover darken (80% mix with black) kept in the same raw block verbatim.
    // Expanded: text-primary->color:var(--color-primary), etc.
    const linkColors: Array<[string, string]> = [
      ["link-primary", "var(--color-primary)"],
      ["link-secondary", "var(--color-secondary)"],
      ["link-accent", "var(--color-accent)"],
      ["link-neutral", "var(--color-neutral)"],
      ["link-info", "var(--color-info)"],
      ["link-success", "var(--color-success)"],
      ["link-warning", "var(--color-warning)"],
      ["link-error", "var(--color-error)"],
    ];
    for (const [name, color] of linkColors) {
      const s = sel(`.${name}`);
      const base = color.replace("var(--color-", "").replace(")", "");
      void base;
      rules.push([
        key(name),
        [
          `${s}{color:${color};}` +
            `@media (hover:hover){${s}:hover{color:color-mix(in oklab, ${color} 80%, #000);}}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── list ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/list.css
  if (shouldInclude("list", opts.include, opts.exclude)) {
    // .list-row grid + divider, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: rounded-box->border-radius, relative->position, grid->display:grid,
    // grid-flow-col->grid-auto-flow:column, gap-4->gap:1rem, p-4->padding:1rem,
    // absolute/bottom-0->position/bottom, border-base-content/5->border-color:color-mix 5%.
    const list = sel(".list");
    const row = sel(".list-row");
    rules.push([
      "__daisy-list-nested",
      [
        `${list} ${row}{--list-grid-cols:minmax(0, auto) 1fr;border-radius:var(--radius-box);position:relative;display:grid;grid-auto-flow:column;grid-template-columns:var(--list-grid-cols);gap:1rem;padding:1rem;word-break:break-word;}` +
          `${sel(".list > :not(:last-child).list-row")}:after,${sel(".list > :not(:last-child) .list-row")}:after{content:"";border-bottom:var(--border) solid;inset-inline:var(--radius-box);border-color:color-mix(in oklab, var(--color-base-content) 5%, transparent);position:absolute;bottom:0;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :has(list-col-grow) column counts + >* row-start, upstream layer
    // daisyui.l1.l2 -> daisy-l2.
    // Expanded: row-start-1->grid-row-start:1.
    const grow = sel(".list-col-grow");
    rules.push([
      "__daisy-list-cols",
      [
        `${list} ${row}:has(> ${grow}:nth-child(1)){--list-grid-cols:1fr;}` +
          `${list} ${row}:has(> ${grow}:nth-child(2)){--list-grid-cols:minmax(0, auto) 1fr;}` +
          `${list} ${row}:has(> ${grow}:nth-child(3)){--list-grid-cols:minmax(0, auto) minmax(0, auto) 1fr;}` +
          `${list} ${row}:has(> ${grow}:nth-child(4)){--list-grid-cols:minmax(0, auto) minmax(0, auto) minmax(0, auto) 1fr;}` +
          `${list} ${row}:has(> ${grow}:nth-child(5)){--list-grid-cols:minmax(0, auto) minmax(0, auto) minmax(0, auto) minmax(0, auto) 1fr;}` +
          `${list} ${row}:has(> ${grow}:nth-child(6)){--list-grid-cols:minmax(0, auto) minmax(0, auto) minmax(0, auto) minmax(0, auto) minmax(0, auto) 1fr;}` +
          `${list} ${row} > *{grid-row-start:1;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // .list-col-wrap, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: row-start-2->grid-row-start:2.
    rules.push([
      key("list-col-wrap"),
      [`${sel(".list-col-wrap")}{grid-row-start:2;}`],
      { layer: "daisy-l1" },
    ]);
  }

  // ─── loading ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/loading.css
  if (shouldInclude("loading", opts.include, opts.exclude)) {
    // Reduced-motion spinner override, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    const loading = sel(".loading");
    rules.push([
      "__daisy-loading-motion",
      [
        `@media (prefers-reduced-motion: no-preference){${loading}{mask-image:url("data:image/svg+xml,%3Csvg width='24' height='24' stroke='black' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform-origin='center'%3E%3Ccircle cx='12' cy='12' r='9.5' fill='none' stroke-width='3' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='2s' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-dasharray' values='0,150;42,150;42,150' keyTimes='0;0.475;1' dur='1.5s' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-dashoffset' values='0;-16;-59' keyTimes='0;0.475;1' dur='1.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E");}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Spinner variants, upstream layer daisyui.l1.l2 -> daisy-l2. Each keeps its
    // slow (reduced-motion-safe) mask plus the no-preference fast override.
    const variants: Array<[string, string, string]> = [
      [
        "loading-spinner",
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' stroke=\'black\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg transform-origin=\'center\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'9.5\' fill=\'none\' stroke-width=\'3\' stroke-linecap=\'round\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' from=\'0 12 12\' to=\'360 12 12\' dur=\'8s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-dasharray\' values=\'0,150;42,150;42,150\' keyTimes=\'0;0.475;1\' dur=\'6s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-dashoffset\' values=\'0;-16;-59\' keyTimes=\'0;0.475;1\' dur=\'6s\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' stroke=\'black\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg transform-origin=\'center\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'9.5\' fill=\'none\' stroke-width=\'3\' stroke-linecap=\'round\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' from=\'0 12 12\' to=\'360 12 12\' dur=\'2s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-dasharray\' values=\'0,150;42,150;42,150\' keyTimes=\'0;0.475;1\' dur=\'1.5s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-dashoffset\' values=\'0;-16;-59\' keyTimes=\'0;0.475;1\' dur=\'1.5s\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")',
      ],
      [
        "loading-dots",
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'4\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'3s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\'/%3E%3C/circle%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'3s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\' begin=\'0.1s\'/%3E%3C/circle%3E%3Ccircle cx=\'20\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'3s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\' begin=\'0.2s\'/%3E%3C/circle%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'4\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'1.05s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\'/%3E%3C/circle%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'1.05s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\' begin=\'0.1s\'/%3E%3C/circle%3E%3Ccircle cx=\'20\' cy=\'12\' r=\'3\'%3E%3Canimate attributeName=\'cy\' values=\'12;6;12;12\' keyTimes=\'0;0.286;0.571;1\' dur=\'1.05s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\' begin=\'0.2s\'/%3E%3C/circle%3E%3C/svg%3E")',
      ],
      [
        "loading-ring",
        'url("data:image/svg+xml,%3Csvg width=\'44\' height=\'44\' viewBox=\'0 0 44 44\' xmlns=\'http://www.w3.org/2000/svg\' stroke=\'white\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\' stroke-width=\'2\'%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'1\'%3E%3Canimate attributeName=\'r\' begin=\'0s\' dur=\'5.4s\' values=\'1;20\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.165,0.84,0.44,1\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-opacity\' begin=\'0s\' dur=\'5.4s\' values=\'1;0\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.3,0.61,0.355,1\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'1\'%3E%3Canimate attributeName=\'r\' begin=\'-0.9s\' dur=\'5.4s\' values=\'1;20\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.165,0.84,0.44,1\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-opacity\' begin=\'-0.9s\' dur=\'5.4s\' values=\'1;0\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.3,0.61,0.355,1\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg width=\'44\' height=\'44\' viewBox=\'0 0 44 44\' xmlns=\'http://www.w3.org/2000/svg\' stroke=\'white\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\' stroke-width=\'2\'%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'1\'%3E%3Canimate attributeName=\'r\' begin=\'0s\' dur=\'1.8s\' values=\'1;20\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.165,0.84,0.44,1\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-opacity\' begin=\'0s\' dur=\'1.8s\' values=\'1;0\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.3,0.61,0.355,1\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3Ccircle cx=\'22\' cy=\'22\' r=\'1\'%3E%3Canimate attributeName=\'r\' begin=\'-0.9s\' dur=\'1.8s\' values=\'1;20\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.165,0.84,0.44,1\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'stroke-opacity\' begin=\'-0.9s\' dur=\'1.8s\' values=\'1;0\' calcMode=\'spline\' keyTimes=\'0;1\' keySplines=\'0.3,0.61,0.355,1\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")',
      ],
      [
        "loading-ball",
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cellipse cx=\'12\' cy=\'5\' rx=\'4\' ry=\'4\'%3E%3Canimate attributeName=\'cy\' values=\'5;20;20.5;20;5\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'2s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\'/%3E%3Canimate attributeName=\'rx\' values=\'4;4;4.8;4;4\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'2s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'ry\' values=\'4;4;3;4;4\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'2s\' repeatCount=\'indefinite\'/%3E%3C/ellipse%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cellipse cx=\'12\' cy=\'5\' rx=\'4\' ry=\'4\'%3E%3Canimate attributeName=\'cy\' values=\'5;20;20.5;20;5\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'.8s\' repeatCount=\'indefinite\' keySplines=\'.33,0,.66,.33;.33,.66,.66,1\'/%3E%3Canimate attributeName=\'rx\' values=\'4;4;4.8;4;4\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'.8s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'ry\' values=\'4;4;3;4;4\' keyTimes=\'0;0.469;0.5;0.531;1\' dur=\'.8s\' repeatCount=\'indefinite\'/%3E%3C/ellipse%3E%3C/svg%3E")',
      ],
      [
        "loading-bars",
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'1\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\'/%3E%3C/rect%3E%3Crect x=\'9\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3C/rect%3E%3Crect x=\'17\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'2.4s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3C/rect%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'1\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\'/%3E%3C/rect%3E%3Crect x=\'9\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.65s\'/%3E%3C/rect%3E%3Crect x=\'17\' y=\'1\' width=\'6\' height=\'22\'%3E%3Canimate attributeName=\'y\' values=\'1;5;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3Canimate attributeName=\'height\' values=\'22;14;22\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3Canimate attributeName=\'opacity\' values=\'1;0.2;1\' keyTimes=\'0;0.938;1\' dur=\'.8s\' repeatCount=\'indefinite\' begin=\'-0.5s\'/%3E%3C/rect%3E%3C/svg%3E")',
      ],
      [
        "loading-infinity",
        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' style=\'shape-rendering:auto;\' width=\'200px\' height=\'200px\' viewBox=\'0 0 100 100\' preserveAspectRatio=\'xMidYMid\'%3E%3Cpath fill=\'none\' stroke=\'black\' stroke-width=\'10\' stroke-dasharray=\'205.271 51.318\' d=\'M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z\' stroke-linecap=\'round\' style=\'transform:scale(0.8);transform-origin:50px 50px\'%3E%3Canimate attributeName=\'stroke-dashoffset\' repeatCount=\'indefinite\' dur=\'6s\' keyTimes=\'0;1\' values=\'0;256.589\'/%3E%3C/path%3E%3C/svg%3E")',
        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' style=\'shape-rendering:auto;\' width=\'200px\' height=\'200px\' viewBox=\'0 0 100 100\' preserveAspectRatio=\'xMidYMid\'%3E%3Cpath fill=\'none\' stroke=\'black\' stroke-width=\'10\' stroke-dasharray=\'205.271 51.318\' d=\'M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z\' stroke-linecap=\'round\' style=\'transform:scale(0.8);transform-origin:50px 50px\'%3E%3Canimate attributeName=\'stroke-dashoffset\' repeatCount=\'indefinite\' dur=\'2s\' keyTimes=\'0;1\' values=\'0;256.589\'/%3E%3C/path%3E%3C/svg%3E")',
      ],
    ];
    for (const [name, slow, fast] of variants) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{mask-image:${slow};}` +
            `@media (prefers-reduced-motion: no-preference){${s}{mask-image:${fast};}}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const loadingSizes: Array<[string, string]> = [
      ["loading-xs", "4"],
      ["loading-sm", "5"],
      ["loading-md", "6"],
      ["loading-lg", "7"],
      ["loading-xl", "8"],
    ];
    for (const [name, mul] of loadingSizes) {
      rules.push([
        key(name),
        [{ width: `calc(var(--size-selector, 0.25rem) * ${mul})` }],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── mask ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/mask.css
  if (shouldInclude("mask", opts.include, opts.exclude)) {
    // Half masks, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: [mask-position:left]->mask-position:left,
    // rtl:[mask-position:right]->:where(:dir(rtl),[dir=rtl]) override (compiled
    // normalizes left->0/start and right->100%/end; keywords kept here).
    const h1 = sel(".mask-half-1");
    const h2 = sel(".mask-half-2");
    rules.push([
      key("mask-half-1"),
      [
        `${h1}{mask-size:200%;mask-position:left;}` +
          `${h1}:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *){mask-position:right;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("mask-half-2"),
      [
        `${h2}{mask-size:200%;mask-position:right;}` +
          `${h2}:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *){mask-position:left;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── megamenu ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/megamenu.css
  if (shouldInclude("megamenu", opts.include, opts.exclude)) {
    const mm = sel(".megamenu");
    // [popovertarget]/[popover]/:has/active-position nests, upstream layer
    // daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: relative/isolate/flex/cursor-pointer/items-center/gap-3,
    // border-base-300->border-color, mt-1->margin-top:0.25rem,
    // max-h-dvh->max-height:100dvh, border->border-width:1px, opacity-0/100.
    rules.push([
      "__daisy-megamenu-nested",
      [
        `${mm} [popovertarget]{position:relative;display:flex;isolation:isolate;cursor:pointer;align-items:center;gap:0.75rem;` +
          `padding-inline:var(--mm-p, 1rem);height:var(--size);font-size:var(--fontsize, 0.875rem);` +
          `border:var(--border) solid transparent;anchor-name:var(--mm-anchor);` +
          `transition:background-color 200ms ease-out, color 200ms ease-out;` +
          `&:focus-visible{outline:2px solid var(--color-base-content);outline-offset:2px;}` +
          `&:after{--tw-content:"";content:var(--tw-content);pointer-events:none;inset-inline-end:1.4rem;box-shadow:inset 2px 2px;` +
          `transition:opacity 200ms ease-out, rotate 200ms ease-out;width:0.375rem;height:0.375rem;display:block;opacity:0.25;rotate:-135deg;}` +
          `&:nth-of-type(1){--mm-anchor:--mm1;}&:nth-of-type(2){--mm-anchor:--mm2;}&:nth-of-type(3){--mm-anchor:--mm3;}` +
          `&:nth-of-type(4){--mm-anchor:--mm4;}&:nth-of-type(5){--mm-anchor:--mm5;}&:nth-of-type(6){--mm-anchor:--mm6;}` +
          `&:nth-of-type(7){--mm-anchor:--mm7;}&:nth-of-type(8){--mm-anchor:--mm8;}&:nth-of-type(9){--mm-anchor:--mm9;}` +
          `&:nth-of-type(10){--mm-anchor:--mm10;}}` +
          `${mm}:not(:has([popovertarget]:hover, [popover]:popover-open)) ${sel(".megamenu-active")}{background-color:transparent;}` +
          `${mm}:has([popovertarget]:hover):not(:has([popover]:popover-open)) ${sel(".megamenu-active")},` +
          `${mm}:has([popover]:popover-open) ${sel(".megamenu-active")}{inset:anchor(var(--mm-anchor) top) anchor(var(--mm-anchor) end) anchor(var(--mm-anchor) bottom) anchor(var(--mm-anchor) start);}` +
          `${mm}:has([popovertarget]:nth-of-type(1):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(1):popover-open){--mm-anchor:--mm1;}` +
          `${mm}:has([popovertarget]:nth-of-type(2):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(2):popover-open){--mm-anchor:--mm2;}` +
          `${mm}:has([popovertarget]:nth-of-type(3):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(3):popover-open){--mm-anchor:--mm3;}` +
          `${mm}:has([popovertarget]:nth-of-type(4):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(4):popover-open){--mm-anchor:--mm4;}` +
          `${mm}:has([popovertarget]:nth-of-type(5):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(5):popover-open){--mm-anchor:--mm5;}` +
          `${mm}:has([popovertarget]:nth-of-type(6):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(6):popover-open){--mm-anchor:--mm6;}` +
          `${mm}:has([popovertarget]:nth-of-type(7):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(7):popover-open){--mm-anchor:--mm7;}` +
          `${mm}:has([popovertarget]:nth-of-type(8):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(8):popover-open){--mm-anchor:--mm8;}` +
          `${mm}:has([popovertarget]:nth-of-type(9):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(9):popover-open){--mm-anchor:--mm9;}` +
          `${mm}:has([popovertarget]:nth-of-type(10):hover):not(:has([popover]:popover-open)),${mm}:has([popover]:nth-of-type(10):popover-open){--mm-anchor:--mm10;}` +
          `${mm} [popovertarget]:has(+ [popover]:popover-open):after{opacity:1;rotate:45deg;}` +
          `${mm} [popover]{border-width:1px;border-style:solid;border-color:var(--color-base-300);opacity:0;margin-top:0.25rem;max-height:100dvh;` +
          `border-radius:var(--radius-box);background-color:var(--color-base-100);position-area:block-end span-inline-end;max-block-size:calc(100% - 0.25rem);` +
          `translate:0 -0.5rem;scale:0.98;transition:opacity 200ms ease-out, translate 200ms ease-out, scale 200ms ease-out, display 200ms ease-out allow-discrete, overlay 200ms ease-out allow-discrete;` +
          `&:popover-open{opacity:1;@starting-style{opacity:0;}}}` +
          `${mm}:has([popover]:popover-open) [popover]{translate:0 0;scale:1;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Mobile &:popover-open layout, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: fixed->position:fixed, w-full->width:100%,
    // flex-col/items-start->flex-direction/align-items, overflow-y-scroll,
    // rounded-none->border-radius:0, pt-4->padding-top:1rem, opacity-100,
    // pointer-events-none, relative/block/max-h-none/overflow-visible/
    // bg-transparent/opacity-100.
    rules.push([
      "__daisy-megamenu-popover",
      [
        `${mm}:popover-open{position:fixed;width:100%;flex-direction:column;align-items:flex-start;overflow-y:scroll;border-radius:0;padding-top:1rem;opacity:1;` +
          `background-color:var(--color-base-100);margin-top:var(--mm-mt, 4rem);border-inline-width:0;position-area:block-end;top:0;inset-inline-start:0;` +
          `max-block-size:80svh;translate:0 0;scale:1;transition:opacity 200ms ease-out, translate 200ms ease-out, scale 200ms ease-out, display 200ms ease-out allow-discrete, overlay 200ms ease-out allow-discrete;` +
          `@starting-style{opacity:0;}` +
          `& [popovertarget],& > [popover]:not(:nth-of-type(1)){display:var(--mm-display, none);}` +
          `&::backdrop{background-color:var(--mm-backdrop, oklch(0% 0 0/ 0.4));}` +
          `& [popovertarget]{pointer-events:none;font-size:0.875rem;font-weight:600;color:color-mix(in oklab, var(--color-base-content) 40%, transparent);&:after{content:none;}}` +
          `& [popover]{position:relative;display:block;max-height:none;overflow:visible;background-color:transparent;opacity:1;border:none;}}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
    // Wide/full/vertical layout modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: relative/w-full/flex-col/items-start/rounded-none/opacity-0,
    // pointer-events-none, relative/block/max-h-none/overflow-visible/
    // bg-transparent/opacity-100.
    rules.push([
      key("megamenu-wide"),
      [
        `${sel(".megamenu-wide")}{anchor-name:--megamenu;}` +
          `${sel(".megamenu-wide")}:popover-open{inset-inline:0;}` +
          `${sel(".megamenu-wide")} [popover]{position-area:block-end;position-anchor:--megamenu;width:anchor-size(inline);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("megamenu-full"),
      [
        `${sel(".megamenu-full")}{anchor-name:--megamenu;}` +
          `${sel(".megamenu-full")}:popover-open{inset-inline:0;}` +
          `${sel(".megamenu-full")} [popover]{position-area:block-end;position-anchor:--megamenu;width:100%;border-radius:0;border-inline-width:0;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("megamenu-vertical"),
      [
        `${sel(".megamenu-vertical")}{position:relative;display:flex;width:100%;flex-direction:column;align-items:flex-start;border-radius:0;opacity:0;` +
          `background-color:var(--color-base-100);border-inline-width:0;position-area:block-end;max-block-size:calc(100% - 0.25rem);--mm-backdrop:transparent;` +
          `translate:0 -0.5rem;scale:0.98;transition:opacity 200ms ease-out, translate 200ms ease-out, scale 200ms ease-out, display 200ms ease-out allow-discrete, overlay 200ms ease-out allow-discrete;` +
          `&:not([popover]:popover-open){position:revert;display:none;}` +
          `&:popover-open{--mm-mt:0;--mm-display:block;}` +
          `& [popovertarget]{pointer-events:none;font-size:0.875rem;font-weight:600;color:color-mix(in oklab, var(--color-base-content) 40%, transparent);&:after{content:none;}}` +
          `& [popover]{position:relative;display:block;overflow:visible;background-color:transparent;opacity:1;border:none;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const mmSizes: Array<[string, string, string, string]> = [
      ["megamenu-xs", "0.6875rem", "0.5rem", "6"],
      ["megamenu-sm", "0.75rem", "0.75rem", "8"],
      ["megamenu-md", "0.875rem", "1rem", "10"],
      ["megamenu-lg", "1.125rem", "1.25rem", "12"],
      ["megamenu-xl", "1.375rem", "1.5rem", "14"],
    ];
    for (const [name, fs, p, mul] of mmSizes) {
      rules.push([
        key(name),
        [
          {
            "--fontsize": fs,
            "--mm-p": p,
            "--size": `calc(var(--size-field, 0.25rem) * ${mul})`,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── mockup ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/mockup.css
  if (shouldInclude("mockup", opts.include, opts.exclude)) {
    // All blocks upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: mb-4->margin-bottom:1rem, block->display:block, h-3/w-3->0.75rem,
    // rounded-full->border-radius:calc(infinity * 1px), opacity-30/50->opacity,
    // pr-5->padding-right:1.25rem, inline-block/text-right, aspect-square->aspect-ratio:1,
    // shrink-0->flex-shrink:0, self-start/end->align-self, my-3->margin-block:0.75rem,
    // inline-flex/w-full/items-center, mr-[4.8rem]->margin-right:4.8rem,
    // mx-auto->margin-inline:auto, flex/h-full/items-center/gap-2/overflow-hidden/
    // text-ellipsis/whitespace-nowrap, size-4->1rem.
    const code = sel(".mockup-code");
    rules.push([
      "__daisy-mockup-code-nested",
      [
        `${code}:before{content:"";display:block;width:0.75rem;height:0.75rem;border-radius:calc(infinity * 1px);opacity:0.3;margin-bottom:1rem;box-shadow:1.4em 0, 2.8em 0, 4.2em 0;}` +
          `${code} pre{padding-right:1.25rem;width:max-content;min-width:100%;` +
          `&:before{content:"";margin-right:2ch;}` +
          `&[data-prefix]:before{--tw-content:attr(data-prefix);content:var(--tw-content);display:inline-block;text-align:right;opacity:0.5;width:2rem;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    const win = sel(".mockup-window");
    rules.push([
      "__daisy-mockup-window-nested",
      [
        `${win}:before{content:"";display:block;aspect-ratio:1;height:0.75rem;flex-shrink:0;align-self:flex-start;border-radius:calc(infinity * 1px);opacity:0.3;margin-bottom:1rem;box-shadow:1.4em 0, 2.8em 0, 4.2em 0;}` +
          `[dir="rtl"] ${win}:before{align-self:flex-end;}` +
          `${win} pre[data-prefix]:before{--tw-content:attr(data-prefix);content:var(--tw-content);display:inline-block;text-align:right;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    const browser = sel(".mockup-browser");
    const toolbar = sel(".mockup-browser-toolbar");
    rules.push([
      "__daisy-mockup-browser-nested",
      [
        `${browser} pre[data-prefix]:before{--tw-content:attr(data-prefix);content:var(--tw-content);display:inline-block;text-align:right;}` +
          `${browser} ${toolbar}{display:inline-flex;align-items:center;width:100%;margin-block:0.75rem;padding-right:1.4em;` +
          `&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *){flex-direction:row-reverse;}` +
          `&:before{content:"";display:inline-block;aspect-ratio:1;height:0.75rem;border-radius:calc(infinity * 1px);opacity:0.3;margin-right:4.8rem;box-shadow:1.4em 0, 2.8em 0, 4.2em 0;}` +
          `& ${sel(".input")}{display:flex;align-items:center;gap:0.5rem;height:100%;margin-inline:auto;background-color:var(--color-base-200);` +
          `overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.75rem;direction:ltr;` +
          `&:before{content:"";width:1rem;height:1rem;opacity:0.5;background-color:currentColor;` +
          `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z' clip-rule='evenodd' /%3E%3C/svg%3E") no-repeat center;mask-size:contain;}}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    const phone = sel(".mockup-phone");
    rules.push([
      "__daisy-mockup-phone-nested",
      [
        `@supports (corner-shape: superellipse(1.45)){${phone}{border-radius:90px;corner-shape:superellipse(1.45);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    const display = sel(".mockup-phone-display");
    rules.push([
      "__daisy-mockup-display-nested",
      [
        `@supports (corner-shape: superellipse(1.87)){${display}{border-radius:101px;corner-shape:superellipse(1.87);}}` +
          `${display} > img{width:100%;height:100%;object-fit:cover;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── navbar ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/navbar.css
  if (shouldInclude("navbar", opts.include, opts.exclude)) {
    // :where(.navbar) relative, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: relative->position:relative.
    rules.push([
      "__daisy-navbar-where",
      [`${sel(":where(.navbar)")}{position:relative;}`],
      { layer: "daisy-l2", internal: true },
    ]);
  }

  return rules;
}
