/**
 * MENA MEH! Studio — micro-interazione "Bello non basta."
 *
 * La parola "BELLO" segue leggermente il cursore (effetto magnetico) e si
 * "riempie" di colore quando il cursore le si avvicina — per rappresentare
 * visivamente che l'estetica da sola è instabile, superficiale, reattiva.
 * "NON BASTA." non viene mai toccata da questo script: resta solida e ferma.
 *
 * L'effetto:
 * - è attivo solo su dispositivi con puntatore preciso e hover reale
 *   (mouse/trackpad), mai su touch;
 * - è disattivato se l'utente preferisce ridurre le animazioni
 *   (prefers-reduced-motion: reduce);
 * - è puramente decorativo: senza JavaScript o su mobile, "BELLO" resta
 *   comunque visibile con il suo trattamento a contorno (outline), statico.
 */
(function () {
  "use strict";

  var word = document.querySelector(".headline__word--bello");
  if (!word) return;

  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var MAX_OFFSET = 22; // px
  var MAX_ROTATE = 3; // deg
  var THRESHOLD = 260; // px — raggio entro cui la parola reagisce
  var EASE = 0.15; // fattore di interpolazione per il movimento fluido

  var targetX = 0;
  var targetY = 0;
  var targetRot = 0;
  var curX = 0;
  var curY = 0;
  var curRot = 0;
  var rafId = null;
  var active = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function onPointerMove(event) {
    var rect = word.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = event.clientX - cx;
    var dy = event.clientY - cy;
    var dist = Math.hypot(dx, dy);

    if (dist < THRESHOLD) {
      var strength = 1 - dist / THRESHOLD;
      targetX = clamp(dx * 0.15, -MAX_OFFSET, MAX_OFFSET) * strength;
      targetY = clamp(dy * 0.15, -MAX_OFFSET, MAX_OFFSET) * strength;
      targetRot = clamp(dx * 0.02, -MAX_ROTATE, MAX_ROTATE) * strength;
      if (!word.classList.contains("is-active")) {
        word.classList.add("is-active");
      }
    } else {
      resetTarget();
    }
  }

  function resetTarget() {
    targetX = 0;
    targetY = 0;
    targetRot = 0;
    word.classList.remove("is-active");
  }

  function tick() {
    curX += (targetX - curX) * EASE;
    curY += (targetY - curY) * EASE;
    curRot += (targetRot - curRot) * EASE;
    word.style.transform =
      "translate3d(" + curX.toFixed(2) + "px, " + curY.toFixed(2) + "px, 0) rotate(" + curRot.toFixed(2) + "deg)";
    rafId = requestAnimationFrame(tick);
  }

  function enable() {
    if (active) return;
    active = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", resetTarget);
    window.addEventListener("blur", resetTarget);
    if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function disable() {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", resetTarget);
    window.removeEventListener("blur", resetTarget);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    resetTarget();
    word.style.transform = "";
  }

  function evaluate() {
    if (canHover.matches && !reducedMotion.matches) {
      enable();
    } else {
      disable();
    }
  }

  evaluate();

  // Alcuni browser permettono di cambiare queste preferenze "a caldo"
  // (es. attivando il risparmio energetico o cambiando dispositivo di
  // input): ci si adegua senza bisogno di ricaricare la pagina.
  if (typeof canHover.addEventListener === "function") {
    canHover.addEventListener("change", evaluate);
    reducedMotion.addEventListener("change", evaluate);
  } else if (typeof canHover.addListener === "function") {
    canHover.addListener(evaluate);
    reducedMotion.addListener(evaluate);
  }
})();
