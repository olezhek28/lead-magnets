# -*- coding: utf-8 -*-
"""Собирает system_design/variants-block06.html — варианты блока про секцию."""
import io, re

PAGE = 'system_design/index.html'
OUT = 'system_design/variants-block06.html'
doc = io.open(PAGE, encoding='utf-8').read()
styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))
m = re.search(r'<section class="section" id="chto-ocenivayut">.*?</section>', doc, re.S)
current = m.group(0) if m else '<p>блок не найден</p>'

# требования Яндекса — дословно с yandex.ru/jobs/pages/dev_interview
YA = [
 ('Спроектировать распределённую систему или её часть, которая будет соответствовать выбранным задачам, нагрузке, доступности и другим требованиям',
  'Кинулся рисовать, не спросив ни про что', 'уроки 03–04'),
 ('Оценить производительность системы, а также объём вычислительных ресурсов, необходимый для её штатного функционирования',
  'Поплыл: сколько это в байтах и запросах', 'урок 05'),
 ('Показать понимание проблем хранения и обработки данных в распределённых системах, рассказать о достоинствах и недостатках подходов',
  'Назвал базу наугад и не смог обосновать', 'уроки 13–23'),
 ('Показать понимание аспектов эксплуатации: балансировки нагрузки, обеспечения отказоустойчивости, требований по доступности',
  'Копнули в отказ узла — начал плыть', 'уроки 08, 29–32'),
 ('Продемонстрировать аналитическое и критическое мышление, широкий кругозор, умение корректно формулировать свои мысли',
  'Звучал как пересказ ютуб-ролика', 'урок 41'),
]
SRC = ('Требования — со страницы «Как мы нанимаем бэкенд-разработчиков» на сайте Яндекса, '
       'раздел «Архитектурная секция». Уроки проставлены по программе курса.')

def v1():
    rows = '\n'.join('          <li class="q1__row"><span class="q1__req">%s</span><span class="q1__err">%s</span><span class="q1__fix">%s</span></li>' % r for r in YA)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Вот что от&nbsp;тебя ждут на&nbsp;секции</h2></div>
        <p class="truth__lead">Это не&nbsp;наши догадки: крупные компании публикуют требования сами. Слева&nbsp;— дословно то, что Яндекс пишет про архитектурную секцию. Справа&nbsp;— где на&nbsp;этом чаще всего ломаются и&nbsp;в&nbsp;каком уроке мы&nbsp;это разбираем.</p>
        <ul class="q1">
          <li class="q1__head"><span>Что требуют</span><span>Где ломаются</span><span>Где чиним</span></li>
%s
        </ul>
        <p class="q1__src">%s</p>
      </div>""" % (rows, SRC)

def v2():
    items = '\n'.join('            <li><b>%s</b><span class="q2__err">%s</span><span class="q2__fix">%s</span></li>' % r for r in YA)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Секция описана публично&nbsp;— просто её&nbsp;мало кто читал</h2></div>
        <p class="truth__lead">Яндекс выложил требования к&nbsp;архитектурной секции у&nbsp;себя на&nbsp;сайте. Пять пунктов, и&nbsp;под каждым&nbsp;— место, где чаще всего ломаются, и&nbsp;урок, в&nbsp;котором мы&nbsp;это закрываем.</p>
        <div class="q2">
          <figure class="q2__shot">
            <div class="q2__ph">скрин страницы Яндекса</div>
            <figcaption>yandex.ru/jobs · «Архитектурная секция»</figcaption>
          </figure>
          <ul class="q2__list">
%s
          </ul>
        </div>
      </div>""" % items

