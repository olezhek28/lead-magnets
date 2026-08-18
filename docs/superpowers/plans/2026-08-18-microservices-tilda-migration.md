# Перенос лендинга микросервисов с Tilda на статику — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перенести лендинг курса по микросервисам с Tilda в статическую страницу `microservices/index.html` этого репозитория, сохранив контент и порядок секций один в один, но переверстав их паттернами `system_design/index.html`.

**Architecture:** Сначала весь контент Tilda извлекается в промежуточный файл `docs/контент-микросервисы.md` (по секции на заголовок). Затем из него вручную верстается один standalone HTML с инлайновыми CSS и JS — по образцу `system_design/index.html`, откуда переиспользуются CSS-токены, сетки и готовые компоненты. Ассеты берутся из заброшенного Rails-порта в соседнем репозитории и добираются с tildacdn.

**Tech Stack:** Статический HTML5, инлайновый CSS (BEM), инлайновый ванильный JS, `IntersectionObserver` для анимаций, виджет GetCourse в iframe, Яндекс.Метрика через корневой `/consent.js`. Сборщиков и фреймворков нет. Деплой — GitHub Pages из `main` (`.github/workflows/`).

**Spec:** `docs/superpowers/specs/2026-08-18-microservices-tilda-migration-design.md`

## Global Constraints

- Язык проекта — русский. Все комментарии в коде, коммиты и документация на русском.
- Весь CSS инлайновый внутри `<style>`, весь JS — внутри `<script>` в том же файле. Внешних стилей и сборщиков нет.
- Именование классов по BEM: `.block__element`, модификаторы `.block--mod`.
- Адаптивные брейкпоинты: **960px** (планшет), **640px** (мобильный).
- Анимации при скролле через `IntersectionObserver`, классы `.fade-up` / `.visible`.
- Картинки лежат рядом с HTML, в той же директории.
- **Фаза 1 не меняет тексты.** Всё, что попадает в HTML, дословно совпадает с контент-файлом, а тот — с живой Tilda. Никаких улучшений формулировок, даже явно неудачных.
- Шрифты берём из `system_design/index.html`, а не из `CLAUDE.md`: `Geist`, `Space Grotesk`, `JetBrains Mono`. Строка в `CLAUDE.md` про Manrope описывает старые лендинги и для этой страницы неактуальна.
- Страница закрыта от индексации: `<meta name="robots" content="noindex, nofollow">` и `<meta name="yandex" content="none">`. НЕ добавлять в `sitemap.xml`, `llms.txt`, `llms-full.txt`, `robots.txt` и в каталог корневого `index.html`.
- Якоря сохраняются дословно: `#about-course`, `#programm`, `#education`, `#speaker`, `#feedback`, `#tariffs`, `#company`. Обрати внимание на `#programm` с двумя «m» — это опечатка на Tilda, воспроизводим её намеренно, иначе побьются внешние ссылки.
- Счётчик Яндекс.Метрики — `96022201`, общий для всего `guide.olezhek28.courses`.
- `docs/` вырезается из артефакта при деплое (см. `.github/workflows/`), поэтому контент-файл не попадёт в публичный доступ.

## Опорные точки в `system_design/index.html`

Файл — эталон стиля и источник готовых компонентов. Ссылки на диапазоны строк:

| Что | Строки |
|---|---|
| `<head>`: meta, og, JSON-LD | 1–154 |
| `<style>` целиком | 155–1727 |
| CSS-токены `:root` | 166–195 |
| База: reset, `body`, фон-слой, `.container` | 198–235 |
| Скрипт фича-тоглов в `<head>` | 1743–1755 |
| NAV (sticky + бургер) | 1765–1794 |
| HERO | 1795–1837 |
| «Это про тебя, если…» | 1838–1864 |
| Светлый островок | 2033–2059 |
| ПРОГРАММА (`.program__*`) | 2060–2271 |
| КАК УСТРОЕНО ОБУЧЕНИЕ (`.steps`, `.teams`) | 2272–2473 |
| ЧТО ТЫ ПОЛУЧИШЬ | 2474–2570 |
| АВТОР КУРСА, счётчики `.stat-card[data-count]` | 2571–2674 |
| ТАРИФЫ (`.tier`, `.fact`, `.honest`) | 2675–2787 |
| YOUTUBE / TG (`.yt__thumb`) | 2788–2832 |
| FAQ (`.faq__*`) | 2833–2889 |
| ФИНАЛЬНЫЙ CTA | 2890–2915 |
| ЮР-ФУТЕР | 2916–2969 |
| Общий JS: observer, счётчики, бургер | 2970–3292 |
| Разметка модалки GetCourse | 3293–3313 |
| JS модалки: цели Метрики, ленивый iframe, postMessage | 3314–3578 |

Компонентов **нет** в SD и они верстаются с нуля: текстовые отзывы, видеоотзывы, истории участников с модалкой, логосетка компаний, схема из 5 микросервисов.

## Соглашение по контент-файлу

`docs/контент-микросервисы.md`. Один заголовок `## <slug> — <название>` на секцию, ровно 20 штук, slug'и фиксированы:

`cookie`, `nav`, `hero`, `segments`, `what-you-get`, `program`, `vacancies`, `steps`, `community`, `homework`, `project-result`, `author`, `reviews`, `video-reviews`, `stories`, `bigtech`, `tariffs`, `youtube-tg`, `faq`, `final`

Внутри каждой секции обязательны строки-метки:

```
**rec:** rec765399419, rec765399420
**Картинки:** hero/main.png, icons/go.svg
**Ссылки:** #tariffs, https://t.me/olezhek28
```

Дальше — тексты дословно. Метка `rec:` связывает секцию с record-блоками Tilda и используется скриптом проверки покрытия.

## File Structure

| Файл | Ответственность |
|---|---|
| `docs/контент-микросервисы.md` | единственный источник текстов; рабочий документ фазы 2 |
| `microservices/index.html` | лендинг целиком: разметка, инлайн CSS, инлайн JS |
| `microservices/policy.html` | политика обработки ПД |
| `microservices/agree.html` | согласие на обработку ПД |
| `microservices/marketing-agree.html` | согласие на рекламную рассылку |
| `microservices/oferta.html` | публичная оферта |
| `microservices/doc.css` | стили юр-страниц (общие на все четыре) |
| `microservices/favicon.svg`, `og-image.png` | иконка и картинка для соцсетей |
| `microservices/<папки картинок>` | ассеты, разбивка по смыслу сохраняется |

Один HTML на лендинг — так устроены все страницы репозитория. Дробить на партиалы нельзя: сборщиков нет.

---

### Task 1: Извлечение контента Tilda в контент-файл

**Files:**
- Create: `docs/контент-микросервисы.md`

**Interfaces:**
- Produces: контент-файл с 20 секциями и метками `**rec:**`, покрывающими все 55 содержательных record-блоков. Все последующие задачи берут тексты только отсюда.

- [ ] **Step 1: Скачать текущую версию страницы**

```bash
cd /tmp && curl -sL \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" \
  https://olezhek28.courses/microservices -o ms.html
wc -c /tmp/ms.html
```

Ожидаем примерно 1.4–1.5 МБ. Если сильно меньше — Tilda отдала заглушку, повторить.

- [ ] **Step 2: Выгрузить черновик по record-блокам**

