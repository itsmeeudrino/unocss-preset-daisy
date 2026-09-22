// Bun-only static server for manual visual checks.
// Usage: bun run playground  (serves playground/index.html on :3000)
const port = 3000
const file = Bun.file('playground/index.html')

Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(file, { headers: { 'content-type': 'text/html' } })
    }
    return new Response('not found', { status: 404 })
  },
})

console.log(`playground: http://localhost:${port}`)
