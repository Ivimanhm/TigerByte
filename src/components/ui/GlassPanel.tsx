import type { ComponentChildren } from 'preact'

interface GlassPanelProps {
  children: ComponentChildren
  class?: string
  id?: string
}

export function GlassPanel({ children, class: className = '', id }: GlassPanelProps) {
  return <article id={id} class={`glass-panel neon-border relative overflow-hidden rounded-panel ${className}`}>{children}</article>
}