```bash
cd /tmp && python3 - <<'PY' > ms-draft.txt
import re, html
s = open('ms.html', encoding='utf-8').read()
parts = re.split(r'(<div\s+id="rec\d+"[^>]*>)', s)
for i in range(1, len(parts), 2):
    head, body = parts[i], parts[i+1] if i+1 < len(parts) else ''
    rid = re.search(r'id="(rec\d+)"', head).group(1)
    rtype = re.search(r'data-record-type="(\d+)"', head)
    b = re.sub(r'<(script|style)\b.*?</\1>', '', body, flags=re.S|re.I)
    b = re.sub(r'<br\s*/?>', '\n', b, flags=re.I)
    b = re.sub(r'</(p|div|h[1-6]|li)>', '\n', b, flags=re.I)
    b = re.sub(r'<[^>]+>', ' ', b)
    b = html.unescape(b)
    b = '\n'.join(l.strip() for l in b.split('\n') if l.strip())
    imgs = sorted(set(re.findall(r'tildacdn\.[a-z]+/([^"\'\s]+\.(?:jpg|jpeg|png|webp|svg|gif|mp4))', body)))
    hrefs = sorted(set(re.findall(r'href="([^"]+)"', body)))
    print(f"\n{'='*70}\n{rid}  T{rtype.group(1) if rtype else '?'}\n{'='*70}")
    if imgs:  print("КАРТИНКИ: " + ", ".join(imgs))
    if hrefs: print("ССЫЛКИ:   " + ", ".join(hrefs))
    print(b if b else "(пусто)")
PY
wc -l /tmp/ms-draft.txt
```

- [ ] **Step 3: Собрать контент-файл вручную из черновика**

Открыть `/tmp/ms-draft.txt` и разложить по 20 секциям в `docs/контент-микросервисы.md` по соглашению из шапки плана.

Черновику **не доверять как есть**: 25 блоков — это Zero Block с абсолютным позиционированием, текст в них идёт в порядке DOM, а не в порядке чтения. Каждую такую секцию сверять с живой страницей глазами, открыв `https://olezhek28.courses/microservices` в браузере.

Самая объёмная секция — `program`: 8 недель по ~20 блоков, у каждого блока название, описание и итог недели. Она вся лежит в `rec2045528841` (T668, аккордеон), там текст структурирован и переносится почти без правок.

Пустые и служебные блоки (`rec2072585841` «Кнопка для предзаписи ↓», `rec1089144346` «Приписка Card = оплата картой», `rec2087077241` «Ниже два блока адаптируют схему под телефоны») — это комментарии редактора Tilda, не контент. Их в файл не переносим, но rec-id указываем в метке той секции, к которой они относятся, чтобы проверка покрытия сошлась.

Шапка файла:

```markdown
# Контент лендинга микросервисов

Источник: https://olezhek28.courses/microservices (Tilda), снято 18 августа 2026.
Тексты дословные. Это источник правды для `microservices/index.html`
и рабочий документ фазы 2 — правки смыслов и оффера вносим сюда, потом
переносим в HTML.

Файл в публичный артефакт не попадает: `docs/` вырезается при деплое.
```

- [ ] **Step 4: Проверить покрытие всех record-блоков**

```bash
cd /tmp && python3 - <<'PY'
import re
s = open('ms.html', encoding='utf-8').read()
md = open('/Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets/docs/контент-микросервисы.md', encoding='utf-8').read()

# блоки с непустым текстом
recs = []
parts = re.split(r'(<div\s+id="rec\d+"[^>]*>)', s)
for i in range(1, len(parts), 2):
    rid = re.search(r'id="(rec\d+)"', parts[i]).group(1)
    body = parts[i+1] if i+1 < len(parts) else ''
    b = re.sub(r'<(script|style)\b.*?</\1>', '', body, flags=re.S|re.I)
    b = re.sub(r'<[^>]+>', ' ', b).strip()
    if b: recs.append(rid)

mentioned = set(re.findall(r'rec\d+', md))
missing = [r for r in recs if r not in mentioned]
slugs = re.findall(r'^## ([a-z-]+)', md, re.M)
expected = ['cookie','nav','hero','segments','what-you-get','program','vacancies',
            'steps','community','homework','project-result','author','reviews',
            'video-reviews','stories','bigtech','tariffs','youtube-tg','faq','final']

print(f"блоков с текстом: {len(recs)}, упомянуто в файле: {len(recs)-len(missing)}")
print(f"НЕ ПОКРЫТЫ ({len(missing)}): {missing}")
print(f"секций: {len(slugs)}")
print(f"порядок совпадает: {slugs == expected}")
if slugs != expected:
    print(f"  лишние/недостающие: {set(slugs) ^ set(expected)}")
assert not missing, "есть непокрытые record-блоки"
assert slugs == expected, "секции не совпадают с соглашением"
print("OK")
PY
```

Ожидаем: `НЕ ПОКРЫТЫ (0)`, `секций: 20`, `порядок совпадает: True`, `OK`.

- [ ] **Step 5: Коммит**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets
git add docs/контент-микросервисы.md
git commit -m "Контент лендинга микросервисов извлечён с Tilda в docs/"
```

---

### Task 2: Ассеты

**Files:**
- Create: `microservices/` со всеми картинками
- Read: `../olezhek28-courses-site/app/assets/images/`

**Interfaces:**
- Consumes: метки `**Картинки:**` из контент-файла (Task 1)
- Produces: файлы картинок по путям вида `microservices/hero/main.png`; эти пути подставляются в `src` во всех задачах вёрстки

- [ ] **Step 1: Скопировать ассеты из Rails-порта**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets
mkdir -p microservices
cp -R ../olezhek28-courses-site/app/assets/images/. microservices/
rm -f microservices/.keep microservices/favicon.png
find microservices -type f | wc -l
du -sh microservices
```

Ожидаем ~76 файлов, ~6.3 МБ.

- [ ] **Step 2: Собрать список картинок с живой Tilda**

```bash
cd /tmp && grep -oE 'https://[a-z]+\.tildacdn\.[a-z]+/[^"'"'"' )]+\.(jpg|jpeg|png|webp|svg|gif|mp4)' ms.html \
  | sed 's/-[0-9]\+x[0-9]\+\././' | sort -u > tilda-images.txt
wc -l tilda-images.txt
```

- [ ] **Step 3: Свести список с тем, что скопировали**

Сопоставление по именам файлов автоматикой не сделать: в Rails-порте картинки переименованы осмысленно (`student_1.jpeg`), а на CDN у них хеш-имена. Поэтому:

1. Открыть `https://olezhek28.courses/microservices` в браузере.
2. Пройти по секциям контент-файла сверху вниз.
3. Для каждой метки `**Картинки:**` убедиться, что файл есть в `microservices/` и это действительно та картинка.
4. Чего нет — скачать: `curl -sL "<url>" -o microservices/<папка>/<имя>`.

Отдельно проверить, что не устарели вслед за текстами:

- `companies/` — логотипы BigTech'ов, их состав на Tilda мог смениться;
- `student_stories/` — 11 историй, аватарки участников;
- `video_testimonials/` — 7 постеров;
- `project/architecture.svg` — схема из 5 микросервисов, менялась вместе с программой.

- [ ] **Step 4: Проверить, что каждая картинка из контент-файла существует**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, os
md = open('docs/контент-микросервисы.md', encoding='utf-8').read()
names = []
for line in re.findall(r'^\*\*Картинки:\*\* (.+)$', md, re.M):
    names += [n.strip() for n in line.split(',') if n.strip()]
