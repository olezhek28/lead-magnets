# -*- coding: utf-8 -*-
"""Собирает system_design/video-variants.html — сравнение подач видеоблока.

Заказчик считает статичную обложку видеопродажника безжизненной. Здесь три
живых варианта на реальных ассетах: как сейчас (статика), сплит «текст +
зацикленное превью» и превью во всю ширину блока.

Стили берутся прямо из index.html (все <style> копируются целиком), как в
scripts/designs-block06.py и scripts/compare-blocks.py, — чтобы страница
сравнения выглядела ровно как сайт и не расходилась с ним при правках.

Пересборка: python3 scripts/video-variants.py (из корня репозитория).
"""
import io, re

PAGE = 'system_design/index.html'
OUT = 'system_design/video-variants.html'
doc = io.open(PAGE, encoding='utf-8').read()
styles = '\n'.join(m.group(0) for m in re.finditer(r'<style>.*?</style>', doc, re.S))
fonts = '\n'.join(m.group(0) for m in re.finditer(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', doc))

PLAY = ('<span class="video__play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
        '<path d="M8 5v14l11-7z"></path></svg></span>')

# Живое превью: <video autoplay muted loop playsinline> поверх той же картинки-постера.
# Картинка лежит снизу и видна, пока видео не прогрузилось, а при
# prefers-reduced-motion видео прячется совсем и остаётся только она.
LOOP = ("""<span class="video__thumb">
              <img class="video__poster" src="sd-video-loop-poster.jpg" alt="" width="1280" height="720" loading="lazy">
              <video class="video__loop" src="sd-video-loop.webm" poster="sd-video-loop-poster.jpg"
                     autoplay muted loop playsinline preload="metadata" aria-hidden="true"
                     width="1280" height="720"
                     data-mp4="sd-video-loop.mp4"></video>
              %s
            </span>""" % PLAY)

STATIC = ("""<span class="video__thumb">
              <picture><source srcset="sd-video-poster.webp" type="image/webp"><img class="video__poster" src="sd-video-poster.jpg" alt="" width="1920" height="1080" loading="lazy"></picture>
              %s
            </span>""" % PLAY)

ARIA = 'aria-label="Смотреть видео: почему валятся на System Design, 8 минут"'


def v_static():
    return """
      <button type="button" class="video v1-video" %s>
            %s
      </button>""" % (ARIA, STATIC)


def v_split():
    return """
      <div class="vv-split">
        <div class="vv-split__text">
          <span class="vv-kicker">видео · 8 минут</span>
          <h3 class="vv-split__title">Почему не&nbsp;получается пройти сисдиз</h3>
          <p class="vv-split__desc">Разбираю ошибки, из-за которых валятся на&nbsp;секции чаще всего:
          бросаются рисовать, не&nbsp;уточнив требования, не&nbsp;считают нагрузку и&nbsp;выбирают базу наугад.</p>
          <p class="vv-split__desc">Разбор на&nbsp;живых примерах с&nbsp;собеседований. Восемь минут&nbsp;— и&nbsp;понятно,
          что именно чинить в&nbsp;своём ответе.</p>
          <span class="vv-split__cta">Смотреть разбор <span aria-hidden="true">&rarr;</span></span>
        </div>
        <button type="button" class="video vv-split__video" %s>
            %s
        </button>
      </div>""" % (ARIA, LOOP)


def v_wide():
    return """
      <button type="button" class="video vv-wide" %s>
            %s
      </button>
      <p class="vv-wide__cap">8&nbsp;минут · самые частые ошибки на&nbsp;секции</p>""" % (ARIA, LOOP)


VARIANTS = [
 ('Вариант 1 · как сейчас: статичная обложка',
  'Ровно то, что стоит на лендинге: картинка sd-video-poster.jpg и круглая кнопка play. '
  'Кадр красивый, но неподвижный — глаз проходит мимо и не понимает, что там вообще внутри.', v_static()),
 ('Вариант 2 · сплит: текст слева, живое превью справа',
  'Слева короткий текст — о чём ролик и сколько идёт, справа зацикленный кусок из самого ролика с кнопкой play. '
  'Движение цепляет взгляд, текст сразу отвечает «зачем мне эти 8 минут». Блок шире и ниже, чем сейчас.', v_split()),
 ('Вариант 3 · живое превью во всю ширину',
  'Тот же зацикленный кусок, но без текста и во всю ширину контентной колонки. '
  'Максимум внимания на картинку, подпись про 8 минут уехала вниз мелкой строкой.', v_wide()),
]

body = []
for i, (title, note, markup) in enumerate(VARIANTS, 1):
    body.append("""
  <section class="vr" id="v%d">
    <div class="vr__head"><h2>%s</h2></div>
    <p class="vr__note">%s</p>
    <div class="vr__stage"><section class="section"><div class="mech">%s</div></section></div>
  </section>""" % (i, title, note, markup))

SHELL = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>System Design · подача видеоблока: три варианта</title>
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
  .vr__stage .mech { padding: 0; }

  /* Живое превью: видео ложится ровно на место постера, тем же object-fit. */
  .video__loop { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block; }

  /* 2 — сплит */
  .vv-split { display: grid; grid-template-columns: 1fr 1.15fr; gap: 34px; align-items: center;
              background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: var(--r-lg);
              padding: 30px; margin-bottom: 36px; }
  .vv-split__text { display: grid; gap: 12px; justify-items: start; align-content: center; }
  .vv-kicker { font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
               color: var(--accent); border: 1px solid rgba(223,223,65,.3); border-radius: 5px; padding: 5px 9px; }
  .vv-split__title { font-family: var(--display); font-size: 25px; font-weight: 500; letter-spacing: -.03em;
                     line-height: 1.2; color: var(--text-h); margin: 4px 0 0; }
  .vv-split__desc { color: var(--text-mute); font-size: 15px; line-height: 1.6; margin: 0; }
  .vv-split__cta { font-family: var(--mono); font-size: 12.5px; color: var(--accent); margin-top: 6px; }
  .vv-split__video { width: 100%; }

  /* 3 — во всю ширину */
  .vv-wide { width: 100%; margin: 0 0 12px; }
  .vv-wide__cap { font-family: var(--mono); font-size: 12px; color: var(--text-faint); margin: 0 0 36px; text-align: center; }

  @media (max-width: 860px) {
    .vv-split { grid-template-columns: 1fr; gap: 22px; padding: 22px; }
    .vv-split__title { font-size: 22px; }
  }

  /* Уважаем prefers-reduced-motion: крутить видео нельзя, остаётся постер. */
  @media (prefers-reduced-motion: reduce) {
    .video__loop { display: none; }
  }
</style>
</head>
<body class="anim-ready">
  <div class="vr-top">
    <h1>Видеоблок: три подачи</h1>
    <p>Ролик и ссылка одни и те же, меняется только превью. <b>Вариант 1</b> — то, что сейчас на лендинге,
    <b>2</b> и <b>3</b> — живое зацикленное превью (5,5&nbsp;секунды из начала ролика, webm 381&nbsp;КБ, mp4-фолбэк 569&nbsp;КБ, без звука).
    Клик в макете никуда не ведёт: на лендинге он открывает модалку с плеером.</p>
    <p>Превью — <b>autoplay muted loop playsinline</b> с постером. При системной настройке
    «уменьшить движение» видео не проигрывается, показывается статичный кадр.</p>
    <nav class="vr-nav">
      <a href="#v1">1 · как сейчас</a><a href="#v2">2 · сплит</a><a href="#v3">3 · во всю ширину</a>
    </nav>
  </div>
@@BODY@@
<script>
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.video__loop').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    // Safari до 16 не умеет VP9 в webm — подсовываем mp4-фолбэк.
    if (!v.canPlayType('video/webm; codecs="vp9"')) { v.src = v.dataset.mp4; }
    var p = v.play();
    if (p && p.catch) { p.catch(function () {}); }
  });
})();
</script>
</body>
</html>
"""
out = SHELL.replace('@@FONTS@@', fonts).replace('@@STYLES@@', styles).replace('@@BODY@@', '\n'.join(body))
io.open(OUT, 'w', encoding='utf-8').write(out)
print('готово: %s, %.0f КБ' % (OUT, len(out.encode()) / 1024))
