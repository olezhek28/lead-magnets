# -*- coding: utf-8 -*-
"""Собирает system_design/preview-toggles.html — страница с включёнными недоделками.

Нужна, чтобы показать заказчику блоки, которые на боевой странице пока скрыты
фича-тоглами. Сам index.html при этом остаётся честным: тоглы в нём выключены,
и влить ветку с висящей заглушкой нельзя по невнимательности.

Запуск: python3 scripts/preview-toggles.py [имя-тогла ...]
По умолчанию включается demo-lesson.
"""
import io, re, sys

ON = sys.argv[1:] or ['demo-lesson']
SRC, OUT = 'system_design/index.html', 'system_design/preview-toggles.html'
s = io.open(SRC, encoding='utf-8').read()

for name in ON:
    pat = r"('%s':\s*)false" % re.escape(name)
    if not re.search(pat, s):
        raise SystemExit('нет такого тогла: ' + name)
    s = re.sub(pat, r'\1true', s)

s = s.replace('<meta charset="utf-8">',
              '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">\n'
              '<!-- ПРЕВЬЮ. Сборка из index.html с включёнными тоглами: %s.\n'
              '     Только для показа, на сайт не выкладываем: внутри заглушки вместо картинок. -->'
              % ', '.join(ON), 1)

io.open(OUT, 'w', encoding='utf-8').write(s)
print('готово: %s (включено: %s)' % (OUT, ', '.join(ON)))
