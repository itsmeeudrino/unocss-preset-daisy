import type { Preset } from "unocss";

// Port of @layer daisyui.l1.l2.l3 nesting -> Uno flat layer order.
// Lower index = lower priority. Utilities must beat components.
//
// Priority direction (outer wins) follows daisyUI's design — see
// https://github.com/saadeghi/daisyui/issues/4209: `l1` (states + bare
// daisyui: hover/active/disabled/focus, link) outranks `l1.l2` (modifiers:
// colors, sizes), which outranks `l1.l2.l3` (component base + style variants).
// Mapping the names 1:1 but ranking l1 highest reproduces that cascade with
// flat Uno layers (verified: btn-{accent,info,...} text resolves to the dark
// *-content colors in dark theme, matching daisyUI reference rendering).
export const layerOrder: Exclude<Preset["layers"], undefined> = {
  base: -100,
  "daisy-l3": -30,
  "daisy-l2": -20,
  "daisy-l1": -10,
  components: 0,
  utilities: 10,
};
