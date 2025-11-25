### Проект ШараборинАЕ__ФЫВ

vzriv mozga - взрыв мозга

## Backend

1. Запусти API для сохранения рисунков:
   ```bash
   pnpm install
   pnpm server
   ```
2. По умолчанию сервер слушает `http://localhost:3001`. Чтобы фронтенд ходил на другой адрес, задай `VITE_API_URL` (например, `VITE_API_URL=http://localhost:3001 pnpm dev`).

Эндпоинты:
- `GET /api/drawings` — получить сохранённые рисунки
- `POST /api/drawings` — сохранить рисунок (`{ imageData: "data:image/png;base64,..." }`)
