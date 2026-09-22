import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 2 (11 components:
// divider, dock, drawer, dropdown, fab, fieldset, fileinput, filter, footer,
// hero, hover3d). Dynamic, sized, stateful and otherwise nested classes live
// here as Uno rules. Two rule kinds (same as src/rules/components.ts):
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS
//     for a base class, referenced by token from src/shortcuts/batch2.ts.
//  2. Public rules: orientation/color/size/placement classes and standalone
//     contextual classes (dock-label, dropdown-content, fab-close, ...).
// Compound selectors are partitioned by owner so no declaration block is
// emitted twice for one class combo (e.g. the .dropdown-open show selectors
// live only in the dropdown-open rule, not in the dropdown companion).
// Upstream at-apply utilities are expanded to raw CSS inline (verified against
// /tmp/daisy-ref.css). No at-apply remains. Selector strings go through
// applyPrefix(); keyframes names are left unprefixed. Upstream @layer
// annotations are followed verbatim (see per-block comments); in particular
// dropdown open/close/hover and hover-3d behavior stay in `daisy-l3` because
// upstream nests them in daisyui.l1.l2.l3.
// Numeric values keep leading zeros so applyPrefix() never corrupts them.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch2Rules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  // Prefix a selector string (all .classes inside are prefixed, pseudos kept).
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  // Public rule name (plain class, prefixed).
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── divider ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/divider.css
  if (shouldInclude("divider", opts.include, opts.exclude)) {
    const divider = sel(".divider");
    // Pseudos, print border and content gap, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: h-0.5->height:0.125rem, w-full->width:100%, grow->flex-grow:1,
    // gap-4->gap:1rem.
    rules.push([
      "__daisy-divider-nested",
      [
        `${divider}:before,${divider}:after{content:"";height:0.125rem;width:100%;flex-grow:1;background-color:var(--divider-color);}` +
          `@media print{${divider}:before,${divider}:after{border:0.5px solid;}}` +
          `${divider}:not(:empty){gap:1rem;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Orientations, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: h-auto->height:auto, w-4->width:1rem, flex-col->flex-direction:column,
    // h-full->height:100%, w-0.5->width:0.125rem (and mirrors for vertical).
    rules.push([
      key("divider-horizontal"),
      [
        `${sel(".divider-horizontal")}{--divider-m:0 1rem;}` +
          `${sel(".divider-horizontal")}${divider}{flex-direction:column;width:1rem;height:auto;&:before,&:after{width:0.125rem;height:100%;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("divider-vertical"),
      [
        `${sel(".divider-vertical")}{--divider-m:1rem 0;}` +
          `${sel(".divider-vertical")}${divider}{flex-direction:row;width:auto;height:1rem;&:before,&:after{width:100%;height:0.125rem;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Line colors, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-<color>->background-color:var(--color-<color>).
    const dividerColors = [
      "neutral",
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "info",
      "error",
    ] as const;
    for (const color of dividerColors) {
      const s = sel(`.divider-${color}`);
      rules.push([
        key(`divider-${color}`),
        [`${s}:before,${s}:after{background-color:var(--color-${color});}`],
        { layer: "daisy-l2" },
      ]);
    }
    // Placement, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: hidden->display:none.
    rules.push([
      key("divider-start"),
      [`${sel(".divider-start")}:before{display:none;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("divider-end"),
      [`${sel(".divider-end")}:after{display:none;}`],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── dock ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/dock.css
  if (shouldInclude("dock", opts.include, opts.exclude)) {
    const dock = sel(".dock");
    const item = `${dock} > *:not(:where(script, style, template))`;
    // Item layout, hover, disabled and indicator dot,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3. The safe-area height stack
    // lives here too (a shortcut object cannot hold the doubled `height` key).
    // Expanded: rounded-box->border-radius:var(--radius-box), relative->position:relative,
    // mb-2->margin-bottom:0.5rem, flex->display:flex, h-full->height:100%,
    // max-w-32->max-width:8rem, shrink-1->flex-shrink:1, basis-full->flex-basis:100%,
    // cursor-pointer->cursor:pointer, flex-col->flex-direction:column,
    // items-center->align-items:center, justify-center->justify-content:center,
    // gap-px->gap:1px, bg-transparent->background-color:#0000,
    // opacity-80->opacity:0.8, text-base-content/10->color-mix 10%,
    // pointer-events-none->pointer-events:none, opacity-100->opacity:1,
    // absolute->position:absolute, h-1->height:0.25rem, w-6->width:1.5rem,
    // rounded-full->border-radius:calc(infinity * 1px), bg-transparent->#0000.
    rules.push([
      "__daisy-dock-nested",
      [
        `${dock}{height:4rem;height:calc(4rem + env(safe-area-inset-bottom));}` +
          `${item}{position:relative;display:flex;height:100%;max-width:8rem;flex-shrink:1;flex-basis:100%;cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:1px;background-color:#0000;border-radius:var(--radius-box);margin-bottom:0.5rem;transition:opacity 0.2s ease-out;}` +
          `@media (hover:hover){${item}:hover{opacity:0.8;}}` +
          `${item}[aria-disabled="true"],${item}[aria-disabled="true"]:hover,${item}[disabled],${item}[disabled]:hover{pointer-events:none;color:color-mix(in oklab, var(--color-base-content) 10%, transparent);opacity:1;}` +
          `${item}:after{content:"";position:absolute;height:0.25rem;width:1.5rem;border-radius:calc(infinity * 1px);background-color:#0000;bottom:0.2rem;border-top:3px solid transparent;transition:background-color 0.1s ease-out, text-color 0.1s ease-out, width 0.1s ease-out;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Current-page indicator, upstream layer daisyui.l1.l2 -> daisy-l2. Only the
    // [aria-current] half lives here; the .dock-active half is the public rule
    // below so the declarations are never emitted twice.
    // Expanded: w-10->width:2.5rem, bg-current->background-color:currentColor,
    // text-current->color:currentColor.
    const current =
      '[aria-current]:not([aria-current="false"], [aria-current=""])';
    rules.push([
      "__daisy-dock-current",
      [
        `${dock} > ${current}:after{color:currentColor;background-color:currentColor;width:2.5rem;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    rules.push([
      key("dock-active"),
      [
        `${sel(".dock-active")}:after{color:currentColor;background-color:currentColor;width:2.5rem;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Item label, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Single source of
    // truth for the base label size (size overrides live in the size rules).
    rules.push([
      key("dock-label"),
      [`${item} ${sel(".dock-label")}{font-size:0.6875rem;}`],
      { layer: "daisy-l3" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. dock-sm keeps its
    // at-apply h-14 (3.5rem) merged with the explicit height lines.
    const dockSizes: Array<[string, string, string, string | null]> = [
      ["dock-xs", "3rem", "0.625rem", "-0.1rem"],
      ["dock-sm", "3.5rem", "0.625rem", "-0.1rem"],
      ["dock-md", "4rem", "0.6875rem", null],
      ["dock-lg", "4.5rem", "0.6875rem", "0.4rem"],
      ["dock-xl", "5rem", "0.75rem", "0.4rem"],
    ];
    for (const [name, h, labelFs, afterBottom] of dockSizes) {
      const s = sel(`.${name}`);
      const after =
        afterBottom === null
          ? ""
          : `${s} :is(${sel(".dock-active")}, ${current}):after{bottom:${afterBottom};}`;
      rules.push([
        key(name),
        [
          `${s}{height:${h};height:calc(${h} + env(safe-area-inset-bottom));}` +
            after +
            `${s} ${sel(".dock-label")}{font-size:${labelFs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── drawer ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/drawer.css
  // Drawer pairs with the is-drawer-open/close variants in src/variants.ts.
  if (shouldInclude("drawer", opts.include, opts.exclude)) {
    const side = sel(".drawer-side");
    // Overflow clip, overlay, children and off-canvas translate,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3. The 100vh/100dvh height stack
    // lives here (a shortcut object cannot hold the doubled `height` key).
    // The overlay positioning owns the public drawer-overlay rule below, so it
    // is not repeated here.
    // Expanded: overflow-x/y-hidden->overflow:hidden, col-start-1/row-start-1,
    // will-change-transform->will-change:transform.
    rules.push([
      "__daisy-drawer-side-nested",
      [
        `${side}{height:100vh;height:100dvh;}` +
          `${sel(":where(.drawer-side)")}{overflow:hidden;}` +
          `${side} > *{grid-row-start:1;grid-column-start:1;}` +
          `${side} > :not(${sel(".drawer-overlay")}){will-change:transform;transition:translate 0.3s ease-out, width 0.2s ease-out;translate:-100%;[dir="rtl"] &{translate:100%;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Overlay positioning, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Public rule (contextual): generating `drawer-overlay` alone still emits.
    // Expanded: sticky->position:sticky, top-0->top:0, cursor-pointer->cursor:pointer,
    // place-self-stretch->place-self:stretch.
    rules.push([
      key("drawer-overlay"),
      [
        `${side} > ${sel(".drawer-overlay")}{position:sticky;top:0;cursor:pointer;place-self:stretch;background-color:oklch(0% 0 0 / 40%);}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // :checked scrollbar color + :root scroll lock, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    const toggle = sel(".drawer-toggle");
    rules.push([
      "__daisy-drawer-toggle-l3",
      [
        `${sel(":where(.drawer-toggle:checked ~ .drawer-side)")}{scrollbar-color:color-mix(in oklch, currentColor 35%, #0000) oklch(0 0 0 / calc(var(--page-has-backdrop, 0) * 0.4));}` +
          `${sel(":where(.drawer-toggle:checked ~ .drawer-side)")} > :not(${sel(".drawer-overlay")}){transform:none;will-change:auto;}` +
          `${sel(":where(:root:has(.drawer-toggle:checked))")}{--page-scroll-lock:;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :checked visibility + :focus-visible outline,
    // upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: pointer-events-auto->pointer-events:auto, visible->visibility:visible,
    // overflow-y-auto->overflow-y:auto, opacity-100->opacity:1.
    rules.push([
      "__daisy-drawer-toggle-l2",
      [
        `${sel(":where(.drawer-toggle:checked ~ .drawer-side)")}{pointer-events:auto;visibility:visible;opacity:1;overflow-y:auto;}` +
          `${sel(":where(.drawer-toggle:checked ~ .drawer-side)")} > :not(${sel(".drawer-overlay")}){translate:0%;}` +
          `${toggle}:focus-visible ~ ${sel(".drawer-content")} label${sel(".drawer-button")}{outline:2px solid;outline-offset:2px;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // .drawer-end, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: col-start-1/2, justify-items-end->justify-items:end.
    const end = sel(".drawer-end");
    rules.push([
      key("drawer-end"),
      [
        `${end}{grid-auto-columns:auto max-content;}` +
          `${end} > ${toggle} ~ ${sel(".drawer-content")}{grid-column-start:1;}` +
          `${end} > ${toggle} ~ ${side}{grid-column-start:2;justify-items:end;}` +
          `${end} > ${toggle} ~ ${side} > :not(${sel(".drawer-overlay")}){translate:100%;[dir="rtl"] &{translate:-100%;}}` +
          `${end} > ${toggle}:checked ~ ${side} > :not(${sel(".drawer-overlay")}){translate:0%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .drawer-open, upstream layers l1.l2.l3 (scrollbar revert) + l1.l2
    // (sticky layout) + l1 (translate) -> single daisy-l2 rule; the three parts
    // touch disjoint properties so one layer is faithful. Noted per part.
    // Expanded: hidden->display:none, pointer-events-auto->pointer-events:auto,
    // visible->visibility:visible, sticky->position:sticky, block->display:block,
    // w-auto->width:auto, overscroll-auto->overscroll-behavior:auto,
    // opacity-100->opacity:1, cursor-default->cursor:default,
    // bg-transparent->background-color:#0000.
    const open = sel(".drawer-open");
    rules.push([
      key("drawer-open"),
      [
        `${open} > ${toggle}:checked ~ ${side}{scrollbar-color:revert-layer;}` +
          `:root:has(${open} > ${toggle}:checked){--page-scroll-lock:revert-layer;}` +
          `${open} > ${side}{overflow-y:auto;}` +
          `${open} > ${toggle}{display:none;}` +
          `${open} > ${toggle} ~ ${side}{pointer-events:auto;visibility:visible;position:sticky;display:block;width:auto;overscroll-behavior:auto;opacity:1;}` +
          `${open} > ${toggle} ~ ${side} > ${sel(".drawer-overlay")}{cursor:default;background-color:#0000;}` +
          `${open} > ${toggle}:checked ~ ${side}{pointer-events:auto;visibility:visible;}` +
          `${open} > ${toggle} ~ ${side} > :not(${sel(".drawer-overlay")}){translate:0%;[dir="rtl"] &{translate:0%;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── dropdown ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/dropdown.css
  // NOTE: the .menu .dropdown-content margin/padding and the
  // :focus-within .menu-dropdown-toggle arrow already live in batch 1
  // (__daisy-menu-state); they are not repeated here.
  if (shouldInclude("dropdown", opts.include, opts.exclude)) {
    const dropdown = sel(".dropdown");
    const content = sel(".dropdown-content");
    // Focus outline, default-hidden, transitions, focus-driven show, details
    // and popover — upstream layer daisyui.l1.l2.l3 -> daisy-l3. The
    // .dropdown-open/.dropdown-close/.dropdown-hover alternatives are
    // partitioned into their own public rules below (never emitted twice).
    // Expanded: outline-hidden->outline-style:none (+--tw-outline-style:none and
    // the forced-colors fallback), hidden->display:none, origin-top->transform-origin:top,
    // opacity-0/100->opacity:0/1, pointer-events-none->pointer-events:none,
    // fixed->position:fixed, text-inherit->color:inherit, m-auto->margin:auto.
    rules.push([
      "__daisy-dropdown-nested",
      [
        `${dropdown} > *:not(:has(~ [class*="dropdown-content"])):focus{--tw-outline-style:none;outline-style:none;}` +
          `@media (forced-colors:active){${dropdown} > *:not(:has(~ [class*="dropdown-content"])):focus{outline-offset:2px;outline:2px solid #0000;}}` +
          `${dropdown}:not(details, ${sel(".dropdown-open")}, ${sel(".dropdown-hover")}:hover, :focus-within) ${content}{transform-origin:top;opacity:0;display:none;scale:95%;}` +
          `${dropdown}[popover],${dropdown} ${content}{z-index:999;}` +
          `@media (prefers-reduced-motion:no-preference){${dropdown}[popover],${dropdown} ${content}{transition-behavior:allow-discrete;transition-property:opacity, scale, display, overlay;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);animation:dropdown 0.2s;}}` +
          `@starting-style{${dropdown}[popover],${dropdown} ${content}{scale:95%;opacity:0;}}` +
          `@keyframes dropdown{0%{opacity:0;}}` +
          `${dropdown}:not(${sel(".dropdown-close")}):not(${sel(".dropdown-hover")}):focus > [tabindex]:first-child,${dropdown}:not(${sel(".dropdown-close")}):focus-within > [tabindex]:first-child{pointer-events:none;}` +
          `${dropdown}:not(${sel(".dropdown-close")}):not(${sel(".dropdown-hover")}):focus ${content},${dropdown}:not(${sel(".dropdown-close")}):focus-within ${content}{opacity:1;scale:100%;}` +
          `${dropdown}:is(details){overflow:revert-layer;}` +
          `${dropdown}:is(details) summary::-webkit-details-marker{display:none;}` +
          `${dropdown}:where([popover]){background:#0000;}` +
          `${dropdown}[popover]{color:inherit;position:fixed;}` +
          `@supports not (position-area:bottom){${dropdown}[popover]{margin:auto;}${dropdown}[popover]::backdrop{background-color:color-mix(in oklab, #000 30%, #0000);}}` +
          `${dropdown}[popover]:not(${sel(".dropdown-open")}, :popover-open){transform-origin:top;opacity:0;display:none;scale:95%;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Class-driven open, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      key("dropdown-open"),
      [
        `${dropdown}:not(${sel(".dropdown-close")})${sel(".dropdown-open")} > [tabindex]:first-child{pointer-events:none;}` +
          `${dropdown}:not(${sel(".dropdown-close")})${sel(".dropdown-open")} ${content}{opacity:1;scale:100%;}` +
          `@supports not (position-area:bottom){${dropdown}[popover]${sel(".dropdown-open")}:not(:popover-open){transform-origin:top;opacity:0;display:none;scale:95%;}}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // Forced close, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      key("dropdown-close"),
      [
        `${dropdown}${sel(".dropdown-close")} ${content}{transform-origin:top;opacity:0;display:none;scale:95%;}` +
          `${dropdown}[popover]${sel(".dropdown-close")}{transform-origin:top;opacity:0;display:none;scale:95%;}` +
          `@supports not (position-area:bottom){${dropdown}[popover]${sel(".dropdown-close")}{transform-origin:top;opacity:0;display:none;scale:95%;}}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // Hover-to-open, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      key("dropdown-hover"),
      [
        `${dropdown}${sel(".dropdown-hover")}:not(:hover) [tabindex]:first-child:focus:not(:focus-visible) ~ ${content}{transform-origin:top;opacity:0;display:none;scale:95%;}` +
          `${dropdown}:not(${sel(".dropdown-close")})${sel(".dropdown-hover")}:hover ${content}{opacity:1;scale:1;}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // Content positioning hook, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Single source of truth for `.dropdown .dropdown-content{position:absolute}`.
    // Expanded: absolute->position:absolute.
    rules.push([
      key("dropdown-content"),
      [`${dropdown} ${content}{position:absolute;}`],
      { layer: "daisy-l3" },
    ]);
    // Placements, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: end-auto->inset-inline-end:auto, end-1/2->inset-inline-end:50%,
    // end-0->inset-inline-end:0, end-full->inset-inline-end:100%,
    // start-full->inset-inline-start:100%, top-0/bottom-auto/top-full/bottom-full/
    // top-auto/bottom-1/2/bottom-0 (literal), origin-top/right/left/bottom->
    // transform-origin:top/100%/0/bottom.
    const start = sel(".dropdown-start");
    rules.push([
      key("dropdown-start"),
      [
        `${start}{--anchor-h:span-inline-end;}` +
          `${start} :where(${content}){inset-inline-end:auto;translate:0 0;[dir="rtl"] &{translate:0 0;}}` +
          `${start}${sel(".dropdown-left")}{--anchor-h:left;--anchor-v:span-bottom;}` +
          `${start}${sel(".dropdown-left")} ${content}{top:0;bottom:auto;}` +
          `${start}${sel(".dropdown-right")}{--anchor-h:right;--anchor-v:span-bottom;}` +
          `${start}${sel(".dropdown-right")} ${content}{top:0;bottom:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    const center = sel(".dropdown-center");
    rules.push([
      key("dropdown-center"),
      [
        `${center}{--anchor-h:center;}` +
          `${center} :where(${content}){inset-inline-end:50%;translate:50% 0;[dir="rtl"] &{translate:-50% 0;}}` +
          `${center}${sel(".dropdown-left")}{--anchor-h:left;--anchor-v:center;}` +
          `${center}${sel(".dropdown-left")} ${content}{top:auto;bottom:50%;translate:0 50%;}` +
          `${center}${sel(".dropdown-right")}{--anchor-h:right;--anchor-v:center;}` +
          `${center}${sel(".dropdown-right")} ${content}{top:auto;bottom:50%;translate:0 50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    const end = sel(".dropdown-end");
    rules.push([
      key("dropdown-end"),
      [
        `${end}{--anchor-h:span-inline-start;}` +
          `${end} :where(${content}){inset-inline-end:0;translate:0 0;[dir="rtl"] &{translate:0 0;}}` +
          `${end}${sel(".dropdown-left")}{--anchor-h:left;--anchor-v:span-top;}` +
          `${end}${sel(".dropdown-left")} ${content}{top:auto;bottom:0;}` +
          `${end}${sel(".dropdown-right")}{--anchor-h:right;--anchor-v:span-top;}` +
          `${end}${sel(".dropdown-right")} ${content}{top:auto;bottom:0;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("dropdown-left"),
      [
        `${sel(".dropdown-left")}{--anchor-h:left;--anchor-v:span-bottom;}` +
          `${sel(".dropdown-left")} ${content}{inset-inline-end:100%;transform-origin:100%;top:0;bottom:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("dropdown-right"),
      [
        `${sel(".dropdown-right")}{--anchor-h:right;--anchor-v:span-bottom;}` +
          `${sel(".dropdown-right")} ${content}{inset-inline-start:100%;transform-origin:0;top:0;bottom:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("dropdown-bottom"),
      [
        `${sel(".dropdown-bottom")}{--anchor-v:block-end;}` +
          `${sel(".dropdown-bottom")} ${content}{transform-origin:top;top:100%;bottom:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("dropdown-top"),
      [
        `${sel(".dropdown-top")}{--anchor-v:block-start;}` +
          `${sel(".dropdown-top")} ${content}{transform-origin:bottom;top:auto;bottom:100%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── fab ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fab.css
  if (shouldInclude("fab", opts.include, opts.exclude)) {
    const fab = sel(".fab");
    const close = sel(".fab-close");
    const main = sel(".fab-main-action");
    // Children, trigger, focus-within open and stagger delays,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3. The .fab-close/.fab-main-action
    // absolute positioning owns its public rules below (not repeated here).
    // Expanded: pointer-events-auto->pointer-events:auto, flex->display:flex,
    // items-center->align-items:center, gap-2->gap:0.5rem, z-1->z-index:1,
    // relative->position:relative, grid->display:grid,
    // rotate-90->rotate:90deg, opacity-0->opacity:0,
    // invisible->visibility:hidden, scale-80->scale var form, opacity-0,
    // visible->visibility:visible, scale-100->scale var form, opacity-100,
    // pointer-events-none->pointer-events:none.
    rules.push([
      "__daisy-fab-nested",
      [
        `${fab} > *{pointer-events:auto;display:flex;align-items:center;gap:0.5rem;}` +
          `${fab} > *:hover,${fab} > *:has(:focus-visible){z-index:1;}` +
          `${fab} > [tabindex]:first-child{position:relative;display:grid;transition-property:opacity, visibility, rotate;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}` +
          `${fab}:focus-within:has(${close}) > [tabindex],${fab}:focus-within:has(${main}) > [tabindex]{opacity:0;rotate:90deg;}` +
          `${fab} > :nth-child(n + 2){visibility:hidden;--tw-scale-x:80%;--tw-scale-y:80%;--tw-scale-z:80%;scale:var(--tw-scale-x) var(--tw-scale-y);opacity:0;transition-property:opacity, scale, visibility;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}` +
          `${fab} > :nth-child(n + 2)${main},${fab} > :nth-child(n + 2)${close}{--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y);}` +
          `${fab} > :nth-child(3){transition-delay:30ms;}` +
          `${fab} > :nth-child(4){transition-delay:60ms;}` +
          `${fab} > :nth-child(5){transition-delay:90ms;}` +
          `${fab} > :nth-child(6){transition-delay:120ms;}` +
          `${fab}:focus-within > [tabindex]:first-child{pointer-events:none;}` +
          `${fab}:focus-within > :nth-child(n + 2){visibility:visible;--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y);opacity:1;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Close / main-action pinning, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Split from the upstream combined selector so each token emits alone.
    // Expanded: absolute->position:absolute, end-0->inset-inline-end:0, bottom-0->bottom:0.
    rules.push([
      key("fab-close"),
      [`${fab} ${close}{position:absolute;inset-inline-end:0;bottom:0;}`],
      { layer: "daisy-l3" },
    ]);
    rules.push([
      key("fab-main-action"),
      [`${fab} ${main}{position:absolute;inset-inline-end:0;bottom:0;}`],
      { layer: "daisy-l3" },
    ]);
    // Flower fan-out, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: grid->display:grid, hidden->display:none.
    const flower = sel(".fab-flower");
    rules.push([
      key("fab-flower"),
      [
        `${flower}{display:grid;--position:0rem;}` +
          `${flower} > *:nth-child(1),${flower} > ${main},${flower} > ${close}{--position:0rem;}` +
          `${flower} > *{grid-area:1/1;--degree:180deg;--flip-degree:calc(180deg - var(--degree));transform:translateX(calc(cos(var(--degree)) * var(--position))) translateY(calc(sin(var(--degree)) * -1 * var(--position)));[dir="rtl"] &{transform:translateX(calc(cos(var(--flip-degree)) * var(--position))) translateY(calc(sin(var(--flip-degree)) * -1 * var(--position)));}}` +
          `${flower} > :nth-child(n + 7){display:none;}` +
          `${flower}:has(> :nth-child(3)){--position:140%;}${flower}:has(> :nth-child(3)) > :nth-child(3){--degree:135deg;}` +
          `${flower}:has(> :nth-child(4)){--position:140%;}${flower}:has(> :nth-child(4)) > :nth-child(3){--degree:165deg;}${flower}:has(> :nth-child(4)) > :nth-child(4){--degree:105deg;}` +
          `${flower}:has(> :nth-child(5)){--position:180%;}${flower}:has(> :nth-child(5)) > :nth-child(3){--degree:180deg;}${flower}:has(> :nth-child(5)) > :nth-child(4){--degree:135deg;}${flower}:has(> :nth-child(5)) > :nth-child(5){--degree:90deg;}` +
          `${flower}:has(> :nth-child(6)){--position:220%;}${flower}:has(> :nth-child(6)) > :nth-child(3){--degree:180deg;}${flower}:has(> :nth-child(6)) > :nth-child(4){--degree:150deg;}${flower}:has(> :nth-child(6)) > :nth-child(5){--degree:120deg;}${flower}:has(> :nth-child(6)) > :nth-child(6){--degree:90deg;}` +
          `${flower}:not(:has(${main}, ${close})) > :nth-child(n + 6){display:none;}` +
          `${flower}:not(:has(${main}, ${close})):has(> :nth-child(2)){--position:140%;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(2)) > :nth-child(2){--degree:135deg;}` +
          `${flower}:not(:has(${main}, ${close})):has(> :nth-child(3)){--position:140%;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(3)) > :nth-child(2){--degree:165deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(3)) > :nth-child(3){--degree:105deg;}` +
          `${flower}:not(:has(${main}, ${close})):has(> :nth-child(4)){--position:180%;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(4)) > :nth-child(2){--degree:180deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(4)) > :nth-child(3){--degree:135deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(4)) > :nth-child(4){--degree:90deg;}` +
          `${flower}:not(:has(${main}, ${close})):has(> :nth-child(5)){--position:220%;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(5)) > :nth-child(2){--degree:180deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(5)) > :nth-child(3){--degree:150deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(5)) > :nth-child(4){--degree:120deg;}${flower}:not(:has(${main}, ${close})):has(> :nth-child(5)) > :nth-child(5){--degree:90deg;}`,
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── fieldset ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fieldset.css
  if (shouldInclude("fieldset", opts.include, opts.exclude)) {
    // :has(input) cursor, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: cursor-pointer->cursor:pointer.
    rules.push([
      "__daisy-fieldset-label-nested",
      [`${sel(".fieldset-label")}:has(input){cursor:pointer;}`],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── fileinput (.file-input) ──────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fileinput.css
  if (shouldInclude("fileinput", opts.include, opts.exclude)) {
    const fileinput = sel(".file-input");
    // ::file-selector-button + :focus, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: me-4->margin-inline-end:1rem, cursor-pointer->cursor:pointer,
    // px-4->padding-inline:1rem, select-none->user-select:none (+webkit).
    rules.push([
      "__daisy-fileinput-nested",
      [
        `${fileinput}::file-selector-button{cursor:pointer;-webkit-user-select:none;user-select:none;height:calc(100% + var(--border) * 2);margin-inline-end:1rem;margin-block:calc(var(--border) * -1);margin-inline-start:calc(var(--border) * -1);padding-inline:1rem;font-size:0.875rem;font-weight:600;color:var(--btn-fg);border-width:var(--border);border-style:solid;border-color:var(--btn-border);border-start-start-radius:calc(var(--join-ss, var(--radius-field) - var(--border)));border-end-start-radius:calc(var(--join-es, var(--radius-field) - var(--border)));background-color:var(--btn-bg);background-size:calc(var(--noise) * 100%);background-image:var(--fx-noise);text-shadow:0 0.5px oklch(1 0 0 / calc(var(--depth) * 0.15));box-shadow:0 0.5px 0 0.5px color-mix(in oklab, color-mix(in oklab, white 30%, var(--btn-bg)) calc(var(--depth) * 20%), #0000) inset, var(--btn-shadow);--size:calc(var(--size-field, 0.25rem) * 10);--btn-bg:var(--btn-color, var(--color-base-200));--btn-fg:var(--color-base-content);--btn-border:color-mix(in oklab, var(--btn-bg), #000 5%);--btn-shadow:0 3px 2px -2px color-mix(in oklab, var(--btn-bg) 30%, #0000), 0 4px 3px -2px color-mix(in oklab, var(--btn-bg) 30%, #0000);}` +
          `${fileinput}:focus{--input-color:var(--color-base-content);box-shadow:0 1px color-mix(in oklab, var(--input-color) 10%, #0000);outline:2px solid var(--input-color);outline-offset:2px;isolation:isolate;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :disabled states, upstream layer daisyui.l1.l2 -> daisy-l2 (same as P3
    // input/select/textarea :disabled — one rule for all form controls).
    // Expanded: border-base-200->border-color:var(--color-base-200),
    // bg-base-200->background-color:var(--color-base-200),
    // placeholder-base-content->&::placeholder color, /20->color-mix 20%,
    // cursor-not-allowed->cursor:not-allowed.
    rules.push([
      "__daisy-fileinput-disabled",
      [
        `${fileinput}:has(> input[disabled]),${fileinput}:is(:disabled, [disabled]){cursor:not-allowed;border-color:var(--color-base-200);background-color:var(--color-base-200);box-shadow:none;color:color-mix(in oklch, var(--color-base-content) 20%, #0000);&::placeholder{color:color-mix(in oklab, var(--color-base-content) 20%, transparent);}&::file-selector-button{cursor:not-allowed;border-color:var(--color-base-200);background-color:var(--color-base-200);background-image:none;--btn-border:#0000;--btn-fg:color-mix(in oklch, var(--color-base-content) 20%, #0000);}}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // .file-input-ghost, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-transparent->background-color:#0000, ms-0->margin-inline-start:0,
    // me-4->margin-inline-end:1rem, h-full->height:100%, cursor-pointer,
    // px-4->padding-inline:1rem, select-none, text-base-content->color,
    // bg-base-100->background-color.
    const ghost = sel(".file-input-ghost");
    rules.push([
      key("file-input-ghost"),
      [
        `${ghost}{background-color:#0000;box-shadow:none;border-color:#0000;transition:background-color 0.2s;}` +
          `${ghost}::file-selector-button{cursor:pointer;-webkit-user-select:none;user-select:none;height:100%;margin-block:0;margin-inline:0 1rem;padding-inline:1rem;border-start-end-radius:calc(var(--join-ss, var(--radius-field) - var(--border)));border-end-end-radius:calc(var(--join-es, var(--radius-field) - var(--border)));}` +
          `${ghost}:focus,${ghost}:focus-within{color:var(--color-base-content);background-color:var(--color-base-100);border-color:#0000;box-shadow:none;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. Each block keeps
    // its three selectors (--btn-color, button fg, --input-color compound).
    const fileinputColors: Array<[string, string, string]> = [
      [
        "file-input-neutral",
        "var(--color-neutral)",
        "var(--color-neutral-content)",
      ],
      [
        "file-input-primary",
        "var(--color-primary)",
        "var(--color-primary-content)",
      ],
      [
        "file-input-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      [
        "file-input-accent",
        "var(--color-accent)",
        "var(--color-accent-content)",
      ],
      ["file-input-info", "var(--color-info)", "var(--color-info-content)"],
      [
        "file-input-success",
        "var(--color-success)",
        "var(--color-success-content)",
      ],
      [
        "file-input-warning",
        "var(--color-warning)",
        "var(--color-warning-content)",
      ],
      ["file-input-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, color, content] of fileinputColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--btn-color:${color};}` +
            `${s}::file-selector-button{color:${content};}` +
            `${s},${s}:focus,${s}:focus-within{--input-color:${color};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: pe-6->padding-inline-end:1.5rem (xl only).
    const fileinputSizes: Array<[string, string, string, string, boolean]> = [
      ["file-input-xs", "6", "0.6875rem", "1rem", false],
      ["file-input-sm", "8", "0.75rem", "1.5rem", false],
      ["file-input-md", "10", "0.875rem", "2", false],
      ["file-input-lg", "12", "1.125rem", "2.5rem", false],
      ["file-input-xl", "14", "1.125rem", "3rem", true],
    ];
    for (const [name, mul, fs, lh, pe] of fileinputSizes) {
      const s = sel(`.${name}`);
      const btnFs = name === "file-input-xl" ? "1.375rem" : fs;
      rules.push([
        key(name),
        [
          `${s}{--size:calc(var(--size-field, 0.25rem) * ${mul});font-size:${fs};line-height:${lh};${pe ? "padding-inline-end:1.5rem;" : ""}}` +
            `${s}::file-selector-button{font-size:${btnFs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── filter ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/filter.css
  if (shouldInclude("filter", opts.include, opts.exclude)) {
    const filter = sel(".filter");
    // Radio/input children and sibling margin, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // The .filter-reset aspect/cross owns its public rule below (not repeated here).
    // Expanded: w-auto->width:auto, overflow-hidden->overflow:hidden,
    // opacity-100->opacity:1, me-1->margin-inline-end:0.25rem.
    rules.push([
      "__daisy-filter-nested",
      [
        `${filter} [type="radio"]{width:auto;}` +
          `${filter} input{overflow:hidden;opacity:1;scale:1;transition:visibility 0.1s allow-discrete, margin 0.1s, opacity 0.3s, padding 0.3s, border-width 0.1s;}` +
          `${filter} > input:not(:last-child),${filter} > :not(:last-child) input{margin-inline-end:0.25rem;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :has(:checked) visibility collapse, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: invisible->visibility:hidden, mx-0->margin-inline:0, w-0->width:0,
    // px-0->padding-inline:0, opacity-0->opacity:0.
    const reset = sel(".filter-reset");
    rules.push([
      "__daisy-filter-state",
      [
        `${filter}:not(:has(:checked:not(${reset}))) :is(${reset}, [type="reset"]):not(:focus-visible){visibility:hidden;}` +
          `${filter}:not(:has(:checked:not(${reset}))) :is(${reset}, [type="reset"]):not(:focus-visible),${filter}:not(:has(:focus-visible)):has(:checked:not(${reset}, [type="checkbox"])) :is(input, button):not(:checked, ${reset}, [type="reset"]){opacity:0;border-width:0;width:0;margin-inline:0;padding-inline:0;scale:0;}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
    // .filter-reset cross, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Public rule (contextual): generating `filter-reset` alone still emits.
    // Expanded: aspect-square->aspect-ratio:1.
    rules.push([
      key("filter-reset"),
      [
        `${filter} input${reset}{aspect-ratio:1;}` +
          `${filter} input${reset}::after{--tw-content:"×";content:var(--tw-content);}`,
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── footer ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/footer.css
  if (shouldInclude("footer", opts.include, opts.exclude)) {
    const footer = sel(".footer");
    // Child grid, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: grid->display:grid, place-items-start->place-items:start,
    // gap-2->gap:0.5rem.
    rules.push([
      "__daisy-footer-nested",
      [
        `${footer} > *:not(script, style, template){display:grid;place-items:start;gap:0.5rem;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .footer-center, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: grid-flow-col-dense->grid-auto-flow:column dense,
    // place-items-center->place-items:center, text-center->text-align:center.
    const center = sel(".footer-center");
    rules.push([
      key("footer-center"),
      [
        `${center}{text-align:center;grid-auto-flow:column dense;place-items:center;}` +
          `${center} > *:not(script, style, template){place-items:center;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .footer-horizontal, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: grid-flow-col->grid-auto-flow:column,
    // grid-flow-row-dense->grid-auto-flow:dense (row is the initial value).
    rules.push([
      key("footer-horizontal"),
      [
        `${sel(".footer-horizontal")}{grid-auto-flow:column;}` +
          `${sel(".footer-horizontal")}${center}{grid-auto-flow:dense;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .footer-vertical, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: grid-flow-row->grid-auto-flow:row,
    // grid-flow-col-dense->grid-auto-flow:column dense.
    rules.push([
      key("footer-vertical"),
      [
        `${sel(".footer-vertical")}{grid-auto-flow:row;}` +
          `${sel(".footer-vertical")}${center}{grid-auto-flow:column dense;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── hero ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hero.css
  if (shouldInclude("hero", opts.include, opts.exclude)) {
    // Stacked children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: col-start-1->grid-column-start:1, row-start-1->grid-row-start:1.
    rules.push([
      "__daisy-hero-nested",
      [`${sel(".hero")} > *{grid-row-start:1;grid-column-start:1;}`],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── hover3d (.hover-3d) ──────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hover3d.css
  if (shouldInclude("hover3d", opts.include, opts.exclude)) {
    const hover = sel(".hover-3d");
    // Children, shine sweep, hover tilt and the 3x3 zone grid, upstream layer
    // daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: size-1/3->width/height:33.3333%.
    rules.push([
      "__daisy-hover3d-nested",
      [
        `${hover} > :nth-child(n + 2){isolation:isolate;z-index:1;}` +
          `${hover} > :first-child{overflow:hidden;grid-area:1/1/4/4;transform:rotate3d(var(--transform), 0, 10deg);transition:transform var(--ease) 500ms, scale var(--ease) 500ms, outline-color ease-out 500ms;outline:0.5px solid #0000;outline-offset:-1px;&:before{content:"";pointer-events:none;position:absolute;z-index:1;scale:500%;opacity:0;filter:blur(0.75rem);width:33.3333%;height:33.3333%;background-image:radial-gradient(circle at 50%, #fff3 10%, transparent 50%);translate:var(--shine);transition:translate ease-out 400ms, opacity ease-out 400ms;}}` +
          `${hover}:hover{--ease:linear(0, 0.708 15.2%, 0.927 23.6%, 1.067 33%, 1.12 41%, 1.13 50.2%, 1.019 83.2%, 1);}` +
          `${hover}:hover > :first-child{outline-color:#fff1;}` +
          `${hover}:hover > :first-child:before,${hover}:hover > :first-child:after{opacity:1;}` +
          `${hover} > :nth-child(n + 2){scale:1.2;}` +
          `${hover} > :nth-child(2){grid-area:1/1/2/2;}` +
          `${hover} > :nth-child(3){grid-area:1/2/2/3;}` +
          `${hover} > :nth-child(4){grid-area:1/3/2/4;}` +
          `${hover} > :nth-child(5){grid-area:2/1/3/2;}` +
          `${hover} > :nth-child(6){grid-area:2/3/3/4;}` +
          `${hover} > :nth-child(7){grid-area:3/1/4/2;}` +
          `${hover} > :nth-child(8){grid-area:3/2/4/3;}` +
          `${hover} > :nth-child(9){grid-area:3/3/4/4;}` +
          `${hover}:hover > :first-child{scale:1.05;}` +
          `${hover}:has(> :nth-child(2):hover){--transform:-1, 1;--shine:0% 0%;--shadow:-0.5rem -0.5rem;}` +
          `${hover}:has(> :nth-child(3):hover){--transform:-1, 0;--shine:100% 0%;--shadow:0rem -0.5rem;}` +
          `${hover}:has(> :nth-child(4):hover){--transform:-1, -1;--shine:200% 0%;--shadow:0.5rem -0.5rem;}` +
          `${hover}:has(> :nth-child(5):hover){--transform:0, 1;--shine:0% 100%;--shadow:-0.5rem 0rem;}` +
          `${hover}:has(> :nth-child(6):hover){--transform:0, -1;--shine:200% 100%;--shadow:0.5rem 0rem;}` +
          `${hover}:has(> :nth-child(7):hover){--transform:1, 1;--shine:0% 200%;--shadow:-0.5rem 0.5rem;}` +
          `${hover}:has(> :nth-child(8):hover){--transform:1, 0;--shine:100% 200%;--shadow:0rem 0.5rem;}` +
          `${hover}:has(> :nth-child(9):hover){--transform:1, -1;--shine:200% 200%;--shadow:0.5rem 0.5rem;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  return rules;
}
