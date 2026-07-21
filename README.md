# dmitryvasincode

**Next.js (App Router)** · **TypeScript** · **Tailwind CSS** · **Cloudflare**

Supabase подключается отдельно. В проекте зарезервированы только переменные окружения:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Структура

```
src/
  app/              # страницы (App Router)
  lib/              # утилиты (по мере роста проекта)
docs/
  cloudflare.md     # DNS, SSL, кэш
.github/workflows/  # деплой на GitHub Pages
```

## Старт

```bash
cp .env.example .env
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Production

Продакшен: **https://dmitryvasin.com** (статика на VPS, Caddy).

Сборка без `basePath` (`NEXT_PUBLIC_BASE_PATH=""`). Артефакт из `out/` кладётся в `/var/www/dmitryvasin.com` на сервере.

GitHub Pages workflow ([deploy-pages.yml](.github/workflows/deploy-pages.yml)) тоже собирает без `basePath` как запасной деплой.

## Cloudflare

См. [docs/cloudflare.md](docs/cloudflare.md).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | разработка |
| `npm run build` | сборка |
| `npm run start` | production |
| `npm run lint` | ESLint |
