# Cloudflare

## DNS

- **A** на IP сервера или **CNAME** на хостинг.
- Прокси (оранжевое облако) — CDN, DDoS-защита, WAF.

## SSL/TLS

| Режим | Когда |
|-------|--------|
| **Full (strict)** | На origin валидный HTTPS-сертификат |
| **Full** | HTTPS на origin, сертификат может быть самоподписанным |
| **Flexible** | Origin без HTTPS (не для продакшена) |

Для Vercel/Node-хостинга обычно достаточно **Full (strict)**.

## Переменные в Cloudflare

В **Workers & Pages → Settings → Environment variables** (или Secrets) задайте:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Их же можно держать в `.env` локально. Service role и секреты БД в этот проект не входят.

## Кэш

| Путь | Политика |
|------|----------|
| `/_next/static/*` | Cache Everything, долгий TTL |
| `/api/*` | Bypass cache |
| HTML-страницы | По умолчанию или Bypass для динамики |

## API и healthcheck

`GET /api/health` — для мониторинга. В Cloudflare для этого пути: **Bypass cache**.

## Заголовки (опционально)

Transform Rules или **Settings → Security → Headers**:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Деплой Next.js

Варианты:

1. **VPS / Node** — `npm run build` + `npm run start` за reverse proxy; Cloudflare перед сервером.
2. **Cloudflare Workers** — [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) (отдельная настройка при необходимости).

Текущий репозиторий — стандартный Next.js без привязки к конкретному хостингу.
