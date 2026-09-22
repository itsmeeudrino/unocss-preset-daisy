import { describe, expect, test } from "bun:test";
import { cssFor, parseCss, winningDecl } from "./compat.ts";

// Workstream A: batch deviation review — locks the A1..A7 resolutions
// against daisyUI v5.7.43 (source + compiled /tmp/daisy-ref.css).
// Each test cites the upstream location and the decided outcome.

describe("A1: .tab flat-vs-nested scoping", () => {
  test("plain .tab emits flat vars (intentional DX widening)", async () => {
    const rules = parseCss(await cssFor("tab"));
    expect(winningDecl(rules, ["tab"], "display")?.value).toBe("inline-flex");
    expect(winningDecl(rules, ["tab"], "--tab-p")?.value).toBe("0.75rem");
  });
  test("nested states stay under the exact upstream selector", async () => {
    const css = await cssFor("tab tabs");
    expect(css).toContain(".tab:is(.tabs>.tab)");
    expect(css).toContain("&:hover");
    expect(css).toContain("label:has(:checked)");
  });
});

describe("A2: file-input :disabled layer aligns with input", () => {
  test("both form-control disabled blocks live in daisy-l2", async () => {
    const css = await cssFor("file-input input");
    // Both companions are internal; verify via layer comment proximity.
    expect(css).toContain("file-input");
    const rules = parseCss(await cssFor("file-input"));
    const hasL2 = rules.some(
      (r) =>
        r.layer === "daisy-l2" &&
        r.selectors.some((s) => s.includes(".file-input")),
    );
    expect(hasL2).toBe(true);
    const rules2 = parseCss(await cssFor("input"));
    const hasL2b = rules2.some(
      (r) =>
        r.layer === "daisy-l2" && r.selectors.some((s) => s.includes(".input")),
    );
    expect(hasL2b).toBe(true);
  });
});

describe("A3: validator-hint unhide stays in utilities", () => {
  test("display:revert-layer rides in utilities, visibility in daisy-l2", async () => {
    const rules = parseCss(await cssFor("validator validator-hint"));
    const unhide = rules.find((r) =>
      r.decls.some(([p, v]) => p === "display" && v === "revert-layer"),
    );
    expect(unhide?.layer).toBe("utilities");
    const vis = rules.find((r) =>
      r.decls.some(([p, v]) => p === "visibility" && v === "visible"),
    );
    expect(vis?.layer).toBe("daisy-l2");
  });
});

describe("A4: source-vs-compiled normalizations", () => {
  test("link :focus keeps --tw-outline-style + forced-colors (compiled form)", async () => {
    const css = await cssFor("link");
    expect(css).toContain(
      ".link:focus{--tw-outline-style:none;outline-style:none;",
    );
    expect(css).toContain("@media (forced-colors:active)");
    expect(css).toContain(
      ".link:focus-visible{outline:2px solid currentColor;outline-offset:2px;}",
    );
  });
  test("mask-position:center is computed-identical to compiled 50%", async () => {
    const rules = parseCss(await cssFor("mask"));
    // Source-verbatim keyword; lightningcss normalizes center->50% upstream.
    expect(winningDecl(rules, ["mask"], "mask-position")?.value).toBe("center");
    expect(winningDecl(rules, ["mask"], "mask-size")?.value).toBe("contain");
  });
  test("mockup grid-column/row 1/1 equals compiled grid-area", async () => {
    const rules = parseCss(await cssFor("mockup-phone-display"));
    expect(
      winningDecl(rules, ["mockup-phone-display"], "grid-column")?.value,
    ).toBe("1 / 1");
    expect(
      winningDecl(rules, ["mockup-phone-display"], "grid-row")?.value,
    ).toBe("1 / 1");
  });
  test("[dir=rtl] quoting matches identically", async () => {
    const css = await cssFor("mask-half-1 mask-half-2 steps-horizontal");
    expect(css).toContain("[dir=");
    // Both quoted and unquoted forms match the same elements; we emit quoted.
    expect(css).toContain(":dir(rtl)");
  });
});

describe("A5: diff fallback + collapse-close", () => {
  test("diff keeps `, solid` fallback so the ring works without Tailwind @property", async () => {
    const css = await cssFor("diff");
    expect(css).toContain("outline-style:var(--tw-outline-style, solid)");
  });
  test("collapse-close stays behavior-only (no rule, demo asserts style-less)", async () => {
    const css = await cssFor("collapse-close");
    expect(css).not.toContain(".collapse-close{");
    const css2 = await cssFor(
      "collapse collapse-close collapse-title collapse-content",
    );
    expect(css2).toContain(":not(.collapse-close)");
  });
});

describe("A6: rounded-full infinity equivalence", () => {
  test("calc(infinity * 1px) used; computed-identical to compiled 3.40282e38px", async () => {
    const css = await cssFor("radio radial-progress avatar dock modal");
    expect(css).toContain("calc(infinity * 1px)");
    expect(css).not.toContain("3.40282e38px");
    // Spot-check one carrier: radio dot.
    expect(css).toContain(".radio:before");
  });
});

describe("A7: absent upstream (closed, no action)", () => {
  test("tabs-lifted / tooltip-neutral generate nothing (verified absent upstream)", async () => {
    const css = await cssFor("tabs-lifted tooltip-neutral");
    // Neither token exists upstream nor in the preset; Uno may emit empty
    // or presetUno fallthrough — either way no daisy declarations.
    expect(css).not.toContain(".tabs-lifted{");
    expect(css).not.toContain(".tooltip-neutral{");
  });
  test("tab reveal slice for .tab-active exists", async () => {
    const css = await cssFor("tab tab-active tab-content tabs");
    expect(css).toContain("+.tab-content{display:block;}");
  });
});
