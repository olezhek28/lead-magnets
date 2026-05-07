# Exit-intent попап на странице архитектуры — План реализации

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Добавить exit-intent попап в `architecture/index.html`, который при выходе со страницы предлагает забрать тот же лид-магнит (видео + шпаргалку) через основной CTA в Telegram.

**Architecture:** Один HTML-блок с inline CSS и inline JS в `architecture/index.html`. Никаких новых файлов, кроме картинки. Триггер на десктопе — `mouseleave` к верху окна; на мобайле — таймер 15 сек + скролл вверх после 50% страницы. Один показ на устройство, `localStorage` с TTL 7 дней. Кнопка ведёт на тот же URL, что у основного CTA: `https://t.me/olezhek28go/2191`.

**Tech Stack:** Чистый HTML + CSS + vanilla JS. Manrope (уже подключён). Цветовая схема: `#182023` фон, `#dfdf41` акцент, `#ffffff` текст.

**Дизайн-документ:** `docs/plans/2026-05-07-architecture-exit-popup-design.md`

**Тестирование:** Проект статический, без тестового фреймворка. Каждая задача завершается ручной проверкой в браузере через `python3 -m http.server 8000` из корня репозитория.

---

## Task 1: Подготовить картинку-иллюстрацию

**Files:**
- Create: `architecture/popup.webp` (квадрат ~600×600 px, оптимизировать <60 KB)
- Create: `architecture/popup.jpg` (фолбэк для Safari старых версий, опционально)

**Step 1: Сгенерировать картинку**

Использовать промпт из дизайн-документа (раздел «Иллюстрация»). Сервис на выбор: Midjourney / DALL·E / Sora-style. Цвета строго: фон `#182023`, акцент `#dfdf41`.

**Step 2: Положить файл в проект**

Сохранить как `architecture/popup.webp`. Проверить размер — должен быть <60 KB. Если больше — пережать через `cwebp -q 80`.

**Step 3: Проверка**

Открыть `architecture/popup.webp` в браузере / Finder — картинка корректно отображается, цвета совпадают со страницей.

**Step 4: Commit**

```bash
git add architecture/popup.webp
git commit -m "Добавил картинку для exit-intent попапа"
```

---

## Task 2: Сверстать HTML-структуру попапа

**Files:**
- Modify: `architecture/index.html` — вставить блок попапа сразу перед `<div class="sticky-cta" id="sticky-cta">` (строка ~1419)

**Step 1: Добавить HTML-разметку попапа**

Вставить перед `<div class="sticky-cta">`:

```html
<!-- Exit-intent попап -->
<div class="popup" id="exit-popup" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="exit-popup-title">
  <div class="popup__overlay" data-popup-close></div>
  <div class="popup__card">
    <button class="popup__close" type="button" aria-label="Закрыть" data-popup-close>×</button>
    <div class="popup__image">
      <img src="popup.webp" alt="" loading="lazy" width="600" height="600">
    </div>
    <div class="popup__content">
      <span class="popup__badge">Бонус к гайду</span>
      <h2 class="popup__title" id="exit-popup-title">Уже уходишь?</h2>
      <p class="popup__desc">Забери шпаргалку «Архитектура Go-проекта» — карта эволюции от первого <code>main.go</code> до CQRS. Поймёшь, на каком этапе твой код прямо сейчас, что пора усложнять, а до чего ещё рано.</p>
      <p class="popup__list-title">Что внутри:</p>
      <ul class="popup__list">
        <li>Все 7 этапов эволюции архитектуры</li>
        <li>Чек-листы: когда применять, когда не нужно</li>
        <li>Сводная таблица 5 главных принципов</li>
      </ul>
      <a href="https://t.me/olezhek28go/2191" target="_blank" rel="noopener" class="popup__btn" data-popup-cta>Забрать шпаргалку</a>
    </div>
  </div>
</div>
```

**Step 2: Проверить, что HTML валиден**

Открыть страницу в браузере. Попап ещё не должен отображаться (стилей нет → блок будет торчать как обычный текст внизу). Это норма на этом шаге.

**Step 3: Commit**

```bash
git add architecture/index.html
git commit -m "Сверстал HTML структуру exit-intent попапа"
```

---

## Task 3: Добавить CSS для попапа

**Files:**
- Modify: `architecture/index.html` — добавить блок CSS внутри существующего `<style>`. Добавить в конец `<style>` блока, до медиа-запросов или в логичную секцию.

**Step 1: Найти место для CSS**

Открыть `architecture/index.html`, найти конец стилей (перед `@media` блоками или в самом конце `<style>`). Стили попапа добавить отдельной секцией с комментарием `/* Exit-intent попап */`.

**Step 2: Добавить базовые стили**

