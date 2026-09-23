// `lang:validate` for the fork — key-sync gate compatible with upstream's
// `validateTranslations.js` contract (every lang × chunk carries exactly the
// source key set), extended for incremental fill: files containing
// `"__todo": true` are reported as TODO and skipped instead of failing.
// Non-todo files must match the English key set exactly (missing + extra
// keys fail the run). English itself is the source of truth and always
// fully present (vendored verbatim from upstream).
// Run: `bun run lang:validate` (from docs/) — wired into `docs verify`.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const translationDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "translation",
);
const chunks = ["common", "home", "docs", "components", "other"];

const files = readdirSync(translationDir).filter((f) => f.endsWith(".json"));
const langs = [
  ...new Set(
    files.map((f) => f.split(".").slice(0, -2).join(".") || f.split(".")[0]),
  ),
];

const load = (lang, chunk) =>
  JSON.parse(
    readFileSync(join(translationDir, `${lang}.${chunk}.json`), "utf8"),
  );

let failures = 0;
const todos = [];

for (const chunk of chunks) {
  const source = load("en", chunk);
  const sourceKeys = Object.keys(source).sort();
  for (const lang of langs) {
    if (lang === "en") continue;
    let data;
    try {
      data = load(lang, chunk);
    } catch {
      console.error(`missing file: ${lang}.${chunk}.json`);
      failures += 1;
      continue;
    }
    if (data.__todo === true) {
      todos.push(`${lang}.${chunk}`);
      continue;
    }
    const keys = Object.keys(data).sort();
    const missing = sourceKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !sourceKeys.includes(k));
    if (missing.length || extra.length) {
      console.error(`key drift in ${lang}.${chunk}.json`);
      if (missing.length)
        console.error(
          `  missing (${missing.length}): ${missing.slice(0, 10).join(", ")}`,
        );
      if (extra.length)
        console.error(
          `  extra (${extra.length}): ${extra.slice(0, 10).join(", ")}`,
        );
      failures += 1;
    }
  }
}

if (todos.length) {
  console.log(
    `[lang:validate] TODO (${todos.length}): ${todos.slice(0, 8).join(", ")}${todos.length > 8 ? " …" : ""}`,
  );
}
if (failures) {
  console.error(`[lang:validate] FAIL: ${failures} file(s) with key drift`);
  process.exit(1);
}
console.log("[lang:validate] OK: non-todo langs match English key sets");
