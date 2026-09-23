// Post-build subpath rewrite (deploy concern only — source stays 1:1 upstream).
//
// The fork assumes root (`/` links, daisyui.com canonicals). When deploying
// under a subpath (e.g. GitHub Pages project site), rewrite build/ output to
// absolute ROOT = SITE + BASE URLs. Custom-domain (root) deploy: set
// DOCS_BASE_PATH="" and DOCS_SITE_URL=https://<domain> — output ≈ source.
//
// Runs after `vite build` (see package.json "build"). Idempotent (skips
// already-prefixed) but build/ is fresh every build anyway.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SITE = process.env.DOCS_SITE_URL ?? "https://itsmeeudrino.github.io";
const BASE = process.env.DOCS_BASE_PATH ?? "/unocss-preset-daisy";
const ROOT = SITE + BASE;
const UPSTREAM = "https://daisyui.com";

async function* files(dir, ext) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p, ext);
    else if (ext.some((x) => p.endsWith(x))) yield p;
  }
}

let touched = 0;
const build = new URL("../build", import.meta.url).pathname;

// HTML: root-absolute attrs -> ROOT. Skips external (//...), already ROOT,
// and in-page (#...) refs. Order matters: ROOT-guard first is unnecessary
// (build/ fresh), but kept for idempotence.
for await (const f of files(build, [".html"])) {
  let s = await readFile(f, "utf8");
  const t = s
    .replaceAll(`href="/`, `href="${ROOT}/`)
    .replaceAll(`src="/`, `src="${ROOT}/`)
    .replaceAll(`action="/`, `action="${ROOT}/`)
    .replaceAll(`url(/`, `url(${ROOT}/`)
    .replaceAll(`content="${UPSTREAM}/`, `content="${ROOT}/`)
    .replaceAll(`content="${UPSTREAM}"`, `content="${ROOT}/"`);
  // Undo double-prefix on already-absolute ROOT refs (idempotence).
  const u = t.replaceAll(`${ROOT}${ROOT}`, ROOT);
  if (u !== s) {
    await writeFile(f, u);
    touched++;
  }
}

// Machine feeds: upstream canonicals -> our canonicals; relative url col -> ROOT.
for await (const f of files(build, [".xml", ".txt", ".md"])) {
  let s = await readFile(f, "utf8");
  const t = s.replaceAll(`${UPSTREAM}/`, `${ROOT}/`).replaceAll(`${UPSTREAM}"`, `${ROOT}/"`);
  if (t !== s) {
    await writeFile(f, t);
    touched++;
  }
}
for await (const f of files(build, [".csv"])) {
  let s = await readFile(f, "utf8");
  const t = s.replaceAll(",/", `,${ROOT}/`);
  if (t !== s) {
    await writeFile(f, t);
    touched++;
  }
}

console.log(`[fix-base] ROOT=${ROOT} touched=${touched}`);
