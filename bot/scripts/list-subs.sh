#!/bin/sh
docker exec supabase-db psql -U postgres -d postgres -c "select telegram_id, username, state from bot_users;"
docker exec supabase-db psql -U postgres -d postgres -c "select telegram_id, tariff, status, access_ends_at from subscriptions order by created_at desc;"
