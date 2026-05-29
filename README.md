# dmitryvasincode

**Next.js (App Router)** · **TypeScript** · **Tailwind CSS** · **Cloudflare**

Supabase подключается отдельно. В проекте зарезервированы только переменные окружения:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Структура

```
src/
  app/              # страницы и API (App Router)
    api/health/     # проверка деплоя
  lib/              # утилиты (по мере роста проекта)
docs/
  cloudflare.md     # DNS, SSL, кэш
```

## Старт

```bash
cp .env.example .env
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Cloudflare

См. [docs/cloudflare.md](docs/cloudflare.md).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | разработка |
| `npm run build` | сборка |
| `npm run start` | production |
| `npm run lint` | ESLint |