```css
/* Exit-intent попап */
.popup {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 250ms ease;
}
.popup.is-visible {
  display: flex;
  opacity: 1;
}
.popup__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.popup__card {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 880px;
  background: #1f292d;
  border-radius: 24px;
  overflow: hidden;
  transform: scale(0.96);
  transition: transform 250ms ease;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}
.popup.is-visible .popup__card {
  transform: scale(1);
}
.popup__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 24px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: background 150ms ease;
}
.popup__close:hover {
  background: rgba(255, 255, 255, 0.16);
}
.popup__image {
  flex: 0 0 360px;
  background: #182023;
}
.popup__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.popup__content {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.popup__badge {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 12px;
  background: rgba(223, 223, 65, 0.12);
  color: #dfdf41;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
}
.popup__title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
}
.popup__desc {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  color: #a8b3b8;
}
.popup__desc code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  color: #dfdf41;
}
.popup__list-title {
  margin: 8px 0 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.popup__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.popup__list li {
  position: relative;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.5;
  color: #d4dade;
}
.popup__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 8px;
  height: 8px;
  background: #dfdf41;
  border-radius: 50%;
}
.popup__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  padding: 16px 28px;
  background: #dfdf41;
  color: #182023;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 12px;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.popup__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(223, 223, 65, 0.3);
}

@media (max-width: 960px) {
  .popup__card { max-width: 560px; flex-direction: column; }
  .popup__image { flex: 0 0 240px; }
  .popup__content { padding: 28px; }
  .popup__title { font-size: 26px; }
}
@media (max-width: 640px) {
  .popup { padding: 12px; }
  .popup__image { flex: 0 0 180px; }
  .popup__content { padding: 24px; gap: 12px; }
  .popup__title { font-size: 22px; }
  .popup__desc { font-size: 14px; }
  .popup__list li { font-size: 14px; }
  .popup__btn { padding: 14px 22px; font-size: 15px; }
}
```

**Step 3: Временно показать попап для проверки вёрстки**

В DevTools добавить класс `is-visible` на `#exit-popup` или временно поменять в HTML `aria-hidden="true"` → дописать `class="popup is-visible"` (после проверки откатить).

**Step 4: Проверить вёрстку в браузере**

Запустить локальный сервер: `python3 -m http.server 8000` из корня репо. Открыть `http://localhost:8000/architecture/`. Включить `is-visible` через DevTools.

Проверить:
- На десктопе: картинка слева, контент справа, кнопка жёлтая, крестик в углу.
- На 960px: картинка сверху, контент снизу.
- На 640px: всё уместилось, кнопка не вылезает.
- Эстетика: цвета совпадают со стилем сайта, акцент `#dfdf41` яркий, текст читаем.

**Step 5: Откатить временную видимость**

Убрать `is-visible` из HTML, если добавлял.

**Step 6: Commit**

```bash
git add architecture/index.html
git commit -m "Добавил стили exit-intent попапа"
```

---

## Task 4: Добавить JS для логики показа и закрытия

**Files:**
- Modify: `architecture/index.html` — добавить блок JS внутри существующего `<script>` в конце файла (~строка 1448–1560).

**Step 1: Найти место для JS**

Открыть `architecture/index.html`. Найти существующий `<script>` блок в конце файла. Добавить новый функциональный блок в конце скрипта, перед `</script>`.

**Step 2: Добавить JS-логику попапа**

```javascript
// Exit-intent попап
(function() {
  var STORAGE_KEY = 'architecture_exit_popup_shown';
  var TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней
  var MOBILE_BREAKPOINT = 640;
  var MOBILE_MIN_TIME_MS = 15000;
  var MOBILE_SCROLL_THRESHOLD = 0.5;

  var popup = document.getElementById('exit-popup');
  if (!popup) return;

  // Проверка: уже показывали недавно?
  function wasShownRecently() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var ts = parseInt(raw, 10);
      if (isNaN(ts)) return false;
      return Date.now() - ts < TTL_MS;
    } catch (e) {
      return false;
    }
  }

  if (wasShownRecently()) return;

  var shown = false;

  function showPopup() {
    if (shown) return;
    shown = true;
    popup.classList.add('is-visible');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  function hidePopup() {
    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Закрытие: крестик, оверлей, Esc
  popup.addEventListener('click', function(e) {
    if (e.target.hasAttribute('data-popup-close')) hidePopup();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.classList.contains('is-visible')) hidePopup();
  });
  // Клик по CTA — тоже закрываем (после перехода юзера всё равно нет, но на всякий)
  var ctaBtn = popup.querySelector('[data-popup-cta]');
  if (ctaBtn) ctaBtn.addEventListener('click', hidePopup);

  // Триггер десктоп: mouseleave вверх
  function bindDesktopTrigger() {
    document.addEventListener('mouseleave', function(e) {
      if (e.clientY <= 0) showPopup();
    });
  }

  // Триггер мобайл: таймер + скролл вверх после 50%
  function bindMobileTrigger() {
    var startedAt = Date.now();
    var maxScrollPct = 0;
    var lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? window.scrollY / docHeight : 0;
      if (pct > maxScrollPct) maxScrollPct = pct;

      var scrollingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;

      if (
        scrollingUp &&
        maxScrollPct >= MOBILE_SCROLL_THRESHOLD &&
        Date.now() - startedAt >= MOBILE_MIN_TIME_MS
      ) {
        showPopup();
      }
    }, { passive: true });
  }

  if (window.innerWidth > MOBILE_BREAKPOINT) {
    bindDesktopTrigger();
  } else {
    bindMobileTrigger();
  }
})();
```

