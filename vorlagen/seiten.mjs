// HTML-Vorlagen für build.mjs. Reine Funktionen: Daten rein, HTML-Text raus.
// Texte kommen aus i18n/<sprache>.json (Funktion t), Betriebsdaten aus konfiguration.json, Fahrzeuge aus cars.json.

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = encodeURIComponent;

const SYMBOLE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-pfeil" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-zurueck" viewBox="0 0 24 24"><path d="M20 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-tel" viewBox="0 0 24 24"><path d="M5 3.5h3.6l1.8 4.6-2.3 1.5a11 11 0 0 0 6.3 6.3l1.5-2.3 4.6 1.8V19a1.6 1.6 0 0 1-1.7 1.5C10.8 20 4 13.2 3.5 5.2A1.6 1.6 0 0 1 5 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M4.2 19.8l1.1-4A8.2 8.2 0 1 1 8.4 19z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.2c.2-.5.6-.5.9-.5l.6 1.4-.6.9c.5 1.1 1.3 1.9 2.4 2.4l.9-.6 1.4.6c0 .4 0 .8-.5 1.1-.6.4-1.5.4-2.4 0a7 7 0 0 1-3-3c-.4-.9-.3-1.7.3-2.3Z" fill="currentColor"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-siegel" viewBox="0 0 24 24"><path d="M12 2.8l7.5 2.8v5.8c0 4.6-3.1 8.2-7.5 9.8-4.4-1.6-7.5-5.2-7.5-9.8V5.6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.4 12.1l2.6 2.6 4.8-5.2" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-gutachten" viewBox="0 0 24 24"><path d="M14.5 3H6.2A1.2 1.2 0 0 0 5 4.2v15.6A1.2 1.2 0 0 0 6.2 21h5.3M14.5 3 19 7.5v3M14.5 3v4.5H19M8 9h5M8 12.5h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16.6" cy="16.4" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M18.8 18.6 21 20.8" stroke="currentColor" stroke-width="1.8"/></symbol>
  <symbol id="i-kennzeichen" viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 7v10" stroke="currentColor" stroke-width="1.6"/><path d="M9 12h8M14.5 9.5 17 12l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-tuev" viewBox="0 0 24 24"><path d="M3.5 16a8.5 8.5 0 1 1 17 0" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 16l4-5.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="16" r="1.6" fill="currentColor"/><path d="M6 16H3.5M20.5 16H18M12 7.5V10" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-bericht" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="i-lenkrad" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.8 10.5c5.4-1.8 11-1.8 16.4 0M12 14.2V20.4" stroke="currentColor" stroke-width="1.6" fill="none"/></symbol>
  <symbol id="i-3d" viewBox="0 0 24 24"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z M4 7.5l8 4.5 8-4.5M12 12v9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  <symbol id="i-360" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 15.8l2.4.9-1 2.3" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
</svg>`;

export function rahmen({ s, lang, basis, titel, beschreibung, css, js = [], body, jsonld = [], robots, canonical, aktiv, ogBild = '' }) {
  const { t, k } = s;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="${lang}" ${s.anim}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="kmc-build">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschreibung)}">
${robots ? `<meta name="robots" content="${robots}">\n` : ''}${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n` : ''}${(s.sprachen && s.sprachen.length > 1) ? s.sprachen.map((x) => `<link rel="alternate" hreflang="${x.code}" href="${x.href}">`).join('\n') + '\n' : ''}<meta name="theme-color" content="#141416">
<link rel="icon" href="${basis}assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${basis}assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${basis}assets/apple-touch-icon.png">
<link rel="preload" href="${basis}assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
${css.map((c) => `<link rel="stylesheet" href="${basis}assets/css/${c}">`).join('\n')}
<style id="design">${s.design}</style>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beschreibung)}">
${ogBild ? `<meta property="og:image" content="${esc(ogBild)}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
${ld}
</head>
<body>
<a class="sprung" href="#inhalt">${t('allgemein.sprung')}</a>
${SYMBOLE}
${kopf({ s, basis, aktiv })}
<main id="inhalt">
${body}
</main>
${fuss({ s, basis })}
${schnell({ s, waText: s.waText })}
<script src="${basis}assets/js/app.js" defer></script>
${js.map((j) => `<script src="${basis}assets/js/${j}" defer></script>`).join('\n')}
</body>
</html>
`;
}

function kopf({ s, basis, aktiv }) {
  const { t, k } = s;
  const start = aktiv === 'start';
  const z = (anker) => (start ? `#${anker}` : `${s.l}index.html#${anker}`);
  const sichtbar = sichtbareAbschnitte(s.cfg).map((x) => x.id);
  const nav = sichtbar.filter((id) => ['bestand', 'leistungen', 'kontakt'].includes(id)).map((id) => [id, t(`allgemein.nav_${id}`)]);
  return `<header class="kopf"${s.marken ? ' data-abschnitt="kopf"' : ''}>
  <div class="innen">
    <a class="kopf__logo" href="${start ? '#inhalt' : `${s.l}index.html`}" aria-label="${t('allgemein.logo_start')}"><img src="${basis}assets/logo/kmc-logo.svg" width="946" height="268" alt=""></a>
    <nav class="kopf__nav" aria-label="${t('allgemein.nav_haupt')}">
      <ul>
${nav.map(([a, n]) => `        <li><a class="strich" href="${z(a)}"${aktiv === 'fahrzeug' && a === 'bestand' ? ' aria-current="page"' : ''}>${n}</a></li>`).join('\n')}
      </ul>
    </nav>
${s.sprachen && s.sprachen.length > 1 ? `    <nav class="sprachen" aria-label="${t('allgemein.sprachwahl')}"><ul>${s.sprachen.map((x) => `<li><a href="${x.href}" hreflang="${x.code}" lang="${x.code}"${x.aktiv ? ' aria-current="true"' : ''}>${x.code.toUpperCase()}</a></li>`).join('')}</ul></nav>
` : ''}    <a class="kopf__tel" href="tel:${k.telefonLink}">${s.m('cfg:betrieb.telefon', k.telefon)}</a>
    <a class="knopf knopf--voll" href="${aktiv === 'fahrzeug' ? '#anfrage' : sichtbar.includes('kontakt') ? z('kontakt') : `tel:${k.telefonLink}`}">${t('allgemein.anfragen')}</a>
    <details class="menue">
      <summary><span aria-hidden="true"><i></i><i></i><i></i></span>${t('allgemein.menue')}</summary>
      <nav class="menue__panel" aria-label="${t('allgemein.menue')}">
        <ul>
${nav.map(([a, n]) => `          <li><a href="${z(a)}">${n}</a></li>`).join('\n')}
          <li><a href="tel:${k.telefonLink}">${t('allgemein.anrufen_nummer', { telefon: k.telefon })}</a></li>
        </ul>
      </nav>
    </details>
  </div>
</header>`;
}

