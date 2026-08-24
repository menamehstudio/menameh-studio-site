/**
 * MENA MEH! Studio — micro-interazione "Bello non basta."
 *
 * La parola "BELLO" si "riempie" di colore quando il cursore le si
 * avvicina — per rappresentare visivamente che l'estetica da sola è
 * instabile, superficiale, reattiva. "NON BASTA." non viene mai toccata
 * da questo script: resta solida e ferma.
 *
 * IMPORTANTE: questo script non seleziona ".headline__word--bello" per
 * spostarla, ruotarla o scalarla. L'unico effetto applicato è l'aggiunta/
 * rimozione della classe "is-active", che in concept.css cambia
 * esclusivamente colore e colore del contorno (proprietà cromatiche,
 * transizionate via CSS) — mai una trasformazione. Questo per evitare un
 * artefatto di rendering di "-webkit-text-stroke" osservato su Safari/
 * macOS quando l'elemento viene animato o promosso a un livello
 * compositato in GPU (will-change, transform, o animazioni/transizioni
 * che le usano): nessuna di queste proprietà viene più applicata a
 * ".headline__word--bello", né qui né in CSS.
 *
 * L'effetto:
 * - è attivo solo su dispositivi con puntatore preciso e hover reale
 *   (mouse/trackpad) E con viewport oltre 600px — mai su touch, e mai
 *   sotto i 600px anche se il puntatore fosse un mouse (es. finestra del
 *   browser desktop ridimensionata stretta): sotto quella soglia
 *   ".headline__word--bello" è verde pieno fisso via CSS (vedi
 *   concept.css) e questo script non le applica mai classi, stili o
 *   listener, così non può in nessun caso alterarne aspetto o timing;
 * - è disattivato se l'utente preferisce ridurre le animazioni
 *   (prefers-reduced-motion: reduce);
 * - è puramente decorativo: senza JavaScript, "BELLO" resta comunque
 *   visibile (contorno su desktop, pieno verde su mobile, entrambi
 *   definiti staticamente in CSS).
 */
(function () {
  "use strict";

  var word = document.querySelector(".headline__word--bello");
  if (!word) return;

  // "(min-width: 601px)" nella stessa query: matchMedia rivaluta ed emette
  // "change" anche quando è la larghezza della viewport a variare (non solo
  // hover/pointer), quindi ridimensionare la finestra sotto i 600px disattiva
  // l'interazione dal vivo, senza bisogno di un listener separato su resize.
  var canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 601px)"
  );
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var THRESHOLD = 260; // px — raggio entro cui la parola reagisce (solo colore)
  var active = false;

  function onPointerMove(event) {
    var rect = word.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = event.clientX - cx;
    var dy = event.clientY - cy;
    var dist = Math.hypot(dx, dy);

    if (dist < THRESHOLD) {
      if (!word.classList.contains("is-active")) {
        word.classList.add("is-active");
      }
    } else {
      word.classList.remove("is-active");
    }
  }

  function resetActive() {
    word.classList.remove("is-active");
  }

  function enable() {
    if (active) return;
    active = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", resetActive);
    window.addEventListener("blur", resetActive);
  }

  function disable() {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", resetActive);
    window.removeEventListener("blur", resetActive);
    resetActive();
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
