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

// Placement-modal demo: swap dock classes on one dialog.
const PLACES = [
  'modal-top',
  'modal-middle',
  'modal-bottom',
  'modal-start',
  'modal-end',
] as const

const placeModal = document.getElementById('place-modal')
const placeOpen = document.getElementById('place-open')
const placeClose = document.getElementById('place-close')

placeOpen?.addEventListener('click', () => placeModal?.classList.add('modal-open'))
placeClose?.addEventListener('click', () => placeModal?.classList.remove('modal-open'))

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-place]')) {
  b.addEventListener('click', () => {
    const name = b.dataset.place
    if (name === undefined || placeModal === null) return
    placeModal.classList.remove(...PLACES)
    placeModal.classList.add(name)
    placeModal.classList.add('modal-open')
  })
}
