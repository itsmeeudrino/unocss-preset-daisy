import { describe, expect, test } from "bun:test";
import { createGenerator } from "unocss";
import { presetUno } from "unocss";
import { batch1Shortcuts } from "../src/shortcuts/batch1.ts";
import { batch1Rules } from "../src/rules/batch1.ts";
import {
  parseCss,
  resolveFor,
  themeVars,
  tvar,
  winningDecl,
} from "./compat.ts";
import tokens from "./fixtures/batch1-tokens.json";

// Tests for P3 batch-1: alert, aura, avatar, breadcrumbs, calendar, carousel,
// chat, checkbox, collapse, countdown, diff.
//
// Uses a standalone test preset (batch1 shortcuts + rules composed with
// presetUno) — NOT the main preset — so every assertion isolates this batch.
// Cascade assertions reuse the shared harness from ./compat.ts: winningDecl
// emulates the layer/specificity/order cascade, resolveFor/themeVars resolve
// var() chains against the real theme values from src/theme/themes.css.

interface Batch1Opts {
  prefix: string;
  include: string[];
  exclude: string[];
}

const baseOpts: Batch1Opts = { prefix: "", include: [], exclude: [] };

const genCache = new Map<string, Awaited<ReturnType<typeof createGenerator>>>();

async function batchUno(
  opts: Batch1Opts,
): Promise<Awaited<ReturnType<typeof createGenerator>>> {
  const k = JSON.stringify(opts);
  const hit = genCache.get(k);
  if (hit !== undefined) return hit;
  const uno = await createGenerator({
    presets: [
      presetUno(),
      {
        name: "batch1test",
        shortcuts: batch1Shortcuts(opts),
        rules: batch1Rules(opts) ?? [],
      },
    ],
  });
  genCache.set(k, uno);
  return uno;
}

async function genBatch1(
  classes: string,
  opts: Batch1Opts = baseOpts,
): Promise<string> {
  const uno = await batchUno(opts);
  const { css } = await uno.generate(classes, { preflights: false });
  return css;
}

// collapse-close is behavior-only upstream: no .collapse-close rule exists
// (it is only referenced via :not(.collapse-close) guards), so it cannot
// emit CSS on its own. Everything else must generate non-empty CSS solo.
const UNSTYLED = new Set(["collapse-close"]);

describe("batch1 smoke: every public token generates CSS solo", () => {
  for (const t of tokens as string[]) {
    if (UNSTYLED.has(t)) continue;
    test(t, async () => {
      const css = await genBatch1(t);
      expect(css.length).toBeGreaterThan(0);
      expect(css).toContain(`.${t}`);
    });
  }

  test("collapse-close is behavior-only (no upstream rule)", async () => {
    const css = await genBatch1("collapse-close");
    expect(css).not.toContain(".collapse-close{");
  });
});

