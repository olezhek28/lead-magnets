# -*- coding: utf-8 -*-
"""Три версии программы рядом: боевая, наша и без машинного текста.

Запуск: python3 scripts/compare3.py
"""
import io, re, subprocess

PAGE = 'system_design/index.html'
HUM  = 'system_design/index-humanized.html'
OUT  = 'system_design/compare3-program.html'
VOID = {'br','img','meta','link','input','source','hr','area','col','embed','param','track','wbr'}

def block(doc, cls):
    m = re.search(r'<(\w+)[^>]*\sclass="[^"]*(?<![\w-])%s(?![\w-])[^"]*"' % cls, doc)
    if not m: return None
    tag, start, depth = m.group(1), m.start(), 0
    for mm in re.finditer(r'<(/?)%s\b[^>]*?(/?)>' % tag, doc[start:]):
        if mm.group(1):
            depth -= 1
            if depth == 0: return doc[start:start + mm.end()]
        elif not mm.group(2) and tag not in VOID:
            depth += 1
    return None

now = io.open(PAGE, encoding='utf-8').read()
hum = io.open(HUM, encoding='utf-8').read()
prod = subprocess.run(['git', 'show', 'main:' + PAGE], capture_output=True, check=True).stdout.decode('utf-8')

COLS = [
    ('на сайте сейчас', 'main', block(prod, 'program'), 'was'),
    ('наша версия', 'ветка', block(now, 'program'), 'now'),
    ('без машинного текста', 'третья', block(hum, 'program'), 'hum'),
]
# у <details name="..."> одно имя связало бы колонки в одну группу
cols = []
for i, (title, tag, mk, cls) in enumerate(COLS):
    mk = (mk or '<p>блок не найден</p>').replace('name="program-week"', 'name="pw-%d"' % i)
    cols.append("""    <section class="c3__col c3__col--%s">
      <header class="c3__head"><b>%s</b><span>%s</span></header>
      <div class="c3__view">%s</div>
    </section>""" % (cls, title, tag, mk))

styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', now, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', now))

HTML = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · программа: три версии</title>
<meta name="robots" content="noindex, nofollow">
@@FONTS@@
@@STYLES@@
<style>
  html { scroll-behavior: auto; }
  body { background: var(--bg-primary); margin: 0; padding: 0 18px 80px; }
  .c3-top { padding: 34px 4px 22px; }
  .c3-top h1 { font-family: var(--display); font-size: 28px; font-weight: 500; letter-spacing: -.03em; color: var(--text-h); margin: 0 0 10px; }
  .c3-top p { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0 0 6px; max-width: 96ch; }
  .c3-top b { color: var(--text-h); }
  .c3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-items: start; }
  .c3__col { border: 1px solid var(--border-card); border-radius: 14px; overflow: hidden; background: var(--bg-primary); }
  .c3__col--was { border-color: rgba(255,133,98,.30); }
  .c3__col--now { border-color: rgba(255,255,255,.16); }
  .c3__col--hum { border-color: rgba(223,223,65,.34); }
  .c3__head { display: flex; align-items: baseline; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-mid); position: sticky; top: 0; background: var(--bg-card); z-index: 3; }
  .c3__head b { font-family: var(--display); font-size: 15px; font-weight: 600; color: var(--text-h); }
  .c3__head span { font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-faint); margin-left: auto; }
  .c3__col--was .c3__head b { color: #FF8562; }
  .c3__col--hum .c3__head b { color: var(--accent); }
  .c3__view { padding: 18px 14px; }
  .c3__view .fade-up { opacity: 1 !important; transform: none !important; }
  .c3__view .program { max-width: none; }
  .c3__view .program__item summary { padding: 14px 16px; }
  .c3__view .program__name { font-size: 17px; }
  .c3__view .program__body { padding: 0 16px 16px; }
  @media (max-width: 1100px) { .c3 { grid-template-columns: 1fr; } .c3__head { position: static; } }
</style>
</head>
<body class="anim-ready">
  <div class="c3-top">
    <h1>Программа: три версии рядом</h1>
    <p>Слева — то, что <b>на боевой странице сейчас</b>: домашка и результат недели по одной строке.
    В центре — <b>наша версия</b>: развёрнутые домашки и результаты, уже сокращённые.
    Справа — <b>та же наша версия без машинного текста</b>: те же факты, но разные начала фраз, разбитый ритм буллетов, живая речь.</p>
    <p>Недели раскрываются в каждой колонке независимо. Списки уроков и обещания недель во всех трёх колонках авторские, их не трогали.</p>
  </div>
  <div class="c3">
@@COLS@@
  </div>
</body>
</html>
"""
out = (HTML.replace('@@FONTS@@', fonts).replace('@@STYLES@@', styles)
           .replace('@@COLS@@', '\n'.join(cols)))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