def v3():
    rows = '\n'.join('          <li class="q3__row"><span class="q3__err">%s</span><span class="q3__fix">%s</span></li>' % (r[1], r[2]) for r in YA)
    return """
      <div class="truth truth--slim">
        <div class="section__head"><h2 class="section__title">Где на&nbsp;секции ломаются чаще всего</h2></div>
        <p class="truth__lead">Требования компании пишут почти одинаково: спроектировать систему под заданную нагрузку, оценить ресурсы, обосновать хранилище, ответить за&nbsp;отказы. Ломаются тоже в&nbsp;одних и&nbsp;тех&nbsp;же местах&nbsp;— и&nbsp;под каждое в&nbsp;курсе есть свой урок.</p>
        <ul class="q3">
%s
        </ul>
        <p class="q1__src">%s</p>
      </div>""" % (rows, SRC)

# требования Т-Банка — дословно из открытого репозитория Tinkoff/career
TB = 'Вам будет предложен набор функциональных требований к системе. В течение часа Вам предстоит формализовать задачу, спроектировать API системы, оценить нагрузку и необходимые мощности, спроектировать модели и потоки данных.'
TB_SRC = 'Дословно из открытого репозитория Tinkoff/career на GitHub, файл «Секция системного дизайна в Тинькофф».'
TB_PARTS = [
 ('формализовать задачу', 'Кинулся рисовать, не спросив ни про что', 'урок 04'),
 ('спроектировать API системы', 'Ручка «как получится», без идемпотентности', 'урок 06'),
 ('оценить нагрузку и необходимые мощности', 'Поплыл: сколько это в байтах и запросах', 'урок 05'),
 ('спроектировать модели и потоки данных', 'Назвал базу наугад и не смог обосновать', 'уроки 13, 26–27'),
]

def v4():
    rows = '\n'.join('          <li class="q4__row"><span class="q4__part">%s</span><span class="q4__err">%s</span><span class="q4__fix">%s</span></li>' % r for r in TB_PARTS)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Одно предложение, в&nbsp;котором вся секция</h2></div>
        <blockquote class="q4__quote">%s</blockquote>
        <p class="q4__from">Т-Банк, описание секции системного дизайна</p>
        <p class="truth__lead">Четыре глагола&nbsp;— и&nbsp;это весь план секции. Разбираем по&nbsp;частям: где спотыкаются и&nbsp;в&nbsp;каком уроке мы&nbsp;это закрываем.</p>
        <ul class="q4">
%s
        </ul>
        <p class="q1__src">%s</p>
      </div>""" % (TB, rows, TB_SRC)

def v5():
    tb = '\n'.join('            <li>%s</li>' % p[0] for p in TB_PARTS)
    ya = '\n'.join('            <li>%s</li>' % r[0].split(',')[0].lower() for r in YA[:4])
    rows = '\n'.join('          <li class="q3__row"><span class="q3__err">%s</span><span class="q3__fix">%s</span></li>' % (r[1], r[2]) for r in TB_PARTS)
    return """
      <div class="truth">
        <div class="section__head"><h2 class="section__title">Секция везде одна и&nbsp;та&nbsp;же</h2></div>
        <p class="truth__lead">Две компании, которые описали секцию публично. Названия разные, список&nbsp;— один. Значит, готовиться есть к&nbsp;чему: это не&nbsp;лотерея и&nbsp;не&nbsp;настроение интервьюера.</p>
        <div class="q5">
          <div class="q5__col"><span class="q5__name">Т-Банк</span><ul>
%s
          </ul></div>
          <div class="q5__col"><span class="q5__name">Яндекс</span><ul>
%s
          </ul></div>
        </div>
        <p class="truth__lead">И&nbsp;ломаются на&nbsp;этом списке одинаково&nbsp;— под каждое место в&nbsp;курсе есть свой урок:</p>
        <ul class="q3">
