import type { Preset } from 'unocss'

// Port of @layer daisyui.l1.l2.l3 nesting -> Uno layer order.
// Lower index = lower priority. Utilities must beat components.
export const layerOrder: Preset['layers'] = {
  base: -100,
  'daisy-l1': -30,
  'daisy-l2': -20,
  'daisy-l3': -10,
  components: 0,
  utilities: 10,
}
