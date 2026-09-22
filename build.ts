// Replaces `packages/daisyui/build.js`. No tailwindcss runtime dep.
//
// Toolchain note (Bun-only, per AGENTS.md) — F.1 decision:
// JS+CSS come from `Bun.build` below. `.d.ts` files are emitted by the local
// `typescript` devDep (the same toolchain as `bun run lint`: no new dep, no
// npm/vite/vitest-based step), orchestrated from this file via `Bun.$` so the
// entry stays `bun run build`. A temp tsconfig (in os.tmpdir, never committed)
// extends `./tsconfig.json` — so strictness never drifts from lint — but narrows
// `include` to `src/` (tests/scripts must not leak into `dist/`) with
// `emitDeclarationOnly` + `outDir dist` + `rootDir src`. Output is a per-file
// tree (`dist/index.d.ts`, `dist/options.d.ts`, ...) rather than a single
// bundled d.ts: bundling would need a dts-roller dep, which is disallowed.
// Wrinkle: TS 7.0.2 ignores `rewriteRelativeImportExtensions` (verified with a
// minimal repro: `import type { T } from './b.ts'` still emits `./b.ts` even
// with the flag true), so the step below rewrites relative `.ts` specifiers to
// `.js` in the emitted `.d.ts` files. The rewrite is idempotent — a no-op once
// a future TS honors the flag again.
import { $ } from "bun";
import { tmpdir } from "node:os";
import { join } from "node:path";

await $`rm -rf ./dist && mkdir -p ./dist`;

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  format: "esm",
  target: "node",
  external: ["unocss", "@unocss/core"],
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  throw new Error("Bun.build failed");
}

await $`cp ./src/theme/themes.css ./dist/themes.css`;

// --- .d.ts (F.1): local tsc, temp config, src-only ---
const root = process.cwd();
const tmpConfig = join(tmpdir(), `unocss-preset-daisy-dts-${process.pid}.json`);
await Bun.write(
  tmpConfig,
  JSON.stringify({
    extends: join(root, "tsconfig.json"),
    include: [join(root, "src")],
    compilerOptions: {
      noEmit: false,
      emitDeclarationOnly: true,
      declaration: true,
      declarationMap: false,
      rewriteRelativeImportExtensions: true, // honored by future TS; see note above
      outDir: join(root, "dist"),
      rootDir: join(root, "src"),
      // Config lives in tmpdir (no node_modules above it), and src/ uses no
      // Bun globals — skip @types lookup instead of resolving bun-types.
      types: [],
    },
  }),
);
try {
  // Deterministic offline path: the devDep binary, not bunx (no network).
  await $`./node_modules/.bin/tsc -p ${tmpConfig}`;
} catch (e) {
  throw new Error(
    "d.ts emit failed — is `typescript` installed? (`bun install`; it is a devDep used by `bun run lint`)",
    { cause: e },
  );
} finally {
  await Bun.file(tmpConfig)
    .exists()
    .then((exists) => (exists ? $`rm -f ${tmpConfig}` : null));
}

// TS 7.0.2 emits `./options.ts`-style specifiers despite the flag above; `.js`
// resolves under every moduleResolution (bundler + node16/nodenext) to the
// sibling `.d.ts`. Scoped to relative specifiers after from/import/export.
const glob = new Bun.Glob("**/*.d.ts");
for (const rel of glob.scanSync({ cwd: "./dist", absolute: false })) {
  const path = join(root, "dist", rel);
  const before = await Bun.file(path).text();
  const after = before.replace(
    /((?:from|import|export)\s*(?:\(\s*)?['"])(\.\.?\/[^'"]*?)\.ts(['"])/g,
    "$1$2.js$3",
  );
  if (after !== before) await Bun.write(path, after);
}

console.log("built dist/index.js + dist/themes.css + dist/**/*.d.ts");
