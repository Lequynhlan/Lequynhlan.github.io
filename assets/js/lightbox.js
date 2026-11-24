/* Click-to-zoom lightbox for [data-lightbox] galleries.
   Every photo is a plain link to the full-size image, so the gallery still works without
   JavaScript. Keys: Esc closes, left/right arrows move between photos, Tab stays inside. */
(function () {
  'use strict';

  var gallery = document.querySelector('[data-lightbox]');
  if (!gallery) return;
  var links = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item a'));
  if (!links.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');

  function makeButton(className, label, glyph) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'lightbox__btn ' + className;
    button.setAttribute('aria-label', label);
    button.textContent = glyph;
    return button;
  }

  var close = makeButton('lightbox__close', 'Close', '×');
  var prev = makeButton('lightbox__prev', 'Previous photo', '‹');
  var next = makeButton('lightbox__next', 'Next photo', '›');
  var image = document.createElement('img');
  var caption = document.createElement('p');
  caption.className = 'lightbox__caption';

  [close, prev, next, image, caption].forEach(function (node) { box.appendChild(node); });
  document.body.appendChild(box);

  var index = 0;
  var opener = null;

  function show(i) {
    index = (i + links.length) % links.length;
    var link = links[index];
    var thumb = link.querySelector('img');
    var figcaption = link.parentNode.querySelector('figcaption');
    image.src = link.getAttribute('href');
    image.alt = thumb ? thumb.alt : '';
    caption.textContent = figcaption ? figcaption.textContent : '';
  }

  function open(i, from) {
    opener = from;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function hide() {
    box.hidden = true;
    document.body.style.overflow = '';
    image.removeAttribute('src');
    if (opener) opener.focus();
  }

  links.forEach(function (link, i) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      open(i, link);
    });
  });

  close.addEventListener('click', hide);
  prev.addEventListener('click', function () { show(index - 1); });
  next.addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (event) { if (event.target === box) hide(); });

  document.addEventListener('keydown', function (event) {
    if (box.hidden) return;
    if (event.key === 'Escape') {
      hide();
    } else if (event.key === 'ArrowLeft') {
      show(index - 1);
    } else if (event.key === 'ArrowRight') {
      show(index + 1);
    } else if (event.key === 'Tab') {
      var order = [close, prev, next];
      var at = order.indexOf(document.activeElement);
      var step = event.shiftKey ? -1 : 1;
      order[(at + step + order.length) % order.length].focus();
      event.preventDefault();
    }
  });
})();
