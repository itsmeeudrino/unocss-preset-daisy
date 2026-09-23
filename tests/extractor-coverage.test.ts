import { describe, expect, test } from "bun:test";
import { createGenerator, extractorSplit } from "unocss";
import { presetUno } from "unocss";
import { presetDaisy } from "../src/index.ts";

// DOCS-SPIKE §1.6b/§2.5: Uno must scan `.svelte/.md/.svx` (+ the `$$`
// placeholder fences must not break extraction — previews render from the
// live HTML above the fence, so extraction still works).
//
// Uno pipeline defaults (verified 2026-09-23 in
// node_modules/@unocss/core/dist/index.d.mts `ContentOptions.pipeline`):
//   include default: /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/
//   → covers .svelte/.md/.mdx/.html, NOT `.svx` (mdsvex Svelte markdown).
// Hence the scaffold MUST extend `content.pipeline.include` with `svx`
// (snippet below, also in uno.config.ts + example/uno.config.ts).
// There is no dedicated `@unocss/extractor-svelte` in v66 — the default
// split extractor handles Svelte markup (it splits on whitespace/quotes,
// so `class="btn btn-primary"` extracts regardless of surrounding
// `{#if}`/`{@render}`/`$props()` syntax).

export const DOCS_PIPELINE_INCLUDE = [
  /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|svx|astro|elm|php|phtml|marko|html)($|\?)/,
  "src/**/*.{svelte,md,svx}",
] as const;

// Minimal component page shape: live daisy HTML + fenced ```html block with
// the `$$` prefix placeholder (replaced at runtime from the prefix store;
// see Component.svelte `use:prefixClassNames`). Extraction must yield the
// live classes; `$$`-tokens must never produce CSS (they are not real classes).
const SVELTE_FIXTURE = `
<script>let { children } = $props();</script>
<div class="join join-horizontal">
  <button class="btn btn-primary join-item">live</button>
</div>
${"```"}html
<button class="$$btn $$btn-primary $$join-item">fenced placeholder copy</button>
${"```"}
`;

const MD_FIXTURE = `
# Button
<button class="btn btn-secondary">md live</button>
${"```"}html
<span class="$$badge $$badge-accent">fenced</span>
${"```"}
`;

const SVX_FIXTURE = `
<button class="card card-border">svx live</button>
${"```"}html
<div class="$$card $$card-body">fenced</div>
${"```"}
`;

function extracted(code: string): string[] {
  const out = extractorSplit.extract?.({ code } as never) as unknown;
  return [...(out as Iterable<string>)];
}

describe("extractor coverage: default split handles svelte/md/svx", () => {
  test("live daisy classes extract from .svelte markup", () => {
    const toks = extracted(SVELTE_FIXTURE);
    for (const t of [
      "join",
      "join-horizontal",
      "btn",
      "btn-primary",
      "join-item",
    ]) {
      expect(toks).toContain(t);
    }
  });

  test("live classes extract from .md/.svx markdown", () => {
    expect(extracted(MD_FIXTURE)).toContain("btn-secondary");
    expect(extracted(SVX_FIXTURE)).toContain("card-border");
  });

  test("$$-placeholder fence tokens never become utilities", async () => {
    const toks = extracted(SVELTE_FIXTURE);
    // The splitter keeps `$$btn` as a raw token (split on quotes/spaces only)
    // — the point is Uno matches nothing for it, while live HTML still works.
    const uno = await createGenerator({
      presets: [presetUno(), presetDaisy()],
      separators: [":"],
    });
    const { css } = await uno.generate(toks.join(" "), {
      preflights: false,
    });
    expect(css).toContain(".btn");
    expect(css).toContain(".join-item");
    expect(css).not.toContain("$$");
    expect(css).not.toMatch(/\\\$\$/);
  });

  test("extracted live tokens generate CSS end-to-end", async () => {
    const uno = await createGenerator({
      presets: [presetUno(), presetDaisy()],
      separators: [":"],
    });
    for (const fix of [SVELTE_FIXTURE, MD_FIXTURE, SVX_FIXTURE]) {
      const { css } = await uno.generate(extracted(fix).join(" "), {
        preflights: false,
      });
      expect(css.length).toBeGreaterThan(0);
    }
    const { css } = await uno.generate(extracted(SVELTE_FIXTURE).join(" "), {
      preflights: false,
    });
    expect(css).toContain("display:inline-flex"); // .join
    expect(css).toContain("--btn-color:var(--color-primary)");
  });
});

describe("extractor coverage: pipeline include covers .svx", () => {
  test("default pattern misses .svx; docs pattern catches it", () => {
    const def =
      /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/;
    expect(def.test("Component.svelte")).toBe(true);
    expect(def.test("page.md")).toBe(true);
    expect(def.test("page.svx")).toBe(false); // gap DOCS-SPIKE §1.6b flags
    const [docsRe] = DOCS_PIPELINE_INCLUDE;
    expect((docsRe as RegExp).test("page.svx")).toBe(true);
    expect((docsRe as RegExp).test("Component.svelte")).toBe(true);
    expect((docsRe as RegExp).test("page.md")).toBe(true);
  });

  test("uno configs carry the pipeline snippet", async () => {
    for (const f of ["uno.config.ts", "example/uno.config.ts"]) {
      const text = await Bun.file(f).text();
      expect(text.includes("svx"), `${f} missing svx pipeline`).toBe(true);
      expect(text.includes("content")).toBe(true);
      expect(text.includes("pipeline")).toBe(true);
    }
  });
});
