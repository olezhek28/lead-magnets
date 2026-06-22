/**
 * Cookie consent + Yandex.Metrika
 * Используется на лендинге менторства. Подключается через:
 *   <script src="/consent.js" defer></script>
 *
 * Поведение:
 *   - При первом визите показывается баннер: Принять / Отклонить / Настроить
 *   - «Принять» — все категории = true, грузится Метрика
 *   - «Отклонить» — все категории = false, Метрика не грузится
 *   - «Настроить» — модалка с тогглами Аналитические / Рекламные.
 *     Обязательные cookies всегда вкл (бейдж «Всегда разрешено»).
 *     Кнопка «Ок» сохраняет выбор.
 *   - Выбор сохраняется в localStorage и баннер больше не показывается.
 */
(function () {
  'use strict';

  var COUNTER_ID = 96022201;
  var STORAGE_KEY = 'cookieConsent.v2';

  // ====== Styles ======
  var style = document.createElement('style');
  style.textContent = [
    /* Banner */
    '.cc-banner{position:fixed;bottom:24px;left:24px;max-width:420px;background:rgba(34,40,45,.97);' ,
    'backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);' ,
    'border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:22px 24px;z-index:9999;' ,
    'box-shadow:0 20px 60px rgba(0,0,0,.5);' ,
    'font-family:"Manrope",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' ,
    'color:#BFC4C7;font-size:14px;line-height:1.55;' ,
    'transform:translateY(calc(100% + 40px));opacity:0;' ,
    'transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s ease;}' ,
    '.cc-banner.show{transform:translateY(0);opacity:1;}' ,
    '.cc-banner__title{color:#fff;font-weight:600;font-size:16px;margin-bottom:8px;letter-spacing:-.2px;}' ,
    '.cc-banner__text{color:#BFC4C7;margin-bottom:18px;font-size:13.5px;}' ,
    '.cc-banner__buttons{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}' ,
    '.cc-btn{padding:10px 20px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:background .2s,color .2s,border-color .2s;}' ,
    '.cc-btn--accept{background:#DFDF41;color:#002D25;}' ,
    '.cc-btn--accept:hover{background:#fff;}' ,
    '.cc-btn--decline{background:transparent;color:#BFC4C7;border:1px solid rgba(255,255,255,.22);}' ,
    '.cc-btn--decline:hover{border-color:rgba(255,255,255,.45);color:#fff;}' ,
    '.cc-btn--settings{background:transparent;color:#8C9296;padding:10px 8px;}' ,
    '.cc-btn--settings:hover{color:#fff;}' ,

    /* Modal */
    '.cc-modal{position:fixed;inset:0;background:rgba(10,13,14,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .25s ease;}' ,
    '.cc-modal.show{opacity:1;pointer-events:auto;}' ,
    '.cc-modal__inner{background:#22282D;border:1px solid rgba(255,255,255,.10);border-radius:22px;max-width:560px;width:100%;max-height:90vh;overflow:auto;color:#BFC4C7;font-family:"Manrope",system-ui,sans-serif;font-size:14px;line-height:1.55;transform:translateY(20px);transition:transform .35s cubic-bezier(.22,1,.36,1);}' ,
    '.cc-modal.show .cc-modal__inner{transform:translateY(0);}' ,
    '.cc-modal__head{display:flex;align-items:center;gap:14px;padding:22px 26px 18px;border-bottom:1px solid rgba(255,255,255,.06);}' ,
    '.cc-modal__back{background:transparent;border:none;color:#BFC4C7;font-size:20px;cursor:pointer;padding:4px;display:inline-flex;align-items:center;justify-content:center;}' ,
    '.cc-modal__back:hover{color:#fff;}' ,
    '.cc-modal__head-label{color:#8C9296;font-size:14px;}' ,
    '.cc-modal__body{padding:26px;}' ,
    '.cc-modal__title{color:#fff;font-size:22px;font-weight:600;margin-bottom:12px;letter-spacing:-.3px;}' ,
    '.cc-modal__lede{color:#BFC4C7;font-size:14px;margin-bottom:22px;line-height:1.6;}' ,
    '.cc-row{display:flex;align-items:center;justify-content:space-between;padding:18px 0;border-top:1px solid rgba(255,255,255,.06);gap:14px;}' ,
    '.cc-row:last-of-type{border-bottom:1px solid rgba(255,255,255,.06);}' ,
    '.cc-row__name{color:#fff;font-size:15px;font-weight:500;display:flex;align-items:center;gap:8px;}' ,
    '.cc-row__name::before{content:"+";color:#5A6164;font-weight:300;font-size:18px;}' ,
    '.cc-row__right{display:flex;align-items:center;gap:14px;}' ,
    '.cc-row__status{color:#8C9296;font-size:13px;}' ,
    '.cc-row--always .cc-row__status{color:#fff;}' ,
    /* Toggle */
    '.cc-toggle{position:relative;width:44px;height:24px;background:rgba(255,255,255,.10);border-radius:100px;cursor:pointer;border:none;padding:0;transition:background .2s ease;flex-shrink:0;}' ,
    '.cc-toggle::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s ease;}' ,
    '.cc-toggle.on{background:#DFDF41;}' ,
    '.cc-toggle.on::after{transform:translateX(20px);background:#002D25;}' ,
    '.cc-toggle--locked{opacity:.6;cursor:not-allowed;}' ,
    '.cc-modal__footer{padding:18px 26px 22px;display:flex;justify-content:flex-start;}' ,
    '.cc-modal__ok{background:rgba(255,255,255,.06);color:#fff;padding:10px 26px;border-radius:100px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,.12);cursor:pointer;font-family:inherit;transition:background .2s ease;}' ,
    '.cc-modal__ok:hover{background:rgba(255,255,255,.12);}' ,

    /* Mobile */
    '@media (max-width:640px){.cc-banner{left:14px;right:14px;bottom:14px;max-width:none;padding:18px 20px;}' ,
    '.cc-modal__body{padding:20px;}.cc-modal__head{padding:18px 20px 14px;}.cc-modal__footer{padding:14px 20px 18px;}}'
  ].join('');
  document.head.appendChild(style);

  // ====== Yandex.Metrika loader ======
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

  function saveConsent(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function applyConsent(state) {
    if (state && state.analytics) loadMetrika();
  }

  // ====== Banner ======
  function buildBanner() {
    var b = document.createElement('div');
    b.className = 'cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Параметры cookies');
    b.innerHTML =
      '<div class="cc-banner__title">Параметры cookies</div>' +
      '<div class="cc-banner__text">Я&nbsp;собираю cookies и&nbsp;провожу анализ через Яндекс.Метрику, чтобы тебе было комфортно находиться на&nbsp;сайте&nbsp;:)</div>' +
      '<div class="cc-banner__buttons">' +
      '<button class="cc-btn cc-btn--accept" type="button" data-act="accept">Принять</button>' +
      '<button class="cc-btn cc-btn--decline" type="button" data-act="decline">Отклонить</button>' +
      '<button class="cc-btn cc-btn--settings" type="button" data-act="settings">Настроить</button>' +
      '</div>';
    return b;
  }

  function hideBanner(banner) {
    banner.classList.remove('show');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 450);
  }

  // ====== Modal ======
  function buildModal(currentState) {
    var m = document.createElement('div');
    m.className = 'cc-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-label', 'Настройки cookie');
    m.innerHTML =
      '<div class="cc-modal__inner">' +
        '<div class="cc-modal__head">' +
          '<button class="cc-modal__back" type="button" aria-label="Назад">←</button>' +
          '<span class="cc-modal__head-label">Параметры cookies</span>' +
        '</div>' +
        '<div class="cc-modal__body">' +
          '<h2 class="cc-modal__title">Настройки cookie</h2>' +
          '<p class="cc-modal__lede">Файлы cookie, необходимые для&nbsp;правильной работы сайта, всегда включены. Настройки остальных файлов cookie можно изменять.</p>' +
          '<div class="cc-row cc-row--always">' +
            '<div class="cc-row__name">Обязательные cookies</div>' +
            '<div class="cc-row__right">' +
              '<span class="cc-row__status">Всегда разрешено</span>' +
            '</div>' +
          '</div>' +
          '<div class="cc-row" data-cat="analytics">' +
            '<div class="cc-row__name">Аналитические cookies</div>' +
            '<div class="cc-row__right">' +
              '<span class="cc-row__status">' + (currentState.analytics ? 'Разрешено' : 'Запрещено') + '</span>' +
              '<button class="cc-toggle ' + (currentState.analytics ? 'on' : '') + '" type="button" data-toggle="analytics" aria-pressed="' + currentState.analytics + '"></button>' +
            '</div>' +
          '</div>' +
          '<div class="cc-row" data-cat="advertising">' +
            '<div class="cc-row__name">Рекламные cookies</div>' +
            '<div class="cc-row__right">' +
              '<span class="cc-row__status">' + (currentState.advertising ? 'Разрешено' : 'Запрещено') + '</span>' +
              '<button class="cc-toggle ' + (currentState.advertising ? 'on' : '') + '" type="button" data-toggle="advertising" aria-pressed="' + currentState.advertising + '"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cc-modal__footer">' +
          '<button class="cc-modal__ok" type="button" data-act="ok">Ок</button>' +
        '</div>' +
      '</div>';
    return m;
  }

  function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(function () {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 300);
  }

  // ====== UI flow ======
  function showBanner() {
    var banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('show'); });
    });

    banner.addEventListener('click', function (e) {
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (!act) return;

      if (act === 'accept') {
        var state = { analytics: true, advertising: true };
        saveConsent(state);
        applyConsent(state);
        hideBanner(banner);
      } else if (act === 'decline') {
        var state2 = { analytics: false, advertising: false };
        saveConsent(state2);
        hideBanner(banner);
      } else if (act === 'settings') {
        hideBanner(banner);
        openSettings({ analytics: false, advertising: false });
      }
    });
  }

  function openSettings(initialState) {
    var state = { analytics: !!initialState.analytics, advertising: !!initialState.advertising };
    var modal = buildModal(state);
    document.body.appendChild(modal);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add('show'); });
    });

    function updateRowStatus(cat, value) {
      var row = modal.querySelector('[data-cat="' + cat + '"]');
      if (!row) return;
      var status = row.querySelector('.cc-row__status');
      var toggle = row.querySelector('.cc-toggle');
      if (status) status.textContent = value ? 'Разрешено' : 'Запрещено';
      if (toggle) {
        toggle.classList.toggle('on', value);
        toggle.setAttribute('aria-pressed', String(value));
      }
    }

    modal.addEventListener('click', function (e) {
      var toggleCat = e.target && e.target.getAttribute && e.target.getAttribute('data-toggle');
      if (toggleCat) {
        state[toggleCat] = !state[toggleCat];
        updateRowStatus(toggleCat, state[toggleCat]);
        return;
      }
      if (e.target.classList && e.target.classList.contains('cc-modal__back')) {
        hideModal(modal);
        showBanner();
        return;
      }
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'ok') {
        saveConsent(state);
        applyConsent(state);
        hideModal(modal);
        return;
      }
      // click on overlay (вне inner) — закрыть без сохранения
      if (e.target === modal) {
        hideModal(modal);
        showBanner();
      }
    });
  }

  // ====== Init ======
  function init() {
    var saved = loadConsent();
    if (saved) {
      applyConsent(saved);
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();
})();
