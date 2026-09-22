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
  return selector.replace(/\.([a-z0-9-]+)/gi, `.${prefix}$1`)
}

export function shouldInclude(name: string, include: string[], exclude: string[]): boolean {
  if (include.length && exclude.length) return include.includes(name) && !exclude.includes(name)
  if (include.length) return include.includes(name)
  if (exclude.length) return !exclude.includes(name)
  return true
}
