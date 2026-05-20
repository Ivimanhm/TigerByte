import { Database, RefreshCw, Server, Shield } from 'lucide-preact'
import { GlassPanel } from '../../components/ui/GlassPanel'

const rows = [
  { label: 'Servidores', value: 'Operativo', icon: Server },
  { label: 'Actualizaciones', value: 'Al dia', icon: RefreshCw },
  { label: 'Anti-ban', value: 'Activo', icon: Shield },
  { label: 'Base de datos', value: 'Sincronizada', icon: Database },
]

export function StatusSection() {
  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Estado del sistema</h3>
      <div class="space-y-3 text-sm">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div class="flex items-center justify-between rounded-lg border border-cyan/20 bg-bg/50 px-3 py-2">
              <span class="inline-flex items-center gap-2 text-muted">
                <Icon size={15} class="text-cyan" />
                {row.label}
              </span>
              <strong class="text-emerald-300">{row.value}</strong>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
