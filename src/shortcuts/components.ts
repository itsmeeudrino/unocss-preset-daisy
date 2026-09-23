import type { StaticShortcut } from "unocss";
import { shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 1 (6 canonical components).
// Static, flat, single-selector classes live here as Uno shortcuts.
// Rule: upstream at-apply utilities are expanded to raw CSS declarations inline
// (see scripts/inventory-apply.ts for the utility list). No at-apply directives remain.
// Nested selectors (:hover/:focus/:disabled states, child selectors, media queries)
// cannot be expressed as shortcut objects (Uno merges a shortcut into one selector),
// so they live as companion internal rules in src/rules/components.ts and are
// referenced by token from the base shortcuts below.
// Layer intent is preserved via RuleMeta `layer` + per-block comments:
// upstream daisyui.l1.l2.l3 -> uno `daisy-l3`, .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`,
// bare daisyui (outermost/lowest) -> `daisy-l1`, .l1.l2.l3.l4 -> `components`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function componentShortcuts(opts: Ctx): StaticShortcut[] {
  const out: StaticShortcut[] = [];
  // Shortcut key: plain class name with prefix. Selector strings go through applyPrefix.
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── button ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/button.css
  if (shouldInclude("button", opts.include, opts.exclude)) {
    // .btn base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat declarations only;
    // checkbox/radio + :checked nests, :where(.btn) reset, prose link fix and all
    // :hover/:active/:focus-visible/:disabled states -> __daisy-btn-nested / __daisy-btn-state.
    // Expanded: inline-flex->display, shrink-0->flex-shrink:0, cursor-pointer->cursor,
    // flex-nowrap->flex-wrap:nowrap, items-center->align-items, justify-center->justify-content,
    // gap-1.5->gap:0.375rem, text-center->text-align, align-middle->vertical-align,
    // outline-offset-2->outline-offset:2px, select-none->user-select:none.
    out.push([
      key("btn"),
      [
        {
          "--size": "calc(var(--size-field, 0.25rem) * 10)",
          "--btn-p": "1rem",
          "--btn-fg": "var(--color-base-content)",
          display: "inline-flex",
          "flex-shrink": "0",
          cursor: "pointer",
          "flex-wrap": "nowrap",
          "align-items": "center",
          "justify-content": "center",
          gap: "0.375rem",
          "text-align": "center",
          "vertical-align": "middle",
          "outline-offset": "2px",
          "-webkit-user-select": "none",
          "user-select": "none",
          "font-weight": "600",
          "border-start-start-radius": "var(--join-ss, var(--radius-field))",
          "border-start-end-radius": "var(--join-se, var(--radius-field))",
          "border-end-start-radius": "var(--join-es, var(--radius-field))",
          "border-end-end-radius": "var(--join-ee, var(--radius-field))",
          "border-width": "var(--border)",
          "touch-action": "manipulation",
          "transition-property":
            "color, background-color, border-color, box-shadow, transform",
          "transition-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          "transition-duration": "0.2s",
          "--btn-bg": "var(--btn-color, var(--color-base-200))",
          "--btn-border":
            "color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 calc(var(--depth) * 5%))",
          "--btn-soft-bg": "initial",
          "--btn-shadow":
            "0 3px 2px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000), 0 4px 3px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000)",
          "--btn-inset":
            "0 0.5px 0 0.5px oklch(100% 0 0 / calc(var(--depth) * 6%))",
          height: "var(--size)",
          "padding-inline": "var(--btn-p)",
          "font-size": "var(--fontsize, 0.875rem)",
          "background-color": "var(--btn-bg)",
          color: "var(--btn-fg)",
          "border-color": "var(--btn-border)",
          "border-style": "var(--btn-border-style, solid)",
          "outline-color": "var(--btn-color, var(--color-base-content))",
          "--tw-prose-links": "var(--btn-fg)",
          "background-image": "none, var(--fx-noise)",
          "background-size": "auto, calc(var(--noise, 0) * 100%)",
          "text-shadow": "0 0.5px oklch(100% 0 0 / calc(var(--depth) * 0.15))",
          "box-shadow": "var(--btn-inset) inset, var(--btn-shadow)",
        },
        "__daisy-btn-nested",
        "__daisy-btn-state",
      ],
      { layer: "daisy-l3" },
    ]);
    // Style modifiers, upstream layer daisyui.l1.l2.l3 -> daisy-l3. All flat.
    out.push([
      key("btn-outline"),
      [
        {
          "--btn-bg": "#0000",
          color:
            "var(--btn-rest-fg, var(--btn-color, var(--color-base-content)))",
          "--btn-border": "var(--btn-color, var(--color-base-content))",
          "--btn-border-style": "solid",
          "background-image": "none",
          "--btn-inset": "0 0 0 0 oklch(0% 0 0/0)",
          "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .btn-dash, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Upstream defines
    // .btn-dash TWICE: first block carries the full outline-like reset
    // (--btn-bg/color/--btn-border/border-style:solid/inset/shadow/bg-image),
    // second block flips --btn-border-style to dashed (which wins the cascade).
    // Mirrored here: the shortcut keeps the dashed override (shortcuts emit
    // after static rules within a layer), the first-block props live in
    // __daisy-btn-dash so the cascade order matches upstream source order.
    out.push([
      key("btn-dash"),
      [{ "--btn-border-style": "dashed" }, "__daisy-btn-dash"],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("btn-ghost"),
      [
        {
          "--btn-bg": "#0000",
          color:
            "var(--btn-rest-fg, var(--btn-color, var(--color-base-content, currentColor)))",
          "--btn-border": "#0000",
          "background-image": "none",
          "--btn-inset": "0 0 0 0 oklch(0% 0 0/0)",
          "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("btn-soft"),
      [
        {
          "--btn-bg":
            "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 8%, var(--btn-soft-bg, var(--color-base-100)))",
          color:
            "var(--btn-rest-fg, var(--btn-color, var(--color-base-content)))",
          "--btn-border":
            "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 10%, var(--btn-soft-bg, var(--color-base-100)))",
          "--btn-border-style": "solid",
          "background-image": "none",
          "--btn-inset": "0 0 0 0 oklch(0% 0 0/0)",
          "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .btn-link, upstream layer bare daisyui -> daisy-l1. Expanded: underline->text-decoration-line.
    out.push([
      key("btn-link"),
      [
        {
          "text-decoration-line": "underline",
          "--btn-bg": "#0000",
          color: "var(--btn-color, var(--color-primary))",
          "--btn-border": "#0000",
          "background-image": "none",
          "--btn-inset": "0 0 0 0 oklch(0% 0 0/0)",
          "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0)",
        },
      ],
      { layer: "daisy-l1" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. All flat.
    const btnColors: Array<[string, string, string, string?]> = [
      ["btn-primary", "var(--color-primary)", "var(--color-primary-content)"],
      [
        "btn-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      ["btn-accent", "var(--color-accent)", "var(--color-accent-content)"],
      [
        "btn-neutral",
        "var(--color-neutral)",
        "var(--color-neutral-content)",
        "var(--color-neutral-content) 80%",
      ],
      ["btn-info", "var(--color-info)", "var(--color-info-content)"],
      ["btn-success", "var(--color-success)", "var(--color-success-content)"],
      ["btn-warning", "var(--color-warning)", "var(--color-warning-content)"],
      ["btn-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, color, fg, softBg] of btnColors) {
      out.push([
        key(name),
        [
          {
            "--btn-color": color,
            "--btn-fg": fg,
            "--btn-soft-bg": softBg ?? "initial",
            ...(name === "btn-neutral" ? { "--btn-rest-fg": "initial" } : {}),
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── badge ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/badge.css
  // .badge base is fully flat -> single shortcut, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
  // Expanded: rounded-selector->border-radius:var(--radius-selector), inline-flex->display,
  // shrink-0->flex-shrink:0, items-center->align-items, justify-center->justify-content,
  // gap-2->gap:0.5rem, align-middle->vertical-align.
  if (shouldInclude("badge", opts.include, opts.exclude)) {
    out.push([
      key("badge"),
      [
        {
          "border-radius": "var(--radius-selector)",
          display: "inline-flex",
          "flex-shrink": "0",
          "align-items": "center",
          "justify-content": "center",
          gap: "0.5rem",
          "vertical-align": "middle",
          color: "var(--badge-fg)",
          border:
            "var(--border) solid var(--badge-color, var(--color-base-200))",
          "font-size": "0.875rem",
          width: "fit-content",
          "background-size": "auto, calc(var(--noise) * 100%)",
          "background-image": "none, var(--fx-noise)",
          "background-color": "var(--badge-bg)",
          "--badge-bg": "var(--badge-color, var(--color-base-100))",
          "--badge-fg": "var(--color-base-content)",
          "--size": "calc(var(--size-selector, 0.25rem) * 6)",
          height: "var(--size)",
          "padding-inline": "calc(var(--size) / 2 - var(--border))",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // Style modifiers, upstream layer daisyui.l1.l2 -> daisy-l2. All flat.
    out.push([
      key("badge-outline"),
      [
        {
          color: "var(--badge-color)",
          "--badge-bg": "#0000",
          "background-image": "none",
          "border-color": "currentColor",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("badge-dash"),
      [
        {
          color: "var(--badge-color)",
          "--badge-bg": "#0000",
          "background-image": "none",
          "border-color": "currentColor",
          "border-style": "dashed",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("badge-soft"),
      [
        {
          color: "var(--badge-color, var(--color-base-content))",
          "background-color":
            "color-mix(in oklab, var(--badge-color, var(--color-base-content)) 8%, var(--color-base-100))",
          "border-color":
            "color-mix(in oklab, var(--badge-color, var(--color-base-content)) 10%, var(--color-base-100))",
          "background-image": "none",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    const badgeColors: Array<[string, string, string]> = [
      ["badge-primary", "var(--color-primary)", "var(--color-primary-content)"],
      [
        "badge-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      ["badge-accent", "var(--color-accent)", "var(--color-accent-content)"],
      ["badge-neutral", "var(--color-neutral)", "var(--color-neutral-content)"],
      ["badge-info", "var(--color-info)", "var(--color-info-content)"],
      ["badge-success", "var(--color-success)", "var(--color-success-content)"],
      ["badge-warning", "var(--color-warning)", "var(--color-warning-content)"],
      ["badge-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, color, fg] of badgeColors) {
      out.push([
        key(name),
        [{ "--badge-color": color, "--badge-fg": fg }],
        { layer: "daisy-l2" },
      ]);
    }
    // .badge-ghost, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: border-base-200->border-color, bg-base-200->background-color,
    // text-base-content->color.
    out.push([
      key("badge-ghost"),
      [
        {
          "border-color": "var(--color-base-200)",
          "background-color": "var(--color-base-200)",
          color: "var(--color-base-content)",
          "background-image": "none",
        },
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── card ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/card.css
  if (shouldInclude("card", opts.include, opts.exclude)) {
    // .card base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :focus-visible/:has states, checkbox children and figure blocks ->
    // __daisy-card-state / __daisy-card-figure.
    // Expanded: rounded-box->border-radius:var(--radius-box), relative->position,
    // flex->display, flex-col->flex-direction.
    out.push([
      key("card"),
      [
        {
          "border-radius": "var(--radius-box)",
          position: "relative",
          display: "flex",
          "flex-direction": "column",
          transition: "outline 0.2s ease-in-out",
          outline: "2px solid #0000",
          "outline-offset": "2px",
        },
        "__daisy-card-state",
        "__daisy-card-figure",
      ],
      { layer: "daisy-l3" },
    ]);
    // .card-border / .card-dash, upstream layer daisyui.l1.l2 -> daisy-l2. Flat.
    out.push([
      key("card-border"),
      [{ border: "var(--border) solid var(--color-base-200)" }],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("card-dash"),
      [{ border: "var(--border) dashed var(--color-base-200)" }],
      { layer: "daisy-l2" },
    ]);
    // .card-title, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: flex->display, items-center->align-items, gap-2->gap:0.5rem.
    out.push([
      key("card-title"),
      [
        {
          display: "flex",
          "align-items": "center",
          gap: "0.5rem",
          "font-size": "var(--cardtitle-fs, 1.125rem)",
          "font-weight": "600",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .card-actions, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: flex->display, flex-wrap->flex-wrap:wrap, items-start->align-items:flex-start,
    // gap-2->gap:0.5rem.
    out.push([
      key("card-actions"),
      [
        {
          display: "flex",
          "flex-wrap": "wrap",
          "align-items": "flex-start",
          gap: "0.5rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── input ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/input.css
  if (shouldInclude("input", opts.include, opts.exclude)) {
    // .input base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat declarations only;
    // input children, placeholders, picker/spin pseudos, :focus, coarse-pointer,
    // :disabled states and rtl radius flip -> __daisy-input-nested / __daisy-input-disabled.
    // Expanded: bg-base-100->background-color, relative->position, inline-flex->display,
    // shrink->flex-shrink:1, appearance-none->appearance:none, items-center->align-items,
    // gap-2->gap:0.5rem, px-3->padding-inline:0.75rem, align-middle->vertical-align,
    // whitespace-nowrap->white-space:nowrap.
    out.push([
      key("input"),
      [
        {
          "background-color": "var(--color-base-100)",
          position: "relative",
          display: "inline-flex",
          "flex-shrink": "1",
          appearance: "none",
          "align-items": "center",
          gap: "0.5rem",
          "padding-inline": "0.75rem",
          "vertical-align": "middle",
          "white-space": "nowrap",
          "--size": "calc(var(--size-field, 0.25rem) * var(--in-size-mul, 10))",
          "--input-color":
            "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
          cursor: "text",
          width: "clamp(3rem, 20rem, 100%)",
          height: "var(--size)",
          "font-size":
            "max(var(--font-size, 0rem), var(--font-size-min, 0.875rem))",
          "touch-action": "manipulation",
          "border-start-start-radius": "var(--join-ss, var(--radius-field))",
          "border-start-end-radius": "var(--join-se, var(--radius-field))",
          "border-end-start-radius": "var(--join-es, var(--radius-field))",
          "border-end-end-radius": "var(--join-ee, var(--radius-field))",
          border: "var(--border) solid var(--input-color, #0000)",
          "box-shadow":
            "0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000) inset, 0 -1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset",
        },
        "__daisy-input-nested",
        "__daisy-input-disabled",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── modal ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/modal.css
  if (shouldInclude("modal", opts.include, opts.exclude)) {
    // .modal base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // ::backdrop, [popover], attr-driven open states -> __daisy-modal-nested /
    // __daisy-modal-open-attr. Class-driven open (.modal-open token) -> public rule.
    // Expanded: pointer-events-none->pointer-events:none, invisible->visibility:hidden,
    // fixed->position:fixed, inset-0->inset:0, m-0->margin:0, grid->display:grid,
    // h-full/w-full->100%, max-h-none/max-w-none->none, items-center->align-items,
    // justify-items-center->justify-items, bg-transparent->background-color:transparent,
    // p-0->padding:0, text-[inherit]->font-size+color inherit.
    out.push([
      key("modal"),
      [
        {
          "pointer-events": "none",
          visibility: "hidden",
          position: "fixed",
          inset: "0",
          margin: "0",
          display: "grid",
          height: "100%",
          "max-height": "none",
          width: "100%",
          "max-width": "none",
          "align-items": "center",
          "justify-items": "center",
          "background-color": "transparent",
          padding: "0",
          "font-size": "inherit",
          color: "inherit",
          transition:
            "overlay 0.3s allow-discrete, visibility 0.3s allow-discrete, background-color 0.3s ease-out, opacity 0.1s ease-out",
          overflow: "clip",
          "overscroll-behavior": "contain",
          "z-index": "999",
          "scrollbar-gutter": "auto",
        },
        "__daisy-modal-nested",
        "__daisy-modal-open-attr",
      ],
      { layer: "daisy-l3" },
    ]);
    // .modal-action, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: mt-6->margin-top:1.5rem, flex->display:flex,
    // justify-end->justify-content:flex-end, gap-2->gap:0.5rem.
    out.push([
      key("modal-action"),
      [
        {
          "margin-top": "1.5rem",
          display: "flex",
          "justify-content": "flex-end",
          gap: "0.5rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .modal-toggle, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: fixed->position, h-0/w-0->0, appearance-none, opacity-0->opacity:0.
    out.push([
      key("modal-toggle"),
      [
        {
          position: "fixed",
          height: "0",
          width: "0",
          appearance: "none",
          opacity: "0",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .modal-box, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: bg-base-100->background-color, col-start-1/row-start-1->grid-column/row-start:1,
    // max-h-screen->max-height:100vh, w-11/12->width:91.666667%, max-w-[32rem]->max-width:32rem,
    // p-6->padding:1.5rem. Transition kept in upstream compiled spelling
    // (`.2s`, `50ms` delay) — the parity normalizer sorts transition tokens
    // before number rounding, so `0.05s` would sort differently than `50ms`.
    out.push([
      key("modal-box"),
      [
        {
          "background-color": "var(--color-base-100)",
          "grid-column-start": "1",
          "grid-row-start": "1",
          "max-height": "100vh",
          width: "91.666667%",
          "max-width": "32rem",
          padding: "1.5rem",
          transition:
            "translate .3s ease-out,scale .3s ease-out,opacity .2s ease-out 50ms,box-shadow .3s ease-out",
          "border-top-left-radius": "var(--modal-tl, var(--radius-box))",
          "border-top-right-radius": "var(--modal-tr, var(--radius-box))",
          "border-bottom-left-radius": "var(--modal-bl, var(--radius-box))",
          "border-bottom-right-radius": "var(--modal-br, var(--radius-box))",
          scale: "95%",
          opacity: "0",
          "box-shadow": "0 25px 50px -12px oklch(0% 0 0/.25)",
          "overflow-y": "auto",
          "overscroll-behavior": "contain",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── menu ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/menu.css
  if (shouldInclude("menu", opts.include, opts.exclude)) {
    // .menu base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // all li/details/summary/hover/focus/active/disabled nests -> __daisy-menu-state.
    // Expanded: flex->display:flex, w-fit->width:fit-content, flex-col->flex-direction:column,
    // flex-wrap->flex-wrap:wrap, p-2->padding:0.5rem.
    out.push([
      key("menu"),
      [
        {
          display: "flex",
          width: "fit-content",
          // Compiled form (flex-col + flex-wrap merge to flex-flow).
          "flex-flow": "column wrap",
          padding: "0.5rem",
          "--menu-active-fg": "var(--color-neutral-content)",
          "--menu-active-bg": "var(--color-neutral)",
          "font-size": "0.875rem",
        },
        "__daisy-menu-state",
      ],
      { layer: "daisy-l3" },
    ]);
    // .menu-title, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: text-base-content/40->color-mix 40%, px-3->padding-inline:0.75rem,
    // py-2->padding-block:0.5rem.
    out.push([
      key("menu-title"),
      [
        {
          color:
            "color-mix(in oklab, var(--color-base-content) 40%, transparent)",
          "padding-inline": "0.75rem",
          "padding-block": "0.5rem",
          "font-size": "0.875rem",
          "font-weight": "600",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  return out;
}
