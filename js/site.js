(function () {
  'use strict';
  var CAL = 'https://calendly.com/bridgepointventures-info/30min';
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  function bookUrl(topic) {
    return CAL + '?a1=' + encodeURIComponent('Topic: ' + topic);
  }

  // Hero video: only play when motion is welcome
  var v = document.getElementById('heroVideo');
  if (v && !reduce && !saveData) {
    v.setAttribute('autoplay', '');
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  }

  // Intro wordmark
  setTimeout(function () { body.classList.add('ready'); }, reduce ? 0 : 200);

  // Count-up
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Scenes: crossfade the backdrop and reveal content
  var scenes = [].slice.call(document.querySelectorAll('[data-scene]'));
  var plates = [].slice.call(document.querySelectorAll('.plate'));
  var heroDelay = reduce ? 0 : 2300;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target, i = +s.dataset.scene;
        if (i <= 2) plates.forEach(function (pl) { pl.classList.toggle('on', +pl.dataset.plate === i); });
        body.classList.toggle('solid-bg', i >= 3);
        setTimeout(function () {
          s.classList.add('in');
          s.querySelectorAll('.count').forEach(countUp);
        }, i === 0 ? heroDelay : 0);
      });
    }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
    scenes.forEach(function (s) { io.observe(s); });
  } else {
    scenes.forEach(function (s) { s.classList.add('in'); });
  }

  // Ventures rail drifts sideways on desktop
  var rail = document.getElementById('rail'), vs = document.getElementById('ventures');
  function onScroll() {
    body.classList.toggle('scrolled', window.scrollY > 40);
    if (!rail || reduce || window.innerWidth <= 900) return;
    var r = vs.getBoundingClientRect();
    var k = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / window.innerHeight));
    var over = Math.max(0, rail.scrollWidth - rail.clientWidth);
    rail.style.transform = over > 0 ? 'translateX(' + (80 - k * (80 + over)) + 'px)' : 'none';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Venture cards prefill the booking topic
  document.querySelectorAll('.card[data-topic], .who-row[data-topic]').forEach(function (a) {
    a.href = bookUrl(a.dataset.topic);
  });

  // Topic chooser
  var book = document.getElementById('bookBtn');
  var chips = [].slice.call(document.querySelectorAll('.topic'));
  function pick(btn) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'); });
    var t = btn.dataset.topic;
    if (book) {
      book.href = bookUrl(t);
      book.firstChild.nodeValue = t === 'Something else' ? 'Book a 30-minute call ' : 'Book a call about ' + t + ' ';
    }
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { pick(c); }); });
  if (chips[0]) pick(chips[0]);

  // std spotlight: gold light follows the pointer on desktop
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.standards li').forEach(function (li) {
      li.addEventListener('pointermove', function (e) {
        var r = li.getBoundingClientRect();
        li.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        li.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }


  // Mobile menu
  var mbtn = document.querySelector('.menu-btn'), mnav = document.getElementById('mnav');
  if (mbtn && mnav) {
    var setMenu = function (open) {
      body.classList.toggle('menu-open', open);
      mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mbtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) { var f = mnav.querySelector('a'); if (f) f.focus(); } else { mbtn.focus(); }
    };
    mbtn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false); });
  }

  // Collapsible panels (founder credentials, who we work with)
  document.querySelectorAll('.more-btn').forEach(function (mb) {
    var mp = document.getElementById(mb.getAttribute('aria-controls'));
    if (!mp) return;
    mb.addEventListener('click', function () {
      var open = mb.getAttribute('aria-expanded') !== 'true';
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mp.classList.toggle('open', open);
      mb.querySelector('.more-label').textContent = open ? mb.dataset.open : mb.dataset.closed;
    });
  });
})();
