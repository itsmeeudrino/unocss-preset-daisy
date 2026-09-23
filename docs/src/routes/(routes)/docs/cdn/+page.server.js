// Port of packages/docs/src/routes/(routes)/docs/cdn/+page.server.js
// (upstream ref: saadeghi/daisyui@master).
//
// Graceful offline degrade: upstream reads the sibling `daisyui` workspace
// package from disk (`../daisyui/base|components|utilities|colors|theme`)
// and reports Brotli sizes for the jsDelivr-combine builder UI. This fork
// has no `daisyui` checkout (single-package repo, preset is peer-only on
// `unocss`), so this returns the same shape with empty file lists —
// `cdn/+page.md` renders its guide with an empty file picker instead of
// failing `vite build` offline.
export async function load() {
  const files = [];
  const groupedFiles = [
    { name: "Base styles", files: [] },
    { name: "Components and modifiers", files: [] },
    { name: "Utility classes", files: [] },
    { name: "Color utitliy classes", files: [] },
    { name: "Themes", files: [] },
  ];
  return {
    files,
    groupedFiles,
    daisyuiCssSize: 0,
  };
}
