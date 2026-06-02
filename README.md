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

## GitHub Pages

Сайт публикуется при push в `master`: [GitHub Actions](.github/workflows/deploy-pages.yml).

**Один раз в репозитории на GitHub:** Settings → Pages → Build and deployment → **Source: GitHub Actions**.

После успешного деплоя: **https://vityaglobalelite-ux.github.io/dmitryvasin/**

Локальная проверка сборки как на Pages:

```bash
set NEXT_PUBLIC_BASE_PATH=/dmitryvasin
npm run build
npx serve out
```

## Cloudflare

См. [docs/cloudflare.md](docs/cloudflare.md).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | разработка |
| `npm run build` | сборка |
| `npm run start` | production |
| `npm run lint` | ESLint |
