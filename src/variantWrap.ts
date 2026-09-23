import {
  escapeRegExp,
  isStaticRule,
  isStaticShortcut,
  toEscapedSelector,
} from "unocss";
import type {
  DynamicRule,
  DynamicShortcut,
  Rule,
  RuleContext,
  Shortcut,
  VariantHandler,
  VariantHandlerContext,
} from "unocss";

// Variant-aware wrappers for raw-string rules and string-reference shortcuts.
//
// Why this exists: Uno only threads variant handlers (responsive `sm:`,
// state `hover:`, `print:`, ...) through declaration-object rule bodies. A
// static rule whose body is a raw CSS string is emitted verbatim (the RawUtil
// path in @unocss/core), so `sm:card-side` used to emit byte-identical
// `.card-side` CSS with no `@media` and no escaped selector. Static shortcuts
// have the same hole one level down: the inline declaration part of `sm:btn`
// wraps fine, but string references to internal `__daisy-*` companion rules
// are re-parsed bare (no variant context) and leak unprefixed.
//
// Fix (applied centrally in src/index.ts, no batch-file churn):
//  1. Every static rule with a raw-string body becomes an exact-match dynamic
//     rule. With no variants it returns the original strings (byte-identical
//     output, same layer/meta). With variants it renames the owner class to
//     the variant-computed selector and nests the block in the
//     variant-computed parents (`@media ...`, `$$`-joined like core).
//  2. Every static shortcut holding string references becomes an exact-match
//     dynamic shortcut that re-attaches the request's variant prefix to each
//     reference (`sm:btn` -> `sm:__daisy-btn-nested`), so companions parse
//     with variant context and wrap via (1). Owner selectors for internal
//     rules come from ownerMapFromShortcuts() (each `__daisy-*` rule is
//     referenced by exactly one shortcut).
//
// Selector/parent computation mirrors Uno's applyVariants composition
// (VariantHandler selector/parent/handle/order/prefix/pseudo, reduceRight
// over order-sorted handlers starting from toEscapedSelector(target)), so
// responsive, state, print and stacked variants behave exactly as they do for
// declaration rules. Known limits: variants that rewrite declaration bodies
// (e.g. `important`) and variant layer/sort overrides do not apply to raw
// CSS; those tokens keep their base semantics under variants.

function emulateVariantTarget(
  target: string,
  handlers: readonly VariantHandler[],
): { selector: string; parent: string | undefined } {
  const sorted = handlers
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const composed = sorted.reduceRight(
    (
      prev: (input: VariantHandlerContext) => VariantHandlerContext,
      v: VariantHandler,
    ) =>
      (input: VariantHandlerContext): VariantHandlerContext => {
        const entries = v.body?.(input.entries) ?? input.entries;
        const rawParent: string | [string, number] | undefined = v.parent;
        const parentValue = Array.isArray(rawParent) ? rawParent[0] : rawParent;
        const parentOrder = Array.isArray(rawParent) ? rawParent[1] : undefined;
        const rewritten = v.selector?.(input.selector, entries);
        const next = {
          ...input,
          entries,
          selector:
            rewritten !== undefined
              ? rewritten || input.selector
              : input.selector,
          parent: parentValue || input.parent,
          parentOrder: parentOrder ?? input.parentOrder,
          layer: v.layer || input.layer,
          sort: v.sort || input.sort,
        } as VariantHandlerContext;
        return (v.handle ?? ((i, n) => n(i)))(next, prev);
      },
    (input: VariantHandlerContext) => input,
  );
  const start: VariantHandlerContext = {
    prefix: "",
    selector: toEscapedSelector(target),
    pseudo: "",
    entries: [],
  };
  const out = composed(start);
  return {
    selector: `${out.prefix}${out.selector}${out.pseudo}`,
    parent: out.parent,
  };
}

function nestParents(css: string, parent: string): string {
  // Same nesting as core's getRawLayer (`$$`-joined parents).
  const chain = parent.split(" $$ ");
  return `${chain.join("{")}{${css}${"}".repeat(chain.length)}`;
}

function wrapStrings(
  strings: string[],
  ownerSelector: string,
  target: string,
  handlers: readonly VariantHandler[],
): string[] {
  const { selector, parent } = emulateVariantTarget(target, handlers);
  const pattern = new RegExp(`${escapeRegExp(ownerSelector)}(?![\\w-])`, "g");
  // `(?![\w-])` keeps longer classes (`.btn-link`, `.menu-title`) and element
  // names (`li menu`) untouched; only whole `.owner` tokens are renamed.
  return strings.map((css) => {
    const renamed = css.replace(pattern, () => selector);
    return parent === undefined ? renamed : nestParents(renamed, parent);
  });
}

