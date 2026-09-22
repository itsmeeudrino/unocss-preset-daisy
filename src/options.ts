export interface DaisyOptions {
  /**
   * Upstream-parity theme selector. `false` (default) = all 35 themes.
   *
   * F.2 note — why this does NOT filter `dist/themes.css`: the `themes`
   * export (`unocss-preset-daisy/themes`, built by `build.ts` as a verbatim
   * copy of `src/theme/themes.css`) is a *static dist file* imported once via
   * `import 'unocss-preset-daisy/themes'`, while this option is a *runtime*
   * preset argument evaluated inside the consumer's Uno build. A prebuilt
   * static file cannot be rewritten per consumer option, so the whole 43KB /
   * 35-theme file ships regardless (README documents this). The Uno-idiomatic
   * alternative — injecting the selected themes as generated preflights
   * instead of a static import — would change the import contract and cascade
   * order, i.e. a public API change, so it is deliberately not done here.
   * Today this option only surfaces in the `logs` line; it changes neither
   * emitted CSS nor the `var(--color-*)` theme bridge in
   * `src/theme/tokens.ts` (name-to-var refs carry no values, so there is
   * nothing to narrow). To ship fewer themes, slice `themes.css` manually:
   * every theme is one self-contained block under a `--- <name> ---` banner
   * comment (keep the `light` block if you want the bare-`:root` defaults,
   * which only it provides).
   */
  themes?: string[] | false;
  prefix?: string;
  include?: string[];
  exclude?: string[];
  logs?: boolean;
}

const defaults: Required<DaisyOptions> = {
  themes: false, // false = all 35
  prefix: "",
  include: [],
  exclude: [],
  logs: false,
};

export function resolveOptions(user: DaisyOptions): Required<DaisyOptions> {
  return { ...defaults, ...user };
}

// Port of upstream pluginOptionsHandler + addPrefix + shouldIncludeItem
export function applyPrefix(selector: string, prefix: string): string {
  if (!prefix) return selector;
  // Only treat `.` as a class start when it opens a class name: not part of
  // a decimal (`0.5rem`), URL (`icon.svg`) or number, and followed by a
  // letter (daisyUI class names always start with one; this also skips
  // `.5`-style fragments). Bare `.2`-style decimals previously corrupted to
  // `.d-2` in prefixed builds.
  return selector.replace(
    /(?<![0-9A-Za-z_-])\.([a-zA-Z][a-zA-Z0-9-]*)/g,
    `.${prefix}$1`,
  );
}

export function shouldInclude(
  name: string,
  include: string[],
  exclude: string[],
): boolean {
  if (include.length && exclude.length)
    return include.includes(name) && !exclude.includes(name);
  if (include.length) return include.includes(name);
  if (exclude.length) return !exclude.includes(name);
  return true;
}
