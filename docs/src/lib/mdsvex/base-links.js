// Base-path rewrite for md content (subpath deploy, e.g. GitHub Pages).
//
// Rehype plugin (hast — runs AFTER the mdast->hast conversion), so it sees
// both markdown links `[t](/path)` and raw-HTML `<a href="/…">` / `<img
// src="/…">` embedded in the 187 *.md sources. Sources stay 1:1 upstream;
// no per-file edits. Skips external (`//…`) and already-prefixed refs.
//
// BASE bakes at build via env (mdsvex.config runs in node): custom-domain
// (root) builds set DOCS_BASE_PATH="" and output is unchanged.
import { visit } from "./visit.js"

const BASE = process.env.DOCS_BASE_PATH ?? "/unocss-preset-daisy"

const needsPrefix = (url) =>
  typeof url === "string" &&
  url.startsWith("/") &&
  !url.startsWith("//") &&
  url !== BASE &&
  !url.startsWith(`${BASE}/`)

export const baseLinks = () => (tree) => {
  visit(tree, { type: "element" }, (node) => {
    if (node.tagName === "a") {
      node.properties ??= {}
      if (needsPrefix(node.properties.href)) {
        node.properties.href = `${BASE}${node.properties.href}`
      }
    } else if (node.tagName === "img") {
      node.properties ??= {}
      if (needsPrefix(node.properties.src)) {
        node.properties.src = `${BASE}${node.properties.src}`
      }
    }
  })
}
