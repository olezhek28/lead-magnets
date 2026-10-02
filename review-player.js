// Публичный плеер платформы загружается только при открытии отзыва.
// Удаление iframe при закрытии останавливает видео и освобождает CDN-загрузку.
(function () {
  'use strict';

  document.querySelectorAll('.modal--vt').forEach(function (modal) {
    var host = modal.querySelector('[data-review-embed]');
    if (!host) return;

    function update() {
      if (modal.hidden) {
        host.replaceChildren();
        return;
      }
      if (host.querySelector('iframe')) return;

      var frame = document.createElement('iframe');
      frame.className = 'vt__video';
      frame.src = host.dataset.reviewEmbed;
      frame.title = host.dataset.reviewTitle;
      frame.allow = 'fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      host.replaceChildren(frame);
    }

    new MutationObserver(update).observe(modal, {
      attributes: true,
      attributeFilter: ['hidden']
    });
    update();
  });

  // Клавиатурные события из iframe не всплывают в родительский документ.
  // Принимаем Escape только от нашего открытого плеера с ожидаемого origin.
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'review-player:close') return;
    var modal = document.querySelector('.modal--vt:not([hidden])');
    if (!modal) return;
    var frame = modal.querySelector('[data-review-embed] iframe');
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.origin !== new URL(frame.src).origin) return;
    var close = modal.querySelector('[data-modal-close].modal__close');
    if (close) close.click();
  });

  // Tab из документа iframe может перейти сразу на фон лендинга: родительский
  // keydown этого не видит. Возвращаем такой переход на кнопку закрытия модалки.
  document.addEventListener('focusin', function (event) {
    var modal = document.querySelector('.modal--vt:not([hidden])');
    if (!modal || modal.contains(event.target)) return;
    var close = modal.querySelector('[data-modal-close].modal__close');
    if (close) close.focus();
  });
})();
