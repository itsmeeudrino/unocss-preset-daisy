import type { StaticShortcut } from "unocss";
import { shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch-1 (11 components):
// alert, aura, avatar, breadcrumbs, calendar, carousel, chat, checkbox,
// collapse, countdown, diff.
// Static, flat, single-selector classes live here as Uno shortcuts.
// Rule: upstream at-apply utilities are expanded to raw CSS declarations inline
// (verified byte-for-byte against /tmp/daisy-ref.css compiled output). No
// at-apply directives remain. Nested selectors (child/descendant selectors,
// pseudo-elements, :has/:hover/:focus states, media queries) cannot be expressed
// as shortcut objects (Uno merges a shortcut into one selector), so they live
// as companion internal rules in src/rules/batch1.ts and are referenced by
// token from the base shortcuts below.
// Layer intent is preserved via shortcut meta `layer` + per-block comments:
// upstream daisyui.l1.l2.l3 -> uno `daisy-l3`, .l1.l2 -> `daisy-l2`,
// bare daisyui (outermost/lowest) -> `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch1Shortcuts(opts: Ctx): StaticShortcut[] {
  const out: StaticShortcut[] = [];
  // Shortcut key: plain class name with prefix.
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── alert ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/alert.css
  if (shouldInclude("alert", opts.include, opts.exclude)) {
    // .alert base: outer unlayered border-width/border-color folded in;
    // inner block upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // &:has(> :nth-child(2)) -> __daisy-alert-nested.
    // Expanded: rounded-box->border-radius:var(--radius-box),
    // text-base-content->color, grid->display:grid, items-center->align-items,
    // gap-4->gap:1rem, px-4->padding-inline:1rem, py-3->padding-block:0.75rem.
    out.push([
      key("alert"),
      [
        {
          "border-width": "var(--border)",
          "border-color": "var(--alert-border-color, var(--color-base-200))",
          "border-style": "solid",
          "--alert-border-color": "var(--color-base-200)",
          "border-radius": "var(--radius-box)",
          color: "var(--color-base-content)",
          display: "grid",
          "align-items": "center",
          gap: "1rem",
          "padding-inline": "1rem",
          "padding-block": "0.75rem",
          "background-color": "var(--alert-color, var(--color-base-200))",
          "justify-content": "start",
          "justify-items": "start",
          "grid-auto-flow": "column",
          "grid-template-columns": "auto",
          "text-align": "start",
          "font-size": "0.875rem",
          "line-height": "1.25rem",
          "background-size": "auto, calc(var(--noise) * 33%)",
          "background-image": "none, var(--fx-noise)",
          "box-shadow":
            "0 3px 0 -2px oklch(100% 0 0 / calc(var(--depth) * 0.08)) inset, 0 1px color-mix(in oklab, color-mix(in oklab, #000 20%, var(--alert-color, var(--color-base-200))) calc(var(--depth) * 20%), #0000), 0 4px 3px -2px oklch(0% 0 0 / calc(var(--depth) * 0.08))",
        },
        "__daisy-alert-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. All flat.
    // Expanded: text-info-content->color:var(--color-info-content), etc.
    const alertColors: Array<[string, string, string]> = [
      ["alert-info", "var(--color-info)", "var(--color-info-content)"],
      ["alert-success", "var(--color-success)", "var(--color-success-content)"],
      ["alert-warning", "var(--color-warning)", "var(--color-warning-content)"],
      ["alert-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, color, fg] of alertColors) {
      out.push([
        key(name),
        [{ color: fg, "--alert-border-color": color, "--alert-color": color }],
        { layer: "daisy-l2" },
      ]);
    }
    // Style variants, upstream bare daisyui layer -> daisy-l1. All flat.
    // Expanded: bg-transparent->background-color:#0000 (compiled form).
    out.push([
      key("alert-soft"),
      [
        {
          color: "var(--alert-color, var(--color-base-content))",
          background:
            "color-mix(in oklab, var(--alert-color, var(--color-base-content)) 8%, var(--color-base-100))",
          "--alert-border-color":
            "color-mix(in oklab, var(--alert-color, var(--color-base-content)) 10%, var(--color-base-100))",
          "box-shadow": "none",
          "background-image": "none",
        },
      ],
      { layer: "daisy-l1" },
    ]);
    out.push([
      key("alert-outline"),
      [
        {
          "background-color": "#0000",
          color: "var(--alert-color)",
          "box-shadow": "none",
          "background-image": "none",
        },
      ],
      { layer: "daisy-l1" },
    ]);
    out.push([
      key("alert-dash"),
      [
        {
          "background-color": "#0000",
          color: "var(--alert-color)",
          "border-style": "dashed",
          "box-shadow": "none",
          "background-image": "none",
        },
      ],
      { layer: "daisy-l1" },
    ]);
  }

  // ─── aura ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/aura.css
  if (shouldInclude("aura", opts.include, opts.exclude)) {
    // .aura base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // reduced-motion media, :has hooks, :before/:after, child -> __daisy-aura-nested.
    // Expanded: relative->position:relative, inline-block->display:inline-block,
    // absolute->position:absolute, top-1/2->top:50%, left-1/2->left:50%,
    // z-0->z-index:0, z-1->z-index:1, block->display:block,
    // opacity-70->opacity:0.7, opacity-30->opacity:0.3.
    out.push([
      key("aura"),
      [
        {
          position: "relative",
          display: "inline-block",
          "--aura-padding": "0.125rem",
          padding: "var(--aura-padding)",
          "border-radius":
            "calc(var(--aura-padding) + var(--aura-radius, var(--radius-box)))",
          animation: "aura var(--tw-duration, 6s) linear infinite",
          "background-image":
            "conic-gradient(from var(--aura-angle), transparent 225deg, currentColor)",
        },
        "__daisy-aura-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // Flat effect variants, upstream layer daisyui.l1.l2 -> daisy-l2.
    out.push([
      key("aura-rainbow"),
      [
        {
          // Upstream COMPILED value verbatim (LightningCSS: oklch L in %,
          // bare `360` hue without the `deg` unit).
          background:
            "conic-gradient(from var(--aura-angle) in oklch longer hue, transparent 10%, oklch(80% .15 0), oklch(80% .15 360), transparent 90%)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("aura-dual"),
      [
        {
          "background-image":
            "repeating-conic-gradient(from var(--aura-angle), transparent 0%, transparent 40%, currentColor 50%)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("aura-silver"),
      [
        {
          "background-image":
            "repeating-conic-gradient(from var(--aura-angle), oklch(30% 0 0), oklch(90% 0 0), oklch(60% 0 0), oklch(90% 0 0), oklch(50% 0 0), oklch(30% 0 0) 50%)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("aura-gold"),
      [
        {
          "background-image":
            "repeating-conic-gradient(from var(--aura-angle), oklch(65.98% .1863 72.37), oklch(96.35% .0768 102.94), oklch(71.57% .1691 82.23), oklch(96.02% .0792 103.13), oklch(60.66% .1181 76.17), oklch(65.98% .1863 72.37) 50%)",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
    const auraSizes: Array<[string, string]> = [
      ["aura-xs", "0rem"],
      ["aura-sm", "0.0625rem"],
      ["aura-md", "0.125rem"],
      ["aura-lg", "0.15625rem"],
      ["aura-xl", "0.25rem"],
    ];
    for (const [name, pad] of auraSizes) {
      out.push([key(name), [{ "--aura-padding": pad }], { layer: "daisy-l2" }]);
    }
  }

  // ─── avatar ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/avatar.css
  if (shouldInclude("avatar", opts.include, opts.exclude)) {
    // .avatar-group, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // .avatar child block -> __daisy-avatar-group-nested.
    // Expanded: flex->display:flex, overflow-hidden->overflow:hidden,
    // rounded-full->border-radius:calc(infinity * 1px).
    out.push([
      key("avatar-group"),
      [{ display: "flex", overflow: "hidden" }, "__daisy-avatar-group-nested"],
      { layer: "daisy-l3" },
    ]);
    // .avatar, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // > div + img nests -> __daisy-avatar-nested.
    // Expanded: relative->position, inline-flex->display, align-middle->vertical-align,
    // self-center->align-self, block->display, aspect-square->aspect-ratio:1/1,
    // h-full/w-full->100%, object-cover->object-fit:cover.
    out.push([
      key("avatar"),
      [
        {
          position: "relative",
          display: "inline-flex",
          "vertical-align": "middle",
          "align-self": "center",
        },
        "__daisy-avatar-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── breadcrumbs ──────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/breadcrumbs.css
  // NOTE: upstream defines no size/color variants — only the base + its nests.
  if (shouldInclude("breadcrumbs", opts.include, opts.exclude)) {
    // .breadcrumbs base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // menu/ul/ol + li nests -> __daisy-breadcrumbs-nested.
    // Expanded: -ms-1->margin-inline-start:-0.25rem, max-w-full->max-width:100%,
    // overflow-x-auto->overflow-x:auto, py-2->padding-block:0.5rem.
    out.push([
      key("breadcrumbs"),
      [
        {
          "margin-inline-start": "-0.25rem",
          "max-width": "100%",
          "overflow-x": "auto",
          "padding-block": "0.5rem",
        },
        "__daisy-breadcrumbs-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── calendar ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/calendar.css
  // Four integration roots (cally web-component, react-day-picker, pikaday,
  // vanilla-calendar), all upstream layer daisyui.l1.l2.l3 -> daisy-l3.
  // No at-apply anywhere in the file: nested CSS is kept verbatim in
  // __daisy-calendar-* companions (see src/rules/batch1.ts).
  if (shouldInclude("calendar", opts.include, opts.exclude)) {
    out.push([
      key("cally"),
      [{ "font-size": "0.7rem" }, "__daisy-calendar-cally"],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("react-day-picker"),
      [
        {
          "user-select": "none",
          "background-color": "var(--color-base-100)",
          "border-radius": "var(--radius-box)",
          border: "var(--border) solid var(--color-base-200)",
          "font-size": "0.75rem",
          display: "inline-block",
          position: "relative",
          overflow: "clip",
        },
        "__daisy-calendar-rdp",
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("vc"),
      [
        {
          position: "relative",
          "box-sizing": "border-box",
          display: "inline-flex",
          "min-width": "286px",
          "flex-direction": "column",
          "border-radius": "var(--radius-box)",
          border: "var(--border) solid var(--color-base-200)",
          "background-color": "var(--color-base-100)",
          color: "var(--color-base-content)",
          padding: "1rem",
          opacity: "1",
          "transition-property": "opacity",
          "transition-duration": "0.2s",
          "user-select": "none",
        },
        "__daisy-calendar-vc",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── carousel ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/carousel.css
  if (shouldInclude("carousel", opts.include, opts.exclude)) {
    // .carousel base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // reduced-motion media + ::-webkit-scrollbar -> __daisy-carousel-nested.
    // Expanded: inline-flex->display, overflow-x-scroll->overflow-x:scroll,
    // hidden->display:none.
    out.push([
      key("carousel"),
      [
        {
          display: "inline-flex",
          "overflow-x": "scroll",
          "scroll-snap-type": "x mandatory",
          "scrollbar-width": "none",
        },
        "__daisy-carousel-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // Orientation modifiers, upstream layer daisyui.l1.l2 -> daisy-l2. Flat.
    // Expanded: flex-col->flex-direction:column, overflow-y-scroll->overflow-y:scroll,
    // flex-row->flex-direction:row.
    out.push([
      key("carousel-vertical"),
      [
        {
          "flex-direction": "column",
          "overflow-y": "scroll",
          "scroll-snap-type": "y mandatory",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    out.push([
      key("carousel-horizontal"),
      [
        {
          "flex-direction": "row",
          "overflow-x": "scroll",
          "scroll-snap-type": "x mandatory",
        },
      ],
      { layer: "daisy-l2" },
    ]);
    // .carousel-item, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: box-content->box-sizing:content-box, flex->display:flex,
    // flex-none->flex:none.
    out.push([
      key("carousel-item"),
      [
        {
          "box-sizing": "content-box",
          display: "flex",
          flex: "none",
          "scroll-snap-align": "start",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── chat ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/chat.css
  // NOTE: upstream defines no .chat-time — only header/footer.
  if (shouldInclude("chat", opts.include, opts.exclude)) {
    // .chat base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: grid->display:grid, auto-rows-min->grid-auto-rows:min-content,
    // gap-x-3->column-gap:0.75rem, py-1->padding-block:0.25rem.
    out.push([
      key("chat"),
      [
        {
          "--mask-chat":
            "url(\"data:image/svg+xml,%3csvg width='13' height='13' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='M0 11.5004C0 13.0004 2 13.0004 2 13.0004H12H13V0.00036329L12.5 0C12.5 0 11.977 2.09572 11.8581 2.50033C11.6075 3.35237 10.9149 4.22374 9 5.50036C6 7.50036 0 10.0004 0 11.5004Z'/%3e%3c/svg%3e\")",
          display: "grid",
          "grid-auto-rows": "min-content",
          "column-gap": "0.75rem",
          "padding-block": "0.25rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .chat-bubble, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // &:before tail -> __daisy-chat-bubble-nested.
    // Expanded: rounded-field->border-radius:var(--radius-field),
    // bg-base-300->background-color, text-base-content->color,
    // relative->position, block->display, w-fit->width:fit-content,
    // px-4->padding-inline:1rem, py-2->padding-block:0.5rem,
    // absolute->position:absolute, bottom-0->bottom:0, h-3/w-3->0.75rem.
    out.push([
      key("chat-bubble"),
      [
        {
          "border-radius": "var(--radius-field)",
          "background-color": "var(--color-base-300)",
          color: "var(--color-base-content)",
          position: "relative",
          display: "block",
          width: "fit-content",
          "padding-inline": "1rem",
          "padding-block": "0.5rem",
          "grid-row-end": "3",
          "min-height": "2rem",
          "min-width": "2.5rem",
          "max-width": "90%",
        },
        "__daisy-chat-bubble-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // Bubble colors, upstream layer daisyui.l1.l2 -> daisy-l2. All flat.
    // Expanded: bg-X->background-color, text-X-content->color.
    const bubbleColors: Array<[string, string, string]> = [
      [
        "chat-bubble-primary",
        "var(--color-primary)",
        "var(--color-primary-content)",
      ],
      [
        "chat-bubble-secondary",
        "var(--color-secondary)",
        "var(--color-secondary-content)",
      ],
      [
        "chat-bubble-accent",
        "var(--color-accent)",
        "var(--color-accent-content)",
      ],
      [
        "chat-bubble-neutral",
        "var(--color-neutral)",
        "var(--color-neutral-content)",
      ],
      ["chat-bubble-info", "var(--color-info)", "var(--color-info-content)"],
      [
        "chat-bubble-success",
        "var(--color-success)",
        "var(--color-success-content)",
      ],
      [
        "chat-bubble-warning",
        "var(--color-warning)",
        "var(--color-warning-content)",
      ],
      ["chat-bubble-error", "var(--color-error)", "var(--color-error-content)"],
    ];
    for (const [name, bg, fg] of bubbleColors) {
      out.push([
        key(name),
        [{ "background-color": bg, color: fg }],
        { layer: "daisy-l2" },
      ]);
    }
    // Slots, upstream layer daisyui.l1.l2.l3 -> daisy-l3. All flat.
    // Expanded: row-span-2->grid-row:span 2/span 2, self-end->align-self:flex-end,
    // row-start-1/3->grid-row-start, flex->display:flex, gap-1->gap:0.25rem.
    out.push([
      key("chat-image"),
      [{ "grid-row": "span 2/span 2", "align-self": "flex-end" }],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("chat-header"),
      [
        {
          "grid-row-start": "1",
          display: "flex",
          gap: "0.25rem",
          "font-size": "0.6875rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("chat-footer"),
      [
        {
          "grid-row-start": "3",
          display: "flex",
          gap: "0.25rem",
          "font-size": "0.6875rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── checkbox ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/checkbox.css
  if (shouldInclude("checkbox", opts.include, opts.exclude)) {
    // .checkbox base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // &:before glyph -> __daisy-checkbox-nested;
    // :focus-visible/:checked/:indeterminate (+ forced-colors/print) states ->
    // __daisy-checkbox-state (daisy-l1); :disabled -> same companion block.
    // Expanded: text-base-content->color, rounded-selector->border-radius,
    // relative->position, inline-block->display, shrink-0->flex-shrink:0,
    // cursor-pointer->cursor, appearance-none->appearance, p-1->padding:0.25rem,
    // align-middle->vertical-align.
    out.push([
      key("checkbox"),
      [
        {
          border:
            "var(--border) solid var(--input-color, color-mix(in oklab, var(--color-base-content) 20%, #0000))",
          color: "var(--color-base-content)",
          "border-radius": "var(--radius-selector)",
          position: "relative",
          display: "inline-block",
          "flex-shrink": "0",
          cursor: "pointer",
          appearance: "none",
          padding: "0.25rem",
          "vertical-align": "middle",
          "box-shadow":
            "0 1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset, 0 0 #0000 inset, 0 0 #0000",
          transition: "background-color 0.2s, box-shadow 0.2s",
          "--size": "calc(var(--size-selector, 0.25rem) * 6)",
          width: "var(--size)",
          height: "var(--size)",
          "background-size": "auto, calc(var(--noise) * 100%)",
          "background-image": "none, var(--fx-noise)",
        },
        "__daisy-checkbox-nested",
        "__daisy-checkbox-state",
      ],
      { layer: "daisy-l3" },
    ]);
    // Color variants, upstream layer daisyui.l1.l2 -> daisy-l2. All flat.
    // Expanded: text-X-content->color.
    const checkboxColors: Array<[string, string, string]> = [
      [
        "checkbox-primary",
        "var(--color-primary-content)",
        "var(--color-primary)",
      ],
      [
        "checkbox-secondary",
        "var(--color-secondary-content)",
        "var(--color-secondary)",
      ],
      ["checkbox-accent", "var(--color-accent-content)", "var(--color-accent)"],
      [
        "checkbox-neutral",
        "var(--color-neutral-content)",
        "var(--color-neutral)",
      ],
      ["checkbox-info", "var(--color-info-content)", "var(--color-info)"],
      [
        "checkbox-success",
        "var(--color-success-content)",
        "var(--color-success)",
      ],
      [
        "checkbox-warning",
        "var(--color-warning-content)",
        "var(--color-warning)",
      ],
      ["checkbox-error", "var(--color-error-content)", "var(--color-error)"],
    ];
    for (const [name, fg, color] of checkboxColors) {
      out.push([
        key(name),
        [{ color: fg, "--input-color": color }],
        { layer: "daisy-l2" },
      ]);
    }
    // Sizes, upstream layer daisyui.l1.l2 -> daisy-l2. Flat var sets.
    // Expanded: p-[0.125rem]->padding:0.125rem, etc.
    const checkboxSizes: Array<[string, string, string]> = [
      ["checkbox-xs", "0.125rem", "4"],
      ["checkbox-sm", "0.1875rem", "5"],
      ["checkbox-md", "0.25rem", "6"],
      ["checkbox-lg", "0.3125rem", "7"],
      ["checkbox-xl", "0.375rem", "8"],
    ];
    for (const [name, pad, mul] of checkboxSizes) {
      out.push([
        key(name),
        [
          {
            padding: pad,
            "--size": `calc(var(--size-selector, 0.25rem) * ${mul})`,
          },
        ],
        { layer: "daisy-l2" },
      ]);
    }
  }

  // ─── collapse ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/collapse.css
  // NOTE: upstream defines no .collapse-close rule (close is behavior-only,
  // referenced via :not(.collapse-close)); no responsive variants either —
  // only prefers-reduced-motion media queries.
  if (shouldInclude("collapse", opts.include, opts.exclude)) {
    // .collapse base (selector .collapse:not(td, tr, colgroup)): outer unlayered
    // visibility folded in; inner block upstream layer daisyui.l1.l2.l3 ->
    // daisy-l3. Flat part only; grid/open/focus/details nests ->
    // __daisy-collapse-nested. Arrow/plus open-state bits (upstream l1.l2) live
    // with the collapse-arrow/collapse-plus public rules in rules/batch1.ts.
    out.push([
      key("collapse"),
      [
        {
          visibility: "revert-layer",
          display: "grid",
          position: "relative",
          "border-radius": "var(--radius-box, 1rem)",
          width: "100%",
          "grid-template-rows": "max-content 0fr",
          "grid-template-columns": "minmax(0, 1fr)",
          isolation: "isolate",
        },
        "__daisy-collapse-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .collapse-title, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    out.push([
      key("collapse-title"),
      [
        {
          "grid-column-start": "1",
          "grid-row-start": "1",
          position: "relative",
          width: "100%",
          padding: "1rem",
          "padding-inline-end": "3rem",
          "min-height": "1lh",
          transition: "background-color 0.2s ease-out",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .collapse-content, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part
    // only; @supports/media/details nests -> __daisy-collapse-content-nested.
    out.push([
      key("collapse-content"),
      [
        {
          "--overflow-delay": "0s",
          "content-visibility": "hidden",
          overflow: "clip",
          "grid-column-start": "1",
          "grid-row-start": "2",
          "min-height": "0",
          "padding-left": "1rem",
          "padding-right": "1rem",
          cursor: "unset",
        },
        "__daisy-collapse-content-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── countdown ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/countdown.css
  if (shouldInclude("countdown", opts.include, opts.exclude)) {
    // .countdown base: unlayered .countdown.countdown line-height folded in;
    // inner block upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // > * digit machinery -> __daisy-countdown-nested.
    // Expanded: inline-flex->display, invisible->visibility:hidden,
    // relative->position, inline-block->display, overflow-y-clip->overflow-y:clip,
    // visible->visibility:visible, absolute->position:absolute,
    // overflow-x-clip->overflow-x:clip.
    out.push([
      key("countdown"),
      [
        { "line-height": "1em", display: "inline-flex" },
        "__daisy-countdown-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── diff ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/diff.css
  // NOTE: the .diff root itself is upstream layer daisyui.l1.l2 -> daisy-l2
  // (unlike most component bases); items/resizer are daisyui.l1.l2.l3 -> daisy-l3.
  if (shouldInclude("diff", opts.include, opts.exclude)) {
    // .diff base, upstream layer daisyui.l1.l2 -> daisy-l2. Flat part only;
    // :focus-visible/:has/:hover + @supports nests -> __daisy-diff-nested.
    // Expanded: relative->position, grid->display, w-full->width:100%,
    // overflow-hidden->overflow:hidden, select-none->user-select:none,
    // outline-base-content->outline-color, outline-2->outline-width:2px +
    // outline-style:var(--tw-outline-style) (with solid fallback so the focus
    // ring works without Tailwind's @property registration),
    // outline-offset-1->outline-offset:1px.
    out.push([
      key("diff"),
      [
        {
          position: "relative",
          display: "grid",
          width: "100%",
          overflow: "hidden",
          "-webkit-user-select": "none",
          "user-select": "none",
          "align-items": "normal",
          "grid-template-rows": "1fr 1.8rem 1fr",
          direction: "ltr",
          "container-type": "inline-size",
          "grid-template-columns": "auto 1fr",
        },
        "__daisy-diff-nested",
      ],
      { layer: "daisy-l2" },
    ]);
    // .diff-resizer, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: relative->position, isolate->isolation:isolate, z-2->z-index:2,
    // col-start-1->grid-column-start:1, row-start-2->grid-row-start:2,
    // h-3->height:0.75rem, w-[50cqi]->width:50cqi,
    // max-w-[calc(100cqi-1rem)]->max-width, min-w-[1rem]->min-width:1rem,
    // resize-x->resize:horizontal, overflow-hidden->overflow:hidden,
    // opacity-0->opacity:0.
    out.push([
      key("diff-resizer"),
      [
        {
          position: "relative",
          isolation: "isolate",
          "z-index": "2",
          "grid-column-start": "1",
          "grid-row-start": "2",
          height: "0.75rem",
          width: "50cqi",
          "max-width": "calc(100cqi - 1rem)",
          "min-width": "1rem",
          resize: "horizontal",
          overflow: "hidden",
          opacity: "0",
          transform: "scaleY(5) translate(0.32rem, 50%)",
          cursor: "ew-resize",
          "transform-origin": "100% 100%",
          "clip-path": "inset(calc(100% - 0.75rem) 0 0 calc(100% - 0.75rem))",
          transition: "min-width 0.3s ease-out, max-width 0.3s ease-out",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .diff-item-2, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // &:after knob + > * + @supports nests -> __daisy-diff-item-2-nested.
    // Expanded: relative->position, col-start-1->grid-column-start,
    // row-span-3->grid-row:span 3/span 3, row-start-1->grid-row-start:1,
    // bg-base-100/98->background-color:color-mix 98%, pointer-events-none,
    // absolute->position, top-1/2->top:50%, right-px->right:1px, bottom-0,
    // z-2->z-index:2, rounded-full->border-radius:calc(infinity * 1px),
    // top-0/bottom-0/left-0, h-full->height:100%, w-[100cqi], max-w-none,
    // object-cover->object-fit:cover, object-center->object-position:center.
    out.push([
      key("diff-item-2"),
      [
        {
          position: "relative",
          "grid-column-start": "1",
          // Compiled form (LightningCSS merges row-start into the span).
          "grid-row": "1/span 3",
        },
        "__daisy-diff-item-2-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .diff-item-1, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :focus-visible + > * nests -> __daisy-diff-item-1-nested.
    // Expanded: outline-none->outline-style:none (+ --tw-outline-style:none
    // assignment, matching Tailwind v4's outline-none expansion).
    out.push([
      key("diff-item-1"),
      [
        {
          position: "relative",
          "z-index": "1",
          "grid-column-start": "1",
          // Compiled form (LightningCSS merges row-start into the span).
          "grid-row": "1/span 3",
          overflow: "hidden",
          "border-right": "2px solid var(--color-base-100)",
          "box-shadow": "0 0 0 2px #0000002a",
        },
        "__daisy-diff-item-1-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  return out;
}
