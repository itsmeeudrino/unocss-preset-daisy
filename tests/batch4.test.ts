import { describe, expect, test } from "bun:test";
import { createGenerator, type Preset } from "unocss";
import { presetUno } from "unocss";
import { batch4Shortcuts } from "../src/shortcuts/batch4.ts";
import { batch4Rules } from "../src/rules/batch4.ts";
import {
  parseCss,
  resolveFor,
  themeVars,
  tvar,
  winningDecl,
} from "./compat.ts";

interface Opts {
  prefix: string;
  include: string[];
  exclude: string[];
}

const baseOpts: Opts = { prefix: "", include: [], exclude: [] };

async function cssForBatch4(
  classes: string,
  opts: Opts = baseOpts,
): Promise<string> {
  const testPreset = {
    name: "batch4test",
    shortcuts: batch4Shortcuts(opts),
    rules: batch4Rules(opts) ?? [],
  } as Preset;
  const uno = await createGenerator({
    presets: [presetUno(), testPreset],
  });
  const { css } = await uno.generate(classes, { preflights: false });
  return css;
}

const OTP_COLORS = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
] as const;
const PROGRESS_COLORS = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
] as const;
const RADIO_COLORS = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
] as const;
const RANGE_COLORS = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "success",
  "warning",
  "info",
  "error",
] as const;
const SELECT_COLORS = [
  "neutral",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
] as const;
const STATUS_COLORS = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
] as const;

const OTP_TOKENS = [
  "otp",
  "otp-joined",
  "otp-xs",
  "otp-sm",
  "otp-md",
  "otp-lg",
  "otp-xl",
  ...OTP_COLORS.map((c) => `otp-${c}`),
];
const PROGRESS_TOKENS = [
  "progress",
  ...PROGRESS_COLORS.map((c) => `progress-${c}`),
];
const RADIO_TOKENS = [
  "radio",
  ...RADIO_COLORS.map((c) => `radio-${c}`),
  "radio-xs",
  "radio-sm",
  "radio-md",
  "radio-lg",
  "radio-xl",
];
const RANGE_TOKENS = [
  "range",
  ...RANGE_COLORS.map((c) => `range-${c}`),
  "range-xs",
  "range-sm",
  "range-md",
  "range-lg",
  "range-xl",
  "range-vertical",
];
const RATING_TOKENS = [
  "rating",
  "rating-half",
  "rating-hidden",
  "rating-xs",
  "rating-sm",
  "rating-md",
  "rating-lg",
  "rating-xl",
];
const SELECT_TOKENS = [
  "select",
  "select-ghost",
  ...SELECT_COLORS.map((c) => `select-${c}`),
  "select-xs",
  "select-sm",
  "select-md",
  "select-lg",
  "select-xl",
];
const SKELETON_TOKENS = ["skeleton", "skeleton-text"];
const STACK_TOKENS = [
  "stack",
  "stack-bottom",
  "stack-top",
  "stack-start",
  "stack-end",
];
const STAT_TOKENS = [
  "stats",
  "stat",
  "stat-figure",
  "stat-title",
  "stat-value",
  "stat-desc",
  "stat-actions",
  "stats-horizontal",
  "stats-vertical",
];
const STATUS_TOKENS = [
  "status",
  ...STATUS_COLORS.map((c) => `status-${c}`),
  "status-xs",
  "status-sm",
  "status-md",
  "status-lg",
  "status-xl",
];

describe("batch4 smoke: every public class generates CSS", () => {
  const cases: Array<[string, string[]]> = [
    ["otp", OTP_TOKENS],
    ["progress", PROGRESS_TOKENS],
    ["radialprogress", ["radial-progress"]],
    ["radio", RADIO_TOKENS],
    ["range", RANGE_TOKENS],
    ["rating", RATING_TOKENS],
    ["select", SELECT_TOKENS],
    ["skeleton", SKELETON_TOKENS],
    ["stack", STACK_TOKENS],
    ["stat", STAT_TOKENS],
    ["status", STATUS_TOKENS],
  ];
  for (const [comp, tokens] of cases) {
    test(`${comp}: ${tokens.length} tokens non-empty`, async () => {
      for (const t of tokens) {
        const css = await cssForBatch4(t);
        expect(css.length).toBeGreaterThan(0);
        expect(css).toContain(`.${t}`);
      }
    });
  }
});

