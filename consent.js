/**
 * MENA MEH! Studio — Consenso cookie + Google Analytics 4 (Consent Mode, basic).
 *
 * Servizi approvati su questo sito: GitHub Pages, Adobe Fonts, Calendly
 * (semplice link esterno), Formspree, Google Analytics 4. Nessun altro
 * tracker viene installato da questo script o da qualunque altra pagina
 * del sito.
 *
 * Consent Mode "basic": gtag.js non viene MAI richiesto alla rete prima
 * che l'utente acconsenta alla categoria Analytics. Prima di quel momento
 * non parte alcuna richiesta verso google-analytics.com o
 * googletagmanager.com, nessun ping "cookieless" e nessun cookie Google
 * viene creato. Questo file è condiviso, invariato, da tutte le pagine
 * del sito (landing "Bello non basta.", /hello, Privacy Policy, Cookie
 * Policy): un'unica sorgente per stato del consenso, banner, pannello di
 * personalizzazione e caricamento di GA4.
 */
(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-MV76FJX2TD";
  var STORAGE_KEY = "mm_cookie_consent";
  var CONSENT_VERSION = 1;

  var state = null; // { version, categories: { necessary, analytics }, timestamp }
  var gaScriptLoaded = false;
  var root = null;
  var lastFocused = null;
  var trapHandler = null;

  // ---------- Stato del consenso (localStorage) ----------

  function readStoredConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.version === CONSENT_VERSION &&
        parsed.categories &&
        typeof parsed.categories.analytics === "boolean"
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  function writeStoredConsent(next) {
    state = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage non disponibile (es. navigazione privata): la scelta
      // resta valida solo per questa pagina, senza persistenza — non è un
      // errore bloccante.
    }
  }

  function hasAnalyticsConsent() {
    return !!(state && state.categories && state.categories.analytics === true);
  }

  // ---------- Google Consent Mode (stato di default) ----------
  // Push locale al dataLayer, zero rete: definisce lo stato "denied" prima
  // di qualunque eventuale script Google, anche se — in modalità "basic" —
  // gtag.js non viene comunque caricato finché l'utente non acconsente.

  window.dataLayer = window.dataLayer || [];
  function gtagStub() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtagStub;
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  function loadGA4() {
    if (gaScriptLoaded) return;
    gaScriptLoaded = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    // IP: nessun parametro personalizzato — si usano esclusivamente le
    // funzionalità di privacy native di GA4, senza alcun tentativo di
    // ricostruire l'indirizzo completo.
    window.gtag("config", GA_MEASUREMENT_ID);
  }

  function deleteGoogleAnalyticsCookies() {
    var existing = document.cookie.split(";").map(function (c) {
      return c.split("=")[0].trim();
    });
    var host = window.location.hostname;
    var domains = [host];
    if (host.indexOf("www.") === 0) {
      domains.push(host.slice(3));
    } else {
      domains.push("." + host);
    }
    existing.forEach(function (name) {
      if (name.indexOf("_ga") !== 0) return;
      domains.forEach(function (domain) {
        document.cookie =
          name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
      });
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }

  function revokeAnalytics() {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    deleteGoogleAnalyticsCookies();
    // gaScriptLoaded resta true di proposito: se lo script gtag.js è già
    // presente in questa pagina non può essere "scaricato", ma il segnale
    // di consenso negato blocca ulteriori misurazioni e i cookie _ga
    // vengono rimossi dove tecnicamente possibile. Al prossimo caricamento
    // di pagina, con la nuova preferenza salvata, GA4 non verrà più
    // richiesto.
  }

  function applyConsent(categories) {
    var wasAnalytics = hasAnalyticsConsent();
    var next = {
      version: CONSENT_VERSION,
      categories: { necessary: true, analytics: !!categories.analytics },
      timestamp: new Date().toISOString(),
    };
    writeStoredConsent(next);
    if (next.categories.analytics) {
      loadGA4();
    } else if (wasAnalytics) {
      revokeAnalytics();
    }
  }

  function trackEvent(name, params) {
    if (!hasAnalyticsConsent() || !gaScriptLoaded) return;
    window.gtag("event", name, params || {});
  }

  // ---------- UI: banner + pannello di personalizzazione ----------

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "mmc-root";
    document.body.appendChild(root);
    return root;
  }

  function bannerTemplate() {
    return (
      '<div id="mmc-banner" class="mmc-banner" role="region" aria-label="Preferenze cookie">' +
      '<p class="mmc-banner__text">Utilizziamo cookie tecnici necessari e, solo con il tuo consenso, Google Analytics per capire come viene utilizzato il sito e migliorarlo. Puoi accettare, rifiutare o personalizzare la tua scelta.</p>' +
      '<div class="mmc-banner__actions">' +
      '<button type="button" class="mmc-btn" id="mmc-accept">ACCETTA TUTTI</button>' +
      '<button type="button" class="mmc-btn" id="mmc-reject">RIFIUTA</button>' +
      '<button type="button" class="mmc-btn" id="mmc-customize">PERSONALIZZA</button>' +
      "</div>" +
      "</div>"
    );
  }

  function panelTemplate() {
    var analyticsChecked = hasAnalyticsConsent() ? " checked" : "";
    return (
      '<div id="mmc-overlay" class="mmc-overlay" hidden>' +
      '<div id="mmc-panel" class="mmc-panel" role="dialog" aria-modal="true" aria-labelledby="mmc-panel-title" aria-describedby="mmc-panel-desc">' +
      '<div class="mmc-panel__head">' +
      '<h2 id="mmc-panel-title" class="mmc-panel__title">Personalizza le preferenze cookie</h2>' +
      '<button type="button" class="mmc-panel__close" id="mmc-panel-close" aria-label="Chiudi">' +
      '<span aria-hidden="true">&times;</span>' +
      "</button>" +
      "</div>" +
      '<p id="mmc-panel-desc" class="mmc-panel__desc">Scegli quali categorie autorizzare. Puoi cambiare idea in qualsiasi momento da "Gestisci preferenze cookie", in fondo a ogni pagina.</p>' +
      '<div class="mmc-category">' +
      '<div class="mmc-category__head">' +
      '<span class="mmc-category__name">NECESSARI</span>' +
      '<span class="mmc-checkbox mmc-checkbox--locked" aria-hidden="true">' +
      '<input type="checkbox" checked disabled aria-label="Cookie necessari, sempre attivi">' +
      "</span>" +
      "</div>" +
      '<p class="mmc-category__desc">Sempre attivi. Servono al funzionamento del sito e alla memorizzazione delle preferenze.</p>' +
      "</div>" +
      '<div class="mmc-category">' +
      '<div class="mmc-category__head">' +
      '<label class="mmc-category__name" for="mmc-analytics-toggle">ANALYTICS</label>' +
      '<span class="mmc-checkbox">' +
      '<input type="checkbox" id="mmc-analytics-toggle"' +
      analyticsChecked +
      ">" +
      "</span>" +
      "</div>" +
      '<p class="mmc-category__desc">Disattivati per impostazione predefinita. Utilizzano Google Analytics 4 esclusivamente dopo il tuo consenso.</p>' +
      "</div>" +
      '<div class="mmc-panel__actions">' +
      '<button type="button" class="mmc-btn" id="mmc-save">SALVA PREFERENZE</button>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function hideBanner() {
    var banner = document.getElementById("mmc-banner");
    if (banner) banner.remove();
  }

  function showBanner() {
    ensureRoot();
    if (document.getElementById("mmc-banner")) return;
    root.insertAdjacentHTML("afterbegin", bannerTemplate());
    document.getElementById("mmc-accept").addEventListener("click", function () {
      applyConsent({ analytics: true });
      hideBanner();
    });
    document.getElementById("mmc-reject").addEventListener("click", function () {
      applyConsent({ analytics: false });
      hideBanner();
    });
    document.getElementById("mmc-customize").addEventListener("click", function () {
      openPanel();
    });
  }

  function wirePanel() {
    document.getElementById("mmc-panel-close").addEventListener("click", closePanel);
    document.getElementById("mmc-overlay").addEventListener("click", function (e) {
      if (e.target && e.target.id === "mmc-overlay") closePanel();
    });
    document.getElementById("mmc-save").addEventListener("click", function () {
      var toggle = document.getElementById("mmc-analytics-toggle");
      applyConsent({ analytics: !!(toggle && toggle.checked) });
      closePanel();
      hideBanner();
    });
  }

  function openPanel() {
    ensureRoot();
    if (!document.getElementById("mmc-overlay")) {
      root.insertAdjacentHTML("beforeend", panelTemplate());
      wirePanel();
    } else {
      var toggle = document.getElementById("mmc-analytics-toggle");
      if (toggle) toggle.checked = hasAnalyticsConsent();
    }

    lastFocused = document.activeElement;
    var overlay = document.getElementById("mmc-overlay");
    var panel = document.getElementById("mmc-panel");
    overlay.hidden = false;

    var focusables = getFocusable(panel);
    if (focusables.length) focusables[0].focus();

    trapHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePanel();
        return;
      }
      if (e.key !== "Tab") return;
      var items = getFocusable(panel);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapHandler);
  }

  function closePanel() {
    var overlay = document.getElementById("mmc-overlay");
    if (overlay) overlay.hidden = true;
    if (trapHandler) {
      document.removeEventListener("keydown", trapHandler);
      trapHandler = null;
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function openPreferences() {
    // Usato dal comando "Gestisci preferenze cookie" presente in ogni
    // footer: riapre il pannello con lo stato attualmente salvato,
    // indipendentemente dal fatto che il banner iniziale sia già stato
    // chiuso in passato.
    openPanel();
  }

  function wireFooterTriggers() {
    var triggers = document.querySelectorAll("[data-cookie-preferences]");
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function (e) {
        e.preventDefault();
        openPreferences();
      });
    }
  }

  function init() {
    state = readStoredConsent();
    if (state && state.categories.analytics) {
      loadGA4();
    } else if (!state) {
      showBanner();
    }
    // Se lo stato salvato rifiuta Analytics, non si fa nulla: nessuno
    // script Google viene richiesto, come da Consent Mode "basic".
    wireFooterTriggers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.mmConsent = {
    hasAnalyticsConsent: hasAnalyticsConsent,
    openPreferences: openPreferences,
    trackEvent: trackEvent,
  };
})();
