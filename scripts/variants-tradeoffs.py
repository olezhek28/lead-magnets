# -*- coding: utf-8 -*-
"""Собирает system_design/variants-tradeoffs.html — варианты блока с разменами.

Задача блока по словам автора: показать, что он на практике решал компромиссы
архитектуры. Сейчас это две подписи «Второй фактор» и «Персональные данные»
с текстом «Разменивал X на Y», и по ним непонятно, о чём речь.
"""
import io, re

PAGE = 'system_design/index.html'
OUT = 'system_design/variants-tradeoffs.html'
doc = io.open(PAGE, encoding='utf-8').read()
styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))
cur = re.search(r'<div class="case__tradeoffs">.*?</div>\s*</div>', doc, re.S).group(0)

LEAD = ('Такие развилки на секции и&nbsp;спрашивают: не&nbsp;«как правильно», а&nbsp;«чем ты&nbsp;пожертвовал и&nbsp;почему».')

# у каждого размена: ситуация, выбор, цена
CASES = [
 dict(tag='Двухфакторка для общих аккаунтов',
      sit='Кодом из&nbsp;Google Authenticator владеет один телефон, а&nbsp;сервисным аккаунтом пользуется вся команда.',
      pick='Выбрал схему, которая работает для общего доступа',
      pay='Заплатил строгостью второго фактора'),
 dict(tag='Персональные данные и&nbsp;скорость',
      sit='Персональные данные лежат в&nbsp;отдельном хранилище, а&nbsp;сессию надо проверять на&nbsp;каждом запросе.',
      pick='Оставил изоляцию данных как требует закон',
      pay='Заплатил лишним походом по&nbsp;сети и&nbsp;задержкой'),
]

def v1():
    rows = '\n'.join("""            <li class="tr1__row">
              <span class="tr1__tag">%s</span>
              <span class="tr1__sit">%s</span>
              <span class="tr1__deal"><b>%s</b><i>%s</i></span>
            </li>""" % (c['tag'], c['sit'], c['pick'], c['pay']) for c in CASES)
    return """
        <div class="case">
          <div class="case__label">Компромиссы, которые пришлось решать</div>
          <p class="tr__lead">%s</p>
          <ul class="tr1">
%s
          </ul>
        </div>""" % (LEAD, rows)

def v2():
    cards = '\n'.join("""            <article class="tr2__card">
              <span class="tr2__tag">%s</span>
              <p class="tr2__sit">%s</p>
              <div class="tr2__deal">
                <span class="tr2__pick">%s</span>
                <span class="tr2__arrow" aria-hidden="true">↓</span>
                <span class="tr2__pay">%s</span>
              </div>
            </article>""" % (c['tag'], c['sit'], c['pick'], c['pay']) for c in CASES)
    return """
        <div class="case">
          <div class="case__label">Компромиссы, которые пришлось решать</div>
          <p class="tr__lead">%s</p>
          <div class="tr2">
%s
          </div>
        </div>""" % (LEAD, cards)

def v3():
    rows = '\n'.join("""            <div class="tr3__row">
              <div class="tr3__q">%s<span>%s</span></div>
              <div class="tr3__a"><b>Что выбрал.</b> %s<br><b>Чем заплатил.</b> %s</div>
            </div>""" % (c['tag'], c['sit'], c['pick'], c['pay']) for c in CASES)
    return """
        <div class="case">
          <div class="case__label">Компромиссы, которые пришлось решать</div>
          <p class="tr__lead">%s</p>
          <div class="tr3">
%s
          </div>
        </div>""" % (LEAD, rows)

VARIANTS = [
 ('Сейчас', 'Две подписи и по абзацу текста. «Второй фактор» без расшифровки читается как термин из другой области, '
  'а «разменивал безопасность на сроки» не объясняет, в чём была развилка.', '<div class="case">%s</div>' % cur),
 ('Вариант 1 · строкой: ситуация, выбор, цена',
  'Каждый компромисс одной строкой: слева понятная подпись, в центре ситуация, справа что выбрал и чем заплатил. '
  'Самый компактный, читается как таблица решений.', v1()),
 ('Вариант 2 · карточки со стрелкой',
  'Карточка на компромисс: ситуация сверху, под ней выбор и цена, разделённые стрелкой. Видно саму механику размена, '
  'занимает больше высоты.', v2()),
 ('Вариант 3 · вопрос и ответ',
  'Слева развилка, справа ответ в двух строках: что выбрал и чем заплатил. Ближе всего к тому, как это звучит '
  'на секции, когда интервьюер спрашивает «почему так».', v3()),
]

