export interface UpdateItem {
  version: string
  tag: string
  date: string
  note: string
}

export const updates: UpdateItem[] = [
  {
    "version": "0.0.1",
    "tag": "COMMIT",
    "date": "20 May, 2026",
    "note": "Primer commit"
  }
]
