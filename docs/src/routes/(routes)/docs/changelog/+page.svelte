<script>
  import SEO from "$components/SEO.svelte"
  // Fork delta vs upstream: `../../../../../../../CHANGELOG.md` (repo root of
  // `packages/docs`) -> `../../../../../../CHANGELOG.md` (fork root; `docs/`
  // sits directly under the repo root, one level fewer). Upstream ref:
  // saadeghi/daisyui@master `packages/docs/src/routes/(routes)/docs/changelog/+page.svelte`.
  import Changelog from "../../../../../../CHANGELOG.md"
  import Translate from "$components/Translate.svelte"
</script>

<SEO title={`daisyUI Changelog`} desc={`daisyUI Changelog`} />

<div class="changelog-body prose" dir="ltr">
  <Changelog />
</div>
