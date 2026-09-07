/* ============================================================
   PIZZA PARTY × MENA MEH! — brand presentation
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var storedReduce = localStorage.getItem("pp-reduce-motion");
  var reduceMotion = storedReduce ? storedReduce === "1" : prefersReduced;

  var html = document.documentElement;
  function applyReduceMotion(state) {
    reduceMotion = state;
    html.classList.toggle("reduce-motion", state);
    var btn = document.getElementById("reduce-motion-toggle");
    if (btn) btn.setAttribute("aria-pressed", state ? "true" : "false");
  }
  applyReduceMotion(reduceMotion);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
      wheelMultiplier: 1
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  var gsapReady = !!(window.gsap && window.ScrollTrigger);
  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- anchor links use lenis / native smooth ---------------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileNav();
    if (lenis) {
      lenis.scrollTo(target, { offset: -8, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });

  /* ---------------- Intro mask ---------------- */
  (function introSequence() {
    var mask = document.getElementById("intro-mask");
    var line = mask.querySelector(".intro-mask__line");
    if (!mask) return;

    function finish() {
      mask.style.pointerEvents = "none";
      mask.style.transition = "opacity .6s cubic-bezier(.4,0,.2,1), visibility .6s";
      mask.style.opacity = "0";
      window.setTimeout(function () { mask.style.display = "none"; }, 650);
    }

    if (reduceMotion || !gsapReady) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();

    var tl = gsap.timeline({
      onComplete: function () {
        document.body.style.overflow = "";
        if (lenis) lenis.start();
        finish();
      }
    });
    tl.to(line, { opacity: 1, duration: 0.45, ease: "power2.out" })
      .to(line, { opacity: 1, duration: 0.55 })
      .to(mask, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.05");

    // allow skip on click / key
    function skip() {
      tl.progress(1);
    }
    mask.style.pointerEvents = "auto";
    mask.addEventListener("click", skip, { once: true });
    window.addEventListener("keydown", function onKey(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") { skip(); window.removeEventListener("keydown", onKey); }
    });
  })();

  /* ---------------- Hero split reveal ---------------- */
  (function heroReveal() {
    if (!gsapReady) return;
    var words = document.querySelectorAll(".hero__title-word");
    var lines = document.querySelectorAll("[data-reveal-line]");

    gsap.set(words, { yPercent: 110 });

    if (reduceMotion) gsap.set(".hero__bg img", { scale: 1 });

    var tl = gsap.timeline({ delay: reduceMotion ? 0 : 1.35, defaults: { ease: "power4.out" } });
    if (!reduceMotion) tl.to(".hero__bg img", { scale: 1.0, duration: 2.2, ease: "power2.out" }, 0);
    tl.to(".hero__eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(words, { yPercent: 0, duration: 1.05, stagger: 0.12 }, "-=0.25")
      .to(".hero__meta [data-reveal-line]", { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, "-=0.5")
      .to(".hero__scrollcue", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

    // hero exit transform tied to scroll (scoped to the first viewport only)
    gsap.to(".hero__stage", {
      yPercent: -18,
      opacity: 0.15,
      scale: 0.92,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero__viewport",
        start: "top top",
        end: "bottom top",
        scrub: 0.4
      }
    });
    gsap.to(".hero__scrollcue", {
      opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero__viewport", start: "top top", end: "20% top", scrub: 0.4 }
    });
    if (!reduceMotion) {
      gsap.to(".hero__bg img", {
        scale: 1.12, ease: "none",
        scrollTrigger: { trigger: ".hero__viewport", start: "top top", end: "bottom top", scrub: 0.4 }
      });
    }
  })();

  /* ---------------- headline line-mask reveal ---------------- */
  (function maskHeadlines() {
    if (!gsapReady || reduceMotion) return;

    function splitIntoLines(el) {
      var raw = el.innerHTML;
      var chunks = raw.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      chunks.forEach(function (chunk) {
        var text = chunk.trim();
        if (!text) return;
        var mask = document.createElement("span");
        mask.className = "line-mask";
        var inner = document.createElement("span");
        inner.className = "line-inner";
        inner.innerHTML = text;
        mask.appendChild(inner);
        el.appendChild(mask);
      });
      return el.querySelectorAll(".line-inner");
    }

    document.querySelectorAll(".display-headline").forEach(function (headline) {
      var lines = splitIntoLines(headline);
      if (!lines.length) return;
      headline.style.opacity = "1";
      headline.removeAttribute("data-reveal");
      gsap.set(lines, { yPercent: 108 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 0.95,
        ease: "power4.out",
        stagger: 0.07,
        scrollTrigger: { trigger: headline, start: "top 90%", once: true }
      });
    });
  })();

  /* ---------------- custom cursor ---------------- */
  (function customCursor() {
    if (reduceMotion || !gsapReady) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    var moveX = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
    var moveY = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("mousemove", function (e) {
      moveX(e.clientX);
      moveY(e.clientY);
    });

    var hoverSelector = 'a, button, [role="button"]';
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSelector)) gsap.to(dot, { scale: 2.2, duration: 0.3, ease: "power2.out" });
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSelector)) gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
    });
  })();

  /* ---------------- magnetic hover ---------------- */
  (function magneticHover() {
    if (reduceMotion || !gsapReady) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

    document.querySelectorAll(".closing__back-top, .compare__cta, .viewer__close").forEach(function (el) {
      el.classList.add("magnetic");
      var moveX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      var moveY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        moveX((e.clientX - (r.left + r.width / 2)) * 0.35);
        moveY((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("mouseleave", function () {
        moveX(0);
        moveY(0);
      });
    });
  })();

  /* ---------------- generic reveal-on-scroll ---------------- */
  (function revealObserver() {
    var els = document.querySelectorAll("[data-reveal], [data-reveal-img]");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------- staggered reveal for grouped lists ---------------- */
  (function staggerGroups() {
    document.querySelectorAll(".anatomy__details, .proposal__attributes, .closing__prompts, .proof-strip").forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal]");
      items.forEach(function (el, i) { el.style.transitionDelay = (i * 0.08) + "s"; });
    });
  })();

  /* ---------------- marquee infinite scroll ---------------- */
  (function marquee() {
    var track = document.querySelector("[data-marquee]");
    if (!track || !gsapReady) return;
    var width = track.scrollWidth / 2;
    gsap.set(track, { x: 0 });
    if (reduceMotion) return;
    gsap.to(track, {
      x: -width,
      duration: 22,
      ease: "none",
      repeat: -1
    });
  })();

  /* ---------------- logo reveal scale/clip on scroll ---------------- */
  (function logoReveals() {
    if (!gsapReady) return;
    document.querySelectorAll("[data-logo-reveal]").forEach(function (block) {
      var mark = block.querySelector(".logo-reveal__mark");
      if (!mark) return;
      gsap.fromTo(mark,
        { clipPath: "inset(0 0 100% 0)", scale: 1.06 },
        {
          clipPath: "inset(0 0 0% 0)", scale: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 75%",
            end: "top 25%",
            scrub: reduceMotion ? false : 0.6
          }
        }
      );
    });
  })();

  /* ---------------- parallax on hero application images ---------------- */
  (function imageParallax() {
    if (!gsapReady || reduceMotion) return;
    document.querySelectorAll(".applications__hero img, .anatomy__variant img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  })();

  /* ---------------- strategic insights: number comes into focus with scroll ---------------- */
  (function strategicInsights() {
    if (!gsapReady) return;
    document.querySelectorAll("[data-insight]").forEach(function (insight) {
      var number = insight.querySelector("[data-insight-number]");
      if (!number) return;
      if (reduceMotion) {
        gsap.set(number, { opacity: 1 });
        return;
      }
      gsap.fromTo(number, { opacity: 0.22 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: insight, start: "top 75%", end: "top 30%", scrub: 0.5 }
      });
    });
  })();

  /* ---------------- nav state: solid / on-dark + progress + active link ---------------- */
  (function navController() {
    var nav = document.getElementById("site-nav");
    var progressBar = document.getElementById("nav-progress-bar");
    var darkSections = Array.from(document.querySelectorAll('.hero__viewport, [data-logo-reveal], .closing'));
    var navLinks = document.querySelectorAll("[data-nav-link]");
    var sections = Array.from(document.querySelectorAll("[data-section]"));

    function update() {
      var y = window.scrollY || window.pageYOffset;
      nav.dataset.state = y > 40 ? "solid" : "top";

      // on-dark detection
      var navRect = { top: 0, bottom: 76 };
      var onDark = false;
      darkSections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.top < navRect.bottom && r.bottom > navRect.top) onDark = true;
      });
      if (onDark) nav.dataset.state = "on-dark";

      // progress
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
      progressBar.style.width = pct + "%";

      // active section -> nav link
      // sections without their own nav entry (e.g. the second FUTURE LAB screen)
      // fall back to the nav item covering that narrative block.
      var navGroup = { "strategic-insights": "future-lab" };
      var current = null;
      sections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5) current = sec;
      });
      navLinks.forEach(function (link) { link.removeAttribute("aria-current"); });
      if (current) {
        var id = current.id;
        if (id) {
          var targetId = navGroup[id] || id;
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + targetId) link.setAttribute("aria-current", "true");
          });
        }
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------------- mobile nav ---------------- */
  var mobileNav = document.getElementById("mobile-nav");
  var burger = document.getElementById("nav-burger");
  function openMobileNav() {
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    if (!mobileNav.classList.contains("is-open")) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) {
    burger.addEventListener("click", function () {
      mobileNav.classList.contains("is-open") ? closeMobileNav() : openMobileNav();
    });
  }

  /* ---------------- reduce motion toggle ---------------- */
  var rmBtn = document.getElementById("reduce-motion-toggle");
  if (rmBtn) {
    rmBtn.addEventListener("click", function () {
      var next = !reduceMotion;
      localStorage.setItem("pp-reduce-motion", next ? "1" : "0");
      applyReduceMotion(next);
      window.location.reload();
    });
  }

  /* ---------------- Escape closes overlays ---------------- */
  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeMobileNav();
    closeViewer();
  });

  /* ---------------- compare section ---------------- */
  (function compare() {
    var stage = document.querySelector("[data-compare-stage]");
    if (!stage) return;
    var buttons = stage.querySelectorAll("[data-compare-btn]");
    var logoImg = stage.querySelector("[data-compare-logo]");
    var palette = stage.querySelector("[data-compare-palette]");
    var headline = stage.querySelector("[data-compare-headline]");
    var cta = stage.querySelector("[data-compare-cta]");

    var data = {
      "01": {
        bg: "#dbd4c2", ink: "#b02423",
        logo: "assets/logos/proposta-01/logo-red-transparent.svg",
        alt: "Logo Pizza Party, proposta 01",
        colors: ["#b02423", "#243313", "#dbd4c2"],
        headline: "La pizza si condivide.",
        href: "#proposta-01",
        logoWidth: 198
      },
      "02": {
        bg: "#661b1d", ink: "#f6f4d7",
        logo: "assets/logos/proposta-02/logo-primary.svg",
        alt: "Logo Pizza Party, proposta 02",
        colors: ["#661b1d", "#be4728", "#f6f4d7"],
        headline: "Buona pizza, bella gente.",
        href: "#proposta-02",
        logoWidth: 277
      }
    };

    function setProposal(key) {
      var d = data[key];
      if (!d) return;
      stage.style.setProperty("--c-bg", d.bg);
      stage.style.setProperty("--c-ink", d.ink);
      logoImg.style.maxWidth = d.logoWidth + "px";
      if (gsapReady && !reduceMotion) {
        gsap.to(logoImg, { opacity: 0, duration: 0.18, onComplete: function () {
          logoImg.src = d.logo; logoImg.alt = d.alt;
          gsap.to(logoImg, { opacity: 1, duration: 0.28 });
        }});
      } else {
        logoImg.src = d.logo; logoImg.alt = d.alt;
      }
      palette.querySelectorAll("span").forEach(function (span, i) { span.style.background = d.colors[i]; });
      headline.textContent = d.headline;
      cta.setAttribute("href", d.href);
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-selected", btn.dataset.compareBtn === key ? "true" : "false");
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { setProposal(btn.dataset.compareBtn); });
    });
  })();

  /* ---------------- fullscreen viewer ---------------- */
  var viewer = document.getElementById("viewer");
  var viewerImg = document.getElementById("viewer-img");
  var viewerCaption = document.getElementById("viewer-caption");
  var viewerCloseBtn = document.getElementById("viewer-close");
  var lastFocused = null;

  function openViewer(src, alt, caption) {
    lastFocused = document.activeElement;
    viewerImg.src = src;
    viewerImg.alt = alt || "";
    viewerCaption.textContent = caption || "";
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    viewerCloseBtn.focus();
    if (lenis) lenis.stop();
  }
  function closeViewer() {
    if (!viewer.classList.contains("is-open")) return;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    if (lenis) lenis.start();
  }
  viewerCloseBtn.addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });

  document.querySelectorAll(".applications__strip img, .applications__hero img, .applications__digital img").forEach(function (img) {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Apri a schermo intero: " + (img.alt || ""));
    function trigger() {
      var caption = "";
      var fig = img.closest("figure");
      if (fig) {
        var cap = fig.querySelector("figcaption");
        if (cap) {
          var label = cap.querySelector("span");
          var labelText = label ? label.textContent.trim() : "";
          var fullText = cap.textContent.trim();
          var restText = labelText ? fullText.replace(labelText, "").trim() : fullText;
          caption = labelText ? (labelText + " — " + restText) : fullText;
        }
      }
      openViewer(img.currentSrc || img.src, img.alt, caption);
    }
    img.addEventListener("click", trigger);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
    });
  });

  /* ---------------- refresh ScrollTrigger after fonts/images load ---------------- */
  window.addEventListener("load", function () {
    if (gsapReady) ScrollTrigger.refresh();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (gsapReady) ScrollTrigger.refresh(); });
  }
})();
