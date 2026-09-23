import adapter from "@sveltejs/adapter-static"
import { mdsvexConfig, mdsvexExtensions } from "./src/lib/mdsvex/mdsvex.config.js"

// Option A full 1:1 fork of saadeghi/daisyui packages/docs (svelte.config.js).
// mdsvex wired per upstream (same 3-line diff): extensions + preprocess.
// Code fences render via the lazy textmate highlighter with passthrough
// fallback when vscode-textmate/vscode-oniguruma are absent (see
// src/lib/mdsvex/mdsvex.config.js); highlighting/grammars.json +
// grammar-manifest.json are vendored (1.8MB) for when the engine lands.

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexExtensions],
  preprocess: [mdsvexConfig],
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: null,
    }),
    // Subpath deploy (GitHub Pages project site): base comes from env so
    // custom-domain (root) builds keep working with DOCS_BASE_PATH="".
    paths: {
      base: process.env.DOCS_BASE_PATH ?? "/unocss-preset-daisy",
    },
    // TODO(content): links to not-yet-ported routes (/store, /blueprint,
    // /theme-generator, /discord, ...) 404 during prerender crawl until the
    // content track lands. Warn-and-continue so existing pages still build;
    // flip back to the default "fail" once all routes resolve.
    prerender: {
      handleHttpError: "warn",
    },
  },
  onwarn: (warning, handler) => {
    if (["a11y_", "non_reactive_update"].some((code) => warning.code.startsWith(code))) {
      return
    }
    handler(warning)
  },
}

export default config