describe("alert color matrix resolves to theme values", () => {
  const cases: Array<[string, string]> = [
    ["alert-info", "info"],
    ["alert-success", "success"],
    ["alert-warning", "warning"],
    ["alert-error", "error"],
  ];
  for (const [cls, color] of cases) {
    test(`dark: ${cls} text/bg/border wire to ${color}`, async () => {
      const classes = ["alert", cls];
      const rules = parseCss(await genBatch1(classes.join(" ")));
      const vars = await themeVars("dark");
      const fg = winningDecl(rules, classes, "color");
      const bg = winningDecl(rules, classes, "background-color");
      const bd = winningDecl(rules, classes, "border-color");
      expect(fg).not.toBeNull();
      expect(bg).not.toBeNull();
      expect(bd).not.toBeNull();
      expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}-content`),
      );
      expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
      expect(resolveFor(rules, classes, vars, bd?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }

  test("dark: alert-soft alert-error tints error over base-100", async () => {
    const classes = ["alert", "alert-soft", "alert-error"];
    const rules = parseCss(await genBatch1(classes.join(" ")));
    const vars = await themeVars("dark");
    const fg = winningDecl(rules, classes, "color");
    const bg = winningDecl(rules, classes, "background");
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();
    expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
      tvar(vars, "--color-error"),
    );
    expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
      `color-mix(in oklab, ${tvar(vars, "--color-error")} 8%, ${tvar(vars, "--color-base-100")})`,
    );
  });

  test("alert-outline alert-info: info text on transparent bg", async () => {
    const classes = ["alert", "alert-outline", "alert-info"];
    const rules = parseCss(await genBatch1(classes.join(" ")));
    const vars = await themeVars("dark");
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-info"));
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "background-color")?.value ?? "",
      ),
    ).toBe("#0000");
  });

  test("alert-dash sets dashed border", async () => {
    const rules = parseCss(await genBatch1("alert alert-dash"));
    expect(
      winningDecl(rules, ["alert", "alert-dash"], "border-style")?.value,
    ).toBe("dashed");
  });

  test("plain alert uses base colors", async () => {
    const classes = ["alert"];
    const rules = parseCss(await genBatch1("alert"));
    const vars = await themeVars("light");
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-base-content"));
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "background-color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-base-200"));
  });
});

describe("chat bubble matrix resolves to theme values", () => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ] as const;
  for (const color of colors) {
    test(`dark: chat-bubble-${color}`, async () => {
      const classes = ["chat-bubble", `chat-bubble-${color}`];
      const rules = parseCss(await genBatch1(classes.join(" ")));
      const vars = await themeVars("dark");
      const fg = winningDecl(rules, classes, "color");
      const bg = winningDecl(rules, classes, "background-color");
      expect(fg).not.toBeNull();
      expect(bg).not.toBeNull();
      expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}-content`),
      );
      expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }

  test("plain bubble uses base-300", async () => {
    const classes = ["chat-bubble"];
    const rules = parseCss(await genBatch1("chat-bubble"));
    const vars = await themeVars("dark");
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "background-color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-base-300"));
  });

  test("chat-start/end placement", async () => {
    const css = await genBatch1(
      "chat chat-start chat-end chat-bubble chat-header chat-footer chat-image",
    );
    expect(css).toContain("place-items:start");
    expect(css).toContain("place-items:end");
    expect(css).toContain("border-end-start-radius:0");
    expect(css).toContain("border-end-end-radius:0");
    expect(css).toContain("grid-template-columns:auto 1fr");
    expect(css).toContain("grid-template-columns:1fr auto");
  });
});

