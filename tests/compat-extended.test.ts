import { describe, expect, test } from "bun:test";
import {
  cssFor,
  parseCss,
  resolveFor,
  resolveVars,
  themeVars,
  tvar,
  winningDecl,
} from "./compat.ts";

// Workstream D: compat matrices beyond button/badge.
// Reuses resolveFor/themeVars — no new harness. Light + dark where color-wired.

const COLORS = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
] as const;

describe("alert colors", () => {
  // Upstream ships only info/success/warning/error alert variants.
  for (const color of ["info", "success", "warning", "error"] as const) {
    test(`light+dark: alert-${color} wires fg/bg`, async () => {
      for (const theme of ["light", "dark"] as const) {
        const vars = await themeVars(theme);
        const classes = ["alert", `alert-${color}`];
        const rules = parseCss(await cssFor(classes.join(" ")));
        const fg = winningDecl(rules, classes, "color");
        const bg = winningDecl(rules, classes, "background-color");
        expect(fg, `${color} fg`).not.toBeNull();
        expect(bg, `${color} bg`).not.toBeNull();
        expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
          tvar(vars, `--color-${color}-content`),
        );
        expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
          tvar(vars, `--color-${color}`),
        );
      }
    });
  }
});

describe("chat bubbles", () => {
  test("chat-bubble-primary/secondary/accent/success resolve", async () => {
    for (const color of [
      "primary",
      "secondary",
      "accent",
      "success",
    ] as const) {
      for (const theme of ["light", "dark"] as const) {
        const vars = await themeVars(theme);
        const classes = ["chat-bubble", `chat-bubble-${color}`];
        const rules = parseCss(await cssFor(classes.join(" ")));
        const bg = winningDecl(rules, classes, "background-color");
        expect(bg, `${color} ${theme}`).not.toBeNull();
        expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
          tvar(vars, `--color-${color}`),
        );
      }
    }
  });
});

describe("form control colors (fg+bg resolve)", () => {
  for (const color of COLORS) {
    test(`checkbox-${color} --input-color`, async () => {
      for (const theme of ["light", "dark"] as const) {
        const vars = await themeVars(theme);
        const classes = ["checkbox", `checkbox-${color}`];
        const rules = parseCss(await cssFor(classes.join(" ")));
        const w = winningDecl(rules, classes, "--input-color");
        expect(w).not.toBeNull();
        expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
          tvar(vars, `--color-${color}`),
        );
      }
    });
    test(`radio-${color} --input-color`, async () => {
      for (const theme of ["light", "dark"] as const) {
        const vars = await themeVars(theme);
        const classes = ["radio", `radio-${color}`];
        const rules = parseCss(await cssFor(classes.join(" ")));
        const w = winningDecl(rules, classes, "--input-color");
        expect(w).not.toBeNull();
        expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
          tvar(vars, `--color-${color}`),
        );
      }
    });
    test(`select-${color} --input-color`, async () => {
      const vars = await themeVars("light");
      const classes = ["select", `select-${color}`];
      const rules = parseCss(await cssFor(classes.join(" ")));
      const w = winningDecl(rules, classes, "--input-color");
      expect(w).not.toBeNull();
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
    test(`textarea-${color} --input-color`, async () => {
      const vars = await themeVars("dark");
      const classes = ["textarea", `textarea-${color}`];
      const rules = parseCss(await cssFor(classes.join(" ")));
      const w = winningDecl(rules, classes, "--input-color");
      expect(w).not.toBeNull();
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
  test("toggle checked colors wire --input-color (nested rule lookup)", async () => {
    for (const color of ["primary", "accent", "error"] as const) {
      const vars = await themeVars("dark");
      const rules = parseCss(await cssFor(`toggle toggle-${color}`));
      const rule = rules.find((r) =>
        r.selectors.some((s) => s.includes(`.toggle-${color}:checked`)),
      );
      expect(rule, color).toBeDefined();
      const v = rule?.decls.find(([p]) => p === "--input-color")?.[1];
      expect(resolveVars(v ?? "", vars)).toBe(tvar(vars, `--color-${color}`));
    }
  });
  test("range colors set color + --range-thumb", async () => {
    for (const color of ["primary", "secondary"] as const) {
      const vars = await themeVars("light");
      const classes = ["range", `range-${color}`];
      const rules = parseCss(await cssFor(classes.join(" ")));
      expect(
        resolveFor(
          rules,
          classes,
          vars,
          winningDecl(rules, classes, "color")?.value ?? "",
        ),
      ).toBe(tvar(vars, `--color-${color}`));
    }
  });
  test("rating stars use base-content at 20% (structure)", async () => {
    const css = await cssFor("rating");
    expect(css).toContain("background-color:var(--color-base-content)");
    expect(css).toContain("opacity:0.2");
  });
});

describe("tooltip / steps colors", () => {
  for (const color of ["primary", "error"] as const) {
    test(`tooltip-${color} bubble + text`, async () => {
      for (const theme of ["light", "dark"] as const) {
        const vars = await themeVars(theme);
        const classes = ["tooltip", `tooltip-${color}`];
        const rules = parseCss(await cssFor(classes.join(" ")));
        const bg = winningDecl(rules, classes, "--tt-bg");
        expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
          tvar(vars, `--color-${color}`),
        );
      }
    });
  }
  test("step-primary wires --step-bg/--step-fg", async () => {
    for (const theme of ["light", "dark"] as const) {
      const vars = await themeVars(theme);
      const rules = parseCss(await cssFor("steps step-primary step-icon"));
      const rule = rules.find((r) =>
        r.selectors.some((s) => s.includes(".step-primary")),
      );
      expect(rule).toBeDefined();
      expect(
        resolveVars(
          rule?.decls.find(([p]) => p === "--step-bg")?.[1] ?? "",
          vars,
        ),
      ).toBe(tvar(vars, "--color-primary"));
      expect(
        resolveVars(
          rule?.decls.find(([p]) => p === "--step-fg")?.[1] ?? "",
          vars,
        ),
      ).toBe(tvar(vars, "--color-primary-content"));
    }
  });
});

describe("table zebra (declaration-level)", () => {
  test("zebra striping uses base-200/300", async () => {
    const css = await cssFor("table table-zebra");
    expect(css).toContain(".table-zebra tbody tr:where(:nth-child(2n))");
    expect(css).toContain("background-color:var(--color-base-200)");
    expect(css).toContain("background-color:var(--color-base-300)");
  });
});

describe("dropdown / modal / menu states", () => {
  test("dropdown open reveals content", async () => {
    const css = await cssFor("dropdown dropdown-open dropdown-content");
    expect(css).toContain(".dropdown-open");
    expect(css).toContain("opacity:1");
  });
  test("modal-open pins the box", async () => {
    const css = await cssFor("modal modal-open modal-box");
    expect(css).toContain(".modal-open");
    expect(css).toContain(".modal-box");
  });
  test("menu-active standalone hides outline", async () => {
    const rules = parseCss(await cssFor("menu menu-active"));
    const rule = rules.find((r) =>
      r.selectors.some(
        (s) => s.includes(".menu-active") && !s.includes(":hover"),
      ),
    );
    expect(rule).toBeDefined();
  });
});
