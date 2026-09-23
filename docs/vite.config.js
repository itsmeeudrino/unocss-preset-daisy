import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import UnoCSS from "@unocss/vite"

// Option A full 1:1 fork of saadeghi/daisyui packages/docs (vite.config.js).
// `tailwindcss()` (@tailwindcss/vite) is swapped for `UnoCSS()` (@unocss/vite);
// `$components -> src/components` alias is carried over verbatim (upstream uses
// CJS `__dirname` here — fileURLToPath is the ESM-safe equivalent).

export default defineConfig({
  plugins: [UnoCSS(), sveltekit()],
  resolve: {
    alias: {
      $components: fileURLToPath(new URL("./src/components", import.meta.url)),
    },
  },
})