missing = [n for n in sorted(set(names)) if not os.path.exists(os.path.join('microservices', n))]
print(f"упомянуто картинок: {len(set(names))}, отсутствует: {len(missing)}")
for m in missing: print("  НЕТ:", m)
assert not missing, "не все картинки на месте"
print("OK")
PY
```

- [ ] **Step 5: Добавить favicon и og-image**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets
cp system_design/favicon.svg microservices/favicon.svg
curl -sL "https://static.tildacdn.com/tild3538-6631-4934-b638-623432663632/badge_golang-intervi.jpg" \
  -o microservices/og-source.jpg
python3 -c "
from pathlib import Path
p = Path('microservices/og-source.jpg')
print('скачано байт:', p.stat().st_size)
assert p.stat().st_size > 10000, 'скачалась заглушка, а не картинка'
"
```

Это og-картинка текущей Tilda (`badge_golang-intervi.jpg`). Требование к финальному файлу — **1200×630 PNG** под именем `microservices/og-image.png`. Проверить размер скачанного:

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import struct
d = open('microservices/og-source.jpg','rb').read()
i = 2
while i < len(d):
    if d[i] != 0xFF: i += 1; continue
    m = d[i+1]
    if m in (0xC0,0xC1,0xC2):
        h, w = struct.unpack('>HH', d[i+5:i+9]); print(f"{w}x{h}"); break
    if m in (0xD8,0xD9) or 0xD0 <= m <= 0xD7: i += 2; continue
    i += 2 + struct.unpack('>H', d[i+2:i+4])[0]
PY
```

Если размер не 1200×630 — пересобрать: взять `system_design/og-image.svg` как шаблон компоновки, подставить заголовок «Микросервисы на GO» и экспортировать в PNG 1200×630. После этого удалить `og-source.jpg`, в репозитории он не нужен.

- [ ] **Step 6: Коммит**

```bash
git add microservices/
git commit -m "Ассеты лендинга микросервисов перенесены из Rails-порта и добраны с tildacdn"
```

---

### Task 3: Каркас страницы — head, CSS-база, nav, футер

**Files:**
- Create: `microservices/index.html`
- Read: `system_design/index.html:1-235`, `1743-1794`, `2916-2969`, `2970-3292`

**Interfaces:**
- Consumes: секции `cookie`, `nav`, `final` (футерная часть) из контент-файла
- Produces: `microservices/index.html` с `<style>` (токены + база + `.container` + `.fade-up`), `<nav>`, `<footer>`, инициализацией `IntersectionObserver` и бургер-меню. Все дальнейшие задачи вставляют свои секции внутрь `<main>` и дописывают CSS в конец `<style>`.

- [ ] **Step 1: Создать файл с head**

Скопировать структуру `system_design/index.html:1-54` и переделать:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Cookie-баннер + Яндекс.Метрика (счётчик 96022201, общий для guide.olezhek28.courses) -->
<script src="/consent.js" defer></script>

<!-- ФАЗА 1: технический перенос с Tilda. Тексты дословно совпадают
     с docs/контент-микросервисы.md, править их здесь нельзя — правки
     идут в контент-файл, см. спеку 2026-08-18-microservices-tilda-migration-design.md.
     Страница закрыта от индексации, пока боевой остаётся Tilda
     на olezhek28.courses/microservices: два полных дубля контента
     конкурировали бы в выдаче. -->

<title>Микросервисы на GO – глубокий курс от Senior Engineer из BigTech</title>
<meta name="description" content="Научись разрабатывать высокопроизводительные, масштабируемые микросервисы, как в ВК / Yandex / OZON / СБЕР / Авито / Тинькофф, и увеличь свои шансы на трудоустройство в BigTech или повышения грейда. Преподаватель – Олег Козырев, senior инженер">
<meta name="author" content="Олег Козырев">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Микросервисы на GO – глубокий курс от Senior Engineer из BigTech">
<meta property="og:description" content="Научись разрабатывать высокопроизводительные, масштабируемые микросервисы, как в ВК / Yandex / OZON / СБЕР / Авито / Тинькофф, и увеличь свои шансы на трудоустройство в BigTech или повышения грейда. Преподаватель – Олег Козырев, senior инженер">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Олег Козырев · Курсы">
<meta property="og:image" content="https://guide.olezhek28.courses/microservices/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="Курс по микросервисам на Go">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Микросервисы на GO – глубокий курс от Senior Engineer из BigTech">
<meta name="twitter:description" content="Научись разрабатывать высокопроизводительные, масштабируемые микросервисы, как в ВК / Yandex / OZON / СБЕР / Авито / Тинькофф, и увеличь свои шансы на трудоустройство в BigTech или повышения грейда. Преподаватель – Олег Козырев, senior инженер">
<meta name="twitter:image" content="https://guide.olezhek28.courses/microservices/og-image.png">
<meta name="theme-color" content="#10171A">
<meta name="robots" content="noindex, nofollow">
<meta name="yandex" content="none">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="https://guide.olezhek28.courses/microservices/">
<meta property="og:url" content="https://guide.olezhek28.courses/microservices/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- прогреваем соединение под анкету GetCourse: DNS+TCP+TLS делаются заранее,
     но ничего не загружается — хит в Метрику не уходит, а форма по клику
     открывается заметно быстрее на плохой сети -->
<link rel="preconnect" href="https://school.olezhek28.courses">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
</head>
```

`title`, `description` и og-тексты скопированы с Tilda дословно, включая «или повышения грейда» — это ошибка согласования в оригинале. Фаза 1 тексты не правит, поэтому переносим как есть; исправление — в фазу 2.

JSON-LD пока не добавляем — он появится в Task 9 вместе с тарифами, чтобы цены и разметка правились в одном месте.

- [ ] **Step 2: Перенести CSS-базу**

Скопировать из `system_design/index.html` в `<style>` нового файла: `:root` (строки 166–195), reset и `body` с фоновым слоем (198–235), `.container`, утилиты `.fade-up` / `.visible`, стили `.btn`. Блок фича-тоглов (163–164) **не переносим** — на этой странице скрытых фич нет.

- [ ] **Step 3: Сверстать nav**

По образцу `system_design/index.html:1765-1794`. Пункты и порядок — из секции `nav` контент-файла, ровно как на Tilda:

| Текст | href |
|---|---|
| О курсе | `#about-course` |
| Программа | `#programm` |
| Как всё устроено | `#education` |
| Об авторе | `#speaker` |
| Отзывы | `#feedback` |
| Стоимость | `#tariffs` |
| Записаться на курс | `#tariffs` |

Слева логотип `{ Олег Козырев }` со ссылкой на `/`.

- [ ] **Step 4: Сверстать футер**

По образцу `system_design/index.html:2916-2969`. Содержимое — из секции `final` контент-файла: копирайт `{ Олег Козырев }, © 2026`, ссылки на юр-страницы (`oferta.html`, `agree.html`, `marketing-agree.html`, `policy.html`), ссылка «Подготовка к собесам по Go» на `https://olezhek28.courses/gothrough`, соцсети (LinkedIn, YouTube, Telegram), ссылка на разработчика сайта `https://andrew-design.ru/?utm_source=olezhek28`.

Юр-ссылки ведут на локальные файлы, а не на Tilda: страницы появятся в Task 4.

- [ ] **Step 5: Перенести общий JS**

Из `system_design/index.html:2970-3292` взять: инициализацию `IntersectionObserver` для `.fade-up`, обработчик бургер-меню, анимацию счётчиков `[data-count]`. Модалку и цели Метрики не трогаем — они в Task 9.