describe("checkbox matrix resolves to theme values", () => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ] as const;
  for (const color of colors) {
    test(`checkbox-${color} sets --input-color`, async () => {
      const classes = ["checkbox", `checkbox-${color}`];
      const rules = parseCss(await genBatch1(classes.join(" ")));
      const vars = await themeVars("light");
      const ic = winningDecl(rules, classes, "--input-color");
      const fg = winningDecl(rules, classes, "color");
      expect(ic).not.toBeNull();
      expect(fg).not.toBeNull();
      expect(resolveFor(rules, classes, vars, ic?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
      expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}-content`),
      );
    });
  }

  test("sizes match upstream numeric values", async () => {
    const expected: Record<string, [string, string]> = {
      "checkbox-xs": ["calc(var(--size-selector, 0.25rem) * 4)", "0.125rem"],
      "checkbox-sm": ["calc(var(--size-selector, 0.25rem) * 5)", "0.1875rem"],
      "checkbox-md": ["calc(var(--size-selector, 0.25rem) * 6)", "0.25rem"],
      "checkbox-lg": ["calc(var(--size-selector, 0.25rem) * 7)", "0.3125rem"],
      "checkbox-xl": ["calc(var(--size-selector, 0.25rem) * 8)", "0.375rem"],
    };
    const rules = parseCss(
      await genBatch1(`checkbox ${Object.keys(expected).join(" ")}`),
    );
    for (const [cls, [size, pad]] of Object.entries(expected)) {
      expect(winningDecl(rules, ["checkbox", cls], "--size")?.value).toBe(size);
      expect(winningDecl(rules, ["checkbox", cls], "padding")?.value).toBe(pad);
    }
  });

  test("checked/indeterminate/disabled states emit with the base", async () => {
    const css = await genBatch1("checkbox");
    expect(css).toContain(".checkbox:checked");
    expect(css).toContain(".checkbox:indeterminate");
    expect(css).toContain(".checkbox:disabled");
    expect(css).toContain("cursor:not-allowed");
    expect(css).toContain(
      "clip-path:polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%)",
    );
  });
});

describe("aura variants and sizes", () => {
  test("sizes match upstream numeric values", async () => {
    const expected: Record<string, string> = {
      "aura-xs": "0rem",
      "aura-sm": "0.0625rem",
      "aura-md": "0.125rem",
      "aura-lg": "0.15625rem",
      "aura-xl": "0.25rem",
    };
    const rules = parseCss(
      await genBatch1(`aura ${Object.keys(expected).join(" ")}`),
    );
    for (const [cls, pad] of Object.entries(expected)) {
      expect(winningDecl(rules, ["aura", cls], "--aura-padding")?.value).toBe(
        pad,
      );
    }
  });

  test("base animation + keyframes", async () => {
    const css = await genBatch1("aura");
    expect(css).toContain(
      "animation:aura var(--tw-duration, 6s) linear infinite",
    );
    expect(css).toContain("@keyframes aura");
    expect(css).toContain("@keyframes aura-glow");
    expect(css).toContain("@keyframes aura-glow-after");
  });

  test("holo and glow effects", async () => {
    const css = await genBatch1("aura-holo aura-glow");
    expect(css).toContain("repeating-conic-gradient");
    expect(css).toContain(
      "animation:aura var(--tw-duration, 20s) linear infinite",
    );
    expect(css).toContain(
      "radial-gradient(closest-corner,currentColor 0%,#0000 90%)",
    );
  });
});

describe("avatar, breadcrumbs, carousel", () => {
  test("avatar-group is flex, avatar is inline-flex", async () => {
    const rules = parseCss(await genBatch1("avatar-group avatar"));
    expect(winningDecl(rules, ["avatar-group"], "display")?.value).toBe("flex");
    expect(winningDecl(rules, ["avatar"], "display")?.value).toBe(
      "inline-flex",
    );
  });

  test("online/offline dots use success/base-300", async () => {
    const css = await genBatch1(
      "avatar-online avatar-offline avatar-placeholder",
    );
    expect(css).toContain("background-color:var(--color-success)");
    expect(css).toContain("background-color:var(--color-base-300)");
    expect(css).toContain("justify-content:center");
  });

  test("breadcrumbs base + separator", async () => {
    const rules = parseCss(await genBatch1("breadcrumbs"));
    expect(
      winningDecl(rules, ["breadcrumbs"], "margin-inline-start")?.value,
    ).toBe("-0.25rem");
    const css = await genBatch1("breadcrumbs");
    expect(css).toContain("rotate:45deg");
    expect(css).toContain('[dir="rtl"]');
    expect(css).toContain("text-decoration-line:underline");
  });

  test("carousel orientations + snap modifiers", async () => {
    const rules = parseCss(
      await genBatch1("carousel carousel-vertical carousel-item"),
    );
    expect(winningDecl(rules, ["carousel"], "display")?.value).toBe(
      "inline-flex",
    );
    expect(
      winningDecl(rules, ["carousel", "carousel-vertical"], "flex-direction")
        ?.value,
    ).toBe("column");
    expect(
      winningDecl(rules, ["carousel-item"], "scroll-snap-align")?.value,
    ).toBe("start");
    const css = await genBatch1("carousel-center carousel-end");
    expect(css).toContain("scroll-snap-align:center");
    expect(css).toContain("scroll-snap-align:end");
  });
});

describe("calendar roots", () => {
  test("cally font size", async () => {
    const rules = parseCss(await genBatch1("cally"));
    expect(winningDecl(rules, ["cally"], "font-size")?.value).toBe("0.7rem");
  });

  test("react-day-picker uses base-100", async () => {
    const classes = ["react-day-picker"];
    const rules = parseCss(await genBatch1("react-day-picker"));
    const vars = await themeVars("dark");
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "background-color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-base-100"));
  });

  test("pika-single block emits", async () => {
    const css = await genBatch1("pika-single");
    expect(css).toContain(".pika-single:is(div)");
    expect(css).toContain(".pika-button");
  });

  test("vc base references theme vars", async () => {
    const rules = parseCss(await genBatch1("vc"));
    expect(winningDecl(rules, ["vc"], "border")?.value).toContain(
      "var(--color-base-200)",
    );
    const css = await genBatch1("vc");
    expect(css).toContain('[data-vc="controls"]');
    expect(css).toContain(".vc-date__btn");
  });
});

describe("collapse, countdown, diff", () => {
  test("collapse-open forces rows", async () => {
    const rules = parseCss(await genBatch1("collapse collapse-open"));
    expect(
      winningDecl(rules, ["collapse", "collapse-open"], "grid-template-rows")
        ?.value,
    ).toBe("max-content 1fr");
  });

  test("arrow/plus markers", async () => {
    const css = await genBatch1("collapse collapse-arrow collapse-plus");
    expect(css).toContain("rotate(45deg)");
    expect(css).toContain('--tw-content:"+"');
    expect(css).toContain('--tw-content:"−"');
  });

  test("collapse-content is hidden by default", async () => {
    const rules = parseCss(await genBatch1("collapse-content"));
    expect(
      winningDecl(rules, ["collapse-content"], "content-visibility")?.value,
    ).toBe("hidden");
  });

  test("countdown line-height + digit machinery", async () => {
    const rules = parseCss(await genBatch1("countdown"));
    expect(winningDecl(rules, ["countdown"], "line-height")?.value).toBe("1em");
    const css = await genBatch1("countdown");
    expect(css).toContain("--value-hundreds");
    expect(css).toContain("\\A");
  });

  test("diff resizer + items", async () => {
    const rules = parseCss(
      await genBatch1("diff diff-resizer diff-item-1 diff-item-2"),
    );
    expect(winningDecl(rules, ["diff-resizer"], "width")?.value).toBe("50cqi");
    expect(
      winningDecl(rules, ["diff-item-1"], "border-right")?.value,
    ).toContain("var(--color-base-100)");
    const css = await genBatch1("diff diff-item-2");
    expect(css).toContain("container-type:inline-size");
    expect(css).toContain("height:1.8rem");
  });
});

describe("batch1 prefix + include/exclude", () => {
  const prefixed: Batch1Opts = { prefix: "d-", include: [], exclude: [] };

  test("prefix renames batch1 classes and keeps color wiring", async () => {
    const classes = ["d-alert", "d-alert-error"];
    const css = await genBatch1(classes.join(" "), prefixed);
    expect(css).toContain(".d-alert");
    expect(css).toContain(".d-alert-error");
    const rules = parseCss(css);
    const vars = await themeVars("dark");
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-error-content"));
    expect(
      resolveFor(
        rules,
        classes,
        vars,
        winningDecl(rules, classes, "background-color")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-error"));
  });

  test("prefix rewrites bulk calendar selectors without touching values", async () => {
    const css = await genBatch1("d-vc d-cally d-pika-single", prefixed);
    expect(css).toContain(".d-vc-date__btn");
    expect(css).toContain(".d-cally::part(container)");
    expect(css).toContain(".d-pika-single:is(div)");
    expect(css).not.toContain("d-5rem");
    expect(css).not.toContain("0.d-");
  });

  test("exclude/include filter per component", async () => {
    const noAlert = await genBatch1("alert alert-error chat", {
      prefix: "",
      include: [],
      exclude: ["alert"],
    });
    expect(noAlert).not.toContain(".alert");
    expect(noAlert).toContain(".chat");
    const onlyChat = await genBatch1("chat alert", {
      prefix: "",
      include: ["chat"],
      exclude: [],
    });
    expect(onlyChat).toContain(".chat");
    expect(onlyChat).not.toContain(".alert");
  });
});
