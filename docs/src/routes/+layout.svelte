<script>
  import "../app.css"
  import "uno.css"
  // Package subpath `unocss-preset-daisy/themes` unresolvable: bun's `file:..`
  // copy omits package.json. Relative source import (same bytes as dist).
  import "../../../src/theme/themes.css"

  // Slim passthrough: the drawer shell (Navbar/Sidebar/Search/Footer) lives
  // in (routes)/+layout.svelte. No markup here — a stub shell would render
  // a double header/drawer around every grouped page.
  let { children } = $props()
</script>

{@render children?.()}
