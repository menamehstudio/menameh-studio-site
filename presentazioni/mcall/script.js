/* ============================================================
   MC.ALL — Il salotto d'arte · versione 2 · script
   Vanilla JS: apertura, nome a tutta larghezza, nav a pillole
   con tema per sezione, rivelazioni, viewer, punti sulle foto,
   confronto facciata, anteprime Instagram su richiesta.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'mcall-reduce-motion';
  var reduced = function () { return root.classList.contains('reduce-motion'); };

  /* ---------- Riduci animazioni ---------- */
  var toggle = document.getElementById('motion-toggle');
  function setReduce(on, persist) {
    root.classList.toggle('reduce-motion', on);
    if (toggle) toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch (e) { /* storage non disponibile */ }
    }
    if (on) { root.classList.remove('intro'); revealAll(); }
  }
  if (toggle) toggle.addEventListener('click', function () { setReduce(!reduced(), true); });

  /* ---------- Rivelazioni allo scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  function revealAll() { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }
  setReduce(reduced(), false);
  // Le rivelazioni usano una maschera (clip-path) che rende l'elemento invisibile
  // anche a IntersectionObserver: si controlla quindi la posizione allo scroll.
  var pending = revealEls.slice();
  var revealTicking = false;
  function checkReveal() {
    revealTicking = false;
    if (!pending.length) return;
    var limit = window.innerHeight * 0.96;
    pending = pending.filter(function (el) {
      var b = el.getBoundingClientRect();
      if (b.top < limit + window.innerHeight * 0.6 && b.bottom > -window.innerHeight) {
        // le immagini dentro una maschera non vengono richieste dal lazy loading: le carichiamo qui
        Array.prototype.forEach.call(el.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
      }
      if (b.top < limit && b.bottom > -window.innerHeight) { el.classList.add('is-in'); return false; }
      return true;
    });
  }
  function queueReveal() { if (!revealTicking) { revealTicking = true; requestAnimationFrame(checkReveal); } }
  if (reduced()) revealAll();
  else {
    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    window.addEventListener('load', queueReveal);
    queueReveal();
  }

  /* ---------- Immagini non caricate ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('main img'), function (img) {
    function fail() {
      if (img.parentElement) img.parentElement.classList.add('img-missing');
      img.setAttribute('aria-hidden', 'true');
    }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
    else img.addEventListener('error', fail);
  });

  /* ---------- Nav: tema della sezione sotto le pillole, capitolo attivo ---------- */
  var nav = document.getElementById('nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var themed = Array.prototype.slice.call(document.querySelectorAll('main [data-theme]'));
  var chapters = ['analisi', 'visione', 'monica', 'moodboard', 'codice', 'boutique', 'contenuti', 'reference', 'chiusura']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var probeY = 30;
      var theme = 'light';
      themed.forEach(function (s) {
        var b = s.getBoundingClientRect();
        if (b.top <= probeY && b.bottom > probeY) theme = s.getAttribute('data-theme');
      });
      // nella sezione Monica la metà sinistra è la foto: le pillole stanno a destra, sul chiaro
      if (nav) nav.setAttribute('data-theme', theme);

      var current = '';
      var probe = window.innerHeight * 0.35;
      chapters.forEach(function (s) { if (s.getBoundingClientRect().top <= probe) current = s.id; });
      navLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('nav-burger');
  var mobileNav = document.getElementById('mobile-nav');
  function setMobile(open) {
    if (!burger || !mobileNav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.textContent = open ? 'Chiudi' : 'Menu';
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (nav) nav.setAttribute('data-theme', open ? 'dark' : nav.getAttribute('data-theme'));
    if (!open) onScroll();
  }
  if (burger) burger.addEventListener('click', function () { setMobile(burger.getAttribute('aria-expanded') !== 'true'); });
  if (mobileNav) mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMobile(false); });

  /* ---------- Viewer immagini ---------- */
  var viewer = document.getElementById('viewer');
  var vImg = document.getElementById('viewer-img');
  var vCap = document.getElementById('viewer-cap');
  var vClose = document.getElementById('viewer-close');
  var lastFocus = null;
  function openViewer(trigger) {
    var img = trigger.querySelector('img');
    if (!img || !viewer) return;
    lastFocus = trigger;
    vImg.src = img.currentSrc || img.src;
    vImg.alt = img.alt;
    vCap.textContent = trigger.getAttribute('data-caption') || img.alt;
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    vClose.focus();
  }
  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    vImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-viewer]');
    if (t) openViewer(t);
  });
  if (vClose) vClose.addEventListener('click', closeViewer);
  if (viewer) viewer.addEventListener('click', function (e) { if (e.target === viewer) closeViewer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeViewer();
      if (burger && burger.getAttribute('aria-expanded') === 'true') setMobile(false);
    }
    if (e.key === 'Tab' && viewer && !viewer.hidden) { e.preventDefault(); vClose.focus(); }
  });

  /* ---------- Punti numerati sulle foto della boutique ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.pin'), function (pin) {
    var note = document.getElementById(pin.getAttribute('aria-describedby'));
    if (!note) return;
    function on() { pin.classList.add('is-active'); note.classList.add('is-active'); }
    function off() { pin.classList.remove('is-active'); note.classList.remove('is-active'); }
    pin.addEventListener('mouseenter', on);
    pin.addEventListener('mouseleave', off);
    pin.addEventListener('focus', on);
    pin.addEventListener('blur', off);
    pin.addEventListener('click', function () {
      note.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
    });
  });

  /* ---------- Facciata e angolo salotto: oggi / ipotesi ---------- */
  [['data-salotto', '.salotto__visual'], ['data-facade', '.facade__visual']].forEach(function (pair) {
    var attr = pair[0];
    var visual = document.querySelector(pair[1]);
    Array.prototype.forEach.call(document.querySelectorAll('[' + attr + ']'), function (btn, i, all) {
      btn.addEventListener('click', function () {
        if (visual) visual.setAttribute('data-state', btn.getAttribute(attr));
        Array.prototype.forEach.call(all, function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    });
  });

  /* ---------- Anteprime Instagram (embed ufficiale, su richiesta) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-embed]'), function (card) {
    var path = card.getAttribute('data-embed');
    var link = card.querySelector('.refcard__link');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'embed-toggle';
    btn.textContent = 'Mostra l’anteprima';
    btn.setAttribute('aria-expanded', 'false');
    card.insertBefore(btn, link);

    var box = null;
    btn.addEventListener('click', function () {
      if (box) {
        var open = box.hidden;
        box.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Nascondi l’anteprima' : 'Mostra l’anteprima';
        return;
      }
      box = document.createElement('div');
      box.className = 'embed-box';
      var status = document.createElement('p');
      status.className = 'embed-box__status';
      status.textContent = 'Caricamento dell’anteprima da Instagram…';
      box.appendChild(status);

      if (navigator.onLine === false) {
        status.textContent = 'Anteprima non disponibile offline: apri il contenuto su Instagram con il link qui sotto.';
      } else {
        var frame = document.createElement('iframe');
        frame.src = 'https://www.instagram.com/' + path + '/embed/captioned/';
        frame.title = 'Anteprima Instagram: ' + (card.querySelector('.refcard__meta span') || {}).textContent;
        frame.setAttribute('scrolling', 'no');
        frame.style.visibility = 'hidden';
        box.appendChild(frame);
        var measured = false;
        var onMessage = function (e) {
          if (e.source !== frame.contentWindow || !/(^|\.)instagram\.com$/.test(new URL(e.origin).hostname)) return;
          var data;
          try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
          if (data && data.type === 'MEASURE' && data.details && data.details.height) {
            measured = true;
            frame.style.height = Math.ceil(data.details.height) + 'px';
            frame.style.visibility = '';
            if (status.parentNode) status.remove();
          }
        };
        window.addEventListener('message', onMessage);
        setTimeout(function () {
          if (!measured) {
            window.removeEventListener('message', onMessage);
            frame.remove();
            status.textContent = 'L’anteprima non si è caricata (Instagram potrebbe richiedere l’accesso o bloccare il contenuto). La reference resta disponibile con il link qui sotto.';
          }
        }, 10000);
      }
      card.insertBefore(box, link);
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Nascondi l’anteprima';
    });
  });
})();
