-- Dev catalog fill. Stable ids. Does not touch bot_* tables.
-- Covers live in /assets/site/catalog/covers/ (Figma + studio photos).

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
('c0a7a109-0001-4000-8000-000000000001', 'lifehack',  49000, 'rub',  30, '/assets/site/catalog/covers/yt-technique.png',     500,  '1', ARRAY['Осознавание','Ось'], NULL, true),
('c0a7a109-0001-4000-8000-000000000002', 'lifehack',  59000, 'rub',  30, '/assets/site/catalog/covers/studio-dmitry.png',    725,  '2', ARRAY['Техника','Стопы'], NULL, true),
('c0a7a109-0001-4000-8000-000000000009', 'lifehack',  45000, 'rub',  30, '/assets/site/catalog/covers/yt-interaction.png',  380,  '1', ARRAY['Осознавание','Объятие'], NULL, true),
('c0a7a109-0001-4000-8000-000000000010', 'lifehack',  55000, 'rub',  30, '/assets/site/catalog/covers/yt-variability.png',  640,  '2', ARRAY['Техника','Ось'], NULL, true),
('c0a7a109-0001-4000-8000-000000000011', 'lifehack',  52000, 'rub',  30, '/assets/site/catalog/covers/dancer-dress.png',    510,  '1', ARRAY['Музыкальность'], NULL, true),

('c0a7a109-0001-4000-8000-000000000003', 'lesson',   149000, 'rub',  90, '/assets/site/catalog/covers/couple-gold.png',     2520,  '2', ARRAY['Техника','Очо'], NULL, true),
('c0a7a109-0001-4000-8000-000000000004', 'lesson',   169000, 'rub',  90, '/assets/site/catalog/covers/silhouette.png',      2292,  '3', ARRAY['Музыкальность','Осознавание'], NULL, true),
('c0a7a109-0001-4000-8000-000000000012', 'lesson',   139000, 'rub',  90, '/assets/site/catalog/covers/stage-feet.png',      2100,  '1', ARRAY['Техника','Шаг'], NULL, true),
('c0a7a109-0001-4000-8000-000000000013', 'lesson',   159000, 'rub',  90, '/assets/site/catalog/covers/photo-dance.webp',    2460,  '2', ARRAY['Техника','Поворот'], NULL, true),
('c0a7a109-0001-4000-8000-000000000014', 'lesson',   179000, 'rub',  90, '/assets/site/catalog/covers/studio-lesson.webp',  2640,  '3', ARRAY['Техника','Сакада'], NULL, true),
('c0a7a109-0001-4000-8000-000000000015', 'lesson',   155000, 'rub',  90, '/assets/site/catalog/covers/photo-liza.webp',     2340,  '2', ARRAY['Взаимодействие','Объятие'], NULL, true),
('c0a7a109-0001-4000-8000-000000000016', 'lesson',   165000, 'rub',  90, '/assets/site/catalog/covers/teacher-hero.webp',   2580,  '3', ARRAY['Техника','Ведение'], NULL, true),

('c0a7a109-0001-4000-8000-000000000005', 'course',   990000, 'rub', 180, '/assets/site/catalog/covers/studio-lesson.webp', 21600,  '2', ARRAY['Техника','Взаимодействие','Осознавание'], 6, true),
('c0a7a109-0001-4000-8000-000000000017', 'course',  1290000, 'rub', 180, '/assets/site/catalog/covers/og-dmitry.png',      28800, '3', ARRAY['Музыкальность','Осознавание'], 8, true),
('c0a7a109-0001-4000-8000-000000000018', 'course',  1190000, 'rub', 180, '/assets/site/catalog/covers/couple-gold.png',    25200,  '2', ARRAY['Техника','Ось','Шаг'], 7, true),
('c0a7a109-0001-4000-8000-000000000019', 'course',  1490000, 'rub', 365, '/assets/site/catalog/covers/dancer-dress.png',   32400,  '3', ARRAY['Взаимодействие','Техника'], 10, true),

('c0a7a109-0001-4000-8000-000000000006', 'extra',    79000, 'rub',  60, '/assets/site/catalog/covers/photo-dance.webp',    1320,  '1', ARRAY['Осознавание'], NULL, true),
('c0a7a109-0001-4000-8000-000000000020', 'extra',    69000, 'rub',  60, '/assets/site/catalog/covers/couple-stage.jpg',     900,  '1', ARRAY['Взаимодействие'], NULL, true),
('c0a7a109-0001-4000-8000-000000000021', 'extra',    89000, 'rub',  90, '/assets/site/catalog/covers/photo-dmitry.webp',   1500,  '2', ARRAY['Техника'], NULL, true),