- [ ] **Step 6: Проверить каркас**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re
h = open('microservices/index.html', encoding='utf-8').read()
checks = {
  'noindex':        'content="noindex, nofollow"' in h,
  'yandex none':    'content="none"' in h,
  'canonical':      'guide.olezhek28.courses/microservices/' in h,
  'consent.js':     '/consent.js' in h,
  'шрифты SD':      'Space+Grotesk' in h and 'Geist' in h,
  'токены':         '--accent:' in h and '#DFDF41' in h,
  'fade-up':        'IntersectionObserver' in h and 'fade-up' in h,
  'брейкпоинт 960': 'max-width: 960px' in h or 'max-width:960px' in h,
  'брейкпоинт 640': 'max-width: 640px' in h or 'max-width:640px' in h,
}
# единственный допустимый внешний stylesheet — Google Fonts
sheets = re.findall(r'<link[^>]+rel="stylesheet"[^>]*>', h)
external = [s for s in sheets if 'fonts.googleapis.com' not in s]
checks['нет внешних css'] = not external
if external: print("лишние внешние стили:", external)
for k, v in checks.items(): print(('OK  ' if v else 'FAIL'), k)
anchors = re.findall(r'href="(#[a-z-]+)"', h)
print('якоря в nav:', sorted(set(anchors)))
assert all(checks.values()), "каркас неполный"
PY
```

- [ ] **Step 7: Открыть в браузере и убедиться, что ничего не разъехалось**

Запустить `python3 -m http.server 8000` из корня репозитория, открыть `http://localhost:8000/microservices/`. Проверить: фон тёмный с сеткой, шрифты подгрузились, nav липнет при скролле, бургер открывается на ширине 390px.

- [ ] **Step 8: Коммит**

```bash
git add microservices/index.html
git commit -m "Каркас лендинга микросервисов: head, CSS-база, nav, футер"
```

---

### Task 4: Юр-страницы

**Files:**
- Create: `microservices/policy.html`, `agree.html`, `marketing-agree.html`, `oferta.html`, `doc.css`
- Read: `system_design/policy.html`, `system_design/agree.html`, `system_design/marketing-agree.html`, `system_design/doc.css`, `system_design_oferta/index.html`

- [ ] **Step 1: Скопировать файлы**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets
cp system_design/policy.html         microservices/policy.html
cp system_design/agree.html          microservices/agree.html
cp system_design/marketing-agree.html microservices/marketing-agree.html
cp system_design/doc.css             microservices/doc.css
cp system_design_oferta/index.html   microservices/oferta.html
```

- [ ] **Step 2: Найти упоминания System Design**

```bash
cd microservices && grep -n -i 'system design' policy.html agree.html marketing-agree.html oferta.html
```

Ожидаем по одному вхождению в первых трёх файлах. В `oferta.html` их может быть больше — оферта содержит состав и стоимость курса.

- [ ] **Step 3: Заменить название курса в трёх страницах согласий**

Заменить название курса на «Микросервисы на Go» в `policy.html`, `agree.html`, `marketing-agree.html`. Правку делать вручную по строкам из предыдущего шага: `sed` по всему файлу опасен, название может встретиться внутри юридической формулировки, которую менять не нужно.

- [ ] **Step 4: Вычитать оферту целиком**

Оферта — юридический документ с ценами, составом курса, сроками доступа и порядком возврата. Всё это у микросервисов своё. Прочитать файл целиком и привести в соответствие с тарифами из секции `tariffs` контент-файла.

Если данных для какого-то пункта нет (например, срок доступа не указан ни на Tilda, ни в контент-файле) — **не выдумывать**, выписать вопрос в конец задачи и спросить Олега.

- [ ] **Step 5: Поправить относительные ссылки и canonical**

```bash
cd microservices && grep -n 'system_design\|canonical\|og:url' policy.html agree.html marketing-agree.html oferta.html doc.css
```

Все пути `/system_design/` заменить на `/microservices/`. Во всех четырёх страницах проставить `<meta name="robots" content="noindex, nofollow">` — они служебные и в выдаче не нужны.

- [ ] **Step 6: Проверить**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import pathlib
for n in ['policy.html','agree.html','marketing-agree.html','oferta.html']:
    p = pathlib.Path('microservices')/n
    t = p.read_text(encoding='utf-8')
    print(f"{n:22} размер={len(t):7}  SD-упоминаний={t.lower().count('system design')}  "
          f"путей system_design={t.count('/system_design/')}  noindex={'noindex' in t}")
    assert t.lower().count('system design') == 0, f"{n}: остались упоминания System Design"
    assert t.count('/system_design/') == 0, f"{n}: остались пути на system_design"
    assert 'noindex' in t, f"{n}: нет noindex"
print("OK")
PY
```

Затем открыть каждую страницу в браузере через локальный сервер и убедиться, что `doc.css` подхватился и текст читается.

- [ ] **Step 7: Коммит**

```bash
git add microservices/
git commit -m "Юр-страницы лендинга микросервисов"
```

---

### Task 5: Секции hero, segments, what-you-get, vacancies

**Files:**
- Modify: `microservices/index.html` — добавить секции внутрь `<main>`, дописать CSS
- Read: `system_design/index.html:1795-1864`, `2033-2059`, `2474-2570`

**Interfaces:**
- Consumes: каркас из Task 3, картинки из Task 2, секции `hero`, `segments`, `what-you-get`, `vacancies` контент-файла
- Produces: якорь `#about-course` на секции `what-you-get`

- [ ] **Step 1: Hero**

По образцу `system_design/index.html:1795-1837`. Заголовок `<h1>` — «Микросервисы на GO 3.0» («3.0» серым), это ВИДИМЫЙ заголовок страницы. В артборде Tilda рядом лежит второй, скрытый через `visibility:hidden` вариант «Микросервисы, как в BigTech 2.0» — прошлая версия, в разметку её НЕ переносим. Довесок «пп аыыавы» внутри видимого заголовка покрашен в цвет фона и является мусором от правки — тоже не переносим: невидимый артефакт редактора текстом страницы не является. Подзаголовок, CTA-кнопка «Записаться на курс» с `href="#tariffs"`, картинки из `hero/`.

CTA-кнопкам проставить `data-goal` для целей Метрики — обработчик появится в Task 9:

```html
<a class="btn btn--accent" href="#tariffs" data-goal="hero">Записаться на курс</a>
```

- [ ] **Step 2: Segments — три сегмента аудитории**

По образцу `system_design/index.html:1838-1864` («Это про тебя, если…»). Три карточки, заголовки дословно из контент-файла:

- «Перехожу на Go — хочу быстро адаптироваться и не писать как на старом языке»
- «Пишу на Go, но застрял в типовых задачах — хочу расти дальше»
- «Хочу уверенно проходить собесы и повысить свой грейд и зарплату»

Заголовок секции: «Курс адаптирован под частые проблемы backend-a, которые встречаются на работе».

- [ ] **Step 3: What-you-get — «Вся подкапотная микросервисов в одном курсе»**

По образцу `system_design/index.html:2474-2570`. Сюда вешаем `id="about-course"`. Внутри — список технологий и результатов из контент-файла, иконки из `icons/`.

- [ ] **Step 4: Vacancies — светлый островок**

По образцу `system_design/index.html:2033-2059` (класс-модификатор светлой секции). Заголовок «Изучаем, что bigtech-компании требуют в вакансиях», под ним текст из контент-файла.

Важно: на светлом фоне фокус-кольцо переключается на тёмное — в SD это сделано правилом `.mech, .tier--light, .final__card { --focus: var(--light-ink); }` (строка ~229). Добавить свой класс светлой секции в этот список, иначе жёлтый контур на светлом даст контраст 1.0:1 и станет невидимым.

