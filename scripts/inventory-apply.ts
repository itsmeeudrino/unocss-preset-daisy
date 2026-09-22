// scripts/inventory-apply.ts — list every Tailwind utility used in upstream `@apply`.
// Source: https://github.com/saadeghi/daisyui @ v5.7.43 (one-time hard fork, no auto-sync)
// Scans: packages/daisyui/src/{base,components,utilities}/*.css
// Output: tests/fixtures/apply-inventory.json
//   { utilities: {name: count}, files: {file: [utils]}, totalFiles, totalApplies }
// Usage: bun run inventory  (bun scripts/inventory-apply.ts)
// Notes:
// - Bun + ESM only, no new deps (built-in fetch + Bun.write).
// - Fetch failures are handled gracefully per-file (warn + continue); the JSON
//   is always written so downstream codemods (P3) have a stable input.

export {};

const RAW_BASE =
  "https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src";
const API_BASE =
  "https://api.github.com/repos/saadeghi/daisyui/contents/packages/daisyui/src";
const AREAS = ["base", "components", "utilities"] as const;

type Area = (typeof AREAS)[number];

// Fallback file lists (daisyui@v5.7.43) used when the GitHub API is
// unreachable (rate limit / offline). Kept in sync with upstream `src/`.
// base: 7 files, components: 61 files, utilities: 4 files.
const FALLBACK_FILES: Record<Area, string[]> = {
  base: [
    "base/properties.css",
    "base/reset.css",
    "base/rootcolor.css",
    "base/rootscrollgutter.css",
    "base/rootscrolllock.css",
    "base/scrollbar.css",
    "base/svg.css",
  ],
  components: [
    "components/alert.css",
    "components/aura.css",
    "components/avatar.css",
    "components/badge.css",
    "components/breadcrumbs.css",
    "components/button.css",
    "components/calendar.css",
    "components/card.css",
    "components/carousel.css",
    "components/chat.css",
    "components/checkbox.css",
    "components/collapse.css",
    "components/countdown.css",
    "components/diff.css",
    "components/divider.css",
    "components/dock.css",
    "components/drawer.css",
    "components/dropdown.css",
    "components/fab.css",
    "components/fieldset.css",
    "components/fileinput.css",
    "components/filter.css",
    "components/footer.css",
    "components/hero.css",
    "components/hover3d.css",
    "components/hovergallery.css",
    "components/indicator.css",
    "components/input.css",
    "components/kbd.css",
    "components/label.css",
    "components/link.css",
    "components/list.css",
    "components/loading.css",
    "components/mask.css",
    "components/megamenu.css",
    "components/menu.css",
    "components/mockup.css",
    "components/modal.css",
    "components/navbar.css",
    "components/otp.css",
    "components/progress.css",
    "components/radialprogress.css",
    "components/radio.css",
    "components/range.css",
    "components/rating.css",
    "components/select.css",
    "components/skeleton.css",
    "components/stack.css",
    "components/stat.css",
    "components/status.css",
    "components/steps.css",
    "components/swap.css",
    "components/tab.css",
    "components/table.css",
    "components/textarea.css",
    "components/textrotate.css",
    "components/timeline.css",
    "components/toast.css",
    "components/toggle.css",
    "components/tooltip.css",
    "components/validator.css",
  ],
  utilities: [
    "utilities/glass.css",
    "utilities/join.css",
    "utilities/radius.css",
    "utilities/typography.css",
  ],
};

interface Inventory {
  utilities: Record<string, number>;
  files: Record<string, string[]>;
  totalFiles: number;
  totalApplies: number;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.raw, text/plain, */*",
        "User-Agent": "unocss-preset-daisy-inventory",
      },
    });
    if (!res.ok) {
      console.warn(`warn: fetch ${url} -> HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(
      `warn: fetch ${url} failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

async function discoverFiles(): Promise<string[]> {
  const out: string[] = [];
  for (const area of AREAS) {
    const apiText = await fetchText(`${API_BASE}/${area}`);
    if (apiText) {
      try {
        const entries = JSON.parse(apiText) as Array<{
          name?: string;
          type?: string;
        }>;
        const css = entries
          .filter((e) => e.type === "file" && e.name?.endsWith(".css"))
          .map((e) => `${area}/${e.name}`);
        if (css.length > 0) {
          css.sort();
          out.push(...css);
          continue;
        }
        console.warn(`warn: API listing for ${area} empty, using fallback`);
      } catch (err) {
        console.warn(
          `warn: parse API listing for ${area} failed (${err instanceof Error ? err.message : String(err)}), using fallback`,
        );
      }
    } else {
      console.warn(`warn: API listing for ${area} unreachable, using fallback`);
    }
    out.push(...FALLBACK_FILES[area]);
  }
  // Deterministic order, de-duplicated.
  return [...new Set(out)].sort();
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Extract utility tokens from every `@apply ...;` statement in a CSS file. */
function extractApplies(css: string): { statements: number; tokens: string[] } {
  const clean = stripComments(css);
  const re = /@apply\s+([^;]+);/g;
  let statements = 0;
  const tokens: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    statements += 1;
    const raw = m[1];
    if (raw === undefined) continue;
    const body = raw.trim();
    if (!body) continue;
    for (const tok of body.split(/\s+/)) {
      const t = tok.trim();
      if (!t) continue;
      tokens.push(t);
    }
  }
  return { statements, tokens };
}

const files = await discoverFiles();
console.log(`inventory: discovered ${files.length} files (${AREAS.join(", ")})`);

const utilities: Record<string, number> = {};
const perFile: Record<string, string[]> = {};
let totalApplies = 0;
let okFiles = 0;
let failed = 0;

await Promise.all(
  files.map(async (file) => {
    const text = await fetchText(`${RAW_BASE}/${file}`);
    if (text === null) {
      failed += 1;
      return;
    }
    const { statements, tokens } = extractApplies(text);
    totalApplies += statements;
    okFiles += 1;
    const uniq = [...new Set(tokens)].sort();
    perFile[file] = uniq;
    for (const t of tokens) utilities[t] = (utilities[t] ?? 0) + 1;
  }),
);

// Sort utilities by count desc, then name asc (stable, useful top-20).
const sortedUtils = Object.entries(utilities).sort(
  ([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName),
);
const sortedUtilities: Record<string, number> = {};
for (const [k, v] of sortedUtils) sortedUtilities[k] = v;

// Sort file keys for stable diffs.
const sortedFiles: Record<string, string[]> = {};
for (const k of Object.keys(perFile).sort()) {
  const v = perFile[k];
  if (v !== undefined) sortedFiles[k] = v;
}

const inventory: Inventory = {
  utilities: sortedUtilities,
  files: sortedFiles,
  totalFiles: okFiles,
  totalApplies,
};

const outPath = "tests/fixtures/apply-inventory.json";
await Bun.write(outPath, JSON.stringify(inventory, null, 2) + "\n");

console.log(
  `inventory: ok=${okFiles} failed=${failed} applies=${totalApplies} unique-utils=${sortedUtils.length} -> ${outPath}`,
);
const top20 = sortedUtils.slice(0, 20);
for (const [name, count] of top20)
  console.log(`  ${String(count).padStart(4)}  ${name}`);

if (okFiles === 0) {
  console.warn(
    "warn: no upstream files fetched (offline?). Wrote empty inventory; re-run with network.",
  );
}