function fuss({ s, basis }) {
  const { t, k, liste } = s;
  return `<footer class="fuss"${s.marken ? ' data-abschnitt="fuss"' : ''}>
  <div class="innen">
    <div class="fuss__raster">
      <div class="fuss__marke">
        <img src="${basis}assets/logo/kmc-logo.svg" width="946" height="268" alt="${t('allgemein.logo_alt')}" loading="lazy">
        <p>${s.m('cfg:betrieb.name', k.name)}</p>
      </div>
      <div>
        <h2>${t('fuss.adresse')}</h2>
        <address>${s.m('cfg:betrieb.strasse', k.strasse)}<br>${s.m('cfg:betrieb.plz', k.plz)} ${s.m('cfg:betrieb.ort', k.ort)}<br><a href="tel:${k.telefonLink}">${s.m('cfg:betrieb.telefon', k.telefon)}</a><br><a href="mailto:${k.email}">${s.m('cfg:betrieb.email', k.email)}</a></address>
      </div>
      <div>
        <h2>${t('fuss.zeiten')}</h2>
${[...s.zeiten.zeilen, s.zeiten.geschlossen].map((z) => `        <p>${s.m('cfg:betrieb.oeffnungszeiten', z)}</p>`).join('\n')}
      </div>
      <div>
        <h2>${t('fuss.leistungen')}</h2>
        <ul>
${liste('leistungen.liste').map((l) => `          <li>${String(l.titel).replace(/&shy;/g, '')}</li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>${t('fuss.mehr')}</h2>
        <ul>
          <li><a href="${k.mobilede}" rel="noopener">${t('allgemein.mobilede')}</a></li>
          <li><a href="${basis}impressum.html">${t('fuss.impressum')}</a></li>
          <li><a href="${basis}datenschutz.html">${t('fuss.datenschutz')}</a></li>
        </ul>
      </div>
    </div>
    <div class="fuss__ende">
      <p>${t('fuss.entwurf')}</p>
      <p>${t('fuss.namensnennung')} ${t('fuss.stimmung')}</p>
    </div>
  </div>
</footer>`;
}

function schnell({ s, waText }) {
  const { t, k } = s;
  return `<nav class="schnell" aria-label="${t('allgemein.schnell')}">
  <a class="knopf knopf--linie" href="tel:${k.telefonLink}"><svg aria-hidden="true"><use href="#i-tel"/></svg>${t('allgemein.anrufen')}</a>
  <a class="knopf knopf--voll" href="${waLink(k, waText || t('allgemein.wa_frage'))}" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>${t('allgemein.whatsapp')}</a>
</nav>`;
}

export const waLink = (k, text) => `https://wa.me/${k.whatsappLink}?text=${enc(text)}`;

// ---------- Startseite ----------

export function startseite({ s, autos }) {
  const { t, k, liste, bild, b, l, cfg } = s;
  const hb = { src: 'assets/bilder/hero-auto-1400.webp', fokus: '50% 50%', punkte: true, ...(cfg.bilder?.held || {}) };
  const heldDemo = s.demo(hb.src);
  const effekt = (id) => (cfg.animation?.effekte?.[id] || 'von-unten');
  const ma = (id) => (s.marken ? ` data-abschnitt="${id}"` : '');
  const reihe = sichtbareAbschnitte(cfg).map((x) => x.id);
  const nr = (id) => String(reihe.filter((x) => ['bestand', 'leistungen', 'kontakt'].includes(x)).indexOf(id) + 1).padStart(2, '0');
  const marken = [...new Set(autos.map((a) => a.make))];
  const kraftstoffe = [...new Set(autos.map((a) => a.fuel))];
  const preise = autos.map((a) => a.preisZahl).filter(Boolean);
  const schritte = preisSchritte(preise);
  const alleBeispiel = autos.every((a) => a.sample);
  const held = `<section class="held" aria-labelledby="held-titel"${ma('held')}>
  <div class="held__raum" aria-hidden="true"${cfg.bilder?.raum?.src ? ` style="background-image: url(${b}${cfg.bilder.raum.src})"` : ''}></div>
  <div class="held__riese" aria-hidden="true">${esc(cfg.riese || 'KMC')}</div>
  <div class="held__glanz" aria-hidden="true"></div>
  <div class="innen held__innen">
    <div class="held__kopf">
      <p class="kennung"><span class="raute" aria-hidden="true">${t('held.raute')}</span>${t('held.kennung')}</p>
      <h1 id="held-titel" class="versal held__titel"><span class="maske"><span>${t('held.titel_1')}</span></span> <span class="maske"><span class="fein kupfertext">${t('held.titel_2')}</span></span> <span class="maske"><span class="fein kupfertext">${t('held.titel_3').replace(/ (\S+)$/, '&nbsp;$1')}</span></span></h1>
    </div>
    <div class="held__mehr">
      <p class="held__satz">${t('held.satz')}</p>
      <div class="held__knoepfe">
        <a class="knopf knopf--voll" href="#bestand">${t('held.knopf_bestand')} <svg aria-hidden="true"><use href="#i-pfeil"/></svg></a>
        <a class="knopf knopf--linie" href="#kontakt">${t('held.knopf_besichtigung')}</a>
      </div>
    </div>
    <figure class="held__auto">
      <div class="held__bild">
        <img class="held__unscharf" src="${b}${s.klein(hb.src)}" ${s.mass(hb.src)} alt="" aria-hidden="true"${hb.fokus && hb.fokus !== '50% 50%' ? ` style="object-position: ${hb.fokus}"` : ''}>
        ${bild(hb.src, { klasse: 'held__scharf', alt: t('held.auto_alt'), sizes: '(min-width: 1100px) 60vw, 100vw', prio: true, fokus: hb.fokus, marke: 'cfg:bilder.held' })}
        <span class="held__blitz" aria-hidden="true"></span>
      </div>
${heldDemo && hb.punkte !== false ? `      <ul class="held__punkte" aria-label="${t('held.punkte')}">
        <li style="--x:37.98%;--y:43.48%"><span>${t('held.punkt_scheinwerfer')}</span></li>
        <li style="--x:61.01%;--y:60.31%"><span>${t('held.punkt_felge')}</span></li>
        <li style="--x:75.04%;--y:9.56%"><span>${t('held.punkt_innenraum')}</span></li>
      </ul>` : ''}
      <figcaption class="held__demo">${heldDemo ? `<span class="demo-hinweis">${t('allgemein.demo_hinweis')}</span> ` : ''}${autos.find((a) => a.hotspots.length) ? `<a class="strich" href="${l}fahrzeug/${autos.find((a) => a.hotspots.length).id}/index.html#stellen">${t('held.so_zeigen')}</a>` : ''}</figcaption>
    </figure>

    <form class="suche" action="#bestand" method="get" role="search" aria-label="${t('suche.label')}">
      <div class="suche__feld">
        <label for="s-marke">${t('suche.marke')}</label>
        <select id="s-marke" name="marke">
          <option value="">${t('suche.alle')}</option>
${marken.map((m) => `          <option value="${esc(m)}">${esc(m === 'Mercedes-Benz' ? 'Mercedes' : m)}</option>`).join('\n')}
        </select>
      </div>
      <div class="suche__feld">
        <label for="s-kraftstoff">${t('suche.kraftstoff')}</label>
        <select id="s-kraftstoff" name="kraftstoff">
          <option value="">${t('suche.alle')}</option>
${kraftstoffe.map((f) => `          <option>${esc(f)}</option>`).join('\n')}
        </select>
      </div>
      <div class="suche__feld">
        <label for="s-preis">${t('suche.preis')}</label>
        <select id="s-preis" name="preis">
          <option value="">${t('suche.beliebig')}</option>
${schritte.map((p) => `          <option value="${p}">${tausender(p)} €</option>`).join('\n')}
        </select>
      </div>
      <div class="suche__feld">
        <label for="s-sort">${t('suche.sortierung')}</label>
        <select id="s-sort" name="sort">
          <option value="">${t('suche.sort_standard')}</option>
          <option value="preis">${t('suche.sort_preis')}</option>
          <option value="preis-ab">${t('suche.sort_preis_ab')}</option>
          <option value="km">${t('suche.sort_km')}</option>
          <option value="jahr">${t('suche.sort_jahr')}</option>
        </select>
      </div>
      <button class="knopf knopf--voll suche__knopf" type="submit">${t('suche.knopf')} <svg aria-hidden="true"><use href="#i-pfeil"/></svg></button>
    </form>
  </div>
</section>`;

  const werte = `<section class="werte" aria-label="${t('werte.label')}" data-effekt="${effekt('werte')}"${ma('werte')}>
  <div class="innen">
    <ul class="werte__liste">
      <li class="zeigen"><strong><small>${t('werte.garantie_bis')}</small> <span class="zahl" data-zaehlen="24">24</span> ${t('werte.garantie_wert')}</strong><span class="werte__titel">${t('werte.garantie_titel')}</span><span class="werte__klein">${t('werte.garantie_klein')} <em class="platzhalter">${t('allgemein.folgen')}</em></span></li>
      <li class="zeigen" style="--verz:80ms"><strong>${t('werte.dekra_wert')}</strong><span class="werte__titel">${t('werte.dekra_titel')}</span><span class="werte__klein">${t('werte.dekra_klein')}</span></li>
      <li class="zeigen" style="--verz:160ms"><strong><span class="zahl" data-zaehlen="${(k.sprachen || []).length}">${(k.sprachen || []).length}</span> ${t('werte.sprachen_wert')}</strong><span class="werte__titel">${t('werte.sprachen_titel')}</span><span class="werte__klein">${t('werte.sprachen_klein')}</span></li>
      <li class="zeigen" style="--verz:240ms"><strong>${t('werte.zeiten_wert')}</strong><span class="werte__titel">${t('werte.zeiten_titel')}</span><span class="werte__klein">${t('werte.zeiten_klein')}</span></li>
    </ul>
  </div>
</section>`;

  const bestand = `<section class="bestand" id="bestand" aria-labelledby="bestand-titel" data-effekt="${effekt('bestand')}"${ma('bestand')}>
  <div class="innen">
    <div class="kopfzeile zeigen">
      <div>
        <p class="kennung"><span class="raute" aria-hidden="true">${nr('bestand')}</span>${t('bestand.kennung')}</p>
        <h2 id="bestand-titel" class="versal h2">${t('bestand.titel_1')} <span class="fein">${t('bestand.titel_2')}</span></h2>
      </div>
      <a class="mehr-link strich" href="${k.mobilede}" rel="noopener">${t('allgemein.mobilede')} <svg aria-hidden="true"><use href="#i-pfeil"/></svg></a>
    </div>
    ${autos.length ? '' : `<p class="bestand__leer">${t('bestand.leer')}</p>`}
    <p class="bestand__status" id="treffer" role="status" data-gesamt="${autos.length}" data-t-alle="${esc(t('suche.treffer_alle'))}" data-t-einer="${esc(t('suche.treffer_einer'))}" data-t-mehrere="${esc(t('suche.treffer_mehrere'))}" data-t-keiner="${esc(t('suche.treffer_keiner'))}">${alleBeispiel ? t('bestand.status_beispiel', { n: zahlwort(s, autos.length) }) : t('bestand.status', { n: autos.length })}</p>
    <ul class="karten">
${autos.map((a, i) => karte({ s, a, i })).join('\n')}
    </ul>
  </div>
</section>`;

  const leistungen = `<section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel" data-effekt="${effekt('leistungen')}"${ma('leistungen')}>
  <div class="innen leistungen__raster">
    <div class="leistungen__kopf zeigen">
      <p class="kennung"><span class="raute" aria-hidden="true">${nr('leistungen')}</span>${t('leistungen.kennung')}</p>
      <h2 id="leistungen-titel" class="versal h2">${t('leistungen.titel_1')} <span class="fein">${t('leistungen.titel_2')}</span></h2>
      <p>${t('leistungen.intro')}</p>
      <a class="knopf knopf--linie" href="#kontakt">${t('leistungen.knopf')}</a>
    </div>
    <div class="leistungen__liste">
${liste('leistungen.liste').map((l) => `      <details class="zeile zeigen">
        <summary>
          <span class="zeile__symbol" aria-hidden="true"><svg><use href="#${l.icon}"/></svg></span>
          <span class="zeile__titel"><strong>${l.titel}</strong><span>${l.kurz}</span></span>
          <span class="zeile__plus" aria-hidden="true"></span>
        </summary>
        <div class="zeile__text"><p>${l.text}</p></div>
      </details>`).join('\n')}
    </div>
${cfg.startseite?.ablaufZeigen === false ? '' : `    <div class="ablauf" id="ablauf"${ma('ablauf')}>
      <div class="ablauf__kopf">
        <h3 class="ablauf__titel">${t('leistungen.ablauf_titel')}</h3>
        <p class="ablauf__hinweis">${t('leistungen.ablauf_hinweis')}</p>
      </div>
      <ol class="band">
${liste('leistungen.schritte').map((st, i) => `        <li class="zeigen" style="--verz:${i * 90}ms">
          ${bild((cfg.bilder?.schritte || [])[i] || `assets/bilder/schritt-${i + 1}-480.webp`, { alt: st.alt, sizes: '(min-width: 1100px) 16vw, (min-width: 900px) 25vw, 50vw', lazy: true, marke: `cfg:bilder.schritte.${i}` })}
          <div class="band__text"><span class="band__nr">${String(i + 1).padStart(2, '0')}</span><strong>${st.titel}</strong><span>${st.text}</span></div>
        </li>`).join('\n')}
      </ol>
    </div>`}
  </div>
</section>`;

  const kontakt = `<section class="kontakt" id="kontakt" aria-labelledby="kontakt-titel" data-effekt="${effekt('kontakt')}"${ma('kontakt')}>
  <div class="innen kontakt__raster">
    <div class="kontakt__text zeigen">
      <p class="kennung"><span class="raute" aria-hidden="true">${nr('kontakt')}</span>${t('kontakt.kennung')}</p>
      <h2 id="kontakt-titel" class="versal h2">${t('kontakt.titel_1')} <span class="fein">${t('kontakt.titel_2')}</span></h2>
      <p>${t('kontakt.intro')}</p>
      <dl class="kontakt__daten">
        <div><dt>${t('kontakt.adresse')}</dt><dd>${s.m('cfg:betrieb.strasse', k.strasse)}, ${s.m('cfg:betrieb.plz', k.plz)} ${s.m('cfg:betrieb.ort', k.ort)}<br><a class="strich" href="${k.karte}" rel="noopener">${t('kontakt.karte')}</a></dd></div>
        <div><dt>${t('kontakt.zeiten')}</dt><dd>${[...s.zeiten.zeilen, s.zeiten.geschlossen].map((z) => s.m('cfg:betrieb.oeffnungszeiten', z)).join('<br>')}</dd></div>
      </dl>
      <ul class="kontakt__wege">
        <li><a href="tel:${k.telefonLink}"><span class="kreis" aria-hidden="true"><svg><use href="#i-tel"/></svg></span><span><strong>${t('allgemein.anrufen')}</strong><span>${s.m('cfg:betrieb.telefon', k.telefon)}</span></span></a></li>
        <li><a href="${waLink(k, t('allgemein.wa_frage'))}" rel="noopener"><span class="kreis" aria-hidden="true"><svg><use href="#i-wa"/></svg></span><span><strong>${t('allgemein.whatsapp')}</strong><span>${s.m('cfg:betrieb.whatsapp', k.whatsapp)}</span></span></a></li>
        <li><a href="mailto:${k.email}"><span class="kreis" aria-hidden="true"><svg><use href="#i-mail"/></svg></span><span><strong>${t('allgemein.email')}</strong><span>${s.m('cfg:betrieb.email', k.email)}</span></span></a></li>
      </ul>
    </div>

    <form class="formular zeigen" id="formular" action="mailto:${k.email}" method="post" enctype="text/plain" data-wa="${k.whatsappLink}" data-wa-start="${esc(t('kontakt.f_wa_start'))}" data-knopf-wa="${esc(t('kontakt.f_senden_wa'))}">
      <div class="formular__raster">
        <div class="feld">
          <label for="f-name">${t('kontakt.f_name')}</label>
          <input id="f-name" name="Name" type="text" autocomplete="name" required>
        </div>
        <div class="feld">
          <label for="f-tel">${t('kontakt.f_tel')} <span>${t('kontakt.f_freiwillig')}</span></label>
          <input id="f-tel" name="Telefon" type="tel" autocomplete="tel" inputmode="tel">
        </div>
        <div class="feld feld--wahl">
          <label for="f-fahrzeug">${t('kontakt.f_fahrzeug')}</label>
          <select id="f-fahrzeug" name="Fahrzeug">
            <option>${t('kontakt.f_offen')}</option>
${autos.map((a) => `            <option value="${esc(`${a.model} (${a.id})`)}">${esc(kurzname(a))}</option>`).join('\n')}
          </select>
        </div>
        <div class="feld feld--wahl">
          <label for="f-anliegen">${t('kontakt.f_anliegen')}</label>
          <select id="f-anliegen" name="Anliegen">
${liste('kontakt.f_anliegen_liste').map((a, i) => `            <option value="${a}">${liste('kontakt.f_anliegen_kurz')[i] || a}</option>`).join('\n')}
          </select>
        </div>
        <div class="feld feld--breit">
          <label for="f-text">${t('kontakt.f_nachricht')}</label>
          <textarea id="f-text" name="Nachricht" rows="3"></textarea>
        </div>
      </div>
      <button class="knopf knopf--voll formular__knopf" type="submit"><svg aria-hidden="true"><use href="#i-wa"/></svg><span data-ohne-js>${t('kontakt.f_senden')}</span></button>
      <p class="formular__hinweis">${t('kontakt.f_hinweis')}</p>
    </form>
  </div>
</section>`;

  const teile = { held, werte, bestand, leistungen, kontakt };
  return reihe.map((id) => teile[id]).filter(Boolean).join('\n\n');
}

function karte({ s, a, i }) {
  const { t, bild, b, l } = s;
  const p = a.media.poster;
  const vt = `auto-${a.id}`;
  return `      <li class="karte zeigen" id="${a.id}"${s.marken ? ` data-e-auto="${a.id}"` : ''} style="--verz:${i * 90}ms" data-marke="${esc(a.make)}" data-kraftstoff="${esc(a.fuel)}" data-preis="${a.preisZahl || ''}" data-km="${a.kmZahl || ''}" data-jahr="${esc(a.year)}" data-pos="${i}">
        <article>
          <div class="karte__bild">
            ${p ? bild(p.src, { alt: p.alt, sizes: '(min-width: 1100px) 420px, (min-width: 700px) 50vw, 42vw', lazy: true, vt, marke: `car:${a.id}.media.poster` }) : `<span class="foto-folgt">${t('bestand.foto_folgt')}</span>`}
            ${a.sample ? `<span class="marke-beispiel">${t('allgemein.beispielfahrzeug')}</span>` : ''}
            ${a.media.demo ? `<span class="karte__demo">${t('allgemein.demo_modell')}</span>` : ''}
          </div>
          <div class="karte__text">
            <h3><a href="${l}fahrzeug/${a.id}/index.html">${s.m(`car:${a.id}.model`, a.model)}</a></h3>
            <p class="karte__daten">${kerndaten(s, a)}</p>
            <p class="karte__tags"><span>${a.dekra === true ? t('bestand.dekra_tag_ja') : t('bestand.dekra_tag')}</span><span>${a.warrantyMonths ? t('bestand.garantie_tag_monate', { n: a.warrantyMonths }) : t('bestand.garantie_tag')}</span></p>
            <p class="karte__preis"><span class="preis">${s.m(`car:${a.id}.price`, a.price)}</span> <span class="mwst">${mwst(s, a)}</span></p>
            <a class="karte__weiter strich" href="${l}fahrzeug/${a.id}/index.html" aria-label="${esc(t('bestand.details_aria', { model: a.model }))}">${t('bestand.details')} <svg aria-hidden="true"><use href="#i-pfeil"/></svg></a>
          </div>
        </article>
      </li>`;
}

const kerndaten = (s, a) => [
  a.year && `<span><span class="code">B</span>${s.m(`car:${a.id}.year`, a.year)}</span>`,
  a.power && `<span><span class="code">P.2</span>${s.m(`car:${a.id}.power`, a.power)}</span>`,
  a.fuel && `<span><span class="code">P.3</span>${s.m(`car:${a.id}.fuel`, a.fuel)}</span>`,
  a.gearbox && `<span>${s.m(`car:${a.id}.gearbox`, a.gearbox)}</span>`,
  a.km && `<span>${s.m(`car:${a.id}.km`, a.km)}</span>`,
].filter(Boolean).join('');

const mwst = (s, a) => (a.vat ? s.m(`car:${a.id}.vat`, a.vat) : `${s.t('allgemein.mwst_folgt')} <em class="platzhalter">${s.t('allgemein.folgt')}</em>`);

function kurzname(a) {
  const m = a.model.replace('Mercedes-Benz', 'Mercedes');
  return m.split(' ').slice(0, 2).join(' ');
}
const zahlwort = (s, n) => { const w = s.liste('allgemein.zahlwoerter'); return (w && w[n] && !String(w[n]).includes('\uE000') ? w[n] : (w && w[n]) ? String(w[n]).replace(/\uE000[^\uE001]*\uE001|\uE002/g, '') : String(n)); };
export const tausender = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export function sichtbareAbschnitte(cfg) {
  const std = ['held', 'werte', 'bestand', 'leistungen', 'kontakt'];
  const l = (cfg.startseite && cfg.startseite.abschnitte) || std.map((id) => ({ id, sichtbar: true }));
  const ids = l.map((x) => x.id);
  const voll = [...l, ...std.filter((id) => !ids.includes(id)).map((id) => ({ id, sichtbar: true }))];
  const held = voll.filter((x) => x.id === 'held');
  return [...held, ...voll.filter((x) => x.id !== 'held')].filter((x) => x.sichtbar !== false || x.id === 'held');
}

function preisSchritte(preise) {
  if (!preise.length) return [];
  const min = Math.min(...preise), max = Math.max(...preise);
  const st = new Set();
  for (let p = Math.ceil(min / 5000) * 5000; p <= Math.ceil(max / 5000) * 5000; p += 5000) st.add(p);
  return [...st].slice(0, 6);
}

// ---------- Fahrzeugseite ----------

export function fahrzeugseite({ s, a }) {
  const { t, k, bild, b, l } = s;
  const hs = a.hotspots || [];
  const galerie = a.media.gallery || [];
  const startIdx = Math.max(0, galerie.findIndex((g) => g.start));
  const riese = a.kurz || (a.model.split(' ').find((w) => /\d/.test(w)) || a.make).slice(0, 6);
  const titel = a.titelFein && a.model.endsWith(a.titelFein) ? [a.model.slice(0, -a.titelFein.length).trim(), a.titelFein] : titelTeile(a.model);
  const vergeben = new Set();
  const ansichtId = (g, i) => { let x = `ansicht-${slug(g.label || String(i + 1)) || i + 1}`; if (vergeben.has(x)) x = `${x}-${i + 1}`; vergeben.add(x); return x; };
  const ids = galerie.map((g, i) => ansichtId(g, i));
  const wa = waLink(k, fahrzeugText(s, a));
  const mail = `mailto:${k.email}?subject=${enc(t('allgemein.mail_betreff', { model: a.model, id: a.id }))}&amp;body=${enc(fahrzeugText(s, a))}`;
  const detail = galerie.find((g) => g.detail) || galerie[startIdx] || null;
  const stufe = a.media.glb ? '3d' : a.spinListe.length ? '360' : galerie.length ? 'galerie' : 'leer';

  const ansichten = galerie.length ? galerie.map((g, i) => {
    const id = ids[i];
    const hier = (h) => h.poster && (h.poster.bild ? h.poster.bild === g.src : g.hotspots);
    const mitPunkten = hs.some(hier);
    const img = bild(g.src, { alt: g.alt, sizes: '(min-width: 1400px) 1150px, 92vw', prio: i === startIdx, lazy: i !== startIdx, vt: i === startIdx ? `auto-${a.id}` : '', fokus: g.fokus, marke: `car:${a.id}.media.gallery.${i}` });
    return `      <figure class="ansicht${mitPunkten ? ' ansicht--rahmen' : ''}${i === startIdx ? ' ansicht--start' : ''}" id="${id}">
        ${mitPunkten ? `<div class="rahmen">
          ${img}
          <ul class="punkte" aria-label="${t('fahrzeug.stellen_seite')}">
${hs.map((h, n) => (hier(h) ? `            <li class="punkt punkt--${h.poster.side === 'unten' ? 'unten' : 'oben'}${h.kind === 'zustand' ? ' punkt--zustand' : ''}" style="--x:${h.poster.x}%;--y:${h.poster.y}%;--l:${h.poster.line || 90}px;--i:${n}"><span class="punkt__nr" aria-hidden="true">${n + 1}</span><span class="punkt__kasten"><strong>${s.m(`car:${a.id}.hotspots.${n}.label`, h.label)}</strong> ${s.m(`car:${a.id}.hotspots.${n}.text`, h.text)}</span></li>` : '')).filter(Boolean).join('\n')}
          </ul>
        </div>` : img}
      </figure>`;
  }).join('\n') : `      <figure class="ansicht ansicht--start ansicht--leer" id="ansicht-1"><div class="foto-folgt foto-folgt--gross">${t('fahrzeug.foto_folgt')}</div></figure>`;

  const minis = galerie.length > 1 ? `    <nav class="minis" aria-label="${t('fahrzeug.ansicht_waehlen')}">
      <ul>
${galerie.map((g, i) => { const th = g.thumb || s.klein(g.src); return `        <li><a href="#${ids[i]}"${i === startIdx ? ' aria-current="true"' : ''}><img src="${b}${th}" alt="" loading="lazy" ${s.mass(th)}><span>${esc(g.label || String(i + 1))}</span></a></li>`; }).join('\n')}
      </ul>
    </nav>` : '';

  const aktion = stufe === '3d'
    ? `<button class="knopf knopf--voll buehne__knopf" type="button" data-start="3d"><svg aria-hidden="true"><use href="#i-3d"/></svg>${t('fahrzeug.in_3d')}</button>`
    : stufe === '360' ? `<button class="knopf knopf--voll buehne__knopf" type="button" data-start="360"><svg aria-hidden="true"><use href="#i-360"/></svg>${t('fahrzeug.in_360')}</button>` : '';

  const kopfteil = `<section class="fz-kopf" aria-labelledby="fz-titel">
  <div class="innen">
    <a class="zurueck" href="${l}index.html#bestand"><svg aria-hidden="true"><use href="#i-zurueck"/></svg>${t('allgemein.zurueck_bestand')}</a>
    <div class="fz-kopf__raster">
      <div>
        <p class="fz-kopf__marken">${a.sample ? `<span class="marke-beispiel">${t('allgemein.beispielfahrzeug')}</span> ` : ''}<span class="fz-id">${t('fahrzeug.id', { id: a.id })}</span></p>
        <h1 id="fz-titel" class="versal fz-titel">${s.m(`car:${a.id}.model`, titel[0])}${titel[1] ? ` <span class="fein kupfertext">${s.m(`car:${a.id}.model`, titel[1])}</span>` : ''}</h1>
        <p class="fz-kurz">${kerndaten(s, a)}</p>
      </div>
      <div class="fz-preis">
        <p class="fz-preis__zahl">${s.m(`car:${a.id}.price`, a.price)}</p>
        <p class="fz-preis__mwst">${mwst(s, a)}</p>
        <div class="fz-preis__knoepfe">
          <a class="knopf knopf--voll" href="${wa}" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>${t('fahrzeug.per_whatsapp')}</a>
          <a class="knopf knopf--linie" href="tel:${k.telefonLink}"><svg aria-hidden="true"><use href="#i-tel"/></svg>${t('allgemein.anrufen')}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;

  const buehne = `<section class="buehne" aria-label="${t('fahrzeug.ansichten')}" data-stufe="${stufe}"${s.marken ? ` data-e-auto="${a.id}"` : ''}>
  <div class="buehne__riese" aria-hidden="true">${esc(riese)}</div>
  <div class="innen">
    <div class="ansichten">
${ansichten}
    </div>
    <div class="drei" hidden></div>
    <div class="buehne__leiste">
      ${aktion}
      <p class="buehne__demo">${a.media.demo ? `<span class="demo-hinweis">${t('allgemein.demo_hinweis')}.${hs.length ? ` ${t('fahrzeug.beispiele')}` : ''}</span>` : ''}</p>
    </div>
${minis}
  </div>
</section>`;

  const eck = [
    ['B', t('fahrzeug.erstzulassung'), a.year, 'year'], ['P.2', t('fahrzeug.leistung'), a.power, 'power'], ['', t('fahrzeug.laufleistung'), a.km, 'km'],
    ['P.3', t('fahrzeug.kraftstoff'), a.fuel, 'fuel'], ['', t('fahrzeug.getriebe'), a.gearbox, 'gearbox'],
  ].filter((e) => e[2]);
  const eckdaten = `<section class="eckdaten" aria-labelledby="eckdaten-titel">
  <div class="innen">
    <div class="abschnitt-kopf zeigen">
      <span class="raute-gross" aria-hidden="true"><span>01</span></span>
      <h2 id="eckdaten-titel" class="abschnitt-titel">${t('fahrzeug.eckdaten')}</h2>
    </div>
    <ul class="kaesten">
${eck.map(([c, n, w, f], i) => `      <li class="zeigen" style="--verz:${i * 70}ms"><span class="kasten__titel">${c ? `<span class="code">${c}</span>` : ''}${n}</span><strong>${s.m(`car:${a.id}.${f}`, w)}</strong></li>`).join('\n')}
    </ul>
  </div>
</section>`;

  const stellen = hs.length ? `<section class="stellen" id="stellen" aria-labelledby="stellen-titel">
  <div class="innen">
    <div class="abschnitt-kopf zeigen">
      <span class="raute-gross" aria-hidden="true"><span>02</span></span>
      <h2 id="stellen-titel" class="abschnitt-titel">${t('fahrzeug.stellen_titel', { n: zahlwort(s, hs.length) })}</h2>
      <p>${t('fahrzeug.stellen_intro')}${a.sample ? ` ${t('fahrzeug.stellen_beispiel')}` : ''}</p>
    </div>
    <ol class="stellen__liste">
${hs.map((h, i) => `      <li class="zeigen${h.kind === 'zustand' ? ' stellen--zustand' : ''}" style="--verz:${i * 70}ms" data-stelle="${esc(h.id)}" data-zeigen="${esc(t('fahrzeug.zeigen'))}"><span class="stellen__nr" aria-hidden="true">${i + 1}</span><div><p class="stellen__art">${h.kind === 'zustand' ? `<strong>${t('fahrzeug.art_zustand')}</strong>` : t('fahrzeug.art_ausstattung')}</p><h3>${s.m(`car:${a.id}.hotspots.${i}.label`, h.label)}</h3><p>${s.m(`car:${a.id}.hotspots.${i}.text`, h.text)}${h.kind === 'zustand' && !a.report ? ` (<em class="platzhalter">${t('allgemein.folgt')}</em>)` : ''}</p><p class="stellen__ort">${h.where ? esc(h.where) : h.poster ? t('fahrzeug.im_bild', { bild: (galerie.find((g) => (h.poster.bild ? g.src === h.poster.bild : g.hotspots)) || {}).label || '' }) : ''}</p></div></li>`).join('\n')}
    </ol>
  </div>
</section>` : '';

  const datenblatt = `<section class="daten" aria-label="${t('fahrzeug.datenblatt')}">
  <div class="innen">
    <div class="daten__panel zeigen${detail ? '' : ' daten__panel--ohne-bild'}">
      <div class="daten__text">
        <p class="daten__titel">${s.m(`car:${a.id}.model`, titel[0])}${titel[1] ? ` <span>${s.m(`car:${a.id}.model`, titel[1])}</span>` : ''}</p>
        <p class="daten__preis"><span>${s.m(`car:${a.id}.price`, a.price)}</span> ${mwst(s, a)}</p>
        <table class="tabelle">
          <caption class="nur-sr">${t('fahrzeug.tabelle')}</caption>
          <tbody>
            <tr><th scope="row"><span class="code">D.1</span>${t('fahrzeug.marke')}</th><td>${s.m(`car:${a.id}.make`, a.make)}</td></tr>
            <tr><th scope="row">${t('fahrzeug.modell')}</th><td>${esc(a.model.replace(a.make, '').trim() || a.model)}</td></tr>
${eck.map(([c, n, w, f]) => `            <tr><th scope="row">${c ? `<span class="code">${c}</span>` : ''}${n}</th><td>${s.m(`car:${a.id}.${f}`, w)}</td></tr>`).join('\n')}
            <tr><th scope="row">${t('fahrzeug.id', { id: '' }).trim()}</th><td>${esc(a.id)}</td></tr>
          </tbody>
        </table>
      </div>
${detail ? `      <figure class="daten__bild">
        ${bild(detail.src, { alt: detail.alt, sizes: '(min-width: 1000px) 640px, 100vw', lazy: true, fokus: detail.fokus, marke: `car:${a.id}.media.gallery.${galerie.indexOf(detail)}` })}
        ${a.media.demo ? `<figcaption class="demo-hinweis">${t('allgemein.demo_hinweis')}</figcaption>` : ''}
      </figure>` : ''}
    </div>
  </div>
</section>`;

  const vertrauen = `<section class="vertrauen" aria-labelledby="vertrauen-titel">
  <div class="innen">
    <h2 id="vertrauen-titel" class="nur-sr">${t('fahrzeug.vertrauen')}</h2>
    <ul class="vertrauen__liste zeigen">
      <li><span class="kreis" aria-hidden="true"><svg><use href="#i-siegel"/></svg></span><span><strong>${t('fahrzeug.dekra')}</strong>${a.dekra === true ? t('fahrzeug.dekra_ja') : t('fahrzeug.dekra_wunsch')}</span></li>
      <li><span class="kreis" aria-hidden="true"><svg><use href="#i-siegel"/></svg></span><span><strong>${a.warrantyMonths ? t('fahrzeug.garantie_monate', { n: a.warrantyMonths }) : t('fahrzeug.garantie')}</strong>${t('fahrzeug.garantie_bed')} <em class="platzhalter">${t('allgemein.folgen')}</em></span></li>
      <li><span class="kreis" aria-hidden="true"><svg><use href="#i-bericht"/></svg></span><span><strong>${t('fahrzeug.bericht')}</strong>${a.report ? `<a href="${b}${esc(a.report)}">${t('fahrzeug.bericht_link')}</a>` : `<em class="platzhalter">${t('allgemein.folgt')}</em>`}</span></li>
      <li><span class="kreis" aria-hidden="true"><svg><use href="#i-lenkrad"/></svg></span><span><strong>${t('fahrzeug.probefahrt')}</strong>${t('fahrzeug.probefahrt_text')}</span></li>
    </ul>
  </div>
</section>`;

  const anfrage = `<section class="anfrage" id="anfrage" aria-labelledby="anfrage-titel">
  <div class="innen">
    <div class="anfrage__panel zeigen">
      <div>
        <p class="kennung"><span class="raute" aria-hidden="true">${hs.length ? '03' : '02'}</span>${t('fahrzeug.anfrage_kennung')}</p>
        <h2 id="anfrage-titel" class="versal h2">${t('fahrzeug.anfrage_titel')}</h2>
        <p>${t('fahrzeug.anfrage_text')}</p>
      </div>
      <div class="anfrage__wege">
        <a class="knopf knopf--voll" href="${wa}" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>${t('fahrzeug.whatsapp_nummer', { nummer: k.whatsapp })}</a>
        <a class="knopf knopf--linie" href="${mail}"><svg aria-hidden="true"><use href="#i-mail"/></svg>${t('fahrzeug.email_schreiben')}</a>
        <a class="knopf knopf--linie" href="tel:${k.telefonLink}"><svg aria-hidden="true"><use href="#i-tel"/></svg>${t('allgemein.anrufen_nummer', { telefon: k.telefon })}</a>
${a.url ? `        <a class="knopf knopf--linie" href="${esc(a.url)}" rel="noopener">${t('fahrzeug.inserat')}</a>` : ''}
      </div>
    </div>
    <a class="zurueck zurueck--unten" href="${l}index.html#bestand"><svg aria-hidden="true"><use href="#i-zurueck"/></svg>${t('allgemein.zurueck_bestand')}</a>
  </div>
</section>`;

  const daten = {
    id: a.id, model: a.model, stufe, basis: b,
    glb: a.media.glb ? b + a.media.glb : '', demo: !!a.media.demo,
    spin: a.spinListe.map((f) => b + f), kamera: a.camera || null,
    hotspots: hs.map((h, i) => ({ id: h.id, nr: i + 1, kind: h.kind, label: h.label, text: h.text, position: h.position, normal: h.normal, camera: h.camera, spinFrame: h.spinFrame ?? null, ansicht: h.poster ? 'start' : (h.where ? 'heck' : '') })),
    texte: {
      lade3d: t('fahrzeug.lade_3d'), fehler3d: t('fahrzeug.fehler_3d'), gesamt: t('fahrzeug.gesamtansicht'), schliessen: t('fahrzeug.schliessen_3d'),
      bedienung3d: t('fahrzeug.bedienung_3d'), alt3d: t('fahrzeug.alt_3d', { demo: a.media.demo ? t('allgemein.demo_hinweis') + '.' : '' }),
      lade360: t('fahrzeug.lade_360'), bedienung360: t('fahrzeug.bedienung_360'), ansicht360: t('fahrzeug.ansicht_360'),
      stellen3d: t('fahrzeug.stellen_3d'), demo: t('allgemein.demo_hinweis'),
    },
  };

  return { body: [kopfteil, buehne, eckdaten, stellen, datenblatt, vertrauen, anfrage].filter(Boolean).join('\n\n') + `\n<script type="application/json" id="fahrzeug-daten">${JSON.stringify(daten).replace(/</g, '\\u003c')}</script>`, wa: fahrzeugText(s, a) };
}

function titelTeile(model) {
  // „BMW 430i Coupé M Sport“ → fett „BMW 430i Coupé“, fein „M Sport“; Ausstattungslinie am Ende wird fein gesetzt
  const m = model.match(/^(.*?)\s+((?:M Sport|AMG Line|S line|M Paket|Sport Line|Luxury Line|Avantgarde|Exclusive))$/);
  return m ? [m[1], m[2]] : [model, ''];
}

export function fahrzeugText(s, a) {
  return s.t('allgemein.wa_fahrzeug', { model: a.model, beispiel: a.sample ? s.t('allgemein.wa_beispiel') : '', price: a.price, id: a.id });
}

export const slug = (x) => String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- Rechtliches ----------

export function rechtsseite({ s, art }) {
  const { t, k, cfg, liste } = s;
  const offen = (v, pfad) => (v ? s.m(pfad, v) : `<em class="platzhalter">${t('recht.offen')}</em>`);
  const o = cfg.offen || {};
  const vars = {
    name: s.m('cfg:betrieb.name', k.name), inhaber: s.m('cfg:betrieb.inhaber', k.inhaber), strasse: s.m('cfg:betrieb.strasse', k.strasse), plz: s.m('cfg:betrieb.plz', k.plz), ort: s.m('cfg:betrieb.ort', k.ort),
    telefon: s.m('cfg:betrieb.telefon', k.telefon), email: s.m('cfg:betrieb.email', k.email),
    telefon_link: `<a href="tel:${k.telefonLink}">${s.m('cfg:betrieb.telefon', k.telefon)}</a>`,
    whatsapp_link: `<a href="${waLink(k, t('allgemein.wa_frage'))}" rel="noopener">${s.m('cfg:betrieb.whatsapp', k.whatsapp)}</a>`,
    email_link: `<a href="mailto:${k.email}">${s.m('cfg:betrieb.email', k.email)}</a>`,
    rechtsform: offen(o.rechtsform, 'cfg:offen.rechtsform'), ust_id: offen(o.ustId, 'cfg:offen.ustId'), register: offen(o.register, 'cfg:offen.register'), hoster: offen(o.hoster, 'cfg:offen.hoster'), offen: offen(''),
  };
  const fuelle = (text) => String(text).replace(/\{(\w+)\}/g, (_, n) => (vars[n] ?? `{${n}}`));
  const abschnitte = liste(`recht.${art}`);
  return `<section class="recht"${s.marken ? ` data-abschnitt="${art}"` : ''}>
  <div class="innen recht__innen">
    <p class="kennung"><span class="raute" aria-hidden="true">${t('recht.raute')}</span>${t(`recht.${art}_kennung`)}</p>
    <h1 class="versal h2">${t(`fuss.${art}`)}</h1>
    <p class="recht__hinweis">${t('recht.pruefen')}</p>
${abschnitte.map((x) => `    <h2>${x.titel}</h2>\n    <p>${fuelle(x.text)}</p>`).join('\n')}
    <p class="recht__zurueck"><a class="zurueck" href="index.html"><svg aria-hidden="true"><use href="#i-zurueck"/></svg>${t('allgemein.zurueck_start')}</a></p>
  </div>
</section>`;
}