- [ ] **Step 5: Проверить тексты на дословность**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, html
md = open('docs/контент-микросервисы.md', encoding='utf-8').read()
pg = open('microservices/index.html', encoding='utf-8').read()

def norm(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s).replace(' ', ' ')
    return re.sub(r'[^а-яёa-z0-9]+', ' ', s.lower()).strip()

def section(slug):
    m = re.search(rf'^## {slug}\b.*?$(.*?)(?=^## |\Z)', md, re.M | re.S)
    return m.group(1) if m else ''

page = norm(pg)
bad = []
for slug in ['hero', 'segments', 'what-you-get', 'vacancies']:
    for line in section(slug).split('\n'):
        line = line.strip()
        if not line or line.startswith(('**', '#', '|', '-')): continue
        n = norm(line)
        if len(n) < 25: continue
        if n not in page: bad.append((slug, line[:80]))
print(f"не найдено на странице фраз: {len(bad)}")
for s, l in bad: print(f"  [{s}] {l}")
assert not bad, "тексты разошлись с контент-файлом"
print("OK")
PY
```

- [ ] **Step 6: Скриншотное сравнение**

Открыть рядом `https://olezhek28.courses/microservices` и `http://localhost:8000/microservices/`, снять эти четыре секции на ширинах 1440 / 768 / 390 px. Сверять состав и иерархию, а не пиксели: вёрстка намеренно другая.

- [ ] **Step 7: Коммит**

```bash
git add microservices/index.html
git commit -m "Секции лендинга микросервисов: герой, сегменты, что получишь, вакансии"
```

---

### Task 6: Секция program — 8 недель

**Files:**
- Modify: `microservices/index.html`
- Read: `system_design/index.html:2060-2271`

**Interfaces:**
- Consumes: секция `program` контент-файла (блок `rec2045528841`)
- Produces: якорь `#programm` (две «m», как на Tilda)

Самая объёмная секция плана: 8 недель, ~20 блоков, у каждой недели свой итог. Выделена в отдельную задачу именно из-за объёма.

- [ ] **Step 1: Перенести CSS программы**

Скопировать из `system_design/index.html:2060-2271` все правила `.program__*` и `.prog-head__*` (в SD их 93 использования — это самый развитый компонент файла).

- [ ] **Step 2: Сверстать шапку секции**

`id="programm"`, заголовок «8 недель. 5 микросервисов. Production-ready стек.», надзаголовок «программа».

- [ ] **Step 3: Сверстать восемь недель**

Одна неделя = один `.program__block` с `.program__head` (кликабельный, раскрывает `.program__body`), внутри `.program__list` из блоков. Структура недели из контент-файла:

```
Неделя N
<название недели>
  Блок K  <название блока>
          <описание блока>
  ...
<итог недели>   → .program__result
```

Названия недель, для ориентира при сверке:

1. HTTP и gRPC: два протокола, которые должен знать каждый Go-разработчик
2. Clean Architecture и тесты: пишем код, как в BigTech-компаниях
3. Docker и PostgreSQL: сервисы обретают настоящее хранилище
4. Конфигурация, DI-контейнер, jsonb в PostgreSQL и Domain-Driven Design
5. Kafka: асинхронная коммуникация между сервисами
6. Аутентификация и авторизация
7. Observability: логи, метрики и распределённые трейсы
8. Контейнеризация, балансировка и распределённый Rate Limiting

Всё остальное — дословно из контент-файла.

- [ ] **Step 4: Раскрытие аккордеона**

Механика из SD: клик по `.program__head` переключает `.program__body`. Первая неделя раскрыта по умолчанию, остальные свёрнуты — как на Tilda.

Доступность: `.program__head` делаем `<button>` с `aria-expanded`, содержимое связываем через `aria-controls`. В SD это уже так, повторить.

- [ ] **Step 5: Проверить полноту программы**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, html
md = open('docs/контент-микросервисы.md', encoding='utf-8').read()
pg = open('microservices/index.html', encoding='utf-8').read()
sec = re.search(r'^## program\b.*?$(.*?)(?=^## |\Z)', md, re.M | re.S).group(1)

def norm(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s).replace(' ', ' ')
    return re.sub(r'[^а-яёa-z0-9]+', ' ', s.lower()).strip()

page = norm(pg)
weeks = re.findall(r'Неделя\s+\d+', sec)
blocks = re.findall(r'Блок\s+\d+', sec)
print(f"в контент-файле: недель={len(set(weeks))}, блоков={len(set(blocks))}")
assert len(set(weeks)) == 8, "недель должно быть 8"

bad = []
for line in sec.split('\n'):
    line = line.strip()
    if not line or line.startswith(('**', '#', '|')): continue
    n = norm(line)
    if len(n) < 25: continue
    if n not in page: bad.append(line[:90])
print(f"не найдено на странице: {len(bad)}")
for l in bad[:20]: print("  ", l)
assert not bad, "программа перенесена не полностью"
print("OK")
PY
```

- [ ] **Step 6: Проверить аккордеон в браузере**

Открыть страницу, раскрыть все восемь недель, убедиться, что ни одна не пустая и текст не обрезан. Проверить на 390px, что длинные названия блоков переносятся, а не выезжают за экран.

- [ ] **Step 7: Коммит**

```bash
git add microservices/index.html
git commit -m "Секция программы: 8 недель курса по микросервисам"
```

---

### Task 7: Секции steps, community, homework, project-result

**Files:**
- Modify: `microservices/index.html`
- Read: `system_design/index.html:2272-2473`

**Interfaces:**
- Consumes: секции `steps`, `community`, `homework`, `project-result` контент-файла
- Produces: якорь `#education`; модалка `#homework-modal`, разметку которой переиспользует Task 8

- [ ] **Step 1: Steps — «Как всё устроено по шагам»**

`id="education"`. По образцу `system_design/index.html:2272-2473` (класс `.steps`). Четыре шага, заголовки дословно:

1. «Смотришь видеоуроки и ходишь на онлайн-встречи с разборами практических заданий и вопросов»
2. «Делаешь практическое задание с упором на реальную практику»
3. «Получаешь подробный фидбек по практическому заданию и эталонное решение от Олега*»
4. «Читаешь допматериалы»

Звёздочка в третьем шаге ведёт на сноску — она есть на Tilda, сохранить.

- [ ] **Step 2: Community — «А еще у нас полный комфортик в чатике и на лекциях:)»**

Переиспользовать `.teams` из `system_design/index.html:2395` (ряд аватарок). Картинки из `community/` и `mascot/` — кот Коткинс с репликами живёт здесь.

- [ ] **Step 3: Homework — ДЗ недели №1 с модалкой**

Карточка «ДЗ – неделя №1» с кнопкой, открывающей модалку с полным текстом задания (`rec2045531601`).

Модалку строим на скелете `.gc-modal` из `system_design/index.html:3293-3313`, но без iframe — внутри просто текст:

```html
<div class="modal" id="homework-modal" hidden>
  <div class="modal__backdrop" data-modal-close></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="homework-modal-title">
    <button type="button" class="modal__close" data-modal-close aria-label="Закрыть">&#10005;</button>
    <h3 class="modal__title" id="homework-modal-title">ДЗ — неделя №1</h3>
    <div class="modal__body"><!-- текст задания из контент-файла --></div>
  </div>
</div>
```

JS — универсальный, он же обслужит 11 историй в Task 8:

