import type { Preset } from "unocss";
import { resolveOptions } from "./options.ts";
import type { DaisyOptions } from "./options.ts";
import { layerOrder } from "./layers.ts";
import { basePreflights } from "./preflights/base.ts";
import { componentShortcuts } from "./shortcuts/components.ts";
import { componentRules } from "./rules/components.ts";
import { batch1Shortcuts } from "./shortcuts/batch1.ts";
import { batch1Rules } from "./rules/batch1.ts";
import { batch2Shortcuts } from "./shortcuts/batch2.ts";
import { batch2Rules } from "./rules/batch2.ts";
import { batch3Shortcuts } from "./shortcuts/batch3.ts";
import { batch3Rules } from "./rules/batch3.ts";
import { batch4Shortcuts } from "./shortcuts/batch4.ts";
import { batch4Rules } from "./rules/batch4.ts";
import { batch5Shortcuts } from "./shortcuts/batch5.ts";
import { batch5Rules } from "./rules/batch5.ts";
import { utilityRules } from "./rules/utilities.ts";
import { DAISY_COLORS, colorRules } from "./rules/colors.ts";
import {
  ownerMapFromShortcuts,
  withVariantRules,
  withVariantShortcuts,
} from "./variantWrap.ts";
import { daisyTheme } from "./theme/tokens.ts";
import { daisyVariants } from "./variants.ts";

export type { DaisyOptions };
export { themeOrder } from "./theme/order.ts";

// Normalize the P2 theme bridge (`tokens.ts`) into Uno's `theme.colors` shape.
// Falls back to the `var(--color-*)` bridge so `bg-primary` etc. resolve even
// if tokens are partial.
function daisyThemeBridge(opts: {
  themes: string[] | false;
}): Record<string, unknown> {
  const fromTokens =
    (daisyTheme(opts) as unknown as Record<string, unknown>) ?? {};
  const nested = (fromTokens["colors"] ?? {}) as Record<string, unknown>;
  const extended =
    ((fromTokens["extend"] ?? {}) as Record<string, unknown>)["colors"] ?? {};
  const fallback = Object.fromEntries(
    DAISY_COLORS.map((c) => [c, `var(--color-${c})`]),
  );
  return { colors: { ...fallback, ...(extended as object), ...nested } };
}

export function presetDaisy(userOptions: DaisyOptions = {}): Preset {
  const opts = resolveOptions(userOptions);
  if (opts.logs) {
    const themes = opts.themes === false ? "all" : opts.themes.join(",");
    // eslint-disable-next-line no-console
    console.log(
      `[unocss-preset-daisy] prefix=${JSON.stringify(opts.prefix)} themes=${themes} ` +
        `include=${opts.include.join(",") || "-"} exclude=${opts.exclude.join(",") || "-"}`,
    );
  }
  // Variant-aware raw CSS (see src/variantWrap.ts): raw-string rules swallow
  // responsive/state variants (RawUtil path), and static shortcuts leak
  // unprefixed companion CSS under variants. The converters below make both
  // wrap while keeping byte-identical output for unprefixed tokens.
  const shortcuts = [
    ...componentShortcuts(opts),
    ...batch1Shortcuts(opts),
    ...batch2Shortcuts(opts),
    ...batch3Shortcuts(opts),
    ...batch4Shortcuts(opts),
    ...batch5Shortcuts(opts),
  ];
  const rules = [
    ...(componentRules(opts) ?? []),
    ...(batch1Rules(opts) ?? []),
    ...(batch2Rules(opts) ?? []),
    ...(batch3Rules(opts) ?? []),
    ...(batch4Rules(opts) ?? []),
    ...(batch5Rules(opts) ?? []),
    ...(utilityRules(opts) ?? []),
    ...(colorRules(opts) ?? []),
  ];
  const owners = ownerMapFromShortcuts(shortcuts);
  return {
    name: "unocss-preset-daisy",
    layers: layerOrder,
    preflights: basePreflights(opts),
    shortcuts: withVariantShortcuts(shortcuts),
    rules: withVariantRules(rules, owners),
    variants: daisyVariants(opts),
    theme: daisyThemeBridge(opts),
  };
}

export default presetDaisy;
