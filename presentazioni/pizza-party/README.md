# Pizza Party × MENA MEH! — Brand Identity Presentation

Landing page narrativa one-page per la presentazione delle proposte di identità visiva di Pizza Party, firmata MENA MEH! — Independent Creative & Strategy Studio.

## Versioni

- `site-v1/` — snapshot salvato: sfondo generale `#dbd4c2`, motion di base (reveal fade/translate, logo reveal con clip-path).
- `site/` — versione corrente: sfondo generale `#e5e3e3`, motion potenziato con reveal a mascherina per riga sui titoli, cursore custom e hover magnetici, reveal delle immagini con wipe (clip-path) invece del semplice fade. Nessun asset o codice è stato copiato da siti di riferimento: le tecniche (mask reveal, cursore magnetico, wipe) sono pattern generici del settore, reimplementati da zero.

## Avvio locale

Nessuna build richiesta: HTML/CSS/JS statici, librerie (GSAP, ScrollTrigger, Lenis) caricate da CDN.

```bash
cd site
python3 -m http.server 8000
```

Poi apri `http://localhost:8000`. (Aprire `index.html` direttamente da filesystem funziona ma alcuni browser limitano il caricamento di immagini locali: preferire sempre un server locale.)

## Pubblicazione

Il progetto è una cartella statica: può essere pubblicato così com'è su qualunque hosting statico (Netlify, Vercel, Cloudflare Pages, un semplice S3/CDN, o lo spazio hosting di MENA MEH!). Basta caricare l'intera cartella `site/` mantenendo la struttura di `assets/`.

## Struttura

```
site/
├── index.html          contenuti e struttura di tutta la pagina
├── styles.css           design system, layout, motion (stato base + reveal)
├── script.js             Lenis + GSAP/ScrollTrigger, nav, confronto, viewer fullscreen
├── assets/
│   ├── logos/
│   │   ├── attuale/        logo attualmente in uso dal cliente (solo per "punto di partenza")
│   │   ├── mena-meh/       loghi originali dello studio (SVG non modificati)
│   │   ├── proposta-01/    loghi originali proposta 01 (SVG non modificati)
│   │   └── proposta-02/    loghi originali proposta 02 (SVG non modificati)
│   └── img/
│       ├── misc/            immagine di sfondo della Hero (da mockup/HERO.png)
│       ├── proposta-01/    mockup fotografici proposta 01 (JPEG ottimizzati da PNG originali)
│       └── proposta-02/    mockup fotografici proposta 02 (JPEG ottimizzati da PNG originali)
```

Tutti i loghi sono i file vettoriali originali forniti, non ricostruiti né alterati. I mockup fotografici sono gli stessi PNG originali, solo ridimensionati e compressi in JPEG per il web (nessun contenuto modificato).

## Sezioni realizzate

1. **Intro** — sigla "MENA MEH! PRESENTS", saltabile, disattivata automaticamente con `prefers-reduced-motion`.
2. **Hero** — reveal tipografico "PIZZA PARTY", tagline, firma studio, invito allo scroll.
3. **FUTURE LAB — Introduzione** (`#future-lab`) — pausa editoriale dopo la hero: presenta il metodo di analisi che precede il progetto (logo, menu, presenza digitale, contesto locale), non FUTURE LAB come prodotto a sé. Dettaglio grafico minimale (linea + indice "01 → 03") ispirato all'idea di osservazione, nota fonte discreta con data dell'analisi.
4. **FUTURE LAB — Tre evidenze strategiche** (`#strategic-insights`) — composizione scroll-based, non a card: tre insight con numero in scala (sticky su desktop, in sequenza su mobile), titolo, testo e keyword come elemento tipografico. Chiude con una fascia di 4 proof point (formati, pizze a nome locale, recensioni Google, consegna diretta) trattati come sintesi fotografata a una data, non come KPI promozionali.
5. **Il punto di partenza** — aggiornata per essere conseguente all'analisi: headline "Un segno conosciuto. Un sistema da evolvere.", mantiene logo attuale e dicitura "Deliveroo" già citata nel briefing.
6. **La sfida** — headline "Una sola voce. In ogni punto di contatto." + marquee aggiornato (Coerenza / Distinzione / Specificità / Flessibilità), coerente con le tre evidenze.
7. **Dal logo al sistema** — introduzione alle due proposte (invariata).
8. **Proposta 01 — "Tradizione, rivista"** — intro, logo reveal, anatomia (varianti + palette), applicazioni (insegna, packaging, menu, divisa, delivery, lifestyle, sito desktop/mobile), sintesi.
9. **Proposta 02 — "L'energia del party"** — stessa struttura della proposta 01, stessa quantità di contenuto, nessun trattamento privilegiato.
10. **Confronto** — modulo interattivo che alterna le due proposte (logo, palette, headline) mantenendo condizioni identiche.
11. **Chiusura** — domande guida alla scelta, headline finale, firma "Pizza Party × MENA MEH!".

### Integrazione FUTURE LAB

Le due nuove sezioni sintetizzano `briefing/LAB_CREATIVE_INTELLIGENCE_BRIEF.pdf` e `briefing/LAB_VISUAL_DIRECTION_BRIEF_SABRINA.pdf` (analisi di Luca via MENA MEH! FUTURE LAB, 3 settembre 2026) in tre evidenze concrete — non un giudizio estetico, ma il ponte tra ricerca e proposte creative. Non è stato riportato l'intero contenuto dei due documenti: solo le tre evidenze concordate e i quattro proof point, senza nominare concorrenti né usare toni giudicanti sulle criticità rilevate.

### Navigazione