```html
<script>
  (function () {
    var lastTrigger = null;
    function open(id, trigger) {
      var m = document.getElementById(id);
      if (!m) return;
      lastTrigger = trigger || null;
      m.hidden = false;
      document.body.style.overflow = 'hidden';
      var c = m.querySelector('.modal__close');
      if (c) c.focus();
    }
    function close(m) {
      if (!m || m.hidden) return;
      m.hidden = true;
      document.body.style.overflow = '';
      if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
    }
    document.addEventListener('click', function (e) {
      var opener = e.target.closest && e.target.closest('[data-modal-open]');
      if (opener) { e.preventDefault(); open(opener.getAttribute('data-modal-open'), opener); return; }
      var closer = e.target.closest && e.target.closest('[data-modal-close]');
      if (closer) close(closer.closest('.modal'));
    });
    // Esc закрывает верхнюю открытую модалку
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open_ = document.querySelector('.modal:not([hidden])');
      if (open_) close(open_);
    });
  })();
</script>
```

Кнопка открытия: `<button type="button" data-modal-open="homework-modal">Посмотреть задание</button>`.

- [ ] **Step 4: Project-result — схема из 5 микросервисов**

На Tilda это три блока: основной (`rec765399450`) и два адаптива под телефоны (`rec2087077241`, `rec765399453`). У нас — **один** блок с адаптивной вёрсткой.

Схема — картинка `project/architecture.svg`. Подписи сервисов из контент-файла (OrderService, InventoryService, PaymentService и остальные) выносим в текстовый список рядом со схемой: на 390px SVG нечитаем, а список остаётся доступным и для скринридера.

Один из мобильных дублей на Tilda (`rec765399454`) содержит описание ПРЕДЫДУЩЕЙ версии курса — там фигурируют MongoDB, Envoy и Telegram-бот, которых в актуальном составе нет. Берём десктопный вариант; расхождение зафиксировано в контент-файле.

Заголовок секции: «Результат курса — микросервисная ракета, как на проде».

- [ ] **Step 5: Проверить тексты и модалку**

Прогнать скрипт сверки из Task 5 Step 5, заменив список слагов на `['steps', 'community', 'homework', 'project-result']`.

Затем в браузере: открыть модалку ДЗ кнопкой, закрыть по Esc, по клику на фон и по крестику. Убедиться, что фокус вернулся на кнопку, а фон страницы не прокручивается при открытой модалке.

- [ ] **Step 6: Коммит**

```bash
git add microservices/index.html
git commit -m "Секции лендинга микросервисов: шаги обучения, комьюнити, ДЗ, схема проекта"
```

---

### Task 8: Секции author, reviews, video-reviews, stories, bigtech

**Files:**
- Modify: `microservices/index.html`
- Read: `system_design/index.html:2571-2674` (автор, `.stat-card[data-count]`), `2788-2832` (`.yt__thumb`)

**Interfaces:**
- Consumes: универсальный JS модалок из Task 7, секции `author`, `reviews`, `video-reviews`, `stories`, `bigtech` контент-файла
- Produces: якоря `#speaker`, `#feedback`

Здесь четыре компонента, которых в SD нет, — верстаем с нуля.

- [ ] **Step 1: Author — «Автор курса — Олег Козырев»**

`id="speaker"`. По образцу `system_design/index.html:2571-2674`. Портрет из `instructor/`, текст биографии из контент-файла (Т-Банк Staff Engineer, Авито и далее).

Полоса фактов — переиспользуем `.stat-card` со счётчиками:

```html
<div class="stat-card">
  <div class="stat-card__number" data-count="8500" data-suffix="+">0</div>
  <div class="stat-card__line"></div>
  <div class="stat-card__label">Подписчиков в Telegram-канале</div>
</div>
```

Три карточки: 8 500+ подписчиков в TG, 8+ лет коммерческой разработки, 11 000+ подписчиков на YouTube. Числа сверить с контент-файлом — они регулярно меняются.

Анимация счётчиков уже подключена в Task 3 Step 5.

- [ ] **Step 2: Reviews — текстовые отзывы**

`id="feedback"`. Компонент новый. Шапка: «Участники оценивают качество материала на 4.94/5» и подзаголовки из `rec2078055861`. Ниже — карточки отзывов сеткой, на 640px в одну колонку.

- [ ] **Step 3: Video-reviews — видеоотзывы**

Заголовок «А ещё честно рассказывают о курсе на камеру». Семь постеров из `video_testimonials/`.

Переиспользуем `.yt__thumb` с кнопкой play из `system_design/index.html:2788-2832`. Видео **не встраиваем** — карточка ведёт на YouTube по ссылке из контент-файла. Встроенные плееры тянут скрипты Google на каждый показ страницы.

- [ ] **Step 4: Stories — 11 историй участников**

Заголовок «Реальные истории участников». Одиннадцать карточек: аватарка из `student_stories/`, имя, телеграм-ник, короткая выжимка. Клик открывает модалку с полной историей.

Модалки строим тем же шаблоном, что и `#homework-modal` в Task 7, по одной на историю: `id="story-1"` … `id="story-11"`. JS уже написан и ничего не требует, кнопке достаточно `data-modal-open="story-N"`.

Одиннадцать почти одинаковых блоков — это осознанно: сборщиков в проекте нет, генерировать разметку скриптом на клиенте нельзя (контент должен быть в HTML). Пишем разметку целиком.

Обязательная сноска под секцией, она есть на Tilda (`rec2397594771`) и является юридически значимой:

> *Истории участников приведены в качестве иллюстрации. Результат зависит от опыта, активности и других факторов.

Точную формулировку взять из контент-файла дословно.

Имена для сверки, ровно одиннадцать: Алексей, Олег (дотнет), Олег (бывший фронт), Валера, Кирилл, Антон, Валентина, Руслан, Артур, Дима, Владимир.

На Tilda попапы историй содержат навигацию «Предыдущая / Следующая история», её порядок не совпадает с порядком карточек в карусели, а у 8 из 11 историй ник в карточке расходится с ником в попапе. Это баг оригинала. Навигацию между историями НЕ переносим вовсе, а ники берём из карточек — таблица расхождений есть в контент-файле.

- [ ] **Step 5: Bigtech — логосетка компаний**

Заголовок «BigTech'и, купившие этот курс своим будущим синьерам». Логотипы из `companies/`.

Логотипы отдаём монохромом через `filter: grayscale(1)` и подсвечиваем на hover — так делает Tilda. У каждого `<img>` обязателен осмысленный `alt` с названием компании: это не декор, а социальное доказательство, и скринридер должен его прочитать.

- [ ] **Step 6: Проверить**

Прогнать скрипт сверки из Task 5 Step 5 со слагами `['author', 'reviews', 'video-reviews', 'stories', 'bigtech']`.

Дополнительно проверить, что все 11 модалок на месте и связаны:

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re
h = open('microservices/index.html', encoding='utf-8').read()
opens = set(re.findall(r'data-modal-open="([^"]+)"', h))
ids   = set(re.findall(r'class="modal"[^>]*id="([^"]+)"', h)) | set(re.findall(r'id="([^"]+)"[^>]*class="modal"', h))
stories = {o for o in opens if o.startswith('story-')}
print(f"кнопок открытия: {len(opens)}, модалок: {len(ids)}, историй: {len(stories)}")
print("кнопки без модалки:", sorted(opens - ids))
assert len(stories) == 11, "историй должно быть 11"
assert not (opens - ids), "есть кнопки, которым не соответствует модалка"

counts = re.findall(r'data-count="(\d+)"', h)
print("счётчики в полосе фактов:", counts)
assert len(counts) == 3, "в полосе фактов должно быть 3 счётчика"

