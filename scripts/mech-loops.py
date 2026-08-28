#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Собирает docs/preview/mech-loops.html: секция «Почему не получается»
целиком, три раза подряд, в каждой копии своя живая обложка видео.

Смысл — посмотреть варианты не вырезанными кадрами, а так, как они лягут
на страницу: в тех же размерах, с тем же текстом и отступами. Листаешь
одну копию за другой и сравниваешь.

Разметка и стили берутся из боевой страницы, поэтому пересобирать файл
надо после каждой правки секции.
"""

import io
import re
import sys

PAGE = 'system_design/index.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'docs/preview/mech-loops.html'

# что показываем: файл петли, постер, заголовок варианта, пояснение
VARIANTS = [
    ('gif-effects/v6-vignette.mp4', 'gif-effects/v6-vignette-poster.jpg',
     'Виньетка',
     'Полный цвет, края затемнены — кадр мягко тонет в фоне. 1:24,0 · 3,4 с'),
    ('gif-effects/v3-gesture-slow.mp4', 'gif-effects/v3-gesture-slow-poster.jpg',
     'Замедление',
     'Активная жестикуляция, растянутая до 3,5 с: движение плавнее. 0:32,2 · 3,5 с'),
    ('gif-variants/v03-meme-forehead.mp4', 'gif-variants/v03-meme-forehead-poster.jpg',
     'Мем на лбу',
     'Крупный план, мем-стикер на лбу. Самый живой кадр. 0:46,4 · 3,8 с'),
]

doc = io.open(PAGE, encoding='utf-8').read()


def styles(d):
    return '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', d, re.S))


def head_links(d):
    head = d[:d.index('</head>')]
    keep = re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', head)
    return '\n'.join(keep)


# секция целиком, от <section> до закрывающего тега
start = doc.index('<div class="mech fade-up">')
start = doc.rindex('<section', 0, start)
end = doc.index('</section>', start) + len('</section>')
block = doc[start:end]

# на превью анимации появления только мешают: показываем всё сразу
block = block.replace(' fade-up', '')


def copy_for(video, poster):
    """Подменяет источник живой обложки на вариант."""
    b = re.sub(r'src="[^"]*\.mp4"', 'src="%s"' % video, block, count=1)
    b = re.sub(r'poster="[^"]*"', 'poster="%s"' % poster, b, count=1)
    # кнопка открывает модалку, которой тут нет — гасим, чтобы не ловить клики
    return b.replace('<button type="button"', '<button type="button" disabled')


cards = []
for i, (video, poster, name, note) in enumerate(VARIANTS, 1):
    cards.append(
        '<div class="pick">\n'
        '  <div class="pick__head" id="v%d">\n'
        '    <span class="pick__num">Вариант %d</span>\n'
        '    <h2 class="pick__name">%s</h2>\n'
        '    <p class="pick__note">%s</p>\n'
        '  </div>\n'
        '%s\n'
        '</div>' % (i, i, name, note, copy_for(video, poster)))

SHELL = u"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Живая обложка видео: три варианта в блоке</title>
%s
%s
<style>
  body { background: var(--bg-primary); }
  .pick { padding-top: 10px; }
  .pick + .pick { border-top: 1px solid var(--border-mid); }
  .pick__head { max-width: 1180px; margin: 0 auto; padding: 46px 32px 0; }
  .pick__num { display: inline-block; font-family: var(--mono); font-size: 12px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--accent); border: 1px solid var(--border-acc);
    border-radius: 999px; padding: 6px 14px; }
  .pick__name { font-family: var(--display); font-size: 30px; font-weight: 500; letter-spacing: -.03em;
    color: var(--text-h); margin: 16px 0 6px; }
  .pick__note { font-size: 15px; line-height: 1.6; color: var(--text-mute); margin: 0; }
  .cmp-nav { position: sticky; top: 0; z-index: 30; display: flex; gap: 10px; align-items: center;
    padding: 12px 32px; background: rgba(16,23,26,.92); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border-mid); }
  .cmp-nav b { font-family: var(--mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--text-faint); margin-right: 6px; }
  .cmp-nav a { font-family: var(--mono); font-size: 12.5px; color: var(--text-body);
    border: 1px solid var(--border-acc); border-radius: 999px; padding: 7px 14px; }
  .cmp-nav a:hover { color: var(--accent-ink); background: var(--accent); border-color: var(--accent); }
  /* превью показываем без анимаций появления */
  .mech { opacity: 1 !important; transform: none !important; }
  .video { cursor: default; }
</style>
</head>
<body>
<nav class="cmp-nav"><b>Живая обложка</b>%s</nav>
%s
</body>
</html>
"""

nav = ''.join('<a href="#v%d">%d · %s</a>' % (i, i, v[2])
              for i, v in enumerate(VARIANTS, 1))
out = SHELL % (head_links(doc), styles(doc), nav, '\n'.join(cards))

# страница лежит в docs/preview, картинки блока — в system_design
out = re.sub(r'(src|srcset|poster)="(?!https?:|/|data:|gif-)', r'\1="../../system_design/', out)

io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, вариантов: %d, размер: %.0f КБ'
      % (OUT, len(VARIANTS), len(out.encode()) / 1024))
