import { animate, inView, stagger } from 'motion'
const animateAny = animate as any

export function initRevealAnimations() {
  inView('.reveal-group', (target) => {
    const items = Array.from(target.querySelectorAll('.reveal'))
    items.forEach((item, index) => {
      animateAny(
        item,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.55, delay: stagger(0.08)(index, items.length), ease: 'ease-out' },
      )
    })
  })

  inView('.card-animate', (target) => {
    animateAny(target, { opacity: [0, 1], y: [22, 0] }, { duration: 0.5, ease: 'ease-out' })
  })
}
