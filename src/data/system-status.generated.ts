export interface SystemStatusItem {
  id: 'repo' | 'db' | 'updates' | 'action'
  label: string
  value: string
  level: 'ok' | 'warn' | 'error' | 'action'
  detail?: string
  actionUrl?: string
}

export const systemStatus: SystemStatusItem[] = [
  {
    "id": "repo",
    "label": "Repositorio Git",
    "value": "Operativo",
    "level": "ok",
    "detail": "Rama main accesible"
  },
  {
    "id": "db",
    "label": "Base de datos",
    "value": "SQLite conectada",
    "level": "ok",
    "detail": "C:\\Users\\Ivan Humara\\Documents\\TigerByte2\\data\\tigerbyte.sqlite"
  },
  {
    "id": "updates",
    "label": "Actualizaciones",
    "value": "0.0.1",
    "level": "ok",
    "detail": "Ultimo commit: 20 May, 2026"
  },
  {
    "id": "action",
    "label": "Actualizar app",
    "value": "Descargar",
    "level": "action",
    "detail": "https://github.com/Ivimanhm/TigerByte/releases",
    "actionUrl": "https://github.com/Ivimanhm/TigerByte/releases"
  }
]
