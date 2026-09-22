import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 1 (6 canonical components).
// Dynamic, sized and stateful classes live here as Uno rules.
// Two rule kinds:
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS for a
//     base class. They never match user code directly; the base shortcut in
//     src/shortcuts/components.ts references them by token so they emit together
//     with the base (Uno merges a shortcut into a single selector, so :hover and
//     friends cannot live in the shortcut object itself).
//  2. Public rules: size/modifier/position classes (btn-xs, modal-open, ...) and
//     standalone state classes (btn-active, menu-active, ...). Static rules carry
//     flat declaration objects; anything with nested selectors is a raw CSS string
//     (static rule with a string body emits it verbatim, preserving &, media
//     queries and starting-style blocks as modern CSS nesting).
// Upstream at-apply utilities are expanded to raw CSS inline. No at-apply remains.
// Selector strings go through applyPrefix(); keyframes names are left unprefixed.
// Layer intent per block in comments: daisyui.l1.l2.l3 -> `daisy-l3`,
// .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`, bare daisyui (outermost/lowest) -> `daisy-l1`,
// .l1.l2.l3.l4 -> `components`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function componentRules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  // Prefix a selector string (all .classes inside are prefixed, pseudos kept).
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  // Public rule name (plain class, prefixed).
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── button ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/button.css
  if (shouldInclude("button", opts.include, opts.exclude)) {
    // Nested (non-:hover/active) parts of .btn, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: appearance-none->appearance:none.
    rules.push([
      "__daisy-btn-nested",
      [
        `${sel(":where(.btn)")}{width:unset;}` +
          `${sel('.prose :where(a.btn:not(.btn-link)):not(:where([class~="not-prose"], [class~="not-prose"] *))')}{text-decoration-line:none;}` +
          `${sel('.btn:is([type="checkbox"], [type="radio"])')}{appearance:none;&[aria-label]::after{--tw-content:attr(aria-label);content:var(--tw-content);}}` +
          `${sel('.btn:where(:checked:not(.filter [type="radio"].btn))')}{--btn-color:var(--color-primary);--btn-fg:var(--color-primary-content);}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Interactive states of .btn, upstream layer daisyui.l1 -> daisy-l1.
    // Expanded: pointer-events-none->pointer-events:none.
    // Opacity color: bg-base-content/10->background-color:color-mix 10%.
    // The aria-pressed/checked/current selector is the .btn-token half of the upstream
    // .btn-active block (the .btn-active half lives in the public rule below, so no
    // block is emitted twice). Disabled block is upstream bare-daisyui layer (lowest);
    // kept here with the other states and noted.
    const btn = sel(".btn");
    rules.push([
      "__daisy-btn-state",
      [
        `@media (hover:hover){${btn}:hover{--btn-bg:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%);color:var(--btn-fg);--btn-border:color-mix(in oklab, var(--btn-bg), #000 calc(var(--depth) * 5%));--btn-border-style:solid;--btn-inset:0 0.5px 0 0.5px oklch(100% 0 0 / calc(var(--depth) * 6%));--btn-shadow:0 3px 2px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000), 0 4px 3px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000);}}` +
          `${sel('.btn:active:not(.btn-active, [aria-pressed="true"], [aria-checked="true"], [aria-current]:not([aria-current="false"], [aria-current=""]]))')}{translate:0 0.5px;--btn-bg:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 5%);color:var(--btn-fg, var(--color-base-content));--btn-border:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%);--btn-border-style:solid;--btn-inset:0 0 0 0 oklch(0% 0 0/0);--btn-shadow:0 0 0 0 oklch(0% 0 0/0);}` +
          `${sel('.btn:where(:checked:not(.filter [type="radio"].btn), :not([type="radio"], [type="checkbox"]):focus-visible)')}{--btn-bg:var(--btn-color, var(--color-base-200));color:var(--btn-fg, var(--color-base-content));--btn-border:color-mix(in oklab, var(--btn-bg), #000 calc(var(--depth) * 5%));--btn-border-style:solid;--btn-inset:0 0.5px 0 0.5px oklch(100% 0 0 / calc(var(--depth) * 6%));--btn-shadow:0 3px 2px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000), 0 4px 3px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000);isolation:isolate;}` +
          `${btn}:focus-visible,${btn}:has(:focus-visible){outline-width:2px;outline-style:solid;isolation:isolate;}` +
          `${sel('.btn:is([aria-pressed="true"], [aria-checked="true"], [aria-current]:not([aria-current="false"], [aria-current=""]]))')}{--btn-bg:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 5%);color:var(--btn-fg, var(--color-base-content));--btn-border:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%);--btn-border-style:solid;--btn-inset:0 0 0 0 oklch(0% 0 0/0);--btn-shadow:0 0 0 0 oklch(0% 0 0/0);isolation:isolate;}` +
          `${sel('.btn:is(:disabled, [disabled], [aria-disabled="true"])')}{pointer-events:none;color:color-mix(in oklch, var(--color-base-content) 20%, #0000);--btn-bg:#0000;--btn-border:#0000;background-image:none;--btn-inset:0 0 0 0 oklch(0% 0 0/0);--btn-shadow:0 0 0 0 oklch(0% 0 0/0);&:not(${sel(".btn-link")}, ${sel(".btn-ghost")}){background-color:color-mix(in oklab, var(--color-base-content) 10%, transparent);}}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
    // .btn-active block, upstream layer daisyui.l1.l2 -> daisy-l2. Only the .btn-active
    // selector is kept here; the .btn[aria-*] half lives in __daisy-btn-state so the
    // declarations are never emitted twice for `class="btn btn-active"`.
    rules.push([
      key("btn-active"),
      [
        `${sel(".btn-active")}{--btn-bg:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 5%);color:var(--btn-fg, var(--color-base-content));--btn-border:color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%);--btn-border-style:solid;--btn-inset:0 0 0 0 oklch(0% 0 0/0);--btn-shadow:0 0 0 0 oklch(0% 0 0/0);isolation:isolate;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .btn-disabled block, upstream bare daisyui layer -> daisy-l1. Only the
    // .btn-disabled selector is kept here; the .btn:disabled half lives in
    // __daisy-btn-state so the declarations are never emitted twice.
    rules.push([
      key("btn-disabled"),
      [
        `${sel(".btn-disabled")}{pointer-events:none;color:color-mix(in oklch, var(--color-base-content) 20%, #0000);--btn-bg:#0000;--btn-border:#0000;background-image:none;--btn-inset:0 0 0 0 oklch(0% 0 0/0);--btn-shadow:0 0 0 0 oklch(0% 0 0/0);&:not(${sel(".btn-link")}, ${sel(".btn-ghost")}){background-color:color-mix(in oklab, var(--color-base-content) 10%, transparent);}}`,
      ],
      { layer: "daisy-l1" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
    const btnSizes: Array<[string, string, string, string]> = [
      ["btn-xs", "0.6875rem", "0.5rem", "6"],
      ["btn-sm", "0.75rem", "0.75rem", "8"],
      ["btn-md", "0.875rem", "1rem", "10"],
      ["btn-lg", "1.125rem", "1.25rem", "12"],
      ["btn-xl", "1.375rem", "1.5rem", "14"],
    ];
    for (const [name, fs, p, mul] of btnSizes) {
      rules.push([
        key(name),
        [
          {
            "--fontsize": fs,
            "--btn-p": p,
            "--size": `calc(var(--size-field, 0.25rem) * ${mul})`,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Layout modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: w-full->width:100%, max-w-64->max-width:16rem, px-0->padding-inline:0,
    // rounded-full->border-radius:calc(infinity * 1px).
    rules.push([
      key("btn-wide"),
      [{ width: "100%", "max-width": "16rem" }],
      { layer: "daisy-l2" },
    ]);
    rules.push([key("btn-block"), [{ width: "100%" }], { layer: "daisy-l2" }]);
    rules.push([
      key("btn-square"),
      [{ "padding-inline": "0", width: "var(--size)", height: "var(--size)" }],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("btn-circle"),
      [
        {
          "border-radius": "calc(infinity * 1px)",
          "padding-inline": "0",
          width: "var(--size)",
          height: "var(--size)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── badge ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/badge.css
  // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
  if (shouldInclude("badge", opts.include, opts.exclude)) {
    const badgeSizes: Array<[string, string, string]> = [
      ["badge-xs", "4", "0.625rem"],
      ["badge-sm", "5", "0.75rem"],
      ["badge-md", "6", "0.875rem"],
      ["badge-lg", "7", "1rem"],
      ["badge-xl", "8", "1.125rem"],
    ];
    for (const [name, mul, fs] of badgeSizes) {
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

  // ─── card ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/card.css
  if (shouldInclude("card", opts.include, opts.exclude)) {
    // :focus-visible/:has states + checkbox children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: cursor-pointer->cursor:pointer.
    const card = sel(".card");
    rules.push([
      "__daisy-card-state",
      [
        `${card}:focus-visible,${card}[aria-checked="true"],${card}:has(> :checked, > :is([type="checkbox"], [type="radio"]):focus-visible){outline-color:currentColor;}` +
          `${card}:has(> :checked:focus-visible),${card}[aria-checked="true"]:focus-visible,${card}[aria-checked="true"]:has(> :is([type="checkbox"], [type="radio"]):focus-visible){outline-width:4px;}` +
          `${card}:has(> :is([type="checkbox"], [type="radio"])){cursor:pointer;user-select:none;}` +
          `${card} > :is([type="checkbox"], [type="radio"]){appearance:none;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // figure radius blocks, upstream layer daisyui.l1.l2.l3.l4 -> components.
    // Expanded: overflow-hidden->overflow:hidden, flex/items-center/justify-center->flex block.
    rules.push([
      "__daisy-card-figure",
      [
        `${card} figure:first-child{overflow:hidden;border-start-start-radius:inherit;border-start-end-radius:inherit;border-end-start-radius:unset;border-end-end-radius:unset;}` +
          `${card} figure:last-child{overflow:hidden;border-start-start-radius:unset;border-start-end-radius:unset;border-end-start-radius:inherit;border-end-end-radius:inherit;}` +
          `${card} figure{display:flex;align-items:center;justify-content:center;}`,
      ],
      { layer: "components", internal: true },
    ]);
    // .card-body, upstream layer daisyui.l1.l2.l3 (+ l4 for p) -> daisy-l3,
    // with the l4 part kept in the same raw block and noted.
    // Expanded: flex/flex-auto/flex-col/gap-2->display:flex/flex:1 1 auto/direction/gap,
    // grow->flex-grow:1.
    rules.push([
      key("card-body"),
      [
        `${sel(".card-body")}{display:flex;flex:1 1 auto;flex-direction:column;gap:0.5rem;padding:var(--card-p, 1.5rem);font-size:var(--card-fs, 0.875rem);& p{flex-grow:1;}}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // .image-full, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: grid->display:grid, col-start-1/row-start-1, text-neutral-content->color,
    // relative->position, overflow-hidden, h-full->height:100%, object-cover->object-fit:cover.
    rules.push([
      key("image-full"),
      [
        `${sel(".image-full")}{display:grid;& > *{grid-column-start:1;grid-row-start:1;}& > ${sel(".card-body")}{color:var(--color-neutral-content);position:relative;}& :where(figure){overflow:hidden;border-radius:inherit;}& > figure img{height:100%;object-fit:cover;filter:brightness(28%);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const cardSizes: Array<[string, string, string, string, string]> = [
      ["card-xs", "0.5rem", "0.6875rem", "0.875rem", "xs"],
      ["card-sm", "1rem", "0.75rem", "1rem", "sm"],
      ["card-md", "1.5rem", "0.875rem", "1.125rem", "md"],
      ["card-lg", "2rem", "1rem", "1.25rem", "lg"],
      ["card-xl", "2.5rem", "1.125rem", "1.375rem", "xl"],
    ];
    for (const [name, p, fs, tfs] of cardSizes) {
      void tfs;
      rules.push([
        key(name),
        [
          `${sel(`.${name}`)} ${sel(".card-body")}{--card-p:${p};--card-fs:${fs};}` +
            `${sel(`.${name}`)} ${sel(".card-title")}{--cardtitle-fs:${tfs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // .card-side, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: overflow-hidden (x2).
    rules.push([
      key("card-side"),
      [
        `${sel(".card-side")}{align-items:stretch;flex-direction:row;& :where(figure:first-child){overflow:hidden;border-start-start-radius:inherit;border-start-end-radius:unset;border-end-start-radius:inherit;border-end-end-radius:unset;}& :where(figure:last-child){overflow:hidden;border-start-start-radius:unset;border-start-end-radius:inherit;border-end-start-radius:unset;border-end-end-radius:inherit;}& figure > *{max-width:unset;}& :where(figure > *){width:100%;height:100%;object-fit:cover;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── input ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/input.css
  if (shouldInclude("input", opts.include, opts.exclude)) {
    const input = sel(".input");
    // Children, placeholders, picker pseudos, :focus and coarse-pointer,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: h-full/w-full->100%, appearance-none, bg-transparent->background-color:transparent,
    // text-base-content->color, opacity-50->opacity:0.5, outline-hidden->outline-style:hidden,
    // relative->position, inline-flex->display, text-start->text-align:start,
    // grid/min-h-full/items-center->display/min-height/align-items, py-1->padding-block:0.25rem.
    rules.push([
      "__daisy-input-nested",
      [
        `${input} input{height:100%;width:100%;appearance:none;background-color:transparent;border:none;&::placeholder{color:var(--color-base-content);opacity:0.5;}&:focus,&:focus-within{outline-style:hidden;}&::-webkit-calendar-picker-indicator{inset-inline-end:-0.15em;}}` +
          `${input}::-webkit-inner-spin-button{margin-inline-end:-10px;}` +
          `${input}::-webkit-calendar-picker-indicator{inset-inline-end:0.75em;}` +
          `${sel("input.input")},${input} input{position:relative;display:inline-flex;text-align:start;&[type="url"],&[type="tel"],&[type="email"],&[type="number"]{direction:ltr;}&::-webkit-datetime-edit,&::-webkit-date-and-time-value{display:grid;min-height:100%;align-items:center;text-align:inherit;}&::-webkit-inner-spin-button{margin-block:calc(var(--spacing) * var(--spin-my, -3));}&::-webkit-calendar-picker-indicator{position:absolute;width:1em;height:1em;cursor:pointer;}&::-webkit-color-swatch-wrapper{padding-block:0.25rem;}}` +
          `${input}:focus,${input}:focus-within{--input-color:var(--color-base-content);box-shadow:0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000);outline:2px solid var(--input-color);outline-offset:2px;}` +
          `@media (pointer:coarse){@supports (-webkit-touch-callout:none){${input}:focus,${input}:focus-within{--font-size:1rem;}}}` +
          `${sel('.input[type="url"]')}:dir(rtl),${sel('.input[type="tel"]')}:dir(rtl),${sel('.input[type="email"]')}:dir(rtl),${sel('.input[type="number"]')}:dir(rtl){border-start-start-radius:var(--join-se, var(--radius-field));border-start-end-radius:var(--join-ss, var(--radius-field));border-end-start-radius:var(--join-ee, var(--radius-field));border-end-end-radius:var(--join-es, var(--radius-field));}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // :disabled states, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: border-base-200->border-color, bg-base-200->background-color,
    // cursor-not-allowed->cursor, text-base-content/40->color-mix 40%, opacity-20->opacity:0.2.
    rules.push([
      "__daisy-input-disabled",
      [
        `${input}:has(> input[disabled]),${input}:is(:disabled, [disabled]),fieldset:disabled ${input}{border-color:var(--color-base-200);background-color:var(--color-base-200);cursor:not-allowed;&:is(input),& :is(input){color:color-mix(in oklab, var(--color-base-content) 40%, transparent);}box-shadow:none;&::placeholder,& ::placeholder{color:var(--color-base-content);opacity:0.2;}}` +
          `${input}:has(> input[disabled]) > input[disabled]{cursor:not-allowed;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // .input-ghost, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-transparent, text-base-content->color, bg-base-100->background-color.
    rules.push([
      key("input-ghost"),
      [
        `${sel(".input-ghost")}{background-color:transparent;box-shadow:none;border-color:#0000;&:focus,&:focus-within{color:var(--color-base-content);background-color:var(--color-base-100);border-color:#0000;box-shadow:none;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. Compound
    // (& + :focus) selectors kept so the color wins over base :focus specificity.
    const inputColors: Array<[string, string]> = [
      ["input-neutral", "var(--color-neutral)"],
      ["input-primary", "var(--color-primary)"],
      ["input-secondary", "var(--color-secondary)"],
      ["input-accent", "var(--color-accent)"],
      ["input-info", "var(--color-info)"],
      ["input-success", "var(--color-success)"],
      ["input-warning", "var(--color-warning)"],
      ["input-error", "var(--color-error)"],
    ];
    for (const [name, color] of inputColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [`${s},${s}:focus,${s}:focus-within{--input-color:${color};}`],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. floating-label hooks kept verbatim.
    const inputSizes: Array<[string, string, string, string, string, string]> =
      [
        ["input-xs", "6", "0.6875rem", "-1", "3", "0.6875rem"],
        ["input-sm", "8", "0.75rem", "-2", "4", "0.75rem"],
        ["input-md", "10", "0.875rem", "-3", "5", "0.875rem"],
        ["input-lg", "12", "1.125rem", "-3", "6", "1.125rem"],
        ["input-xl", "14", "1.375rem", "-4", "7", "1.375rem"],
      ];
    for (const [name, mul, fs, spin, top, flfs] of inputSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--in-size-mul:${mul};--font-size-min:${fs};--spin-my:${spin};}` +
            `${sel(".floating-label")}:has(${s}){--top-mul:${top};--font-size:${flfs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── modal ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/modal.css
  if (shouldInclude("modal", opts.include, opts.exclude)) {
    const modal = sel(".modal");
    // ::backdrop + [popover], upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: hidden->display:none.
    rules.push([
      "__daisy-modal-nested",
      [
        `${modal}::backdrop{display:none;}` +
          `${modal}[popover]{inset:0;margin:0;border:0;padding:0;background:transparent;color:inherit;max-width:none;max-height:none;&::backdrop{background-color:oklch(0% 0 0/ 0.4);transition:background-color 0.3s ease-out;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Attr/pseudo-driven open states ([open], popover-open, :target, toggle),
    // upstream layer daisyui.l1.l2 -> daisy-l2. The .modal-open-class half lives in
    // the public modal-open rule below; the :root scroll-lock hook is kept here.
    // Expanded: pointer-events-auto->pointer-events:auto, visible->visibility,
    // opacity-100/opacity-0->opacity.
    const openAttr = `${modal}[open],${modal}:popover-open,${modal}:target,${sel(".modal-toggle")}:checked + ${modal}`;
    const openDecls =
      "pointer-events:auto;visibility:visible;opacity:100%;transition:visibility 0s allow-discrete, background-color 0.3s ease-out, opacity 0.1s ease-out;background-color:oklch(0% 0 0/ 0.4);";
    rules.push([
      "__daisy-modal-open-attr",
      [
        `${openAttr}{${openDecls}& > ${sel(".modal-box")}{translate:0 0;scale:1;opacity:1;}:root:has(&){--page-scroll-lock:;}}` +
          `@starting-style{${openAttr}{opacity:0;}}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // Class-driven open, upstream layer daisyui.l1.l2 -> daisy-l2.
    const openClass = `${modal}${sel(".modal-open")}`;
    rules.push([
      key("modal-open"),
      [
        `${openClass}{${openDecls}& > ${sel(".modal-box")}{translate:0 0;scale:1;opacity:1;}}` +
          `@starting-style{${openClass}{opacity:0;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .modal-backdrop, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: col-start-1/row-start-1, grid->display:grid, self-stretch->align-self,
    // justify-self-stretch, text-transparent->color:transparent, cursor-pointer->cursor.
    rules.push([
      key("modal-backdrop"),
      [
        `${sel(".modal-backdrop")}{grid-column-start:1;grid-row-start:1;display:grid;align-self:stretch;justify-self:stretch;color:transparent;z-index:-1;& button{cursor:pointer;}}`,
      ],
      { layer: "daisy-l3" },
    ]);
    // Placement modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: place-items-*, h-auto/w-full/max-w-none, h-screen/max-h-none/w-auto,
    // h-auto/w-11/12/max-w-[32rem].
    const box = sel(".modal-box");
    rules.push([
      key("modal-top"),
      [
        `${sel(".modal-top")}{place-items:start;& > ${box}{height:auto;width:100%;max-width:none;max-height:calc(100vh - 5em);translate:0 -100%;scale:1;--modal-tl:0;--modal-tr:0;--modal-bl:var(--radius-box);--modal-br:var(--radius-box);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("modal-middle"),
      [
        `${sel(".modal-middle")}{place-items:center;& > ${box}{height:auto;width:91.666667%;max-width:32rem;max-height:calc(100vh - 5em);translate:0 2%;scale:98%;--modal-tl:var(--radius-box);--modal-tr:var(--radius-box);--modal-bl:var(--radius-box);--modal-br:var(--radius-box);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("modal-bottom"),
      [
        `${sel(".modal-bottom")}{place-items:end;& > ${box}{height:auto;width:100%;max-width:none;max-height:calc(100vh - 5em);translate:0 100%;scale:1;--modal-tl:var(--radius-box);--modal-tr:var(--radius-box);--modal-bl:0;--modal-br:0;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("modal-start"),
      [
        `${sel(".modal-start")}{place-items:start;& > ${box}{height:100vh;max-height:none;width:auto;max-width:none;translate:-100% 0;scale:1;--modal-tl:0;--modal-tr:var(--radius-box);--modal-bl:0;--modal-br:var(--radius-box);[dir="rtl"] &{translate:100% 0;--modal-tl:var(--radius-box);--modal-tr:0;--modal-bl:var(--radius-box);--modal-br:0;}}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("modal-end"),
      [
        `${sel(".modal-end")}{place-items:end;& > ${box}{height:100vh;max-height:none;width:auto;max-width:none;translate:100% 0;scale:1;--modal-tl:var(--radius-box);--modal-tr:0;--modal-bl:var(--radius-box);--modal-br:0;[dir="rtl"] &{translate:-100% 0;--modal-tl:0;--modal-tr:var(--radius-box);--modal-bl:0;--modal-br:var(--radius-box);}}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── menu ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/menu.css
  if (shouldInclude("menu", opts.include, opts.exclude)) {
    const menu = sel(".menu");
    // All nested item/details/hover/focus/active/disabled CSS,
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: relative->position, ms-4->margin-inline-start:1rem, ps-2->padding-inline-start,
    // whitespace-nowrap, bg-base-content->background-color, absolute->position,
    // start-0->inset-inline-start:0, top-3/bottom-3->0.75rem, opacity-10->opacity:0.1,
    // hidden->display:none, rounded-field->border-radius:var(--radius-field), grid,
    // grid-flow-col->grid-auto-flow:column, content-start->align-content, items-center,
    // gap-2->gap:0.5rem, px-3/py-1.5->padding-inline/block, text-start->text-align:start,
    // outline-hidden->outline-style:hidden, justify-self-end, bg-base-content/10->color-mix,
    // text-base-content->color, cursor-pointer, opacity-10, relative/flex/shrink-0/flex-col/
    // flex-wrap/items-stretch, text-base-content/20->color-mix 20%, pointer-events-none,
    // mt-2->margin-top:0.5rem, p-2->padding:0.5rem.
    rules.push([
      "__daisy-menu-state",
      [
        `${menu} :where(li ul, li menu){position:relative;margin-inline-start:1rem;padding-inline-start:0.5rem;white-space:nowrap;&:before{background-color:var(--color-base-content);position:absolute;inset-inline-start:0;top:0.75rem;bottom:0.75rem;opacity:0.1;width:var(--border);content:"";}}` +
          `${menu} :where(li > ${sel(".menu-dropdown")}:not(${sel(".menu-dropdown-show")})){display:none;}` +
          `${menu} :where(li:not(${sel(".menu-title")}) > *:not(ul, menu, details, ${sel(".menu-title")}, ${sel(".btn")})),${menu} :where(li:not(${sel(".menu-title")}) > details > summary:not(${sel(".menu-title")})){border-radius:var(--radius-field);display:grid;grid-auto-flow:column;align-content:start;align-items:center;gap:0.5rem;padding-inline:0.75rem;padding-block:0.375rem;text-align:start;transition-property:color, background-color, box-shadow;transition-duration:0.2s;transition-timing-function:cubic-bezier(0, 0, 0.2, 1);grid-auto-columns:minmax(auto, max-content) auto max-content;user-select:none;}` +
          `${menu} :where(li > details > summary){outline-style:hidden;&::-webkit-details-marker{display:none;}}` +
          `${menu} :where(li > details > summary),${menu} :where(li > ${sel(".menu-dropdown-toggle")}){&:after{justify-self:end;display:block;height:0.375rem;width:0.375rem;rotate:-135deg;translate:0 -1px;transition-property:rotate, translate;transition-duration:0.2s;content:"";transform-origin:50% 50%;box-shadow:2px 2px inset;pointer-events:none;}}` +
          `${menu} details{overflow:hidden;interpolate-size:allow-keywords;}` +
          `${menu} details::details-content{block-size:0;@media (prefers-reduced-motion: no-preference){transition-behavior:allow-discrete;transition-property:block-size, content-visibility;transition-duration:0.2s;transition-timing-function:cubic-bezier(0, 0, 0.2, 1);}}` +
          `${menu} details[open]::details-content{block-size:auto;}` +
          `${menu} :where(li > details[open] > summary):after,${menu} :where(li > ${sel(".menu-dropdown-toggle")}${sel(".menu-dropdown-show")}):after{rotate:45deg;translate:0 1px;}` +
          `${menu} :where(li:not(${sel(".menu-title")}, ${sel(".disabled")}) > *:not(ul, menu, details, ${sel(".menu-title")}), li:not(${sel(".menu-title")}, ${sel(".disabled")}) > details > summary:not(${sel(".menu-title")})):not(${sel(".menu-active")}, :active, ${sel(".btn")}, [aria-current]:not([aria-current="false"], [aria-current=""])){&.menu-focus,&:focus-visible{background-color:color-mix(in oklab, var(--color-base-content) 10%, transparent);color:var(--color-base-content);cursor:pointer;outline-style:hidden;}}` +
          `${menu} :where(li:not(${sel(".menu-title")}, ${sel(".disabled")}) > *:not(ul, menu, details, ${sel(".menu-title")}):not(${sel(".menu-active")}, :active, ${sel(".btn")}, [aria-current]:not([aria-current="false"], [aria-current=""])):hover, li:not(${sel(".menu-title")}, ${sel(".disabled")}) > details > summary:not(${sel(".menu-title")}):not(${sel(".menu-active")}, :active, ${sel(".btn")}, [aria-current]:not([aria-current="false"], [aria-current=""]))){background-color:color-mix(in oklab, var(--color-base-content) 10%, transparent);cursor:pointer;outline-style:hidden;box-shadow:0 1px oklch(0% 0 0 / 0.01) inset, 0 -1px oklch(100% 0 0 / 0.01) inset;}` +
          `${menu} :where(li:empty){background-color:var(--color-base-content);opacity:0.1;margin:0.5rem 1rem;height:1px;}` +
          `${menu} :where(li){position:relative;display:flex;flex-shrink:0;flex-direction:column;flex-wrap:wrap;align-items:stretch;& ${sel(".badge")}{justify-self:end;}& > *:not(ul, menu, ${sel(".menu-title")}, details, ${sel(".btn")}):active,& > *:not(ul, menu, ${sel(".menu-title")}, details, ${sel(".btn")})${sel(".menu-active")},& > *:not(ul, menu, ${sel(".menu-title")}, details, ${sel(".btn")}):is([aria-current]:not([aria-current="false"], [aria-current=""])),& > details > summary:active{outline-style:hidden;color:var(--menu-active-fg);background-color:var(--menu-active-bg);background-size:auto, calc(var(--noise) * 100%);background-image:none, var(--fx-noise);&:not(&:active){box-shadow:0 2px calc(var(--depth) * 3px) -2px var(--menu-active-bg);}}&.menu-disabled, & [disabled]{color:color-mix(in oklab, var(--color-base-content) 20%, transparent);pointer-events:none;}}` +
          `${menu} ${sel(".dropdown")}:focus-within{${sel(".menu-dropdown-toggle")}:after{rotate:45deg;translate:0 1px;}}` +
          `${menu} ${sel(".dropdown-content")}{margin-top:0.5rem;padding:0.5rem;&:before{display:none;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Standalone .menu-active (group-hover use case), upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: outline-hidden->outline-style:hidden.
    rules.push([
      key("menu-active"),
      [
        `${sel(":where(:not(ul, menu, details, .menu-title, .btn)).menu-active")}{outline-style:hidden;color:var(--menu-active-fg);background-color:var(--menu-active-bg);background-size:auto, calc(var(--noise) * 100%);background-image:none, var(--fx-noise);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Orientations, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: inline-flex/flex-row/items-start, bg-base-100->background-color,
    // rounded-box->border-radius, absolute, ms-0->margin-inline-start:0, mt-4->1rem,
    // origin-top->transform-origin, py-2/pe-2->padding, opacity-0/100, flex-col/items-stretch,
    // relative/ms-4/mt-0/py-0/pe-0.
    rules.push([
      key("menu-horizontal"),
      [
        `${sel(".menu-horizontal")}{display:inline-flex;flex-direction:row;align-items:start;& > li:not(${sel(".menu-title")}) > details{& > :is(ul, menu){background-color:var(--color-base-100);border-radius:var(--radius-box);position:absolute;margin-inline-start:0;margin-top:1rem;transform-origin:top;padding-block:0.5rem;padding-inline-end:0.5rem;opacity:0;scale:95%;box-shadow:0 1px 3px 0 oklch(0% 0 0/0.1), 0 1px 2px -1px oklch(0% 0 0/0.1);@media (prefers-reduced-motion: no-preference){@starting-style{scale:95%;opacity:0;}animation:menu 0.2s;transition-property:opacity, scale, display;transition-behavior:allow-discrete;transition-duration:0.2s;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}}&[open] > :is(ul, menu){opacity:1;scale:100%;}}& > li > details > :is(ul, menu){&:before{--tw-content:none;content:var(--tw-content);}}}@keyframes menu{0%{opacity:0;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("menu-vertical"),
      [
        `${sel(".menu-vertical")}{display:inline-flex;flex-direction:column;align-items:stretch;& > li:not(${sel(".menu-title")}) > details > :is(ul, menu){position:relative;margin-inline-start:1rem;margin-top:0;padding-block:0;padding-inline-end:0;background-color:revert-layer;border-radius:revert-layer;animation:revert-layer;transition:revert-layer;box-shadow:revert-layer;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .menu-paged, upstream layer daisyui.l1.l2 -> daisy-l2. Mostly custom CSS, kept verbatim.
    // Expanded: hidden->display:none, justify-self-start.
    rules.push([
      key("menu-paged"),
      [
        `${sel(".menu-paged")}{--menu-paged-arrow:135deg;--menu-paged-back-arrow:-45deg;[dir="rtl"] &{--menu-paged-arrow:-45deg;--menu-paged-back-arrow:135deg;}& :where(li ul, li menu):before{--tw-content:none;content:var(--tw-content);}& details[open]>summary{font-size:0;&:not(:active){transition-duration:0s;}& > *{display:none;}&:before{--tw-content:"Back";content:var(--tw-content);font-size:0.875rem;}&[aria-label]:before{--tw-content:attr(aria-label);content:var(--tw-content);}}& details::details-content{transition:none;}&:has(> li > details[open]) > li:not(:has(> details[open])),& :where(:is(ul, menu):has(> li > details[open]) > li:not(:has(> details[open]))){display:none;}& :where(li:has(> details[open]), details[open], details[open] > :is(ul, menu)),& :where(details[open])::details-content{display:contents;}& :where(details[open]:has(> :is(ul, menu) > li > details[open]) > summary){display:none;}& :where(li > details > summary):after{rotate:var(--menu-paged-arrow);translate:0;transition:none;}& :where(li > details[open] > summary):after{order:-1;justify-self:start;rotate:var(--menu-paged-back-arrow);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: rounded-field->border-radius, px-*/py-*->padding-inline/block.
    const menuSizes: Array<[string, string, string, string, string]> = [
      ["menu-xs", "0.5rem", "0.25rem", "0.6875rem", "0.5rem 0.25rem"],
      ["menu-sm", "0.625rem", "0.25rem", "0.75rem", "0.75rem 0.5rem"],
      ["menu-md", "0.75rem", "0.375rem", "0.875rem", "0.75rem 0.5rem"],
      ["menu-lg", "1rem", "0.375rem", "1.125rem", "1.5rem 0.75rem"],
      ["menu-xl", "1.25rem", "0.375rem", "1.375rem", "1.5rem 0.75rem"],
    ];
    for (const [name, px, py, fs, titlePad] of menuSizes) {
      const s = sel(`.${name}`);
      const item = `:where(li:not(${sel(".menu-title")}) > *:not(ul, menu, details, ${sel(".menu-title")})),:where(li:not(${sel(".menu-title")}) > details > summary:not(${sel(".menu-title")}))`;
      const [tpx, tpy] = titlePad.split(" ");
      rules.push([
        key(name),
        [
          `${s} ${item}{border-radius:var(--radius-field);padding-inline:${px};padding-block:${py};font-size:${fs};}` +
            `${s} details[open]>summary:before{font-size:${fs};}` +
            `${s} ${sel(".menu-title")}{padding-inline:${tpx};padding-block:${tpy};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  return rules;
}
