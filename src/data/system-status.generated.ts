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
    "label": "Repositorio GitHub",
    "value": "Operativo",
    "level": "ok",
    "detail": "GitHub API online (main) accesible",
    "actionUrl": "https://github.com/Ivimanhm/TigerByte"
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
    "value": "Actualizado",
    "level": "ok",
    "detail": "Version actual: 0.0.2"
  },
  {
    "id": "action",
    "label": "Actualizar app",
    "value": "Descargar",
    "level": "action",
    "detail": "https://github.com/Ivimanhm/TigerByte/releases/tag/0.0.2",
    "actionUrl": "https://github.com/Ivimanhm/TigerByte/releases/tag/0.0.2"
  }
]
