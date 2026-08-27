# -*- coding: utf-8 -*-
"""Собирает system_design/compare-blocks.html: только изменённые блоки, было и стало.

Левая колонка берётся из указанной git-ревизии, правая — из рабочего дерева.
Блоки живые: аккордеоны раскрываются, гифки играют, ховеры работают —
стили и картинки те же, что на сайте, потому что файл лежит рядом с ними.

Запуск:  python3 scripts/сравнение-блоков.py [ревизия-для-«было»]
"""
import html as H
import io
import re
import subprocess
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'origin/main'
PAGE = 'system_design/index.html'
OUT = 'system_design/compare-blocks.html'

# что показываем: селектор → как подписать
BLOCKS = [
    ('.blocks .block', 'Знакомая ситуация · сцена 01', 'Правка отменена, блок авторский.'),
    ('.mech', 'Почему не получается пройти сисдиз', 'Правки отменены, блок авторский.'),
    ('#chto-ocenivayut', 'Что на самом деле происходит на секции',
     'Новый блок: конвейер из пяти шагов на официальных требованиях Яндекса — что просят сделать, где чаще всего валятся, в каком уроке разбираем. Шаги проявляются по очереди при скролле. Внизу — переход к программе.'),
    ('.prog-head', 'Программа · подводка', 'Правка отменена, подводка авторская.'),
    ('.program', 'Программа · недели',
     'Новые названия 41 урока, домашки развёрнуты в «задача → сценарий → что сделаешь», результаты недель — лид и три буллета.'),
    ('#kak-uchimsya .row', 'Как устроено обучение · шаг 01',
     'Добавлена карточка открытого урока с превью конспекта. Под тоглом demo-lesson — здесь показана, на сайте пока скрыта.'),
    ('#avtor .case', 'Автор · продовый кейс', 'Правка отменена, блок авторский.'),
    ('#tarify', 'Тарифы',
     'Строка «Доступ к урокам и записям разборов — 2 года» добавлена в оба тарифа, раньше это было только в FAQ.'),
    ('#faq', 'FAQ',
     'Убран вопрос «это лотерея» (уехал в тело страницы), добавлены «Кому подойдёт курс», «Зачем платить, если есть ютуб», «Собес раньше старта».'),
    ('.final', 'Финальный экран',
     'Добавлена строка сбора почт для тех, кто «не сейчас». Под тоглом waitlist — здесь показана, на сайте пока скрыта.'),
]

VOID = {'br', 'img', 'meta', 'link', 'input', 'source', 'hr', 'area', 'col', 'embed', 'param', 'track', 'wbr'}


def find_block(doc, selector):
    """Находит первый элемент по простому селектору: #id, .class или '#id .class'."""
    parts = selector.split()
    pos = 0
    end = len(doc)
    for part in parts:
        if part.startswith('#'):
            m = re.search(r'<(\w+)[^>]*\sid="%s"' % re.escape(part[1:]), doc[pos:end])
        else:
            cls = part.lstrip('.')
            m = re.search(r'<(\w+)[^>]*\sclass="[^"]*(?<![\w-])%s(?![\w-])[^"]*"' % re.escape(cls), doc[pos:end])
        if not m:
            return None
        start = pos + m.start()
        tag = m.group(1)
        end = start + slice_len(doc[start:], tag)
        pos = start
    return doc[pos:end]


def slice_len(chunk, tag):
    """Длина элемента с учётом вложенности одноимённых тегов."""
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*?(/?)>' % tag, chunk):
        closing, selfclose = m.group(1), m.group(2)
        if closing:
            depth -= 1
            if depth == 0:
                return m.end()
        elif not selfclose and tag not in VOID:
            depth += 1
    return len(chunk)


def styles(doc):
    return '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))


def head_links(doc):
    return '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))


was_doc = subprocess.run(['git', 'show', '%s:%s' % (BASE, PAGE)],
                         capture_output=True, check=True).stdout.decode('utf-8')
now_doc = io.open(PAGE, encoding='utf-8').read()

def squash(t):
    return re.sub(r'\s+', ' ', re.sub(r'<!--.*?-->', '', t, flags=re.S)).strip()

rows = []
for sel, title, note in BLOCKS:
    a, b = find_block(was_doc, sel), find_block(now_doc, sel)
    if b is None:
        print('пропущен (нет в новой версии): %s' % sel)
        continue
    if a is not None and squash(a) == squash(b):
        print('пропущен (различий нет): %s' % sel)   # правку отменили — блок совпал с main
        continue
    left = a if a else '<p class="cmp-none">этого блока раньше не было</p>'
    # <details name="..."> с одинаковым именем связал бы колонки в одну группу:
    # открыл неделю справа — закрылась слева. Разводим имена.
    left = left.replace('name="program-week"', 'name="program-week-was"')
    rows.append((sel, title, note, left, b, a is None))

nav = '\n'.join(
    '    <a href="#b%d">%s%s</a>' % (i, H.escape(t), ' <i>новый</i>' if new else '')
    for i, (s_, t, n_, l_, r_, new) in enumerate(rows))