('c0a7a109-0001-4000-8000-000000000007', 'research', 249000, 'rub', 120, '/assets/site/catalog/covers/silhouette.png',      3480,  '4', ARRAY['Осознавание','Вариативность'], NULL, true),
('c0a7a109-0001-4000-8000-000000000022', 'research', 229000, 'rub', 120, '/assets/site/catalog/covers/dancer-dress.png',    3300,  '4', ARRAY['Осознавание','Объятие'], NULL, true),
('c0a7a109-0001-4000-8000-000000000023', 'research', 259000, 'rub', 120, '/assets/site/catalog/covers/studio-dmitry.png',   3600,  '3', ARRAY['Вариативность','Техника'], NULL, true),

('c0a7a109-0001-4000-8000-000000000008', 'peek',    199000, 'rub',  90, '/assets/site/catalog/covers/studio-lesson.webp',  3270,  '3', ARRAY['Взаимодействие','Техника'], NULL, true),
('c0a7a109-0001-4000-8000-000000000024', 'peek',    189000, 'rub',  90, '/assets/site/catalog/covers/photo-liza.webp',     3120,  '2', ARRAY['Взаимодействие','Осознавание'], NULL, true),
('c0a7a109-0001-4000-8000-000000000025', 'peek',    219000, 'rub',  90, '/assets/site/catalog/covers/teacher-hero.webp',   3540,  '3', ARRAY['Техника','Объятие'], NULL, true)
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
('c0a7a109-0001-4000-8000-000000000001', 'ru', 'Ось за 8 минут', 'Короткий приём, чтобы поймать вертикаль и перестать «садиться» в шаг.', 'Лайфхак про ось: где она теряется в простом шаге и как вернуть её без лишнего напряжения.', NULL),
('c0a7a109-0001-4000-8000-000000000001', 'en', 'Axis in 8 minutes', 'A short cue to find your vertical and stop collapsing into the step.', 'A lifehack about axis: where it disappears in a simple walk, and how to bring it back without extra tension.', NULL),
('c0a7a109-0001-4000-8000-000000000002', 'ru', 'Стопы без шума', 'Как убрать стук каблука и сделать шаг тихим, не теряя ясности.', 'Разбор контакта стопы с полом: перенос веса, шум каблука и лишняя работа пальцев.', NULL),
('c0a7a109-0001-4000-8000-000000000002', 'en', 'Quiet feet', 'How to lose the heel noise without losing clarity in the step.', 'A breakdown of the foot’s contact with the floor: weight transfer, heel noise, and extra toe work.', NULL),
('c0a7a109-0001-4000-8000-000000000009', 'ru', 'Тонус в объятии', 'Как держать объятие живым, не превращая его в зажим.', 'Короткий лайфхак: где в объятии появляется лишний тонус и как его отпустить, не теряя ясности ведения.', NULL),
('c0a7a109-0001-4000-8000-000000000009', 'en', 'Tone in the embrace', 'How to keep the embrace alive without turning it into a clamp.', 'A short lifehack: where extra tone shows up in the embrace and how to release it without losing the lead.', NULL),
('c0a7a109-0001-4000-8000-000000000010', 'ru', 'Колени смотрят в шаг', 'Один ориентир, который сразу собирает траекторию.', 'Лайфхак про направление коленей: куда они смотрят в шаге и почему от этого «ломается» ось.', NULL),
('c0a7a109-0001-4000-8000-000000000010', 'en', 'Knees face the step', 'One cue that immediately organizes the path.', 'A lifehack about knee direction: where they point in the walk and why the axis breaks when they don’t.', NULL),
('c0a7a109-0001-4000-8000-000000000011', 'ru', 'Акцент, который слышно телом', 'Как ответить на удар оркестра шагом, а не плечами.', 'Музыкальный лайфхак: куда уходит вес на акценте и как не дёргать корпус.', NULL),
('c0a7a109-0001-4000-8000-000000000011', 'en', 'An accent the body can hear', 'How to answer the orchestra with the step, not the shoulders.', 'A musical lifehack: where the weight goes on the accent and how not to jerk the torso.', NULL),

