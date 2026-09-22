import type { StaticShortcut } from "unocss";
import { shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch 3 (11 components:
// hovergallery, indicator, kbd, label, link, list, loading, mask, megamenu,
// mockup, navbar).
// Static, flat, single-selector classes live here as Uno shortcuts.
// Rule: upstream at-apply utilities are expanded to raw CSS declarations inline
// (see tests/fixtures/apply-inventory.json for the utility list). No at-apply
// directives remain.
// Nested selectors (:hover/:focus/:has states, child selectors, ::before,
// [dir] blocks, media queries) cannot be expressed as shortcut objects (Uno
// merges a shortcut into one selector), so they live as companion internal
// rules in src/rules/batch3.ts and are referenced by token from the base
// shortcuts below.
// Layer intent is preserved via RuleMeta `layer` + per-block comments:
// upstream daisyui.l1.l2.l3 -> uno `daisy-l3`, .l1.l2 -> `daisy-l2`,
// .l1 -> `daisy-l1`, bare daisyui (outermost/lowest) -> `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

export function batch3Shortcuts(opts: Ctx): StaticShortcut[] {
  const out: StaticShortcut[] = [];
  // Shortcut key: plain class name with prefix.
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── hovergallery ─────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/hovergallery.css
  if (shouldInclude("hovergallery", opts.include, opts.exclude)) {
    // .hover-gallery base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat
    // declarations only; :is(figure), :has counts, >* grid columns and
    // >*:hover states -> __daisy-hovergallery-nested.
    out.push([
      key("hover-gallery"),
      [
        {
          "--items": "1",
          "grid-template-columns": "repeat(var(--items), 1fr)",
          width: "100%",
          gap: "1px",
          overflow: "hidden",
        },
        "__daisy-hovergallery-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── indicator ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/indicator.css
  if (shouldInclude("indicator", opts.include, opts.exclude)) {
    // .indicator base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part
    // only; :where(.indicator-item) positioning -> __daisy-indicator-item.
    // Expanded: relative->position:relative, inline-flex->display:inline-flex.
    out.push([
      key("indicator"),
      [
        {
          width: "max-content",
          display: "inline-flex",
          position: "relative",
        },
        "__daisy-indicator-item",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── kbd ──────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/kbd.css
  if (shouldInclude("kbd", opts.include, opts.exclude)) {
    // .kbd base, upstream layer daisyui.l1.l2.l3 -> daisy-l3 (plus outer
    // bare box-shadow:none folded in here).
    // Expanded: bg-base-200->background-color, text-base-content->color,
    // rounded-field->border-radius:var(--radius-field), inline-flex->display,
    // items-center->align-items, justify-center->justify-content,
    // align-middle->vertical-align, shrink-0->flex-shrink:0.
    out.push([
      key("kbd"),
      [
        {
          "box-shadow": "none",
          "border-radius": "var(--radius-field)",
          "background-color": "var(--color-base-200)",
          "vertical-align": "middle",
          color: "var(--color-base-content)",
          border:
            "var(--border) solid color-mix(in srgb, var(--color-base-content) 20%, #0000)",
          "border-bottom":
            "calc(var(--border) + 1px) solid color-mix(in srgb, var(--color-base-content) 20%, #0000)",
          "--size": "calc(var(--size-selector, 0.25rem) * 6)",
          height: "var(--size)",
          "min-width": "var(--size)",
          "flex-shrink": "0",
          "justify-content": "center",
          "align-items": "center",
          "padding-inline": "0.5em",
          "font-size": "0.875rem",
          display: "inline-flex",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── label ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/label.css
  if (shouldInclude("label", opts.include, opts.exclude)) {
    // .label base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :has(input) cursor + :is(.input>*,.select>*) first/last nests ->
    // __daisy-label-nested.
    // Expanded: inline-flex->display, items-center->align-items,
    // gap-1.5->gap:0.375rem, whitespace-nowrap->white-space:nowrap,
    // text-current/60->color:color-mix 60%.
    out.push([
      key("label"),
      [
        {
          display: "inline-flex",
          "align-items": "center",
          gap: "0.375rem",
          "white-space": "nowrap",
          color: "color-mix(in oklab, currentcolor 60%, transparent)",
        },
        "__daisy-label-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    // .floating-label base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat
    // part only; ::placeholder, >span, :focus-within/:has states ->
    // __daisy-floating-nested.
    // Expanded: relative->position:relative, flex->display:flex.
    out.push([
      key("floating-label"),
      [
        {
          display: "flex",
          position: "relative",
        },
        "__daisy-floating-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── link ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/link.css
  if (shouldInclude("link", opts.include, opts.exclude)) {
    // .link base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // :focus/:focus-visible -> __daisy-link-state.
    // Expanded: cursor-pointer->cursor:pointer, underline->text-decoration-line:underline.
    out.push([
      key("link"),
      [
        {
          cursor: "pointer",
          "text-decoration-line": "underline",
        },
        "__daisy-link-state",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── list ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/list.css
  if (shouldInclude("list", opts.include, opts.exclude)) {
    // .list base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part only;
    // .list-row grid + :after divider -> __daisy-list-nested.
    // Expanded: flex->display:flex, flex-col->flex-direction:column.
    out.push([
      key("list"),
      [
        {
          display: "flex",
          "flex-direction": "column",
          "font-size": "0.875rem",
        },
        "__daisy-list-nested",
        "__daisy-list-cols",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── loading ──────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/loading.css
  if (shouldInclude("loading", opts.include, opts.exclude)) {
    // .loading base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part
    // only (default spinner mask); prefers-reduced-motion override ->
    // __daisy-loading-motion.
    // Expanded: pointer-events-none->pointer-events:none,
    // inline-block->display:inline-block, aspect-square->aspect-ratio:1,
    // shrink-0->flex-shrink:0, bg-current->background-color:currentColor,
    // align-middle->vertical-align:middle.
    out.push([
      key("loading"),
      [
        {
          "pointer-events": "none",
          display: "inline-block",
          "aspect-ratio": "1",
          "flex-shrink": "0",
          "background-color": "currentColor",
          "vertical-align": "middle",
          width: "calc(var(--size-selector, 0.25rem) * 6)",
          "mask-size": "100%",
          "mask-repeat": "no-repeat",
          "mask-position": "center",
          "mask-image":
            "url(\"data:image/svg+xml,%3Csvg width='24' height='24' stroke='black' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform-origin='center'%3E%3Ccircle cx='12' cy='12' r='9.5' fill='none' stroke-width='3' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='8s' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-dasharray' values='0,150;42,150;42,150' keyTimes='0;0.475;1' dur='6s' repeatCount='indefinite'/%3E%3Canimate attributeName='stroke-dashoffset' values='0;-16;-59' keyTimes='0;0.475;1' dur='6s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/g%3E%3C/svg%3E\")",
        },
        "__daisy-loading-motion",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── mask ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/mask.css
  if (shouldInclude("mask", opts.include, opts.exclude)) {
    // .mask base, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: inline-block->display:inline-block,
    // align-middle->vertical-align:middle.
    // NOTE: `mask-position:center` is kept source-verbatim; the compiled
    // daisyui.css normalizes it to `50%` (lightningcss). Computed-identical.
    out.push([
      key("mask"),
      [
        {
          display: "inline-block",
          "vertical-align": "middle",
          "mask-size": "contain",
          "mask-repeat": "no-repeat",
          "mask-position": "center",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    // Shape variants, upstream layer daisyui.l1.l2 -> daisy-l2. All flat
    // mask-image data URLs, kept verbatim.
    const shapes: Array<[string, string]> = [
      [
        "mask-squircle",
        "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M100 0C20 0 0 20 0 100s20 100 100 100 100-20 100-100S180 0 100 0Z'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-decagon",
        "url(\"data:image/svg+xml,%3csvg width='192' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 0 58.779 19.098 36.327 50v61.804l-36.327 50L96 200l-58.779-19.098-36.327-50V69.098l36.327-50z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-diamond",
        "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m100 0 100 100-100 100L0 100z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-heart",
        "url(\"data:image/svg+xml,%3csvg width='200' height='185' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M100 184.606a15.384 15.384 0 0 1-8.653-2.678C53.565 156.28 37.205 138.695 28.182 127.7 8.952 104.264-.254 80.202.005 54.146.308 24.287 24.264 0 53.406 0c21.192 0 35.869 11.937 44.416 21.879a2.884 2.884 0 0 0 4.356 0C110.725 11.927 125.402 0 146.594 0c29.142 0 53.098 24.287 53.4 54.151.26 26.061-8.956 50.122-28.176 73.554-9.023 10.994-25.383 28.58-63.165 54.228a15.384 15.384 0 0 1-8.653 2.673Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-hexagon",
        "url(\"data:image/svg+xml,%3csvg width='182' height='201' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M.3 65.486c0-9.196 6.687-20.063 14.211-25.078l61.86-35.946c8.36-5.016 20.899-5.016 29.258 0l61.86 35.946c8.36 5.015 14.211 15.882 14.211 25.078v71.055c0 9.196-6.687 20.063-14.211 25.079l-61.86 35.945c-8.36 4.18-20.899 4.18-29.258 0L14.51 161.62C6.151 157.44.3 145.737.3 136.54V65.486Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-hexagon-2",
        "url(\"data:image/svg+xml,%3csvg width='200' height='182' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M64.786 181.4c-9.196 0-20.063-6.687-25.079-14.21L3.762 105.33c-5.016-8.36-5.016-20.9 0-29.259l35.945-61.86C44.723 5.851 55.59 0 64.786 0h71.055c9.196 0 20.063 6.688 25.079 14.211l35.945 61.86c4.18 8.36 4.18 20.899 0 29.258l-35.945 61.86c-4.18 8.36-15.883 14.211-25.079 14.211H64.786Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-circle",
        "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle fill='black' cx='100' cy='100' r='100' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-pentagon",
        "url(\"data:image/svg+xml,%3csvg width='192' height='181' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 0 95.106 69.098-36.327 111.804H37.22L.894 69.098z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-star",
        "url(\"data:image/svg+xml,%3csvg width='192' height='180' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 137.263-58.779 42.024 22.163-68.389L.894 68.481l72.476-.243L96 0l22.63 68.238 72.476.243-58.49 42.417 22.163 68.389z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-star-2",
        "url(\"data:image/svg+xml,%3csvg width='192' height='180' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 153.044-58.779 26.243 7.02-63.513L.894 68.481l63.117-13.01L96 0l31.989 55.472 63.117 13.01-43.347 47.292 7.02 63.513z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-triangle",
        "url(\"data:image/svg+xml,%3csvg width='174' height='149' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m87 148.476-86.603.185L43.86 74.423 87 0l43.14 74.423 43.463 74.238z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-triangle-2",
        "url(\"data:image/svg+xml,%3csvg width='174' height='150' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m87 .738 86.603-.184-43.463 74.238L87 149.214 43.86 74.792.397.554z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-triangle-3",
        "url(\"data:image/svg+xml,%3csvg width='150' height='174' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m149.369 87.107.185 86.603-74.239-43.463L.893 87.107l74.422-43.14L149.554.505z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
      [
        "mask-triangle-4",
        "url(\"data:image/svg+xml,%3csvg width='150' height='174' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='M.631 87.107.446.505l74.239 43.462 74.422 43.14-74.422 43.14L.446 173.71z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
      ],
    ];
    for (const [name, image] of shapes) {
      out.push([key(name), [{ "mask-image": image }], { layer: "daisy-l2" }]);
    }
  }

  // ─── megamenu ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/megamenu.css
  if (shouldInclude("megamenu", opts.include, opts.exclude)) {
    // .megamenu base, upstream layer daisyui.l1.l2.l3 -> daisy-l3. Flat part
    // only; [popovertarget]/[popover]/:has/active-position nests ->
    // __daisy-megamenu-nested; &:popover-open mobile layout (upstream l1) ->
    // __daisy-megamenu-popover.
    // Expanded: relative->position, flex->display, items-center->align-items,
    // overflow-visible->overflow:visible.
    out.push([
      key("megamenu"),
      [
        {
          position: "relative",
          display: "flex",
          "align-items": "center",
          overflow: "visible",
          width: "unset",
          "background-color": "transparent",
          "border-radius": "calc(var(--radius-field) + var(--border))",
          "--mm-anchor": "--mm1",
          "--size": "calc(var(--size-field, 0.25rem) * 10)",
        },
        "__daisy-megamenu-nested",
        "__daisy-megamenu-popover",
      ],
      { layer: "daisy-l3" },
    ]);
    // .megamenu-active base, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: bg-base-content/10->background-color:color-mix 10%,
    // pointer-events-none->pointer-events:none, absolute->position:absolute.
    out.push([
      key("megamenu-active"),
      [
        {
          "background-color":
            "color-mix(in oklab, var(--color-base-content) 10%, transparent)",
          "pointer-events": "none",
          position: "absolute",
          "border-radius": "var(--radius-field)",
          transition:
            "inset 300ms linear(0, 0.5 10%, 0.9 30%, 1.05 50%, 1.1 75%, 1), background-color 200ms ease-out",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── mockup ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/mockup.css
  // (covers mockup-browser/code/phone/window variants).
  if (shouldInclude("mockup", opts.include, opts.exclude)) {
    // Flat parts only; :before/pre/toolbar/supports/img nests ->
    // __daisy-mockup-*-nested companions in rules.
    // Expanded per variant below (bg-neutral->background-color,
    // text-neutral-content->color, rounded-box->border-radius,
    // relative->position, overflow-hidden->overflow:hidden,
    // overflow-x-auto->overflow-x:auto, py-5->padding-block:1.25rem,
    // pt-5->padding-top:1.25rem, flex/flex-col/inline-grid etc).
    out.push([
      key("mockup-code"),
      [
        {
          "background-color": "var(--color-neutral)",
          color: "var(--color-neutral-content)",
          "border-radius": "var(--radius-box)",
          position: "relative",
          overflow: "hidden",
          "overflow-x": "auto",
          "padding-block": "1.25rem",
          "font-size": "0.875rem",
          direction: "ltr",
        },
        "__daisy-mockup-code-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("mockup-window"),
      [
        {
          "border-radius": "var(--radius-box)",
          position: "relative",
          display: "flex",
          "flex-direction": "column",
          overflow: "hidden",
          "overflow-x": "auto",
          "padding-top": "1.25rem",
        },
        "__daisy-mockup-window-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("mockup-browser"),
      [
        {
          "border-radius": "var(--radius-box)",
          position: "relative",
          overflow: "hidden",
          "overflow-x": "auto",
        },
        "__daisy-mockup-browser-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("mockup-phone"),
      [
        {
          display: "inline-grid",
          "justify-items": "center",
          border: "5px solid #6b6b6b",
          "border-radius": "65px",
          "background-color": "#000",
          padding: "6px",
          overflow: "hidden",
          width: "100%",
          "max-width": "462px",
          "aspect-ratio": "462 / 978",
        },
        "__daisy-mockup-phone-nested",
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("mockup-phone-camera"),
      [
        {
          "grid-column": "1 / 1",
          "grid-row": "1 / 1",
          background: "#000",
          height: "3.7%",
          width: "28%",
          "border-radius": "17px",
          "z-index": "1",
          "margin-top": "3%",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("mockup-phone-display"),
      [
        {
          "border-radius": "54px",
          "grid-column": "1 / 1",
          "grid-row": "1 / 1",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        },
        "__daisy-mockup-display-nested",
      ],
      { layer: "daisy-l3" },
    ]);
  }

  // ─── navbar ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/navbar.css
  if (shouldInclude("navbar", opts.include, opts.exclude)) {
    // .navbar base, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: flex->display:flex, w-full->width:100%,
    // items-center->align-items:center.
    out.push([
      key("navbar"),
      [
        {
          display: "flex",
          width: "100%",
          "align-items": "center",
          padding: "0.5rem",
          "min-height": "4rem",
        },
        "__daisy-navbar-where",
      ],
      { layer: "daisy-l3" },
    ]);
    // Sections, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: inline-flex->display:inline-flex,
    // items-center->align-items:center, shrink-0->flex-shrink:0.
    out.push([
      key("navbar-start"),
      [
        {
          display: "inline-flex",
          "align-items": "center",
          width: "50%",
          "justify-content": "flex-start",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("navbar-center"),
      [
        {
          display: "inline-flex",
          "align-items": "center",
          "flex-shrink": "0",
        },
      ],
      { layer: "daisy-l3" },
    ]);
    out.push([
      key("navbar-end"),
      [
        {
          display: "inline-flex",
          "align-items": "center",
          width: "50%",
          "justify-content": "flex-end",
        },
      ],
      { layer: "daisy-l3" },
    ]);
  }

  return out;
}
