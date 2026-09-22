export interface DaisyOptions {
  themes?: string[] | false
  prefix?: string
  include?: string[]
  exclude?: string[]
  logs?: boolean
}

const defaults: Required<DaisyOptions> = {
  themes: false, // false = all 35
  prefix: '',
  include: [],
  exclude: [],
  logs: false,
}

export function resolveOptions(user: DaisyOptions): Required<DaisyOptions> {
  return { ...defaults, ...user }
}

// Port of upstream pluginOptionsHandler + addPrefix + shouldIncludeItem
export function applyPrefix(selector: string, prefix: string): string {
  if (!prefix) return selector
  // Only treat `.` as a class start when it opens a class name: not part of
  // a decimal (`0.5rem`), URL (`icon.svg`) or number, and followed by a
  // letter (daisyUI class names always start with one; this also skips
  // `.5`-style fragments). Bare `.2`-style decimals previously corrupted to
  // `.d-2` in prefixed builds.
  return selector.replace(/(?<![0-9A-Za-z_-])\.([a-zA-Z][a-zA-Z0-9-]*)/g, `.${prefix}$1`)
}

export function shouldInclude(name: string, include: string[], exclude: string[]): boolean {
  if (include.length && exclude.length) return include.includes(name) && !exclude.includes(name)
  if (include.length) return include.includes(name)
  if (exclude.length) return !exclude.includes(name)
  return true
}
