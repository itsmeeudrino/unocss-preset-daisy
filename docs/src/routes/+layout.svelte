<script>
  import "../app.css"
  import "uno.css"
  // Package subpath `unocss-preset-daisy/themes` unresolvable: bun's `file:..`
  // copy omits package.json. Relative source import (same bytes as dist).
  import "../../../src/theme/themes.css"

  // Drawer shell stub (Svelte 5 runes). Mirrors the upstream
  // (routes)/+layout.svelte drawer skeleton — drawer-toggle, drawer-content,
  // drawer-side, drawer-overlay, lg:drawer-open — with Navbar/Sidebar/Search
  // components stubbed until the batch track + content toolchain land.
  let { children } = $props()
</script>

<div class="drawer lg:drawer-open">
  <input id="docs-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col bg-base-100">
    <!-- Navbar stub -->
    <header class="navbar bg-base-100">
      <div class="navbar-start">
        <label for="docs-drawer" class="btn btn-square btn-ghost drawer-button lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-5 w-5 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
        <span class="px-2 text-lg font-bold">daisyUI docs (uno)</span>
      </div>
    </header>
    <main class="mx-auto w-full max-w-[100rem] flex-1 p-4">
      {@render children?.()}
    </main>
  </div>
  <div class="drawer-side">
    <label for="docs-drawer" class="drawer-overlay" aria-label="Close menu"></label>
    <aside class="min-h-full w-72 bg-base-200 p-4">
      <!-- Sidebar stub -->
      <nav class="menu w-full">
        <li class="menu-title">Docs</li>
        <li><a href="/">Home</a></li>
      </nav>
    </aside>
  </div>
</div>
