import { describe, expect, test } from "bun:test";
import { themeOrder } from "../src/index.ts";
// @ts-ignore: docs/ ships upstream-verbatim untyped JS (see docs/README.md)
import {
  SEARCH_CSV_FIELDS,
  parseSearchCsv,
  serializeSearchCsv,
  // @ts-ignore: untyped upstream-verbatim docs JS (see docs/README.md)
} from "../docs/src/lib/searchCsv.js";
import {
  extractCreemProductId,
  getDiscountNavbarTarget,
  isDiscountValid,
  // @ts-ignore: untyped upstream-verbatim docs JS (see docs/README.md)
} from "../docs/src/lib/storeDiscount.js";
import {
  areAdsAvailable,
  celebrate,
  getActiveDiscount,
  getStargazersCount,
  getTestimonials,
  // @ts-ignore: untyped upstream-verbatim docs JS (see docs/README.md)
} from "../docs/src/lib/external.js";
// @ts-ignore: untyped upstream-verbatim docs JS (see docs/README.md)
import { themeOrder as docsThemeOrder } from "../docs/src/lib/themes.js";

// Docs chrome + content pipeline track (Option A full fork).
// Locks: themeOrder re-export chain, zero-tailwindcss, daisy classes kept
// verbatim in chrome, mdsvex 10-plugin list, i18n chunk structure +
// lang:validate key sync, search.csv round-trip, daisyui-api graceful
// degrade. Does NOT touch src/rules or src/shortcuts.

const docs = (p: string) => new URL(`../docs/${p}`, import.meta.url);
const read = async (p: string) => await Bun.file(docs(p)).text();

describe("themeOrder: preset re-export chain", () => {
  test("preset exports 35 themes in upstream order", () => {
    expect(themeOrder.length).toBe(35);
    expect(themeOrder[0]).toBe("light");
    expect(themeOrder[themeOrder.length - 1]).toBe("silk");
  });

  test("preset order matches themes.css banners", async () => {
    const css = await Bun.file(
      new URL("../src/theme/themes.css", import.meta.url),
    ).text();
    const banners = [...css.matchAll(/\/\* --- ([a-z0-9]+) /g)].map(
      (m) => m[1],
    );
    expect(banners).toEqual(themeOrder);
  });

  test("docs themes.js is in sync with the preset", () => {
    expect(docsThemeOrder).toEqual(themeOrder);
  });
});

