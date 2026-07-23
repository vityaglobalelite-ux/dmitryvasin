# Database schema & migrations

Local backup of the **self-hosted Supabase** database that powers the Telegram bots
(`api.betango.dance`, server `128.140.121.199`, container `supabase-db`,
image `supabase/postgres:15.8.1.085`).

Exported: **2026-07-23**. Contains **schema only — no row data / no secrets**.

## Contents

| File | What it is |
|------|-----------|
| `full-schema.sql` | Complete `pg_dump --schema-only` of the **whole** database — every schema (`public`, `auth`, `storage`, `realtime`, `graphql`, `vault`, `extensions`, …), all tables, columns, constraints, indexes, functions, triggers, policies. This is the authoritative current state. |
| `public-schema.sql` | Same dump but only the `public` schema — the application tables/functions you actually own. Easier to read. |
| `migrations/` | The ordered migration history that built the `public` schema. |
| `supabase-init/` | Supabase bootstrap SQL (roles, jwt, realtime, webhooks, logs, pooler, seed data). Runs once when the DB container is first created. |
| `studio-snippets/` | Saved SQL snippet(s) from the Supabase Studio SQL editor. |

## `public` schema tables (10)

`bot_settings`, `bot_users`, `chats`, `messages`, `payments`,
`scheduled_messages`, `subscription_invites`, `subscriptions`,
`tariff_prices`, `vip_intake`.

## Migrations

Canonical source of `001`–`005` is the other bot's repo on the server
(`/root/telegram-bot/sql/`). Migrations `006`–`011` had been **applied manually**
and existed only loosely in `/tmp` on the server — they are now preserved here.
`012` is the support-bot upgrade applied on 2026-07-23.

```
001_schema.sql               base tables (bot_users, chats, messages, …)
002_rls.sql                  row-level security policies
003_support_chat.sql         support chat: chats + messages + read RPCs + triggers
004_payments.sql             payments
005_tariff_prices.sql        tariff_prices
006_fix_grants.sql           permission fixes
007_tariff_price_was.sql     "old price" column
008_multi_month_channels.sql multi-month channel support
009_chat_grace_kick.sql      chat grace / kick logic     (two 009s: numbering collision on the server)
009_landing_tariff_public.sql public landing tariff
010_price_increase_public.sql price increase
011_tariff_prices.sql        tariff price update
012_support_bot_upgrade.sql  messages.admin_id/admin_name + support_waiting / support_recent / support_chat_status RPCs
```

> ⚠️ There are **two `009_*`** files — both are real; they collided on the number
> when applied. Apply order among them doesn't matter (independent changes).

## How to re-create the schema elsewhere

Fastest — restore the whole current state into an empty database:

```bash
psql -U postgres -d postgres -f full-schema.sql
```

Or replay history (public schema only), in filename order:

```bash
for f in migrations/0*.sql; do psql -U postgres -d postgres -f "$f"; done
```

## How this was generated

```bash
# on the server, inside the DB container
docker exec supabase-db pg_dump -U postgres -d postgres --schema-only            > full-schema.sql
docker exec supabase-db pg_dump -U postgres -d postgres --schema-only --schema=public > public-schema.sql
```
