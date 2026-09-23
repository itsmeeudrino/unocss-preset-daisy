import { describe, expect, test } from "bun:test";
import { createGenerator } from "unocss";
import { presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";
import type { DaisyOptions } from "../src/index.ts";

// DOCS-SPIKE §2 covered-even-after-batches gaps 1-4 (preset side).
// Gap 5 (extractor) lives in tests/extractor-coverage.test.ts.
// Theme-controller per-theme hooks live in tests/compat-themes.test.ts.

async function cssFor(
  html: string,
  daisyOpts: DaisyOptions = {},
): Promise<string> {
  const uno = await createGenerator({
    presets: [presetUno(), presetDaisy(daisyOpts)],
    separators: [":"],
  });
  const { css } = await uno.generate(html, { preflights: false });
  return css;
}

// cssExtend snippet for docs/uno.config.ts `presetTypography({ cssExtend })`.
// Mirrors PROSE_VARS (src/rules/utilities.ts) onto the engine's `--un-prose-*`
// vars (the engine ignores daisy's `--tw-prose-*` bridge). Shared with the
// docs scaffold track — copy verbatim.
export const DAISY_PROSE_CSS_EXTEND: Record<string, string> = {
  "--un-prose-body":
    "color-mix(in oklab, var(--color-base-content) 80%, #0000)",
  "--un-prose-headings": "var(--color-base-content)",
  "--un-prose-lead": "var(--color-base-content)",
  "--un-prose-links": "var(--color-base-content)",
  "--un-prose-bold": "var(--color-base-content)",
  "--un-prose-counters": "var(--color-base-content)",
  "--un-prose-bullets":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--un-prose-hr": "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--un-prose-quotes": "var(--color-base-content)",
  "--un-prose-quote-borders":
    "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--un-prose-captions":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--un-prose-code": "var(--color-base-content)",
  "--un-prose-pre-code": "var(--color-neutral-content)",
  "--un-prose-pre-bg": "var(--color-neutral)",
  "--un-prose-th-borders":
    "color-mix(in oklab, var(--color-base-content) 50%, #0000)",
  "--un-prose-td-borders":
    "color-mix(in oklab, var(--color-base-content) 20%, #0000)",
  "--un-prose-kbd": "color-mix(in oklab, var(--color-base-content) 80%, #0000)",
};

describe("docs-gaps: typography (.prose full port)", () => {
  test(".prose carries daisy vars on :root selector", async () => {
    const css = await cssFor('<article class="prose"></article>');
    expect(css).toContain(":root .prose");
    expect(css).toContain("--tw-prose-body:");
    expect(css).toContain("--tw-prose-pre-bg:var(--color-neutral)");
    expect(css).toContain("--tw-prose-kbd:");
  });

  test(".prose nested :where(code) block (upstream verbatim)", async () => {
    const css = await cssFor('<article class="prose"></article>');
    expect(css).toContain(":where(code):not(pre > code)");
    expect(css).toContain("background-color:var(--color-base-200)");
    expect(css).toContain("border-radius:var(--radius-selector)");
    expect(css).toContain("border:var(--border) solid var(--color-base-300)");
    expect(css).toContain("padding-inline:0.5em");
    expect(css).toContain("display:none");
  });

  test(".prose prefix mode (d-)", async () => {
    const css = await cssFor('<article class="d-prose"></article>', {
      prefix: "d-",
    });
    expect(css).toContain(":root .d-prose");
    expect(css).toContain(":root .d-prose :where(code)");
    expect(css).not.toContain(":root .prose{");
  });

  test("presetTypography composes (docs wiring: presetUno + presetDaisy + typography)", async () => {
    // `@unocss/preset-typography` ships inside the `unocss` meta package
    // (no new dep). Docs scaffold uses it actively (docs/uno.config.ts).
    // NOTE (verified 2026-09-23): its `prose` shortcut hijacks the token —
    // even a `/^prose$/` regex rule in another preset does not fire — so the
    // standalone `:root .prose` bridge above only applies WITHOUT the engine.
    // With the engine, docs themes via `cssExtend` (snippet below, shared
    // with the docs track); this test locks both behaviors.
    const { default: presetTypography } = await import(
      "@unocss/preset-typography"
    );
    const uno = await createGenerator({
      presets: [presetUno(), presetDaisy(), presetTypography()],
      separators: [":"],
    });
    const { css } = await uno.generate('<article class="prose"></article>', {
      preflights: false,
    });
    expect(css).toContain(".prose"); // engine output
    expect(css).toContain("--un-prose-body:");
    expect(css.includes(":root .prose")).toBe(false); // shadowed: locked
  });

  test("presetTypography cssExtend bridges daisy colors (docs snippet)", async () => {
    // Copy-paste snippet for docs/uno.config.ts:
    //   presetTypography({ cssExtend: DAISY_PROSE_CSS_EXTEND })
    // Mirrors PROSE_VARS (src/rules/utilities.ts) onto the engine's
    // `--un-prose-*` vars so prose renders in daisy theme colors.
    const { default: presetTypography } = await import(
      "@unocss/preset-typography"
    );
    const uno = await createGenerator({
      presets: [
        presetUno(),
        presetDaisy(),
        presetTypography({ cssExtend: DAISY_PROSE_CSS_EXTEND }),
      ],
      separators: [":"],
    });
    const { css } = await uno.generate('<article class="prose"></article>', {
      preflights: false,
    });
    expect(css).toContain(
      "--un-prose-body:color-mix(in oklab, var(--color-base-content) 80%, #0000)",
    );
    expect(css).toContain("--un-prose-headings:var(--color-base-content)");
    expect(css).toContain("--un-prose-pre-bg:var(--color-neutral)");
  });
});

describe("docs-gaps: join @scope descendants + join-item branches", () => {
  test("first/last/only-child radius vars", async () => {
    const css = await cssFor(
      '<div class="join"><button class="join-item"></button></div>',
    );
    expect(css).toContain(":where(.join>:first-child)");
    expect(css).toContain("--join-ss:var(--radius-field)");
    expect(css).toContain(":where(.join>:last-child)");
    expect(css).toContain("--join-ee:var(--radius-field)");
    expect(css).toContain(":where(.join>:only-child)");
    expect(css).toContain(":where(.join>:not(:first-child))");
    expect(css).toContain(
      "--join-ml:calc(var(--border, 1px) * -1 * var(--join-h))",
    );
    expect(css).toContain(
      "--join-mt:calc(var(--border, 1px) * -1 * var(--join-v))",
    );
  });

  test("focus/hover z-index elevation", async () => {
    const css = await cssFor(
      '<div class="join"><button class="join-item btn"></button></div>',
    );
    expect(css).toContain(".join>:where(:focus, :has(:focus)){z-index:2;}");
    expect(css).toContain("@media (hover:hover)");
    expect(css).toContain("z-index:1");
  });

  test("join-item enabled/disabled branches", async () => {
    const css = await cssFor('<button class="join-item"></button>');
    expect(css).toContain(
      ".join-item:not(:disabled, [disabled], .btn-disabled)",
    );
    expect(css).toContain("margin-inline-start:var(--join-ml, 0)");
    expect(css).toContain(
      ".join-item:is(:disabled, [disabled], .btn-disabled)",
    );
    expect(css).toContain(
      "border-inline-end-width:calc(var(--border, 1px) * var(--join-v))",
    );
  });

  test("join prefix mode (d-): nested .btn also prefixed", async () => {
    const css = await cssFor(
      '<div class="d-join"><button class="d-join-item d-btn"></button></div>',
      { prefix: "d-" },
    );
    // Join-scoped selectors (the scope of this gap): no unprefixed leftovers.
    expect(css).toContain(".d-join>:where(:focus");
    expect(css).toContain(".d-join>:where(.d-btn:hover");
    expect(css).toContain(".d-join-item:not(:disabled");
    expect(css).toContain(":where(.d-join>:first-child)");
    expect(css).not.toContain(".join>");
    expect(css).not.toContain(">:where(.btn:hover");
  });
});

describe("docs-gaps: glass + radius edge cases (verbatim)", () => {
  test("glass matches upstream (no @apply)", async () => {
    const css = await cssFor('<div class="glass"></div>');
    expect(css).toContain("backdrop-filter:blur(var(--glass-blur, 40px))");
    expect(css).toContain("linear-gradient(135deg");
    expect(css).toContain("inset, 0 0 0 2px");
  });

  test("radius: 3 kinds x 9 shapes = 27 rules", async () => {
    const uno = await createGenerator({
      presets: [presetUno(), presetDaisy()],
      separators: [":"],
    });
    const kinds = ["box", "field", "selector"];
    const dirs = ["t", "b", "l", "r", "tl", "tr", "br", "bl"];
    const tokens = [
      ...kinds.map((k) => `rounded-${k}`),
      ...kinds.flatMap((k) => dirs.map((d) => `rounded-${d}-${k}`)),
    ];
    expect(tokens.length).toBe(27);
    const { css } = await uno.generate(tokens.join(" "), {
      preflights: false,
    });
    for (const t of tokens) expect(css).toContain(`.${t}`);
    expect(css).toContain("border-radius:var(--radius-box)");
    expect(css).toContain("border-top-left-radius:var(--radius-field)");
  });
});

describe("docs-gaps: global.css @apply expansion reference", () => {
  test("fixture expands every @apply (left only as was: comments)", async () => {
    const css = await Bun.file(
      "tests/fixtures/docs-global-apply-expanded.css",
    ).text();
    // All 15 `@apply` sites recorded as `was: @apply ...` comments; no live
    // directive (`@apply ...;` statement) may remain. Header prose mentions
    // `@apply` in backticks — also comment text, not a directive.
    const recorded = (css.match(/was: @apply/g) ?? []).length;
    expect(recorded).toBe(15);
    expect(css).not.toMatch(/@apply[^*\/]*;/);
    // pre.syntax (3 utils)
    expect(css).toContain("outline-color:var(--color-base-300)");
    expect(css).toContain("outline-width:2px");
    expect(css).toContain("outline-offset:-4px");
    // gallery (15 sites)
    expect(css).toContain("display:grid");
    expect(css).toContain("place-items:center");
    expect(css).toContain("overflow:hidden");
    expect(css).toContain("grid-area: 1 / 1");
    expect(css).toContain("z-index:10");
    expect(css).toContain("opacity:0");
    expect(css).toContain("opacity:1");
    expect(css).toContain("scale:100% 100%");
    const hasCount = (css.match(/:has\(/g) ?? []).length;
    expect(hasCount).toBe(10);
  });

  test("docs scaffold copy matches the reference (if scaffold present)", async () => {
    const app = Bun.file("docs/src/app.css");
    if (!(await app.exists())) return; // parallel track not checked out
    const css = await app.text();
    expect(css).not.toMatch(/@apply\s+\S+;/);
    expect(css).toContain("outline-color: var(--color-base-300)");
    expect(css).toContain("scale: 100% 100%");
    expect(css).toContain("grid-area: 1 / 1");
  });
});
