// ============================================
// POORNA SUJAMPATHI — INTERACTIVE UI ENGINE
// ============================================

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Hero ticket fills in once, then gets stamped */
  var rows = document.querySelectorAll('.ticket .row');
  var stamp = document.getElementById('stamp');
  if (stamp && rows.length > 0) {
    if (reduce) {
      rows.forEach(function (r) { r.classList.add('on'); });
      stamp.classList.add('on');
    } else {
      rows.forEach(function (r, i) {
        setTimeout(function () { r.classList.add('on'); }, 500 + i * 380);
      });
      setTimeout(function () {
        stamp.classList.add('on');
      }, 500 + rows.length * 380 + 300);
    }
  }

  /* 2. Project viewer (accessible tabs) */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#tabs .tab'));
  function selectTab(i, focus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
      }
    });
    if (focus && tabs[i]) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length;
      if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); selectTab((i + 1) % n, true); }
      if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); selectTab((i - 1 + n) % n, true); }
      if (k === 'Home') { e.preventDefault(); selectTab(0, true); }
      if (k === 'End') { e.preventDefault(); selectTab(n - 1, true); }
    });
  });

  /* 3. Scroll progress */
  var bar = document.getElementById('progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 4. Copy email */
  var copy = document.getElementById('copy');
  var note = document.getElementById('copied');
  var emailEl = document.getElementById('email');
  if (copy && emailEl) {
    copy.addEventListener('click', function () {
      var addr = emailEl.textContent.trim();
      function done(ok) {
        if (note) {
          note.textContent = ok ? 'Email copied' : 'Copy failed. Select the address above.';
          setTimeout(function () { note.textContent = ''; }, 2500);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  /* 5. Mascot and Bug Vector Characters */
  var SENTRY = '<svg viewBox="0 0 196 192" aria-hidden="true" focusable="false"><g class="s-bob">' +
    '<rect class="fb leg-l" x="66" y="166" width="18" height="24" rx="9"/><rect class="fb leg-r" x="104" y="166" width="18" height="24" rx="9"/>' +
    '<path class="sb" stroke-width="11" d="M30 118 q-20 14 -8 36"/><circle class="fb" cx="22" cy="156" r="9"/>' +
    '<path class="fb" d="M94 8 L160 30 V88 C160 128 132 156 94 172 C56 156 28 128 28 88 V30 Z"/>' +
    '<path class="sd" stroke-width="5" d="M28 72 C28 22 160 22 160 72"/>' +
    '<rect class="fd" x="22" y="62" width="12" height="36" rx="6"/><rect class="fd" x="154" y="62" width="12" height="36" rx="6"/>' +
    '<path class="sd" stroke-width="4" d="M160 98 q0 26 -38 28"/><circle class="fd" cx="122" cy="126" r="5"/>' +
    '<g class="s-eyes"><circle class="fd" cx="70" cy="80" r="14"/><circle class="fb pupil" cx="70" cy="80" r="5"/>' +
    '<circle class="fd" cx="118" cy="80" r="14"/><circle class="fb pupil" cx="118" cy="80" r="5"/></g>' +
    '<path class="sd" stroke-width="5" d="M80 108 q14 12 28 0"/>' +
    '<g class="s-arm"><path class="sb" stroke-width="11" d="M158 118 q28 -4 22 -40"/><circle class="fb" cx="180" cy="76" r="9"/></g>' +
    '</g></svg>';

  var BUG = '<svg viewBox="0 0 64 46" aria-hidden="true" focusable="false">' +
    '<path class="sb" stroke-width="2.5" d="M26 14 q-6 -10 -13 -9 M38 14 q6 -10 13 -9"/><circle class="fb" cx="13" cy="5" r="2.4"/><circle class="fb" cx="51" cy="5" r="2.4"/>' +
    '<g class="legs"><path class="sb" stroke-width="3" d="M17 26 L5 33 M19 31 L9 42 M25 34 L19 45 M47 26 L59 33 M45 31 L55 42 M39 34 L45 45"/></g>' +
    '<ellipse class="fb" cx="32" cy="25" rx="21" ry="14"/>' +
    '<circle class="fd" cx="25" cy="22" r="3.4"/><circle class="fd" cx="39" cy="22" r="3.4"/>' +
    '<path class="sd" stroke-width="2.4" d="M20 16 L28 19 M44 16 L36 19"/>' +
    '<circle class="fd" cx="32" cy="32" r="2" opacity=".35"/><circle class="fd" cx="24" cy="30" r="1.6" opacity=".35"/><circle class="fd" cx="40" cy="30" r="1.6" opacity=".35"/></svg>';

  var sentries = Array.prototype.slice.call(document.querySelectorAll('[data-sentry]'));
  sentries.forEach(function (el) { el.innerHTML = SENTRY; });

  /* Eyes follow pointer */
  var mx = 0, my = 0, raf = 0;
  function look() {
    raf = 0;
    sentries.forEach(function (el) {
      var svg = el.querySelector('svg');
      if (!svg) return;
      var r = svg.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || r.width === 0) return;
      var s = r.width / 196;
      svg.querySelectorAll('.pupil').forEach(function (p) {
        var cx = r.left + (+p.getAttribute('cx')) * s, cy = r.top + (+p.getAttribute('cy')) * s;
        var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 160) * 6;
        p.setAttribute('transform', 'translate(' + (dx / d * k).toFixed(2) + ' ' + (dy / d * k).toFixed(2) + ')');
      });
    });
  }
  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(look);
    }, { passive: true });
  }

  /* Bugs: click to close alert */
  var lane = document.getElementById('lane');
  var hint = document.getElementById('hint');
  if (lane) {
    if (reduce) {
      lane.hidden = true;
      if (hint) hint.hidden = true;
    } else {
      var cfg = [
        { d: 27, dl: -3, b: 2, rev: 0 },
        { d: 34, dl: -17, b: 10, rev: 1 },
        { d: 22, dl: -9, b: 0, rev: 0 },
        { d: 40, dl: -26, b: 6, rev: 1 }
      ];
      var words = ['Closed', 'False positive', 'Contained', 'Tuned'];
      var closed = 0, counter = document.getElementById('caughtN');
      cfg.forEach(function (c) {
        var b = document.createElement('div');
        b.className = 'bug' + (c.rev ? ' rev' : '');
        b.style.setProperty('--dur', c.d + 's');
        b.style.setProperty('--delay', c.dl + 's');
        b.style.setProperty('--b', c.b + 'px');
        b.innerHTML = '<div class="bug-in char char-light">' + BUG + '</div><span class="pop"></span>';
        b.addEventListener('pointerdown', function () {
          if (b.classList.contains('caught')) return;
          b.querySelector('.pop').textContent = words[closed % words.length];
          b.classList.add('caught');
          closed++;
          if (counter) counter.textContent = closed;
          setTimeout(function () { b.classList.remove('caught'); }, 4500);
        });
        lane.appendChild(b);
      });
    }
  }

  /* Walker follows scroll through the evidence log */
  var walker = document.getElementById('walker');
  var logEl = document.querySelector('.log');
  if (walker && logEl) {
    var wt = 0;
    var place = function () {
      var r = logEl.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (window.innerHeight * 0.55 - r.top) / r.height));
      var y = p * Math.max(0, r.height - walker.offsetHeight);
      walker.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
      if (!reduce) {
        walker.classList.add('walking');
        clearTimeout(wt);
        wt = setTimeout(function () { walker.classList.remove('walking'); }, 180);
      }
    };
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    place();
  }
})();
