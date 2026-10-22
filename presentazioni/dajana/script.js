/* =========================================================================
   DAJANA × MENA MEH! — comportamenti
   Navigazione, menu mobile, comparse, apertura della foto live, lightbox.
   Nessuna libreria esterna. Tutti i contenuti restano leggibili senza JS.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var nav = document.getElementById('nav');

  /* ---------- Navigazione: tema chiaro/scuro e voce attiva ---------- */
  var themed = Array.prototype.slice.call(document.querySelectorAll('[data-theme]')).filter(function (el) { return el !== nav; });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var targets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function updateNav() {
    var probe = (nav.offsetHeight || 64) / 2;
    var theme = 'dark', green = false;
    for (var i = themed.length - 1; i >= 0; i--) {
      var r = themed[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        theme = themed[i].getAttribute('data-theme');
        green = themed[i].classList.contains('bridge') || themed[i].classList.contains('closing');
        break;
      }
    }
    nav.setAttribute('data-theme', theme);
    nav.classList.toggle('on-green', green);
    nav.classList.toggle('is-scrolled', window.scrollY > 24);

    var line = window.innerHeight * 0.35, active = -1;
    targets.forEach(function (t, idx) {
      if (t && t.getBoundingClientRect().top <= line) active = idx;
    });
    navLinks.forEach(function (a, idx) {
      var on = idx === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Apertura progressiva della foto live ---------- */
  var grows = Array.prototype.slice.call(document.querySelectorAll('.grow .tile__zoom'));
  function updateGrow() {
    if (!motion) return;
    var vh = window.innerHeight;
    grows.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // 0 quando il bordo alto entra dal basso, 1 quando ha percorso metà schermo
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      el.style.setProperty('--inset', ((1 - p) * 12).toFixed(2) + '%');
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateNav();
      updateGrow();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateNav();
  updateGrow();

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('menu');
  // con il menu aperto, il resto della pagina esce dall'ordine di tabulazione
  var behind = Array.prototype.slice.call(document.querySelectorAll('.hero, #main, .foot, .skip-link, .nav__brand, .nav__cta'));
  function setInert(on) { behind.forEach(function (el) { el.inert = on; }); }

  function closeMenu(returnFocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    document.body.classList.remove('menu-open');
    setInert(false);
    if (returnFocus) toggle.focus();
  }
  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Chiudi';
    document.body.classList.add('menu-open');
    setInert(true);
    var first = menu.querySelector('a');
    if (first) first.focus();
  }
  toggle.addEventListener('click', function () {
    if (menu.hidden) openMenu(); else closeMenu(true);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  window.matchMedia('(min-width: 1181px)').addEventListener('change', function (mq) {
    if (mq.matches) closeMenu(false);
  });

  /* ---------- Comparse al scorrimento ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Stampa: apre i dettagli espandibili ---------- */
  window.addEventListener('beforeprint', function () {
    Array.prototype.forEach.call(document.querySelectorAll('details'), function (d) { d.open = true; });
  });

  /* ---------- Lightbox ---------- */
  var dlg = document.getElementById('lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return; // senza dialog: restano didascalie e link

  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbDesc = document.getElementById('lb-desc');
  var lbOrigin = document.getElementById('lb-origin');
  var lbKind = document.getElementById('lb-kind');
  var lbLink = document.getElementById('lb-link');
  var lbRights = document.getElementById('lb-rights');
  var lbCount = document.getElementById('lb-count');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var lbClose = document.getElementById('lb-close');

  var group = [], index = 0, opener = null;

  function text(fig, sel) {
    var el = fig.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }

  function render() {
    var fig = group[index];
    var img = fig.querySelector('img');
    var reel = fig.hasAttribute('data-reel');
    var artist = text(fig, '.tile__artist');
    var isDajana = artist === 'Dajana';
    var link = fig.querySelector('.tile__link');

    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbImg.width = img.naturalWidth || img.width;
    lbImg.height = img.naturalHeight || img.height;
    lbTitle.textContent = artist;
    lbDesc.textContent = text(fig, '.tile__title');
    lbOrigin.textContent = text(fig, '.tile__origin');
    lbKind.textContent = reel
      ? 'Copertina statica del reel: il video si guarda sul profilo originale.'
      : 'Fotografia dal post originale.';
    lbLink.href = link ? link.href : '#';
    lbLink.innerHTML = (reel ? 'Guarda su Instagram' : 'Apri il post su Instagram') +
      '<span class="vh"> (si apre in una nuova scheda)</span> ↗';
    lbRights.textContent = isDajana
      ? 'Materiale pubblico dell’artista, anteprima a bassa risoluzione.'
      : 'Riferimento di ricerca: diritti ai rispettivi titolari, nessuna licenza di riuso.';
    lbCount.textContent = group.length > 1 ? (index + 1) + ' / ' + group.length : '';
    lbPrev.hidden = lbNext.hidden = group.length < 2;
  }

  function open(fig) {
    var name = fig.getAttribute('data-group');
    group = Array.prototype.slice.call(document.querySelectorAll('.tile[data-group="' + name + '"]'));
    index = Math.max(0, group.indexOf(fig));
    opener = fig.querySelector('.tile__zoom');
    render();
    dlg.showModal();
    lbClose.focus();
  }
  function step(d) {
    index = (index + d + group.length) % group.length;
    render();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tile__zoom');
    if (!btn) return;
    open(btn.closest('.tile'));
  });
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });
  lbClose.addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && group.length > 1) { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight' && group.length > 1) { e.preventDefault(); step(1); }
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close(); // clic sullo sfondo
  });
  dlg.addEventListener('close', function () {
    lbImg.removeAttribute('src');
    if (opener) opener.focus();
  });
})();
