# -*- coding: utf-8 -*-
"""Собирает system_design/variants-block06.html — варианты блока «Что происходит на секции».

Сверху текущая версия из рабочего дерева, ниже три варианта на той же фактуре.
Стили сайта берутся из index.html, поэтому всё выглядит как на странице.
"""
import io, re

PAGE = 'system_design/index.html'
OUT = 'system_design/variants-block06.html'
doc = io.open(PAGE, encoding='utf-8').read()

styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))

m = re.search(r'<section class="section" id="chto-ocenivayut">.*?</section>', doc, re.S)
current = m.group(0) if m else '<p>блок не найден</p>'

# одна и та же фактура во всех вариантах — сравниваем форму, а не текст
ROWS = [
    ('00:00–05:00', 'Уточняет требования',      'Кинулся рисовать, не спросив ни про что',        'урок 04'),
    ('05:00–15:00', 'Просит посчитать нагрузку', 'Поплыл: сколько это в байтах и запросах',        'урок 05'),
    ('15:00–25:00', 'Ждёт схему верхнего уровня','Нарисовал коробки, не объяснил зачем каждая',    'урок 03'),
    ('25:00–35:00', 'Копает в хранилище',        'Назвал базу наугад и не смог обосновать',        'урок 13'),
    ('35:00–50:00', 'Давит на узкие места',      'Копнули в отказ узла — начал плыть',             'уроки 19–21'),
]

LEAD = ('Секция выглядит чёрным ящиком, пока не знаешь, что внутри. А внутри — один и тот же '
        'маршрут: интервьюер ведёт тебя по нему все 50 минут. Вот он целиком — и то, где на каждом '
        'шаге чаще всего ломаются.')
FOOT = 'Сисдиз проходят не самые умные, а те, у кого есть понятный алгоритм решения и понимание всей необходимой базы.'

def var_a():
    rows = '\n'.join(
        '        <li class="vA__row"><span class="vA__step">%s</span>'
        '<span class="vA__err">%s</span><span class="vA__fix">%s</span></li>' % (step, err, fix)
        for _, step, err, fix in ROWS)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Что на&nbsp;самом деле происходит на&nbsp;секции</h2></div>
        <p class="truth__lead">%s</p>
        <ul class="vA">
          <li class="vA__head"><span>Что делает интервьюер</span><span>Где ломаются</span><span>Где чиним</span></li>
%s
        </ul>
        <p class="truth__foot">%s</p>
      </div>""" % (LEAD, rows, FOOT)

def var_b():
    rows = '\n'.join(
        """        <li class="vB__row">
          <span class="vB__time">%s</span>
          <span class="vB__body"><b>%s</b>%s</span>
          <span class="vB__fix">%s</span>
        </li>""" % (t, step, err, fix)
        for t, step, err, fix in ROWS)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Как проходят твои 50&nbsp;минут</h2></div>
        <p class="truth__lead">%s</p>
        <ol class="vB">
%s
        </ol>
        <p class="truth__foot">%s</p>
      </div>""" % (LEAD, rows, FOOT)

def var_c():
    cards = '\n'.join(
        """        <div class="vC__card">
          <span class="vC__n">%02d</span>
          <b class="vC__step">%s</b>
          <span class="vC__err">%s</span>
          <span class="vC__fix">%s</span>
        </div>""" % (i, step, err, fix)
        for i, (_, step, err, fix) in enumerate(ROWS, 1))
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Что на&nbsp;самом деле происходит на&nbsp;секции</h2></div>
        <p class="truth__lead">%s</p>
        <div class="vC">
