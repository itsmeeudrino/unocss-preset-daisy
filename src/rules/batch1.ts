import type { Preset, StaticRule } from "unocss";
import { applyPrefix, shouldInclude } from "../options.ts";

// Port of packages/daisyui/src/components/*.css — P3 batch-1 (11 components):
// alert, aura, avatar, breadcrumbs, calendar, carousel, chat, checkbox,
// collapse, countdown, diff.
// Dynamic, sized and stateful classes live here as Uno rules.
// Two rule kinds:
//  1. Internal companion rules (`__daisy-*`, `internal: true`): nested/state CSS for a
//     base class. They never match user code directly; the base shortcut in
//     src/shortcuts/batch1.ts references them by token so they emit together
//     with the base (Uno merges a shortcut into a single selector, so :hover and
//     friends cannot live in the shortcut object itself).
//  2. Public rules: modifier/variant classes with nested CSS (chat-start,
//     collapse-arrow, pika-single, ...) and standalone state classes. Anything
//     with nested selectors is a raw CSS string (static rule with a string body
//     emits it verbatim, preserving &, media queries and supports blocks as
//     modern CSS nesting).
// Upstream at-apply utilities are expanded to raw CSS inline (verified against
// /tmp/daisy-ref.css). No at-apply remains.
// Selector strings go through applyPrefix(); keyframes names are left unprefixed.
// Layer intent per block in comments: daisyui.l1.l2.l3 -> `daisy-l3`,
// .l1.l2 -> `daisy-l2`, bare daisyui (outermost/lowest) -> `daisy-l1`.

interface Ctx {
  prefix: string;
  include: string[];
  exclude: string[];
}

