import 'virtual:uno.css'
import 'unocss-preset-daisy/themes'
// Theme variable definitions (oklch --color-*, --radius-*, --size-*, ...).
// The preset emits component CSS through Uno; the 35 theme blocks ship as a
// separate stylesheet that must be imported once (see package exports './themes').

const THEMES = ['light', 'dark', 'cupcake', 'synthwave', 'retro'] as const

const root = document.documentElement
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-set-theme]')

function setTheme(name: string): void {
  root.setAttribute('data-theme', name)
  try {
    localStorage.setItem('daisy-uno-theme', name)
  } catch {
    /* private mode — ignore */
  }
  for (const b of buttons) {
    const active = b.dataset.setTheme === name
    b.classList.toggle('btn-active', active)
    b.setAttribute('aria-pressed', String(active))
  }
}

let initial = 'light'
try {
  const saved = localStorage.getItem('daisy-uno-theme')
  if (saved !== null && (THEMES as readonly string[]).includes(saved)) initial = saved
} catch {
  /* ignore */
}

for (const b of buttons) {
  b.addEventListener('click', () => {
    const name = b.dataset.setTheme
    if (name !== undefined) setTheme(name)
  })
}

setTheme(initial)
