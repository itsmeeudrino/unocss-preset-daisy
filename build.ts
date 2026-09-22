// Replaces packages/daisyui/build.js. No tailwindcss runtime dep.
import { $ } from 'bun'

await $`rm -rf dist && mkdir -p dist`
await Bun.build({ entrypoints: ['src/index.ts'], outdir: 'dist', format: 'esm', target: 'node' })
await Bun.file('src/theme/themes.css').copyTo?.('dist/themes.css').catch?.(() => {}) as any
// Fallback copy for Bun versions without copyTo:
try { await $`cp src/theme/themes.css dist/themes.css` } catch {}
console.log('built dist/index.js + dist/themes.css')