body = []
for i, (title, note, markup) in enumerate(VARIANTS):
    body.append("""
  <section class="vr" id="t%d">
    <div class="vr__head"><h2>%s</h2></div>
    <p class="vr__note">%s</p>
    <div class="vr__stage">%s</div>
  </section>""" % (i, title, note, markup))

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · блок с компромиссами: варианты</title>
<meta name="robots" content="noindex, nofollow">
@@FONTS@@
@@STYLES@@
<style>
  html { scroll-behavior: auto; }
  body { background: var(--bg-primary); margin: 0; padding: 0 0 90px; }
  .vr-top { padding: 40px 26px 24px; border-bottom: 1px solid rgba(255,255,255,.14); }
  .vr-top h1 { font-family: var(--display); font-size: 29px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0 0 12px; }
  .vr-top p { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0 0 8px; max-width: 94ch; }
  .vr-top b { color: var(--text-h); }
  .vr-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .vr-nav a { font-family: var(--mono); font-size: 11px; color: var(--text-mute); border: 1px solid rgba(255,255,255,.14); border-radius: 7px; padding: 7px 11px; text-decoration: none; }
  .vr-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .vr { padding: 44px 26px 0; border-top: 1px solid rgba(255,255,255,.08); scroll-margin-top: 8px; }
  .vr__head h2 { font-family: var(--display); font-size: 21px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0; }
  .vr__note { color: var(--text-mute); font-size: 14.5px; line-height: 1.6; margin: 8px 0 22px; max-width: 96ch; }
  .vr__stage { max-width: 780px; }
  .vr__stage .case { padding: 26px 26px 24px; }
  .tr__lead { color: var(--text-mute); font-size: 14.5px; line-height: 1.6; margin: 0 0 20px; max-width: 62ch; }

  /* 1 — строкой */
  .tr1 { list-style: none; padding: 0; margin: 0; display: grid; gap: 1px; background: var(--border-mid); border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .tr1__row { display: grid; grid-template-columns: 168px minmax(0,1fr) 210px; gap: 18px; padding: 14px 18px; background: var(--bg-secondary); align-items: start; }
  .tr1__tag { font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); line-height: 1.5; }
  .tr1__sit { color: var(--text-mute); font-size: 14.5px; line-height: 1.5; }
  .tr1__deal { display: grid; gap: 4px; }
  .tr1__deal b { color: var(--text-h); font-size: 14px; font-weight: 600; line-height: 1.4; }
  .tr1__deal i { font-style: normal; color: var(--coral); font-size: 13.5px; line-height: 1.4; }

  /* 2 — карточки */
  .tr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .tr2__card { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: var(--r-md); padding: 18px; display: grid; gap: 10px; align-content: start; }
  .tr2__tag { font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
  .tr2__sit { color: var(--text-body); font-size: 14.5px; line-height: 1.55; margin: 0; }
  .tr2__deal { display: grid; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border-mid); justify-items: start; }
  .tr2__pick { color: var(--text-h); font-size: 14.5px; font-weight: 600; }
  .tr2__arrow { color: var(--text-deco); font-size: 13px; }
  .tr2__pay { color: var(--coral); font-size: 14px; }

  /* 3 — вопрос и ответ */
  .tr3 { display: grid; gap: 1px; background: var(--border-mid); border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .tr3__row { display: grid; grid-template-columns: 250px minmax(0,1fr); gap: 20px; padding: 16px 18px; background: var(--bg-secondary); }
  .tr3__q { color: var(--accent); font-size: 14.5px; font-weight: 600; line-height: 1.4; }
  .tr3__q span { display: block; color: var(--text-mute); font-weight: 400; font-size: 13.5px; margin-top: 6px; line-height: 1.5; }
  .tr3__a { color: var(--text-body); font-size: 14.5px; line-height: 1.7; }
  .tr3__a b { color: var(--text-h); font-weight: 600; }

  @media (max-width: 820px) {
    .tr1__row, .tr3__row { grid-template-columns: 1fr; gap: 8px; }
    .tr2 { grid-template-columns: 1fr; }
  }
</style>
</head>
<body class="anim-ready">
  <div class="vr-top">
    <h1>Блок с компромиссами: варианты</h1>
    <p>Задача блока по словам Олега: <b>показать, что он на практике решал компромиссы архитектуры</b>.
    Во всех вариантах у каждого размена три части: понятная подпись, ситуация и что за что отдали.</p>
    <p>Формулировки я собрал из того, что уже написано на странице, ничего нового про проект не выдумывал.
    Детали стоит сверить с Олегом, особенно про второй фактор.</p>
    <nav class="vr-nav">
      <a href="#t0">сейчас</a><a href="#t1">1 · строкой</a><a href="#t2">2 · карточки</a><a href="#t3">3 · вопрос-ответ</a>
    </nav>
  </div>
@@BODY@@
</body>
</html>
"""
out = (SHELL.replace('@@FONTS@@', fonts).replace('@@STYLES@@', styles).replace('@@BODY@@', '\n'.join(body)))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