for anchor in ['id="speaker"', 'id="feedback"']:
    assert anchor in h, f"нет якоря {anchor}"

noalt = re.findall(r'<img(?![^>]*\balt=)[^>]*>', h)
print("картинок без alt:", len(noalt))
assert not noalt, "у логотипов компаний и аватарок должен быть осмысленный alt"
print("OK")
PY
```

В браузере открыть три-четыре истории вразнобой, проверить Esc и возврат фокуса.

- [ ] **Step 7: Коммит**

```bash
git add microservices/index.html
git commit -m "Секции лендинга микросервисов: автор, отзывы, видеоотзывы, истории участников, компании"
```

---

### Task 9: Тарифы, модалка GetCourse, цели Метрики, JSON-LD

**Files:**
- Modify: `microservices/index.html`
- Read: `system_design/index.html:2675-2787` (тарифы), `3293-3578` (модалка и её JS), `55-154` (JSON-LD)

**Interfaces:**
- Consumes: секция `tariffs` контент-файла
- Produces: якоря `#tariffs`, `#company`; функцию `goal(name, place)` для целей Метрики; атрибут `data-gc-open` на кнопках анкеты

- [ ] **Step 1: Сверстать тарифы**

`id="tariffs"`. По образцу `system_design/index.html:2675-2787` (`.tier`, `.pricing`). Состав тарифов, цены и что входит — дословно из секции `tariffs` контент-файла.

Над тарифами — плашка «Начинаем осенью 2026» (`rec770883063`). Полоса фактов — компонент `.fact` из `system_design/index.html:2691`.

Блок гарантий — `.honest` из `system_design/index.html:2775`, если соответствующий текст есть на Tilda. Если его там нет — блок не добавляем: фаза 1 не придумывает контент.

- [ ] **Step 2: Секция «Учиться от компании»**

`id="company"`. Текст из `rec766062955`: «Чтобы оплатить курс от лица компании, пожалуйста, напиши мне в Telegram» и кнопка «Перейти в Telegram» на `https://t.me/olezhek28`.

- [ ] **Step 3: Перенести модалку GetCourse**

Скопировать разметку из `system_design/index.html:3293-3313` и JS из `3314-3578`, включая комментарии — они объясняют неочевидные решения (почему iframe создаётся лениво, почему проверяется `origin`, почему нельзя предзагружать форму).

Заменить идентификаторы формы:

```js
var WIDGET_ID  = '<uniq формы предзаписи микросервисов>';
var WIDGET_SRC = 'https://school.olezhek28.courses/pl/lite/widget/script?id=<id>';
var FORM_URL   = 'https://school.olezhek28.courses/pl/lite/widget/widget?id=<id>';
var FRAME_NAME = 'gc-ms-form';
```

`WIDGET_ID` — это значение атрибута `id` у выданного GetCourse тега `<script>`. Им форма подписывает `postMessage` со своей высотой, менять нельзя.

`aria-label` модалки: «Анкета предзаписи».

- [ ] **Step 4: Заглушка, пока нет идентификаторов формы**

Идентификаторы формы предзаписи микросервисов предоставляет Олег, на момент написания плана их нет.

Пока их нет, вместо модалки кнопки ведут прямо на анкету Tilda:

```html
<a class="btn btn--accent" href="https://olezhek28.courses/microservices#popup:register"
   data-goal="tariffs">Заполнить анкету предзаписи</a>
```

Разметку и JS модалки при этом всё равно кладём в файл — они не активируются, пока на кнопках нет `data-gc-open`. Когда идентификаторы появятся, переключение сводится к замене `href`-ссылки на `<button data-gc-open>` и подстановке трёх значений в JS.

Заглушка безопасна: страница закрыта от индексации и на боевой домен не переключается до фазы 2, поэтому лиды в этот период всё равно идут через Tilda.

Оставить в файле комментарий, чтобы про заглушку не забыли:

```html
<!-- ЗАГЛУШКА ФАЗЫ 1: кнопки ведут на анкету Tilda, потому что своей формы
     GetCourse для микросервисов ещё нет. Разметка и JS модалки ниже уже
     готовы — когда появятся id и uniq, поменять href на data-gc-open
     и подставить значения в WIDGET_ID / WIDGET_SRC / FORM_URL. -->
```

- [ ] **Step 5: Цели Метрики**

Перенести из `system_design/index.html:3316-3328` обработчик целей, переименовав цель под этот лендинг:

```js
var COUNTER = 96022201;
function goal(name, place) {
  if (typeof window.ym !== 'function') return;   // пользователь отклонил аналитику или сработал блокировщик
  window.ym(COUNTER, 'reachGoal', name, { place: place || 'unknown' });
}
document.addEventListener('click', function (e) {
  var el = e.target.closest && e.target.closest('[data-goal]');
  if (!el || el.hasAttribute('data-gc-open')) return;
  goal('ms_cta_click', el.getAttribute('data-goal'));
});
```

Проверить, что `data-goal` проставлен на всех CTA страницы: герой, после программы, тарифы, финальный блок.

- [ ] **Step 6: JSON-LD**

Добавить в `<head>` по образцу `system_design/index.html:55-154`: `@graph` из `Course`, `CourseInstance`, `Person` (Олег) и `Offer` на каждый тариф.

Все `@id` и `url` — на `https://guide.olezhek28.courses/microservices/`. Цены, `startDate` и состав — из секции `tariffs` контент-файла. `priceValidUntil` ставим только если на Tilda есть дедлайн; выдумывать дату нельзя.

**Не копировать цены из JSON-LD текущей Tilda: он устарел.** Там стоит 69 990, тогда как на экране 74 990. Источник правды — экранные цены, они и лежат в контент-файле.

Разметка описывает страницу с `noindex` — это нормально: она понадобится сразу после переезда на боевой домен, а держать её в одном коммите с тарифами дешевле, чем возвращаться потом.

- [ ] **Step 7: Проверить**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, json
h = open('microservices/index.html', encoding='utf-8').read()

m = re.search(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)
assert m, "нет JSON-LD"
data = json.loads(m.group(1))
print("JSON-LD валиден, типов в графе:", [n.get('@type') for n in data.get('@graph', [])])
bad = [n.get('@id') for n in data.get('@graph', []) if '@id' in n and '/microservices/' not in n['@id']]
assert not bad, f"@id указывают не на microservices: {bad}"

goals = re.findall(r'data-goal="([^"]+)"', h)
print("CTA с целями:", goals)
assert len(goals) >= 4, "цели проставлены не на всех CTA"

for anchor in ['id="tariffs"', 'id="company"']:
    assert anchor in h, f"нет якоря {anchor}"

assert 'gc-modal' in h, "разметка модалки GetCourse не перенесена"
assert "e.origin !== WIDGET_ORIGIN" in h, "потеряна проверка origin в обработчике postMessage"
print("OK")
PY
```

- [ ] **Step 8: Коммит**

```bash
git add microservices/index.html
git commit -m "Тарифы, модалка GetCourse, цели Метрики и JSON-LD лендинга микросервисов"
```

---

### Task 10: Секции youtube-tg, faq, final

**Files:**
- Modify: `microservices/index.html`
- Read: `system_design/index.html:2788-2832` (YouTube/TG), `2833-2889` (FAQ), `2890-2915` (финальный CTA)

**Interfaces:**
- Consumes: секции `youtube-tg`, `faq`, `final` контент-файла

- [ ] **Step 1: YouTube / TG**

По образцу `system_design/index.html:2788-2832`. Заголовок «Кстати, Олег ведет YouTube и ламповый TG-канальчик». Три превью из `youtube/` с названиями роликов из контент-файла, кнопки «Смотреть больше видео» (`https://www.youtube.com/@olezhek28go`) и «Перейти в TG-канал» (`https://telegram.me/olezhek28go`).