**Step 3: Сделать сухой прогон в браузере (десктоп)**

Запустить `python3 -m http.server 8000` (если ещё не запущен). Открыть `http://localhost:8000/architecture/`. Очистить `localStorage` через DevTools → Application → Local Storage → удалить ключ `architecture_exit_popup_shown` (или `localStorage.clear()`).

Подвести курсор быстро к верху браузера и за пределы окна.

Ожидаемо: попап появляется с анимацией, фон затемнён, скролл `body` заблокирован.

**Step 4: Проверить закрытие**

- Клик по крестику → попап закрывается, скролл восстанавливается.
- Esc → закрывается.
- Клик по затемнённому фону → закрывается.
- Клик по кнопке «Забрать шпаргалку» → открывается Telegram-пост в новой вкладке (URL `https://t.me/olezhek28go/2191`), попап закрывается.

**Step 5: Проверить «один раз»**

После показа закрыть попап. Снова дёрнуть курсор к верху → попап **не должен** появиться. Проверить, что в `localStorage` появился ключ `architecture_exit_popup_shown` с timestamp.

**Step 6: Проверить мобильный триггер**

В DevTools переключиться в Responsive mode (≤640px). Очистить `localStorage`. Перезагрузить страницу.
- Скроллить вниз до >50% страницы, подождать 15+ секунд, начать скроллить вверх → попап появляется.
- Не показывать попап раньше 15 сек или если не дошёл до 50%.

**Step 7: Проверить, что попап не ломает существующую страницу**

Закрыть попап. Прокрутить страницу — анимации `fade-up`, sticky CTA, отзывы работают как раньше.

**Step 8: Commit**

```bash
git add architecture/index.html
git commit -m "Добавил логику показа exit-intent попапа"
```

---

## Task 5: Финальная проверка и деплой

**Step 1: Очистить тестовое состояние localStorage**

В DevTools: `localStorage.removeItem('architecture_exit_popup_shown')`.

**Step 2: Прогнать чек-лист критериев готовности**

Из дизайн-документа:
- [ ] Попап появляется на десктопе при выходе курсора вверх.
- [ ] Попап появляется на мобайле через 15 сек + скролл вверх после 50%.
- [ ] После показа не появляется повторно в течение 7 дней (для проверки можно временно поменять `TTL_MS` на `60 * 1000` = 1 минута, проверить, и вернуть).
- [ ] Кнопка ведёт на `https://t.me/olezhek28go/2191`.
- [ ] Закрывается крестиком, Esc и кликом по фону.
- [ ] Адаптив корректен на 360 / 640 / 960 / 1440 px.
- [ ] Не ломает существующие анимации скролла, sticky CTA, отзывы.

**Step 3: Прогнать в реальных браузерах**

- Chrome (десктоп) — основной.
- Safari (десктоп) — проверка `backdrop-filter` и WebKit-префиксов.
- Mobile Safari (через DevTools или реальный iPhone) — проверка триггера и того, что нет горизонтального скролла.

**Step 4: Push на GitHub Pages**

```bash
git push origin main
```

Подождать ~1 минуту (GitHub Pages деплой). Открыть `https://guide.olezhek28.courses/architecture/` в инкогнито (чтобы `localStorage` был чистый), проверить вживую.

**Step 5: Финальный коммит, если что-то правил**

Если на финальной проверке что-то поправил — отдельный коммит:

```bash
git add architecture/index.html
git commit -m "Поправил <что именно> по итогам ручной проверки"
git push origin main
```

---

## Что НЕ входит в этот план (YAGNI)

- A/B-тестирование текста (запускаем один вариант, смотрим на метрики Telegram-постов).
- Аналитика событий показа/клика — добавим, когда появится система метрик.
- Адаптация под другие лендинги (`roadmap-2026/`) — отдельный тикет, после оценки результатов на architecture.
- Email-форма внутри попапа — лиды собираем через Telegram-бота, отдельный канал не нужен.
