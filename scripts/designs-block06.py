# -*- coding: utf-8 -*-
"""Собирает system_design/designs-block06.html — три дизайна выбранного блока.

Содержание одно и то же: требование компании → где ломаются → в каком уроке
разбираем. Меняется только подача: таблица, конвейер-инфографика, карточки
со схемами.
"""
import io, re

PAGE = 'system_design/index.html'
OUT = 'system_design/designs-block06.html'
doc = io.open(PAGE, encoding='utf-8').read()
styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))

S = 'viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
ICONS = {
 'sys':  '<svg %s><rect x="6" y="8" width="14" height="10" rx="2"/><rect x="28" y="8" width="14" height="10" rx="2"/><rect x="17" y="30" width="14" height="10" rx="2"/><path d="M13 18v6h22v-6M24 24v6"/></svg>' % S,
 'calc': '<svg %s><rect x="10" y="6" width="28" height="36" rx="3"/><path d="M16 14h16M16 24h4M22 24h4M28 24h4M16 32h4M22 32h4M28 32h4"/></svg>' % S,
 'db':   '<svg %s><ellipse cx="24" cy="12" rx="14" ry="5"/><path d="M10 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12"/><path d="M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5"/></svg>' % S,
 'fail': '<svg %s><circle cx="12" cy="14" r="5"/><circle cx="36" cy="14" r="5"/><circle cx="24" cy="36" r="5"/><path d="M16 17l5 15M32 17l-5 15"/><path d="M31 9l10 10M41 9L31 19"/></svg>' % S,
 'talk': '<svg %s><path d="M8 10h24a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H18l-8 6v-6a3 3 0 0 1-2-3V13a3 3 0 0 1 3-3z"/><path d="M15 17h12M15 23h7"/></svg>' % S,
}

REQ = [
 ('sys',  'Спроектировать систему под заданную нагрузку', 'Кинулся рисовать, не спросив ни про что', 'уроки 03–04'),
 ('calc', 'Посчитать нагрузку и объём ресурсов',           'Поплыл: сколько это в байтах и запросах', 'урок 05'),
 ('db',   'Обосновать хранение и обработку данных',        'Назвал базу наугад',                      'уроки 13–23'),
 ('fail', 'Отвечать за отказы и балансировку',             'Копнули в отказ узла — начал плыть',      'уроки 08, 29–32'),
 ('talk', 'Рассуждать вслух и внятно формулировать',       'Звучал как пересказ ютуб-ролика',         'урок 41'),
]

LEAD = ('Требования к&nbsp;секции компании публикуют сами. Ниже&nbsp;— то, что ждёт от&nbsp;тебя Яндекс, '
        'где на&nbsp;этом чаще всего ломаются и&nbsp;в&nbsp;каком уроке мы&nbsp;это разбираем.')
SRC = ('Формулировки сжаты из&nbsp;требований к&nbsp;архитектурной секции на&nbsp;странице найма Яндекса.')
TITLE = 'Вот что от&nbsp;тебя ждут на&nbsp;секции'

def d_table():
    rows = '\n'.join(
      '          <li class="t6__row"><span class="t6__n">%02d</span><span class="t6__req">%s</span>'
      '<span class="t6__err">%s</span><span class="t6__fix">%s</span></li>' % (i, r[1], r[2], r[3])
      for i, r in enumerate(REQ, 1))
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">%s</h2></div>
        <p class="truth__lead truth__lead--short">%s</p>
        <ul class="t6">
          <li class="t6__head"><span></span><span>Что требуют</span><span>Где ломаются</span><span>Разбираем</span></li>
%s
        </ul>
        <p class="d6__src">%s</p>
      </div>""" % (TITLE, LEAD, rows, SRC)

def d_pipeline():
    cells = '\n'.join(
      """            <div class="pl__step">
              <span class="pl__ico">%s</span>
              <span class="pl__req">%s</span>
              <span class="pl__err">%s</span>
              <span class="pl__fix">%s</span>
            </div>""" % (ICONS[r[0]], r[1], r[2], r[3])
      for r in REQ)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">%s</h2></div>
        <p class="truth__lead truth__lead--short">%s</p>
        <div class="pl">
          <div class="pl__rail" aria-hidden="true"></div>
          <div class="pl__grid">
%s
          </div>
        </div>
        <p class="d6__src">%s</p>
      </div>""" % (TITLE, LEAD, cells, SRC)