- [ ] **Step 2: FAQ**

По образцу `system_design/index.html:2833-2889` (`.faq__*`). Заголовок «Заблуждения и частые вопросы», вопросы и ответы дословно из `rec765399487`.

Аккордеон: `<button>` с `aria-expanded`, содержимое через `aria-controls`. Все пункты свёрнуты по умолчанию.

- [ ] **Step 3: Финальный CTA**

По образцу `system_design/index.html:2890-2915`. Блок «Есть вопрос?» с текстом «Пиши в телеграм — отвечу сразу, как увижу сообщение:)» и ссылкой на `https://t.me/olezhek28`. CTA-кнопке проставить `data-goal="final"`.

- [ ] **Step 4: Проверить**

Прогнать скрипт сверки из Task 5 Step 5 со слагами `['youtube-tg', 'faq', 'final']`.

- [ ] **Step 5: Коммит**

```bash
git add microservices/index.html
git commit -m "Секции лендинга микросервисов: YouTube и TG, FAQ, финальный блок"
```

---

### Task 11: Приёмка

**Files:**
- Modify: `microservices/index.html` (правки по найденным дефектам)

- [ ] **Step 1: Полная сверка контента**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, html
md = open('docs/контент-микросервисы.md', encoding='utf-8').read()
pg = open('microservices/index.html', encoding='utf-8').read()

def norm(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s).replace(' ', ' ')
    return re.sub(r'[^а-яёa-z0-9]+', ' ', s.lower()).strip()

page = norm(pg)
slugs = re.findall(r'^## ([a-z-]+)', md, re.M)
total = miss = 0
for slug in slugs:
    sec = re.search(rf'^## {slug}\b.*?$(.*?)(?=^## |\Z)', md, re.M | re.S).group(1)
    bad = []
    for line in sec.split('\n'):
        line = line.strip()
        if not line or line.startswith(('**', '#', '|')): continue
        n = norm(line)
        if len(n) < 25: continue
        total += 1
        if n not in page: bad.append(line[:80])
    miss += len(bad)
    print(f"{slug:16} проверено фраз, не найдено: {len(bad)}")
    for b in bad: print("    ", b)
print(f"\nИТОГО: фраз {total}, не перенесено {miss}")
assert miss == 0, "контент перенесён не полностью"
print("OK")
PY
```

- [ ] **Step 2: Проверить ссылки и якоря**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
import re, os
h = open('microservices/index.html', encoding='utf-8').read()
ids = set(re.findall(r'\bid="([^"]+)"', h))
anchors = {a[1:] for a in re.findall(r'href="(#[^"]+)"', h) if len(a) > 1}
dead = sorted(anchors - ids)
print("битые якоря:", dead)
assert not dead, "есть ссылки на несуществующие якоря"

required = {'about-course', 'programm', 'education', 'speaker', 'feedback', 'tariffs', 'company'}
print("отсутствуют обязательные якоря:", sorted(required - ids))
assert required <= ids, "потеряны якоря, на которые ссылаются извне"

local = [l for l in re.findall(r'href="([^"#:]+\.html)"', h)]
missing = [l for l in local if not os.path.exists(os.path.join('microservices', l))]
print("битые локальные ссылки:", missing)
assert not missing

imgs = re.findall(r'<img[^>]+src="([^"]+)"', h)
broken = [i for i in imgs if not i.startswith(('http', 'data:')) and not os.path.exists(os.path.join('microservices', i))]
print(f"картинок: {len(imgs)}, битых: {len(broken)}", broken)
assert not broken

noalt = re.findall(r'<img(?![^>]*\balt=)[^>]*>', h)
print("картинок без alt:", len(noalt))
assert not noalt, "у всех картинок должен быть alt"
print("OK")
PY
```

- [ ] **Step 3: Проверить, что страница не утекла в индексацию**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets && python3 - <<'PY'
h = open('microservices/index.html', encoding='utf-8').read()
assert 'content="noindex, nofollow"' in h and 'name="yandex" content="none"' in h, "нет запрета индексации"

# Проверяем отсутствие именно НАШЕЙ страницы, а не слова «microservices».
# В llms.txt законно живёт ссылка на боевую Tilda — https://olezhek28.courses/microservices,
# её трогать нельзя. Запрещено только guide.olezhek28.courses/microservices
# и относительная ссылка на каталог.
forbidden = ['guide.olezhek28.courses/microservices', '"/microservices/"', "'/microservices/'"]
for f in ['sitemap.xml', 'llms.txt', 'llms-full.txt', 'index.html']:
    t = open(f, encoding='utf-8').read()
    hits = [p for p in forbidden if p in t]
    assert not hits, f"{f}: страница не должна быть здесь упомянута на фазе 1 — {hits}"
    print(f"{f:16} чисто")
print("OK")
PY
```

- [ ] **Step 4: Скриншотное сравнение всей страницы**

Через Chrome MCP открыть две вкладки: `https://olezhek28.courses/microservices` и `http://localhost:8000/microservices/`. Пройти все 20 секций сверху вниз на ширинах **1440**, **768** и **390** px.

Сверяем состав и иерархию, не пиксели: вёрстка намеренно другая. Ищем именно потери — пропавший блок, обрезанный текст, картинку не на месте.

Отдельно на 390px: горизонтальной прокрутки быть не должно.

```bash
# быстрая проверка на переполнение по горизонтали — выполнить в консоли браузера на 390px
# document.documentElement.scrollWidth > document.documentElement.clientWidth
```

- [ ] **Step 5: Проверить интерактив**

- аккордеон программы: все 8 недель раскрываются;
- FAQ: все пункты раскрываются;
- модалка ДЗ и 11 модалок историй: открываются, закрываются по Esc / фону / крестику, фокус возвращается на кнопку;
- бургер-меню на 390px открывается и закрывается;
- клик по пунктам nav скроллит к нужной секции, заголовок не уезжает под липкую шапку;
- счётчики в полосе фактов анимируются при появлении.

- [ ] **Step 6: Прогнать через клавиатуру**

Пройти страницу только на Tab: до всех CTA, аккордеонов и модалок можно добраться, фокус видно везде, на светлой секции кольцо тёмное, а не жёлтое.

- [ ] **Step 7: Коммит**

```bash
git add -A microservices/ docs/
git commit -m "Приёмка лендинга микросервисов: сверка контента, ссылок, адаптива и доступности"
```

- [ ] **Step 8: Выписать вопросы к Олегу**

Собрать в одно сообщение всё, что упёрлось во внешние данные:

- `id` и `uniq` формы предзаписи GetCourse для микросервисов (пока стоит заглушка на Tilda, см. Task 9 Step 4);
- открытые вопросы по оферте, если они появились в Task 4 Step 4;
- расхождения между Tilda и контент-файлом, если что-то выглядело устаревшим (числа в полосе фактов, состав логотипов компаний).

---

## Что остаётся на фазу 2

Не входит в этот план и отдельной спекой не покрыто:

- переписывание текстов, оффера и структуры под маркетинг и продажи;
- переезд на `olezhek28.courses/microservices`, 301-редиректы с Tilda, открытие индексации, добавление в `sitemap.xml`, `llms.txt`, `llms-full.txt` и в каталог корневого `index.html`;
- подключение оплаты (сейчас её нет и на Tilda — только предзапись);
- отключение Tilda.
