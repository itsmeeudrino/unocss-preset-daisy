<!-- Local stand-in for `svelte-countup` (upstream dep, deliberately NOT
  installed — see docs/README.md degrade table). Same props
  ({initial, value, duration}), renders the final value statically.
  Upstream animates the count; offline/static prerender shows the number. -->
<script>
  let { initial = 0, value = 0, duration = 0 } = $props()
</script>

{Number(value)?.toLocaleString("en-US")}
