import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — batch4 (11 components).
// Dynamic, sized and stateful classes live here as Uno rules.
// Two rule kinds:
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS
//     for a base class. They never match user code directly; the base shortcut
//     in src/shortcuts/batch4.ts references them by token so they emit together
//     with the base (Uno merges a shortcut into a single selector, so :has and
//     friends cannot live in the shortcut object itself).
//  2. Public rules: color/size/variant classes (otp-xs, progress-primary, ...)
//     and standalone state classes. Static rules carry flat declaration objects;
//     anything with nested selectors is a raw CSS string (static rule with a
//     string body emits it verbatim, preserving &, media queries and
//     starting-style blocks as modern CSS nesting).
// Upstream at-apply utilities are expanded to raw CSS inline. No at-apply remains.
// Selector strings go through applyPrefix(); keyframes names are left unprefixed.
// Layer intent per block in comments: daisyui.l1.l2.l3 -> `daisy-l3`,
// .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`, bare daisyui (outermost/lowest) -> `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch4Rules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── otp ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/otp.css
  if (shouldInclude("otp", opts.include, opts.exclude)) {
    const otp = sel(".otp");
    // Structural nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: pointer-events-none->pointer-events:none, start-0->inset-inline-start:0,
    // z-1->z-index:1, m-0->margin:0, appearance-none, border-0->border-width:0,
    // bg-transparent->background-color:transparent, p-0->padding:0, outline-0->outline-width:0,
    // bg-transparent(selection)->background-color:transparent,
    // caret-transparent->caret-color:transparent, flex->display:flex,
    // transition-colors->display:flex + border-color transition (explicit below wins),
    // shrink-0->flex-shrink:0.
    rules.push([
      "__daisy-otp-nested",
      [
        `@supports (font:-apple-system-body){${otp}{--otp-ch:0.618164em;}}` +
          `${otp} > input{pointer-events:none;inset-inline-start:0;z-index:1;margin:0;appearance:none;border-width:0;background-color:#0000;padding:0;outline-width:0;field-sizing:content;padding-inline-start:calc(var(--otp-ch) * 0.5 - 1px);text-indent:1px;line-height:1;letter-spacing:calc(var(--stride) - var(--otp-ch));font-variant-numeric:tabular-nums;&::selection{background-color:#0000;color:color-mix(in oklab, var(--color-base-content) 20%, #0000);}&:valid{caret-color:transparent;}}` +
          `${otp}:has(> span:nth-child(1)){width:calc(var(--stride) * 1);}` +
          `${otp}:has(> span:nth-child(2)){width:calc(var(--stride) * 2);}` +
          `${otp}:has(> span:nth-child(3)){width:calc(var(--stride) * 3);}` +
          `${otp}:has(> span:nth-child(4)){width:calc(var(--stride) * 4);}` +
          `${otp}:has(> span:nth-child(5)){width:calc(var(--stride) * 5);}` +
          `${otp}:has(> span:nth-child(6)){width:calc(var(--stride) * 6);}` +
          `${otp}:has(> span:nth-child(7)){width:calc(var(--stride) * 7);}` +
          `${otp}:has(> span:nth-child(8)){width:calc(var(--stride) * 8);}` +
          `${otp} > span{position:absolute;display:flex;transition:border-color 0.2s;inline-size:var(--otp-w);block-size:var(--otp-size);background-color:var(--color-base-100);border:var(--border) solid var(--input-color);border-radius:inherit;outline:2px solid #0000;outline-offset:1px;box-shadow:0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000) inset, 0 -1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset;&:nth-child(1){left:0;@supports (font:-apple-system-body){left:1px;}}&:nth-child(2){left:calc(var(--stride) * 1);transition-delay:0.02s;}&:nth-child(3){left:calc(var(--stride) * 2);transition-delay:0.04s;}&:nth-child(4){left:calc(var(--stride) * 3);transition-delay:0.06s;}&:nth-child(5){left:calc(var(--stride) * 4);transition-delay:0.08s;}&:nth-child(6){left:calc(var(--stride) * 5);transition-delay:0.1s;}&:nth-child(7){left:calc(var(--stride) * 6);transition-delay:0.12s;}&:nth-child(8){left:calc(var(--stride) * 7);transition-delay:0.14s;}}` +
          `${otp}:after{flex-shrink:0;content:"";width:var(--otp-w);height:var(--otp-size);border-radius:var(--radius-field);outline:2px solid #0000;outline-offset:1px;z-index:10;margin-inline-start:calc(-1 * (var(--otp-gap) + var(--otp-ch) * 0.5));}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Interactive states, upstream layer daisyui.l1.l2.l3 -> daisy-l1 per
    // states-beat-base (outer wins). Focus/disabled must outrank color modifiers.
    // Expanded: cursor-not-allowed->cursor:not-allowed,
    // text-base-content/40->color-mix 40%, border-base-200->border-color,
    // bg-base-200->background-color.
    rules.push([
      "__daisy-otp-state",
      [
        `${otp}:has(input:valid:focus) > span{outline:2px solid var(--input-color);outline-offset:1px;}` +
          `${otp}:has(input:valid:focus):after{opacity:0;}` +
          `${otp}:focus-within{--input-color:var(--color-base-content);& > span{box-shadow:0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000);}&:after{outline-color:var(--input-color);}}` +
          `${otp}:has(> input:disabled){cursor:not-allowed;& > input{color:color-mix(in oklab, var(--color-base-content) 40%, transparent);}& > span{border-color:var(--color-base-200);background-color:var(--color-base-200);box-shadow:none;}}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
    // .otp-joined, upstream bare block (no layer) -> daisy-l2 modifier.
    // Expanded: rounded-e-none->border-start/end-end-radius:0,
    // border-e-0->border-inline-end-width:0, rounded-none->border-radius:0,
    // rounded-s-none->border-start/end-start-radius:0.
    rules.push([
      key("otp-joined"),
      [
        `${sel(".otp-joined")}{--otp-gap:0rem;clip-path:inset(-3.5px 0 -3.5px -3.5px);& > span{&:first-of-type{border-start-end-radius:0;border-end-end-radius:0;}&:not(&:last-of-type){border-inline-end-width:0;}&:not(&:first-of-type,&:last-of-type){border-radius:0;}&:last-of-type{border-start-start-radius:0;border-end-start-radius:0;}}&:after{outline-offset:calc((-1 * var(--border)) - 3px);@supports (font:-apple-system-body){--otp-w:calc(var(--otp-ch) * 2 - 1px);}}&:has(input:valid:focus) > span{outline-offset:calc((-1 * var(--border)) - 3px);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
    const otpSizes: Array<[string, string, string]> = [
      ["otp-xs", "1.25rem", "6"],
      ["otp-sm", "1.5rem", "8"],
      ["otp-md", "1.75rem", "10"],
      ["otp-lg", "2rem", "12"],
      ["otp-xl", "2.5rem", "14"],
    ];
    for (const [name, fs, mul] of otpSizes) {
      rules.push([
        key(name),
        [
          {
            "font-size": fs,
            "--otp-size": `calc(var(--size-field, 0.25rem) * ${mul})`,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2. Compound
    // (& + :focus) selectors kept so the color wins over base :focus-within.
    const otpColors: Array<[string, string]> = [
      ["otp-neutral", "var(--color-neutral)"],
      ["otp-primary", "var(--color-primary)"],
      ["otp-secondary", "var(--color-secondary)"],
      ["otp-accent", "var(--color-accent)"],
      ["otp-info", "var(--color-info)"],
      ["otp-success", "var(--color-success)"],
      ["otp-warning", "var(--color-warning)"],
      ["otp-error", "var(--color-error)"],
    ];
    for (const [name, color] of otpColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [`${s},${s}:focus,${s}:focus-within{--input-color:${color};}`],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── progress ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/progress.css
  if (shouldInclude("progress", opts.include, opts.exclude)) {
    const progress = sel(".progress");
    // Indeterminate + engine pseudos, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: bg-transparent->background-color:transparent,
    // rounded-box->border-radius:var(--radius-box), bg-current->background-color:currentColor.
    rules.push([
      "__daisy-progress-nested",
      [
        `${progress}:indeterminate{background-image:repeating-linear-gradient(90deg, currentColor -1%, currentColor 10%, #0000 10%, #0000 90%);background-size:200%;background-position-x:15%;@media (prefers-reduced-motion:no-preference){animation:progress 5s ease-in-out infinite;}@supports (-moz-appearance:none){&::-moz-progress-bar{background-color:#0000;@media (prefers-reduced-motion:no-preference){animation:progress 5s ease-in-out infinite;background-image:repeating-linear-gradient(90deg, currentColor -1%, currentColor 10%, #0000 10%, #0000 90%);background-size:200%;background-position-x:15%;}}}}` +
          `@supports (-moz-appearance:none){${progress}::-moz-progress-bar{border-radius:var(--radius-box);background-color:currentColor;@media (prefers-reduced-motion:no-preference){transition:inline-size 0.3s ease;}}}` +
          `@supports (-webkit-appearance:none){${progress}::-webkit-progress-bar{border-radius:var(--radius-box);background-color:#0000;}${progress}::-webkit-progress-value{border-radius:var(--radius-box);background-color:currentColor;@media (prefers-reduced-motion:no-preference){transition:inline-size 0.3s ease;}}}` +
          `@keyframes progress{50%{background-position-x:-115%;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: text-X->color:var(--color-X).
    const progressColors: Array<[string, string]> = [
      ["progress-primary", "var(--color-primary)"],
      ["progress-secondary", "var(--color-secondary)"],
      ["progress-accent", "var(--color-accent)"],
      ["progress-neutral", "var(--color-neutral)"],
      ["progress-info", "var(--color-info)"],
      ["progress-success", "var(--color-success)"],
      ["progress-warning", "var(--color-warning)"],
      ["progress-error", "var(--color-error)"],
    ];
    for (const [name, color] of progressColors) {
      rules.push([key(name), [{ color }], { layer: "daisy-l2" }]);
    }
  }

  // ─── radialprogress ───────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/radialprogress.css
  if (shouldInclude("radialprogress", opts.include, opts.exclude)) {
    const radial = sel(".radial-progress");
    // Ring + needle, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: absolute->position:absolute, inset-0->inset:0,
    // rounded-full->border-radius:calc(infinity * 1px) (compiled emits
    // 3.40282e38px — Tailwind v4's infinity normalization; computed-identical),
    // bg-current->background-color:currentColor.
    rules.push([
      "__daisy-radial-nested",
      [
        `${radial}:before{position:absolute;inset:0;border-radius:calc(infinity * 1px);content:"";background:radial-gradient(farthest-side, currentColor 98%, #0000) top/var(--thickness) var(--thickness) no-repeat, conic-gradient(currentColor var(--radialprogress), #0000 0);-webkit-mask:radial-gradient(farthest-side, #0000 calc(100% - var(--thickness)), #000 calc(100% + 0.5px - var(--thickness)));mask:radial-gradient(farthest-side, #0000 calc(100% - var(--thickness)), #000 calc(100% + 0.5px - var(--thickness)));}` +
          `${radial}:after{position:absolute;border-radius:calc(infinity * 1px);background-color:currentColor;transition:transform 0.3s linear;content:"";inset:calc(50% - var(--thickness) / 2);transform:rotate(calc(var(--value) * 3.6deg - 90deg)) translate(calc(var(--size) / 2 - 50%));}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── radio ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/radio.css
  if (shouldInclude("radio", opts.include, opts.exclude)) {
    const radio = sel(".radio");
    // Dot, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: block->display:block, size-full->width/height:100%,
    // rounded-full->border-radius:calc(infinity * 1px) (compiled 3.40282e38px;
    // computed-identical, see radial above).
    rules.push([
      "__daisy-radio-nested",
      [
        `${radio}:before{display:block;width:100%;height:100%;border-radius:calc(infinity * 1px);--tw-content:"";content:var(--tw-content);background-size:auto, calc(var(--noise) * 100%);background-image:none, var(--fx-noise);}` +
          `@keyframes radio{0%{padding:5px;}50%{padding:3px;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Focus/checked/disabled states -> daisy-l1 (states beat modifiers).
    // Expanded: bg-base-100->background-color, border-current->border-color,
    // bg-current->background-color, outline 1px + -outline-offset-1->outline-width/offset,
    // cursor-not-allowed->cursor, opacity-20->opacity:0.2.
    rules.push([
      "__daisy-radio-state",
      [
        `${radio}:focus-visible{outline:2px solid currentColor;}` +
          `${radio}:checked,${radio}[aria-checked="true"]{background-color:var(--color-base-100);border-color:currentColor;@media (prefers-reduced-motion:no-preference){animation:radio 0.2s ease-out;}&:before{background-color:currentColor;box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px oklch(0% 0 0 / calc(var(--depth) * 0.1));}@media (forced-colors:active){&:before{outline-style:solid;outline-width:1px;outline-offset:-1px;}}@media print{&:before{outline:0.25rem solid;outline-offset:-1rem;}}}` +
          `${radio}:disabled{cursor:not-allowed;opacity:0.2;}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2. Follow input pattern.
    const radioColors: Array<[string, string]> = [
      ["radio-neutral", "var(--color-neutral)"],
      ["radio-primary", "var(--color-primary)"],
      ["radio-secondary", "var(--color-secondary)"],
      ["radio-accent", "var(--color-accent)"],
      ["radio-info", "var(--color-info)"],
      ["radio-success", "var(--color-success)"],
      ["radio-warning", "var(--color-warning)"],
      ["radio-error", "var(--color-error)"],
    ];
    for (const [name, color] of radioColors) {
      rules.push([
        key(name),
        [{ "--input-color": color }],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const radioSizes: Array<[string, string, string]> = [
      ["radio-xs", "0.125rem", "4"],
      ["radio-sm", "0.1875rem", "5"],
      ["radio-md", "0.25rem", "6"],
      ["radio-lg", "0.3125rem", "7"],
      ["radio-xl", "0.375rem", "8"],
    ];
    for (const [name, pad, mul] of radioSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{padding:${pad};&:is([type="radio"]){--size:calc(var(--size-selector, 0.25rem) * ${mul});}}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── range ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/range.css
  if (shouldInclude("range", opts.include, opts.exclude)) {
    const range = sel(".range");
    // Track/thumb/rtl/focus, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: w-full->width:100%, relative->position:relative,
    // box-border->box-sizing:border-box.
    rules.push([
      "__daisy-range-nested",
      [
        `${sel('[dir="rtl"]')} ${range}{--range-dir:-1;}` +
          `${range}:focus{outline:none;}` +
          `${range}:focus-visible{outline:2px solid;outline-offset:2px;}` +
          `${range}::-webkit-slider-runnable-track{width:100%;background-color:var(--range-bg);border-radius:var(--radius-selector);height:calc(var(--range-thumb-size) * 0.5);}` +
          `@media (forced-colors:active){${range}::-webkit-slider-runnable-track{border:1px solid;}}` +
          `${range}::-webkit-slider-thumb{position:relative;box-sizing:border-box;border-radius:calc(var(--radius-selector) + min(var(--range-p), var(--radius-selector-max)));background-color:var(--range-thumb);height:var(--range-thumb-size);width:var(--range-thumb-size);border:var(--range-p) solid;appearance:none;-webkit-appearance:none;inset-block-start:50%;color:var(--range-progress);transform:translateY(-50%);box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000), 0 0 0 2rem var(--range-thumb) inset, var(--range-fill-x) var(--range-fill-y) 0 var(--range-fill-spread);}` +
          `${range}::-moz-range-track{width:100%;background-color:var(--range-bg);border-radius:var(--radius-selector);height:calc(var(--range-thumb-size) * 0.5);}` +
          `@media (forced-colors:active){${range}::-moz-range-track{border:1px solid;}}` +
          `${range}::-moz-range-thumb{position:relative;box-sizing:border-box;border-radius:calc(var(--radius-selector) + min(var(--range-p), var(--radius-selector-max)));background-color:currentColor;height:var(--range-thumb-size);width:var(--range-thumb-size);border:var(--range-p) solid;color:var(--range-progress);box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000), 0 0 0 2rem var(--range-thumb) inset, var(--range-fill-x) var(--range-fill-y) 0 var(--range-fill-spread);}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Disabled state -> daisy-l1. Expanded: cursor-not-allowed, opacity-30.
    rules.push([
      "__daisy-range-state",
      [`${range}:disabled{cursor:not-allowed;opacity:0.3;}`],
      { layer: "daisy-l1", internal: true },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: text-X->color:var(--color-X).
    const rangeColors: Array<[string, string, string]> = [
      ["range-primary", "var(--color-primary)", "var(--color-primary-content)"],
      [
        "range-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      ["range-accent", "var(--color-accent)", "var(--color-accent-content)"],
      ["range-neutral", "var(--color-neutral)", "var(--color-neutral-content)"],
      ["range-success", "var(--color-success)", "var(--color-success-content)"],
      ["range-warning", "var(--color-warning)", "var(--color-warning-content)"],
      ["range-info", "var(--color-info)", "var(--color-info-content)"],
      ["range-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, color, thumb] of rangeColors) {
      rules.push([
        key(name),
        [{ color, "--range-thumb": thumb }],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const rangeSizes: Array<[string, string]> = [
      ["range-xs", "4"],
      ["range-sm", "5"],
      ["range-md", "6"],
      ["range-lg", "7"],
      ["range-xl", "8"],
    ];
    for (const [name, mul] of rangeSizes) {
      rules.push([
        key(name),
        [
          {
            "--range-thumb-size": `calc(var(--size-selector, 0.25rem) * ${mul})`,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Vertical, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: h-full->height:100%.
    rules.push([
      key("range-vertical"),
      [
        `${sel(".range-vertical")}{writing-mode:vertical-lr;direction:rtl;width:var(--range-thumb-size);height:clamp(3rem, 20rem, 100%);--range-fill-x:0;--range-fill-y:calc(100cqh + var(--range-thumb-size) / 2);--range-fill-spread:calc(100cqh * var(--range-fill));&::-webkit-slider-runnable-track{height:100%;width:calc(var(--range-thumb-size) * 0.5);}&::-webkit-slider-thumb{transform:translateX(-50%);}&::-moz-range-track{height:100%;width:calc(var(--range-thumb-size) * 0.5);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── rating ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/rating.css
  if (shouldInclude("rating", opts.include, opts.exclude)) {
    const rating = sel(".rating");
    // Stars + states, upstream layer daisyui.l1.l2.l3 -> daisy-l3 for structure,
    // with :checked/:focus/:active kept here (opacity/scale only, no color vars
    // to clash with modifiers). Expanded: cursor-pointer, appearance-none,
    // bg-base-content->background-color, rounded-none->border-radius:0,
    // opacity-20->opacity:0.2, w-2->width:0.5rem, bg-transparent, opacity-100.
    rules.push([
      "__daisy-rating-nested",
      [
        `${rating} input{cursor:pointer;appearance:none;}` +
          `${rating} *{background-color:var(--color-base-content);opacity:0.2;width:calc(var(--size) * 1);height:calc(var(--size));border-radius:0;@media (prefers-reduced-motion:no-preference){animation:rating 0.25s ease-out;}}` +
          `${rating} ${sel(".rating-hidden")}{background-color:#0000;width:0.5rem;}` +
          `${rating} :checked,${rating} [aria-checked="true"],${rating} [aria-current="true"],${rating} :has(~ :checked, ~ [aria-checked="true"], ~ [aria-current="true"]){opacity:1;}` +
          `${rating} :focus-visible{scale:1.1;@media (prefers-reduced-motion:no-preference){transition:scale 0.2s ease-out;}}` +
          `${rating} :active:focus{animation:none;scale:1.1;}` +
          `@keyframes rating{0%,40%{scale:1.1;filter:brightness(1.05) contrast(1.05);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Half, upstream layer daisyui.l1.l2 -> daisy-l2. Mask classes live in
    // mask.css and are not duplicated here; half only narrows the star box.
    rules.push([
      key("rating-half"),
      [`${sel(".rating-half")} *{width:calc(var(--size) * 0.5);}`],
      { layer: "daisy-l2" },
    ]);
    // Hidden star as public rule (flat) so solo `rating-hidden` generates CSS.
    rules.push([
      key("rating-hidden"),
      [{ "background-color": "transparent", width: "0.5rem" }],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Note: no calc upstream.
    const ratingSizes: Array<[string, string]> = [
      ["rating-xs", "4"],
      ["rating-sm", "5"],
      ["rating-md", "6"],
      ["rating-lg", "7"],
      ["rating-xl", "8"],
    ];
    for (const [name, mul] of ratingSizes) {
      rules.push([
        key(name),
        [{ "--size": `var(--size-selector, 0.25rem) * ${mul}` }],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── select ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/select.css
  if (shouldInclude("select", opts.include, opts.exclude)) {
    const select = sel(".select");
    // Children, focus/open, picker and options, upstream l1.l2.l3 -> daisy-l3.
    // Expanded: h-auto->height:auto, overflow-auto->overflow:auto, py-3->padding-block:0.75rem,
    // pe-3->padding-inline-end:0.75rem, -ms-3->margin-inline-start:-0.75rem,
    // -me-7->margin-inline-end:-1.75rem, w-[calc]->width, appearance-none,
    // ps-3/pe-7 paddings, text-base-content->color, opacity-50->opacity:0.5,
    // outline-hidden->outline-style:hidden, -me-5.5->margin-inline-end:-1.375rem,
    // rounded-box->border-radius, my-2->margin-block:0.5rem, p-2->padding:0.5rem,
    // hidden->display:none, w-full->width:100%, overflow-hidden, text-ellipsis,
    // whitespace-nowrap, pt-[0.5em], mt-[0.5em], rounded-field, py-1.5->padding-block:0.375rem,
    // bg-base-content/10->color-mix 10%, cursor-pointer, bg-neutral/text-neutral-content.
    rules.push([
      "__daisy-select-nested",
      [
        `${sel('[dir="rtl"]')} ${select}{background-position:calc(0% + 12px) calc(1px + 50%), calc(0% + 16px) calc(1px + 50%);}` +
          `${select}[multiple]{height:auto;overflow:auto;padding-block:0.75rem;padding-inline-end:0.75rem;background-image:none;}` +
          `${select} select{appearance:none;width:calc(100% + 2.75rem);height:calc(100% - calc(var(--border) * 2));background:inherit;border-radius:inherit;border-style:none;align-items:center;margin-inline:-0.75rem -1.75rem;padding-inline:0.75rem 1.75rem;&::placeholder{color:var(--color-base-content);opacity:0.5;}&:focus,&:focus-within{outline-style:hidden;}@media (forced-colors:active){&:focus,&:focus-within{outline-offset:2px;outline:2px solid #0000;}}&:not(:last-child){background-image:none;margin-inline-end:-1.375rem;}}` +
          `${select}:focus,${select}:focus-within,${select}:open{--input-color:var(--color-base-content);box-shadow:0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000);outline:2px solid var(--input-color);outline-offset:2px;}` +
          `${select}:open{background-image:linear-gradient(135deg, #0000 50%, currentColor 50%), linear-gradient(45deg, currentColor 50%, #0000 50%);}` +
          `@supports (appearance:base-select){${select},${select} select,${select}::picker(select),${select} select::picker(select){appearance:base-select;}}` +
          `${select}::picker(select),${select} select::picker(select){color:inherit;max-height:min(24rem, 70dvh);margin-inline:0.5rem;translate:-0.5rem 0;border:var(--border) solid var(--color-base-200);border-radius:var(--radius-box);margin-block:0.5rem;padding:0.5rem;background-color:inherit;box-shadow:0 20px 25px -5px rgb(0 0 0 / calc(var(--depth) * 0.1)), 0 8px 10px -6px rgb(0 0 0 / calc(var(--depth) * 0.1));}` +
          `${select}::picker-icon,${select} select::picker-icon{display:none;}` +
          `${select} selectedcontent,${select} select selectedcontent{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}` +
          `${select} optgroup,${select} select optgroup{padding-top:0.5em;& option:nth-child(1){margin-top:0.5em;}}` +
          `${select} option,${select} select option{border-radius:var(--radius-field);padding-block:0.375rem;padding-inline:calc(var(--spacing) * var(--option-px, 3));transition-property:color, background-color;transition-duration:0.2s;transition-timing-function:cubic-bezier(0, 0, 0.2, 1);white-space:normal;&:not(:disabled){&:hover,&:focus-visible{background-color:color-mix(in oklab, var(--color-base-content) 10%, transparent);cursor:pointer;outline-style:hidden;}&:active{background-color:var(--color-neutral);color:var(--color-neutral-content);box-shadow:0 2px calc(var(--depth) * 3px) -2px var(--color-neutral);}}}` +
          `${sel('[dir="rtl"]')} ${select}::picker(select),${sel('[dir="rtl"]')} ${select} select::picker(select){translate:0.5rem 0;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Disabled, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: border-base-200->border-color, bg-base-200->background-color,
    // cursor-not-allowed, text-base-content/40->color-mix 40%,
    // text-base-content opacity-20.
    rules.push([
      "__daisy-select-disabled",
      [
        `${select}:has(> select[disabled]),${select}:is(:disabled, [disabled]),fieldset:disabled ${select}{border-color:var(--color-base-200);background-color:var(--color-base-200);cursor:not-allowed;box-shadow:none;&:is(select),& :is(select){color:color-mix(in oklab, var(--color-base-content) 40%, transparent);}&::placeholder,& ::placeholder{color:var(--color-base-content);opacity:0.2;}}` +
          `${select}:has(> select[disabled]) > select[disabled]{cursor:not-allowed;}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // Ghost, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-transparent->background-color:transparent,
    // bg-base-100/text-base-content for focus.
    rules.push([
      key("select-ghost"),
      [
        `${sel(".select-ghost")}{background-color:transparent;transition:background-color 0.2s;box-shadow:none;border-color:#0000;&:focus,&:focus-within,&:open{background-color:var(--color-base-100);color:var(--color-base-content);border-color:#0000;box-shadow:none;}&::picker(select){background-color:var(--color-base-100);color:var(--color-base-content);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2. Compound selectors.
    const selectColors: Array<[string, string]> = [
      ["select-neutral", "var(--color-neutral)"],
      ["select-primary", "var(--color-primary)"],
      ["select-secondary", "var(--color-secondary)"],
      ["select-accent", "var(--color-accent)"],
      ["select-info", "var(--color-info)"],
      ["select-success", "var(--color-success)"],
      ["select-warning", "var(--color-warning)"],
      ["select-error", "var(--color-error)"],
    ];
    for (const [name, color] of selectColors) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s},${s}:focus,${s}:focus-within,${s}:open{--input-color:${color};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2 with floating-label hooks.
    const selectSizes: Array<[string, string, string, string, string, string]> =
      [
        ["select-xs", "6", "0.6875rem", "2", "3", "0.6875rem"],
        ["select-sm", "8", "0.75rem", "2.5", "4", "0.75rem"],
        ["select-md", "10", "0.875rem", "3", "5", "0.875rem"],
        ["select-lg", "12", "1.125rem", "4", "6", "1.125rem"],
        ["select-xl", "14", "1.375rem", "5", "7", "1.375rem"],
      ];
    for (const [name, mul, fs, px, top, flfs] of selectSizes) {
      const s = sel(`.${name}`);
      rules.push([
        key(name),
        [
          `${s}{--sl-size-mul:${mul};--font-size-min:${fs};--option-px:${px};}${sel(".floating-label")}:has(${s}){--top-mul:${top};--font-size:${flfs};}`,
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── skeleton ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/skeleton.css
  if (shouldInclude("skeleton", opts.include, opts.exclude)) {
    const skeleton = sel(".skeleton");
    // Motion handling, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: motion-reduce:[transition-duration:15s]->reduce media rule.
    rules.push([
      "__daisy-skeleton-nested",
      [
        `@media (prefers-reduced-motion:reduce){${skeleton}{transition-duration:15s;}}` +
          `@media (prefers-reduced-motion:no-preference){${skeleton}{animation:skeleton 1.8s ease-in-out infinite;}${skeleton}:dir(rtl){animation-direction:reverse;}}` +
          `@keyframes skeleton{0%{background-position:150%;}100%{background-position:-50%;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Text shimmer, upstream layer daisyui.l1.l2 -> daisy-l2. Fully flat.
    rules.push([
      key("skeleton-text"),
      [
        {
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
          "background-image":
            "linear-gradient(105deg, color-mix(in oklab, var(--color-base-content) 20%, transparent) 0% 40%, var(--color-base-content) 50%, color-mix(in oklab, var(--color-base-content) 20%, transparent) 60% 100%)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── stack ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/stack.css
  if (shouldInclude("stack", opts.include, opts.exclude)) {
    const stack = sel(".stack");
    // Children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: h-full->height:100%, w-full->width:100%,
    // w-full opacity-70->width + opacity:0.7, z-2->z-index:2,
    // opacity-90->opacity:0.9, z-3->z-index:3.
    rules.push([
      "__daisy-stack-children",
      [
        `${stack} > *{width:100%;height:100%;&:nth-child(n + 2){width:100%;opacity:0.7;}&:nth-child(2){z-index:2;opacity:0.9;}&:nth-child(1){z-index:3;width:100%;}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Default bottom positions, upstream layer daisyui.l1.l2
    // (`&, &.stack-bottom`) -> daisy-l2.
    rules.push([
      "__daisy-stack-pos",
      [
        `${stack} > *,${stack}${sel(".stack-bottom")} > *{grid-column:3 / 4;grid-row:3 / 6;&:nth-child(2){grid-column:2 / 5;grid-row:2 / 5;}&:nth-child(1){grid-column:1 / 6;grid-row:1 / 4;}}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // Explicit positions, upstream layer daisyui.l1.l2 -> daisy-l2.
    rules.push([
      key("stack-bottom"),
      [
        `${stack}${sel(".stack-bottom")} > *{grid-column:3 / 4;grid-row:3 / 6;&:nth-child(2){grid-column:2 / 5;grid-row:2 / 5;}&:nth-child(1){grid-column:1 / 6;grid-row:1 / 4;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("stack-top"),
      [
        `${stack}${sel(".stack-top")} > *{grid-column:3 / 4;grid-row:1 / 4;&:nth-child(2){grid-column:2 / 5;grid-row:2 / 5;}&:nth-child(1){grid-column:1 / 6;grid-row:3 / 6;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("stack-start"),
      [
        `${stack}${sel(".stack-start")} > *{grid-column:1 / 4;grid-row:3 / 4;&:nth-child(2){grid-column:2 / 5;grid-row:2 / 5;}&:nth-child(1){grid-column:3 / 6;grid-row:1 / 6;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("stack-end"),
      [
        `${stack}${sel(".stack-end")} > *{grid-column:3 / 6;grid-row:3 / 4;&:nth-child(2){grid-column:2 / 5;grid-row:2 / 5;}&:nth-child(1){grid-column:1 / 4;grid-row:1 / 6;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── stat ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/stat.css
  if (shouldInclude("stat", opts.include, opts.exclude)) {
    const stat = sel(".stat");
    // Divider, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      "__daisy-stat-nested",
      [
        `${stat}:not(:last-child){border-inline-end:var(--border) dashed color-mix(in oklab, currentColor 10%, #0000);border-block-end:none;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Orientations, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: grid-flow-col->grid-auto-flow:column, overflow-x-auto,
    // grid-flow-row->grid-auto-flow:row, overflow-y-auto->overflow-y:auto.
    rules.push([
      key("stats-horizontal"),
      [
        `${sel(".stats-horizontal")}{grid-auto-flow:column;overflow-x:auto;& ${stat}:not(:last-child){border-inline-end:var(--border) dashed color-mix(in oklab, currentColor 10%, #0000);border-block-end:none;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("stats-vertical"),
      [
        `${sel(".stats-vertical")}{grid-auto-flow:row;overflow-y:auto;& ${stat}:not(:last-child){border-inline-end:none;border-block-end:var(--border) dashed color-mix(in oklab, currentColor 10%, #0000);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── status ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/status.css
  // No animation keyframes upstream in v5.7.43; the dot is a static gradient +
  // depth shadow. (Deviation noted in batch report.)
  if (shouldInclude("status", opts.include, opts.exclude)) {
    // Colors, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-X->background-color:var(--color-X), text-X->color.
    const statusColors: Array<[string, string]> = [
      ["status-primary", "var(--color-primary)"],
      ["status-secondary", "var(--color-secondary)"],
      ["status-accent", "var(--color-accent)"],
      ["status-neutral", "var(--color-neutral)"],
      ["status-info", "var(--color-info)"],
      ["status-success", "var(--color-success)"],
      ["status-warning", "var(--color-warning)"],
      ["status-error", "var(--color-error)"],
    ];
    for (const [name, color] of statusColors) {
      rules.push([
        key(name),
        [{ "background-color": color, color }],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2.
    const statusSizes: Array<[string, string]> = [
      ["status-xs", "0.5"],
      ["status-sm", "1"],
      ["status-md", "2"],
      ["status-lg", "3"],
      ["status-xl", "4"],
    ];
    for (const [name, mul] of statusSizes) {
      rules.push([
        key(name),
        [{ "--size": `calc(var(--size-selector, 0.25rem) * ${mul})` }],
        { layer: "daisy-l2" },
      ]);
    }
  }

  return rules;
}
