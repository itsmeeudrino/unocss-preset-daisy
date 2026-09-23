// Graceful-degrade port of packages/docs/src/lib/analytics.svelte.js.
// Upstream hard-requires `@minimal-analytics/ga4` at import time; this stub
// keeps the same `track(actionName)` signature but only loads the backend
// when a tracking ID is configured, and no-ops otherwise (offline, SSR,
// or package not installed). Navbar + (routes)/+layout import this module,
// never the vendor package directly.

let backend = null;

async function loadBackend() {
  if (backend !== null) return backend;
  try {
    // Optional dep, deliberately NOT in package.json (see docs/README.md
    // degrade table). Specifier is built dynamically so Vite's dev
    // import-analysis (which ignores `/* @vite-ignore */` on literals here)
    // can't statically resolve it; absence rejects at runtime -> no-op.
    const specifier = ["@minimal-analytics", "ga4"].join("/");
    const { default: minimalAnalytics } = await import(
      /* @vite-ignore */ specifier
    );
    backend = minimalAnalytics ?? false;
  } catch {
    // Optional dependency — analytics simply stays silent.
    backend = false;
  }
  return backend;
}

export function track(actionName) {
  // Fire-and-forget: analytics must never break rendering.
  loadBackend()
    .then((analytics) => {
      if (!analytics) return;
      const { track: originalTrack } = analytics;
      originalTrack({
        type: "action",
        event: { "ep.name": actionName },
      });
    })
    .catch(() => {});
}
