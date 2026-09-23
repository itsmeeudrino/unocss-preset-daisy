import type { StaticShortcut } from "unocss";
import { shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/{steps,swap,tab,table,textarea,
// textrotate,timeline,toast,toggle,tooltip,validator}.css — P3 batch 5.
// Static, flat, single-selector classes live here as Uno shortcuts.
// Rule: upstream at-apply utilities are expanded to raw CSS declarations inline
// (verified byte-for-byte against /tmp/daisy-ref.css, the compiled upstream
// daisyui.css). No at-apply directives remain.
// Nested selectors (child/pseudo/state/media, `&` blocks) cannot be expressed as
// shortcut objects (Uno merges a shortcut into one selector), so they live as
// companion internal rules in src/rules/batch5.ts and are referenced by token
// from the base shortcuts below.
// Layer intent is preserved via shortcut `layer` meta + per-block comments:
// upstream daisyui.l1.l2.l3 -> uno `daisy-l3`, .l1.l2 -> `daisy-l2`,
// .l1 -> `daisy-l1`, utilities-layer blocks -> `utilities`.
// NOTE on prefixing: unlike earlier batches, selector prefixing is applied to
// selector substrings only (see rules file). Shortcut keys are plain class
// names with prefix; declaration objects need no transformation.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch5Shortcuts(opts: Ctx): StaticShortcut[] {
  const out: StaticShortcut[] = [];
  // Shortcut key: plain class name with prefix.
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── steps ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/steps.css
  if (shouldInclude("steps", opts.include, opts.exclude)) {
    // .steps base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // the .step child block (with & nests) -> __daisy-steps-nested.
    // Expanded: inline-grid->display, grid-flow-col->grid-auto-flow:column,
    // overflow-hidden->overflow:hidden, overflow-x-auto->overflow-x:auto
    // (upstream build merges these to `overflow: auto hidden`; same computed value).
    out.push([
      key("steps"),
      [
        {
          "counter-reset": "step",
          "grid-auto-columns": "1fr",
          "grid-auto-flow": "column",
          display: "inline-grid",
          overflow: "hidden",
          "overflow-x": "auto",
        },
        "__daisy-steps-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── swap ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/swap.css
  if (shouldInclude("swap", opts.include, opts.exclude)) {
    // .swap base, upstream layer daisyui.l1.l2 -> daisy-l2. Flat part only;
    // input/children/on-off checkbox-hack nests -> __daisy-swap-nested.
    // Expanded: relative->position, inline-grid->display, cursor-pointer->cursor,
    // place-content-center->place-content:center, align-middle->vertical-align:middle,
    // select-none->user-select:none (+ -webkit- prefix as upstream emits it).
    out.push([
      key("swap"),
      [
        {
          position: "relative",
          display: "inline-grid",
          cursor: "pointer",
          "place-content": "center",
          "vertical-align": "middle",
          "-webkit-user-select": "none",
          "user-select": "none",
        },
        "__daisy-swap-nested",
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── tab ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/tab.css
  if (shouldInclude("tab", opts.include, opts.exclude)) {
    // .tabs container, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: flex->display:flex, flex-wrap->flex-wrap:wrap.
    out.push([
      key("tabs"),
      [
        {
          "--tabs-height": "auto",
          "--tabs-direction": "row",
          "--tab-height": "calc(var(--size-field, 0.25rem) * 10)",
          height: "var(--tabs-height)",
          "flex-wrap": "wrap",
          "flex-direction": "var(--tabs-direction)",
          display: "flex",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .tab base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat declarations
    // of the `.tab:is(.tabs > .tab)` block emitted here as plain `.tab` (intentional:
    // lone `.tab` styling itself is harmless DX; inside `.tabs` the vars resolve
    // identically and l2 modifiers win by layer order regardless of the lower
    // 0,1,0 specificity vs upstream's 0,3,0). Every nested selector (hover media,
    // radio/label children, checked, dim, empty, focus, disabled) lives in
    // __daisy-tab-nested under the exact upstream selectors, and the
    // .tab-active slice lives in the public tab-active rule (no block emitted twice).
    // Expanded: relative->position, inline-flex->display, cursor-pointer->cursor,
    // appearance-none->appearance:none, flex-wrap->flex-wrap:wrap,
    // items-center->align-items:center, justify-center->justify-content:center,
    // text-center->text-align:center, select-none->user-select:none (+ -webkit-).
    out.push([
      key("tab"),
      [
        {
          position: "relative",
          display: "inline-flex",
          cursor: "pointer",
          appearance: "none",
          "flex-wrap": "wrap",
          "align-items": "center",
          "justify-content": "center",
          "text-align": "center",
          "-webkit-user-select": "none",
          "user-select": "none",
          "--tab-p": "0.75rem",
          "--tab-bg": "var(--color-base-100)",
          "--tab-border-color": "var(--color-base-300)",
          "--tab-radius-ss": "0",
          "--tab-radius-se": "0",
          "--tab-radius-es": "0",
          "--tab-radius-ee": "0",
          "--tab-order": "0",
          "--tab-radius-min": "calc(0.75rem - var(--border))",
          "--tab-radius-limit":
            "min(var(--radius-field), var(--tab-radius-min))",
          "--tab-radius-grad":
            "#0000 calc(69% - var(--border)), var(--tab-border-color) calc(69% - var(--border) + 0.25px), var(--tab-border-color) 69%, var(--tab-bg) calc(69% + 0.25px)",
          "border-color": "#0000",
          order: "var(--tab-order)",
          height: "var(--tab-height)",
          "padding-inline": "var(--tab-p)",
          "font-size": "0.875rem",
        },
        "__daisy-tab-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .tab-content base lives in rules/batch5.ts as a raw string (it needs
    // duplicate `order` declarations — fallback `1`, then the var — which
    // a shortcut object cannot express). See `key("tab-content")` there.
    // .tab-disabled, upstream layer daisyui.l1.l2 -> daisy-l2. Fully flat.
    // Expanded: pointer-events-none->pointer-events:none, opacity-40->opacity:0.4.
    out.push([
      key("tab-disabled"),
      [{ "pointer-events": "none", opacity: "0.4" }],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── table ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/table.css
  if (shouldInclude("table", opts.include, opts.exclude)) {
    // .table base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // rtl/row-hover/cell/thead/tfoot/border nests -> __daisy-table-nested.
    // Pin-row/col blocks live in the public table-pin-rows/table-pin-cols rules
    // so no block is emitted twice for `class="table table-pin-rows"`.
    // Expanded: rounded-box->border-radius:var(--radius-box), relative->position,
    // w-full->width:100%, border-separate->border-collapse:separate,
    // border-spacing-0->--tw-border-spacing-x/y:0px + border-spacing,
    // text-left->text-align:left, rtl:text-right kept in the nested companion.
    out.push([
      key("table"),
      [
        {
          "font-size": "0.875rem",
          "border-radius": "var(--radius-box)",
          position: "relative",
          width: "100%",
          "border-collapse": "separate",
          "--tw-border-spacing-x": "0px",
          "--tw-border-spacing-y": "0px",
          "border-spacing":
            "var(--tw-border-spacing-x) var(--tw-border-spacing-y)",
          "text-align": "left",
        },
        "__daisy-table-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── textarea ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/textarea.css
  if (shouldInclude("textarea", opts.include, opts.exclude)) {
    // .textarea base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // textarea child/focus/coarse-pointer -> __daisy-textarea-nested,
    // :disabled states (upstream l1.l2 -> daisy-l2) -> __daisy-textarea-disabled.
    // Expanded: bg-base-100->background-color, rounded-field->border-radius,
    // min-h-20->min-height:5rem, shrink->flex-shrink:1, appearance-none->appearance,
    // px-3->padding-inline:0.75rem, py-2->padding-block:0.5rem,
    // align-middle->vertical-align:middle.
    out.push([
      key("textarea"),
      [
        {
          "background-color": "var(--color-base-100)",
          "border-radius": "var(--radius-field)",
          "min-height": "5rem",
          "flex-shrink": "1",
          appearance: "none",
          "padding-inline": "0.75rem",
          "padding-block": "0.5rem",
          "vertical-align": "middle",
          "--input-color":
            "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
          width: "clamp(3rem, 20rem, 100%)",
          "font-size":
            "max(var(--font-size, 0rem), var(--font-size-min, 0.875rem))",
          "touch-action": "manipulation",
          border: "var(--border) solid var(--input-color, #0000)",
          "box-shadow":
            "0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000) inset, 0 -1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset",
        },
        "__daisy-textarea-nested",
        "__daisy-textarea-disabled",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── textrotate ───────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/textrotate.css
  if (shouldInclude("textrotate", opts.include, opts.exclude)) {
    // .text-rotate base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part
    // only; the `> *` rotator nests + hover pause + @keyframes rotator live in
    // __daisy-textrotate-nested (keyframes ride along: the animation is only
    // referenced from those nested selectors).
    // Expanded: inline-block->display, overflow-hidden->overflow:hidden,
    // align-bottom->vertical-align:bottom, whitespace-nowrap->white-space:nowrap.
    out.push([
      key("text-rotate"),
      [
        {
          height: "1lh",
          display: "inline-block",
          overflow: "hidden",
          "vertical-align": "bottom",
          "white-space": "nowrap",
          "transition-property": "none",
          "--duration": "var(--tw-duration)",
        },
        "__daisy-textrotate-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── timeline ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/timeline.css
  if (shouldInclude("timeline", opts.include, opts.exclude)) {
    // .timeline base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // > li / :where(hr) / end-cap radius nests -> __daisy-timeline-nested.
    // Expanded: relative->position, flex->display:flex.
    out.push([
      key("timeline"),
      [
        {
          position: "relative",
          display: "flex",
        },
        "__daisy-timeline-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .timeline-box, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: rounded-box->border-radius, bg-base-100->background-color,
    // border-base-300->border-color, px-4->padding-inline:1rem, py-2->padding-block:0.5rem.
    out.push([
      key("timeline-box"),
      [
        {
          border: "var(--border) solid",
          "border-radius": "var(--radius-box)",
          "border-color": "var(--color-base-300)",
          "background-color": "var(--color-base-100)",
          "padding-block": "0.5rem",
          "padding-inline": "1rem",
          "font-size": "0.75rem",
          "box-shadow": "0 1px 2px 0 oklch(0% 0 0/0.05)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .timeline-start, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: col-start-1 col-end-4 row-start-1 row-end-2 + m-1 + self-end +
    // justify-self-center merge to grid-area + place-self + margin (as upstream build emits).
    out.push([
      key("timeline-start"),
      [
        {
          "grid-area": "1/1/2/4",
          "place-self": "flex-end center",
          margin: "0.25rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .timeline-middle, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: col-start-2->grid-column-start:2, row-start-2->grid-row-start:2.
    out.push([
      key("timeline-middle"),
      [{ "grid-row-start": "2", "grid-column-start": "2" }],
      { layer: "daisy-l3" },
    ]);
    // .timeline-end, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: col-start-1 col-end-4 row-start-3 row-end-4 + m-1 + self-start +
    // justify-self-center merge to grid-area + place-self + margin.
    out.push([
      key("timeline-end"),
      [
        {
          "grid-area": "3/1/4/4",
          "place-self": "flex-start center",
          margin: "0.25rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── toast ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/toast.css
  if (shouldInclude("toast", opts.include, opts.exclude)) {
    // .toast base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // the `> *` entrance animation + @keyframes toast live in __daisy-toast-nested.
    // Expanded: fixed->position:fixed, start-auto end-4->inset-inline:auto 1rem,
    // top-auto->top:auto, bottom-4->bottom:1rem, flex->display:flex,
    // flex-col->flex-direction:column, gap-2->gap:0.5rem,
    // bg-transparent->background-color:#0000.
    out.push([
      key("toast"),
      [
        {
          position: "fixed",
          "inset-inline": "auto 1rem",
          top: "auto",
          bottom: "1rem",
          display: "flex",
          "flex-direction": "column",
          gap: "0.5rem",
          "background-color": "#0000",
          translate: "var(--toast-x, 0) var(--toast-y, 0)",
          width: "max-content",
          "max-width": "calc(100vw - 2rem)",
        },
        "__daisy-toast-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // Positions, upstream layer daisyui.l1.l2 -> daisy-l2. All flat single-selector.
    // Expanded: start-4 end-auto->inset-inline:1rem auto, start-auto end-4->auto 1rem,
    // start-1/2 end-1/2 (center handled as a rule: it has a :dir(rtl) nest),
    // top-auto bottom-4 / top-1/2 bottom-auto / top-4 bottom-auto as below.
    out.push([
      key("toast-start"),
      [{ "inset-inline": "1rem auto", "--toast-x": "0" }],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("toast-end"),
      [{ "inset-inline": "auto 1rem", "--toast-x": "0" }],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("toast-top"),
      [{ top: "1rem", bottom: "auto", "--toast-y": "0" }],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("toast-middle"),
      [{ top: "50%", bottom: "auto", "--toast-y": "-50%" }],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("toast-bottom"),
      [{ top: "auto", bottom: "1rem", "--toast-y": "0" }],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── toggle ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/toggle.css
  if (shouldInclude("toggle", opts.include, opts.exclude)) {
    // .toggle base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // icon children + :before knob + forced-colors/print -> __daisy-toggle-nested;
    // :checked/:indeterminate/:disabled/:focus-visible states (upstream keeps them
    // in l1.l2.l3, so they stay daisy-l3) -> __daisy-toggle-state.
    // Expanded: relative->position, inline-grid->display, shrink-0->flex-shrink:0,
    // cursor-pointer->cursor, appearance-none->appearance,
    // place-content-center->place-content:center, align-middle->vertical-align:middle,
    // select-none->user-select:none (+ -webkit-).
    out.push([
      key("toggle"),
      [
        {
          border: "var(--border) solid currentColor",
          color: "var(--input-color)",
          cursor: "pointer",
          appearance: "none",
          "vertical-align": "middle",
          "-webkit-user-select": "none",
          "user-select": "none",
          "--radius-selector-max":
            "calc(var(--radius-selector) + var(--radius-selector) + var(--radius-selector))",
          "border-radius":
            "calc(var(--radius-selector) + min(var(--toggle-p), var(--radius-selector-max)) + min(var(--border), var(--radius-selector-max)))",
          padding: "var(--toggle-p)",
          "box-shadow":
            "0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000) inset",
          transition: "color 0.3s, grid-template-columns 0.2s",
          "--input-color":
            "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
          "--toggle-p": "calc(var(--size) * 0.125)",
          "--size": "calc(var(--size-selector, 0.25rem) * 6)",
          width:
            "calc((var(--size) * 2) - (var(--border) + var(--toggle-p)) * 2)",
          height: "var(--size)",
          "flex-shrink": "0",
          "grid-template-columns": "0fr 1fr 1fr",
          "place-content": "center",
          display: "inline-grid",
          position: "relative",
        },
        "__daisy-toggle-nested",
        "__daisy-toggle-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── tooltip ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/tooltip.css
  if (shouldInclude("tooltip", opts.include, opts.exclude)) {
    // .tooltip base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // bubble + tail + reduced-motion nests -> __daisy-tooltip-nested;
    // open/hover/focus-visible reveal (also upstream l1.l2.l3) -> __daisy-tooltip-open.
    // Expanded: relative->position, inline-block->display:inline-block.
    out.push([
      key("tooltip"),
      [
        {
          display: "inline-block",
          position: "relative",
          "--tt-bg": "var(--color-neutral)",
          "--tt-off": "calc(100% + 0.5rem)",
          "--tt-tail": "calc(100% + 1px + 0.25rem)",
          "--tt-tail-off": "0.5rem",
        },
        "__daisy-tooltip-nested",
        "__daisy-tooltip-open",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── validator ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/validator.css
  if (shouldInclude("validator", opts.include, opts.exclude)) {
    // .validator-hint, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // the `display: revert-layer` unhide (upstream keeps it in the utilities layer
    // so it beats `hidden`) rides along as __daisy-validator-unhide.
    // Expanded: invisible->visibility:hidden, mt-2->margin-top:0.5rem.
    out.push([
      key("validator-hint"),
      [
        {
          visibility: "hidden",
          "margin-top": "0.5rem",
          "font-size": "0.75rem",
        },
        "__daisy-validator-unhide",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  return out;
}
