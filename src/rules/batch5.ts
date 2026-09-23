import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/{steps,swap,tab,table,textarea,
// textrotate,timeline,toast,toggle,tooltip,validator}.css — P3 batch 5.
// Dynamic, sized and stateful classes live here as Uno rules.
// Two rule kinds:
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS for a
//     base class. They never match user code directly; the base shortcut in
//     src/shortcuts/batch5.ts references them by token so they emit together
//     with the base (Uno merges a shortcut into a single selector, so child,
//     pseudo and `@media`/`@keyframes` CSS cannot live in the shortcut object itself).
//  2. Public rules: modifier/position/size/state classes (step-primary, toast-top,
//     toggle-xs, ...) and standalone state classes (swap-active, tab-active, ...).
//     Anything with nested selectors is a raw CSS string (a static rule with a
//     string body emits it verbatim, preserving `&`, media queries and
//     starting-style blocks as modern CSS nesting).
// Upstream at-apply utilities are expanded to raw CSS inline (verified against
// /tmp/daisy-ref.css, the compiled upstream daisyui.css). No at-apply remains.
// Selector strings go through applyPrefix(); keyframes names are left unprefixed.
// Layer intent per block in comments: daisyui.l1.l2.l3 -> `daisy-l3`,
// .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`, the validator unhide block that
// upstream keeps unlayered -> `utilities`.
// Prefixing discipline: applyPrefix() is applied to SELECTOR substrings only,
// never to declaration text — its naive `\.name` regex would otherwise rewrite
// decimals (`0.5rem` -> `0.d-5rem`), `url(...)` payloads and `cubic-bezier()`
// timings. Every raw block below is built as `${sel(selectors)}{decls}` with
// decls kept literal.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch5Rules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  // Prefix a selector string (all .classes inside are prefixed, pseudos kept).
  // Only ever call this on selectors, never on declaration text (see note above).
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  // Public rule name (plain class, prefixed).
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── steps ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/steps.css
  if (shouldInclude("steps", opts.include, opts.exclude)) {
    const steps = sel(".steps");
    const step = `${steps} ${sel(".step")}`;
    const icon = sel(".step-icon");
    // .step child block, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: grid->display:grid, grid-cols-1/grid-rows-2 (overridden by authored
    // templates), place-items-center->place-items:center, text-center->text-align:center,
    // top-0/col-start-1/row-start-1/h-2/w-full->top:0/grid-column-start:1/grid-row-start:1/
    // height:0.5rem/width:100%, relative/col-start-1/row-start-1/grid/h-8/w-8/
    // place-items-center/place-self-center/rounded-full->position:relative/.../width:2rem/
    // height:2rem/border-radius:calc(infinity * 1px).
    rules.push([
      "__daisy-steps-nested",
      [
        `${step}{text-align:center;--step-bg:var(--color-base-300);--step-fg:var(--color-base-content);grid-template-rows:40px 1fr;grid-template-columns:auto;place-items:center;min-width:4rem;display:grid;` +
          `&:before{width:100%;height:0.5rem;color:var(--step-bg);background-color:var(--step-bg);content:"";border:1px solid;grid-row-start:1;grid-column-start:1;margin-inline-start:-100%;top:0;}` +
          `&>${icon},&:not(:has(${icon})):after{--tw-content:counter(step);content:var(--tw-content);counter-increment:step;z-index:1;color:var(--step-fg);background-color:var(--step-bg);border:1px solid var(--step-bg);border-radius:calc(infinity * 1px);grid-row-start:1;grid-column-start:1;place-self:center;place-items:center;width:2rem;height:2rem;display:grid;position:relative;}` +
          `&:first-child:before{--tw-content:none;content:var(--tw-content);}` +
          `&[data-content]:after{--tw-content:attr(data-content);content:var(--tw-content);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Step colors, upstream layer daisyui.l1.l2 -> daisy-l2. Verbatim selectors.
    const stepColors: Array<[string, string, string]> = [
      ["step-neutral", "var(--color-neutral)", "var(--color-neutral-content)"],
      ["step-primary", "var(--color-primary)", "var(--color-primary-content)"],
      [
        "step-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      ["step-accent", "var(--color-accent)", "var(--color-accent-content)"],
      ["step-info", "var(--color-info)", "var(--color-info-content)"],
      ["step-success", "var(--color-success)", "var(--color-success-content)"],
      ["step-warning", "var(--color-warning)", "var(--color-warning-content)"],
      ["step-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, bg, fg] of stepColors) {
      const c = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${steps} ${c}+${c}:before,${steps} ${c}:after,${steps} ${c}>${icon}{--step-bg:${bg};--step-fg:${fg};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Orientations, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: inline-grid/grid-flow-col/overflow-hidden/overflow-x-auto (as .steps),
    // grid/grid-cols-1/grid-rows-2/place-items-center/text-center, h-2/w-full,
    // grid-flow-row->grid-auto-flow:row, grid/grid-cols-2/grid-rows-1.
    const hstep = `${sel(".steps-horizontal")} ${sel(".step")}`;
    rules.push([
      key("steps-horizontal"),
      [
        `${sel(".steps-horizontal")}{grid-auto-columns:1fr;grid-auto-flow:column;display:inline-grid;overflow:hidden;overflow-x:auto;}` +
          `${hstep}{text-align:center;grid-template-rows:40px 1fr;grid-template-columns:auto;place-items:center;min-width:4rem;display:grid;&:before{width:100%;height:0.5rem;margin-inline-start:-100%;translate:0;}[dir="rtl"] &:before{translate:0;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    const vstep = `${sel(".steps-vertical")} ${sel(".step")}`;
    rules.push([
      key("steps-vertical"),
      [
        `${sel(".steps-vertical")}{grid-auto-rows:1fr;grid-auto-flow:row;}` +
          `${vstep}{grid-template-rows:auto;grid-template-columns:40px 1fr;justify-items:start;gap:0.5rem;min-height:4rem;display:grid;&:before{width:0.5rem;height:100%;margin-inline-start:50%;translate:-50% -50%;}[dir="rtl"] &:before{translate:50% -50%;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── swap ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/swap.css
  // Checkbox-hack component: input:checked / :indeterminate sibling selectors and
  // the .swap-active programmatic switch; rotate/flip animation variants.
  if (shouldInclude("swap", opts.include, opts.exclude)) {
    const swap = sel(".swap");
    // Base nests that belong to `swap` itself, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: appearance-none->appearance:none, col-start-1/row-start-1,
    // opacity-0->opacity:0, opacity-100->opacity:100%.
    // The on/off/indeterminate opacity blocks live in their own public rules below
    // (split from the upstream grouping so no block is emitted twice).
    rules.push([
      "__daisy-swap-nested",
      [
        `${swap} input{appearance:none;border:none;}` +
          `${swap}>*{grid-row-start:1;grid-column-start:1;@media (prefers-reduced-motion:no-preference){transition-property:transform, rotate, opacity;transition-duration:0.2s;transition-timing-function:cubic-bezier(0, 0, 0.2, 1);}}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    const on = sel(".swap-on");
    const off = sel(".swap-off");
    const indet = sel(".swap-indeterminate");
    // .swap-on / .swap-off / .swap-indeterminate, upstream layer daisyui.l1.l2 -> daisy-l2.
    rules.push([
      key("swap-on"),
      [
        `${swap} ${on},${swap} input:indeterminate~${on}{opacity:0;}` +
          `${swap} input:checked~${on}{opacity:100%;backface-visibility:visible;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("swap-off"),
      [`${swap} input:is(:checked, :indeterminate)~${off}{opacity:0;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("swap-indeterminate"),
      [
        `${swap} ${indet}{opacity:0;}` +
          `${swap} input:indeterminate~${indet}{opacity:100%;backface-visibility:visible;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .swap-active programmatic switch, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: opacity-0->opacity:0, opacity-100->opacity:100%,
    // rotate-0->rotate:0deg, -rotate-45->rotate:-45deg, opacity-100->opacity:100%.
    // The rotate/flip `.swap-active.swap-*` halves mirror the upstream .swap-active
    // block (upstream also repeats them inside .swap-rotate/.swap-flip, so both
    // halves are kept, exactly as the upstream build emits them).
    const active = sel(".swap-active");
    const rotate = sel(".swap-rotate");
    const flip = sel(".swap-flip");
    rules.push([
      key("swap-active"),
      [
        `${active} ${off}{opacity:0;}` +
          `${active} ${on}{opacity:100%;}` +
          `${active}${rotate} ${on}{rotate:0deg;}` +
          `${active}${rotate} ${off}{rotate:-45deg;}` +
          `${active}${flip} ${on}{transform:rotateY(0deg);}` +
          `${active}${flip} ${off}{backface-visibility:hidden;opacity:100%;transform:rotateY(-180deg);}`,
      ],
      { layer: "daisy-l1" },
    ]);
    // .swap-rotate, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: rotate-45->rotate:45deg, rotate-0->rotate:0deg, -rotate-45->rotate:-45deg.
    rules.push([
      key("swap-rotate"),
      [
        `${rotate} ${on},${rotate} input:indeterminate~${on}{rotate:45deg;}` +
          `${rotate} input:is(:checked, :indeterminate)~${on},${rotate}${active} ${on}{rotate:0deg;}` +
          `${rotate} input:is(:checked, :indeterminate)~${off},${rotate}${active} ${off}{rotate:-45deg;}`,
      ],
      { layer: "daisy-l1" },
    ]);
    // .swap-flip, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: opacity-100->opacity:100%.
    rules.push([
      key("swap-flip"),
      [
        `${flip}{transform-style:preserve-3d;perspective:20rem;}` +
          `${flip} ${on},${flip} ${indet},${flip} input:indeterminate~${on}{backface-visibility:hidden;transform:rotateY(180deg);}` +
          `${flip} input:is(:checked, :indeterminate)~${on},${flip}${active} ${on}{transform:rotateY(0deg);}` +
          `${flip} input:is(:checked, :indeterminate)~${off},${flip}${active} ${off}{backface-visibility:hidden;opacity:100%;transform:rotateY(-180deg);}`,
      ],
      { layer: "daisy-l1" },
    ]);
  }

  // ─── tab ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/tab.css
  if (shouldInclude("tab", opts.include, opts.exclude)) {
    const tabs = sel(".tabs");
    const tab = sel(".tab");
    const tabContent = sel(".tab-content");
    const tabDisabled = sel(".tab-disabled");
    const tabActive = sel(".tab-active");
    // Exact upstream base selector for the nested .tab states.
    const tabIs = `${tab}:is(${tabs}>${tab})`;
    const ACTIVE = `${tabActive},[aria-selected=true],[aria-current=true],[aria-current=page]`;
    // Nested .tab states, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: hover:text-base-content->hover media + color, min-w-fit->min-width,
    // absolute/inset-0->position:absolute/inset:0, relative->position:relative,
    // text-base-content/50->color-mix 50%, grow->flex-grow:1, cursor-default->cursor,
    // outline-hidden->--tw-outline-style:none/outline-style:none (+ forced-colors),
    // pointer-events-none/opacity-40.
    // The .tab-active tab-content reveal slice lives in the public tab-active rule.
    rules.push([
      "__daisy-tab-nested",
      [
        `${tabIs}{` +
          `@media (hover:hover){&:hover{color:var(--color-base-content);}}` +
          `&:is(input[type="radio"]){min-width:fit-content;&:after{--tw-content:attr(aria-label);content:var(--tw-content);}}` +
          `&:is(label){position:relative;& input{cursor:pointer;appearance:none;opacity:0;position:absolute;inset:0;}}` +
          `&:checked,&:is(label:has(:checked)){&+${tabContent}{display:block;}}` +
          `&:not(:checked, label:has(:checked), :hover, ${ACTIVE}){color:color-mix(in oklab, var(--color-base-content) 50%, transparent);}` +
          `&:not(input):empty{cursor:default;flex-grow:1;}` +
          `&:focus{--tw-outline-style:none;outline-style:none;@media (forced-colors:active){outline-offset:2px;outline:2px solid #0000;}}` +
          `&:focus-visible,&:is(label:has(:checked:focus-visible)){outline-offset:-5px;outline:2px solid;}` +
          `&[disabled]{pointer-events:none;opacity:0.4;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .tab-active reveal slice, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // (The :checked/label:has(:checked) half lives in __daisy-tab-nested.)
    rules.push([
      key("tab-active"),
      [`${tabIs}:is(${ACTIVE})+${tabContent}{display:block;}`],
      { layer: "daisy-l3" },
    ]);
    // .tab-content base as a raw string: upstream keeps both the `order-1`
    // fallback and the authored `order:var(--tabcontent-order)` (a shortcut
    // object cannot hold duplicate props). Upstream l1.l2.l3 -> daisy-l3.
    rules.push([
      key("tab-content"),
      [
        `${tabContent}{--tabcontent-radius-ss:var(--radius-box);--tabcontent-radius-se:var(--radius-box);--tabcontent-radius-es:var(--radius-box);--tabcontent-radius-ee:var(--radius-box);--tabcontent-order:1;width:100%;height:calc(100% - var(--tab-height) + var(--border));margin:var(--tabcontent-margin);order:1;order:var(--tabcontent-order);border-width:var(--border);border-color:#0000;border-start-start-radius:var(--tabcontent-radius-ss);border-start-end-radius:var(--tabcontent-radius-se);border-end-start-radius:var(--tabcontent-radius-es);border-end-end-radius:var(--tabcontent-radius-ee);display:none;}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // .tabs-border, upstream layer daisyui.l1.l2 -> daisy-l2.
    const borderTab = `${sel(".tabs-border")}>${tab}`;
    rules.push([
      key("tabs-border"),
      [
        `${borderTab}{--tab-border-color:#0000 #0000 var(--tab-border-color) #0000;position:relative;border-radius:var(--radius-field);` +
          `&:before{content:"";background-color:var(--tab-border-color);transition:background-color 0.2s;width:calc(100% - var(--tab-p) * 2);height:3px;border-radius:var(--radius-field);bottom:0;left:var(--tab-p);position:absolute;}` +
          `&:is(${ACTIVE}):not(${tabDisabled}, [disabled]),&:is(input:checked),&:is(label:has(:checked)){&:before{--tab-border-color:currentColor;border-top:3px solid;}}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .tabs-lift, upstream layer daisyui.l1.l2 -> daisy-l2.
    const lift = sel(".tabs-lift");
    const liftTab = `${lift}>${tab}`;
    rules.push([
      key("tabs-lift"),
      [
        `${lift}{--tabs-height:auto;--tabs-direction:row;}` +
          `${liftTab}{--tab-border:0 0 var(--border) 0;--tab-radius-ss:var(--tab-radius-limit);--tab-radius-se:var(--tab-radius-limit);--tab-radius-es:0;--tab-radius-ee:0;` +
          `--tab-paddings:var(--border) var(--tab-p) 0 var(--tab-p);--tab-border-colors:#0000 #0000 var(--tab-border-color) #0000;` +
          `--tab-corner-width:calc(100% + var(--tab-radius-limit) * 2);--tab-corner-height:var(--tab-radius-limit);--tab-corner-position:top left, top right;` +
          `border-width:var(--tab-border);padding:var(--tab-paddings);border-color:var(--tab-border-colors);` +
          `border-start-start-radius:var(--tab-radius-ss);border-start-end-radius:var(--tab-radius-se);border-end-end-radius:var(--tab-radius-ee);border-end-start-radius:var(--tab-radius-es);` +
          `&:is(${ACTIVE}):not(${tabDisabled}, [disabled]),&:is(input:checked, label:has(:checked)){` +
          `--tab-border:var(--border) var(--border) 0 var(--border);--tab-border-colors:var(--tab-border-color) var(--tab-border-color) #0000 var(--tab-border-color);` +
          `--tab-paddings:0 calc(var(--tab-p) - var(--border)) var(--border) calc(var(--tab-p) - var(--border));--tab-inset:auto auto 0 auto;` +
          `--radius-start:radial-gradient(circle at top left, var(--tab-radius-grad));--radius-end:radial-gradient(circle at top right, var(--tab-radius-grad));background-color:var(--tab-bg);` +
          `&:before{z-index:1;content:"";display:block;position:absolute;width:var(--tab-corner-width);height:var(--tab-corner-height);background-position:var(--tab-corner-position);background-image:var(--radius-start), var(--radius-end);background-size:var(--tab-radius-limit) var(--tab-radius-limit);background-repeat:no-repeat;inset:var(--tab-inset);}` +
          `&:first-child:before{--radius-start:none;}[dir="rtl"] &:first-child:before{transform:rotateY(180deg);}` +
          `&:last-child:before{--radius-end:none;}[dir="rtl"] &:last-child:before{transform:rotateY(180deg);}}}` +
          `${lift}:has(>${tabContent})>${tab}:first-child:not(${ACTIVE}){--tab-border-colors:var(--tab-border-color) var(--tab-border-color) #0000 var(--tab-border-color);}` +
          `${lift}>${tabContent}{--tabcontent-margin:calc(-1 * var(--border)) 0 0 0;--tabcontent-radius-ss:0;--tabcontent-radius-se:var(--radius-box);--tabcontent-radius-es:var(--radius-box);--tabcontent-radius-ee:var(--radius-box);}` +
          `${lift} :checked,${lift} label:has(:checked),${lift} :is(${ACTIVE}){&+${tabContent}{&:first-child,&:nth-child(n+3){--tabcontent-radius-ss:var(--radius-box);}}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .tabs-top, upstream layer daisyui.l1.l2 -> daisy-l2. Same vars as lift but
    // without the border/padding/corner art (top tabs reuse the bare tab frame).
    const top = sel(".tabs-top");
    const topTab = `${top}>${tab}`;
    rules.push([
      key("tabs-top"),
      [
        `${top}{--tabs-height:auto;--tabs-direction:row;}` +
          `${topTab}{--tab-order:0;--tab-border:0 0 var(--border) 0;--tab-radius-ss:var(--tab-radius-limit);--tab-radius-se:var(--tab-radius-limit);--tab-radius-es:0;--tab-radius-ee:0;` +
          `--tab-paddings:var(--border) var(--tab-p) 0 var(--tab-p);--tab-border-colors:#0000 #0000 var(--tab-border-color) #0000;` +
          `--tab-corner-width:calc(100% + var(--tab-radius-limit) * 2);--tab-corner-height:var(--tab-radius-limit);--tab-corner-position:top left, top right;` +
          `&:is(${ACTIVE}):not(${tabDisabled}, [disabled]),&:is(input:checked),&:is(label:has(:checked)){` +
          `--tab-border:var(--border) var(--border) 0 var(--border);--tab-border-colors:var(--tab-border-color) var(--tab-border-color) #0000 var(--tab-border-color);` +
          `--tab-paddings:0 calc(var(--tab-p) - var(--border)) var(--border) calc(var(--tab-p) - var(--border));--tab-inset:auto auto 0 auto;` +
          `--radius-start:radial-gradient(circle at top left, var(--tab-radius-grad));--radius-end:radial-gradient(circle at top right, var(--tab-radius-grad));}}` +
          `${top}:has(>${tabContent})>${tab}:first-child:not(${ACTIVE}){--tab-border-colors:var(--tab-border-color) var(--tab-border-color) #0000 var(--tab-border-color);}` +
          `${top}>${tabContent}{--tabcontent-order:1;--tabcontent-margin:calc(-1 * var(--border)) 0 0 0;--tabcontent-radius-ss:0;--tabcontent-radius-se:var(--radius-box);--tabcontent-radius-es:var(--radius-box);--tabcontent-radius-ee:var(--radius-box);}` +
          `${top} :checked,${top} label:has(:checked),${top} :is(${ACTIVE}){&+${tabContent}{&:first-child,&:nth-child(n+3){--tabcontent-radius-ss:var(--radius-box);}}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .tabs-bottom, upstream layer daisyui.l1.l2 -> daisy-l2.
    const bottom = sel(".tabs-bottom");
    const bottomTab = `${bottom}>${tab}`;
    rules.push([
      key("tabs-bottom"),
      [
        `${bottom}{--tabs-height:auto;--tabs-direction:row;}` +
          `${bottomTab}{--tab-order:1;--tab-border:var(--border) 0 0 0;--tab-radius-ss:0;--tab-radius-se:0;--tab-radius-es:var(--tab-radius-limit);--tab-radius-ee:var(--tab-radius-limit);` +
          `--tab-border-colors:var(--tab-border-color) #0000 #0000 #0000;--tab-paddings:0 var(--tab-p) var(--border) var(--tab-p);` +
          `--tab-corner-width:calc(100% + var(--tab-radius-limit) * 2);--tab-corner-height:var(--tab-radius-limit);--tab-corner-position:top left, top right;` +
          `&:is(${ACTIVE}):not(${tabDisabled}, [disabled]),&:is(input:checked),&:is(label:has(:checked)){` +
          `--tab-border:0 var(--border) var(--border) var(--border);--tab-border-colors:#0000 var(--tab-border-color) var(--tab-border-color) var(--tab-border-color);` +
          `--tab-paddings:var(--border) calc(var(--tab-p) - var(--border)) 0 calc(var(--tab-p) - var(--border));--tab-inset:0 auto auto auto;` +
          `--radius-start:radial-gradient(circle at bottom left, var(--tab-radius-grad));--radius-end:radial-gradient(circle at bottom right, var(--tab-radius-grad));}}` +
          `${bottom}:has(>${tabContent})>${tab}:first-child:not(${ACTIVE}){--tab-border-colors:#0000 var(--tab-border-color) var(--tab-border-color) var(--tab-border-color);}` +
          `${bottom}>${tabContent}{--tabcontent-order:0;--tabcontent-margin:0 0 calc(-1 * var(--border)) 0;--tabcontent-radius-ss:var(--radius-box);--tabcontent-radius-se:var(--radius-box);--tabcontent-radius-es:0;--tabcontent-radius-ee:var(--radius-box);}` +
          `${bottom}>:checked,${bottom}>:is(label:has(:checked)),${bottom}>:is(${ACTIVE}){&+${tabContent}:not(:nth-child(2)){--tabcontent-radius-es:var(--radius-box);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .tabs-box, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-base-200->background-color, p-1->padding:0.25rem,
    // rounded-field->border-radius, z-1->z-index:1, mt-1->margin-top:0.25rem.
    const box = sel(".tabs-box");
    rules.push([
      key("tabs-box"),
      [
        `${box}{background-color:var(--color-base-200);--tabs-box-radius:calc(3 * var(--radius-field));` +
          `border-radius:calc(min(var(--tab-height) / 2, var(--radius-field)) + min(0.25rem, var(--tabs-box-radius)));` +
          `box-shadow:0 -0.5px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 0.5px oklch(0% 0 0 / calc(var(--depth) * 0.05)) inset;padding:0.25rem;}` +
          `${box}>${tab}{border-radius:var(--radius-field);border-style:none;&:focus-visible,&:is(label:has(:checked:focus-visible)){outline-offset:2px;}&:focus-visible{z-index:1;}}` +
          `${box}>:is(${ACTIVE}):not(${tabDisabled}, [disabled]),${box}>:is(input:checked),${box}>:is(label:has(:checked)){` +
          `background-color:var(--tab-bg, var(--color-base-100));` +
          `box-shadow:0 1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px 1px -1px color-mix(in oklab, var(--color-neutral) calc(var(--depth) * 50%), #0000), 0 1px 6px -4px color-mix(in oklab, var(--color-neutral) calc(var(--depth) * 100%), #0000);` +
          `@media (forced-colors:active){border:1px solid;}}` +
          `${box}>${tabContent}{height:calc(100% - var(--tab-height) + var(--border) - 0.5rem);` +
          `border-radius:calc(min(var(--tab-height) / 2, var(--radius-field)) + min(0.25rem, var(--tabs-box-radius)) - var(--border));margin-top:0.25rem;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Values verified from source.
    const tabsSizes: Array<[string, string, string, string, string]> = [
      ["tabs-xs", "6", "0.375rem", "calc(0.5rem - var(--border))", "0.75rem"],
      ["tabs-sm", "8", "0.5rem", "calc(0.5rem - var(--border))", "0.875rem"],
      ["tabs-md", "10", "0.75rem", "calc(0.75rem - var(--border))", "0.875rem"],
      ["tabs-lg", "12", "1rem", "calc(1.5rem - var(--border))", "1.125rem"],
      ["tabs-xl", "14", "1.25rem", "calc(2rem - var(--border))", "1.125rem"],
    ];
    for (const [name, mul, p, rmin, fs] of tabsSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--tab-height:calc(var(--size-field, 0.25rem) * ${mul});}${s}>${tab}{--tab-p:${p};--tab-radius-min:${rmin};font-size:${fs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── table ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/table.css
  if (shouldInclude("table", opts.include, opts.exclude)) {
    const table = sel(".table");
    // Non-pin nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: hover:bg-base-200->hover media + background-color,
    // px-4/py-2->padding-inline/block, align-middle->vertical-align,
    // text-base-content/60->color-mix 60%, whitespace-nowrap->white-space.
    rules.push([
      "__daisy-table-nested",
      [
        `${table}:where(:dir(rtl), [dir=rtl], [dir=rtl] *){text-align:right;}` +
          `@media (hover:hover){:is(:is(${table} tr${sel(".row-hover")}),${table} tr${sel(".row-hover")}:nth-child(2n)):hover{background-color:var(--color-base-200);}}` +
          `${table} :where(th, td){vertical-align:middle;padding-block:0.75rem;padding-inline:1rem;}` +
          `${table} :where(thead, tfoot){white-space:nowrap;color:color-mix(in oklab, var(--color-base-content) 60%, transparent);font-size:0.875rem;font-weight:600;}` +
          `${table} :where(tfoot tr:first-child :is(td, th)){border-top:var(--border) solid color-mix(in oklch, var(--color-base-content) 5%, #0000);}` +
          `${table} :where(thead tr :is(td, th), tbody tr:not(:last-child) :is(td, th)){border-bottom:var(--border) solid color-mix(in oklch, var(--color-base-content) 5%, #0000);}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .table-zebra, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-base-200->background-color, hover:bg-base-300->hover media.
    const zebra = sel(".table-zebra");
    rules.push([
      key("table-zebra"),
      [
        `${zebra} tbody tr:where(:nth-child(2n)){background-color:var(--color-base-200);& :where(${sel(".table-pin-cols")} tr th){background-color:var(--color-base-200);}}` +
          `@media (hover:hover){:is(:is(${zebra} tbody tr${sel(".row-hover")}),${zebra} tbody tr${sel(".row-hover")}:where(:nth-child(2n))):hover{background-color:var(--color-base-300);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .table-pin-rows / .table-pin-cols, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Kept here (not in the base companion) so `table` + pin classes emit each
    // block exactly once. Expanded: sticky/top-0/z-1, sticky/bottom-0/z-1,
    // bg-base-100->background-color, sticky/right-0/left-0.
    rules.push([
      key("table-pin-rows"),
      [
        `${table} :where(${sel(".table-pin-rows")} thead){z-index:1;position:sticky;top:0;}` +
          `${table} :where(${sel(".table-pin-rows")} tfoot){z-index:1;position:sticky;bottom:0;}` +
          `${table} :where(${sel(".table-pin-rows")} :is(thead, tfoot) tr){background-color:var(--color-base-100);}`,
      ],
      { layer: "daisy-l3" },
    ]);
    rules.push([
      key("table-pin-cols"),
      [
        `${table} :where(${sel(".table-pin-cols")} tr th){background-color:var(--color-base-100);position:sticky;left:0;right:0;}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Values verified from source:
    // tr font-size + th/td paddings (px-2/py-1, px-3/py-2, px-4/py-3, px-5/py-4, px-6/py-5).
    const tableSizes: Array<[string, string, string, string]> = [
      ["table-xs", "0.6875rem", "0.25rem", "0.5rem"],
      ["table-sm", "0.75rem", "0.5rem", "0.75rem"],
      ["table-md", "0.875rem", "0.75rem", "1rem"],
      ["table-lg", "1.125rem", "1rem", "1.25rem"],
      ["table-xl", "1.375rem", "1.25rem", "1.5rem"],
    ];
    for (const [name, fs, pb, pi] of tableSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s} :not(thead, tfoot) tr{font-size:${fs};}${s} :where(th, td){padding-block:${pb};padding-inline:${pi};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── textarea ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/textarea.css
  if (shouldInclude("textarea", opts.include, opts.exclude)) {
    const textarea = sel(".textarea");
    // textarea child, placeholders, :focus and coarse-pointer,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: appearance-none, bg-transparent->background-color:#0000,
    // text-base-content/opacity-50->color/opacity, outline-hidden->outline-style:none
    // (+ --tw-outline-style + forced-colors, exactly as Tailwind v4 emits it).
    rules.push([
      "__daisy-textarea-nested",
      [
        `${textarea} textarea{appearance:none;background-color:#0000;border:none;&::placeholder{color:var(--color-base-content);opacity:0.5;}&:focus,&:focus-within{--tw-outline-style:none;outline-style:none;@media (forced-colors:active){outline-offset:2px;outline:2px solid #0000;}}}` +
          `${textarea}:focus,${textarea}:focus-within{--input-color:var(--color-base-content);box-shadow:0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000);outline:2px solid var(--input-color);outline-offset:2px;isolation:isolate;}` +
          `@media (pointer:coarse){@supports (-webkit-touch-callout:none){${textarea}:focus,${textarea}:focus-within{--font-size:1rem;}}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :disabled states, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: border-base-200->border-color, bg-base-200->background-color,
    // text-base-content/40->color-mix 40%, cursor-not-allowed->cursor,
    // placeholder text-base-content/opacity-20.
    rules.push([
      "__daisy-textarea-disabled",
      [
        `${textarea}:has(>textarea[disabled]),${textarea}:is(:disabled, [disabled]){border-color:var(--color-base-200);background-color:var(--color-base-200);color:color-mix(in oklab, var(--color-base-content) 40%, transparent);cursor:not-allowed;box-shadow:none;&::placeholder,& ::placeholder{color:var(--color-base-content);opacity:0.2;}}` +
          `${textarea}:has(>textarea[disabled])>textarea[disabled]{cursor:not-allowed;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // .textarea-ghost, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-transparent->background-color:#0000,
    // focus text-base-content/bg-base-100.
    rules.push([
      key("textarea-ghost"),
      [
        `${sel(".textarea-ghost")}{background-color:#0000;box-shadow:none;border-color:#0000;&:focus,&:focus-within{background-color:var(--color-base-100);color:var(--color-base-content);box-shadow:none;border-color:#0000;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2. The bare class selector is
    // kept (as upstream authors it) so the wiring resolves in static cascade too.
    const textareaColors: Array<[string, string]> = [
      ["textarea-neutral", "var(--color-neutral)"],
      ["textarea-primary", "var(--color-primary)"],
      ["textarea-secondary", "var(--color-secondary)"],
      ["textarea-accent", "var(--color-accent)"],
      ["textarea-info", "var(--color-info)"],
      ["textarea-success", "var(--color-success)"],
      ["textarea-warning", "var(--color-warning)"],
      ["textarea-error", "var(--color-error)"],
    ];
    for (const [name, color] of textareaColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [`${s},${s}:focus,${s}:focus-within{--input-color:${color};}`],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Values verified from source.
    const textareaSizes: Array<[string, string, string]> = [
      ["textarea-xs", "0.6875rem", "3"],
      ["textarea-sm", "0.75rem", "4"],
      ["textarea-md", "0.875rem", "5"],
      ["textarea-lg", "1.125rem", "6"],
      ["textarea-xl", "1.375rem", "7"],
    ];
    for (const [name, fs, top] of textareaSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--font-size-min:${fs};}${sel(".floating-label")}:has(${s}){--top-mul:${top};--font-size:${fs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── textrotate ───────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/textrotate.css
  // Single class; the `> *` item-count rotator nests are copied as upstream does
  // (fully expanded CSS; all timings authored, none left as directives).
  if (shouldInclude("textrotate", opts.include, opts.exclude)) {
    const tr = sel(".text-rotate");
    rules.push([
      "__daisy-textrotate-nested",
      [
        `${tr}>*{height:calc(var(--items, 1) * 100%);justify-items:start;display:grid;` +
          `&:has(>*:nth-child(2)){--items:2;@media (prefers-reduced-motion:no-preference){animation:rotator var(--duration, 10s) linear(0 0% 49%, 0.5 50% 99%, 1 100% 100%) infinite;}@media (prefers-reduced-motion:reduce){animation:rotator var(--duration, 10s) steps(var(--items), jump-end) infinite;}}` +
          `&:has(>*:nth-child(3)){--items:3;@media (prefers-reduced-motion:no-preference){animation:rotator var(--duration, 10s) linear(0 0% 32%, 0.333333 33% 65%, 0.666666 66% 99%, 1 100% 100%) infinite;}}` +
          `&:has(>*:nth-child(4)){--items:4;@media (prefers-reduced-motion:no-preference){animation:rotator var(--duration, 10s) linear(0 0% 24%, 0.25 25% 49%, 0.5 50% 74%, 0.75 75% 99%, 1 100% 100%) infinite;}}` +
          `&:has(>*:nth-child(5)){--items:5;@media (prefers-reduced-motion:no-preference){animation:rotator var(--duration, 10s) linear(0 0% 19%, 0.2 20% 39%, 0.4 40% 59%, 0.6 60% 79%, 0.8 80% 99%, 1 100% 100%) infinite;}}` +
          `&:has(>*:nth-child(6)){--items:6;@media (prefers-reduced-motion:no-preference){animation:rotator var(--duration, 10s) linear(0 0% 15%, 0.16666 16% 32%, 0.333333 33% 49%, 0.5 50% 65%, 0.666666 66% 82%, 0.833333 83% 99%, 1 100% 100%) infinite;}}` +
          `&>*{clip-path:inset(.5px 0);align-content:baseline;&:first-child{translate:var(--first-item-position);}}}` +
          `${tr}:hover>*{animation-play-state:paused;}` +
          `@keyframes rotator{89.9999%, 100%{--first-item-position:0 0%;}90%, 99.9999%{--first-item-position:0 calc(var(--items) * 100%);}100%{translate:0 -100%;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── timeline ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/timeline.css
  if (shouldInclude("timeline", opts.include, opts.exclude)) {
    const timeline = sel(".timeline");
    const tstart = sel(".timeline-start");
    const tmiddle = sel(".timeline-middle");
    const tend = sel(".timeline-end");
    // > li / hr / end-cap radius nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: relative/grid/shrink-0/items-center, w-full->width:100%,
    // col-start-1/row-start-2, col-start-3/col-end-none/row-start-2/row-end-auto
    // (merged to grid-area:2/3/auto/none), bg-base-300/h-1, rounded-e/s-selector
    // end caps (emitted as physical/logical radius props, as upstream build does).
    rules.push([
      "__daisy-timeline-nested",
      [
        `${timeline}>li{grid-template-rows:var(--timeline-row-start, minmax(0, 1fr)) auto var(--timeline-row-end, minmax(0, 1fr));grid-template-columns:var(--timeline-col-start, minmax(0, 1fr)) auto var(--timeline-col-end, minmax(0, 1fr));flex-shrink:0;align-items:center;display:grid;position:relative;&>hr{border:none;width:100%;&:first-child{grid-row-start:2;grid-column-start:1;}&:last-child{grid-area:2/3/auto/none;}@media print{border:0.1px solid var(--color-base-300);}}}` +
          `${timeline} :where(hr){background-color:var(--color-base-300);height:0.25rem;}` +
          `${timeline}:has(${tmiddle} hr):first-child{border-start-start-radius:0;border-start-end-radius:var(--radius-selector);border-end-end-radius:var(--radius-selector);border-end-start-radius:0;}` +
          `${timeline}:has(${tmiddle} hr):last-child,${timeline}:not(:has(${tmiddle})) :first-child hr:last-child{border-start-start-radius:var(--radius-selector);border-start-end-radius:0;border-end-end-radius:0;border-end-start-radius:var(--radius-selector);}` +
          `${timeline}:not(:has(${tmiddle})) :last-child hr:first-child{border-start-start-radius:0;border-start-end-radius:var(--radius-selector);border-end-end-radius:var(--radius-selector);border-end-start-radius:0;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .timeline-compact, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: col/row-start/end + self/justify merges to grid-area + place-self
    // (as upstream build emits), col-start-none/row-start-auto, col-start-3/...,
    // col-start-auto/row-start-none.
    const compact = sel(".timeline-compact");
    const vertical = sel(".timeline-vertical");
    rules.push([
      key("timeline-compact"),
      [
        `${compact}{--timeline-row-start:0;}` +
          `${compact} ${tstart}{grid-area:3/1/4/4;place-self:flex-start center;}` +
          `${compact} li:has(${tstart}) ${tend}{grid-row-start:auto;grid-column-start:none;}` +
          `${compact}${vertical}>li{--timeline-col-start:0;}` +
          `${compact}${vertical} ${tstart}{grid-area:1/3/4/4;place-self:center flex-start;}` +
          `${compact}${vertical} li:has(${tstart}) ${tend}{grid-row-start:none;grid-column-start:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .timeline-snap-icon, upstream layer daisyui.l1.l2 -> daisy-l2.
    rules.push([
      key("timeline-snap-icon"),
      [
        `${sel(".timeline-snap-icon")}>li{--timeline-col-start:0.5rem;--timeline-row-start:minmax(0, 1fr);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .timeline-vertical, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: flex-col->flex-direction:column, justify-items-center,
    // h-full/w-1->height:100%/width:0.25rem, col/row placements (last-child hr
    // merged to grid-area:3/2/none), start/end areas, rounded-t/b-selector caps.
    rules.push([
      key("timeline-vertical"),
      [
        `${vertical}{flex-direction:column;}` +
          `${vertical}>li{--timeline-row-start:minmax(0, 1fr);--timeline-row-end:minmax(0, 1fr);justify-items:center;&>hr{width:0.25rem;height:100%;&:first-child{grid-row-start:1;grid-column-start:2;}&:last-child{grid-area:3/2/none;}}}` +
          `${vertical} ${tstart}{grid-area:1/1/4/2;place-self:center flex-end;}` +
          `${vertical} ${tend}{grid-area:1/3/4/4;place-self:center flex-start;}` +
          `${vertical}:has(${tmiddle})>li>hr:first-child{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:var(--radius-selector);border-bottom-left-radius:var(--radius-selector);}` +
          `${vertical}:has(${tmiddle})>li>hr:last-child,${vertical}:not(:has(${tmiddle})) :first-child>hr:last-child{border-top-left-radius:var(--radius-selector);border-top-right-radius:var(--radius-selector);border-bottom-right-radius:0;border-bottom-left-radius:0;}` +
          `${vertical}:not(:has(${tmiddle})) :last-child>hr:first-child{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:var(--radius-selector);border-bottom-left-radius:var(--radius-selector);}` +
          `${vertical}${sel(".timeline-snap-icon")}>li{--timeline-col-start:minmax(0, 1fr);--timeline-row-start:0.5rem;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .timeline-horizontal, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: flex-row->flex-direction:row, items-center, h-1/w-full,
    // start/end areas, rounded-e/s-selector caps.
    const horizontal = sel(".timeline-horizontal");
    rules.push([
      key("timeline-horizontal"),
      [
        `${horizontal}{flex-direction:row;}` +
          `${horizontal}>li{align-items:center;&>hr{width:100%;height:0.25rem;&:first-child{grid-row-start:2;grid-column-start:1;}&:last-child{grid-area:2/3/auto/none;}}}` +
          `${horizontal} ${tstart}{grid-area:1/1/2/4;place-self:flex-end center;}` +
          `${horizontal} ${tend}{grid-area:3/1/4/4;place-self:flex-start center;}` +
          `${horizontal}:has(${tmiddle})>li>hr:first-child{border-start-start-radius:0;border-start-end-radius:var(--radius-selector);border-end-end-radius:var(--radius-selector);border-end-start-radius:0;}` +
          `${horizontal}:has(${tmiddle})>li>hr:last-child,${horizontal}:not(:has(${tmiddle})) :first-child>hr:last-child{border-start-start-radius:var(--radius-selector);border-start-end-radius:0;border-end-end-radius:0;border-end-start-radius:var(--radius-selector);}` +
          `${horizontal}:not(:has(${tmiddle})) :last-child>hr:first-child{border-start-start-radius:0;border-start-end-radius:var(--radius-selector);border-end-end-radius:var(--radius-selector);border-end-start-radius:0;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── toast ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/toast.css
  if (shouldInclude("toast", opts.include, opts.exclude)) {
    const toast = sel(".toast");
    // Entrance animation + keyframes, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      "__daisy-toast-nested",
      [
        `@media (prefers-reduced-motion:no-preference){${toast}>*{animation:0.25s ease-out toast;}}` +
          `@keyframes toast{0%{scale:0.9;opacity:0;}100%{scale:1;opacity:1;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .toast-center, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: start-1/2 end-1/2->inset-inline:50%.
    rules.push([
      key("toast-center"),
      [
        `${sel(".toast-center")}{--toast-x:-50%;inset-inline:50%;}` +
          `${sel(".toast-center")}:dir(rtl){--toast-x:50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── toggle ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/toggle.css
  if (shouldInclude("toggle", opts.include, opts.exclude)) {
    const toggle = sel(".toggle");
    // Icon children + :before knob + forced-colors/print,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: z-1/col-span-1/col-start-2/row-start-1/h-full/cursor-pointer/
    // appearance-none/bg-transparent/p-0.5->z-index:1/grid-column:2/span 1/
    // grid-row-start:1/height:100%/cursor/appearance/background-color:#0000/padding:0.125rem,
    // outline-hidden (+ forced-colors, as Tailwind v4 emits it),
    // text-base-100->color, opacity-0/100, rounded-selector/relative/start-0/
    // col-start-2/row-start-1/aspect-square/h-full/w-full/bg-current, outline/-outline-offset-1.
    rules.push([
      "__daisy-toggle-nested",
      [
        `${toggle}>*{z-index:1;cursor:pointer;appearance:none;background-color:#0000;border:none;grid-column:2/span 1;grid-row-start:1;height:100%;padding:0.125rem;transition:opacity 0.2s, rotate 0.4s;` +
          `&:focus{--tw-outline-style:none;outline-style:none;@media (forced-colors:active){outline-offset:2px;outline:2px solid #0000;}}` +
          `&:nth-child(2){color:var(--color-base-100);rotate:0deg;}` +
          `&:nth-child(3){color:var(--color-base-100);opacity:0;rotate:-15deg;}}` +
          `${toggle}:has(:checked)>:nth-child(2){opacity:0;rotate:15deg;}` +
          `${toggle}:has(:checked)>:nth-child(3){opacity:1;rotate:0deg;}` +
          `${toggle}:before{aspect-ratio:1;border-radius:var(--radius-selector);--tw-content:"";content:var(--tw-content);width:100%;height:100%;` +
          `box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000);` +
          `background-color:currentColor;background-size:auto, calc(var(--noise) * 100%);background-image:none, var(--fx-noise);` +
          `grid-row-start:1;grid-column-start:2;transition:background-color 0.1s, translate 0.2s, inset-inline-start 0.2s;position:relative;inset-inline-start:0;translate:0;}` +
          `@media (forced-colors:active){${toggle}:before{outline-style:var(--tw-outline-style);outline-offset:calc(1px * -1);outline-width:1px;}}` +
          `@media print{${toggle}:before{outline-offset:-1rem;outline:0.25rem solid;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :checked / :indeterminate / :disabled / :focus-visible states. Upstream keeps
    // all of these in daisyui.l1.l2.l3 (not bare l1), so they stay daisy-l3 here.
    // Expanded: bg-base-100->background-color, cursor-not-allowed/opacity-30,
    // bg-transparent->background-color:#0000.
    rules.push([
      "__daisy-toggle-state",
      [
        `${toggle}:focus-visible,${toggle}:has(:focus-visible){outline-offset:2px;outline:2px solid;}` +
          `${toggle}:checked,${toggle}[aria-checked=true],${toggle}:has(>input:checked){background-color:var(--color-base-100);--input-color:var(--color-base-content);grid-template-columns:1fr 1fr 0fr;&:before{background-color:currentColor;}@starting-style{&:before{opacity:0;}}}` +
          `${toggle}:indeterminate{grid-template-columns:0.5fr 1fr 0.5fr;}` +
          `${toggle}:disabled{cursor:not-allowed;opacity:0.3;&:before{border:var(--border) solid currentColor;background-color:#0000;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2. Checked-only selectors are
    // kept verbatim (no bare-class slice: an unchecked toggle must keep the dim
    // base-50% --input-color, so the color must not leak into the static cascade).
    const toggleColors: Array<[string, string]> = [
      ["toggle-primary", "var(--color-primary)"],
      ["toggle-secondary", "var(--color-secondary)"],
      ["toggle-accent", "var(--color-accent)"],
      ["toggle-neutral", "var(--color-neutral)"],
      ["toggle-success", "var(--color-success)"],
      ["toggle-warning", "var(--color-warning)"],
      ["toggle-info", "var(--color-info)"],
      ["toggle-error", "var(--color-error)"],
    ];
    for (const [name, color] of toggleColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [`${s}:checked,${s}[aria-checked=true]{--input-color:${color};}`],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Values verified from source.
    const toggleSizes: Array<[string, string]> = [
      ["toggle-xs", "4"],
      ["toggle-sm", "5"],
      ["toggle-md", "6"],
      ["toggle-lg", "7"],
      ["toggle-xl", "8"],
    ];
    for (const [name, mul] of toggleSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}:is([type=checkbox]),${s}:has([type=checkbox]){--size:calc(var(--size-selector, 0.25rem) * ${mul});}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── tooltip ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/tooltip.css
  if (shouldInclude("tooltip", opts.include, opts.exclude)) {
    const tooltip = sel(".tooltip");
    const tcontent = sel(".tooltip-content");
    const bubble = `${tooltip}>${tcontent},${tooltip}[data-tip]:before`;
    // Bubble + tail + reduced-motion, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: text-neutral-content->color, rounded-field->border-radius,
    // absolute->position, max-w-[20rem]->max-width:20rem, px-2/py-1->paddings,
    // text-center->text-align, whitespace-normal->white-space, opacity-0->opacity:0,
    // absolute/opacity-0 (tail). Decls are literal strings: the svg mask url and
    // `cubic-bezier()` timings must never pass through applyPrefix (see note above),
    // so only the selector substrings use sel().
    const maskUrl =
      `url("data:image/svg+xml,%3Csvg width='10' height='4' viewBox='0 0 8 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E` +
      `%3Cpath d='M0.500009 1C3.5 1 3.00001 4 5.00001 4C7 4 6.5 1 9.5 1C10 1 10 0.499897 10 0H0C-1.99338e-08 0.5 0 1 0.500009 1Z' fill='black'/%3E%3C/svg%3E%0A")`;
    rules.push([
      "__daisy-tooltip-nested",
      [
        `${bubble}{border-radius:var(--radius-field);text-align:center;white-space:normal;max-width:20rem;color:var(--color-neutral-content);opacity:0;` +
          `background-color:var(--tt-bg);pointer-events:none;z-index:2;--tw-content:attr(data-tip);content:var(--tw-content);width:max-content;` +
          `transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, 0.25rem));inset:auto auto var(--tt-off) 50%;` +
          `padding-block:0.25rem;padding-inline:0.5rem;font-size:0.875rem;font-weight:400;line-height:1.25;position:absolute;}` +
          `${tooltip}:after{position:absolute;opacity:0;background-color:var(--tt-bg);content:"";pointer-events:none;width:0.625rem;height:0.25rem;display:block;` +
          `mask-repeat:no-repeat;mask-position:-1px 0;--mask-tooltip:${maskUrl};mask-image:var(--mask-tooltip);` +
          `transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, 0.25rem));inset:auto auto var(--tt-tail) 50%;}` +
          `@media (prefers-reduced-motion:no-preference){${bubble},${tooltip}:after{transition:opacity .2s cubic-bezier(.4,0,.2,1) 75ms,transform .2s cubic-bezier(.4,0,.2,1) 75ms;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Open/hover/focus-visible reveal, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Selector list copied from the upstream build (opacity-100->opacity:1).
    const gated = `${tooltip}:is([data-tip]:not([data-tip=""]), :has(${tcontent}:not(:empty)))`;
    // The upstream reveal block covers .tooltip-open + :hover + :has(:focus-visible)
    // with identical declarations; it is split here so no block is emitted twice:
    // the .tooltip-open slice lives in the public tooltip-open rule below.
    const hoverFocus = `${gated}:hover,${gated}:has(:focus-visible)`;
    rules.push([
      "__daisy-tooltip-open",
      [
        `${hoverFocus}>${tcontent},:is(${hoverFocus})[data-tip]:before,:is(${hoverFocus}):after{opacity:1;--tt-pos:0rem;` +
          `@media (prefers-reduced-motion:no-preference){transition:opacity .2s cubic-bezier(.4,0,.2,1),transform .2s cubic-bezier(.4,0,.2,1);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Positions, upstream layer daisyui.l1.l2 -> daisy-l2.
    rules.push([
      key("tooltip-top"),
      [
        `${sel(".tooltip-top")}>${tcontent},${sel(".tooltip-top")}[data-tip]:before{transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, 0.25rem));inset:auto auto var(--tt-off) 50%;}` +
          `${sel(".tooltip-top")}:after{transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, 0.25rem));inset:auto auto var(--tt-tail) 50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-bottom"),
      [
        `${sel(".tooltip-bottom")}>${tcontent},${sel(".tooltip-bottom")}[data-tip]:before{transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, -0.25rem));inset:var(--tt-off) auto auto 50%;}` +
          `${sel(".tooltip-bottom")}:after{transform:translateX(var(--tt-trans, -50%)) translateY(var(--tt-pos, -0.25rem)) rotate(180deg);inset:var(--tt-tail) auto auto 50%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-start"),
      [
        `${sel(".tooltip-start")}{--tt-trans:0;--tt-inset:0 auto;--tt-tail-inset:var(--tt-tail-off) auto;}` +
          `${sel(".tooltip-start")}>${tcontent},${sel(".tooltip-start")}[data-tip]:before{left:auto;right:auto;inset-inline:0 auto;}` +
          `${sel(".tooltip-start")}:after{left:auto;right:auto;inset-inline:var(--tt-tail-off) auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-center"),
      [
        `${sel(".tooltip-center")}{--tt-trans:-50%;--tt-inset:50% auto;--tt-tail-inset:50% auto;}` +
          `${sel(".tooltip-center")}>${tcontent},${sel(".tooltip-center")}[data-tip]:before,${sel(".tooltip-center")}:after{inset-inline:auto;left:50%;right:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-end"),
      [
        `${sel(".tooltip-end")}{--tt-trans:0;--tt-inset:auto 0;--tt-tail-inset:auto var(--tt-tail-off);}` +
          `${sel(".tooltip-end")}>${tcontent},${sel(".tooltip-end")}[data-tip]:before{left:auto;right:auto;inset-inline:auto 0;}` +
          `${sel(".tooltip-end")}:after{left:auto;right:auto;inset-inline:auto var(--tt-tail-off);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-left"),
      [
        `${sel(".tooltip-left")}>${tcontent},${sel(".tooltip-left")}[data-tip]:before{transform:translateX(calc(var(--tt-pos, 0.25rem) - 0.25rem)) translateY(var(--tt-trans, -50%));left:auto;right:var(--tt-off);inset-block:var(--tt-inset, 50% auto);}` +
          `${sel(".tooltip-left")}:after{transform:translateX(var(--tt-pos, 0.25rem)) translateY(var(--tt-trans, -50%)) rotate(-90deg);left:auto;right:calc(var(--tt-tail) + 1px);inset-block:var(--tt-tail-inset, 50% auto);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("tooltip-right"),
      [
        `${sel(".tooltip-right")}>${tcontent},${sel(".tooltip-right")}[data-tip]:before{transform:translateX(calc(var(--tt-pos, -0.25rem) + 0.25rem)) translateY(var(--tt-trans, -50%));left:var(--tt-off);right:auto;inset-block:var(--tt-inset, 50% auto);}` +
          `${sel(".tooltip-right")}:after{transform:translateX(var(--tt-pos, -0.25rem)) translateY(var(--tt-trans, -50%)) rotate(90deg);left:calc(var(--tt-tail) + 1px);right:auto;inset-block:var(--tt-tail-inset, 50% auto);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: text-<color>-content->color.
    const tooltipColors: Array<[string, string, string]> = [
      [
        "tooltip-primary",
        "var(--color-primary)",
        "var(--color-primary-content)",
      ],
      [
        "tooltip-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      ["tooltip-accent", "var(--color-accent)", "var(--color-accent-content)"],
      ["tooltip-info", "var(--color-info)", "var(--color-info-content)"],
      [
        "tooltip-success",
        "var(--color-success)",
        "var(--color-success-content)",
      ],
      [
        "tooltip-warning",
        "var(--color-warning)",
        "var(--color-warning-content)",
      ],
      ["tooltip-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, bg, fg] of tooltipColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--tt-bg:${bg};}${s}>${tcontent},${s}[data-tip]:before{color:${fg};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // .tooltip-open slice of the upstream reveal block (programmatic switch),
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3. The :hover/:has(:focus-visible)
    // slices live in __daisy-tooltip-open, so no block is emitted twice.
    const justOpen = `${gated}${sel(".tooltip-open")}`;
    rules.push([
      key("tooltip-open"),
      [
        `${justOpen}>${tcontent},:is(${justOpen})[data-tip]:before,:is(${justOpen}):after{opacity:1;--tt-pos:0rem;` +
          `@media (prefers-reduced-motion:no-preference){transition:opacity .2s cubic-bezier(.4,0,.2,1),transform .2s cubic-bezier(.4,0,.2,1);}}`,
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── validator ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/validator.css
  // :user-valid/:user-invalid states — selectors copied verbatim (including the
  // :is() wrapping the upstream build emits and unquoted [aria-*] attributes).
  if (shouldInclude("validator", opts.include, opts.exclude)) {
    const v = sel(".validator");
    const hint = sel(".validator-hint");
    const valid = `${v}:user-valid,${v}:has(:user-valid)`;
    const invalid =
      `${v}:user-invalid,${v}:has(:user-invalid),` +
      `${v}[aria-invalid]:not([aria-invalid=false]),${v}:has([aria-invalid]:not([aria-invalid=false]))`;
    // Wiring, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: text-error->color:var(--color-error), visible->visibility:visible.
    rules.push([
      key("validator"),
      [
        `:is(${valid}),:is(${valid}):focus,:is(${valid}):checked,:is(${valid})[aria-checked=true],:is(${valid}):focus-within{--input-color:var(--color-success);}` +
          `:is(${invalid}),:is(${invalid}):focus,:is(${invalid}):checked,:is(${invalid})[aria-checked=true],:is(${invalid}):focus-within{--input-color:var(--color-error);}` +
          `:is(${invalid})~${hint}{visibility:visible;color:var(--color-error);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Unhide, unlayered upstream ("stays in utilities layer") -> `utilities`.
    rules.push([
      "__daisy-validator-unhide",
      [`:is(${invalid})~${hint}{display:revert-layer;}`],
      { layer: "utilities", internal: true },
    ]);
  }

  return rules;
}
