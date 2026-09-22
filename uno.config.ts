import { presetUno } from 'unocss'
import { presetDaisy } from './src/index.ts'

export default {
  presets: [presetUno(), presetDaisy({ themes: ['light', 'dark'] })],
}
