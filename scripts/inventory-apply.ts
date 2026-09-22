// P1: list every Tailwind utility used in upstream `@apply` across
// packages/daisyui/src/{base,components,utilities}/*.css
// Output: tests/fixtures/apply-inventory.json
// Usage: bun run inventory
// Impl: fetch raw CSS from GitHub (or local clone), regex `@apply ...;`, split tokens, count.

const SRC = 'https://raw.githubusercontent.com/saadeghi/daisyui/master/packages/daisyui/src'
const AREAS = ['base', 'components', 'utilities'] as const

console.log('TODO(P1): implement inventory fetch + parse.')
console.log('Areas:', AREAS.join(','), 'SRC:', SRC)
await Bun.write('tests/fixtures/apply-inventory.json', JSON.stringify({ todo: true }, null, 2))
