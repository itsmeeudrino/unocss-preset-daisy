import type { Preset, StaticShortcut } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — batch4 (11 components:
// otp, progress, radialprogress, radio, range, rating, select, skeleton,
// stack, stat, status).
// Static, flat, single-selector base classes live here as Uno shortcuts.
// Rule: upstream at-apply utilities are expanded to raw CSS declarations inline
// (verified byte-for-byte against /tmp/daisy-ref.css compiled output).
// No at-apply directives remain.
// Nested selectors (:has/:focus/:disabled states, child selectors, pseudo
// elements, media queries) cannot be expressed as shortcut objects (Uno merges
// a shortcut into one selector), so they live as companion internal rules in
// src/rules/batch4.ts and are referenced by token from the base shortcuts.
// Layer intent is preserved via RuleMeta `layer` + per-block comments:
// upstream daisyui.l1.l2.l3 -> uno `daisy-l3`, .l1.l2 -> `daisy-l2`,
// .l1 -> `daisy-l1`, bare daisyui (outermost/lowest) -> `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch4Shortcuts(opts: Ctx): Exclude<Preset["shortcuts"], undefined> {
  const out: StaticShortcut[] = [];
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── otp ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/otp.css
  if (shouldInclude("otp", opts.include, opts.exclude)) {
    // .otp base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // >input, :has widths, >span positions, :after, :focus-within and disabled
    // nests -> __daisy-otp-nested / __daisy-otp-state.
    // Expanded: relative->position:relative, inline-flex->display:inline-flex.
    out.push([
      key("otp"),
      [
        {
          position: "relative",
          display: "inline-flex",
          "font-family":
            'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
          direction: "ltr",
          "clip-path": "inset(-3.5px 3.5px -3.5px -3.5px)",
          "border-radius": "var(--radius-field)",
          "font-size": "1.75rem",
          gap: "var(--otp-gap)",
          "--input-color": "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
          "--otp-ch": "1ch",
          "--otp-gap": "calc(var(--otp-ch) * 0.5)",
          "--otp-w": "calc(var(--otp-ch) * 2)",
          "--otp-size": "calc(var(--size-field, 0.25rem) * 10)",
          "--stride": "calc(var(--otp-w) + var(--otp-gap))",
        },
        "__daisy-otp-nested",
        "__daisy-otp-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── progress ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/progress.css
  if (shouldInclude("progress", opts.include, opts.exclude)) {
    // .progress base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :indeterminate, ::-moz-progress-bar and ::-webkit-* pseudos ->
    // __daisy-progress-nested.
    // Expanded: rounded-box->border-radius:var(--radius-box),
    // text-base-content->color, relative->position, h-2->height:0.5rem,
    // w-full->width:100%, appearance-none->appearance:none,
    // overflow-hidden->overflow:hidden, bg-current/20->background-color:color-mix 20%.
    out.push([
      key("progress"),
      [
        {
          appearance: "none",
          "border-radius": "var(--radius-box)",
          "background-color": "color-mix(in oklab, currentColor 20%, transparent)",
          width: "100%",
          height: "0.5rem",
          color: "var(--color-base-content)",
          position: "relative",
          overflow: "hidden",
        },
        "__daisy-progress-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── radialprogress ───────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/radialprogress.css
  if (shouldInclude("radialprogress", opts.include, opts.exclude)) {
    // .radial-progress base, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Flat part only; :before/:after rings -> __daisy-radial-nested.
    // Expanded: relative->position:relative, inline-grid->display:inline-grid,
    // h-[var(--size)]->height:var(--size), w-[var(--size)]->width:var(--size),
    // place-content-center->place-content:center, rounded-full->border-radius,
    // bg-transparent->background-color:transparent, shrink-0->flex-shrink:0.
    out.push([
      key("radial-progress"),
      [
        {
          position: "relative",
          display: "inline-grid",
          height: "var(--size)",
          width: "var(--size)",
          "place-content": "center",
          "border-radius": "calc(infinity * 1px)",
          "background-color": "transparent",
          "flex-shrink": "0",
          "vertical-align": "middle",
          "box-sizing": "content-box",
          "--value": "0",
          "--size": "5rem",
          "--thickness": "calc(var(--size) / 10)",
          "--radialprogress": "calc(var(--value) * 1%)",
          transition: "--radialprogress 0.3s linear",
        },
        "__daisy-radial-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── radio ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/radio.css
  if (shouldInclude("radio", opts.include, opts.exclude)) {
    // .radio base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :before dot, :focus-visible, :checked and :disabled ->
    // __daisy-radio-nested / __daisy-radio-state.
    // Expanded: relative->position, inline-block->display, shrink-0->flex-shrink:0,
    // cursor-pointer->cursor, appearance-none, rounded-full->border-radius,
    // p-1->padding:0.25rem, align-middle->vertical-align:middle.
    out.push([
      key("radio"),
      [
        {
          position: "relative",
          display: "inline-block",
          "flex-shrink": "0",
          cursor: "pointer",
          appearance: "none",
          "border-radius": "calc(infinity * 1px)",
          padding: "0.25rem",
          "vertical-align": "middle",
          border: "var(--border) solid var(--input-color, color-mix(in srgb, currentColor 20%, #0000))",
          "box-shadow": "0 1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset",
          "--size": "calc(var(--size-selector, 0.25rem) * 6)",
          width: "var(--size)",
          height: "var(--size)",
          color: "var(--input-color, currentColor)",
        },
        "__daisy-radio-nested",
        "__daisy-radio-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── range ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/range.css
  if (shouldInclude("range", opts.include, opts.exclude)) {
    // .range base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // track/thumb pseudos, rtl and focus -> __daisy-range-nested;
    // :disabled -> __daisy-range-state.
    // Expanded: cursor-pointer->cursor, overflow-hidden, bg-transparent,
    // align-middle->vertical-align:middle.
    out.push([
      key("range"),
      [
        {
          appearance: "none",
          "-webkit-appearance": "none",
          "--range-thumb": "var(--color-base-100)",
          "--range-thumb-size": "calc(var(--size-selector, 0.25rem) * 6)",
          "--range-progress": "currentColor",
          "--range-fill": "1",
          "--range-p": "0.25rem",
          "--range-bg": "color-mix(in oklab, currentColor 10%, #0000)",
          "--range-fill-x":
            "calc((var(--range-dir, 1) * -100cqw) - (var(--range-dir, 1) * var(--range-thumb-size) / 2))",
          "--range-fill-y": "0",
          "--range-fill-spread": "calc(100cqw * var(--range-fill))",
          cursor: "pointer",
          overflow: "hidden",
          "background-color": "transparent",
          "vertical-align": "middle",
          width: "clamp(3rem, 20rem, 100%)",
          "--radius-selector-max":
            "calc(var(--radius-selector) + var(--radius-selector) + var(--radius-selector))",
          "border-radius":
            "calc(var(--radius-selector) + min(var(--range-p), var(--radius-selector-max)))",
          border: "none",
          height: "var(--range-thumb-size)",
        },
        "__daisy-range-nested",
        "__daisy-range-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── rating ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/rating.css
  if (shouldInclude("rating", opts.include, opts.exclude)) {
    // .rating base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // input/*/.rating-hidden/:checked/:focus nests -> __daisy-rating-nested.
    // Expanded: relative->position:relative, inline-flex->display:inline-flex,
    // align-middle->vertical-align:middle. Note --size has no calc upstream.
    out.push([
      key("rating"),
      [
        {
          position: "relative",
          display: "inline-flex",
          "vertical-align": "middle",
          "--size": "var(--size-selector, 0.25rem) * 6",
        },
        "__daisy-rating-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── select ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/select.css
  if (shouldInclude("select", opts.include, opts.exclude)) {
    // .select base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // multiple/select children, :focus/:open, picker/option nests ->
    // __daisy-select-nested; :disabled -> __daisy-select-disabled.
    // Expanded: bg-base-100->background-color, relative->position,
    // inline-flex->display, shrink->flex-shrink:1, appearance-none,
    // items-center->align-items, gap-1.5->gap:0.375rem, ps-3->padding-inline-start:0.75rem,
    // pe-7->padding-inline-end:1.75rem, align-middle->vertical-align:middle.
    out.push([
      key("select"),
      [
        {
          "background-color": "var(--color-base-100)",
          position: "relative",
          display: "inline-flex",
          "flex-shrink": "1",
          appearance: "none",
          "align-items": "center",
          gap: "0.375rem",
          "padding-inline-start": "0.75rem",
          "padding-inline-end": "1.75rem",
          "vertical-align": "middle",
          "--size": "calc(var(--size-field, 0.25rem) * var(--sl-size-mul, 10))",
          "--input-color": "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
          width: "clamp(3rem, 20rem, 100%)",
          height: "var(--size)",
          "font-size": "max(var(--font-size, 0rem), var(--font-size-min, 0.875rem))",
          "touch-action": "manipulation",
          "border-start-start-radius": "var(--join-ss, var(--radius-field))",
          "border-start-end-radius": "var(--join-se, var(--radius-field))",
          "border-end-start-radius": "var(--join-es, var(--radius-field))",
          "border-end-end-radius": "var(--join-ee, var(--radius-field))",
          "background-image":
            "linear-gradient(45deg, #0000 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, #0000 50%)",
          "background-position":
            "calc(100% - 20px) calc(1px + 50%), calc(100% - 16.1px) calc(1px + 50%)",
          "background-size": "4px 4px, 4px 4px",
          "background-repeat": "no-repeat",
          "white-space": "nowrap",
          overflow: "hidden",
          "text-overflow": "ellipsis",
          border: "var(--border) solid var(--input-color, #0000)",
          "box-shadow":
            "0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000) inset, 0 -1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset",
        },
        "__daisy-select-nested",
        "__daisy-select-disabled",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── skeleton ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/skeleton.css
  if (shouldInclude("skeleton", opts.include, opts.exclude)) {
    // .skeleton base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // motion-reduce + no-preference animation -> __daisy-skeleton-nested.
    // Expanded: bg-base-300->background-color:var(--color-base-300),
    // rounded-box->border-radius:var(--radius-box).
    out.push([
      key("skeleton"),
      [
        {
          "background-color": "var(--color-base-300)",
          "border-radius": "var(--radius-box)",
          "will-change": "background-position",
          "background-image":
            "linear-gradient(105deg, #0000 0% 40%, var(--color-base-100) 50%, #0000 60% 100%)",
          "background-size": "200% auto",
          "background-position-x": "-50%",
        },
        "__daisy-skeleton-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── stack ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/stack.css
  if (shouldInclude("stack", opts.include, opts.exclude)) {
    // .stack base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // >* children -> __daisy-stack-children; default bottom positions (upstream
    // l1.l2 `&, &.stack-bottom`) -> __daisy-stack-pos.
    // Expanded: inline-grid->display:inline-grid.
    out.push([
      key("stack"),
      [
        {
          display: "inline-grid",
          "grid-template-columns": "3px 4px 1fr 4px 3px",
          "grid-template-rows": "3px 4px 1fr 4px 3px",
        },
        "__daisy-stack-children",
        "__daisy-stack-pos",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── stat ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/stat.css
  if (shouldInclude("stat", opts.include, opts.exclude)) {
    // .stats base, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: rounded-box->border-radius, relative->position,
    // inline-grid->display, grid-flow-col->grid-auto-flow:column,
    // overflow-x-auto->overflow-x:auto.
    out.push([key("stats"), [{ "border-radius": "var(--radius-box)", position: "relative", display: "inline-grid", "grid-auto-flow": "column", "overflow-x": "auto" }], { layer: "daisy-l3" }]);
    // .stat base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :not(:last-child) divider -> __daisy-stat-nested.
    // Expanded: inline-grid->display, w-full->width:100%, gap-x-4->column-gap:1rem,
    // px-6->padding-inline:1.5rem, py-4->padding-block:1rem.
    out.push([
      key("stat"),
      [
        {
          display: "inline-grid",
          width: "100%",
          "column-gap": "1rem",
          "padding-inline": "1.5rem",
          "padding-block": "1rem",
          "grid-template-columns": "repeat(1, 1fr)",
        },
        "__daisy-stat-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .stat-figure, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: col-start-2->grid-column-start:2, row-span-3+row-start-1->grid-row,
    // place-self-center->place-self:center, justify-self-end->justify-self:end.
    out.push([
      key("stat-figure"),
      [{ "grid-column-start": "2", "grid-row": "1 / span 3", "place-self": "center", "justify-self": "end" }],
      { layer: "daisy-l3" },
    ]);
    // .stat-title, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: text-base-content/60->color-mix 60%, col-start-1, whitespace-nowrap.
    out.push([
      key("stat-title"),
      [{ "white-space": "nowrap", color: "color-mix(in oklab, var(--color-base-content) 60%, transparent)", "grid-column-start": "1", "font-size": "0.75rem" }],
      { layer: "daisy-l3" },
    ]);
    // .stat-value, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: col-start-1, whitespace-nowrap.
    out.push([
      key("stat-value"),
      [{ "white-space": "nowrap", "grid-column-start": "1", "font-size": "2rem", "font-weight": "800" }],
      { layer: "daisy-l3" },
    ]);
    // .stat-desc, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    out.push([
      key("stat-desc"),
      [{ "white-space": "nowrap", color: "color-mix(in oklab, var(--color-base-content) 60%, transparent)", "grid-column-start": "1", "font-size": "0.75rem" }],
      { layer: "daisy-l3" },
    ]);
    // .stat-actions, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    out.push([key("stat-actions"), [{ "white-space": "nowrap", "grid-column-start": "1" }], { layer: "daisy-l3" }]);
  }

  // ─── status ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/status.css
  if (shouldInclude("status", opts.include, opts.exclude)) {
    // .status base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: bg-base-content/20->background-color:color-mix 20%,
    // rounded-selector->border-radius, inline-block->display,
    // aspect-square->aspect-ratio:1, bg-center->background-position:50%,
    // bg-no-repeat->background-repeat:no-repeat, align-middle->vertical-align,
    // text-black/30->color:color-mix with --color-black 30%.
    out.push([
      key("status"),
      [
        {
          "background-color": "color-mix(in oklab, var(--color-base-content) 20%, transparent)",
          "border-radius": "var(--radius-selector)",
          display: "inline-block",
          "aspect-ratio": "1",
          "background-position": "50%",
          "background-repeat": "no-repeat",
          "vertical-align": "middle",
          color: "color-mix(in oklab, var(--color-black) 30%, transparent)",
          "--size": "calc(var(--size-selector, 0.25rem) * 2)",
          width: "var(--size)",
          height: "var(--size)",
          "background-image":
            "radial-gradient(circle at 35% 30%, oklch(1 0 0 / calc(var(--depth) * 0.5)), #0000)",
          "box-shadow":
            "0 2px 3px -1px color-mix(in oklab, currentColor calc(var(--depth) * 100%), #0000)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  void applyPrefix;
  return out;
}
