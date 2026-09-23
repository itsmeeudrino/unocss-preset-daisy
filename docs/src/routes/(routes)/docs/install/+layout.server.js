// Port of packages/docs/src/routes/(routes)/docs/install/+layout.server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Graceful offline degrade: upstream resolves `frameworks`/`framework` via
// `$lib/server/content/frameworks.js` (network fetch of `frameworks.yaml`
// from `PUBLIC_DAISYUI_API_PATH`). The content toolchain is not vendored in
// this fork (see docs/README.md TODO(content)), so this returns the same
// data shape with empty values — `install/+page.md` renders its Uno setup
// guide and an empty framework grid instead of failing `vite build` offline.
export async function load({ url }) {
  return getInstallRouteData(url.pathname);
}

// Local equivalent of `projectInstallRouteData` (upstream
// `$lib/server/content/frameworkData.js`) over an empty framework list.
function getInstallRouteData(pathname) {
  if (pathname === "/docs/install/") {
    return { frameworks: [] };
  }
  return { framework: null };
}