function ruleTarget(raw: string, name: string, owner: string): string {
  // Public rule: raw already is the variant-prefixed owner token
  // (`sm:card-side`). Internal rule: swap the internal name for the owner
  // while keeping the variant prefix (`sm:__daisy-btn-nested` -> `sm:btn`).
  if (owner === name) return raw;
  return raw.endsWith(name)
    ? `${raw.slice(0, raw.length - name.length)}${owner}`
    : raw;
}

// Variant prefix of this request (`sm:` in `sm:card-side`, `""` when bare).
// Only colon-separated prefixes wrap: with `-` in separators a dash split is
// usually accidental (`file-input-primary` = `file-` variant + `input-primary`
// — see tests/separators.test.ts), and those keep legacy verbatim output.
function variantPrefix(raw: string, current: string): string {
  return raw.length > current.length && raw.endsWith(current)
    ? raw.slice(0, raw.length - current.length)
    : "";
}

function dynamicRuleFor(
  name: string,
  strings: string[],
  meta: DynamicRule[2],
  owner: string,
): DynamicRule {
  const pattern = new RegExp(`^${escapeRegExp(name)}$`);
  const ownerSelector = `.${owner}`;
  const matcher = (_match: RegExpMatchArray, ctx: RuleContext) => {
    const handlers = ctx.variantHandlers ?? [];
    const vprefix = variantPrefix(ctx.rawSelector, ctx.currentSelector);
    if (handlers.length === 0 || !vprefix.endsWith(":")) return strings;
    return wrapStrings(
      strings,
      ownerSelector,
      ruleTarget(ctx.rawSelector, name, owner),
      handlers,
    );
  };
  return meta === undefined ? [pattern, matcher] : [pattern, matcher, meta];
}

/** Build the internal-rule -> owning-shortcut map from static shortcuts. */
export function ownerMapFromShortcuts(
  shortcuts: readonly Shortcut[],
): Map<string, string> {
  const owners = new Map<string, string>();
  for (const sc of shortcuts) {
    if (!isStaticShortcut(sc)) continue;
    const [name, value] = sc;
    const parts = typeof value === "string" ? [value] : value;
    for (const part of parts) {
      if (
        typeof part === "string" &&
        part.startsWith("__daisy-") &&
        !owners.has(part)
      )
        owners.set(part, name);
    }
  }
  return owners;
}

/**
 * Convert raw-string static rules to exact-match dynamic rules that wrap
 * under variants. Pure-declaration rules and existing dynamic rules pass
 * through untouched (they already wrap, and keep static-map priority).
 */
export function withVariantRules(
  rules: Rule[],
  owners: ReadonlyMap<string, string>,
): Rule[] {
  return rules.map((rule) => {
    if (!isStaticRule(rule)) return rule;
    const [name, body, meta] = rule;
    const parts: unknown[] = Array.isArray(body) ? [...body] : [body];
    if (!parts.every((p) => typeof p === "string")) return rule;
    const owner = name.startsWith("__daisy-")
      ? (owners.get(name) ?? name)
      : name;
    return dynamicRuleFor(name, parts as string[], meta, owner);
  });
}

/**
 * Convert static shortcuts that reference other utilities by token into
 * exact-match dynamic shortcuts that propagate the request's variant prefix
 * to each reference. Pure-inline shortcuts pass through untouched.
 */
export function withVariantShortcuts(shortcuts: Shortcut[]): Shortcut[] {
  return shortcuts.map((sc) => {
    if (!isStaticShortcut(sc)) return sc;
    const [name, value, meta] = sc;
    const parts = typeof value === "string" ? [value] : value;
    if (!parts.some((p) => typeof p === "string")) return sc;
    const pattern = new RegExp(`^${escapeRegExp(name)}$`);
    const matcher: DynamicShortcut[1] = (_match, ctx) => {
      const vprefix = variantPrefix(ctx.rawSelector, ctx.currentSelector);
      // Bare requests — and dash-implied splits (see variantPrefix) — return
      // the original value by reference: byte-identical output, zero change.
      if (!vprefix.endsWith(":")) return value;
      return parts.map((p) => (typeof p === "string" ? `${vprefix}${p}` : p));
    };
    const dynamic: DynamicShortcut =
      meta === undefined ? [pattern, matcher] : [pattern, matcher, meta];
    return dynamic;
  });
}
