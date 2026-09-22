// Replaces `packages/daisyui/build.js`. No tailwindcss runtime dep.
import { $ } from 'bun'

await $`rm -rf ./dist && mkdir -p ./dist`

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  external: ['unocss', '@unocss/core'],
})
if (!result.success) {
  for (const log of result.logs) console.error(log)
  throw new Error('Bun.build failed')
}

await $`cp ./src/theme/themes.css ./dist/themes.css`
console.log('built dist/index.js + dist/themes.css')
