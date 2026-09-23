import { base } from "$app/paths";

// Prefix a root-absolute internal ref (`/...`) for subpath deploy.
// NOTE: `base` renders *relative* per-page in prerender ("../.."), which
// browsers resolve correctly for anchors/fetch — keep it for rendering.
export const withBase = (h) => (typeof h === "string" && h.startsWith("/") ? base + h : h);

// Literal base for pathname stripping + full-URL building (canonicals),
// where the relative `base` above is unusable. MUST match
// svelte.config.js `kit.paths.base` default; custom-domain (root) builds
// set both to "".
export const BASE_PATH = "/unocss-preset-daisy";
export const stripBase = (p) =>
  (typeof p === "string" ? p : "").replace(new RegExp(`^${BASE_PATH}`), "") || "/";
