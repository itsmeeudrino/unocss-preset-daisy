// Port of packages/docs/src/routes/sitemap.xml/+server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Fork delta: upstream builds the sitemap with `super-sitemap` from the full
// content graph (components, store/skill products, comparisons,
// alternatives). `super-sitemap` is deliberately NOT a dependency of this
// fork (no new deps without asking; see AGENTS.md), and the marketing/store
// routes it indexed are not vendored — so this serves a hand-rolled XML
// graph over the real vendored routes instead:
// - docs pages: derived from the `../(routes)/docs/**/*.md` glob keys
//   (lazy glob — keys only, no `.md` content is bundled), plus the
//   Svelte-only `/docs/changelog/` page and one entry per skill editor
//   (dynamic `[slug]` route expanded via `$lib/data/codingTools.js`,
//   mirroring `skill/[slug]/+page.server.js#entries` which excludes the
//   static `grok/` dir)
// - blog: index + every `(posts)` slug (static routes, prerendered
//   regardless of `published`) + one page per published tag (via
//   `$lib/data/blogTags.js`, same source as the blog sidebar) + rss
// - root + `SKILL.md`/`llms.txt`/`search.csv` endpoints
// Same `trailingSlash: "always"` URL shape as `+layout.js`.

import { codingTools } from "$lib/data/codingTools.js";
import { getBlogTagSlug, getBlogTags } from "$lib/data/blogTags.js";

export const prerender = true;

const ORIGIN = "https://daisyui.com";

// Lazy globs: only keys are used (no content bundled). Docs `.md` files map
// 1:1 to URLs; `[slug]` dynamics are expanded explicitly below.
const docModules = import.meta.glob("../(routes)/docs/**/*.md");
const blogPostModules = import.meta.glob("../(routes)/blog/(posts)/*/+page.md");

function docPathToUrl(globPath) {
  let url = globPath.replace(/^\.\.\/\(routes\)\//, "/");
  url = url.replace(/\/\+page(@\(routes\))?\.md$/, "/");
  return url;
}

function blogSlugFromPath(globPath) {
  const parts = globPath.split("/");
  return parts[parts.length - 2];
}

function sitemapXml(paths) {
  const urls = [...new Set(paths)].map((path) => `  <url><loc>${ORIGIN}${path}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const GET = async () => {
  // Docs pages from the real `.md` graph, minus the dynamic `[slug]` route.
  const docUrls = Object.keys(docModules)
    .map(docPathToUrl)
    .filter((url) => !url.includes("["));
  // Dynamic skill pages, one per editor (same exclusion as upstream entries()).
  const skillSlugs = codingTools.filter((editor) => editor.slug !== "grok").map((editor) => editor.slug);
  const skillUrls = skillSlugs.map((slug) => `/docs/skill/${slug}/`);
  // Blog index, posts, published tag pages, rss.
  const postSlugs = Object.keys(blogPostModules).map(blogSlugFromPath);
  const tags = await getBlogTags().catch(() => []);
  const blogUrls = [
    "/blog/",
    ...postSlugs.map((slug) => `/blog/${slug}/`),
    ...tags.map((tag) => `/blog/tag/${getBlogTagSlug(tag)}/`),
    "/blog/rss.xml",
  ];
  const paths = [
    "/",
    ...docUrls,
    "/docs/changelog/",
    ...skillUrls,
    ...blogUrls,
    "/SKILL.md",
    "/llms.txt",
    "/search.csv",
  ];
  return new Response(sitemapXml(paths), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