('c0a7a109-0001-4000-8000-000000000003', 'ru', 'Очо без закручивания корпуса', 'Урок: разобрать оче так, чтобы спина оставалась спокойной.', 'Полный урок по оче: направление коленей, объём бёдер и что делать с корпусом, чтобы не закручивать пару.', NULL),
('c0a7a109-0001-4000-8000-000000000003', 'en', 'Ocho without twisting the torso', 'A lesson on ochos that keeps the back quiet.', 'A full ocho lesson: knee direction, hip volume, and what the torso should do so you don’t twist the couple.', NULL),
('c0a7a109-0001-4000-8000-000000000004', 'ru', 'Пауза, которую слышно', 'Урок про то, как остановиться в музыке, а не просто замёрзнуть.', 'Музыкальная пауза в танго: куда девается вес, как не обрывать объятие и как продолжить фразу.', NULL),
('c0a7a109-0001-4000-8000-000000000004', 'en', 'A pause you can hear', 'A lesson on stopping inside the music instead of freezing.', 'Musical pause in tango: where the weight goes, how not to break the embrace, and how to continue the phrase.', NULL),
('c0a7a109-0001-4000-8000-000000000012', 'ru', 'Простой шаг без спешки', 'Базовый урок ходьбы: перенос веса и длина шага.', 'Разбираем обычный шаг так, чтобы он стал понятным партнёру. Медленно, с зеркалом и под музыку.', NULL),
('c0a7a109-0001-4000-8000-000000000012', 'en', 'A simple walk without hurry', 'A fundamental walking lesson: weight transfer and step length.', 'We break down the basic walk so the partner can read it. Slow, with a mirror, and with music.', NULL),
('c0a7a109-0001-4000-8000-000000000013', 'ru', 'Выход в поворот', 'Как начать поворот из шага, не теряя оси.', 'Урок про вход в поворот: куда смотрит корпус, что делает свободная нога и как не завалиться внутрь.', NULL),
('c0a7a109-0001-4000-8000-000000000013', 'en', 'Entering a turn', 'How to start a turn from the walk without losing the axis.', 'A lesson on entering the turn: where the torso faces, what the free leg does, and how not to fall inward.', NULL),
('c0a7a109-0001-4000-8000-000000000014', 'ru', 'Сакада без толчка', 'Точное место и момент, чтобы сакада не стала ударом.', 'Разбор сакады: геометрия ног, момент в музыке и как не толкать партнёра корпусом.', NULL),
('c0a7a109-0001-4000-8000-000000000014', 'en', 'Sacada without a shove', 'The exact place and timing so a sacada is not a hit.', 'A sacada breakdown: leg geometry, the moment in the music, and how not to push the partner with the torso.', NULL),
('c0a7a109-0001-4000-8000-000000000015', 'ru', 'Объятие, в котором удобно обоим', 'Урок про тонус, дистанцию и ясность в паре.', 'Как собрать объятие так, чтобы ведущему было ясно, а ведомому — безопасно. Много сравнений «до / после».', NULL),
('c0a7a109-0001-4000-8000-000000000015', 'en', 'An embrace comfortable for both', 'A lesson on tone, distance, and clarity in the couple.', 'How to build an embrace the leader can read and the follower can trust. Lots of before / after comparisons.', NULL),
('c0a7a109-0001-4000-8000-000000000016', 'ru', 'Ведение в простом шаге', 'Как пригласить шаг, а не тащить человека за собой.', 'Урок ведения: импульс, пауза и то, что происходит в груди. Для тех, кто уже ходит, но пара «не едет».', NULL),
('c0a7a109-0001-4000-8000-000000000016', 'en', 'Leading in a simple walk', 'How to invite the step instead of dragging the person along.', 'A leading lesson: impulse, pause, and what happens in the chest. For dancers who already walk, but the couple doesn’t travel.', NULL),

