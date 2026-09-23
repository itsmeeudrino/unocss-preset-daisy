// Port of packages/docs/src/routes/(routes)/+layout.server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Deltas vs upstream (all graceful-degradation, see docs/README.md):
// - `daisyui/functions/themeOrder` (workspace:* coupling) -> `$lib/themes.js`,
//   a generated copy of the preset's `themeOrder` export
//   (`bun run sync:themes` regenerates; `tests/docs-chrome.test.ts` verifies).
// - `daisyui/package.json` version -> local `FORK_VERSION` constant (the
//   one-time hard fork point; never "latest").
// - `PUBLIC_DAISYUI_API_PATH/stats.json` fetch -> `$lib/external.js`
//   `getStargazersCount()` (2-attempt retry, `null` when unreachable).
// - `$lib/server/content/fetchYaml.js#createBuildMemo` (unvendored content
//   toolchain) -> local `getBlogSidebarPages()` call with `[]` fallback, so
//   an unreadable blog post never fails prerender.
// Navigation (`$lib/data/navigation.yaml`, vendored verbatim) and the blog
// sidebar (`$lib/data/blogTags.js` over the vendored `(posts)`) load the
// same way as upstream.

import { load as loadYaml } from "js-yaml";
import navigationYaml from "$lib/data/navigation.yaml?raw";
import { getBlogSidebarPages } from "$lib/data/blogTags.js";
import { themeOrder as themes } from "$lib/themes.js";
import { getStargazersCount } from "$lib/external.js";

// One-time hard fork point of saadeghi/daisyui. Displayed by ChangelogMenu.
const FORK_VERSION = "5.7.43";

const navigation = loadYaml(navigationYaml);
const navbar = navigation.navbar ?? [];
const sidebar = navigation.sidebar ?? {};
const pagesThatDontNeedSidebar = sidebar.noSidebar ?? [];

async function getBlogSidebarPagesForBuild() {
  try {
    return await getBlogSidebarPages();
  } catch {
    return [];
  }
}

export async function load() {
  // Optional external metric — `null` when offline/unreachable (Navbar hides
  // the star count via `Number.isFinite` guard, same as upstream).
  const [blogSidebarPages, stargazersCount] = await Promise.all([
    getBlogSidebarPagesForBuild(),
    getStargazersCount(),
  ]);
  const sidebarWithDynamicPages = {
    ...sidebar,
    blog: blogSidebarPages,
  };
  const getSidebarSectionItems = (section) =>
    section?.[0]?.items ?? section ?? [];
  const sidebarPages = Object.entries(sidebarWithDynamicPages)
    .filter(([name]) => name !== "noSidebar")
    .flatMap(([, section]) => getSidebarSectionItems(section));

  return {
    pagesThatDontNeedSidebar,
    navbar,
    sidebar: sidebarWithDynamicPages,
    sidebarPages,
    themes,
    daisyuiVersion: FORK_VERSION,
    stargazersCount,
  };
}