%s
        </ul>
        <p class="q1__src">%s</p>
      </div>""" % (tb, ya, rows, TB_SRC)

VARIANTS = [
 ('Сейчас · маршрут секции',
  'Наш маршрут: что делает интервьюер, где ломаются, где чиним. Шаги — наше утверждение, ничем не подтверждённое, '
  'и первая колонка повторяет пятишаговый визуал из блока «Как устроено обучение».', current, False),
 ('Вариант 1 · требования компании как ось',
  'Вместо наших шагов — дословные требования Яндекса, каждое связано с ошибкой и уроком. Логика: «не мы придумали, '
  'вот что от тебя ждут — и вот где мы это закрываем». Доказательство встроено в саму таблицу, скрин необязателен.', v1(), True),
 ('Вариант 2 · скрин документа и разбор по пунктам',
  'Слева скрин официальной страницы, справа разбор. Логика: сначала показываем документ, потом объясняем. '
  'Доказательство работает визуально, до чтения. Ждёт один скриншот.', v2(), True),
 ('Вариант 3 · только ошибки и уроки',
  'Минимальная версия: колонки со шагами нет, остаётся мост к программе. Не спорит с пятишаговым визуалом, '
  'вдвое ниже. Требования упомянуты одной фразой в лиде.', v3(), True),
 ('Вариант 4 · Т-Банк: одно предложение, в котором вся секция',
  'Ось — одна цитата Т-Банка: четыре глагола, которые и есть план секции. Дальше разбор по частям. '
  'Логика: не список требований, а один документ, который читается за десять секунд.', v4(), True),
 ('Вариант 5 · два источника рядом',
  'Т-Банк и Яндекс в двух колонках: названия разные, список одинаковый. Логика: доказательство через повторяемость — '
  '«это не лотерея и не настроение интервьюера». Снимает возражение «а вдруг у нас спросят иначе».', v5(), True),
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
<title>System Design · варианты блока про секцию</title>
<meta name="robots" content="noindex, nofollow">
%s
%s
<style>
  html { scroll-behavior: auto; }
  body { background: var(--bg-primary); margin: 0; padding: 0 0 90px; }
  .vr-top { padding: 40px 26px 26px; border-bottom: 1px solid rgba(255,255,255,.14); }
  .vr-top h1 { font-family: var(--display); font-size: 30px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0 0 12px; }
  .vr-top p { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0 0 8px; max-width: 94ch; }
  .vr-top b { color: var(--text-h); }
  .vr-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .vr-nav a { font-family: var(--mono); font-size: 11px; color: var(--text-mute); border: 1px solid rgba(255,255,255,.14); border-radius: 7px; padding: 7px 11px; text-decoration: none; }
  .vr-nav a:hover { border-color: var(--accent); color: var(--accent); }
  .vr { padding: 44px 26px 0; border-top: 1px solid rgba(255,255,255,.08); scroll-margin-top: 8px; }
  .vr__head h2 { font-family: var(--display); font-size: 22px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0; }
  .vr__note { color: var(--text-mute); font-size: 14.5px; line-height: 1.6; margin: 8px 0 22px; max-width: 96ch; }
  .vr__stage { max-width: 1080px; }
  .vr__stage .section { padding: 0 !important; }
  .vr__stage .fade-up { opacity: 1 !important; transform: none !important; }
  .vr__stage .truth { padding: 40px 34px 34px; }
  .vr__stage .truth--slim { padding: 34px 30px 28px; }

  .q1 { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 1px; background: var(--border-mid); border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .q1__head, .q1__row { display: grid; grid-template-columns: 1.5fr 1fr 118px; gap: 20px; padding: 15px 20px; background: var(--bg-secondary); align-items: baseline; }
  .q1__head { background: var(--bg-tertiary); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-faint); }
  .q1__req { color: var(--text-h); font-size: 15px; line-height: 1.45; }
  .q1__err { color: var(--text-mute); font-size: 14.5px; line-height: 1.45; }
  .q1__fix { font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-align: right; white-space: nowrap; }
  .q1__src { font-family: var(--mono); font-size: 11.5px; color: var(--text-faint); margin: 0; line-height: 1.6; max-width: 80ch; }

  .q2 { display: grid; grid-template-columns: 300px minmax(0,1fr); gap: 26px; align-items: start; }
  .q2__shot { margin: 0; }
  .q2__ph { aspect-ratio: 3 / 4; border: 1px dashed var(--text-deco); border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px; color: var(--text-deco); font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; background: rgba(255,255,255,.02); }
  .q2__shot figcaption { margin-top: 10px; font-family: var(--mono); font-size: 11px; color: var(--text-faint); }
  .q2__list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
  .q2__list li { display: grid; gap: 5px; padding-bottom: 14px; border-bottom: 1px solid var(--border-mid); }
  .q2__list li:last-child { border-bottom: 0; padding-bottom: 0; }
  .q2__list b { color: var(--text-h); font-size: 15px; font-weight: 600; line-height: 1.45; }
  .q2__err { color: var(--text-mute); font-size: 14.5px; }
  .q2__fix { font-family: var(--mono); font-size: 12px; color: var(--accent); }

  .q3 { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 1px; background: var(--border-mid); border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .q3__row { display: grid; grid-template-columns: minmax(0,1fr) 118px; gap: 20px; padding: 14px 20px; background: var(--bg-secondary); align-items: baseline; }
  .q3__err { color: var(--text-body); font-size: 15.5px; }
  .q3__fix { font-family: var(--mono); font-size: 12.5px; color: var(--accent); text-align: right; white-space: nowrap; }

  .q4__quote { font-family: var(--display); font-size: clamp(17px, 2vw, 22px); line-height: 1.45; font-weight: 500;
               color: var(--text-h); margin: 0 0 10px; padding-left: 22px; border-left: 2px solid var(--accent); max-width: 74ch; }
  .q4__from { font-family: var(--mono); font-size: 11.5px; color: var(--text-faint); margin: 0 0 26px; padding-left: 24px; }
  .q4 { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 1px; background: var(--border-mid); border: 1px solid var(--border-mid); border-radius: var(--r-md); overflow: hidden; }
  .q4__row { display: grid; grid-template-columns: 1fr 1fr 118px; gap: 20px; padding: 14px 20px; background: var(--bg-secondary); align-items: baseline; }
  .q4__part { color: var(--accent); font-size: 15px; }
  .q4__err { color: var(--text-mute); font-size: 14.5px; }
  .q4__fix { font-family: var(--mono); font-size: 12.5px; color: var(--text-h); text-align: right; white-space: nowrap; }
  .q5 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 0 30px; }
  .q5__col { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: var(--r-md); padding: 18px 20px 16px; }
  .q5__name { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
  .q5__col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
  .q5__col li { position: relative; padding-left: 18px; color: var(--text-body); font-size: 15px; line-height: 1.45; }
  .q5__col li::before { content: "—"; position: absolute; left: 0; color: var(--text-deco); }

  @media (max-width: 900px) {
    .q4__row { grid-template-columns: 1fr; gap: 5px; }
    .q4__fix { text-align: left; }
    .q5 { grid-template-columns: 1fr; }
    .q1__head { display: none; }
    .q1__row, .q3__row { grid-template-columns: 1fr; gap: 6px; }
    .q1__fix, .q3__fix { text-align: left; }
    .q2 { grid-template-columns: 1fr; }
    .vr__stage .truth { padding: 26px 18px 22px; }
  }
</style>
</head>
<body class="anim-ready">
  <div class="vr-top">
    <h1>Блок про секцию: три варианта</h1>
    <p>Во всех трёх ось — <b>официальные требования Яндекса</b> к архитектурной секции, дословно с их страницы найма. Меняется логика: в первом требования стоят в таблице рядом с ошибками, во втором показываем скрин документа и разбираем по пунктам, в третьем требований почти нет — только мост к программе.</p>
    <p>Связки «требование → урок» проставил я по программе курса, их надо сверить.</p>
    <nav class="vr-nav">
      <a href="#v0">сейчас</a><a href="#v1">1 · требования как ось</a><a href="#v2">2 · скрин и разбор</a><a href="#v3">3 · только ошибки</a><a href="#v4">4 · цитата Т-Банка</a><a href="#v5">5 · два источника</a>
    </nav>
  </div>
%s
</body>
</html>
"""
out = SHELL % (fonts, styles, '\n'.join(body))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