('c0a7a109-0001-4000-8000-000000000005', 'ru', 'База, на которой держится пара', 'Курс из 6 уроков: ось, шаг, объятие и простой поворот.', 'Система, а не набор роликов. Каждый урок опирается на предыдущий: сначала ось и шаг, затем объятие, затем простой поворот.', E'Урок 1. Ось и перенос веса\nУрок 2. Шаг без спешки\nУрок 3. Объятие: тонус, а не зажим\nУрок 4. Ведение в простом шаге\nУрок 5. Выход в поворот\nУрок 6. Сборка под музыку'),
('c0a7a109-0001-4000-8000-000000000005', 'en', 'The base that holds the couple', 'A 6-lesson course: axis, walk, embrace, and a simple turn.', 'A system, not a pile of clips. Each lesson builds on the last: axis and walk, then embrace, then a simple turn.', E'Lesson 1. Axis and weight transfer\nLesson 2. Walking without hurry\nLesson 3. Embrace: tone, not a clamp\nLesson 4. Leading in a simple walk\nLesson 5. Entering a turn\nLesson 6. Putting it together with music'),
('c0a7a109-0001-4000-8000-000000000017', 'ru', 'Музыкальность на 8 уроков', 'Курс: фраза, пауза, акцент и как не танцевать «мимо оркестра».', 'Последовательная система музыкальности. От простого шага в ритме до паузы и акцента, которые пара слышит вместе.', E'Урок 1. Где в теле живёт пульс\nУрок 2. Шаг в четвертях\nУрок 3. Фраза, а не счёт\nУрок 4. Пауза внутри музыки\nУрок 5. Акцент без дёрганья\nУрок 6. Замедление\nУрок 7. Пара слышит одно и то же\nУрок 8. Сборка на милонге'),
('c0a7a109-0001-4000-8000-000000000017', 'en', 'Musicality in 8 lessons', 'A course: phrase, pause, accent — and how not to dance past the orchestra.', 'A sequential musicality system. From a simple walk in time to pauses and accents the couple hears together.', E'Lesson 1. Where the pulse lives in the body\nLesson 2. Walking in quarters\nLesson 3. Phrase, not counting\nLesson 4. Pause inside the music\nLesson 5. Accent without jerking\nLesson 6. Slowing down\nLesson 7. The couple hears the same thing\nLesson 8. Putting it together at the milonga'),
('c0a7a109-0001-4000-8000-000000000018', 'ru', 'Техника шага: 7 уроков', 'Курс про стопы, колени и то, почему шаг «уезжает».', 'Разбираем технику ходьбы слой за слоем. После курса шаг становится тише, короче или длиннее — по выбору, а не случайно.', E'Урок 1. Стопа и пол\nУрок 2. Перенос веса\nУрок 3. Колени\nУрок 4. Длина шага\nУрок 5. Смена направления\nУрок 6. Ошибки «уезжающего» шага\nУрок 7. Сборка под разную музыку'),
('c0a7a109-0001-4000-8000-000000000018', 'en', 'Walk technique: 7 lessons', 'A course on feet, knees, and why the step drifts.', 'We build walking technique layer by layer. After the course the step gets quieter, shorter or longer — by choice, not by accident.', E'Lesson 1. Foot and floor\nLesson 2. Weight transfer\nLesson 3. Knees\nLesson 4. Step length\nLesson 5. Changing direction\nLesson 6. The drifting-step mistakes\nLesson 7. Putting it together with different music'),
('c0a7a109-0001-4000-8000-000000000019', 'ru', 'Пара: 10 уроков взаимодействия', 'Курс про ведение, следование и то, что происходит между двумя людьми.', 'Не набор фигур, а система общения в паре. Полезно и ведущим, и ведомым — можно проходить вместе.', E'Урок 1. Кто начинает шаг\nУрок 2. Приглашение, а не толчок\nУрок 3. Как отвечать телом\nУрок 4. Дистанция\nУрок 5. Поворот вдвоём\nУрок 6. Ошибки «я веду сильнее»\nУрок 7. Ошибки «я угадываю»\nУрок 8. Пауза в паре\nУрок 9. Смена ролей в упражнении\nУрок 10. Сборка на музыке'),
('c0a7a109-0001-4000-8000-000000000019', 'en', 'The couple: 10 lessons on connection', 'A course on leading, following, and what happens between two people.', 'Not a pile of figures — a system of conversation in the couple. Useful for both leaders and followers; you can take it together.', E'Lesson 1. Who starts the step\nLesson 2. Invitation, not a shove\nLesson 3. How to answer with the body\nLesson 4. Distance\nLesson 5. Turning together\nLesson 6. The “I lead harder” mistakes\nLesson 7. The “I guess” mistakes\nLesson 8. Pause in the couple\nLesson 9. Switching roles in an exercise\nLesson 10. Putting it together with music'),

