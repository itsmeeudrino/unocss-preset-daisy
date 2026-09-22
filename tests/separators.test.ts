import { beforeAll, describe, expect, test } from "bun:test";
import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import batch1 from "./fixtures/batch1-tokens.json";
import batch2 from "./fixtures/batch2-tokens.json";
import batch3 from "./fixtures/batch3-tokens.json";
import batch4 from "./fixtures/batch4-tokens.json";
import batch5 from "./fixtures/batch5-tokens.json";

// Regression gate for the `separators: [':']` hard requirement (README
// quickstart, example/uno.config.ts, tests/compat.ts).
//
// Proven during integration by a one-off 463-token sweep (/tmp/sweep.ts):
// daisyUI names hover-3d, file-input*, link-* collide with Uno's dash-form
// variants when '-' is a variant separator — some render EMPTY (variant eats
// the token before exact matching), file-input renders WRONG styles.
// Rescued into this test so the sweep can't be lost with /tmp and future
// components can't silently reintroduce eaten classes.
//
// What it locks:
// 1. Under separators [':'] EVERY fixture/core token is styled — either by its
//    own exact class rule, or (for parent-scoped children, see map below) by
//    its owning parent token's output. Upstream parity: compiled daisyUI has
//    no standalone `.step{` / `.tooltip-content{` either — those live under
//    `.steps .step`, `.tooltip .tooltip-content`, …
// 2. Under default separators [':', '-'] the known collision tokens do NOT —
//    this documents WHY the README requirement exists. If Uno ever changes
//    dash-variant parsing and this test fails, re-evaluate the requirement
//    (and the README), don't just delete the assertion.

type Gen = Awaited<ReturnType<typeof createGenerator>>;

const CORE_TOKENS = [
  "btn",
  "btn-primary",
  "badge",
  "card",
  "card-body",
  "input",
  "modal-box",
  "menu",
  "join",
  "glass",
  "bg-primary",
  "rounded-box",
] as const;

// Tokens proven eaten under default dash-form variants (see header).
const EATEN_UNDER_DEFAULT = [
  "hover-3d",
  "link-primary",
  "link-hover",
  "file-input-primary",
];

// Tokens with no standalone rule (upstream parity — they only exist inside
// their parent's selectors). Verified: solo output is empty for all of these,
// and the parent token's output carries the child's exact class. If a new
// token appears solo-empty and is NOT in this map, that's a missing rule —
// fix the rule, don't extend the map blindly.
const PARENT_SCOPED: Record<string, string> = {
  "collapse-close": "collapse", // upstream: behavior-only, referenced via :not(.collapse-close)
  "indicator-item": "indicator", // .indicator :where(.indicator-item)
  "list-row": "list", // .list … .list-row grid + divider
  "list-col-grow": "list", // :has(.list-col-grow) column counts
  "mockup-browser-toolbar": "mockup-browser", // .mockup-browser .mockup-browser-toolbar
  "row-hover": "table", // @media (hover:hover) tr.row-hover:hover
  step: "steps", // .steps .step
  "step-icon": "steps", // .steps .step … > .step-icon
  "tooltip-content": "tooltip", // .tooltip .tooltip-content
};

/** `.token` not followed by [A-Za-z0-9_-] — `.tabs` can't satisfy token `tab`,
 *  `.file-input-primary` can't satisfy token `file-input`. */
function exactClassRe(token: string): RegExp {
  return new RegExp(
    `\\.${token.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`,
  );
}

async function gen(separators: string[]): Promise<Gen> {
  return createGenerator({
    presets: [presetUno(), presetDaisy()],
    separators,
  } as never);
}

function allTokens(): string[] {
  const toks = new Set<string>(CORE_TOKENS);
  for (const arr of [batch1, batch2, batch3, batch4, batch5]) {
    for (const t of arr as string[]) toks.add(t);
  }
  return [...toks];
}

describe("separators requirement (dash-variant sweep)", () => {
  let tokens: string[];
  let colonGen: Gen;

  beforeAll(async () => {
    tokens = allTokens();
    colonGen = await gen([":"]);
  });

  test("fixture sweep loaded the full token set (guards against import drift)", () => {
    // 451 fixture tokens (80+73+81+107+110) + 12 core, minus cross-batch overlap.
    expect(tokens.length).toBeGreaterThanOrEqual(450);
    expect(tokens.length).toBeLessThanOrEqual(470);
  });

  test("parent-scoped map matches the fixture token set (drift guard)", () => {
    for (const t of Object.keys(PARENT_SCOPED)) expect(tokens).toContain(t);
  });

  test('under separators [":"] every token is styled (own class or via parent)', async () => {
    const broken: string[] = [];
    const parentCache = new Map<string, string>();
    for (const t of tokens) {
      const { css } = await colonGen.generate(t, { preflights: false });
      if (css && exactClassRe(t).test(css)) continue;
      const parent = PARENT_SCOPED[t];
      if (parent === undefined) {
        broken.push(t); // solo-empty and not documented parent-scoped → missing rule
        continue;
      }
      let pcss = parentCache.get(parent);
      if (pcss === undefined) {
        pcss = (await colonGen.generate(parent, { preflights: false })).css;
        parentCache.set(parent, pcss);
      }
      if (!pcss || !exactClassRe(t).test(pcss))
        broken.push(`${t} (not styled by parent ${parent})`);
    }
    expect(broken).toEqual([]);
  }, 120_000);

  test('default separators eat hover-3d / link-* / file-input* (why README requires [":"])', async () => {
    const defaultGen = await gen([":", "-"]);
    const survivors: string[] = [];
    for (const t of EATEN_UNDER_DEFAULT) {
      const { css } = await defaultGen.generate(t, { preflights: false });
      if (css && exactClassRe(t).test(css)) survivors.push(t);
    }
    expect(survivors).toEqual([]);

    // `file-input` is the subtle one: it still emits `.file-input` under
    // default separators, but the surrounding rules differ from the
    // correct output — i.e. wrong styles, not empty ones.
    const colon = await colonGen.generate("file-input", { preflights: false });
    const dash = await defaultGen.generate("file-input", { preflights: false });
    expect(exactClassRe("file-input").test(dash.css)).toBe(true);
    expect(dash.css).not.toBe(colon.css);
  }, 60_000);
});
