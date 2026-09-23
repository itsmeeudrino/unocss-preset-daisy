// Verbatim from saadeghi/daisyui@master
// packages/docs/src/lib/server/content/componentIndex.js
export function toComponentIndexDto(metadata, slug) {
  return {
    slug,
    title: metadata.title,
    desc: metadata.desc,
  }
}
