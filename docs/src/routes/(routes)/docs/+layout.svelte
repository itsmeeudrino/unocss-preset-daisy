<script>
  // Fork delta vs upstream `src/routes/(routes)/docs/+layout.svelte`:
  // `../../../global.css` (Tailwind entry) -> `../../../app.css`, the Uno port
  // (see src/app.css header). Upstream ref: saadeghi/daisyui@master.
  import "../../../app.css"
  let { children } = $props()
</script>

{@render children?.()}