describe("zero-tailwindcss in docs/", () => {
  test("no tailwindcss in manifest or configs", async () => {
    // No tailwind wiring: no @tailwindcss package refs, no tailwindcss()
    // plugin call, no `@import "tailwindcss"`. Comment lines documenting
    // the Tailwind->Uno swap are excluded before asserting.
    const codeText = (text: string) =>
      text
        .split("\n")
        .filter((line) => {
          const t = line.trim();
          return (
            !t.startsWith("//") &&
            !t.startsWith("/*") &&
            !t.startsWith("*") &&
            t !== "*/"
          );
        })
        .join("\n");
    for (const f of [
      "package.json",
      "vite.config.js",
      "uno.config.ts",
      "svelte.config.js",
      "src/app.css",
      "src/lib/mdsvex/mdsvex.config.js",
      "src/lib/external.js",
    ]) {
      const text = codeText(await read(f));
      expect(text, `${f} @tailwindcss ref`).not.toMatch(/@tailwindcss\//);
      expect(text, `${f} plugin call`).not.toMatch(/[^a-zA-Z]tailwindcss\(\)/);
      expect(text, `${f} css import`).not.toMatch(
        /@import\s+["']tailwindcss["']/,
      );
    }
    const pkg = JSON.parse(await read("package.json"));
    const allDeps = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];
    expect(allDeps).not.toContain("tailwindcss");
    expect(allDeps).not.toContain("@tailwindcss/vite");
    expect(allDeps).not.toContain("@tailwindcss/typography");
  });
});

describe("chrome keeps daisy classes verbatim", () => {
  const cases: [string, string[]][] = [
    ["src/components/ThemeChange.svelte", ["data-set-theme", "theme-change"]],
    [
      "src/components/Navbar.svelte",
      ["navbar", "btn-ghost", "drawer-button", "tooltip", "tabs-border", "kbd"],
    ],
    ["src/components/Sidebar.svelte", ["menu", "menu-title", "input-ghost"]],
    [
      "src/components/Search.svelte",
      ["modal", "modal-box", "input-lg", "badge", "loading-dots"],
    ],
    [
      "src/components/Footer.svelte",
      ["footer", "footer-title", "link-hover", "join-item", "mask-squircle"],
    ],
    [
      "src/components/Component.svelte",
      ["tabs-lift", "tab-content", "prefixClassNames", "htmlToJsx"],
    ],
    ["src/components/ComponentPageTabs.svelte", ["tabs-lift", "tab-active"]],
    ["src/components/Clipboard.svelte", ["btn-square", "tooltip-accent"]],
    ["src/components/PrefixEdit.svelte", ["input-bordered", "tooltip-right"]],
    [
      "src/routes/(routes)/+layout.svelte",
      [
        "drawer",
        "drawer-toggle",
        "drawer-content",
        "drawer-side",
        "drawer-overlay",
        "toast",
        "alert-warning",
      ],
    ],
  ];
  for (const [file, tokens] of cases) {
    test(`${file} carries ${tokens[0]}…`, async () => {
      const text = await read(file);
      for (const tok of tokens) expect(text, `${file}:${tok}`).toContain(tok);
    });
  }

  test("ThemeChange persists via localStorage + data-theme", async () => {
    const text = await read("src/components/ThemeChange.svelte");
    expect(text).toContain("themeChange(false)");
    expect(text).toContain("data-act-class");
  });

  test("(routes) layout uses graceful analytics, not vendor ga4", async () => {
    const text = await read("src/routes/(routes)/+layout.svelte");
    expect(text).not.toContain("@minimal-analytics");
    expect(text).toContain("$lib/analytics.svelte.js");
  });

  test("layout.server uses preset themes + external stats", async () => {
    const text = await read("src/routes/(routes)/+layout.server.js");
    // No runtime import from the `daisyui` package (provenance comments
    // may still name the upstream module).
    expect(text).not.toMatch(/^\s*import[^;]*from\s+["']daisyui[^"']*["']/m);
    expect(text).not.toMatch(/"daisyui\s*:\s*"workspace/);
    expect(text).toContain("$lib/themes.js");
    expect(text).toContain("$lib/external.js");
  });
});

describe("mdsvex pipeline: 10 remark plugins + config", () => {
  const plugins = [
    "visit",
    "headingIds",
    "heading-links",
    "external-links",
    "github-links",
    "code-titles",
    "render-component",
    "translate",
    "markdown-text",
    "syntax-highlighter",
  ];
  for (const p of plugins) {
    test(`mdsvex/${p}.js exists and is non-empty`, async () => {
      const text = await read(`src/lib/mdsvex/${p}.js`);
      expect(text.length).toBeGreaterThan(50);
    });
  }

  test("config exports extensions + keeps 10-transform order", async () => {
    const text = await read("src/lib/mdsvex/mdsvex.config.js");
    expect(text).toContain("mdsvexExtensions");
    for (const name of [
      "assignHeadingIds",
      "renderComponent",
      "translate",
      "githubLinks",
      "codeTitles",
      "linkHeadings",
      "assignFallbackHeadingIds",
      "decorateExternalLinks",
    ])
      expect(text, name).toContain(name);
    expect(text).toContain("layout-components.svelte");
    // Graceful highlighter fallback, not a hard engine require.
    expect(text).toContain("Passthrough");
  });

  test("highlighting engine + syntax theme vendored", async () => {
    for (const f of [
      "src/lib/mdsvex/highlighting/index.js",
      "src/lib/mdsvex/highlighting/renderer.js",
      "src/lib/mdsvex/highlighting/textmate-engine.js",
      "src/lib/mdsvex/syntax-theme.json",
    ]) {
      const file = Bun.file(docs(f));
      expect(await file.exists(), f).toBe(true);
    }
  });
});

describe("i18n chunk structure + key sync", () => {
  const chunks = ["common", "home", "docs", "components", "other"];
  const langs = [
    "ar",
    "bn",
    "ca",
    "cs",
    "de",
    "el",
    "en",
    "es",
    "fa",
    "fr",
    "he",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "ms",
    "pl",
    "pt",
    "ro",
    "ru",
    "tr",
    "uk",
    "ur",
    "vi",
    "zh_hans",
    "zh_hant",
  ];

  test("i18n module keeps chunked lazy structure", async () => {
    const text = await read("src/lib/i18n.svelte.js");
    expect(text).toContain("import.meta.glob");
    expect(text).toContain("loadRouteTranslations");
    expect(text).toContain("localStorage");
  });

  test("27 langs × 5 chunks all present", async () => {
    for (const lang of langs) {
      for (const chunk of chunks) {
        const file = Bun.file(docs(`src/translation/${lang}.${chunk}.json`));
        expect(await file.exists(), `${lang}.${chunk}`).toBe(true);
      }
    }
  });

  test("en + de + fr + ja fully translated, rest are __todo stubs", async () => {
    const filled = ["en", "de", "fr", "ja"];
    for (const chunk of chunks) {
      for (const lang of filled) {
        const data = JSON.parse(
          await read(`src/translation/${lang}.${chunk}.json`),
        );
        expect(data.__todo, `${lang}.${chunk}`).toBeUndefined();
      }
      const enKeys = Object.keys(
        JSON.parse(await read(`src/translation/en.${chunk}.json`)),
      ).sort();
      // Sample langs fully cover the source key set.
      for (const lang of ["de", "fr", "ja"]) {
        const sampleKeys = Object.keys(
          JSON.parse(await read(`src/translation/${lang}.${chunk}.json`)),
        ).sort();
        expect(sampleKeys).toEqual(enKeys);
      }
      for (const lang of langs.filter((l) => !filled.includes(l))) {
        const data = JSON.parse(
          await read(`src/translation/${lang}.${chunk}.json`),
        );
        expect(data.__todo, `${lang}.${chunk} todo flag`).toBe(true);
      }
    }
  });

  test("prefix store is a writable", async () => {
    const text = await read("src/lib/stores.js");
    expect(text).toContain("writable");
    expect(text).toContain("prefix");
  });
});

describe("search.csv pipeline", () => {
  test("serializer round-trips through the strict parser", () => {
    const rows = [
      { title: "Button", url: "/components/button/", classnames: "btn" },
      { title: 'Quoted, "title"', url: "/x/", classnames: "a b" },
    ];
    const csv = serializeSearchCsv(rows);
    expect(csv.split("\n")[0]).toBe(SEARCH_CSV_FIELDS.join(","));
    expect(parseSearchCsv(csv)).toEqual(rows);
  });

  test("search.csv route globs real content through the same serializer", async () => {
    const text = await read("src/routes/search.csv/+server.js");
    expect(text).toContain("prerender");
    // Upstream serves the CSV as text/plain (kept verbatim).
    expect(text).toContain("text/plain");
    expect(text).toContain("$lib/searchCsv.js");
    expect(text).toContain("serializeSearchCsv");
    // Real content glob (was seedRows stub): markdown modules +
    // table-column extractor + heading index over vendored `.md` routes.
    expect(text).toContain("import.meta.glob");
    expect(text).toContain("extractTableColumn");
    expect(text).toContain("extractHeadings");
    expect(text).not.toMatch(/seedRows/);
  });
});

describe("daisyui-api graceful degrade", () => {
  test("discount helpers are pure and null-safe", () => {
    expect(isDiscountValid(null)).toBe(false);
    expect(isDiscountValid({})).toBe(false);
    expect(
      isDiscountValid({ data: { attributes: { expires_at: "2000-01-01" } } }),
    ).toBe(false);
    expect(
      isDiscountValid({ data: { attributes: { expires_at: "2999-01-01" } } }),
    ).toBe(true);
    expect(getDiscountNavbarTarget(null)).toBe(null);
    expect(extractCreemProductId(null)).toBe(null);
    expect(extractCreemProductId("https://x/payment/prod_ABC?y=1")).toBe(
      "prod_ABC",
    );
  });

  test("external helpers resolve null-safe offline", async () => {
    await expect(getStargazersCount("")).resolves.toBe(null);
    await expect(getActiveDiscount("")).resolves.toBe(null);
    await expect(getTestimonials()).resolves.toEqual([]);
    await expect(celebrate()).resolves.toBe(null);
    await expect(areAdsAvailable()).resolves.toBe(false);
  });

  test("content routes are prerendered and content-backed (no TODO stubs)", async () => {
    for (const [file, ctype] of [
      ["src/routes/sitemap.xml/+server.js", "application/xml"],
      // Upstream serves SKILL.md as text/plain (kept verbatim).
      ["src/routes/SKILL.md/+server.js", "text/plain"],
      ["src/routes/llms.txt/+server.js", "text/plain"],
    ] as [string, string][]) {
      const text = await read(file);
      expect(text, `${file} prerender`).toContain("prerender");
      expect(text, `${file} content-type`).toContain(ctype);
      expect(text, `${file} filled`).not.toMatch(/TODO\(content\)/);
    }
    // Sitemap graphs real vendored routes (hand-rolled, no super-sitemap).
    const sitemap = await read("src/routes/sitemap.xml/+server.js");
    expect(sitemap).toContain("codingTools");
    expect(sitemap).toContain("blogTags");
    expect(sitemap).toContain("/docs/changelog/");
    expect(sitemap).not.toMatch(/from ["']super-sitemap/);
    expect(sitemap).not.toMatch(/require\(["']super-sitemap/);
    // SKILL.md/llms.txt concatenate the vendored repo-root skills/ dir.
    for (const file of ["src/routes/SKILL.md/+server.js", "src/routes/llms.txt/+server.js"]) {
      const text = await read(file);
      expect(text, file).toContain("../../../../skills/daisyui/SKILL.md");
      expect(text, file).toContain("components/*.md");
    }
  });
});

describe("docs-section content (TODO content #3 remainder)", () => {
  test("docs section: 20 subdirs + layout vendored", async () => {
    const dirs = [
      "base", "cdn", "changelog", "colors", "config", "customize",
      "editor", "faq", "install", "intro", "layout-and-typography",
      "mcp", "plugin", "roadmap", "skill", "themes", "upgrade",
      "use", "utilities", "v5",
    ];
    expect(dirs.length).toBe(20);
    for (const dir of dirs) {
      const page = Bun.file(docs(`src/routes/(routes)/docs/${dir}/+page.md`));
      const svelte = Bun.file(docs(`src/routes/(routes)/docs/${dir}/+page.svelte`));
      const named = Bun.file(docs(`src/routes/(routes)/docs/${dir}/+page@(routes).md`));
      expect((await page.exists()) || (await svelte.exists()) || (await named.exists()), dir).toBe(true);
    }
    expect(await Bun.file(docs("src/routes/(routes)/docs/+layout.svelte")).exists()).toBe(true);
  });

  test("install/+page.md: Uno rewrite keeps frontmatter, drops Tailwind plugin", async () => {
    const text = await read("src/routes/(routes)/docs/install/+page.md");
    expect(text.startsWith("---\ntitle: Install daisyUI as a Tailwind plugin")).toBe(true);
    for (const tok of ["presetUno", "presetDaisy", "presetTypography", "UnoCSS()", 'separators: [":"]', 'import "uno.css"', "unocss-preset-daisy/themes"]) {
      expect(text, tok).toContain(tok);
    }
    // Mention-aware (same convention as the zero-tailwindcss test): prose
    // may name the replaced Tailwind wiring, but no wiring may remain.
    const codeText = text.replace(/<!--[\s\S]*?-->/g, "");
    expect(codeText).not.toMatch(/from ["'](@tailwindcss|tailwindcss)/);
    expect(codeText.split("\n").some((line) => line.trim().startsWith('@import "tailwindcss"'))).toBe(false);
    expect(codeText).not.toContain("@tailwindcss/vite");
    expect(codeText).not.toContain("$components/homepage/Install.svelte");
  });

  test("navigation.yaml vendored with navbar + docs sidebar", async () => {
    const text = await read("src/lib/data/navigation.yaml");
    expect(text).toContain("navbar:");
    expect(text).toContain("/docs/install/");
    expect(text).toContain("/docs/themes/");
    const server = await read("src/routes/(routes)/+layout.server.js");
    expect(server).toContain("navigation.yaml?raw");
    expect(server).toContain("getBlogSidebarPages");
    expect(server).not.toMatch(/TODO\(content\): load from/);
  });

  test("blog routes + tags vendored (33 posts)", async () => {
    for (const file of [
      "src/routes/(routes)/blog/+layout.server.js",
      "src/routes/(routes)/blog/+page.server.js",
      "src/routes/(routes)/blog/tag/[tag]/+page.server.js",
      "src/routes/(routes)/blog/rss.xml/+server.js",
      "src/lib/data/blogTags.js",
    ]) {
      expect(await Bun.file(docs(file)).exists(), file).toBe(true);
    }
    const { readdirSync } = await import("node:fs");
    const posts = readdirSync(new URL("../docs/src/routes/(routes)/blog/(posts)", import.meta.url));
    expect(posts.length).toBe(33);
  });

  test("skills/ vendored at repo root (74 files) for SKILL.md/llms.txt", async () => {
    const { readdirSync, statSync } = await import("node:fs");
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = `${dir}/${f}`;
        return statSync(p).isDirectory() ? walk(p) : [p];
      });
    const files = walk(new URL("../skills", import.meta.url).pathname);
    expect(files.length).toBe(74);
    expect(await Bun.file(new URL("../skills/daisyui/SKILL.md", import.meta.url)).exists()).toBe(true);
  });
});
