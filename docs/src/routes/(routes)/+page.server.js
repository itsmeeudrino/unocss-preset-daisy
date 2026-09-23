// Homepage data — adapted from upstream
// packages/docs/src/routes/(routes)/+page.server.js.
// Upstream fetches testimonials with retry and throws offline; here external
// fetches degrade (testimonials [], stats vendored) so prerender never fails.
import { stats } from "$lib/data/stats.js";

async function getTestimonials() {
  const signal = AbortSignal.timeout(10_000);
  try {
    const response = await fetch("https://img.daisyui.com/generated/testimonials.json", {
      signal,
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function load() {
  return { testimonials: await getTestimonials(), stats };
}
