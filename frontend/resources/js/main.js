import '../css/main.css'

const header = document.querySelector('[data-site-header]')
const revealItems = document.querySelectorAll('[data-reveal]')
const menuToggle = document.querySelector('[data-menu-toggle]')
const menuOverlay = document.querySelector('[data-menu-overlay]')
const mobileMenu = document.querySelector('[data-mobile-menu]')

const onScroll = () => {
  if (!header) return
  header.classList.toggle('is-scrolled', window.scrollY > 24)
}

onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

if (revealItems.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )

  revealItems.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 80, 240)}ms`
    observer.observe(el)
  })
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'))
}

const setHeaderHeight = () => {
  if (!header) return
  const headerHeight = header.offsetHeight
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
}

const setMenuOpen = (open) => {
  if (!header || !menuToggle || !menuOverlay || !mobileMenu) return

  header.classList.toggle('is-menu-open', open)
  menuToggle.setAttribute('aria-expanded', String(open))
  menuToggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單')
  menuOverlay.setAttribute('aria-hidden', String(!open))
  mobileMenu.setAttribute('aria-hidden', String(!open))
  document.body.classList.toggle('overflow-hidden', open)
}

const closeMenu = () => setMenuOpen(false)
const toggleMenu = () => {
  if (!header) return
  setMenuOpen(!header.classList.contains('is-menu-open'))
}

if (menuToggle && menuOverlay && mobileMenu) {
  menuToggle.addEventListener('click', toggleMenu)
  menuOverlay.addEventListener('click', closeMenu)

  mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu()
  })
}

setHeaderHeight()
window.addEventListener(
  'resize',
  () => {
    setHeaderHeight()
    if (window.matchMedia('(min-width: 1024px)').matches) closeMenu()
  },
  { passive: true },
)