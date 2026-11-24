/* Light/dark toggle. The inline script in <head> applies a saved choice before first
   paint; this file wires the header button. Without a saved choice the theme follows
   the system setting (see tokens.css). Storage can be blocked, so every access is guarded. */
(function () {
  'use strict';

  var root = document.documentElement;
  var button = document.querySelector('.theme-toggle');
  if (!button) return;

  var system = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    return root.getAttribute('data-theme') || (system.matches ? 'dark' : 'light');
  }

  function refreshLabel() {
    var next = current() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  button.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      /* the choice just will not persist */
    }
    refreshLabel();
  });

  if (system.addEventListener) system.addEventListener('change', refreshLabel);
  refreshLabel();
})();