body = []
for i, (sel, title, note, left, right, new) in enumerate(rows):
    body.append("""
  <section class="cmp" id="b%d">
    <div class="cmp__head">
      <h2>%s</h2>
      <span class="cmp__sel">%s</span>
      %s
    </div>
    <p class="cmp__note">%s</p>
    <div class="cmp__pair">
      <div class="cmp__col cmp__col--was"><span class="cmp__tag">было · %s</span><div class="cmp__view">%s</div></div>
      <div class="cmp__col cmp__col--now"><span class="cmp__tag">стало · ветка</span><div class="cmp__view">%s</div></div>
    </div>
  </section>""" % (i, H.escape(title), H.escape(sel),
                   '<span class="cmp__new">новый блок</span>' if new else '',
                   H.escape(note), H.escape(BASE), left, right))

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · изменённые блоки: было и стало</title>
<meta name="robots" content="noindex, nofollow">
%s
%s
<style>
  /* ——— оболочка сравнения. Стили сайта выше, здесь только рамка вокруг них ——— */
  html { scroll-behavior: auto; }
  body { background: #0b0f11; margin: 0; padding: 0; }
  .cmp-top { padding: 34px 26px 22px; border-bottom: 1px solid rgba(255,255,255,.14); }
  .cmp-top h1 { font-family: var(--display); font-size: 30px; font-weight: 500; letter-spacing: -.03em;
                color: var(--text-h); margin: 0 0 12px; }
  .cmp-top p { color: var(--text-mute); font-size: 15px; margin: 0 0 8px; max-width: 88ch; line-height: 1.6; }
  .cmp-top b { color: var(--text-h); }
  .cmp-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
  .cmp-nav a { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: var(--text-mute);
               border: 1px solid rgba(255,255,255,.14); border-radius: 7px; padding: 7px 11px; text-decoration: none; }
  .cmp-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .cmp-nav a i { font-style: normal; color: var(--accent); }
  .cmp { padding: 40px 26px 10px; border-top: 1px solid rgba(255,255,255,.08); scroll-margin-top: 10px; }
  .cmp__head { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
  .cmp__head h2 { font-family: var(--display); font-size: 22px; font-weight: 500; letter-spacing: -.03em;
                  color: var(--text-h); margin: 0; }
  .cmp__sel { font-family: var(--mono); font-size: 11px; color: var(--text-faint); }
  .cmp__new { font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
              background: var(--accent); color: var(--accent-ink); padding: 3px 7px; border-radius: 4px; font-weight: 700; }
  .cmp__note { color: var(--text-mute); font-size: 14.5px; margin: 8px 0 20px; max-width: 92ch; line-height: 1.6; }
  .cmp__pair { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
  .cmp__col { border: 1px solid rgba(255,255,255,.1); border-radius: 14px; overflow: hidden; background: var(--bg-primary); }
  .cmp__col--was { border-color: rgba(255,133,98,.28); }
  .cmp__col--now { border-color: rgba(223,223,65,.3); }
  .cmp__tag { display: block; font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
              padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .cmp__col--was .cmp__tag { color: #FF8562; }
  .cmp__col--now .cmp__tag { color: var(--accent); }
  .cmp__view { padding: 22px 18px; }
  .cmp__view .section, .cmp__view section { padding: 0 !important; }
  .cmp__view .container { padding: 0 !important; max-width: none !important; }
  .cmp-none { font-family: var(--mono); font-size: 12px; color: var(--text-deco); padding: 40px 0; text-align: center; }
  /* блоки внутри сравнения показываем сразу, без ожидания скролла */
  .cmp__view .fade-up { opacity: 1 !important; transform: none !important; }
  /* колонка уже окна, а медиазапросы смотрят на окно: разрешаем перенос вручную */
  .cmp__view .mech__title, .cmp__view .gate__title, .cmp__view .prog-head__title,
  .cmp__view .section__title, .cmp__view .final__title { white-space: normal; max-width: none; }
  .cmp__view .mech { padding: 40px 32px 34px; }
  .cmp__view .truth, .cmp__view .gate { padding: 34px 26px 30px; }
  @media (max-width: 1100px) { .cmp__pair { grid-template-columns: 1fr; } }
</style>
</head>
<body class="anim-ready">
  <div class="cmp-top">
    <h1>Изменённые блоки: было и стало</h1>
    <p>Слева версия из <b>%s</b>, справа — рабочее дерево ветки. Блоки живые: аккордеоны раскрываются, гифки играют, ховеры работают.</p>
    <p>Блоки, спрятанные фича-тоглами на сайте (скрины вакансий, карточка открытого урока, сбор почт), <b>здесь показаны</b> — чтобы было видно, что появится, когда приедут материалы.</p>
    <p>Скрипты сайта здесь не подключены: аккордеоны и гифки работают сами, а модалка видеопродажника
    и счётчики не запустятся — по кнопке плеера смотрим только вёрстку.</p>
    <nav class="cmp-nav">
%s
    </nav>
  </div>
%s
</body>
</html>
"""

out = SHELL % (head_links(now_doc), styles(now_doc), H.escape(BASE), nav, '\n'.join(body))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, блоков: %d, размер: %.0f КБ' % (OUT, len(rows), len(out.encode()) / 1024))
