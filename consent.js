/**
 * Cookie consent + Yandex.Metrika
 * Единая точка управления аналитикой и баннером согласия.
 * Подключается на каждой странице через: <script src="/consent.js" defer></script>
 */
(function () {
  'use strict';

  var COUNTER_ID = 96022201;
  var STORAGE_KEY = 'cookieConsent';

  // ====== Styles (inject once) ======
  var style = document.createElement('style');
  style.textContent =
    '.cookie-consent{position:fixed;bottom:24px;left:24px;max-width:380px;background:rgba(34,40,45,.96);' +
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
    'border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:20px 22px;z-index:9999;' +
    'box-shadow:0 20px 60px rgba(0,0,0,.5);' +
    'font-family:"Manrope",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
    'color:#BFC4C7;font-size:14px;line-height:1.55;' +
    'transform:translateY(calc(100% + 40px));opacity:0;' +
    'transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s ease;}' +
    '.cookie-consent.show{transform:translateY(0);opacity:1;}' +
    '.cookie-consent__title{color:#fff;font-weight:600;font-size:15px;margin-bottom:8px;letter-spacing:-.1px;}' +
    '.cookie-consent__text{color:#BFC4C7;margin-bottom:16px;font-size:13.5px;}' +
    '.cookie-consent__buttons{display:flex;gap:8px;}' +
    '.cookie-consent__btn{padding:9px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;' +
    'border:none;font-family:inherit;transition:background .2s ease,color .2s ease,border-color .2s ease;}' +
    '.cookie-consent__btn--accept{background:#DFDF41;color:#002D25;}' +
    '.cookie-consent__btn--accept:hover{background:#fff;}' +
    '.cookie-consent__btn--decline{background:transparent;color:#BFC4C7;border:1px solid rgba(255,255,255,.18);}' +
    '.cookie-consent__btn--decline:hover{border-color:rgba(255,255,255,.4);color:#fff;}' +
    '@media (max-width:640px){.cookie-consent{left:16px;right:16px;bottom:16px;max-width:none;}}';
  document.head.appendChild(style);

  // ====== Load Yandex.Metrika ======
  function loadMetrika() {
    if (window.__metrikaLoaded) return;
    window.__metrikaLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < e.scripts.length; j++) {
        if (e.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    ym(COUNTER_ID, 'init', {
      webvisor: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    });
  }

  // ====== Show banner ======
  function showBanner() {
    var banner = document.createElement('div');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Параметры cookies');
    banner.innerHTML =
      '<div class="cookie-consent__title">Параметры cookies</div>' +
      '<div class="cookie-consent__text">Я&nbsp;собираю cookies и&nbsp;провожу анализ через Яндекс.Метрику, чтобы тебе было комфортно находиться на&nbsp;сайте&nbsp;:)</div>' +
      '<div class="cookie-consent__buttons">' +
      '<button class="cookie-consent__btn cookie-consent__btn--accept" type="button">Принять</button>' +
      '<button class="cookie-consent__btn cookie-consent__btn--decline" type="button">Отклонить</button>' +
      '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('show'); });
    });

    function hide() {
      banner.classList.remove('show');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 450);
    }

    banner.querySelector('.cookie-consent__btn--accept').addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch (e) {}
      hide();
      loadMetrika();
    });

    banner.querySelector('.cookie-consent__btn--decline').addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch (e) {}
      hide();
    });
  }

  // ====== Init ======
  function init() {
    var consent = null;
    try { consent = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (consent === 'accepted') {
      loadMetrika();
    } else if (!consent) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }
    // 'declined' → ничего не делаем
  }

  init();
})();
