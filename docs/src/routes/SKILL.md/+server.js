// Port of packages/docs/src/routes/SKILL.md/+server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Fork delta: upstream globs `../../../../../skills/` (5 levels — repo root
// of `packages/docs`). This fork's `docs/` sits directly under the repo
// root, so the vendored `skills/` dir (repo-root copy, see docs/README.md)
// is one level fewer: `../../../../skills/`.
const skillModules = import.meta.glob(
  [
    "../../../../skills/daisyui/SKILL.md",
    "../../../../skills/daisyui/install/SKILL.md",
    "../../../../skills/daisyui/usage/SKILL.md",
    "../../../../skills/daisyui/config/SKILL.md",
    "../../../../skills/daisyui/colors/SKILL.md",
    "../../../../skills/daisyui/components/*.md",
  ],
  {
    eager: true,
    query: "?raw",
    import: "default",
  },
)

const orderedSkillFiles = [
  "../../../../skills/daisyui/SKILL.md",
  "../../../../skills/daisyui/install/SKILL.md",
  "../../../../skills/daisyui/usage/SKILL.md",
  "../../../../skills/daisyui/config/SKILL.md",
  "../../../../skills/daisyui/colors/SKILL.md",
  ...Object.keys(skillModules)
    .filter((path) => path.startsWith("../../../../skills/daisyui/components/"))
    .sort(),
]

const componentFiles = orderedSkillFiles.filter((path) =>
  path.startsWith("../../../../skills/daisyui/components/"),
)

const rootSkillContent = skillModules["../../../../skills/daisyui/SKILL.md"]
const rootReferencesStart = rootSkillContent.indexOf("## References that you must read")
const rootProtocolStart = rootSkillContent.indexOf("### Component discovery protocol")
const rootIntro =
  rootReferencesStart === -1
    ? rootSkillContent.trimEnd()
    : rootSkillContent.slice(0, rootReferencesStart).trimEnd()
const componentDiscoveryProtocol =
  rootProtocolStart === -1 ? "" : rootSkillContent.slice(rootProtocolStart).trim()

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
}

const skillContent = [
  rootIntro,
  stripFrontmatter(skillModules["../../../../skills/daisyui/install/SKILL.md"]),
  stripFrontmatter(skillModules["../../../../skills/daisyui/usage/SKILL.md"]),
  stripFrontmatter(skillModules["../../../../skills/daisyui/config/SKILL.md"]),
  stripFrontmatter(skillModules["../../../../skills/daisyui/colors/SKILL.md"]),
  componentDiscoveryProtocol,
  "## daisyUI components",
  ...componentFiles.map((path) => stripFrontmatter(skillModules[path])),
]
  .filter(Boolean)
  .join("\n\n")

export const prerender = true

// Subpath deploy: no $app/paths on the server — bake site + base from env
// (same defaults as the deploy workflow). Upstream daisyui.com refs in the
// vendored skill sources rewrite to our SITE + BASE canonicals.
const SITE = process.env.DOCS_SITE_URL ?? "https://itsmeeudrino.github.io"
const BASE = process.env.DOCS_BASE_PATH ?? "/unocss-preset-daisy"
const UPSTREAM = "https://daisyui.com"

const rewriteUpstream = (text) =>
  text.replaceAll(`${UPSTREAM}/`, `${SITE}${BASE}/`).replaceAll(UPSTREAM, `${SITE}${BASE}`)

export function GET() {
  const content = rewriteUpstream(skillContent)

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  })
}
