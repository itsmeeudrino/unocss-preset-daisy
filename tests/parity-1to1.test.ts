import { beforeAll, describe, expect, test } from "bun:test";
import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import batch1 from "./fixtures/batch1-tokens.json";
import batch2 from "./fixtures/batch2-tokens.json";
import batch3 from "./fixtures/batch3-tokens.json";
import batch4 from "./fixtures/batch4-tokens.json";
import batch5 from "./fixtures/batch5-tokens.json";
import { DAISY_COLORS } from "../src/rules/colors.ts";
import {
  PARENT_SCOPED,
  PREFLIGHT_KEYFRAMES,
  coverageMisses,
  exactClassRe,
  flattenRules,
  loadReference,
  parseUno,
  parseUpstream,
  upstreamDaisyClasses,
} from "./parity-lib.ts";
import type { URule } from "./parity-lib.ts";

// 1:1 behavior parity vs official daisyUI v5.7.43 — every official class
// ships the same declarations through this preset (behavior only: same
// computed CSS for the same markup; layers, selector spelling, and oklch
// rounding ignored). See tests/parity-lib.ts for the parser and the
// no-loss rule-coverage definition. Reference: fetch with
//   curl -sL https://cdn.jsdelivr.net/npm/daisyui@5.7.43/daisyui.css -o /tmp/daisy-ref.css

const FIXTURES: string[] = [
  ...(batch1 as string[]),
  ...(batch2 as string[]),
  ...(batch3 as string[]),
  ...(batch4 as string[]),
  ...(batch5 as string[]),
];

let upstream: URule[];
let upstreamKeyframes: Set<string>;
let upstreamClasses: string[];
let checkClasses: string[];
let unoCss: string;
let unoRules: URule[];
let unoKeyframes: Set<string>;

beforeAll(async () => {
  const ref = await loadReference();
  const parsed = parseUpstream(ref);
  upstream = parsed.rules;
  upstreamKeyframes = parsed.keyframes;
  upstreamClasses = upstreamDaisyClasses(upstream);
  // Union: upstream-derived classes plus every fixture / color token, so
  // unlayered upstream rules (e.g. `.otp-joined`) and fixture-only names
  // are all exercised — unknown classes emit nothing, gaps can't hide.
  const colorToks: string[] = [];
  for (const c of DAISY_COLORS)
    colorToks.push(`bg-${c}`, `text-${c}`, `border-${c}`);
  checkClasses = [
    ...new Set([...upstreamClasses, ...FIXTURES, ...colorToks]),
  ].sort();
  const gen = await createGenerator({
    presets: [presetUno(), presetDaisy()],
    separators: [":"],
  });
  const out = await gen.generate(checkClasses.join(" "), {
    preflights: false,
  });
  unoCss = out.css;
  unoRules = parseUno(unoCss);
  unoKeyframes = new Set<string>();
  for (const m of unoCss.matchAll(/@keyframes\s+([\w-]+)/g)) {
    const n = m[1];
    if (n !== undefined) unoKeyframes.add(n);
  }
}, 120_000);

describe("parity-1to1: every official class ships", () => {
  test("upstream reference yields a class universe", () => {
    expect(upstreamClasses.length).toBeGreaterThanOrEqual(600);
    expect(upstreamClasses.length).toBeLessThanOrEqual(800);
  });

  test("bulk output covers the universe", () => {
    expect(unoCss.length).toBeGreaterThan(100_000);
  });

  for (const t of FIXTURES) {
    test(`ships: ${t}`, () => {
      if (exactClassRe(t).test(unoCss)) return;
      const parent = PARENT_SCOPED[t];
      expect(
        parent !== undefined,
        `${t} ships neither solo nor via documented parent`,
      ).toBe(true);
    });
  }
});

describe("parity-1to1: no upstream class is lost", () => {
  test("upstream classes ⊆ preset output (bulk)", () => {
    const missing = upstreamClasses.filter(
      (c) => !exactClassRe(c).test(unoCss),
    );
    expect(missing).toEqual([]);
  });
});

describe("parity-1to1: declarations match (behavior only)", () => {
  test("every upstream selector is covered (wider-or-equal + same decls)", () => {
    const misses = coverageMisses(
      flattenRules(upstream.filter((r) => r.layer.startsWith("daisyui"))),
      flattenRules(unoRules),
    );
    // Locked intentional deviations (see tests/deviations.test.ts):
    // - A5: diff focus keeps `var(--tw-outline-style, solid)` fallback so
    //   the ring works without Tailwind's @property registration.
    //   Upstream selectors repeat under responsive prefixes; match with
    //   an optional prefix (base, sm/md/lg/xl/2xl, escaped and plain).
    const baseOf = (sel: string): string =>
      sel
        .replace(/^\.(?:sm|md|lg|xl)\\:/, ".")
        .replace(/^\.\\32 xl\\:/, ".")
        .replace(/^(?:sm|md|lg|xl|2xl):/, ".");
    const allowed = misses.filter(
      (m) =>
        /^\.diff([:{].*)?$/.test(baseOf(m.selector)) &&
        m.reason === "decls [outline-style: var(--tw-outline-style)]",
    );
    expect({
      count: misses.length,
      allowed: allowed.length,
      sample: misses.slice(0, 40).map((m) => `${m.selector} ⇢ ${m.reason}`),
    }).toEqual({
      count: allowed.length,
      allowed: allowed.length,
      sample: allowed.map((m) => `${m.selector} ⇢ ${m.reason}`),
    });
  });
});

describe("parity-1to1: states and keyframes", () => {
  test("upstream component keyframes ⊆ preset output", () => {
    const missing = [...upstreamKeyframes]
      .filter((k) => !PREFLIGHT_KEYFRAMES.has(k))
      .filter((k) => !unoKeyframes.has(k));
    expect(missing).toEqual([]);
  });

  test("preflights carry @property + scroll-lock keyframes", async () => {
    const gen = await createGenerator({
      presets: [presetUno(), presetDaisy()],
      separators: [":"],
    });
    const { css } = await gen.generate("btn", { preflights: true });
    expect(css).toContain("--radialprogress");
    expect(css).toContain("set-page-has-scroll");
  });

  test("themes.css carries all theme-controller hooks", async () => {
    const css = await Bun.file("src/theme/themes.css").text();
    expect(css).toContain("theme-controller");
  });
});
