# dmitryvasincode

**Next.js (App Router)** · **TypeScript** · **Tailwind CSS** · **Cloudflare**

Supabase подключается отдельно. В проекте зарезервированы только переменные окружения:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Структура

```
src/
  app/
    (site)/         # публичный сайт — URL /
    privateclub/    # закрытый клуб — URL /privateclub/
  components/
    landing/        # UI клуба
    legal/          # юридические страницы клуба
  lib/
    site-config.ts  # идентичность публичного сайта
    club-config.ts  # идентичность клуба
docs/
  catalog.md        # бриф сайта-каталога (Figma, ТЗ, Kinescope, БД)
  cloudflare.md     # DNS, SSL, кэш
.github/workflows/  # деплой на GitHub Pages
```

## Старт

```bash
cp .env.example .env
npm install
npm run dev
```

- Публичный сайт: [http://localhost:3000](http://localhost:3000) (пока редирект на клуб)
- Закрытый клуб: [http://localhost:3000/privateclub/](http://localhost:3000/privateclub/)

## Production

Продакшен: **https://dmitryvasin.com** (статика на VPS, Caddy).

- `https://dmitryvasin.com/` — публичный сайт (пока редирект на клуб)
- `https://dmitryvasin.com/privateclub/` — лендинг закрытого клуба

Сборка без `basePath`. Артефакт из `out/` кладётся в `/var/www/dmitryvasin.com/` на сервере.

```bash
npm run build
scp -r out/* dmitryvasin-vps:/var/www/dmitryvasin.com/
```

GitHub Pages workflow ([deploy-pages.yml](.github/workflows/deploy-pages.yml)) собирает тот же `out/` как запасной деплой.

## Cloudflare

См. [docs/cloudflare.md](docs/cloudflare.md).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | разработка |
| `npm run build` | сборка |
| `npm run start` | production |
| `npm run lint` | ESLint |