def d_cards():
    cards = '\n'.join(
      """          <article class="cd6">
            <span class="cd6__ico">%s</span>
            <b class="cd6__req">%s</b>
            <span class="cd6__err"><i>ломаются тут:</i> %s</span>
            <span class="cd6__fix">%s</span>
          </article>""" % (ICONS[r[0]], r[1], r[2], r[3])
      for r in REQ)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">%s</h2></div>
        <p class="truth__lead truth__lead--short">%s</p>
        <div class="cd6-grid">
%s
        </div>
        <p class="d6__src">%s</p>
      </div>""" % (TITLE, LEAD, cards, SRC)

DESIGNS = [
 ('Дизайн 1 · плотная таблица',
  'Три колонки и номер. Максимально спокойно и читается по строкам, но это всё ещё текст: '
  'взгляду не за что зацепиться, кроме жёлтых номеров уроков.', d_table()),
 ('Дизайн 2 · конвейер',
  'Пять шагов в ряд на одной линии — как схема процесса. Требование крупно, ошибка мелко под ним, урок бейджем. '
  'Инфографика: с одного взгляда видно, что секция это последовательность, а не хаос.', d_pipeline()),
 ('Дизайн 3 · карточки со схемами',
  'Каждое требование — карточка со своей иконкой-схемой в стиле сайта. Больше воздуха и картинки, '
  'но выше по высоте и на мобиле идёт длинной колонкой.', d_cards()),
]

body = []
for i, (title, note, markup) in enumerate(DESIGNS, 1):
    body.append("""
  <section class="vr" id="d%d">
    <div class="vr__head"><h2>%s</h2></div>
    <p class="vr__note">%s</p>
    <div class="vr__stage"><section class="section">%s</section></div>
  </section>""" % (i, title, note, markup))

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · три дизайна блока про секцию</title>
<meta name="robots" content="noindex, nofollow">
@@FONTS@@
@@STYLES@@
<style>
  html { scroll-behavior: auto; }
  body { background: var(--bg-primary); margin: 0; padding: 0 0 90px; }
  .vr-top { padding: 40px 26px 26px; border-bottom: 1px solid rgba(255,255,255,.14); }
  .vr-top h1 { font-family: var(--display); font-size: 30px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0 0 12px; }
  .vr-top p { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0 0 8px; max-width: 92ch; }
  .vr-top b { color: var(--text-h); }
  .vr-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .vr-nav a { font-family: var(--mono); font-size: 11px; color: var(--text-mute); border: 1px solid rgba(255,255,255,.14); border-radius: 7px; padding: 7px 11px; text-decoration: none; }
  .vr-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .vr { padding: 46px 26px 0; border-top: 1px solid rgba(255,255,255,.08); scroll-margin-top: 8px; }
  .vr__head h2 { font-family: var(--display); font-size: 22px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0; }
  .vr__note { color: var(--text-mute); font-size: 14.5px; line-height: 1.6; margin: 8px 0 24px; max-width: 96ch; }
  .vr__stage { max-width: 1080px; }
  .vr__stage .section { padding: 0 !important; }
  .vr__stage .fade-up { opacity: 1 !important; transform: none !important; }
  .vr__stage .truth { padding: 40px 34px 34px; }
  .truth__lead--short { max-width: 62ch; margin-bottom: 30px; }
  .d6__src { font-family: var(--mono); font-size: 11px; color: var(--text-faint); margin: 16px 0 0; }

  /* 1 — таблица */
  .t6 { list-style: none; padding: 0; margin: 0; display: grid; gap: 1px; background: var(--border-mid);
        border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .t6__head, .t6__row { display: grid; grid-template-columns: 34px 1.1fr 1fr 128px; gap: 18px; padding: 15px 20px;
                        background: var(--bg-secondary); align-items: baseline; }
  .t6__head { background: var(--bg-tertiary); font-family: var(--mono); font-size: 10px; letter-spacing: .12em;
              text-transform: uppercase; color: var(--text-faint); }
  .t6__n { font-family: var(--mono); font-size: 11px; color: var(--text-deco); }
  .t6__req { color: var(--text-h); font-size: 15.5px; font-weight: 600; line-height: 1.4; }
  .t6__err { color: var(--text-mute); font-size: 14.5px; line-height: 1.4; }
  .t6__fix { font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-align: right; white-space: nowrap; }

  /* 2 — конвейер */
  .pl { position: relative; padding-top: 8px; }
  .pl__rail { position: absolute; left: 0; right: 0; top: 30px; height: 1px; background: linear-gradient(90deg,
              transparent, var(--border-acc) 8%, var(--border-acc) 92%, transparent); }
  .pl__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; position: relative; }
  .pl__step { display: grid; gap: 9px; justify-items: start; }
  .pl__ico { width: 44px; height: 44px; border-radius: 50%; background: var(--bg-primary); border: 1px solid rgba(223,223,65,.35);
             color: var(--accent); display: flex; align-items: center; justify-content: center; }
  .pl__ico svg { width: 22px; height: 22px; }
  .pl__req { color: var(--text-h); font-size: 15px; font-weight: 600; line-height: 1.35; margin-top: 4px; }
  .pl__err { color: var(--text-mute); font-size: 13.5px; line-height: 1.45; }
  .pl__fix { font-family: var(--mono); font-size: 11.5px; color: var(--accent); border: 1px solid rgba(223,223,65,.28);
             border-radius: 5px; padding: 4px 8px; }

  /* 3 — карточки со схемами */
  .cd6-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .cd6 { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: var(--r-md);
         padding: 20px 18px 16px; display: grid; gap: 10px; align-content: start; }
  .cd6__ico { color: var(--accent); opacity: .9; }
  .cd6__ico svg { width: 30px; height: 30px; }
  .cd6__req { color: var(--text-h); font-size: 16px; font-weight: 600; line-height: 1.32; }
  .cd6__err { color: var(--text-mute); font-size: 14px; line-height: 1.5; }
  .cd6__err i { font-style: normal; color: var(--text-deco); font-family: var(--mono); font-size: 11px;
                letter-spacing: .06em; text-transform: uppercase; display: block; margin-bottom: 3px; }
  .cd6__fix { font-family: var(--mono); font-size: 12px; color: var(--accent); padding-top: 10px;
              border-top: 1px solid var(--border-mid); }

  @media (max-width: 1000px) {
    .pl__grid { grid-template-columns: repeat(2, 1fr); gap: 26px; }
    .pl__rail { display: none; }
    .cd6-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .t6__head { display: none; }
    .t6__row { grid-template-columns: 1fr; gap: 6px; }
    .t6__fix { text-align: left; }
    .pl__grid, .cd6-grid { grid-template-columns: 1fr; }
    .vr__stage .truth { padding: 26px 18px 22px; }
  }
</style>
</head>
<body class="anim-ready">
  <div class="vr-top">
    <h1>Блок про секцию: три дизайна</h1>
    <p>Содержание одинаковое во всех трёх: <b>что требуют → где ломаются → в каком уроке разбираем</b>.
    Формулировки требований сжаты, дословная цитата ушла в подпись под блоком. Меняется только подача.</p>
    <nav class="vr-nav">
      <a href="#d1">1 · таблица</a><a href="#d2">2 · конвейер</a><a href="#d3">3 · карточки</a>
    </nav>
  </div>
@@BODY@@
</body>
</html>
"""
out = SHELL.replace('@@FONTS@@', fonts).replace('@@STYLES@@', styles).replace('@@BODY@@', '\n'.join(body))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