describe("otp colors resolve to theme values", () => {
  for (const color of OTP_COLORS) {
    test(`light: otp-${color} --input-color = ${color}`, async () => {
      const classes = ["otp", `otp-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const w = winningDecl(rules, classes, "--input-color");
      expect(w).not.toBeNull();
      expect(w?.layer).toBe("daisy-l2");
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
});

describe("otp sizes match upstream numeric values", () => {
  const expected: Record<string, [string, string]> = {
    "otp-xs": ["1.25rem", "calc(var(--size-field, 0.25rem) * 6)"],
    "otp-sm": ["1.5rem", "calc(var(--size-field, 0.25rem) * 8)"],
    "otp-md": ["1.75rem", "calc(var(--size-field, 0.25rem) * 10)"],
    "otp-lg": ["2rem", "calc(var(--size-field, 0.25rem) * 12)"],
    "otp-xl": ["2.5rem", "calc(var(--size-field, 0.25rem) * 14)"],
  };
  for (const [cls, [fs, size]] of Object.entries(expected)) {
    test(`${cls}: font-size ${fs}`, async () => {
      const rules = parseCss(await cssForBatch4(`otp ${cls}`));
      expect(winningDecl(rules, ["otp", cls], "font-size")?.value).toBe(fs);
      expect(winningDecl(rules, ["otp", cls], "--otp-size")?.value).toBe(size);
    });
  }
  test("otp base vars + joined + state", async () => {
    const rules = parseCss(await cssForBatch4("otp otp-joined"));
    expect(winningDecl(rules, ["otp"], "--otp-ch")?.value).toBe("1ch");
    expect(winningDecl(rules, ["otp"], "font-size")?.value).toBe("1.75rem");
    expect(winningDecl(rules, ["otp", "otp-joined"], "--otp-gap")?.value).toBe(
      "0rem",
    );
    const css = await cssForBatch4("otp");
    expect(css).toContain(":has(> span:nth-child(8))");
    expect(css).toContain(":focus-within");
    expect(css).toContain("input:disabled");
  });
});

describe("progress colors resolve to theme values", () => {
  for (const color of PROGRESS_COLORS) {
    test(`light: progress-${color} color = ${color}`, async () => {
      const classes = ["progress", `progress-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const w = winningDecl(rules, classes, "color");
      expect(w).not.toBeNull();
      expect(w?.layer).toBe("daisy-l2");
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
  test("progress base + indeterminate + keyframes", async () => {
    const rules = parseCss(await cssForBatch4("progress"));
    expect(winningDecl(rules, ["progress"], "height")?.value).toBe("0.5rem");
    expect(winningDecl(rules, ["progress"], "width")?.value).toBe("100%");
    expect(winningDecl(rules, ["progress"], "border-radius")?.value).toBe(
      "var(--radius-box)",
    );
    const css = await cssForBatch4("progress");
    expect(css).toContain(":indeterminate");
    expect(css).toContain("::-moz-progress-bar");
    expect(css).toContain("::-webkit-progress-value");
    expect(css).toContain("@keyframes progress");
  });
});

describe("radial-progress value-driven", () => {
  test("base vars + rings", async () => {
    const rules = parseCss(await cssForBatch4("radial-progress"));
    expect(winningDecl(rules, ["radial-progress"], "--size")?.value).toBe(
      "5rem",
    );
    expect(winningDecl(rules, ["radial-progress"], "--value")?.value).toBe("0");
    expect(winningDecl(rules, ["radial-progress"], "--thickness")?.value).toBe(
      "calc(var(--size) / 10)",
    );
    expect(winningDecl(rules, ["radial-progress"], "display")?.value).toBe(
      "inline-grid",
    );
    const css = await cssForBatch4("radial-progress");
    expect(css).toContain(":before");
    expect(css).toContain("conic-gradient");
    expect(css).toContain(":after");
    expect(css).toContain("rotate(calc(var(--value) * 3.6deg - 90deg))");
  });
});

describe("radio colors resolve to theme values", () => {
  for (const color of RADIO_COLORS) {
    test(`light: radio-${color} --input-color = ${color}`, async () => {
      const classes = ["radio", `radio-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const w = winningDecl(rules, classes, "--input-color");
      expect(w).not.toBeNull();
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
});

describe("radio sizes match upstream numeric values", () => {
  const expected: Record<string, string> = {
    "radio-xs": "0.125rem",
    "radio-sm": "0.1875rem",
    "radio-md": "0.25rem",
    "radio-lg": "0.3125rem",
    "radio-xl": "0.375rem",
  };
  for (const [cls, pad] of Object.entries(expected)) {
    test(`${cls}: padding ${pad}`, async () => {
      const rules = parseCss(await cssForBatch4(`radio ${cls}`));
      expect(winningDecl(rules, ["radio", cls], "padding")?.value).toBe(pad);
    });
  }
  test("radio size --size vars present + states", async () => {
    const css = await cssForBatch4(
      "radio radio-xs radio-sm radio-md radio-lg radio-xl",
    );
    expect(css).toContain("--size:calc(var(--size-selector, 0.25rem) * 4)");
    expect(css).toContain("--size:calc(var(--size-selector, 0.25rem) * 8)");
    expect(css).toContain(":checked");
    expect(css).toContain(":focus-visible");
    expect(css).toContain(":disabled");
    expect(css).toContain("@keyframes radio");
    const rules = parseCss(await cssForBatch4("radio"));
    expect(winningDecl(rules, ["radio"], "--size")?.value).toBe(
      "calc(var(--size-selector, 0.25rem) * 6)",
    );
  });
});

describe("range colors resolve to theme values", () => {
  for (const color of RANGE_COLORS) {
    test(`light: range-${color} color = ${color}`, async () => {
      const classes = ["range", `range-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const w = winningDecl(rules, classes, "color");
      expect(w).not.toBeNull();
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
  test("range thumbs resolve to content colors", async () => {
    const vars = await themeVars("light");
    const pairs: Array<[string, string]> = [
      ["range-primary", "--color-primary-content"],
      ["range-neutral", "--color-neutral-content"],
      ["range-error", "--color-error-content"],
    ];
    for (const [cls, tv] of pairs) {
      const classes = ["range", cls];
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      expect(
        resolveFor(
          rules,
          classes,
          vars,
          winningDecl(rules, classes, "--range-thumb")?.value ?? "",
        ),
      ).toBe(tvar(vars, tv));
    }
  });
});

describe("range sizes match upstream numeric values", () => {
  const expected: Record<string, string> = {
    "range-xs": "calc(var(--size-selector, 0.25rem) * 4)",
    "range-sm": "calc(var(--size-selector, 0.25rem) * 5)",
    "range-md": "calc(var(--size-selector, 0.25rem) * 6)",
    "range-lg": "calc(var(--size-selector, 0.25rem) * 7)",
    "range-xl": "calc(var(--size-selector, 0.25rem) * 8)",
  };
  for (const [cls, size] of Object.entries(expected)) {
    test(`${cls}: ${size}`, async () => {
      const rules = parseCss(await cssForBatch4(`range ${cls}`));
      expect(
        winningDecl(rules, ["range", cls], "--range-thumb-size")?.value,
      ).toBe(size);
    });
  }
  test("range track/thumb + vertical + disabled", async () => {
    const css = await cssForBatch4("range range-vertical");
    expect(css).toContain("::-webkit-slider-thumb");
    expect(css).toContain("::-moz-range-thumb");
    expect(css).toContain("writing-mode:vertical-lr");
    expect(css).toContain(":disabled");
  });
});

describe("rating sizes match upstream numeric values", () => {
  const expected: Record<string, string> = {
    "rating-xs": "var(--size-selector, 0.25rem) * 4",
    "rating-sm": "var(--size-selector, 0.25rem) * 5",
    "rating-md": "var(--size-selector, 0.25rem) * 6",
    "rating-lg": "var(--size-selector, 0.25rem) * 7",
    "rating-xl": "var(--size-selector, 0.25rem) * 8",
  };
  for (const [cls, size] of Object.entries(expected)) {
    test(`${cls}: ${size}`, async () => {
      const rules = parseCss(await cssForBatch4(`rating ${cls}`));
      expect(winningDecl(rules, ["rating", cls], "--size")?.value).toBe(size);
    });
  }
  test("rating half/hidden/checked/focus + keyframes", async () => {
    const css = await cssForBatch4("rating rating-half rating-hidden");
    expect(css).toContain("width:calc(var(--size) * 0.5)");
    expect(css).toContain("opacity:1");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@keyframes rating");
    const rules = parseCss(await cssForBatch4("rating rating-hidden"));
    expect(winningDecl(rules, ["rating-hidden"], "width")?.value).toBe(
      "0.5rem",
    );
  });
});

describe("select colors resolve to theme values", () => {
  for (const color of SELECT_COLORS) {
    test(`light: select-${color} --input-color = ${color}`, async () => {
      const classes = ["select", `select-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const w = winningDecl(rules, classes, "--input-color");
      expect(w).not.toBeNull();
      expect(resolveFor(rules, classes, vars, w?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
});

describe("select sizes match upstream numeric values", () => {
  const expected: Record<string, [string, string]> = {
    "select-xs": ["6", "0.6875rem"],
    "select-sm": ["8", "0.75rem"],
    "select-md": ["10", "0.875rem"],
    "select-lg": ["12", "1.125rem"],
    "select-xl": ["14", "1.375rem"],
  };
  for (const [cls, [mul, fs]] of Object.entries(expected)) {
    test(`${cls}: mul ${mul}, font ${fs}`, async () => {
      const rules = parseCss(await cssForBatch4(`select ${cls}`));
      expect(winningDecl(rules, ["select", cls], "--sl-size-mul")?.value).toBe(
        mul,
      );
      expect(
        winningDecl(rules, ["select", cls], "--font-size-min")?.value,
      ).toBe(fs);
    });
  }
  test("select ghost + disabled + picker", async () => {
    const css = await cssForBatch4("select select-ghost");
    expect(css).toContain("::picker(select)");
    expect(css).toContain(":focus-within");
    expect(css).toContain("select[disabled]");
    const rules = parseCss(await cssForBatch4("select"));
    expect(winningDecl(rules, ["select"], "background-color")?.value).toBe(
      "var(--color-base-100)",
    );
  });
});

describe("skeleton shimmer", () => {
  test("base + text + keyframes", async () => {
    const rules = parseCss(await cssForBatch4("skeleton"));
    expect(winningDecl(rules, ["skeleton"], "background-color")?.value).toBe(
      "var(--color-base-300)",
    );
    expect(winningDecl(rules, ["skeleton"], "border-radius")?.value).toBe(
      "var(--radius-box)",
    );
    const css = await cssForBatch4("skeleton skeleton-text");
    expect(css).toContain("@keyframes skeleton");
    expect(css).toContain("animation:skeleton 1.8s ease-in-out infinite");
    const textRules = parseCss(await cssForBatch4("skeleton-text"));
    expect(winningDecl(textRules, ["skeleton-text"], "color")?.value).toBe(
      "transparent",
    );
    expect(
      winningDecl(textRules, ["skeleton-text"], "background-clip")?.value,
    ).toBe("text");
  });
});

describe("stack cards", () => {
  test("grid template + children + positions", async () => {
    const rules = parseCss(await cssForBatch4("stack"));
    expect(winningDecl(rules, ["stack"], "display")?.value).toBe("inline-grid");
    expect(winningDecl(rules, ["stack"], "grid-template-columns")?.value).toBe(
      "3px 4px 1fr 4px 3px",
    );
    const css = await cssForBatch4(
      "stack stack-top stack-start stack-end stack-bottom",
    );
    expect(css).toContain("grid-column:3 / 4");
    expect(css).toContain("grid-column:1 / 6");
    expect(css).toContain("opacity:0.7");
    expect(css).toContain("z-index:3");
  });
});

describe("stat sections", () => {
  test("title/value/desc resolve + layout", async () => {
    const vars = await themeVars("light");
    const titleRules = parseCss(await cssForBatch4("stat-title"));
    expect(winningDecl(titleRules, ["stat-title"], "font-size")?.value).toBe(
      "0.75rem",
    );
    expect(winningDecl(titleRules, ["stat-title"], "color")?.value).toContain(
      "var(--color-base-content)",
    );
    const valueRules = parseCss(await cssForBatch4("stat-value"));
    expect(winningDecl(valueRules, ["stat-value"], "font-size")?.value).toBe(
      "2rem",
    );
    expect(winningDecl(valueRules, ["stat-value"], "font-weight")?.value).toBe(
      "800",
    );
    const figRules = parseCss(await cssForBatch4("stat-figure"));
    expect(
      winningDecl(figRules, ["stat-figure"], "grid-column-start")?.value,
    ).toBe("2");
    const statsRules = parseCss(await cssForBatch4("stats"));
    expect(winningDecl(statsRules, ["stats"], "display")?.value).toBe(
      "inline-grid",
    );
    expect(winningDecl(statsRules, ["stats"], "border-radius")?.value).toBe(
      "var(--radius-box)",
    );
    void vars;
  });
  test("horizontal/vertical dividers", async () => {
    const css = await cssForBatch4("stats-horizontal stats-vertical stat");
    expect(css).toContain("grid-auto-flow:column");
    expect(css).toContain("grid-auto-flow:row");
    expect(css).toContain(":not(:last-child)");
  });
});

describe("status dot colors resolve to theme values", () => {
  for (const color of STATUS_COLORS) {
    test(`light: status-${color} bg = ${color}`, async () => {
      const classes = ["status", `status-${color}`];
      const vars = await themeVars("light");
      const rules = parseCss(await cssForBatch4(classes.join(" ")));
      const bg = winningDecl(rules, classes, "background-color");
      const fg = winningDecl(rules, classes, "color");
      expect(bg).not.toBeNull();
      expect(fg).not.toBeNull();
      expect(resolveFor(rules, classes, vars, bg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
      expect(resolveFor(rules, classes, vars, fg?.value ?? "")).toBe(
        tvar(vars, `--color-${color}`),
      );
    });
  }
});

describe("status sizes match upstream numeric values", () => {
  const expected: Record<string, string> = {
    "status-xs": "calc(var(--size-selector, 0.25rem) * 0.5)",
    "status-sm": "calc(var(--size-selector, 0.25rem) * 1)",
    "status-md": "calc(var(--size-selector, 0.25rem) * 2)",
    "status-lg": "calc(var(--size-selector, 0.25rem) * 3)",
    "status-xl": "calc(var(--size-selector, 0.25rem) * 4)",
  };
  for (const [cls, size] of Object.entries(expected)) {
    test(`${cls}: ${size}`, async () => {
      const rules = parseCss(await cssForBatch4(`status ${cls}`));
      expect(winningDecl(rules, ["status", cls], "--size")?.value).toBe(size);
    });
  }
  test("status base dot", async () => {
    const rules = parseCss(await cssForBatch4("status"));
    expect(winningDecl(rules, ["status"], "display")?.value).toBe(
      "inline-block",
    );
    expect(winningDecl(rules, ["status"], "aspect-ratio")?.value).toBe("1");
    expect(winningDecl(rules, ["status"], "border-radius")?.value).toBe(
      "var(--radius-selector)",
    );
  });
});

describe("batch4 prefix + include/exclude", () => {
  test("prefix d- renames all selectors", async () => {
    const opts: Opts = { prefix: "d-", include: [], exclude: [] };
    const testPreset = {
      name: "batch4test",
      shortcuts: batch4Shortcuts(opts),
      rules: batch4Rules(opts) ?? [],
    } as Preset;
    const uno = await createGenerator({
      presets: [presetUno(), testPreset],
    });
    const { css } = await uno.generate(
      "d-progress d-progress-primary d-status d-status-success d-rating",
      {
        preflights: false,
      },
    );
    expect(css).toContain(".d-progress");
    expect(css).toContain(".d-progress-primary");
    expect(css).toContain(".d-status-success");
    expect(css).not.toContain(".progress{");
  });
  test("exclude filters component", async () => {
    const css = await cssForBatch4("progress status", {
      prefix: "",
      include: [],
      exclude: ["progress"],
    });
    expect(css).not.toContain(".progress{");
    expect(css).toContain(".status");
  });
});
