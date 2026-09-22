import { describe, expect, test } from "bun:test";
import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import { parseCss, winningDecl } from "./compat.ts";

// Workstream C: composed-mode (presetUno + presetDaisy) duplicate output.
// Locks the deterministic winner for overlapping utilities.

async function composedCss(classes: string): Promise<string> {
  const uno = await createGenerator({
    presets: [presetUno(), presetDaisy()],
    separators: [":"],
  });
  const { css } = await uno.generate(classes, { preflights: false });
  return css;
}

describe("composed color utilities", () => {
  test("bg-primary text-accent border-error win as var(--color-*)", async () => {
    const rules = parseCss(
      await composedCss("bg-primary text-accent border-error"),
    );
    expect(winningDecl(rules, ["bg-primary"], "background-color")?.value).toBe(
      "var(--color-primary)",
    );
    expect(winningDecl(rules, ["text-accent"], "color")?.value).toBe(
      "var(--color-accent)",
    );
    expect(winningDecl(rules, ["border-error"], "border-color")?.value).toBe(
      "var(--color-error)",
    );
  });
  test("opacity modifier uses upstream color-mix form", async () => {
    const rules = parseCss(await composedCss("bg-primary/50"));
    expect(
      winningDecl(rules, ["bg-primary/50"], "background-color")?.value,
    ).toBe("color-mix(in oklab, var(--color-primary) 50%, #0000)");
  });
  test("single rule per token (no noisy duplication)", async () => {
    const css = await composedCss("bg-primary");
    expect(css.match(/\.bg-primary/g)?.length).toBe(1);
  });
});

describe("filter shadowing (known limitation)", () => {
  test("OUR .filter component wins over presetUno filter utility", async () => {
    const css = await composedCss("filter");
    expect(css).toContain(".filter{display:flex;");
    // presetUno's filter utility would emit `filter:var(--un-...)`; it must not appear.
    expect(css).not.toContain("--un-filter");
  });
});
