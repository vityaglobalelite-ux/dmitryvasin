-- Dev catalog rows. Stable ids. Does not touch bot_* tables.
-- kinescope videos intentionally omitted.

INSERT INTO public.catalog_settings (key, value)
VALUES (
  'wholesale_tiers',
  '[{"minQty":2,"percent":5},{"minQty":4,"percent":10},{"minQty":6,"percent":15}]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.catalog_products (
  id, type, price_minor, currency, access_days, cover_url,
  duration_sec, level, skills, lesson_count, published
) VALUES
(
  'c0a7a109-0001-4000-8000-000000000001',
  'lifehack', 49000, 'rub', 30, '/assets/site/home/review-shot-37.png',
  500, '1', ARRAY['Осознавание','Ось'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000002',
  'lifehack', 59000, 'rub', 30, '/assets/site/home/review-shot-38.png',
  725, '2', ARRAY['Техника','Стопы'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000003',
  'lesson', 149000, 'rub', 90, '/assets/site/home/review-shot-39.png',
  2520, '2', ARRAY['Техника','Очо'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000004',
  'lesson', 169000, 'rub', 90, '/assets/site/home/review-shot-41.png',
  2292, '3', ARRAY['Музыкальность','Осознавание'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000005',
  'course', 990000, 'rub', 180, '/assets/site/home/review-shot-42.png',
  21600, '2', ARRAY['Техника','Взаимодействие','Осознавание'], 6, true
),
(
  'c0a7a109-0001-4000-8000-000000000006',
  'extra', 79000, 'rub', 60, '/assets/site/home/review-shot-40.png',
  1320, '1', ARRAY['Осознавание'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000007',
  'research', 249000, 'rub', 120, '/assets/site/home/review-shot-44.png',
  3480, '4', ARRAY['Осознавание','Вариативность'], NULL, true
),
(
  'c0a7a109-0001-4000-8000-000000000008',
  'peek', 199000, 'rub', 90, '/assets/site/home/review-shot-45.png',
  3270, '3', ARRAY['Взаимодействие','Техника'], NULL, true
)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  price_minor = EXCLUDED.price_minor,
  currency = EXCLUDED.currency,
  access_days = EXCLUDED.access_days,
  cover_url = EXCLUDED.cover_url,
  duration_sec = EXCLUDED.duration_sec,
  level = EXCLUDED.level,
  skills = EXCLUDED.skills,
  lesson_count = EXCLUDED.lesson_count,
  published = EXCLUDED.published,
  updated_at = now();

INSERT INTO public.catalog_product_i18n (product_id, locale, title, short, description, program) VALUES
(
  'c0a7a109-0001-4000-8000-000000000001', 'ru',
  'Ось за 8 минут',
  'Короткий приём, чтобы поймать вертикаль и перестать «садиться» в шаг.',
  'Лайфхак про ось: где она теряется в простом шаге и как вернуть её без лишнего напряжения. Смотрите, пробуйте сразу у зеркала, повторяйте в милонге.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000001', 'en',
  'Axis in 8 minutes',
  'A short cue to find your vertical and stop collapsing into the step.',
  'A lifehack about axis: where it disappears in a simple walk, and how to bring it back without extra tension. Watch, try it at the mirror, then take it to the milonga.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000002', 'ru',
  'Стопы без шума',
  'Как убрать стук каблука и сделать шаг тихим, не теряя ясности.',
  'Разбор контакта стопы с полом: перенос веса, шум каблука и лишняя работа пальцев. После ролика шаг становится тише и понятнее партнёру.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000002', 'en',
  'Quiet feet',
  'How to lose the heel noise without losing clarity in the step.',
  'A breakdown of the foot’s contact with the floor: weight transfer, heel noise, and extra toe work. After the video the step is quieter and easier for the partner to read.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000003', 'ru',
  'Очо без закручивания корпуса',
  'Урок: разобрать оче так, чтобы спина оставалась спокойной.',
  'Полный урок по оче: направление коленей, объём бёдер и что делать с корпусом, чтобы не закручивать пару. Есть медленный разбор, зеркало и практика под музыку.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000003', 'en',
  'Ocho without twisting the torso',
  'A lesson on ochos that keeps the back quiet.',
  'A full ocho lesson: knee direction, hip volume, and what the torso should do so you don’t twist the couple. Slow breakdown, mirror work, and practice with music.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000004', 'ru',
  'Пауза, которую слышно',
  'Урок про то, как остановиться в музыке, а не просто замёрзнуть.',
  'Музыкальная пауза в танго: куда девается вес, как не обрывать объятие и как продолжить фразу. Урок для тех, кто уже ходит, но «стоит» слишком рано или слишком поздно.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000004', 'en',
  'A pause you can hear',
  'A lesson on stopping inside the music instead of freezing.',
  'Musical pause in tango: where the weight goes, how not to break the embrace, and how to continue the phrase. For dancers who already walk, but pause too early or too late.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000005', 'ru',
  'База, на которой держится пара',
  'Курс из 6 уроков: ось, шаг, объятие и простой поворот.',
  'Система, а не набор роликов. Каждый урок опирается на предыдущий: сначала ось и шаг, затем объятие, затем простой поворот. Можно проходить в своём темпе и возвращаться к эпизодам.',
  E'Урок 1. Ось и перенос веса\nУрок 2. Шаг без спешки\nУрок 3. Объятие: тонус, а не зажим\nУрок 4. Ведение в простом шаге\nУрок 5. Выход в поворот\nУрок 6. Сборка под музыку'
),
(
  'c0a7a109-0001-4000-8000-000000000005', 'en',
  'The base that holds the couple',
  'A 6-lesson course: axis, walk, embrace, and a simple turn.',
  'A system, not a pile of clips. Each lesson builds on the last: axis and walk, then embrace, then a simple turn. Go at your own pace and revisit any episode.',
  E'Lesson 1. Axis and weight transfer\nLesson 2. Walking without hurry\nLesson 3. Embrace: tone, not a clamp\nLesson 4. Leading in a simple walk\nLesson 5. Entering a turn\nLesson 6. Putting it together with music'
),
(
  'c0a7a109-0001-4000-8000-000000000006', 'ru',
  'Разминка до милонги',
  'Доп. материал: 20 минут, чтобы тело включилось до танца.',
  'Короткая последовательность до выхода на танцпол: стопы, бёдра, грудная клетка. Не тренировка «на усталость», а способ прийти в зал уже готовым.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000006', 'en',
  'Warm-up before the milonga',
  'Extra: 20 minutes to switch the body on before dancing.',
  'A short sequence before you step onto the floor: feet, hips, ribcage. Not a workout to exhaustion — a way to arrive already ready.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000007', 'ru',
  'Исследование: куда уходит шаг',
  'Часовой разбор, почему шаг «уезжает» в сторону и как его вернуть.',
  'Исследовательский формат: не рецепт на три счёта, а наблюдение за тем, куда уходит траектория шага. Много пауз, сравнений и возвратов к одному и тому же месту.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000007', 'en',
  'Research: where the step goes',
  'An hour-long look at why the step drifts sideways — and how to bring it back.',
  'A research format: not a three-count recipe, but observation of where the walk’s path goes. Lots of pauses, comparisons, and returns to the same place.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000008', 'ru',
  'Подсмотр: индивидуальный урок',
  'Запись реальной работы с парой — без постановки «для камеры».',
  'Урок-подсмотр: как я веду человека через затык в объятии. Видно ошибки, паузы и точные формулировки. Смотреть полезно и ведущим, и ведомым.',
  NULL
),
(
  'c0a7a109-0001-4000-8000-000000000008', 'en',
  'Peek: a private lesson',
  'A recording of real work with a couple — not staged for the camera.',
  'A peek lesson: how I take a dancer through a block in the embrace. You see the mistakes, the pauses, and the exact wording. Useful for both leaders and followers.',
  NULL
)
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  short = EXCLUDED.short,
  description = EXCLUDED.description,
  program = EXCLUDED.program;

NOTIFY pgrst, 'reload schema';
