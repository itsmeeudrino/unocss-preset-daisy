import type { Preset, StaticShortcut } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 2 (11 components:
// divider, dock, drawer, dropdown, fab, fieldset, fileinput, filter, footer,
// hero, hover3d). Static, flat, single-selector classes live here as Uno
// shortcuts. Rule: upstream at-apply utilities are expanded to raw CSS
// declarations inline (verified byte-for-byte against /tmp/daisy-ref.css,
// the compiled upstream daisyui.css). No at-apply directives remain.
// Nested selectors (pseudo-elements, combinators, :hover/:focus states, media
// queries) cannot be expressed as shortcut objects (Uno merges a shortcut
// into one selector), so they live as companion internal rules in
// src/rules/batch2.ts and are referenced by token from the base shortcuts.
// Layer intent follows the upstream @layer annotation verbatim:
// daisyui.l1.l2.l3 -> `daisy-l3`, .l1.l2 -> `daisy-l2`, .l1 -> `daisy-l1`,
// bare daisyui -> `daisy-l1`.
// Numeric values keep leading zeros (0.5rem, not .5rem) so applyPrefix()
// never corrupts them; see report for the pre-existing decimal caveat.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch2Shortcuts(opts: Ctx): Exclude<Preset["shortcuts"], undefined> {
  const out: StaticShortcut[] = [];
  // Shortcut key: plain class name with prefix. Selector strings go through applyPrefix.
  const key = (name: string): string => `${opts.prefix}${name}`;
  void applyPrefix;

  // ─── divider ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/divider.css
  if (shouldInclude("divider", opts.include, opts.exclude)) {
    // .divider base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :before/:after, print border, :not(:empty) gap -> __daisy-divider-nested.
    // Expanded: flex->display:flex, h-4->height:1rem, flex-row->flex-direction:row,
    // items-center->align-items:center, self-stretch->align-self:stretch,
    // whitespace-nowrap->white-space:nowrap.
    out.push([
      key("divider"),
      [
        {
          display: "flex",
          height: "1rem",
          "flex-direction": "row",
          "align-items": "center",
          "align-self": "stretch",
          "white-space": "nowrap",
          margin: "var(--divider-m, 1rem 0)",
          "--divider-color":
            "color-mix(in oklab, var(--color-base-content) 10%, transparent)",
        },
        "__daisy-divider-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── dock ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/dock.css
  if (shouldInclude("dock", opts.include, opts.exclude)) {
    // .dock base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // item layout/hover/disabled/:after -> __daisy-dock-nested; the
    // [aria-current] indicator (upstream l1.l2) -> __daisy-dock-current.
    // Expanded: bg-base-100->background-color, fixed->position:fixed,
    // right-0/bottom-0/left-0->right/bottom/left:0, z-1->z-index:1,
    // flex->display:flex, w-full->width:100%, flex-row->flex-direction:row,
    // items-center->align-items:center, justify-around->justify-content:space-around,
    // p-2->padding:0.5rem, text-current->color:currentColor.
    out.push([
      key("dock"),
      [
        {
          position: "fixed",
          right: "0",
          bottom: "0",
          left: "0",
          "z-index": "1",
          display: "flex",
          width: "100%",
          "flex-direction": "row",
          "align-items": "center",
          "justify-content": "space-around",
          padding: "0.5rem",
          "padding-bottom": "env(safe-area-inset-bottom)",
          "background-color": "var(--color-base-100)",
          color: "currentColor",
          "border-top":
            "0.5px solid color-mix(in oklab, var(--color-base-content) 5%, #0000)",
        },
        "__daisy-dock-nested",
        "__daisy-dock-current",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── drawer ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/drawer.css
  if (shouldInclude("drawer", opts.include, opts.exclude)) {
    // .drawer base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: relative->position:relative, grid->display:grid.
    out.push([
      key("drawer"),
      [
        {
          position: "relative",
          display: "grid",
          width: "100%",
          "grid-auto-columns": "max-content auto",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .drawer-content, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: col-start-2->grid-column-start:2, row-start-1->grid-row-start:1,
    // min-w-0->min-width:0.
    out.push([
      key("drawer-content"),
      [
        {
          "grid-row-start": "1",
          "grid-column-start": "2",
          "min-width": "0",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .drawer-side, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :where() overflow clip, overlay, children, off-canvas translate ->
    // __daisy-drawer-side-nested.
    // Expanded: pointer-events-none->pointer-events:none, invisible->visibility:hidden,
    // fixed->position:fixed, start-0->inset-inline-start:0, top-0->top:0, z-10->z-index:10,
    // col-start-1/row-start-1, grid->display:grid, w-full->width:100%,
    // grid-cols-1->grid-template-columns:repeat(1, minmax(0, 1fr)),
    // grid-rows-1->grid-template-rows:repeat(1, minmax(0, 1fr)),
    // items-start->align-items:flex-start, justify-items-start->justify-items:start,
    // overscroll-contain->overscroll-behavior:contain, bg-transparent->background-color:#0000,
    // opacity-0->opacity:0.
    out.push([
      key("drawer-side"),
      [
        {
          "pointer-events": "none",
          visibility: "hidden",
          position: "fixed",
          "inset-inline-start": "0",
          top: "0",
          "z-index": "10",
          "grid-row-start": "1",
          "grid-column-start": "1",
          display: "grid",
          width: "100%",
          "grid-template-rows": "repeat(1, minmax(0, 1fr))",
          "grid-template-columns": "repeat(1, minmax(0, 1fr))",
          "align-items": "flex-start",
          "justify-items": "start",
          "overscroll-behavior": "contain",
          "background-color": "#0000",
          opacity: "0",
          transition:
            "opacity 0.2s ease-out 0.1s allow-discrete, visibility 0.3s ease-out 0.1s allow-discrete",
        },
        "__daisy-drawer-side-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .drawer-toggle, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :checked scrollbar/scroll-lock (l1.l2.l3) -> __daisy-drawer-toggle-l3;
    // :checked visibility + :focus-visible outline (l1.l2) -> __daisy-drawer-toggle-l2.
    // Expanded: fixed->position:fixed, h-0/w-0->height/width:0,
    // appearance-none->appearance:none, opacity-0->opacity:0.
    out.push([
      key("drawer-toggle"),
      [
        {
          position: "fixed",
          height: "0",
          width: "0",
          appearance: "none",
          opacity: "0",
        },
        "__daisy-drawer-toggle-l3",
        "__daisy-drawer-toggle-l2",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── dropdown ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/dropdown.css
  if (shouldInclude("dropdown", opts.include, opts.exclude)) {
    // .dropdown base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // focus outline, hidden/show states, transitions, details, popover ->
    // __daisy-dropdown-nested. The .dropdown-open/.dropdown-close/.dropdown-hover
    // alternatives live in their own public rules (partitioned, no duplication).
    // Expanded: relative->position:relative, inline-block->display:inline-block.
    out.push([
      key("dropdown"),
      [
        {
          position: "relative",
          display: "inline-block",
          "position-area": "var(--anchor-v, block-end) var(--anchor-h, span-inline-end)",
        },
        "__daisy-dropdown-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── fab ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fab.css
  if (shouldInclude("fab", opts.include, opts.exclude)) {
    // .fab base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // children, trigger, focus-within open, stagger delays -> __daisy-fab-nested.
    // .fab-close/.fab-main-action positioning and .fab-flower fan-out are
    // contextual public rules in batch2Rules.
    // Expanded: pointer-events-none->pointer-events:none, fixed->position:fixed,
    // end-4->inset-inline-end:1rem, bottom-4->bottom:1rem, z-999->z-index:999,
    // flex->display:flex, flex-col-reverse->flex-direction:column-reverse,
    // items-end->align-items:flex-end, gap-2->gap:0.5rem,
    // whitespace-nowrap->white-space:nowrap, select-none->user-select:none (+webkit).
    out.push([
      key("fab"),
      [
        {
          "pointer-events": "none",
          position: "fixed",
          "inset-inline-end": "1rem",
          bottom: "1rem",
          "z-index": "999",
          display: "flex",
          "flex-direction": "column-reverse",
          "align-items": "flex-end",
          gap: "0.5rem",
          "white-space": "nowrap",
          "-webkit-user-select": "none",
          "user-select": "none",
          "font-size": "0.875rem",
          "line-height": "1.25rem",
        },
        "__daisy-fab-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── fieldset ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fieldset.css
  if (shouldInclude("fieldset", opts.include, opts.exclude)) {
    // .fieldset base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: grid->display:grid, gap-1.5->gap:0.375rem, py-1->padding-block:0.25rem.
    out.push([
      key("fieldset"),
      [
        {
          display: "grid",
          gap: "0.375rem",
          "padding-block": "0.25rem",
          "font-size": "0.75rem",
          "grid-template-columns": "1fr",
          "grid-auto-rows": "max-content",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .fieldset-legend, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: text-base-content->color, -mb-1->margin-bottom:-0.25rem,
    // flex->display:flex, items-center->align-items:center,
    // justify-between->justify-content:space-between, gap-2->gap:0.5rem,
    // py-2->padding-block:0.5rem.
    out.push([
      key("fieldset-legend"),
      [
        {
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          gap: "0.5rem",
          "padding-block": "0.5rem",
          color: "var(--color-base-content)",
          "font-weight": "600",
          "margin-bottom": "-0.25rem",
          "margin-inline-end": "auto",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .fieldset-label, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :has(input) cursor -> __daisy-fieldset-label-nested.
    // Expanded: text-base-content/60->color-mix 60%, flex->display:flex,
    // items-center->align-items:center, gap-1.5->gap:0.375rem.
    out.push([
      key("fieldset-label"),
      [
        {
          display: "flex",
          "align-items": "center",
          gap: "0.375rem",
          color: "color-mix(in oklab, var(--color-base-content) 60%, transparent)",
        },
        "__daisy-fieldset-label-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── fileinput (.file-input) ──────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/fileinput.css
  // Include key is `fileinput` (file base name); the public class is `file-input`.
  if (shouldInclude("fileinput", opts.include, opts.exclude)) {
    // .file-input base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // ::file-selector-button + :focus -> __daisy-fileinput-nested;
    // :disabled states (upstream l1.l2) -> __daisy-fileinput-disabled.
    // Expanded: bg-base-100->background-color, inline-flex->display:inline-flex,
    // cursor-pointer->cursor:pointer, appearance-none->appearance:none,
    // items-center->align-items:center, align-middle->vertical-align:middle,
    // select-none->user-select:none (+webkit).
    out.push([
      key("file-input"),
      [
        {
          cursor: "pointer",
          border: "var(--border) solid #0000",
          appearance: "none",
          "background-color": "var(--color-base-100)",
          "vertical-align": "middle",
          "-webkit-user-select": "none",
          "user-select": "none",
          display: "inline-flex",
          "align-items": "center",
          width: "clamp(3rem, 20rem, 100%)",
          height: "var(--size)",
          "padding-inline-end": "0.75rem",
          "font-size": "0.875rem",
          "line-height": "2",
          "border-start-start-radius": "var(--join-ss, var(--radius-field))",
          "border-start-end-radius": "var(--join-se, var(--radius-field))",
          "border-end-start-radius": "var(--join-es, var(--radius-field))",
          "border-end-end-radius": "var(--join-ee, var(--radius-field))",
          "border-color": "var(--input-color)",
          "box-shadow":
            "0 1px color-mix(in oklab, var(--input-color) calc(var(--depth) * 10%), #0000) inset, 0 -1px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset",
          "--size": "calc(var(--size-field, 0.25rem) * 10)",
          "--input-color":
            "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
        },
        "__daisy-fileinput-nested",
        "__daisy-fileinput-disabled",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── filter ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/filter.css
  if (shouldInclude("filter", opts.include, opts.exclude)) {
    // .filter base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // radio/input/reset/margin children -> __daisy-filter-nested; the
    // :has(:checked) visibility collapse (upstream l1) -> __daisy-filter-state.
    // .filter-reset owns its own public rule (partitioned, no duplication).
    // Expanded: flex->display:flex, flex-wrap->flex-wrap:wrap.
    out.push([
      key("filter"),
      [
        {
          display: "flex",
          "flex-wrap": "wrap",
        },
        "__daisy-filter-nested",
        "__daisy-filter-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── footer ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/footer.css
  if (shouldInclude("footer", opts.include, opts.exclude)) {
    // .footer base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // child grid -> __daisy-footer-nested. Center/horizontal/vertical
    // (upstream l1.l2) are public rules in batch2Rules.
    // Expanded: grid->display:grid, w-full->width:100%, grid-flow-row->grid-auto-flow:row,
    // place-items-start->place-items:start, gap-x-4->column-gap:1rem,
    // gap-y-10->row-gap:2.5rem.
    out.push([
      key("footer"),
      [
        {
          display: "grid",
          width: "100%",
          "grid-auto-flow": "row",
          "place-items": "start",
          "column-gap": "1rem",
          "row-gap": "2.5rem",
          "font-size": "0.875rem",
          "line-height": "1.25rem",
        },
        "__daisy-footer-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .footer-title, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: mb-2->margin-bottom:0.5rem, uppercase->text-transform:uppercase,
    // opacity-60->opacity:0.6.
    out.push([
      key("footer-title"),
      [
        {
          "margin-bottom": "0.5rem",
          "text-transform": "uppercase",
          opacity: "0.6",
          "font-weight": "600",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── hero ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hero.css
  if (shouldInclude("hero", opts.include, opts.exclude)) {
    // .hero base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // stacked children -> __daisy-hero-nested.
    // Expanded: grid->display:grid, w-full->width:100%, place-items-center->place-items:center,
    // bg-cover->background-size:cover, bg-center->background-position:center.
    out.push([
      key("hero"),
      [
        {
          display: "grid",
          width: "100%",
          "place-items": "center",
          "background-size": "cover",
          "background-position": "center",
        },
        "__daisy-hero-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .hero-overlay, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: bg-neutral/50->color-mix 50%, col-start-1/row-start-1,
    // h-full/w-full->height/width:100%.
    out.push([
      key("hero-overlay"),
      [
        {
          "grid-row-start": "1",
          "grid-column-start": "1",
          width: "100%",
          height: "100%",
          "background-color":
            "color-mix(in oklab, var(--color-neutral) 50%, transparent)",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // .hero-content, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Fully flat.
    // Expanded: isolate->isolation:isolate, flex->display:flex,
    // max-w-[80rem]->max-width:80rem, items-center->align-items:center,
    // justify-center->justify-content:center, gap-4->gap:1rem, p-4->padding:1rem.
    out.push([
      key("hero-content"),
      [
        {
          isolation: "isolate",
          display: "flex",
          "max-width": "80rem",
          "align-items": "center",
          "justify-content": "center",
          gap: "1rem",
          padding: "1rem",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── hover3d (.hover-3d) ──────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hover3d.css
  // Include key is `hover3d` (file base name); the public class is `hover-3d`.
  // NOTE: upstream keeps the :hover/:has behavior in daisyui.l1.l2.l3, so the
  // whole behavior companion stays in daisy-l3 (states do NOT move to l1 here).
  if (shouldInclude("hover3d", opts.include, opts.exclude)) {
    // .hover-3d base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // children, shine, hover tilt, zone grid -> __daisy-hover3d-nested.
    out.push([
      key("hover-3d"),
      [
        {
          display: "inline-grid",
          perspective: "75rem",
          "--transform": "0, 0",
          "--shine": "100% 100%",
          "--shadow": "0rem 0rem 0rem",
          "--ease":
            "linear(0, 0.931 13.8%, 1.196 21.4%, 1.343 29.8%, 1.378 36%, 1.365 43.2%, 1.059 78%, 1)",
          filter:
            "drop-shadow(var(--shadow) 0.1rem #00000003) drop-shadow(var(--shadow) 0.2rem #00000003) drop-shadow(var(--shadow) 0.3rem #00000003) drop-shadow(var(--shadow) 0.4rem #00000003)",
          transition: "filter ease-out 400ms",
        },
        "__daisy-hover3d-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  return out;
}
