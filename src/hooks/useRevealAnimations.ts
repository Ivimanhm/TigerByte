import { animate, inView, stagger } from 'motion'
// motion's DOM overload expects Element but typings conflict with HTMLElement — cast needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const animateEl = animate as (el: unknown, keyframes: Record<string, unknown[]>, options?: Record<string, unknown>) => void

export function initRevealAnimations() {
  inView('.reveal-group', (target) => {
    const items = Array.from(target.querySelectorAll<HTMLElement>('.reveal'))
    items.forEach((item, index) => {
      animateEl(
        item,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.55, delay: stagger(0.08)(index, items.length), ease: 'ease-out' },
      )
    })
  })

  inView('.card-animate', (target) => {
    animateEl(target, { opacity: [0, 1], y: [22, 0] }, { duration: 0.5, ease: 'ease-out' })
  })
}
