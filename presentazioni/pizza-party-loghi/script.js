/* ============================================================
   PIZZA PARTY — NEW LOGO DIRECTIONS × MENA MEH!
   ============================================================ */
(function () {
  "use strict";

  var html = document.documentElement;
  var STORE = "ppl-reduce-motion";
  var reduceMotion = html.classList.contains("reduce-motion");
  var finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var gsapReady = !!(window.gsap && window.ScrollTrigger);

  /* ---------------- reduce-motion toggle (desktop + mobile) ---------------- */
  var rmButtons = document.querySelectorAll("#rm-toggle, [data-rm-toggle]");
  rmButtons.forEach(function (btn) {
    btn.setAttribute("aria-pressed", reduceMotion ? "true" : "false");
    btn.addEventListener("click", function () {
      try { localStorage.setItem(STORE, reduceMotion ? "0" : "1"); } catch (e) {}
      window.location.reload();
    });
  });

  /* ---------------- smooth scroll ---------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
  }
  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  } else if (lenis) {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.3 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileNav(false);
    scrollToTarget(target);
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ---------------- split headings into masked lines ---------------- */
  function splitLines(el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p) {
      return '<span class="split-line"><span class="split-inner">' + p.trim() + "</span></span>";
    }).join("");
    return el.querySelectorAll(".split-inner");
  }

  /* ---------------- intro + hero ---------------- */
  var introMask = document.getElementById("intro-mask");
  function heroIn(delay) {
    if (!gsapReady || reduceMotion) return;
    var tl = gsap.timeline({ delay: delay || 0, defaults: { ease: "expo.out" } });
    tl.fromTo(".hero__media", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, 0)
      .fromTo(".hero__media-inner", { scale: 1.2 }, { scale: 1, duration: 2 }, 0.05)
      .fromTo("[data-hero-word]", { yPercent: 108 }, { yPercent: 0, duration: 1.1, stagger: 0.1 }, 0.25)
      .fromTo("[data-hero-sub]", { yPercent: 110 }, { yPercent: 0, duration: 0.9 }, 0.55)
      .fromTo("[data-hero-fade]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.7);
  }
  if (gsapReady && !reduceMotion) {
    gsap.set("[data-hero-word], [data-hero-sub]", { yPercent: 108 });
    gsap.set("[data-hero-fade]", { autoAlpha: 0 });
    gsap.set(".hero__media", { clipPath: "inset(100% 0% 0% 0%)" });
  }
  (function intro() {
    if (!introMask) return;
    if (!gsapReady || reduceMotion) { introMask.remove(); heroIn(0); return; }
    if (lenis) lenis.stop();
    var tl = gsap.timeline({
      onComplete: function () { introMask.remove(); if (lenis) lenis.start(); }
    });
    tl.fromTo(".intro-mask span", { yPercent: 105 }, { yPercent: 0, duration: 0.6, stagger: 0.08, ease: "expo.out" })
      .to(".intro-mask span", { yPercent: -105, duration: 0.45, stagger: 0.05, ease: "expo.in" }, "+=0.25")
      .to(introMask, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "expo.inOut" }, "-=0.1")
      .add(function () { heroIn(0); }, "-=0.6");
    function skip() { tl.progress(1); }
    introMask.style.pointerEvents = "auto";
    introMask.addEventListener("click", skip, { once: true });
    window.addEventListener("keydown", function onKey(e) {
      if (["Enter", " ", "Escape"].indexOf(e.key) > -1) { skip(); window.removeEventListener("keydown", onKey); }
    });
  })();

  /* hero transform tied to scroll */
  if (gsapReady && !reduceMotion) {
    // the photo is revealed on load by .hero__media / .hero__media-inner (see heroIn);
    // while scrolling down it disappears through the img alone, so the two never fight over the same property
    var hideStart = { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, scale: 1, autoAlpha: 1 };
    var mmHero = gsap.matchMedia();
    mmHero.add("(min-width: 861px)", function () {
      var st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 };
      gsap.to(".hero__line:first-child [data-hero-word]", { xPercent: -14, ease: "none", scrollTrigger: st });
      gsap.to(".hero__line--indent [data-hero-word]", { xPercent: 10, ease: "none", scrollTrigger: st });
      gsap.fromTo(".hero__media img", hideStart, {
        clipPath: "inset(0% 0% 100% 0%)", yPercent: -12, scale: 1.08, autoAlpha: 0.35, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "75% top", scrub: 0.5 }
      });
      gsap.to(".hero__meta, .hero__index, .hero__eyebrow, .hero__sub", { y: -60, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "55% top", scrub: 0.5 } });
    });
    mmHero.add("(max-width: 860px)", function () {
      gsap.fromTo(".hero__media img", hideStart, {
        clipPath: "inset(0% 0% 100% 0%)", yPercent: -8, scale: 1.05, autoAlpha: 0.35, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "80% top", scrub: 0.5 }
      });
    });
  }

  /* ---------------- headline line masks ---------------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var lines = splitLines(el);
    if (!gsapReady || reduceMotion) return;
    gsap.set(lines, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: function () { gsap.to(lines, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.08 }); }
    });
  });

  /* ---------------- word-by-word reading reveal ---------------- */
  document.querySelectorAll("[data-words]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + "</span>"; }).join(" ");
    if (!gsapReady || reduceMotion) return;
    var spans = el.querySelectorAll(".w");
    ScrollTrigger.create({
      trigger: el, start: "top 82%", end: "bottom 45%", scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * spans.length);
        spans.forEach(function (s, i) { s.style.opacity = i < n ? 1 : ""; });
      }
    });
  });

  /* ---------------- reveal on scroll (IntersectionObserver) ---------------- */
  (function reveals() {
    var groups = ".keywords, .rationale__list, .closing__list, .tiles, .palette, .dir-index";
    document.querySelectorAll(groups).forEach(function (g) {
      g.querySelectorAll("[data-reveal], [data-reveal-tile], [data-swatch]").forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.08) + "s";
      });
    });
    var els = document.querySelectorAll("[data-reveal], [data-reveal-img]");
    // tiles and swatches start fully clipped/collapsed (zero visible area), so their container is observed instead
    var containers = document.querySelectorAll(".tiles, .palette");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal], [data-reveal-img], [data-reveal-tile], [data-swatch]").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-reveal-tile], [data-swatch]").forEach(function (c) { c.classList.add("is-in"); });
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    containers.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------- direction-specific motion ---------------- */
  if (gsapReady) {
    var mm = gsap.matchMedia();

    // logo reveal: scrubbed inside the sticky stage on desktop, timed on mobile
    document.querySelectorAll("[data-logo-reveal]").forEach(function (block) {
      var stage = block.querySelector(".dir-reveal__stage");
      if (reduceMotion) { stage.style.setProperty("--p", 1); return; }
      mm.add("(min-width: 861px)", function () {
        gsap.fromTo(stage, { "--p": 0 }, {
          "--p": 1, ease: "none",
          scrollTrigger: { trigger: block, start: "top 60%", end: "45% top", scrub: 0.6 }
        });
        gsap.fromTo(stage, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: block, start: "top 60%", end: "60% top", scrub: 0.6 } });
      });
      mm.add("(max-width: 860px)", function () {
        gsap.fromTo(stage, { "--p": 0 }, { "--p": 1, duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: block, start: "top 70%", once: true } });
      });
    });

    if (!reduceMotion) {
      // big direction number drifts slightly as the intro scrolls
      document.querySelectorAll(".dir-intro__index span").forEach(function (n) {
        gsap.fromTo(n, { yPercent: 18 }, { yPercent: -10, ease: "none", scrollTrigger: { trigger: n, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });

      mm.add("(min-width: 861px)", function () {
        // controlled parallax on full-bleed landscapes
        document.querySelectorAll(".apps__full .media--landscape img").forEach(function (img) {
          gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: "none", scrollTrigger: { trigger: img.closest(".apps__full"), start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
        // synthesis mark settles while scrolling
        document.querySelectorAll(".synthesis__logo").forEach(function (logo) {
          gsap.fromTo(logo, { y: 60, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: logo.closest(".synthesis"), start: "top 85%", end: "center center", scrub: 0.6 } });
        });
      });

      // chromatic transition: the next direction opens with the gesture of its own symbol
      var shapes = {
        circle: ["circle(0% at 50% 100%)", "circle(150% at 50% 100%)"],
        wipe: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
        embrace: ["inset(0% 50% 0% 50%)", "inset(0% 0% 0% 0%)"],
        base: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      };
      document.querySelectorAll("[data-next]").forEach(function (el) {
        var target = document.querySelector(el.getAttribute("href"));
        var style = (target && target.getAttribute("data-reveal-style")) || "base";
        var s = shapes[style] || shapes.base;
        gsap.fromTo(el, { clipPath: s[0] }, { clipPath: s[1], ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: 0.5 } });
        gsap.fromTo(el.querySelector(".next-dir__n"), { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 20%", scrub: 0.5 } });
      });
    }
  }

  /* ---------------- nav: theme, progress, active link ---------------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("nav-progress");
  var navLinks = document.querySelectorAll("[data-nav-link]");
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
  var ticking = false;
  function updateNav() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("is-scrolled", y > 20);
    var probe = document.elementsFromPoint(window.innerWidth / 2, 32).filter(function (el) { return !nav.contains(el); })[0];
    var themed = probe && probe.closest("[data-nav-theme]");
    var theme = themed ? themed.getAttribute("data-nav-theme") : "dark";
    nav.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    var mid = window.innerHeight * 0.45, current = null;
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) current = s;
    });
    var id = current ? current.id || "" : "";
    if (current && current.getAttribute("data-section") === "closing") id = "confronto";
    navLinks.forEach(function (a) {
      if (id && a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  function requestNav() { if (!ticking) { ticking = true; requestAnimationFrame(updateNav); } }
  window.addEventListener("scroll", requestNav, { passive: true });
  window.addEventListener("resize", requestNav);
  updateNav();

  /* ---------------- mobile nav ---------------- */
  var mobileNav = document.getElementById("mobile-nav");
  var burger = document.getElementById("nav-burger");
  function openMobileNav() {
    mobileNav.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Chiudi il menu");
    nav.setAttribute("data-theme", "dark");
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    var first = mobileNav.querySelector("a");
    if (first) first.focus();
    if (gsapReady && !reduceMotion) {
      gsap.fromTo(mobileNav, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.out" });
      gsap.fromTo(mobileNav.querySelectorAll("a, .mobile-nav__group"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "expo.out", delay: 0.1 });
    }
  }
  function closeMobileNav(restoreFocus) {
    if (mobileNav.hidden) return;
    mobileNav.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Apri il menu");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    if (restoreFocus !== false) burger.focus();
    requestNav();
  }
  burger.addEventListener("click", function () { mobileNav.hidden ? openMobileNav() : closeMobileNav(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1023) closeMobileNav(false); });

  /* ---------------- horizontal strips ---------------- */
  document.querySelectorAll("[data-strip]").forEach(function (strip) {
    var wrap = strip.closest(".apps__strip-wrap");
    var prev = wrap.querySelector("[data-strip-prev]");
    var next = wrap.querySelector("[data-strip-next]");
    function step(dir) {
      var items = Array.prototype.slice.call(strip.children);
      var left = strip.scrollLeft, pad = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
      var target = null;
      if (dir > 0) target = items.find(function (it) { return it.offsetLeft - pad > left + 4; });
      else target = items.slice().reverse().find(function (it) { return it.offsetLeft - pad < left - 4; });
      if (target) strip.scrollTo({ left: target.offsetLeft - pad, behavior: reduceMotion ? "auto" : "smooth" });
    }
    function sync() {
      prev.disabled = strip.scrollLeft <= 4;
      next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
    }
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    strip.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
    // mouse drag on desktop; touch keeps native scrolling
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; strip.classList.add("is-dragging"); }
      if (moved) strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      strip.classList.remove("is-dragging");
      if (moved) { strip.addEventListener("click", function block(ev) { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true }); }
    });
    strip.addEventListener("dragstart", function (e) { e.preventDefault(); });
    sync();
  });

  /* ---------------- compare ---------------- */
  (function compare() {
    var dataEl = document.getElementById("compare-data");
    if (!dataEl) return;
    var data = JSON.parse(dataEl.textContent);
    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-compare]"));
    var stage = document.getElementById("compare-panel");
    var logo = stage.querySelector("[data-compare-logo]");
    var meta = stage.querySelector(".compare__meta");
    var q = function (s) { return stage.querySelector(s); };
    var current = "01";

    function render(key) {
      var d = data[key];
      stage.style.setProperty("--c-bg", d.bg);
      stage.style.setProperty("--c-ink", d.ink);
      stage.setAttribute("aria-labelledby", "tab-" + key);
      q("[data-compare-num]").textContent = "Direction " + key;
      q("[data-compare-name]").textContent = d.name;
      q("[data-compare-headline]").textContent = d.headline;
      q("[data-compare-palette]").innerHTML = d.colors.map(function (c) { return '<span style="background:' + c + '" title="' + c.toUpperCase() + '"></span>'; }).join("");
      q("[data-compare-attrs]").innerHTML = d.attrs.map(function (a) { return "<li>" + a + "</li>"; }).join("");
      var link = q("[data-compare-link]");
      link.setAttribute("href", d.href);
      link.textContent = "Rivedi la direzione " + key + " →";
      logo.src = d.logo; logo.alt = d.alt;
      stage.style.setProperty("--lw", d.lw);
    }
    function select(key, focus) {
      if (key === current) return;
      current = key;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-compare") === key;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      if (reduceMotion) { render(key); return; }
      logo.classList.add("is-out"); meta.classList.add("is-out");
      window.setTimeout(function () {
        render(key);
        var done = function () { logo.classList.remove("is-out"); meta.classList.remove("is-out"); };
        if (logo.complete) requestAnimationFrame(done); else logo.addEventListener("load", done, { once: true });
      }, 280);
    }
    // preload the three marks so the switch is instant
    Object.keys(data).forEach(function (k) { var i = new Image(); i.src = data[k].logo; });
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t.getAttribute("data-compare")); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n.getAttribute("data-compare"), true); }
      });
    });
  })();

  /* ---------------- fullscreen viewer ---------------- */
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-caption");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");
  var group = [], index = 0, lastFocus = null;

  function show(i) {
    index = (i + group.length) % group.length;
    var fig = group[index];
    var img = fig.querySelector("img");
    vImg.src = img.getAttribute("src");
    vImg.alt = img.alt;
    vCap.textContent = fig.getAttribute("data-caption") || "";
    vCount.textContent = (index + 1) + " / " + group.length;
  }
  function openViewer(fig) {
    var scope = fig.closest(".direction") || document;
    group = Array.prototype.slice.call(scope.querySelectorAll("[data-viewer]"));
    lastFocus = document.activeElement;
    show(group.indexOf(fig));
    viewer.hidden = false;
    requestAnimationFrame(function () { viewer.classList.add("is-open"); });
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    vClose.focus();
  }
  function closeViewer() {
    if (viewer.hidden) return;
    viewer.classList.remove("is-open");
    window.setTimeout(function () { viewer.hidden = true; vImg.src = "data:,"; }, reduceMotion ? 0 : 320);
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-viewer]").forEach(function (fig) {
    var frame = fig.querySelector(".media__frame");
    var img = fig.querySelector("img");
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "button");
    frame.setAttribute("aria-label", "Apri a schermo intero: " + img.alt);
    frame.addEventListener("click", function () { openViewer(fig); });
    frame.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(fig); }
    });
  });
  vClose.addEventListener("click", closeViewer);
  vPrev.addEventListener("click", function () { show(index - 1); });
  vNext.addEventListener("click", function () { show(index + 1); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  var touchX = null;
  viewer.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  window.addEventListener("keydown", function (e) {
    if (!viewer.hidden) {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "Tab") {
        var f = [vClose, vPrev, vNext];
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
      return;
    }
    if (e.key === "Escape") closeMobileNav();
  });

  /* ---------------- cursor ---------------- */
  (function cursor() {
    if (reduceMotion || !gsapReady || !finePointer) return;
    var dot = document.createElement("div");
    dot.className = "cursor";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    var x = gsap.quickTo(dot, "x", { duration: 0.4, ease: "power3" });
    var y = gsap.quickTo(dot, "y", { duration: 0.4, ease: "power3" });
    window.addEventListener("mousemove", function (e) { x(e.clientX); y(e.clientY); });
    var hover = 'a, button, [role="tab"], [data-viewer] .media__frame, [data-strip]';
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest(hover);
      if (!t) return;
      var big = t.matches("[data-viewer] .media__frame");
      gsap.to(dot, { scale: big ? 5 : 2.6, duration: 0.35, ease: "power3.out" });
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hover)) gsap.to(dot, { scale: 1, duration: 0.35, ease: "power3.out" });
    });
  })();

  /* ---------------- refresh after fonts and images ---------------- */
  if (gsapReady) {
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
