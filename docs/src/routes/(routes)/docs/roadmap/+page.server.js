// Port of packages/docs/src/routes/(routes)/docs/roadmap/+page.server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Graceful offline degrade: upstream fetches `roadmap.yaml` from
// `PUBLIC_DAISYUI_API_PATH` (see docs/.env.example). Without the API the
// page renders an empty timeline instead of failing prerender — same
// `{ roadmap: [] }` fallback shape as the upstream `catch` branch.
export async function load() {
  return {
    roadmap: [],
  };
}
