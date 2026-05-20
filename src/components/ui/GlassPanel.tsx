import type { ComponentChildren } from 'preact'

interface GlassPanelProps {
  children: ComponentChildren
  class?: string
}

export function GlassPanel({ children, class: className = '' }: GlassPanelProps) {
  return <article class={`glass-panel neon-border relative overflow-hidden rounded-panel ${className}`}>{children}</article>
}
