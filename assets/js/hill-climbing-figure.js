/* Hill-climbing figure.
   Draws a rugged ridge into [data-hill-climbing] and animates a climber that always
   steps to the higher neighbouring point (greedy hill climbing). It usually stops on a
   local peak; starting somewhere else shows why restarts help.
   Needs ridge-profile.js. Honours prefers-reduced-motion by skipping the animation. */
(function () {
  'use strict';

  var host = document.querySelector('[data-hill-climbing]');
  if (!host || !window.RidgeProfile) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var W = 360;
  var H = 250;
  var PAD_X = 12;
  var TOP = 42;
  var BOTTOM = 20;
  var SAMPLES = 241;
  var FIRST_START = 0.34; // fixed first start: it ends on a local peak, not the summit
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var profile = window.RidgeProfile.sample(SAMPLES);
  var elevation = profile.elevation;
  var last = SAMPLES - 1;
  var climbs = 0;
  var best = 0;
  var running = false;
  var visited = {}; // peaks already reached, so a new start tries a different slope

  function px(i) { return PAD_X + (i / last) * (W - 2 * PAD_X); }
  function py(e) { return H - BOTTOM - e * (H - BOTTOM - TOP); }
  function num(v) { return v.toFixed(1); }
  function pt(i) { return num(px(i)) + ',' + num(py(elevation[i])); }
  function pct(e) { return Math.round(e * 100); }

  function make(tag, attrs, parent) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ---- drawing ---- */

  var svg = make('svg', {
    'class': 'ridge__svg',
    viewBox: '0 0 ' + W + ' ' + H,
    role: 'img',
    'aria-label': 'A mountain ridge with ' + profile.peaks.length +
      ' peaks. A climber walks uphill from a starting point and stops on the nearest peak.'
  });

  var gradient = make('linearGradient', { id: 'ridge-fill', x1: 0, y1: 0, x2: 0, y2: 1 },
    make('defs', {}, svg));
  make('stop', { offset: '0%', 'class': 'ridge__stop-top' }, gradient);
  make('stop', { offset: '100%', 'class': 'ridge__stop-bottom' }, gradient);

  var outline = 'M' + pt(0);
  for (var i = 1; i <= last; i++) outline += 'L' + pt(i);
  var baseY = num(H - BOTTOM);
  make('path', {
    'class': 'ridge__area',
    fill: 'url(#ridge-fill)',
    d: outline + 'L' + num(px(last)) + ',' + baseY + 'L' + num(px(0)) + ',' + baseY + 'Z'
  }, svg);
  make('line', { 'class': 'ridge__base', x1: PAD_X, x2: W - PAD_X, y1: baseY, y2: baseY }, svg);
  make('path', { 'class': 'ridge__line', d: outline }, svg);

  profile.peaks.forEach(function (index) {
    if (index === profile.summit) return;
    make('circle', { 'class': 'ridge__peak', cx: num(px(index)), cy: num(py(elevation[index])), r: 3 }, svg);
  });

  var sx = px(profile.summit);
  var sy = py(1);
  var flag = make('g', { 'class': 'ridge__flag' }, svg);
  make('line', { x1: num(sx), y1: num(sy), x2: num(sx), y2: num(sy - 20) }, flag);
  make('path', {
    d: 'M' + num(sx) + ',' + num(sy - 20) + 'L' + num(sx + 12) + ',' + num(sy - 15.5) +
      'L' + num(sx) + ',' + num(sy - 11) + 'Z'
  }, flag);
  make('text', { 'class': 'ridge__label', x: num(sx), y: num(sy - 26), 'text-anchor': 'middle' }, flag)
    .textContent = 'summit';

  var trail = make('path', { 'class': 'ridge__trail', d: '' }, svg);
  var startMark = make('circle', { 'class': 'ridge__start', r: 7.5 }, svg);
  var climber = make('circle', { 'class': 'ridge__climber', r: 4.5 }, svg);

  /* ---- caption and control ---- */

  var figure = document.createElement('figure');
  figure.className = 'ridge';
  var caption = document.createElement('figcaption');
  caption.className = 'ridge__caption';
  var intro = document.createElement('p');
  intro.textContent = 'Hill climbing: from the open circle, always step uphill, and watch where it stops.';
  var status = document.createElement('p');
  status.className = 'ridge__status';
  status.setAttribute('role', 'status');
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'ridge__button';
  button.textContent = 'Climb from a new start';
  caption.appendChild(intro);
  caption.appendChild(status);
  caption.appendChild(button);
  figure.appendChild(svg);
  figure.appendChild(caption);
  host.appendChild(figure);

  /* ---- behaviour ---- */

  function place(index) {
    var cx = num(px(index));
    var cy = num(py(elevation[index]));
    startMark.setAttribute('cx', cx);
    startMark.setAttribute('cy', cy);
    climber.setAttribute('cx', cx);
    climber.setAttribute('cy', cy);
    trail.setAttribute('d', '');
  }

  function show(path, upTo) {
    var d = 'M' + pt(path[0]);
    for (var k = 1; k <= upTo; k++) d += 'L' + pt(path[k]);
    trail.setAttribute('d', d);
    climber.setAttribute('cx', num(px(path[upTo])));
    climber.setAttribute('cy', num(py(elevation[path[upTo]])));
  }

  function report(end) {
    climbs += 1;
    visited[end] = true;
    best = Math.max(best, elevation[end]);
    var text = end === profile.summit
      ? 'Reached the summit.'
      : 'Stopped on a local peak, ' + pct(elevation[end]) + '% of the way up.';
    text += climbs > 1 ? ' Best so far: ' + pct(best) + '%.' : ' Try another start.';
    status.textContent = text;
  }

  function run(startIndex, animate) {
    var path = window.RidgeProfile.climb(elevation, startIndex);
    var end = path[path.length - 1];
    running = true;
    button.disabled = true;
    status.textContent = '';
    place(startIndex);

    function finish() {
      running = false;
      button.disabled = false;
      report(end);
    }

    if (!animate) {
      show(path, path.length - 1);
      finish();
      return;
    }

    var began = null;
    var duration = Math.min(2400, 500 + path.length * 30);
    function tick(now) {
      if (began === null) began = now;
      var t = Math.min(1, (now - began) / duration);
      var eased = t * t * (3 - 2 * t);
      show(path, Math.round(eased * (path.length - 1)));
      if (t < 1) window.requestAnimationFrame(tick);
      else finish();
    }
    window.requestAnimationFrame(tick);
  }

  // Pick a start whose climb ends on a peak not reached yet; once every peak has been
  // reached, begin a fresh round.
  function nextStart() {
    for (var tries = 0; tries < 80; tries++) {
      var candidate = 6 + Math.floor(Math.random() * (SAMPLES - 12));
      var path = window.RidgeProfile.climb(elevation, candidate);
      if (!visited[path[path.length - 1]]) return candidate;
    }
    visited = {};
    return 6 + Math.floor(Math.random() * (SAMPLES - 12));
  }

  button.addEventListener('click', function () {
    if (!running) run(nextStart(), !reduceMotion);
  });

  var firstStart = Math.round(FIRST_START * last);
  place(firstStart);

  function begin() { run(firstStart, !reduceMotion); }

  // Wait until the figure is on screen so the first climb is actually seen.
  if (reduceMotion || !('IntersectionObserver' in window)) {
    begin();
  } else {
    var watcher = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      watcher.disconnect();
      window.setTimeout(begin, 500);
    }, { threshold: 0.6 });
    watcher.observe(figure);
  }
})();