%s
        </div>
        <p class="truth__foot">%s</p>
      </div>""" % (LEAD, cards, FOOT)

VARIANTS = [
    ('Сейчас', 'Чек-лист из пяти пунктов, потом отдельная таблица «ошибка → урок». '
               'Два списка подряд об одном и том же, читателю приходится их мысленно склеивать.', current, False),
    ('Вариант A · один маршрут', 'Чек-лист и ошибки склеены в одну сетку: что делает интервьюер, '
     'где на этом шаге ломаются, где чиним. Самый короткий, читается за один проход.', var_a(), True),
    ('Вариант B · 50 минут по времени', 'То же самое, но с таймингом слота. Заодно закрывает вторую боль ЦА — '
     '«не успеваю за 50 минут»: видно, сколько времени занимает каждый шаг.', var_b(), True),
    ('Вариант C · карточки', 'Пять карточек вместо строк. Легче на мобиле, каждый шаг читается отдельно, '
     'но занимает больше высоты и сильнее дробит внимание.', var_c(), True),
]

body = []
for i, (title, note, markup, wrap) in enumerate(VARIANTS):
    inner = ('<section class="section">%s</section>' % markup) if wrap else markup
    body.append("""
  <section class="vr" id="v%d">
    <div class="vr__head"><h2>%s</h2></div>
    <p class="vr__note">%s</p>
    <div class="vr__stage">%s</div>
  </section>""" % (i, title, note, inner))

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · варианты блока «Что происходит на секции»</title>
<meta name="robots" content="noindex, nofollow">
%s
%s
<style>
  html { scroll-behavior: auto; }
  body { background: var(--bg-primary); margin: 0; padding: 0 0 90px; }
  .vr-top { padding: 40px 26px 26px; border-bottom: 1px solid rgba(255,255,255,.14); }
  .vr-top h1 { font-family: var(--display); font-size: 30px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0 0 12px; }
  .vr-top p { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0 0 8px; max-width: 90ch; }
  .vr-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .vr-nav a { font-family: var(--mono); font-size: 11px; color: var(--text-mute); border: 1px solid rgba(255,255,255,.14);
              border-radius: 7px; padding: 7px 11px; text-decoration: none; }
  .vr-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .vr { padding: 44px 26px 0; border-top: 1px solid rgba(255,255,255,.08); scroll-margin-top: 8px; }
  .vr__head h2 { font-family: var(--display); font-size: 22px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0; }
  .vr__note { color: var(--text-mute); font-size: 14.5px; line-height: 1.6; margin: 8px 0 22px; max-width: 92ch; }
  .vr__stage { max-width: 1080px; }
  .vr__stage .section { padding: 0 !important; }
  .vr__stage .fade-up { opacity: 1 !important; transform: none !important; }
  .vr__stage .truth { padding: 40px 34px 34px; }

  /* — вариант A: одна сетка — */
  .vA { list-style: none; padding: 0; margin: 0 0 30px; display: grid; gap: 1px; background: var(--border-mid);
        border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .vA__head, .vA__row { display: grid; grid-template-columns: 1fr 1.15fr 110px; gap: 20px; padding: 14px 20px; background: var(--bg-secondary); align-items: baseline; }
  .vA__head { background: var(--bg-tertiary); font-family: var(--mono); font-size: 10px; letter-spacing: .12em;
              text-transform: uppercase; color: var(--text-faint); }
  .vA__step { color: var(--text-h); font-weight: 600; font-size: 15.5px; }
  .vA__err { color: var(--text-mute); font-size: 15px; }
  .vA__fix { font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-align: right; white-space: nowrap; }

  /* — вариант B: таймлайн слота — */
  .vB { list-style: none; padding: 0; margin: 0 0 30px; }
  .vB__row { display: grid; grid-template-columns: 108px 1fr 110px; gap: 22px; padding: 16px 0 16px 0;
             border-bottom: 1px solid var(--border-mid); align-items: baseline; position: relative; }
  .vB__row:first-child { border-top: 1px solid var(--border-mid); }
  .vB__time { font-family: var(--mono); font-size: 12px; color: var(--accent); letter-spacing: .04em; }
  .vB__body { color: var(--text-mute); font-size: 15px; line-height: 1.55; }
  .vB__body b { display: block; color: var(--text-h); font-size: 16px; font-weight: 600; margin-bottom: 3px; }
  .vB__fix { font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-align: right; white-space: nowrap; }

  /* — вариант C: карточки — */
  .vC { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 30px; }
  .vC__card { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: var(--r-md);
              padding: 18px 18px 16px; display: flex; flex-direction: column; gap: 7px; }
  .vC__n { font-family: var(--mono); font-size: 11px; color: var(--accent); letter-spacing: .1em; }
  .vC__step { color: var(--text-h); font-size: 16px; font-weight: 600; line-height: 1.3; }
  .vC__err { color: var(--text-mute); font-size: 14.5px; line-height: 1.5; flex: 1; }
  .vC__fix { font-family: var(--mono); font-size: 12px; color: var(--accent); padding-top: 8px; border-top: 1px solid var(--border-mid); }

  @media (max-width: 900px) {
    .vA__head { display: none; }
    .vA__row, .vB__row { grid-template-columns: 1fr; gap: 6px; }
    .vA__fix, .vB__fix { text-align: left; }
    .vC { grid-template-columns: 1fr; }
    .vr__stage .truth { padding: 26px 18px 22px; }
  }
</style>
</head>
<body class="anim-ready">
  <div class="vr-top">
    <h1>Блок «Что происходит на секции»: варианты</h1>
    <p>Во всех трёх одна и та же фактура — меняется только форма подачи. Тексты черновые: пять шагов надо
    сверить с уроком 02, тайминги в варианте B — тоже.</p>
    <nav class="vr-nav">
      <a href="#v0">сейчас</a><a href="#v1">A · один маршрут</a><a href="#v2">B · по времени</a><a href="#v3">C · карточки</a>
    </nav>
  </div>
%s
</body>
</html>
"""

out = SHELL % (fonts, styles, '\n'.join(body))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