Voci: **Intro** (`#hero`) · **Analisi** (`#future-lab`) · **Proposta 01** · **Proposta 02** · **Confronto** — su desktop, mobile e nel rilevamento automatico della sezione attiva. La voce "Analisi" resta evidenziata sia durante `#future-lab` sia durante `#strategic-insights` (mappatura in `script.js`, funzione `navController`).

### Animazioni aggiunte con FUTURE LAB

- Linea "scan" che si disegna (`scaleX`) sotto il body copy di `#future-lab`, a rappresentare l'idea di osservazione senza icone o lenti d'ingrandimento.
- Numeri degli insight (01/02/03) che passano da opacità ridotta a piena mentre il rispettivo blocco entra nello scroll, con numero **sticky** su desktop (rimosso su mobile per non compromettere la lettura).
- Titoli degli insight riusano il reveal a mascherina per riga già presente sui titoli del sito (classe `.display-headline`, variante `.display-headline--sm`).
- Proof point con reveal verticale e stagger, senza counter numerici che partono da zero (evitato di proposito per non farli somigliare a KPI commerciali).

Tutto integrato con Lenis + ScrollTrigger esistenti, senza nuove librerie; rispetta `prefers-reduced-motion` e il toggle manuale "Riduci animazioni".

Navigazione fissa con indicatore di sezione attiva, barra di avanzamento scroll, menu mobile fullscreen, toggle "Riduci animazioni" (oltre al rispetto automatico di `prefers-reduced-motion`), viewer fullscreen per i mockup (tastiera: Tab/Invio per aprire, Esc per chiudere).

## Cosa manca o resta da confermare

Il briefing (`briefing/PIZZA_PARTY_BRIEFING.md`) segnala diversi campi **[DA CONFERMARE]** non presenti negli asset forniti. Non sono stati inventati e restano da completare prima della consegna cliente definitiva:

- Denominazione ufficiale dell'attività, indirizzo completo, anno di apertura (nel materiale grafico di proposta 01 compare "dal 1986", nei documenti FUTURE LAB si citano sia 1973 sia 1986: **non verificato, non usato in landing**).
- Nomi e ruoli reali del cliente e del referente commerciale.
- Contatti, URL e profili social ufficiali (il footer e il CTA "Ordina" nei mockup sono parte delle immagini, non collegamenti funzionanti).
- Orari reali e area di consegna: nei documenti FUTURE LAB risultano versioni leggermente diverse tra menu e presenza web. Non riportati in landing finché non confermati dal cliente.
- Il dato "260+ recensioni Google" nella fascia proof point è **fotografato al 3 settembre 2026** (data dell'analisi FUTURE LAB): va aggiornato o ri-verificato se la presentazione avviene a distanza di tempo.
- La consegna diretta è presentata come fatto operativo ("gestita direttamente"), senza promesse di velocità, gratuità o copertura geografica non confermate.
- Una eventuale terza proposta: non presente negli asset, quindi non mostrata (la pagina è già predisposta a restare coerente con 2 sole proposte).
- Il file `mockup/proposta-01/Presentazione_progetto_animazione.mp4` non è stato incluso nella pagina per mantenere parità di trattamento tra le due proposte (nessun equivalente esiste per la proposta 02). Può essere aggiunto in un secondo momento come contenuto extra se lo si desidera mostrare comunque.

## Dove sostituire facilmente testi o immagini

- **Copy**: tutti i testi sono in chiaro dentro `index.html`, organizzati con commenti HTML per sezione numerata (coerenti con `copy/PIZZA_PARTY_COPY_LANDING.md`).
- **Nomi/concept delle proposte**: cercare `proposal__name` e `proposal__concept-headline` in `index.html` per ciascuna delle due sezioni `<section id="proposta-01">` / `<section id="proposta-02">`.
- **Palette**: variabili CSS inline su ciascun `<section class="proposal" style="--p-bg:…">` in `index.html`, più i colori duplicati nello switch di confronto in `script.js` (oggetto `data` dentro la funzione `compare()`).
- **Immagini**: sostituire i file in `assets/img/proposta-0X/` mantenendo lo stesso nome file, oppure aggiornare i percorsi `src` corrispondenti in `index.html`.
- **Loghi**: sostituire gli SVG in `assets/logos/` mantenendo lo stesso nome file (i riferimenti in HTML e CSS non cambiano).
- **Evidenze FUTURE LAB / proof point**: testi in chiaro dentro `<section id="strategic-insights">` in `index.html` (blocchi `.insight` e `.proof-point`); aggiornare qui se cambia la data dell'analisi o il conteggio recensioni.

## Verifica effettuata

Testato in locale (desktop, mobile 375px, tablet) tramite server statico: nessun errore in console, transizioni e sezioni verificate una per una, confronto interattivo testato, viewer fullscreen testato, `prefers-reduced-motion` e toggle manuale testati, focus da tastiera verificato (skip-link, viewer, Escape).

**Verifica aggiuntiva dopo l'integrazione FUTURE LAB**: hero non alterata; `#future-lab` e `#strategic-insights` compaiono subito dopo la hero e prima di `#punto-di-partenza`; nessuna ripetizione di frasi tra le nuove sezioni e `.challenge`/`.vision`; voce di navigazione "Analisi" testata attiva sia su `#future-lab` sia su `#strategic-insights` (desktop e mobile); numeri sticky degli insight testati su desktop, sequenza verticale testata su mobile 375px; proof point verificati senza counter numerici; `prefers-reduced-motion` e toggle manuale ritestati sulle nuove animazioni (linea di scan, numeri insight, mascherina titoli); nessuno scroll orizzontale introdotto; loghi, proposte e mockup esistenti non modificati.
