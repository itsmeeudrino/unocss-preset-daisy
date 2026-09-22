// Minimal ambient declarations so `bunx tsc --noEmit` passes without
// `@types/bun` (AGENTS.md forbids new deps without asking).
// TODO(P5): replace with the official `bun-types` dev dependency.
declare const Bun: any

declare module 'bun' {
  export const $: any
}

declare module 'bun:test' {
  export const describe: any
  export const test: any
  export const it: any
  export const expect: any
  export const beforeEach: any
  export const afterEach: any
}
