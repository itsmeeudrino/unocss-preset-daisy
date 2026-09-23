// Optional external `daisyui-api` integrations, all graceful-degrade.
// Upstream docs calls these at build/runtime; every helper below resolves
// to a null-safe default when the API is unreachable, so the fork builds
// and renders fully offline. `PUBLIC_DAISYUI_API_PATH` comes from
// `docs/.env` (see `.env.example`); when unset, every helper short-circuits
// without issuing a request.
//
// Covered (upstream source -> degrade target):
// - `(routes)/+layout.server.js` stats.json stargazers -> `null` (Navbar
//   hides the star badge; same 2-attempt retry as upstream)
// - `$lib/storeDiscount.js` discount_shorttime/special.json -> `null`
//   (Navbar countdown tooltip stays hidden)
// - root `+page.server.js` testimonials (img.daisyui.com) -> `[]`
// - `Carbon.svelte` ads -> caller renders nothing (component-local guard)
// - `@neoconfetti/svelte` celebrations -> `celebrate()` no-op
// - `svelte-countdown`/`svelte-countup` marketing widgets -> not imported;
//   DiscountCountdown uses local `$lib/discountCountdown.js` instead

const API_PATH =
  (typeof process !== "undefined" && process.env?.PUBLIC_DAISYUI_API_PATH) ||
  "";

async function fetchJson(url, { timeoutMs = 10_000 } = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Upstream: 2-attempt retry, `Number.isFinite` guard, else `null`.
export async function getStargazersCount(apiPath = API_PATH) {
  if (!apiPath) return null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const stats = await fetchJson(`${apiPath}/stats.json`);
      const count = Number(stats?.stargazers_count);
      if (Number.isFinite(count)) return count;
    } catch {
      // Retry once before treating this optional metric as unavailable.
    }
  }
  return null;
}

// Upstream: `fetchActiveDiscount()` from `$lib/storeDiscount.js` throws when
// the API is down; callers wrap it in try/catch. This wrapper folds that
// into a plain `null` so new call sites don't need the ceremony.
export async function getActiveDiscount(apiPath = API_PATH) {
  if (!apiPath) return null;
  try {
    const { fetchActiveDiscount } = await import("./storeDiscount.js");
    return await fetchActiveDiscount(apiPath);
  } catch {
    return null;
  }
}

// Upstream: marketing `+page.server.js` fetches testimonials from
// img.daisyui.com. Offline -> empty list (section renders nothing).
export async function getTestimonials() {
  return [];
}

// Upstream: `@neoconfetti/svelte` celebration bursts on marketing pages.
// Offline/missing dep -> silent no-op with the same call signature.
export async function celebrate(_options) {
  return null;
}

// Upstream: `Carbon.svelte` ad slot. Returns false when ads can't load so
// layouts can collapse the slot instead of leaving a hole.
export async function areAdsAvailable() {
  return false;
}
