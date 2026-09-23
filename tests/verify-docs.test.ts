import { describe, expect, test } from "bun:test";
import { createGenerator, presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import type { DaisyOptions } from "../src/index.ts";
import {
  parseCss,
  resolveFor,
  resolveVars,
  themeNames,
  themeVars,
  tvar,
  winningDecl,
} from "./compat.ts";
import type { CRule } from "./compat.ts";

// Verification track for docs full-fork (DOCS-SPIKE.md §4) + batch completion.
// Covers what batch1-5 / compat / snapshot / prefix-e2e don't yet lock:
//  (a) snapshot entries for the 22 post-fork components — the 7 docs-shell
//      critical (drawer, dropdown, footer, tab, toast, tooltip, toggle)
//      plus the 15 rest — through the FULL preset (prefix off),
//  (b) theme matrix: color wiring resolved against ALL 35 themes,
//  (c) prefix on/off for the shell-critical 7,
//  (d) separators:[':'] locked in every shipped uno config,
//  (e) theme-controller hooks + data-theme blocks for all 35 themes,
//  (f) responsive rule-based sizes (sm:btn-sm), print:hidden, RTL smoke,
//  (g) prefers-color-scheme parity (data-theme driven, no media query),
//      docs pre-hydration theme script, $$-fence extractor invariant.
// Does NOT touch src/rules or src/shortcuts (owned by batch tracks).
// Responsive/state variants on string-rule/shortcut components
// (sm:card-side, lg:drawer-open, md:footer-horizontal, max-md:modal-bottom,
// sm:btn) wrap via src/variantWrap.ts (see the suite at the bottom of this
// file). Rule-based sizes with declaration-object bodies (sm:btn-sm) always
// worked.

async function cssFor(
  classes: string,
  daisyOpts: DaisyOptions = {},
): Promise<string> {
  const uno = await createGenerator({
    presets: [presetUno(), presetDaisy(daisyOpts)],
    separators: [":"],
  });
  const { css } = await uno.generate(classes, { preflights: false });
  return css;
}

describe("docs-shell snapshot (full preset, prefix off)", () => {
  test("drawer shell", async () => {
    const css = await cssFor(
      "drawer drawer-toggle drawer-content drawer-side drawer-overlay drawer-open drawer-end",
    );
    for (const tok of [
      ".drawer",
      ".drawer-toggle",
      ".drawer-content",
      ".drawer-side",
      ".drawer-overlay",
      ".drawer-open",
      ".drawer-end",
    ])
      expect(css, tok).toContain(tok);
    expect(css).toContain("position:sticky");
  });

  test("dropdown", async () => {
    const css = await cssFor(
      "dropdown dropdown-content dropdown-open dropdown-close dropdown-end dropdown-top",
    );
    for (const tok of [
      ".dropdown",
      ".dropdown-content",
      ".dropdown-open",
      ".dropdown-end",
      ".dropdown-top",
    ])
      expect(css, tok).toContain(tok);
    // Upstream open-shows form: opacity:1 + scale:100% on the content.
    const rules = parseCss(css);
    const shown = rules.find((r) =>
      r.selectors.some((s) => s.includes(".dropdown-open .dropdown-content")),
    );
    expect(shown?.decls.find(([p]) => p === "opacity")?.[1]).toBe("1");
  });

  test("footer", async () => {
    const css = await cssFor(
      "footer footer-title footer-center footer-horizontal footer-vertical",
    );
    for (const tok of [
      ".footer",
      ".footer-title",
      ".footer-center",
      ".footer-horizontal",
      ".footer-vertical",
    ])
      expect(css, tok).toContain(tok);
    expect(css).toContain("grid-auto-flow:column");
  });

  test("tabs/tab", async () => {
    const css = await cssFor(
      "tabs tabs-box tabs-border tabs-lift tab tab-active tab-content tab-disabled tabs-lg",
    );
    for (const tok of [
      ".tabs",
      ".tabs-box",
      ".tab",
      ".tab-active",
      ".tab-content",
      ".tab-disabled",
    ])
      expect(css, tok).toContain(tok);
  });

  test("toast", async () => {
    const rules = parseCss(
      await cssFor("toast toast-top toast-center toast-end toast-middle"),
    );
    expect(winningDecl(rules, ["toast"], "position")?.value).toBe("fixed");
    expect(winningDecl(rules, ["toast"], "width")?.value).toBe("max-content");
    const css = await cssFor("toast toast-top toast-bottom toast-start");
    for (const tok of [".toast", ".toast-top", ".toast-bottom"])
      expect(css, tok).toContain(tok);
  });

  test("tooltip", async () => {
    const rules = parseCss(await cssFor("tooltip"));
    const vars = await themeVars("dark");
    expect(
      resolveFor(
        rules,
        ["tooltip"],
        vars,
        winningDecl(rules, ["tooltip"], "--tt-bg")?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-neutral"));
    const css = await cssFor(
      "tooltip tooltip-open tooltip-top tooltip-primary tooltip-content",
    );
    for (const tok of [
      ".tooltip-content",
      ".tooltip-open",
      ".tooltip-top",
      ".tooltip-primary",
    ])
      expect(css, tok).toContain(tok);
  });

  test("toggle", async () => {
    const rules = parseCss(await cssFor("toggle"));
    expect(winningDecl(rules, ["toggle"], "display")?.value).toBe(
      "inline-grid",
    );
    expect(winningDecl(rules, ["toggle"], "height")?.value).toBe("var(--size)");
    const vars = await themeVars("light");
    const rules2 = parseCss(await cssFor("toggle toggle-primary"));
    // --input-color wires only under :checked (upstream behavior-only state).
    const checked = rules2.find(
      (r) =>
        r.selectors.some((s) => s.includes(".toggle-primary:checked")) &&
        r.decls.some(([p]) => p === "--input-color"),
    );
    expect(checked, "toggle-primary:checked --input-color").toBeDefined();
    expect(
      resolveVars(
        checked?.decls.find(([p]) => p === "--input-color")?.[1] ?? "",
        vars,
      ),
    ).toBe(tvar(vars, "--color-primary"));
  });
});

describe("remaining 15 snapshot (full preset, prefix off)", () => {
  test("divider + dock", async () => {
    const css = await cssFor(
      "divider divider-horizontal divider-primary dock dock-active dock-xs",
    );
    for (const tok of [
      ".divider",
      ".divider-horizontal",
      ".divider-primary",
      ".dock",
      ".dock-active",
    ])
      expect(css, tok).toContain(tok);
  });

  test("fab + fieldset", async () => {
    const css = await cssFor("fab fab-close fieldset fieldset-legend");
    expect(css).toContain(".fab");
    expect(css).toContain("position:fixed");
    expect(css).toContain(".fieldset-legend");
  });

  test("file-input", async () => {
    const css = await cssFor(
      "file-input file-input-primary file-input-ghost file-input-xs",
    );
    for (const tok of [
      ".file-input",
      ".file-input-primary",
      ".file-input-ghost",
    ])
      expect(css, tok).toContain(tok);
    expect(css).toContain("--input-color");
  });

  test("filter + hero + hover-3d", async () => {
    const css = await cssFor(
      "filter filter-reset hero hero-content hero-overlay hover-3d",
    );
    expect(css).toContain(".filter{display:flex;");
    expect(css).toContain(".hero-content");
    expect(css).toContain(".hover-3d");
    expect(css).toContain("perspective");
  });

  test("steps + swap", async () => {
    const rules = parseCss(await cssFor("steps"));
    expect(winningDecl(rules, ["steps"], "counter-reset")?.value).toBe("step");
    const css = await cssFor(
      "steps steps-vertical step step-primary swap swap-active swap-rotate",
    );
    for (const tok of [".step", ".swap-active", ".swap-rotate"])
      expect(css, tok).toContain(tok);
  });

  test("table", async () => {
    const css = await cssFor(
      "table table-zebra table-pin-rows table-xs row-hover",
    );
    for (const tok of [".table", ".table-zebra", ".table-pin-rows"])
      expect(css, tok).toContain(tok);
  });

  test("textarea", async () => {
    const rules = parseCss(await cssFor("textarea textarea-primary"));
    const vars = await themeVars("light");
    expect(
      resolveFor(
        rules,
        ["textarea", "textarea-primary"],
        vars,
        winningDecl(rules, ["textarea", "textarea-primary"], "--input-color")
          ?.value ?? "",
      ),
    ).toBe(tvar(vars, "--color-primary"));
  });

  test("textrotate + timeline", async () => {
    const rules = parseCss(await cssFor("text-rotate"));
    expect(winningDecl(rules, ["text-rotate"], "display")?.value).toBe(
      "inline-block",
    );
    expect(winningDecl(rules, ["text-rotate"], "height")?.value).toBe("1lh");
    const css = await cssFor(
      "timeline timeline-box timeline-vertical timeline-horizontal",
    );
    expect(css).toContain(".timeline-box");
    expect(css).toContain(".timeline-vertical");
  });

  test("validator", async () => {
    const rules = parseCss(await cssFor("validator validator-hint"));
    expect(winningDecl(rules, ["validator-hint"], "visibility")?.value).toBe(
      "hidden",
    );
  });
});

describe("theme matrix: shell wiring across all 35 themes", () => {
  test("btn-primary / alert-error / toggle-primary resolve per theme", async () => {
    const names = await themeNames();
    expect(names.length).toBe(35);
    const btnRules = parseCss(await cssFor("btn btn-primary"));
    const alertRules = parseCss(await cssFor("alert alert-error"));
    const toggleRules = parseCss(await cssFor("toggle toggle-primary"));
    const toggleChecked = toggleRules.find(
      (r: CRule) =>
        r.selectors.some((s) => s.includes(".toggle-primary:checked")) &&
        r.decls.some(([p]) => p === "--input-color"),
    );
    expect(toggleChecked, "toggle-primary:checked rule").toBeDefined();
    const toggleVal =
      toggleChecked?.decls.find(([p]) => p === "--input-color")?.[1] ?? "";
    for (const theme of names) {
      const vars = await themeVars(theme);
      expect(
        resolveFor(
          btnRules,
          ["btn", "btn-primary"],
          vars,
          winningDecl(btnRules, ["btn", "btn-primary"], "--btn-color")?.value ??
            "",
        ),
        `${theme} btn-primary`,
      ).toBe(tvar(vars, "--color-primary"));
      expect(
        resolveFor(
          alertRules,
          ["alert", "alert-error"],
          vars,
          winningDecl(alertRules, ["alert", "alert-error"], "background-color")
            ?.value ?? "",
        ),
        `${theme} alert-error`,
      ).toBe(tvar(vars, "--color-error"));
      expect(resolveVars(toggleVal, vars), `${theme} toggle-primary`).toBe(
        tvar(vars, "--color-primary"),
      );
    }
  });
});

describe("prefix on/off for shell-critical 7", () => {
  const TOKENS = [
    "drawer",
    "dropdown",
    "footer",
    "tabs",
    "tab",
    "toast",
    "tooltip",
    "toggle",
  ];

  test("prefix off emits plain selectors", async () => {
    const css = await cssFor(
      "drawer dropdown footer tabs tab toast tooltip toggle",
    );
    for (const tok of TOKENS) expect(css, tok).toContain(`.${tok}`);
  });

  test("prefix d- renames every shell selector, no plain leaks", async () => {
    const css = await cssFor(
      "d-drawer d-dropdown d-footer d-tabs d-tab d-toast d-tooltip d-toggle",
      { prefix: "d-" },
    );
    for (const tok of TOKENS) expect(css, tok).toContain(`.d-${tok}`);
    const leaks = [
      ...css.matchAll(
        /(?<![a-zA-Z0-9_-])\.(drawer|dropdown|footer|tabs|tab|toast|tooltip|toggle)(?![a-zA-Z0-9_-])/g,
      ),
    ];
    expect(leaks.map((m) => m[0])).toEqual([]);
  });
});

describe("separators:[':'] in shipped uno configs", () => {
  for (const file of ["docs/uno.config.ts", "example/uno.config.ts"]) {
    test(`${file} keeps colon-only separators`, async () => {
      const text = await Bun.file(
        new URL(`../${file}`, import.meta.url),
      ).text();
      expect(text, file).toMatch(/separators:\s*\[\s*['"]:['"]\s*\]/);
    });
  }
});

describe("theme-controller + data-theme (35 themes)", () => {
  test("every theme has a theme-controller hook and a data-theme block", async () => {
    const names = await themeNames();
    expect(names.length).toBe(35);
    const css = await Bun.file(
      new URL("../src/theme/themes.css", import.meta.url),
    ).text();
    for (const t of names) {
      expect(css, `${t} hook`).toContain(
        `:root:has(input.theme-controller[value=${t}]:checked)`,
      );
      expect(css, `${t} block`).toContain(`[data-theme="${t}"]`);
    }
  });
});

describe("responsive / print / RTL (docs §4 step 4)", () => {
  test("rule-based responsive size keeps @media (sm:btn-sm)", async () => {
    const css = await cssFor("sm:btn-sm");
    expect(css).toContain("@media");
    expect(css).toContain(".sm\\:btn-sm");
  });

  test("print:hidden emits @media print", async () => {
    const css = await cssFor("print:hidden");
    expect(css).toContain("@media print");
    expect(css).toContain("display:none");
  });

  test("RTL smoke: breadcrumbs + steps carry rtl overrides", async () => {
    const css = await cssFor("breadcrumbs steps");
    expect(css).toContain('[dir="rtl"]');
  });
});

describe("prefers-color-scheme parity + pre-hydration script", () => {
  test("themes.css is data-theme driven (no prefers-color-scheme)", async () => {
    const css = await Bun.file(
      new URL("../src/theme/themes.css", import.meta.url),
    ).text();
    expect(css).not.toContain("prefers-color-scheme");
  });

  test("docs app.html sets data-theme pre-hydration (no FOUC)", async () => {
    const html = await Bun.file(
      new URL("../docs/src/app.html", import.meta.url),
    ).text();
    expect(html).toContain("data-theme");
    expect(html).toContain("localStorage");
  });
});

describe("extractor: $$-fence invariant", () => {
  test("$$-placeholder tokens need stripping; live HTML is what extracts", async () => {
    // Docs code fences write `$$btn`; PrefixEdit strips `$$` at runtime.
    // The extractor must see the stripped class — `$$btn` itself styles nothing.
    expect(await cssFor("$$btn")).not.toContain("display:inline-flex");
    expect(await cssFor("btn")).toContain("display:inline-flex");
  });
});

// Responsive/state variants on string-rule + shortcut components.
// Fixed by src/variantWrap.ts: raw-string static rules become exact-match
// dynamic rules that rename the owner class to the variant-computed selector
// and nest in the variant-computed parents; static shortcuts with companion
// references propagate the variant prefix so `__daisy-*` parts wrap too.
// Rule-based declaration-object sizes (sm:btn-sm) always worked.
describe("responsive variants on string-rule/shortcut components", () => {
  for (const cls of [
    "sm:card-side",
    "lg:drawer-open",
    "md:footer-horizontal",
    "max-md:modal-bottom",
    "sm:btn",
  ]) {
    test(`${cls} keeps @media + escaped selector`, async () => {
      const css = await cssFor(cls);
      expect(css).toContain("@media");
      expect(css).toContain(`.${cls.replace(":", "\\:")}`);
    });
  }
});