('c0a7a109-0001-4000-8000-000000000006', 'ru', 'Разминка до милонги', 'Доп. материал: 20 минут, чтобы тело включилось до танца.', 'Короткая последовательность до выхода на танцпол: стопы, бёдра, грудная клетка.', NULL),
('c0a7a109-0001-4000-8000-000000000006', 'en', 'Warm-up before the milonga', 'Extra: 20 minutes to switch the body on before dancing.', 'A short sequence before you step onto the floor: feet, hips, ribcage.', NULL),
('c0a7a109-0001-4000-8000-000000000020', 'ru', 'Этикет милонги за 15 минут', 'Как приглашать, как отказывать и куда смотреть в зале.', 'Короткий доп. материал, чтобы зал не был стрессом. Без морали — конкретные привычки.', NULL),
('c0a7a109-0001-4000-8000-000000000020', 'en', 'Milonga etiquette in 15 minutes', 'How to invite, how to decline, and where to look in the room.', 'A short extra so the floor is not stressful. No lectures — concrete habits.', NULL),
('c0a7a109-0001-4000-8000-000000000021', 'ru', 'Домашние связки на 25 минут', 'Набор коротких повторений, если нет партнёра рядом.', 'Доп. материал для тех, кто учится один: ось, шаг, оче у стены и зеркала.', NULL),
('c0a7a109-0001-4000-8000-000000000021', 'en', '25 minutes of homework drills', 'A set of short repeats when you don’t have a partner nearby.', 'Extra for people who study alone: axis, walk, ochos at the wall and the mirror.', NULL),

('c0a7a109-0001-4000-8000-000000000007', 'ru', 'Исследование: куда уходит шаг', 'Часовой разбор, почему шаг «уезжает» в сторону и как его вернуть.', 'Исследовательский формат: не рецепт на три счёта, а наблюдение за траекторией шага.', NULL),
('c0a7a109-0001-4000-8000-000000000007', 'en', 'Research: where the step goes', 'An hour-long look at why the step drifts sideways — and how to bring it back.', 'A research format: not a three-count recipe, but observation of the walk’s path.', NULL),
('c0a7a109-0001-4000-8000-000000000022', 'ru', 'Исследование: объём объятия', 'Почему пара «сплющивается» и где на самом деле живёт пространство.', 'Час наблюдений за объёмом: грудная клетка, локти, то, что происходит между двумя спинами.', NULL),
('c0a7a109-0001-4000-8000-000000000022', 'en', 'Research: volume of the embrace', 'Why the couple flattens — and where the space actually lives.', 'An hour of observing volume: ribcage, elbows, and what happens between two backs.', NULL),
('c0a7a109-0001-4000-8000-000000000023', 'ru', 'Исследование: вариации одного шага', 'Один шаг — много продолжений. Смотрим, где выбор появляется.', 'Не набор фигур, а исследование: в какой момент шаг ещё можно повернуть, ускорить или остановить.', NULL),
('c0a7a109-0001-4000-8000-000000000023', 'en', 'Research: variations of one step', 'One step, many continuations. We watch where the choice appears.', 'Not a pile of figures — research: at which moment the step can still turn, speed up, or stop.', NULL),

('c0a7a109-0001-4000-8000-000000000008', 'ru', 'Подсмотр: индивидуальный урок', 'Запись реальной работы с парой — без постановки «для камеры».', 'Урок-подсмотр: как я веду человека через затык в объятии. Видно ошибки, паузы и точные формулировки.', NULL),
('c0a7a109-0001-4000-8000-000000000008', 'en', 'Peek: a private lesson', 'A recording of real work with a couple — not staged for the camera.', 'A peek lesson: how I take a dancer through a block in the embrace. You see the mistakes, the pauses, and the exact wording.', NULL),
('c0a7a109-0001-4000-8000-000000000024', 'ru', 'Подсмотр: работа с начинающими', 'Реальный урок, где пара ещё ищет шаг. Без монтажа «красиво».', 'Подсмотр за тем, как я ставлю простую ходьбу двум людям, которые только входят в танго.', NULL),
('c0a7a109-0001-4000-8000-000000000024', 'en', 'Peek: working with beginners', 'A real lesson where the couple is still looking for the walk. No “pretty” edit.', 'A peek at how I set up a simple walk for two people just entering tango.', NULL),
('c0a7a109-0001-4000-8000-000000000025', 'ru', 'Подсмотр: разбор затыка в оче', 'Индивидуалка, где оче не получается. Смотрим, что я меняю в формулировках.', 'Подсмотр полезен преподавателям и тем, кто застрял в оче: видно не приём, а ход мысли.', NULL),
('c0a7a109-0001-4000-8000-000000000025', 'en', 'Peek: an ocho that’s stuck', 'A private lesson where the ocho isn’t working. Watch what I change in the wording.', 'Useful for teachers and anyone stuck on ochos: you see the thinking, not just a trick.', NULL)
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  short = EXCLUDED.short,
  description = EXCLUDED.description,
  program = EXCLUDED.program;

NOTIFY pgrst, 'reload schema';
