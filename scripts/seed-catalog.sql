-- Wave 0 catalog seed. Keep ids/prices/covers in sync with scripts/seed-catalog.mjs.
-- Apply migration 023 before seeding. Full program/media/bundles: prefer seed-catalog.mjs.

INSERT INTO public.catalog_settings (key, value)
VALUES (
  'wholesale_tiers',
  '[{"minQty":2,"percent":5},{"minQty":4,"percent":10},{"minQty":6,"percent":15}]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Unpublish legacy dev catalog (c0a7a109-*).
UPDATE public.catalog_products
SET published = false
WHERE id::text LIKE 'c0a7a109-%';

-- Posture bundle (Figma 607:399): full 40_000₽, blocks 25_000₽ each, 180 days.
-- TEMP: course-2 price_minor = 0 until Figma/TZ price exists.
-- Peeks: 4_000₽, 180 days, sort_index 1..24, available_at MSK (see seed-catalog.mjs).

-- Stable ids (same as src/lib/catalog/ids.ts):
--   full   d0230001-0001-4000-8000-000000000001
--   block1 d0230001-0002-4000-8000-000000000002
--   block2 d0230001-0003-4000-8000-000000000003
--   course2 d0230001-0004-4000-8000-000000000004
--   lifehack-1..3 d0230001-2001-4000-8000-00000000000{1..3}
--   peek-1 d0230001-1001-4000-8000-000000000001
--   peek-n d0230001-1001-4000-8000-{n as 12-hex}

-- For a full VPS fill (products + i18n + media + bundles + program rows), run:
--   node --env-file=.env scripts/seed-catalog.mjs