// Bulk calendar CSS (cally/react-day-picker/pikaday/vanilla-calendar nests) is
// stored unprefixed below and prefixed at preset-generation time. Only selector
// positions are rewritten: declarations (0.5rem, oklch(...), url(...)) and
// comments are copied verbatim. Mini port of upstream addPrefix.js (which uses
// postcss; this scanner is enough for the calendar subset: no dots appear in
// its attribute values or at-rule preludes).
function prefixSelectorSegment(seg: string, prefix: string): string {
  return seg
    .split(/(\/\*[\s\S]*?\*\/)/g)
    .map((span, i) => {
      if (i % 2 === 1) return span;
      return span
        .split(/("[^"]*"|'[^']*')/g)
        .map((p, j) => (j % 2 === 0 ? applyPrefix(p, prefix) : p))
        .join("");
    })
    .join("");
}

function prefixSelectors(css: string, prefix: string): string {
  if (!prefix) return css;
  let out = "";
  let segStart = 0;
  let i = 0;
  const n = css.length;
  while (i < n) {
    const ch = css[i];
    if (ch === '"' || ch === "'") {
      const q = ch;
      i++;
      while (i < n && css[i] !== q) {
        if (css[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      const j = css.indexOf("*/", i + 2);
      i = j === -1 ? n : j + 2;
      continue;
    }
    if (ch === "{") {
      const seg = css.slice(segStart, i);
      const bare = seg.replace(/\/\*[\s\S]*?\*\//g, "").trimStart();
      out +=
        (bare.startsWith("@") ? seg : prefixSelectorSegment(seg, prefix)) + "{";
      segStart = i + 1;
      i++;
      continue;
    }
    if (ch === ";" || ch === "}") {
      out += css.slice(segStart, i + 1);
      segStart = i + 1;
      i++;
      continue;
    }
    i++;
  }
  out += css.slice(segStart);
  return out;
}

// ─── calendar bulk CSS (verbatim from upstream calendar.css, §cally) ─────────
// Nested rules only (the flat root font-size lives in shortcuts/batch1.ts);
// top-level selectors pre-qualified with the root during extraction.
const CALLY_NESTED = `.cally::part(container) {
      padding: 0.5rem 1rem;
      user-select: none;
    }
.cally ::part(th) {
      font-weight: 400;
      block-size: auto;
    }
.cally::part(header) {
      direction: ltr;
    }
.cally ::part(head) {
      opacity: 0.5;
      font-size: 0.7rem;
    }
.cally::part(button) {
      border-radius: var(--radius-field);
      border: none;
      padding: 0.5rem;
      background: 0 0;
    }
.cally::part(button):hover {
      background: var(--color-base-200);
    }
.cally ::part(day) {
      border-radius: var(--radius-field);
      font-size: 0.7rem;
    }
.cally ::part(day):hover {
      background: var(--color-base-200);
    }
/* \`:not()\` can't follow \`::part()\` and part names can't be negated, so
       today/selected re-assert their background on hover instead.
       These can't be nested as \`&:hover\` either: \`&\` is equivalent to
       \`:is(...)\`, which can't contain a pseudo-element, so the nested form
       never matches. */
    .cally ::part(button day today) {
      background: var(--color-primary);
      color: var(--color-primary-content);
    }
.cally ::part(button day today):hover {
      background: var(--color-primary);
    }
.cally ::part(selected) {
      color: var(--color-base-100);
      background: var(--color-base-content);
      border-radius: var(--radius-field);
    }
.cally ::part(selected):hover {
      background: var(--color-base-content);
    }
.cally ::part(range-inner) {
      border-radius: 0;
    }
.cally ::part(range-start) {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }
.cally ::part(range-end) {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
.cally ::part(range-start range-end) {
      border-radius: var(--radius-field);
    }
.cally calendar-month {
      width: 100%;
    }
`;

// ─── calendar bulk CSS (upstream calendar.css, §react-day-picker) ────────────
const RDP_NESTED = `.react-day-picker[dir="rtl"] {
      .rdp-nav {
        .rdp-chevron {
          transform-origin: 50%;
          transform: rotate(180deg);
        }
      }
    }
.react-day-picker * {
      box-sizing: border-box;
    }
.react-day-picker .rdp-day {
      width: 2.25rem;
      height: 2.25rem;
      text-align: center;
    }
.react-day-picker .rdp-day_button {
      cursor: pointer;
      font: inherit;
      color: inherit;
      width: 2.25rem;
      height: 2.25rem;
      border: 2px solid #0000;
      border-radius: var(--radius-field);
      background: 0 0;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      display: flex;
      &:disabled {
        cursor: revert;
      }
      &:hover {
        background-color: var(--color-base-200);
      }
      &:disabled:hover,
      &[aria-disabled="true"]:hover {
        background-color: transparent;
        cursor: not-allowed;
      }
    }
.react-day-picker .rdp-caption_label {
      z-index: 1;
      white-space: nowrap;
      border: 0;
      align-items: center;
      display: inline-flex;
      position: relative;
    }
.react-day-picker .rdp-button_next {
      border-radius: var(--radius-field);
      &:hover {
        background-color: var(--color-base-200);
      }
    }
.react-day-picker .rdp-button_previous {
      border-radius: var(--radius-field);
      &:hover {
        background-color: var(--color-base-200);
      }
    }
.react-day-picker .rdp-button_next, .react-day-picker .rdp-button_previous {
      cursor: pointer;
      font: inherit;
      color: inherit;
      appearance: none;
      width: 2.25rem;
      height: 2.25rem;
      background: 0 0;
      border: none;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      display: inline-flex;
      position: relative;

      &:disabled,
      &[aria-disabled="true"] {
        cursor: revert;
        opacity: 0.5;
      }

      &:disabled:hover,
      &[aria-disabled="true"]:hover {
        background-color: transparent;
      }
    }
.react-day-picker .rdp-chevron {
      fill: var(--color-base-content);
      width: 1rem;
      height: 1rem;
      display: inline-block;
    }
.react-day-picker .rdp-dropdowns {
      align-items: center;
      gap: 0.5rem;
      display: inline-flex;
      position: relative;
    }
.react-day-picker .rdp-dropdown {
      z-index: 2;
      opacity: 0;
      appearance: none;
      cursor: inherit;
      line-height: inherit;
      border: none;
      width: 100%;
      margin: 0;
      padding: 0;
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      &:focus-visible {
        ~ .rdp-caption_label {
          outline: 5px auto highlight;
          outline: 5px auto -webkit-focus-ring-color;
        }
      }
    }
.react-day-picker .rdp-dropdown_root {
      align-items: center;
      display: inline-flex;
      position: relative;
      &[data-disabled="true"] {
        .rdp-chevron {
          opacity: 0.5;
        }
      }
    }
.react-day-picker .rdp-month_caption {
      height: 2.75rem;
      font-size: 0.75rem;
      font-weight: inherit;
      place-content: center;
      display: flex;
    }
.react-day-picker .rdp-months {
      gap: 2rem;
      flex-wrap: wrap;
      max-width: fit-content;
      padding: 0.5rem;
      display: flex;
      position: relative;
    }
.react-day-picker .rdp-month_grid {
      border-collapse: collapse;
    }
.react-day-picker .rdp-nav {
      height: 2.75rem;
      inset-block-start: 0;
      inset-inline-end: 0;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-inline: 0.5rem;
      display: flex;
      position: absolute;
      top: 0.25rem;
    }
.react-day-picker .rdp-weekday {
      opacity: 0.6;
      padding: 0.5rem 0rem;
      text-align: center;
      font-size: smaller;
      font-weight: 500;
    }
.react-day-picker .rdp-week_number {
      opacity: 0.6;
      height: 2.25rem;
      width: 2.25rem;
      border: none;
      border-radius: 100%;
      text-align: center;
      font-size: small;
      font-weight: 400;
    }
.react-day-picker .rdp-today:not(.rdp-outside) {
      .rdp-day_button {
        background: var(--color-primary);
        color: var(--color-primary-content);
      }
    }
.react-day-picker .rdp-selected {
      font-weight: inherit;
      font-size: 0.75rem;
      .rdp-day_button {
        color: var(--color-base-100);
        background-color: var(--color-base-content);
        border-radius: var(--radius-field);
        border: none;
        &:hover {
          background-color: var(--color-base-content);
        }
      }
    }
.react-day-picker .rdp-outside {
      opacity: 0.75;
    }
.react-day-picker .rdp-disabled {
      opacity: 0.5;
    }
.react-day-picker .rdp-hidden {
      visibility: hidden;
      color: var(--color-base-content);
    }
.react-day-picker .rdp-range_start {
      .rdp-day_button {
        border-radius: var(--radius-field) 0 0 var(--radius-field);
      }
    }
.react-day-picker .rdp-range_start .rdp-day_button {
      background-color: var(--color-base-content);
      color: var(--color-base-100);
    }
.react-day-picker .rdp-range_middle {
      background-color: var(--color-base-200);
    }
.react-day-picker .rdp-range_middle .rdp-day_button {
      border: unset;
      border-radius: unset;
      color: inherit;
      background-color: transparent;
      &:hover {
        background-color: transparent;
      }
    }
.react-day-picker .rdp-range_end {
      color: var(--color-base-content);
      .rdp-day_button {
        border-radius: 0 var(--radius-field) var(--radius-field) 0;
      }
    }
.react-day-picker .rdp-range_end .rdp-day_button {
      background-color: var(--color-base-content);
      color: var(--color-base-100);
    }
.react-day-picker .rdp-range_start.rdp-range_end {
      background: revert;
    }
.react-day-picker .rdp-focusable {
      cursor: pointer;
    }
.react-day-picker .rdp-footer {
      border-top: var(--border) solid var(--color-base-200);
      padding: 0.5rem;
    }
`;

// ─── calendar bulk CSS (upstream calendar.css, §pikaday) ────────────────────
const PIKA_BLOCK = `.pika-single:is(div) {
      user-select: none;
      font-size: 0.75rem;
      z-index: 999;
      display: inline-block;
      position: relative;
      color: var(--color-base-content);
      background-color: var(--color-base-100);
      border-radius: var(--radius-box);
      border: var(--border) solid var(--color-base-200);
      padding: 0.5rem;
      &:before,
      &:after {
        content: "";
        display: table;
      }
      &:after {
        clear: both;
      }

      &.is-hidden {
        display: none;
      }

      &.is-bound {
        position: absolute;
      }

      .pika-lendar {
        float: left;
      }

      .pika-title {
        position: relative;
        text-align: center;
      }

      .pika-label {
        display: inline-block;
        position: relative;
        z-index: 999;
        overflow: hidden;
        margin: 0;
        padding: 5px 3px;
        background-color: var(--color-base-100);
      }
      .pika-title {
        select {
          cursor: pointer;
          position: absolute;
          z-index: 999;
          margin: 0;
          left: 0;
          top: 5px;
          opacity: 0;
        }
      }

      & .pika-prev,
      & .pika-next {
        display: block;
        cursor: pointer;
        position: absolute;
        top: 0;
        outline: none;
        border: 0;
        width: 2.25rem;
        height: 2.25rem;
        color: #0000;
        font-size: 1.2em;
        border-radius: var(--radius-field);
        &:hover {
          background-color: var(--color-base-200);
        }
        &.is-disabled {
          cursor: default;
          opacity: 0.2;
        }
        &:before {
          display: inline-block;
          width: 2.25rem;
          height: 2.25rem;
          line-height: 2.25;
          color: var(--color-base-content);
        }
      }
      .pika-prev {
        left: 0;
        &:before {
          --tw-content: "‹";
          content: var(--tw-content);
        }
      }

      .pika-next {
        right: 0;
        &:before {
          --tw-content: "›";
          content: var(--tw-content);
        }
      }

      .pika-select {
        display: inline-block;
      }

      .pika-table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        border: 0;
      }
      .pika-table {
        & th,
        & td {
          padding: 0;
        }
        th {
          opacity: 0.6;
          text-align: center;
          width: 2.25rem;
          height: 2.25rem;
        }
      }

      .pika-button {
        cursor: pointer;
        display: block;
        outline: none;
        border: 0;
        margin: 0;
        width: 2.25rem;
        height: 2.25rem;
        padding: 5px;
        text-align: right;
        text-align: center;
      }

      .pika-week {
        color: var(--color-base-content);
      }

      .is-today {
        .pika-button {
          background: var(--color-primary);
          color: var(--color-primary-content);
        }
      }
      & .is-selected,
      & .has-event {
        .pika-button {
          &,
          &:hover {
            color: var(--color-base-100);
            background-color: var(--color-base-content);
            border-radius: var(--radius-field);
          }
        }
      }

      .has-event {
        .pika-button {
          background: var(--color-primary);
        }
      }

      & .is-disabled,
      & .is-inrange {
        .pika-button {
          background: var(--color-base-200);
        }
      }

      .is-startrange {
        .pika-button {
          color: var(--color-base-100);
          background: var(--color-base-content);
          border-radius: var(--radius-field);
        }
      }

      .is-endrange {
        .pika-button {
          color: var(--color-base-100);
          background: var(--color-base-content);
          border-radius: var(--radius-field);
        }
      }

      .is-disabled {
        .pika-button {
          pointer-events: none;
          cursor: default;
          color: var(--color-base-content);
          opacity: 0.3;
        }
      }

      .is-outside-current-month {
        .pika-button {
          color: var(--color-base-content);
          opacity: 0.3;
        }
      }

      .is-selection-disabled {
        pointer-events: none;
        cursor: default;
      }

      & .pika-button:hover,
      & .pika-row.pick-whole-week:hover .pika-button {
        color: var(--color-base-content);
        background-color: var(--color-base-200);
        border-radius: var(--radius-field);
      }
      .pika-table abbr {
        text-decoration: none;
        font-weight: 400;
      }
    }
`;

// ─── calendar bulk CSS (upstream calendar.css, §vanilla-calendar) ────────────
const VC_NESTED = `.vc:focus-visible, .vc button:focus-visible, .vc [tabindex="0"]:focus-visible {
      border-radius: var(--radius-field);
      outline: 1px solid var(--color-primary);
      outline-offset: -1px;
    }
.vc[data-vc-calendar-hidden] {
      pointer-events: none;
      opacity: 0;
      * {
        pointer-events: none!important;
      }
    }
.vc[data-vc-input] {
      position: absolute;
      box-shadow: 0 9px 20px color-mix(in oklab, var(--color-base-content) 10%, transparent);

      &[data-vc-position="bottom"] {
        margin-top: 0.25rem;
      }

      &[data-vc-position="top"] {
        margin-top: -0.25rem;
      }
    }
.vc [data-vc="controls"] {
      pointer-events: none;
      position: absolute;
      inset-inline: 0;
      inset-block-start: 0;
      z-index: 20;
      box-sizing: content-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1rem 0;
    }
.vc [data-vc-arrow], .vc .vc-arrow {
      pointer-events: auto;
      position: relative;
      display: block;
      height: 1.5rem;
      width: 1.5rem;
      cursor: pointer;
      border: 0;
      border-radius: var(--radius-field);
      background-color: transparent;
      color: var(--color-base-content);

      &:hover {
        background-color: var(--color-base-200);
      }

      &:hover::before {
        opacity: 0.6;
      }

      &::before {
        content: "";
        position: absolute;
        inset-inline-start: 50%;
        inset-block-start: 50%;
        height: 0.5rem;
        width: 0.5rem;
        border: 2px solid;
        border-width: 0 2px 2px 0;
        background-repeat: no-repeat;
        background-position: center;
      }

      &[data-vc-arrow="prev"]::before {
        transform: translate(-35%, -50%) rotate(135deg);
      }

      &[data-vc-arrow="next"]::before {
        transform: translate(-65%, -50%) rotate(-45deg);
      }
    }
.vc [data-vc="grid"] {
      display: flex;
      flex-grow: 1;
      flex-wrap: wrap;
      gap: 1.75rem;

      &[data-vc-grid="hidden"] {
        [data-vc="column"] {
          pointer-events: none;
          opacity: 0.3;
        }

        & [data-vc="column"][data-vc-column="month"],
        & [data-vc="column"][data-vc-column="year"] {
          pointer-events: auto;
          opacity: 1;
        }
      }
    }
.vc [data-vc="column"] {
      display: flex;
      min-width: 240px;
      flex-grow: 1;
      flex-direction: column;
    }
.vc [data-vc="header"] {
      position: relative;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
    }
.vc [data-vc-header="content"], .vc .vc-header__content {
      color: var(--color-base-content);
    }
.vc [data-vc-header="content"] {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      padding-inline: 1rem;
      white-space: pre-wrap;
    }
.vc [data-vc="month"], .vc [data-vc="year"], .vc .vc-month, .vc .vc-year {
      color: var(--color-base-content);

      &:hover {
        color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
      }

      &:disabled {
        color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
      }
    }
.vc [data-vc="month"], .vc [data-vc="year"] {
      cursor: pointer;
      border: 0;
      border-radius: var(--radius-field);
      background-color: transparent;
      padding: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;

      &:hover {
        background-color: var(--color-base-200);
      }

      &:disabled {
        pointer-events: none;
        opacity: 0.4;
      }
    }
.vc [data-vc="wrapper"], .vc [data-vc="content"] {
      display: flex;
      flex-grow: 1;
    }
.vc [data-vc="content"] {
      flex-direction: column;
    }
.vc [data-vc="months"], .vc [data-vc="years"] {
      display: grid;
      flex-grow: 1;
      align-items: center;
      gap: 1rem 0.25rem;
    }
.vc [data-vc="months"] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
.vc [data-vc="years"] {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
.vc [data-vc-months-month], .vc [data-vc-years-year], .vc .vc-months__month, .vc .vc-years__year {
      background-color: var(--color-base-100);
      color: color-mix(in oklab, var(--color-base-content) 70%, transparent);

      &:hover {
        background-color: var(--color-base-200);
        color: var(--color-base-content);
      }

      &:disabled {
        color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
        opacity: 0.8;

        &:hover {
          color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
        }
      }

      &[data-vc-months-month-selected],
      &[data-vc-years-year-selected] {
        background-color: var(--color-primary);
        color: var(--color-primary-content);

        &:hover {
          background-color: var(--color-primary);
          color: var(--color-primary-content);
        }
      }
    }
.vc [data-vc-months-month], .vc [data-vc-years-year] {
      display: flex;
      height: 2.5rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      overflow-wrap: anywhere;
      border: 0;
      border-radius: var(--radius-field);
      padding: 0.25rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 600;

      &:disabled {
        pointer-events: none;
        opacity: 0.4;
      }
    }
.vc [data-vc-week="numbers"] {
      display: flex;
      flex-direction: column;
    }
.vc [data-vc-week-numbers="title"], .vc .vc-week-numbers__title {
      color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
    }
.vc [data-vc-week-numbers="title"] {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
.vc [data-vc-week-numbers="content"] {
      display: grid;
      grid-auto-flow: row;
      align-items: center;
      justify-items: center;
      row-gap: 0.25rem;
    }
.vc [data-vc-week-number], .vc .vc-week-number {
      color: color-mix(in oklab, var(--color-base-content) 60%, transparent);

      &:hover {
        color: color-mix(in oklab, var(--color-base-content) 80%, transparent);
      }
    }
.vc [data-vc-week-number] {
      margin: 0;
      display: flex;
      min-height: 1.875rem;
      min-width: 1.875rem;
      width: 100%;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border: 0;
      background-color: transparent;
      padding: 0;
      font-size: 0.75rem;
      font-weight: 600;
    }
.vc [data-vc="week"] {
      margin-bottom: 0.5rem;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      justify-items: center;
    }
.vc [data-vc-week-day], .vc .vc-week__day {
      color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
    }
.vc [data-vc-week-day] {
      margin: 0;
      display: flex;
      min-width: 1.875rem;
      width: 100%;
      align-items: center;
      justify-content: center;
      border: 0;
      background-color: transparent;
      padding: 0;
      font-size: 0.75rem;
      font-weight: normal;
    }
.vc button[data-vc-week-day], .vc button.vc-week__day {
      cursor: pointer;

      &:hover {
        color: var(--color-base-content);
      }
    }
.vc [data-vc="dates"] {
      pointer-events: none;
      display: grid;
      flex-grow: 1;
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      align-items: center;
      justify-items: center;

      &[data-vc-dates-disabled] [data-vc-date-btn] {
        cursor: default;
      }
    }
.vc[data-vc-type="multiple"] [data-vc="dates"] {
      flex-grow: 0;
    }
.vc [data-vc-dates="row"] {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(7, 1fr);
      align-items: center;
      justify-items: center;
    }
.vc [data-vc-date], .vc .vc-date {
      &[data-vc-date-month="prev"],
      &[data-vc-date-month="next"] {
        & [data-vc-date-btn],
        & .vc-date__btn {
          color: color-mix(in oklab, var(--color-base-content) 40%, transparent);
        }
      }

      &[data-vc-date-disabled] {
        pointer-events: none;

        & [data-vc-date-btn],
        & .vc-date__btn {
          pointer-events: none;
          color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
          opacity: 0.8;
        }
      }

      &:not(:has([data-vc-date-btn])) {
        pointer-events: none;
      }

      &[data-vc-date-hover] {
        [data-vc-date-btn] {
          border-radius: 0;
        }

        & [data-vc-date-btn],
        & .vc-date__btn {
          background-color: var(--color-base-200);
        }

        &[data-vc-date-hover="first"],
        &[data-vc-date-hover="last"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-base-300);

            &:hover {
              background-color: var(--color-base-300);
            }
          }
        }

        &[data-vc-date-hover="first"] [data-vc-date-btn] {
          border-start-start-radius: var(--radius-field);
          border-end-start-radius: var(--radius-field);
          border-start-end-radius: 0;
          border-end-end-radius: 0;
        }

        &[data-vc-date-hover="last"] [data-vc-date-btn] {
          border-start-start-radius: 0;
          border-end-start-radius: 0;
          border-start-end-radius: var(--radius-field);
          border-end-end-radius: var(--radius-field);
        }

        &[data-vc-date-hover="first-and-last"] [data-vc-date-btn] {
          border-radius: var(--radius-field);
        }

        &[data-vc-date-selected] {
          &[data-vc-date-hover="first"] [data-vc-date-btn] {
            border-start-start-radius: var(--radius-field);
            border-end-start-radius: var(--radius-field);
          }

          &[data-vc-date-hover="last"] [data-vc-date-btn] {
            border-start-end-radius: var(--radius-field);
            border-end-end-radius: var(--radius-field);
          }
        }

        &:has(+ [data-vc-date-disabled]) [data-vc-date-btn] {
          border-start-end-radius: var(--radius-field);
          border-end-end-radius: var(--radius-field);
        }
      }

      &[data-vc-date-selected] {
        & [data-vc-date-btn],
        & .vc-date__btn {
          background-color: var(--color-base-content);
          color: var(--color-base-100);

          &:hover {
            background-color: var(--color-base-content);
            color: var(--color-base-100);
          }
        }

        &:has(+ [data-vc-date-disabled]) [data-vc-date-btn] {
          border-start-end-radius: var(--radius-field);
          border-end-end-radius: var(--radius-field);
        }

        &[data-vc-date-selected="first"] [data-vc-date-btn] {
          border-start-start-radius: var(--radius-field);
          border-end-start-radius: var(--radius-field);
          border-start-end-radius: 0;
          border-end-end-radius: 0;
        }

        &[data-vc-date-selected="last"] [data-vc-date-btn] {
          border-start-start-radius: 0;
          border-end-start-radius: 0;
          border-start-end-radius: var(--radius-field);
          border-end-end-radius: var(--radius-field);
        }

        &[data-vc-date-selected="first-and-last"] [data-vc-date-btn] {
          border-start-start-radius: var(--radius-field);
          border-start-end-radius: var(--radius-field);
          border-end-start-radius: var(--radius-field);
          border-end-end-radius: var(--radius-field);
        }

        &[data-vc-date-selected="middle"] {
          [data-vc-date-btn] {
            border-radius: 0;
          }

          /* [data-vc-date-btn],
          .vc-date__btn {
            background-color: color-mix(in oklab, var(--color-primary) 75%, transparent);
            color: var(--color-primary-content);

            &:hover {
              background-color: color-mix(in oklab, var(--color-primary) 75%, transparent);
              color: var(--color-primary-content);
            }
          } */
        }

        &[data-vc-date-month="prev"],
        &[data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-base-300);
            color: color-mix(in oklab, var(--color-base-content) 60%, transparent);

            &:hover {
              background-color: var(--color-base-300);
              color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
            }
          }
        }

        &[data-vc-date-selected="middle"][data-vc-date-month="prev"],
        &[data-vc-date-selected="middle"][data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-base-200);
            color: color-mix(in oklab, var(--color-base-content) 60%, transparent);

            &:hover {
              background-color: var(--color-base-200);
              color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
            }
          }
        }
      }

      &[data-vc-date-today] {
        & [data-vc-date-btn],
        & .vc-date__btn {
          background-color: var(--color-primary);
          color: var(--color-primary-content);
          font-weight: 700;

          &:hover {
            color: var(--color-primary-content);
          }
        }

        &[data-vc-date-month="prev"],
        &[data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            color: color-mix(in oklab, var(--color-base-content) 50%, transparent);
          }
        }
      }

      &[data-vc-date-holiday] {
        & [data-vc-date-btn],
        & .vc-date__btn {
          color: var(--color-error);

          &:hover {
            background-color: color-mix(in oklab, var(--color-error) 10%, transparent);
          }
        }

        &[data-vc-date-hover] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: color-mix(in oklab, var(--color-error) 10%, transparent);
          }

          &[data-vc-date-hover="first"],
          &[data-vc-date-hover="last"] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              background-color: color-mix(in oklab, var(--color-error) 20%, transparent);

              &:hover {
                background-color: color-mix(in oklab, var(--color-error) 20%, transparent);
              }
            }
          }
        }

        &[data-vc-date-disabled] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
            opacity: 0.8;
          }
        }

        &[data-vc-date-today] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-error);
            color: var(--color-error-content);
          }

          &[data-vc-date-disabled] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
            }
          }

          &[data-vc-date-month="prev"],
          &[data-vc-date-month="next"] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              color: color-mix(in oklab, var(--color-base-content) 40%, transparent);
            }
          }
        }

        &[data-vc-date-month="prev"],
        &[data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-base-100);
            color: color-mix(in oklab, var(--color-base-content) 40%, transparent);

            &:hover {
              background-color: var(--color-base-200);
              color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
            }
          }
        }

        &[data-vc-date-hover][data-vc-date-month="prev"],
        &[data-vc-date-hover][data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-base-200);
          }
        }

        &[data-vc-date-disabled][data-vc-date-month="prev"],
        &[data-vc-date-disabled][data-vc-date-month="next"] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            color: color-mix(in oklab, var(--color-base-content) 30%, transparent);
            opacity: 0.8;
          }
        }

        &[data-vc-date-selected] {
          & [data-vc-date-btn],
          & .vc-date__btn {
            background-color: var(--color-error);
            color: var(--color-error-content);

            &:hover {
              background-color: var(--color-error);
              color: var(--color-error-content);
            }
          }

          &[data-vc-date-selected="middle"] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              background-color: color-mix(in oklab, var(--color-error) 75%, transparent);
              color: var(--color-error-content);

              &:hover {
                background-color: color-mix(in oklab, var(--color-error) 75%, transparent);
                color: var(--color-error-content);
              }
            }
          }

          &[data-vc-date-month="prev"],
          &[data-vc-date-month="next"] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              background-color: var(--color-base-300);
              color: color-mix(in oklab, var(--color-base-content) 60%, transparent);

              &:hover {
                background-color: var(--color-base-300);
                color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
              }
            }
          }

          &[data-vc-date-selected="middle"][data-vc-date-month="prev"],
          &[data-vc-date-selected="middle"][data-vc-date-month="next"] {
            & [data-vc-date-btn],
            & .vc-date__btn {
              background-color: var(--color-base-200);
              color: color-mix(in oklab, var(--color-base-content) 60%, transparent);

              &:hover {
                background-color: var(--color-base-200);
                color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
              }
            }
          }
        }
      }
    }
.vc [data-vc-date] {
      pointer-events: auto;
      position: relative;
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      padding-block: 0.125rem;

      &[data-vc-date-disabled] + [data-vc-date-selected] [data-vc-date-btn],
      &[data-vc-date-disabled] + [data-vc-date-hover] [data-vc-date-btn] {
        border-start-start-radius: var(--radius-field);
        border-end-start-radius: var(--radius-field);
      }
    }
.vc [data-vc-date-btn], .vc .vc-date__btn {
      background-color: var(--color-base-100);
      color: var(--color-base-content);

      &:hover {
        background-color: var(--color-base-200);
      }
    }
.vc [data-vc-date-btn] {
      display: flex;
      min-height: 1.875rem;
      min-width: 1.875rem;
      height: 100%;
      width: 100%;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: var(--radius-field);
      padding: 0;
      font-size: 0.75rem;
      font-weight: 400;
      transition-property: color, background-color, border-color, opacity, box-shadow, transform;
      transition-duration: 75ms;
    }
.vc [data-vc-date-btn]:focus-visible + [data-vc-date-popup], .vc [data-vc-date-btn]:hover + [data-vc-date-popup], .vc [data-vc-date-popup]:focus-visible, .vc [data-vc-date-popup]:hover {
      pointer-events: auto;
      opacity: 1;
    }
.vc [data-vc-date-popup], .vc .vc-date__popup {
      background-color: var(--color-base-100);
      color: var(--color-base-content);
      box-shadow: 0 3px 15px color-mix(in oklab, var(--color-base-content) 20%, transparent);
    }
.vc [data-vc-date-popup] {
      pointer-events: none;
      position: absolute;
      z-index: 20;
      min-width: 5rem;
      max-width: 9rem;
      transform: translate(-50%);
      border-radius: var(--radius-field);
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 400;
      opacity: 0;
      transition-property: opacity;
      transition-duration: 75ms;

      &:hover {
        pointer-events: auto;
        opacity: 1;
      }
    }
.vc [data-vc-date-range-tooltip], .vc .vc-date-range-tooltip {
      background-color: var(--color-base-200);
      color: color-mix(in oklab, var(--color-base-content) 70%, transparent);
      box-shadow: 0 1px 4px color-mix(in oklab, var(--color-base-content) 20%, transparent);
    }
.vc [data-vc-date-range-tooltip] {
      pointer-events: none;
      position: absolute;
      z-index: 30;
      max-width: 9rem;
      transform: translate(-50%, -100%);
      border-radius: var(--radius-field);
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 400;

      &[data-vc-date-range-tooltip="hidden"] {
        opacity: 0;
      }

      &[data-vc-date-range-tooltip="visible"] {
        opacity: 1;
      }
    }
.vc [data-vc="time"], .vc .vc-time {
      border-color: var(--color-base-200);
    }
.vc [data-vc="time"] {
      margin-top: 0.75rem;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.75rem;
      border-style: solid;
      border-width: var(--border) 0 0;
      padding-top: 0.75rem;
    }
.vc [data-vc-time="content"] {
      display: grid;
      grid-auto-flow: column;
      align-items: center;
    }
.vc [data-vc-time-input="hour"], .vc [data-vc-time-input="minute"], .vc .vc-time__hour, .vc .vc-time__minute {
      &::after {
        color: var(--color-base-content);
      }
    }
.vc [data-vc-time-input="hour"] {
      position: relative;
      margin-right: 0.35rem;
      width: 1.75rem;

      &::after {
        --tw-content: ":";
        content: var(--tw-content);
        position: absolute;
        inset-inline-end: -5px;
        inset-block-start: 50%;
        display: block;
        margin-top: calc(1px - 50%);
      }
    }
.vc [data-vc-time-input="minute"] {
      width: 1.75rem;
    }
.vc [data-vc-time-input="hour"] input, .vc [data-vc-time-input="minute"] input, .vc .vc-time__hour input, .vc .vc-time__minute input {
      background-color: var(--color-base-100);
      color: var(--color-base-content);

      &:hover,
      &[data-vc-input-focus] {
        background-color: var(--color-base-200);
      }

      &:focus-visible {
        outline-color: var(--color-primary);
      }

      &[data-vc-input-focus] {
        background-color: var(--color-base-200);
      }
    }
.vc [data-vc-time-input="hour"] input, .vc [data-vc-time-input="minute"] input {
      position: relative;
      box-sizing: border-box;
      margin: 0;
      display: block;
      width: 100%;
      border: 0;
      border-radius: var(--radius-field);
      padding: 0.125rem;
      text-align: center;
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1.125rem;

      &:disabled {
        cursor: default;

        &:hover {
          background-color: transparent;
        }
      }

      &:focus-visible {
        outline: 1px solid var(--color-primary);
      }
    }
.vc [data-vc-time="keeping"], .vc .vc-time__keeping {
      color: color-mix(in oklab, var(--color-base-content) 70%, transparent);

      &:hover {
        background-color: var(--color-base-200);
        color: var(--color-base-content);
      }

      &:focus-visible {
        outline-color: var(--color-primary);
      }
    }
.vc [data-vc-time="keeping"] {
      margin-top: 0.25rem;
      margin-left: 1px;
      width: 22px;
      cursor: pointer;
      border: 0;
      border-radius: var(--radius-field);
      background-color: transparent;
      padding: 0;
      font-size: 0.69rem;

      &:disabled {
        cursor: default;

        &:hover {
          background-color: transparent;
        }
      }

      &:focus-visible {
        outline: 1px solid var(--color-primary);
      }
    }
.vc [data-vc-time="ranges"] {
      display: grid;
      grid-auto-flow: row;
    }
.vc [data-vc-time-range], .vc .vc-time__range {
      input {
        background-color: var(--color-base-100);

        &:focus-visible {
          &::-webkit-slider-thumb,
          &::-moz-range-thumb {
            border-color: var(--color-primary);
          }
        }

        &::-webkit-slider-thumb,
        &::-moz-range-thumb {
          border-color: var(--color-base-300);
          background-color: var(--color-base-100);
        }

        &::-webkit-slider-runnable-track,
        &::-moz-range-track {
          background-color: var(--color-base-300);
        }
      }

      &:hover input {
        &::-webkit-slider-thumb,
        &::-moz-range-thumb {
          border-color: color-mix(in oklab, var(--color-base-content) 40%, transparent);
        }
      }

      &::before,
      &::after {
        background-color: var(--color-base-300);
      }
    }
.vc [data-vc-time-range] {
      position: relative;
      z-index: 10;
      font-size: 0;

      &::before {
        inset-inline-start: 0;
      }

      &::after {
        inset-inline-end: 0;
      }

      &::before,
      &::after {
        content: "";
        pointer-events: none;
        position: absolute;
        inset-block-start: 50%;
        z-index: 10;
        height: 0.5rem;
        width: 1px;
        transform: translateY(-50%);
      }

      input {
        position: relative;
        margin: 0;
        height: 1.25rem;
        width: 100%;
        cursor: pointer;
        appearance: none;
        outline: 0;

        &::-webkit-slider-thumb {
          appearance: none;
          margin-top: -0.5rem;
        }

        &::-webkit-slider-thumb,
        &::-moz-range-thumb {
          position: relative;
          z-index: 20;
          box-sizing: border-box;
          height: 1rem;
          width: 0.75rem;
          cursor: pointer;
          border: var(--border) solid var(--color-base-300);
          border-radius: var(--radius-field);
          box-shadow: none;
        }

        &::-webkit-slider-runnable-track,
        &::-moz-range-track {
          box-sizing: border-box;
          margin-top: 1px;
          height: 1px;
          width: 100%;
          cursor: pointer;
          box-shadow: none;
        }
      }
    }
`;

export function batch1Rules(opts: Ctx): Preset["rules"] {
  const rules: StaticRule[] = [];
  // Prefix a selector string (all .classes inside are prefixed, pseudos kept).
  const sel = (s: string): string => applyPrefix(s, opts.prefix);
  // Public rule name (plain class, prefixed).
  const key = (name: string): string => `${opts.prefix}${name}`;

  // ─── alert ────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/alert.css
  if (shouldInclude("alert", opts.include, opts.exclude)) {
    // &:has(> :nth-child(2)), upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      "__daisy-alert-nested",
      [
        `${sel(".alert")}:has(> :nth-child(2)){grid-template-columns:auto minmax(auto, 1fr);}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Orientation modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Fully flat except their own &:has, kept in the same raw block.
    const vert = sel(".alert-vertical");
    rules.push([
      key("alert-vertical"),
      [
        `${vert}{justify-content:center;justify-items:center;grid-auto-flow:row;grid-template-columns:auto;text-align:center;}${vert}:has(> :nth-child(2)){grid-template-columns:auto;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    const horiz = sel(".alert-horizontal");
    rules.push([
      key("alert-horizontal"),
      [
        `${horiz}{justify-content:start;justify-items:start;grid-auto-flow:column;grid-template-columns:auto;text-align:start;}${horiz}:has(> :nth-child(2)){grid-template-columns:auto minmax(auto, 1fr);}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── aura ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/aura.css
  if (shouldInclude("aura", opts.include, opts.exclude)) {
    // Nested parts of .aura + the three @keyframes (unlayered upstream),
    // upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: opacity-30->opacity:0.3 (after), relative z-1->position/z-index (child).
    const aura = sel(".aura");
    rules.push([
      "__daisy-aura-nested",
      [
        `@media (prefers-reduced-motion: reduce){${aura}{animation-duration:calc(var(--tw-duration, 6s) * 4);}}` +
          `${aura}:has(> ${sel(".card")}, > ${sel(".alert")}){--aura-radius:var(--radius-box);}` +
          `${aura}:has(> ${sel(".btn")}, > ${sel(".input")}, > ${sel(".select")}){--aura-radius:var(--radius-field);}` +
          `${aura}:has(> ${sel(".checkbox")}, > ${sel(".toggle")}, > ${sel(".badge")}){--aura-radius:var(--radius-selector);}` +
          `${aura}:before,${aura}:after{animation:inherit;background-color:inherit;background-image:inherit;border-radius:inherit;position:absolute;top:50%;left:50%;z-index:0;display:block;opacity:0.7;filter:blur(0.25rem);translate:-50% -50%;width:100%;height:100%;content:"";}` +
          `${aura}:after{opacity:0.3;filter:blur(1rem);}` +
          `${aura} > *{position:relative;z-index:1;}` +
          `@keyframes aura{to{--aura-angle:360deg;transform:translateZ(1px);}}` +
          `@keyframes aura-glow{20%,80%{opacity:0.7;filter:blur(0.25rem);}50%{opacity:1;filter:blur(0.75rem);}}` +
          `@keyframes aura-glow-after{20%,80%{opacity:0.3;filter:blur(1rem);}50%{opacity:0.6;filter:blur(1.5rem);}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .aura-holo, upstream layer daisyui.l1.l2 -> daisy-l2 (flat + media).
    const holo = sel(".aura-holo");
    rules.push([
      key("aura-holo"),
      [
        `${holo}{background-image:repeating-conic-gradient(from var(--aura-angle), oklch(82% .17 327), oklch(75% .12 274), oklch(82% .11 191), oklch(91% .11 105), oklch(88% .08 68), oklch(82% .17 327) 10%);animation:aura var(--tw-duration, 20s) linear infinite;}` +
          `@media (prefers-reduced-motion: reduce){${holo}{animation-duration:calc(var(--tw-duration, 20s) * 4);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .aura-glow, upstream layer daisyui.l1.l2 -> daisy-l2 (flat + :before/:after).
    const glow = sel(".aura-glow");
    rules.push([
      key("aura-glow"),
      [
        `${glow}{animation:none;background-image:radial-gradient(closest-corner,currentColor 0%,#0000 90%);}` +
          `${glow}:before{animation:aura-glow var(--tw-duration, 6s) ease-out infinite;}` +
          `@media (prefers-reduced-motion: reduce){${glow}:before{animation-duration:calc(var(--tw-duration, 6s) * 4);}}` +
          `${glow}:after{animation:aura-glow-after var(--tw-duration, 6s) ease-out infinite;}` +
          `@media (prefers-reduced-motion: reduce){${glow}:after{animation-duration:calc(var(--tw-duration, 6s) * 4);}}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── avatar ───────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/avatar.css
  if (shouldInclude("avatar", opts.include, opts.exclude)) {
    // .avatar-group .avatar child, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: overflow-hidden->overflow:hidden, rounded-full->border-radius.
    rules.push([
      "__daisy-avatar-group-nested",
      [
        `${sel(".avatar-group")} ${sel(".avatar")}{border:4px solid var(--color-base-100);border-radius:calc(infinity * 1px);overflow:hidden;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .avatar children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: block->display, aspect-square->aspect-ratio, h-full/w-full->100%.
    const avatar = sel(".avatar");
    rules.push([
      "__daisy-avatar-nested",
      [
        `${avatar} > div{display:block;aspect-ratio:1/1;overflow:hidden;}` +
          `${avatar} img{height:100%;width:100%;object-fit:cover;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .avatar-placeholder, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: flex->display:flex, items-center/justify-center.
    rules.push([
      key("avatar-placeholder"),
      [
        `${sel(".avatar-placeholder")} > div{display:flex;align-items:center;justify-content:center;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // Online/offline dots, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: bg-success/bg-base-300->background-color, absolute->position,
    // z-1->z-index, block->display, rounded-full->border-radius.
    rules.push([
      key("avatar-online"),
      [
        `${sel(".avatar-online")}:before{content:"";position:absolute;z-index:1;display:block;border-radius:calc(infinity * 1px);background-color:var(--color-success);outline:2px solid var(--color-base-100);width:15%;height:15%;top:7%;right:7%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("avatar-offline"),
      [
        `${sel(".avatar-offline")}:before{content:"";position:absolute;z-index:1;display:block;border-radius:calc(infinity * 1px);background-color:var(--color-base-300);outline:2px solid var(--color-base-100);width:15%;height:15%;top:7%;right:7%;}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── breadcrumbs ──────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/breadcrumbs.css
  if (shouldInclude("breadcrumbs", opts.include, opts.exclude)) {
    // All nested list/item CSS, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: flex->display:flex, min-h-min->min-height:min-content,
    // items-center->align-items, ps-1->padding-inline-start:0.25rem,
    // whitespace-nowrap, cursor-pointer->cursor:pointer, gap-2->gap:0.5rem,
    // hover:underline->@media (hover:hover){text-decoration-line:underline},
    // outline-hidden->--tw-outline-style:none + outline-style:none +
    // forced-colors fallback (Tailwind v4 expansion, kept verbatim),
    // ms-2/me-3->margin-inline longhands, block->display, h-1.5/w-1.5->0.375rem,
    // opacity-40->opacity:0.4.
    const bc = sel(".breadcrumbs");
    const lists = ["menu", "ul", "ol"].map((t) => `${bc} > ${t}`).join(",");
    const items = ["menu", "ul", "ol"]
      .map((t) => `${bc} > ${t} > li`)
      .join(",");
    const links = ["menu", "ul", "ol"]
      .map((t) => `${bc} > ${t} > li > *`)
      .join(",");
    const seps = ["menu", "ul", "ol"]
      .map((t) => `${bc} > ${t} > li + *:before`)
      .join(",");
    const rtlSeps = ["menu", "ul", "ol"]
      .map((t) => `[dir="rtl"] ${bc} > ${t} > li + *:before`)
      .join(",");
    rules.push([
      "__daisy-breadcrumbs-nested",
      [
        `${lists}{display:flex;min-height:min-content;align-items:center;padding-inline-start:0.25rem;white-space:nowrap;}` +
          `${items}{display:flex;align-items:center;}` +
          `${links}{display:flex;cursor:pointer;align-items:center;gap:0.5rem;}` +
          `${links
            .split(",")
            .map((s) => `${s}:hover`)
            .join(
              ",",
            )}{@media (hover:hover){text-decoration-line:underline;}}` +
          `${links
            .split(",")
            .map((s) => `${s}:focus`)
            .join(",")}{--tw-outline-style:none;outline-style:none;}` +
          `@media (forced-colors:active){${links
            .split(",")
            .map((s) => `${s}:focus`)
            .join(",")}{outline-offset:2px;outline:2px solid #0000;}}` +
          `${links
            .split(",")
            .map((s) => `${s}:focus-visible`)
            .join(",")}{outline:2px solid currentColor;outline-offset:2px;}` +
          `${seps}{content:"";margin-inline:0.5rem 0.75rem;display:block;height:0.375rem;width:0.375rem;opacity:0.4;rotate:45deg;border-top:1px solid;border-right:1px solid;background-color:#0000;}` +
          `${rtlSeps}{rotate:-135deg;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── calendar ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/calendar.css
  // No at-apply in the file: nested CSS is kept verbatim (selectors qualified
  // with the root during extraction, prefixed at generation time).
  // All upstream layer daisyui.l1.l2.l3 -> daisy-l3.
  if (shouldInclude("calendar", opts.include, opts.exclude)) {
    rules.push([
      "__daisy-calendar-cally",
      [prefixSelectors(CALLY_NESTED, opts.prefix)],
      { layer: "daisy-l3", internal: true },
    ]);
    rules.push([
      "__daisy-calendar-rdp",
      [prefixSelectors(RDP_NESTED, opts.prefix)],
      { layer: "daisy-l3", internal: true },
    ]);
    rules.push([
      key("pika-single"),
      [prefixSelectors(PIKA_BLOCK, opts.prefix)],
      { layer: "daisy-l3" },
    ]);
    rules.push([
      "__daisy-calendar-vc",
      [prefixSelectors(VC_NESTED, opts.prefix)],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── carousel ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/carousel.css
  if (shouldInclude("carousel", opts.include, opts.exclude)) {
    // Reduced-motion + scrollbar, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    const carousel = sel(".carousel");
    rules.push([
      "__daisy-carousel-nested",
      [
        `@media (prefers-reduced-motion: no-preference){${carousel}{scroll-behavior:smooth;}}` +
          `${carousel}::-webkit-scrollbar{display:none;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Snap modifiers, upstream layer daisyui.l1.l2 -> daisy-l2.
    const item = sel(".carousel-item");
    rules.push([
      key("carousel-start"),
      [`${sel(".carousel-start")} ${item}{scroll-snap-align:start;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("carousel-center"),
      [`${sel(".carousel-center")} ${item}{scroll-snap-align:center;}`],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("carousel-end"),
      [`${sel(".carousel-end")} ${item}{scroll-snap-align:end;}`],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── chat ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/chat.css
  if (shouldInclude("chat", opts.include, opts.exclude)) {
    // Bubble tail, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    const bubble = sel(".chat-bubble");
    rules.push([
      "__daisy-chat-bubble-nested",
      [
        `${bubble}:before{position:absolute;bottom:0;height:0.75rem;width:0.75rem;background-color:inherit;content:"";mask-repeat:no-repeat;mask-image:var(--mask-chat);mask-position:0px -1px;mask-size:0.8125rem;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Placement, upstream layer daisyui.l1.l2 -> daisy-l2.
    // Expanded: place-items-start/end->place-items, col-start-1/2->grid-column-start,
    // rounded-es/ee-none->border-end-start/end-radius:0.
    const start = sel(".chat-start");
    const end = sel(".chat-end");
    const header = sel(".chat-header");
    const footer = sel(".chat-footer");
    const image = sel(".chat-image");
    rules.push([
      key("chat-start"),
      [
        `${start}{place-items:start;grid-template-columns:auto 1fr;}` +
          `${start} ${header}{grid-column-start:2;}` +
          `${start} ${footer}{grid-column-start:2;}` +
          `${start} ${image}{grid-column-start:1;}` +
          `${start} ${bubble}{grid-column-start:2;border-end-start-radius:0;}` +
          `${start} ${bubble}:before{transform:rotateY(0deg);inset-inline-start:-0.75rem;}` +
          `[dir="rtl"] ${start} ${bubble}:before{transform:rotateY(180deg);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    rules.push([
      key("chat-end"),
      [
        `${end}{place-items:end;grid-template-columns:1fr auto;}` +
          `${end} ${header}{grid-column-start:1;}` +
          `${end} ${footer}{grid-column-start:1;}` +
          `${end} ${image}{grid-column-start:2;}` +
          `${end} ${bubble}{grid-column-start:1;border-end-end-radius:0;}` +
          `${end} ${bubble}:before{transform:rotateY(180deg);inset-inline-start:100%;}` +
          `[dir="rtl"] ${end} ${bubble}:before{transform:rotateY(0deg);}`,
      ],
      { layer: "daisy-l2" },
    ]);
  }

  // ─── checkbox ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/checkbox.css
  if (shouldInclude("checkbox", opts.include, opts.exclude)) {
    const checkbox = sel(".checkbox");
    // Check glyph, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: block->display:block, size-full->width/height:100%,
    // rotate-45->rotate:45deg, bg-current->background-color:currentColor,
    // opacity-0->opacity:0.
    rules.push([
      "__daisy-checkbox-nested",
      [
        `${checkbox}:before{--tw-content:"";content:var(--tw-content);display:block;width:100%;height:100%;rotate:45deg;background-color:currentColor;opacity:0;transition:clip-path 0.3s 0.1s,opacity 0.1s 0.1s,rotate 0.3s 0.1s,translate 0.3s 0.1s;clip-path:polygon(20% 100%, 20% 80%, 50% 80%, 50% 80%, 70% 80%, 70% 100%);box-shadow:0px 3px 0 0px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset;font-size:1rem;line-height:0.75;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Interactive states (:focus-visible/:checked/:indeterminate/:disabled),
    // upstream :focus-visible+:checked+:indeterminate in daisyui.l1.l2.l3 and
    // :disabled in daisyui.l1.l2; all are states so they share daisy-l1 here.
    // Expanded: opacity-100->opacity:1, rotate-0->rotate:0deg,
    // bg-transparent->background-color:transparent, cursor-not-allowed->cursor,
    // opacity-20->opacity:0.2, [--tw-content:"✔︎"]->[clip-path:none] arbitraries.
    const checked = `${checkbox}:checked,${checkbox}[aria-checked="true"]`;
    const checkedBefore = `${checkbox}:checked:before,${checkbox}[aria-checked="true"]:before`;
    rules.push([
      "__daisy-checkbox-state",
      [
        `${checkbox}:focus-visible{outline:2px solid var(--input-color, currentColor);outline-offset:2px;}` +
          `${checked}{background-color:var(--input-color, #0000);box-shadow:0 0 #0000 inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset, 0 1px oklch(0% 0 0 / calc(var(--depth) * 0.1));}` +
          `${checkedBefore}{clip-path:polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%);translate:3.5% -7%;opacity:1;}` +
          `@media (forced-colors: active){${checkedBefore}{--tw-content:"✔︎";clip-path:none;background-color:transparent;rotate:0deg;}}` +
          `@media print{${checkedBefore}{--tw-content:"✔︎";clip-path:none;background-color:transparent;rotate:0deg;}}` +
          `${checkbox}:indeterminate,${checkbox}[aria-checked="mixed"]{background-color:var(--input-color, color-mix(in oklab, var(--color-base-content) 20%, #0000));}` +
          `${checkbox}:indeterminate:before,${checkbox}[aria-checked="mixed"]:before{rotate:0deg;opacity:1;translate:0 -40%;clip-path:polygon(20% 100%, 20% 80%, 50% 80%, 50% 80%, 80% 80%, 80% 100%);}` +
          `${checkbox}:disabled{cursor:not-allowed;opacity:0.2;}`,
      ],
      { layer: "daisy-l1", internal: true },
    ]);
  }

  // ─── collapse ─────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/collapse.css
  if (shouldInclude("collapse", opts.include, opts.exclude)) {
    // Root with the upstream :not() guard; every nested class goes through sel().
    const root = sel(".collapse:not(td, tr, colgroup)");
    const close = sel(".collapse-close");
    const open = sel(".collapse-open");
    const isOpen = sel(".collapse[open]");
    const title = sel(".collapse-title");
    const content = sel(".collapse-content");
    const input = `input:is([type="checkbox"], [type="radio"])`;
    // Grid/open/focus/details nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      "__daisy-collapse-nested",
      [
        `@media (prefers-reduced-motion: no-preference){${root}{transition:grid-template-rows 0.2s;}}` +
          `${root} > ${input}{grid-column-start:1;grid-row-start:1;appearance:none;opacity:0;}` +
          `${root}:is([open], [tabindex]:focus:not(${close}), [tabindex]:focus-within:not(${close})),${root}:not(${close}):has(> ${input}:checked){grid-template-rows:max-content 1fr;}` +
          `${root}:is([open], [tabindex]:focus:not(${close}), [tabindex]:focus-within:not(${close})) > ${content},${root}:not(${close}) > :where(${input}:checked ~ ${content}){--overflow-delay:0.2s;overflow:revert-layer;content-visibility:visible;min-height:fit-content;@supports not (content-visibility:visible){visibility:visible;}}` +
          `${root}:focus-visible,${root}:has(> ${input}:focus-visible),${root}:has(summary:focus-visible){outline-color:var(--color-base-content);outline-style:solid;outline-width:2px;outline-offset:2px;}` +
          `${root}:not(${close}) > input[type="checkbox"],${root}:not(${close}) > input[type="radio"]:not(:checked),${root}:not(${close}) > ${title}{cursor:pointer;}` +
          `${root}[tabindex]:focus:not(${close}, ${isOpen}),${root}[tabindex]:focus-within:not(${close}, ${isOpen}){> ${title}{cursor:unset;}}` +
          `${root}:is([open], [tabindex]:focus:not(${close}), [tabindex]:focus-within:not(${close})) > :where(${content}),${root}:not(${close}) > :where(${input}:checked ~ ${content}){padding-bottom:1rem;}` +
          `${root} > ${input}{z-index:1;width:100%;padding:1rem;padding-inline-end:3rem;min-height:1lh;transition:background-color 0.2s ease-out;}` +
          `${root}:is(details){width:100%;}` +
          `${root}:is(details)::details-content{--overflow-delay:0s;overflow:clip;height:0;}` +
          `${root}:is(details):where([open])::details-content{overflow:revert-layer;height:auto;}` +
          `@media (prefers-reduced-motion: no-preference){${root}:is(details)::details-content{transition:overflow .2s allow-discrete var(--overflow-delay), content-visibility .2s allow-discrete, visibility .2s allow-discrete, min-height .2s ease-out allow-discrete, padding .1s ease-out 20ms, background-color .2s ease-out, height .2s;interpolate-size:allow-keywords;}${root}:is(details):where([open])::details-content{--overflow-delay:0.2s;}}` +
          `${root}:is(details) > summary{position:relative;display:block;outline:none;}` +
          `${root}:is(details) > summary::-webkit-details-marker{display:none;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // .collapse-arrow shell + its open/focus/checked states,
    // upstream layer daisyui.l1.l2 -> daisy-l2.
    const arrow = sel(".collapse-arrow");
    rules.push([
      key("collapse-arrow"),
      [
        `${arrow} > ${title}:after{position:absolute;display:block;height:0.5rem;width:0.5rem;transform:translateY(-100%) rotate(45deg);top:50%;inset-inline-end:1.4rem;content:"";transform-origin:75% 75%;box-shadow:2px 2px;pointer-events:none;}` +
          `@media (prefers-reduced-motion: no-preference){${arrow} > ${title}:after{transition-property:all;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transition-duration:0.2s;}}` +
          `@media (prefers-reduced-motion: no-preference){${root}:is([open])${arrow} > ${title}:after,${root}${open}${arrow} > ${title}:after{transform:translateY(-50%) rotate(225deg);}}` +
          `${root}[tabindex]${arrow}:focus:not(${close}) > ${title}:after,${root}${arrow}[tabindex]:focus-within:not(${close}) > ${title}:after{transform:translateY(-50%) rotate(225deg);}` +
          `${root}${arrow}:not(${close}) > ${input}:checked ~ ${title}:after{transform:translateY(-50%) rotate(225deg);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .collapse-plus shell + its open/focus/checked states,
    // upstream layer daisyui.l1.l2 -> daisy-l2.
    const plus = sel(".collapse-plus");
    rules.push([
      key("collapse-plus"),
      [
        `${plus} > ${title}:after{position:absolute;display:block;height:0.5rem;width:0.5rem;top:0.9rem;inset-inline-end:1.4rem;--tw-content:"+";content:var(--tw-content);pointer-events:none;}` +
          `@media (prefers-reduced-motion: no-preference){${plus} > ${title}:after{transition-property:all;transition-duration:300ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}}` +
          `${root}:is([open])${plus} > ${title}:after,${root}${open}${plus} > ${title}:after,${root}[tabindex]${plus}:focus:not(${close}) > ${title}:after,${root}${plus}:not(${close}) > ${input}:checked ~ ${title}:after{--tw-content:"−";content:var(--tw-content);}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .collapse-open, upstream layer daisyui.l1.l2 -> daisy-l2.
    rules.push([
      key("collapse-open"),
      [
        `${open}{grid-template-rows:max-content 1fr;}` +
          `${open} > ${content}{--overflow-delay:0.2s;overflow:revert-layer;content-visibility:visible;min-height:fit-content;padding-bottom:1rem;@supports not (content-visibility:visible){visibility:visible;}}`,
      ],
      { layer: "daisy-l2" },
    ]);
    // .collapse-content nests, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    rules.push([
      "__daisy-collapse-content-nested",
      [
        `@supports not (content-visibility:hidden){${content}{visibility:hidden;}}` +
          `@media (prefers-reduced-motion: no-preference){${content}{transition:overflow .2s allow-discrete var(--overflow-delay), content-visibility .2s allow-discrete, visibility .2s allow-discrete, min-height .2s ease-out allow-discrete, padding .1s ease-out 20ms, background-color .2s ease-out;}}` +
          `details > ${content}{content-visibility:visible;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── countdown ────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/countdown.css
  if (shouldInclude("countdown", opts.include, opts.exclude)) {
    // Digit machinery, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: invisible->visibility, relative->position, inline-block->display,
    // overflow-y-clip, visible->visibility:visible, absolute->position,
    // overflow-x-clip. NOTE: \A escapes are doubled for the TS string literal.
    const cd = sel(".countdown");
    rules.push([
      "__daisy-countdown-nested",
      [
        `${cd} > *{visibility:hidden;position:relative;display:inline-block;overflow-y:clip;transition:width 0.4s ease-out 0.2s;height:1em;--value-v:calc(mod(max(0, var(--value)), 1000));--value-hundreds:calc(round(to-zero, var(--value-v) / 100, 1));--value-tens:calc(round(to-zero, mod(var(--value-v), 100) / 10, 1));--value-ones:calc(mod(var(--value-v), 100));--show-hundreds:clamp(clamp(0, var(--digits, 1) - 2, 1), var(--value-hundreds), 1);--show-tens:clamp(clamp(0, var(--digits, 1) - 1, 1), var(--value-tens) + var(--show-hundreds), 1);--first-digits:calc(round(to-zero, var(--value-v) / 10, 1));width:calc(1ch + var(--show-tens) * 1ch + var(--show-hundreds) * 1ch);direction:ltr;}` +
          `${cd} > *:before,${cd} > *:after{visibility:visible;position:absolute;overflow-x:clip;--tw-content:"00\\A 01\\A 02\\A 03\\A 04\\A 05\\A 06\\A 07\\A 08\\A 09\\A 10\\A 11\\A 12\\A 13\\A 14\\A 15\\A 16\\A 17\\A 18\\A 19\\A 20\\A 21\\A 22\\A 23\\A 24\\A 25\\A 26\\A 27\\A 28\\A 29\\A 30\\A 31\\A 32\\A 33\\A 34\\A 35\\A 36\\A 37\\A 38\\A 39\\A 40\\A 41\\A 42\\A 43\\A 44\\A 45\\A 46\\A 47\\A 48\\A 49\\A 50\\A 51\\A 52\\A 53\\A 54\\A 55\\A 56\\A 57\\A 58\\A 59\\A 60\\A 61\\A 62\\A 63\\A 64\\A 65\\A 66\\A 67\\A 68\\A 69\\A 70\\A 71\\A 72\\A 73\\A 74\\A 75\\A 76\\A 77\\A 78\\A 79\\A 80\\A 81\\A 82\\A 83\\A 84\\A 85\\A 86\\A 87\\A 88\\A 89\\A 90\\A 91\\A 92\\A 93\\A 94\\A 95\\A 96\\A 97\\A 98\\A 99\\A ";content:var(--tw-content);font-variant-numeric:tabular-nums;white-space:pre;text-align:end;direction:rtl;transition:all 1s cubic-bezier(1, 0, 0, 1), width 0.2s ease-out 0.2s, opacity 0.2s ease-out 0.2s;}` +
          `${cd} > *:before{width:calc(1ch + var(--show-hundreds) * 1ch);top:calc(var(--first-digits) * -1em);inset-inline-end:0;opacity:var(--show-tens);}` +
          `${cd} > *:after{width:1ch;top:calc(var(--value-ones) * -1em);inset-inline-start:0;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  // ─── diff ─────────────────────────────────────────────────────────────────
  // Upstream: https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src/components/diff.css
  if (shouldInclude("diff", opts.include, opts.exclude)) {
    const diff = sel(".diff");
    const resizer = sel(".diff-resizer");
    const item1 = sel(".diff-item-1");
    const item2 = sel(".diff-item-2");
    // Focus/hover/supports states, upstream layer daisyui.l1.l2 -> daisy-l2.
    // outline-2 keeps Tailwind's var(--tw-outline-style) reference with a solid
    // fallback so the ring works without Tailwind's @property registration.
    rules.push([
      "__daisy-diff-nested",
      [
        `${diff}:focus-visible{outline-style:var(--tw-outline-style, solid);outline-color:var(--color-base-content);outline-width:2px;outline-offset:1px;-webkit-user-select:none;user-select:none;}` +
          `${diff}:focus-visible ${resizer}{min-width:95cqi;max-width:95cqi;}` +
          `${diff}:has(${item1}:focus-visible){outline-style:var(--tw-outline-style, solid);outline-width:2px;outline-offset:1px;}` +
          `${diff}:has(${item1}:focus-visible) ${resizer}{min-width:5cqi;max-width:5cqi;}` +
          `${diff}:hover ${item2}:after{height:2.4rem;}` +
          `@supports (-webkit-overflow-scrolling: touch) and (overflow: -webkit-paged-x){${diff}:focus ${resizer}{min-width:5cqi;max-width:5cqi;}${diff}:has(${item1}:focus) ${resizer}{min-width:95cqi;max-width:95cqi;}}` +
          `@supports (-moz-appearance: none){@media (hover: none) and (pointer: coarse){${diff}:focus ${resizer}{min-width:5cqi;max-width:5cqi;}${diff}:has(${item1}:focus) ${resizer}{min-width:95cqi;max-width:95cqi;}}}`,
      ],
      { layer: "daisy-l2", internal: true },
    ]);
    // Knob + media children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: bg-base-100/98->color-mix 98%, pointer-events-none,
    // absolute/top-1/2/right-px/bottom-0, z-2, rounded-full->border-radius,
    // top-0/bottom-0/left-0, h-full, w-[100cqi], max-w-none,
    // object-cover/object-center.
    rules.push([
      "__daisy-diff-item-2-nested",
      [
        `${item2}:after{pointer-events:none;position:absolute;z-index:2;background-color:color-mix(in oklab, var(--color-base-100) 98%, transparent);top:50%;right:1px;bottom:0;border-radius:calc(infinity * 1px);width:1.2rem;height:1.8rem;border:2px solid var(--color-base-100);content:"";box-shadow:0 0 0 2px #0000002a;outline:2px solid color-mix(in oklab, var(--color-base-content) 10%, #0000);outline-offset:-3px;translate:50% -50%;transition:height 0.3s linear(0, 0.931 13.8%, 1.196 21.4%, 1.343 29.8%, 1.378 36%, 1.365 43.2%, 1.059 78%, 1);}` +
          `${item2} > *{pointer-events:none;position:absolute;top:0;bottom:0;left:0;height:100%;width:100cqi;max-width:none;object-fit:cover;object-position:center;}` +
          `@supports (-webkit-overflow-scrolling: touch) and (overflow: -webkit-paged-x){${item2}:after{--tw-content:none;content:var(--tw-content);}}` +
          `@supports (-moz-appearance: none){@media (hover: none) and (pointer: coarse){${item2}:after{--tw-content:none;content:var(--tw-content);}}}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
    // Focus reset + media children, upstream layer daisyui.l1.l2.l3 -> daisy-l3.
    // Expanded: outline-none->--tw-outline-style:none + outline-style:none
    // (Tailwind v4 expansion, kept verbatim).
    rules.push([
      "__daisy-diff-item-1-nested",
      [
        `${item1}:focus-visible{--tw-outline-style:none;outline-style:none;}` +
          `${item1} > *{pointer-events:none;position:absolute;top:0;bottom:0;left:0;height:100%;width:100cqi;max-width:none;object-fit:cover;object-position:center;}`,
      ],
      { layer: "daisy-l3", internal: true },
    ]);
  }

  return rules;
}
