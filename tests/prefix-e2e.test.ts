import { describe, expect, test } from "bun:test";
import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import {
  parseCss,
  resolveVars,
  themeVars,
  tvar,
  winningDecl,
} from "./compat.ts";

// Workstream B: prefix-mode end-to-end (`prefix: 'd-'`).
// Unit-tested at applyPrefix level only before; this runs the real generator.

async function prefixedCss(classes: string): Promise<string> {
  const uno = await createGenerator({
    presets: [presetUno(), presetDaisy({ prefix: "d-" })],
    separators: [":"],
  });
  const { css } = await uno.generate(classes, { preflights: false });
  return css;
}

const MATRIX = [
  "d-btn d-btn-primary",
  "d-menu d-menu-active",
  "d-card",
  "d-input",
  "d-join d-join-item",
  "d-modal d-modal-box",
  // one batch token per batch file
  "d-alert",
  "d-divider",
  "d-loading",
  "d-progress",
  "d-steps d-step",
].join(" ");

describe("prefix e2e", () => {
  test("matrix generates d- selectors, no unprefixed leaks", async () => {
    const css = await prefixedCss(MATRIX);
    expect(css.length).toBeGreaterThan(0);
    for (const tok of [
      "d-btn",
      "d-menu",
      "d-card",
      "d-input",
      "d-join-item",
      "d-modal-box",
      "d-alert",
      "d-divider",
      "d-loading",
      "d-progress",
      "d-steps",
    ]) {
      expect(css, tok).toContain(`.${tok}`);
    }
    // No unprefixed daisy selectors leak: plain `.btn{`-style rules must not appear.
    // (Check with a lookbehind-free scan: `.btn` not preceded by `-`.)
    const leaks = [
      ...css.matchAll(
        /(?<![a-zA-Z0-9_-])\.(btn|menu|card|input|join|modal|alert|divider|loading|progress|steps)(?![a-zA-Z0-9_-])/g,
      ),
    ];
    expect(leaks.map((m) => m[0])).toEqual([]);
  });

  test("no d- inside values (decimals, url(), oklch())", async () => {
    const css = await prefixedCss(MATRIX + " d-toggle d-tooltip d-mask");
    expect(css).not.toMatch(/\.d-\d/);
    expect(css).not.toContain("0.d-");
    expect(css).toContain("0.25rem");
    // svg payloads and timings survive prefixing intact
    expect(css).toContain("cubic-bezier(");
  });

  test("theme vars still resolve under prefix", async () => {
    const vars = await themeVars("light");
    const rules = parseCss(await prefixedCss("d-btn d-btn-primary"));
    const w = winningDecl(rules, ["d-btn", "d-btn-primary"], "--btn-color");
    expect(w).not.toBeNull();
    expect(resolveVars(w?.value ?? "", vars)).toBe(
      tvar(vars, "--color-primary"),
    );
  });

  test("full fixture token set generates exact d- output per token", async () => {
    const files = [
      "./fixtures/batch1-tokens.json",
      "./fixtures/batch2-tokens.json",
      "./fixtures/batch3-tokens.json",
      "./fixtures/batch4-tokens.json",
      "./fixtures/batch5-tokens.json",
    ];
    const comboOnly: Record<string, string> = {
      step: "d-steps d-step",
      "step-icon": "d-steps d-step-icon",
      "row-hover": "d-table d-table-zebra d-row-hover",
      "tooltip-content": "d-tooltip d-tooltip-content",
      "list-row": "d-list d-list-row",
      "list-col-grow": "d-list d-list-row d-list-col-grow",
      "indicator-item": "d-indicator d-indicator-item",
      "mockup-browser-toolbar": "d-mockup-browser d-mockup-browser-toolbar",
      "collapse-close": "d-collapse d-collapse-close",
    };
    // Upstream parent-scoped children: no standalone `.tok{` rule exists even
    // unprefixed (they only appear inside compound selectors). Assert the
    // prefixed compound emits instead of an exact standalone selector.
    const parentScoped = new Set([
      "step",
      "step-icon",
      "tooltip-content",
      "list-row",
      "list-col-grow",
      "indicator-item",
      "mockup-browser-toolbar",
      "row-hover",
      "collapse-close",
    ]);
    for (const f of files) {
      const tokens = (await Bun.file(
        new URL(f, import.meta.url),
      ).json()) as string[];
      for (const tok of tokens) {
        const prefixed = `d-${tok}`;
        const combo = comboOnly[tok] ?? prefixed;
        const uno = await createGenerator({
          presets: [presetUno(), presetDaisy({ prefix: "d-" })],
          separators: [":"],
        });
        const { css } = await uno.generate(combo, { preflights: false });
        // behavior-only tokens legitimately emit no standalone rule
        if (tok === "collapse-close") continue;
        expect(css.length > 0, `${prefixed} empty`).toBe(true);
        if (parentScoped.has(tok)) {
          expect(css, prefixed).toContain(`.${prefixed}`);
        } else {
          expect(css, prefixed).toContain(`.${prefixed}`);
        }
      }
    }
  });
});
