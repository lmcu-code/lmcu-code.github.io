// Kern des Seitenbaus. Läuft unverändert in Node (build.mjs) und im Browser (editor/).
// Keine Node-APIs hier: Dateizugriff kommt über das Medienverzeichnis (medien.json) herein.
//   baue({ cfg, daten, texte, medien, marken }) → { seiten: { 'index.html': '…', … }, warnungen: [] }
import { rahmen, startseite, fahrzeugseite, rechtsseite, esc } from './seiten.mjs';

export const VERSION = 2;

// ---------- Schriften (Sammlung, alle selbst gehostet unter assets/fonts/) ----------
export const SCHRIFTEN = {
  archivo: { name: 'Archivo', rolle: 'breit', datei: 'archivo.woff2', gewicht: '250 900', breite: '100% 125%', basis: true },
  'zalando-sans-expanded': { name: 'Zalando Sans Expanded', rolle: 'breit', datei: 'zalando-sans-expanded.woff2', gewicht: '200 900' },
  'hanken-grotesk': { name: 'Hanken Grotesk', rolle: 'breit', datei: 'hanken-grotesk.woff2', gewicht: '100 900' },
  'bodoni-moda': { name: 'Bodoni Moda', rolle: 'ziffer', datei: 'bodoni-moda.woff2', gewicht: '400 600', basis: true },
  fraunces: { name: 'Fraunces', rolle: 'ziffer', datei: 'fraunces.woff2', gewicht: '300 700' },
  'playfair-display': { name: 'Playfair Display', rolle: 'ziffer', datei: 'playfair-display.woff2', gewicht: '400 700' },
  cinzel: { name: 'Cinzel', rolle: 'marke', datei: 'cinzel.woff2', gewicht: '500 600', basis: true },
  marcellus: { name: 'Marcellus', rolle: 'marke', datei: 'marcellus.woff2', gewicht: '400' },
};
const ERSATZ = { breit: '"Archivo Ersatz", sans-serif', ziffer: '"Bodoni Ersatz", Georgia, serif', marke: '"Cinzel Ersatz", Georgia, serif' };

// ---------- Farben ----------
export const STANDARD_FARBEN = { akzent: '#c08a5c', grund: '#141416', ueberschrift: '#f2f0eb', text: '#cfc7b9', nebentext: '#a39a8c' };
// Farbvarianten für den Editor (alle geprüft: jede Paarung mindestens 4,5 : 1, siehe design.md)
export const FARB_VORLAGEN = [
  { id: 'kupfer', name: 'Kupfer', text: 'Standard aus design.md', farben: { ...STANDARD_FARBEN } },
  { id: 'messing', name: 'Messing', text: 'heller, goldener', farben: { akzent: '#c7a25e', grund: '#131313', ueberschrift: '#f3f0e6', text: '#d1c9b5', nebentext: '#a79e8a' } },
  { id: 'bronze', name: 'Bronze', text: 'wärmerer Grund', farben: { akzent: '#b98a64', grund: '#17130f', ueberschrift: '#f4eee6', text: '#d3c7b8', nebentext: '#a99b8b' } },
  { id: 'rose', name: 'Roségold', text: 'weicher Akzent', farben: { akzent: '#cf917c', grund: '#151315', ueberschrift: '#f5efed', text: '#d6c9c4', nebentext: '#ab9d98' } },
  { id: 'nacht', name: 'Nachtblau', text: 'kühler Grund, Kupfer', farben: { akzent: '#c08a5c', grund: '#10151a', ueberschrift: '#eef1f2', text: '#c9cdd0', nebentext: '#98a1a8' } },
  { id: 'graphit', name: 'Graphit', text: 'ohne Farbakzent', farben: { akzent: '#c9cdd2', grund: '#141416', ueberschrift: '#f4f4f2', text: '#cfcfcb', nebentext: '#a3a39e' } },
];
const hexRgb = (h) => { const x = String(h).replace('#', ''); const v = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
const rgbHex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const misch = (a, b, t) => rgbHex(hexRgb(a).map((v, i) => v + (hexRgb(b)[i] - v) * t));
export function leuchte(h) { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const [r, g, b] = hexRgb(h); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
export function kontrast(a, b) { const x = leuchte(a), y = leuchte(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function kontrastPruefung(farben) {
  const f = { ...STANDARD_FARBEN, ...(farben || {}) };
  return [
    { id: 'ueberschrift', name: 'Überschriften auf Grund', wert: kontrast(f.ueberschrift, f.grund), min: 4.5 },
    { id: 'text', name: 'Fließtext auf Grund', wert: kontrast(f.text, f.grund), min: 4.5 },
    { id: 'nebentext', name: 'Nebentext auf Grund', wert: kontrast(f.nebentext, misch(f.grund, '#ffffff', 0.06)), min: 4.5 },
    { id: 'akzent', name: 'Akzent auf Grund', wert: kontrast(f.akzent, f.grund), min: 4.5 },
    { id: 'knopf', name: 'Knopftext auf Akzent', wert: kontrast(f.grund, f.akzent), min: 4.5 },
  ].map((p) => ({ ...p, wert: Math.round(p.wert * 100) / 100, ok: p.wert >= p.min }));
}
const rgba = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };

export function designCss(cfg) {
  const d = cfg.design || {};
  const f = { ...STANDARD_FARBEN, ...(d.farben || {}) };
  const z = [];
  const S = STANDARD_FARBEN, std = (fa, wert, standard) => (f[fa] === S[fa] ? standard : wert);
  z.push(`--kupfer:${f.akzent};--kupfer-hell:${std('akzent', misch(f.akzent, '#ffffff', 0.22), '#d6a578')};--kupfer-v1:${std('akzent', misch(f.akzent, '#000000', 0.08), '#b07a4a')};--kupfer-v2:${std('akzent', misch(f.akzent, '#ffffff', 0.3), '#e0b088')}`);
  for (const a of [0, 6, 12, 13, 14, 16, 25, 35, 40, 45, 55]) z.push(`--kupfer-${a}:${rgba(f.akzent, a / 100)}`);
  z.push(`--anthrazit:${f.grund};--tief:${std('grund', misch(f.grund, '#000000', 0.35), '#0d0d0f')};--flaeche:${std('grund', misch(f.grund, '#ffffff', 0.025), '#1a1a1d')};--flaeche-2:${std('grund', misch(f.grund, '#ffffff', 0.05), '#212125')};--linie:${std('grund', misch(f.grund, '#ffffff', 0.09), '#2c2c31')};--linie-hell:${std('grund', misch(f.grund, '#ffffff', 0.2), '#46464d')};--feldrand:${f.grund === S.grund && f.nebentext === S.nebentext ? '#77747a' : misch(f.grund, f.nebentext, 0.62)}`);
  z.push(`--kalk:${f.ueberschrift};--text:${f.text};--text-2:${f.nebentext};--text-3:${f.nebentext}`);
  const tief = f.grund === S.grund ? '#0d0d0f' : misch(f.grund, '#000000', 0.35);
  for (const a of [60, 70, 82, 85, 92, 96, 97]) z.push(`--tief-${a}:${rgba(tief, a / 100)}`);
  const sch = { breit: 'archivo', ziffer: 'bodoni-moda', marke: 'cinzel', ...(d.schriften || {}) };
  const faces = [];
  for (const rolle of ['breit', 'ziffer', 'marke']) {
    const s = SCHRIFTEN[sch[rolle]] || SCHRIFTEN[{ breit: 'archivo', ziffer: 'bodoni-moda', marke: 'cinzel' }[rolle]];
    if (!s.basis) faces.push(`@font-face{font-family:"${s.name}";font-style:normal;font-display:swap;font-weight:${s.gewicht};src:url(${'{{B}}'}assets/fonts/${s.datei}) format("woff2")}`);
    const varname = { breit: '--breit', ziffer: '--ziffer', marke: '--marke' }[rolle];
    z.push(`${varname}:"${s.name}",${ERSATZ[rolle]}`);
  }
  const sg = Math.min(1.2, Math.max(0.85, Number(d.schriftgroesse) || 1));
  const ab = Math.min(1.3, Math.max(0.7, Number(d.abstand) || 1));
  z.push(`--skala:${sg};--abstand:${ab}`);
  const an = cfg.animation || {};
  const tempo = Math.min(1.8, Math.max(0.5, Number(an.tempo) || 1));
  const weg = { dezent: 8, normal: 18, ausdrucksstark: 34 }[an.staerke] ?? 18;
  z.push(`--tempo:${tempo};--weg:${weg}px`);
  return `${faces.join('')}:root{${z.join(';')}}`;
}

export function animationAttribute(cfg) {
  const an = cfg.animation || {};
  const a = [`data-anim="${an.an === false ? 'aus' : (an.staerke || 'normal')}"`];
  if (an.heroAuftritt === false) a.push('data-hero="aus"');
  if (an.schimmer === false) a.push('data-schimmer="aus"');
  if (an.blitz === false) a.push('data-blitz="aus"');
  if (an.zaehlen === false) a.push('data-zaehlen="aus"');
  return a.join(' ');
}

// ---------- Hilfen ----------
export const zahl = (s) => { const n = Number(String(s ?? '').replace(/[^\d]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };
export const tausender = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const TAGE = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function zeitenTexte(betrieb, z) {
  const fmt = (t) => { const [h, m] = String(t).split(':'); return z.format === '24h' ? `${h.padStart(2, '0')}:${m || '00'}` : (m && m !== '00' ? `${Number(h)}:${m}` : String(Number(h))); };
  const offen = new Set();
  const zeilen = (betrieb.oeffnungszeiten || []).map((o) => {
    const idx = o.tage.map((t) => TAGE.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b);
    idx.forEach((i) => offen.add(i));
    const tage = idx.length > 1 ? z.bereich.replace('{von}', z.tage[idx[0]]).replace('{bis}', z.tage[idx[idx.length - 1]]) : z.tage[idx[0]];
    return z.zeile.replace('{tage}', tage).replace('{von}', fmt(o.von)).replace('{bis}', fmt(o.bis));
  });
  const zu = [0, 1, 2, 3, 4, 5, 6].filter((i) => !offen.has(i)).map((i) => z.tage[i]);
  const geschlossen = zu.length ? z.geschlossen.replace('{tage}', zu.join(', ')) : z.nur_feiertags;
  const alle = [...offen].sort((a, b) => a - b);
  const kurz = alle.length ? (alle.length > 1 ? z.bereich.replace('{von}', z.tage_kurz[alle[0]]).replace('{bis}', z.tage_kurz[alle[alle.length - 1]]) : z.tage_kurz[alle[0]]) : '';
  return { zeilen, geschlossen, kurz };
}

// Medienverzeichnis: { "assets/…": [breite, höhe] | 0 }
export function medienAdapter(medien) {
  const d = (medien && medien.dateien) || {};
  return {
    existiert: (p) => Object.prototype.hasOwnProperty.call(d, p),
    masse: (p) => (Array.isArray(d[p]) ? { w: d[p][0], h: d[p][1] } : null),
    varianten: (p) => {
      const m = String(p).match(/^(.*)-(\d+)\.(webp|jpe?g|png|avif)$/i);
      if (!m) return [];
      const re = new RegExp(`^${m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.${m[3]}$`, 'i');
      return Object.keys(d).map((k) => k.match(re)).filter(Boolean).map((x) => ({ w: Number(x[1]), datei: x[0] })).sort((a, b) => a.w - b.w);
    },
  };
}

export function demoDatei(src) { return /^assets\/(bilder\/(hero-auto|seite|heck|felge|karte-|mini-)|3d\/)/.test(String(src || '')); }

// ---------- Fahrzeuge vorbereiten ----------
export function bereiteAutos(daten, dateien, warnungen) {
  return (daten.cars || []).map((c, i) => {
    const media = { ...(c.media || {}) };
    media.glb = media.glb ?? media.model ?? '';
    media.gallery = (media.gallery ?? (media.photos || []).map((p) => (typeof p === 'string' ? { src: p, alt: c.model } : p))).filter((g) => g && g.src);
    if (!media.poster || !media.poster.src) media.poster = media.gallery[0] ? { src: media.gallery[0].src, alt: media.gallery[0].alt } : null;
    if (typeof media.poster === 'string') media.poster = { src: media.poster, alt: c.model };
    let spinListe = [];
    if (Array.isArray(media.spin)) spinListe = media.spin;
    else if (typeof media.spin === 'string' && media.spinFrames) spinListe = Array.from({ length: media.spinFrames }, (_, n) => media.spin.replace('{nn}', String(n).padStart(2, '0')));
    // Ehrlichkeit: Bilder des Demo-Modells tragen immer den Hinweis
    if ([media.glb, media.poster?.src, ...media.gallery.map((g) => g.src), ...spinListe].some(demoDatei)) media.demo = true;
    for (const f of [media.glb, ...spinListe, media.poster?.src, ...media.gallery.map((g) => g.src)].filter(Boolean)) if (!dateien.existiert(f)) warnungen.push(`${c.id}: Datei fehlt: ${f}`);
    if (!c.id) warnungen.push(`Fahrzeug Nr. ${i + 1} hat keine id`);
    return { ...c, media, spinListe, hotspots: c.hotspots || [], preisZahl: zahl(c.price), kmZahl: zahl(c.km), kwZahl: zahl(c.power) };
  });
}

// ---------- Strukturierte Daten ----------
function autoDealer(k, basisUrl) {
  return {
    '@context': 'https://schema.org', '@type': 'AutoDealer', name: k.name,
    address: { '@type': 'PostalAddress', streetAddress: k.strasse, postalCode: k.plz, addressLocality: k.ort, addressCountry: k.land },
    telephone: '+' + String(k.telefonLink).replace(/^\+/, ''), email: k.email,
    openingHoursSpecification: (k.oeffnungszeiten || []).map((o) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: o.tage, opens: o.von, closes: o.bis })),
    knowsLanguage: k.sprachen, sameAs: [k.mobilede],
    ...(basisUrl ? { url: basisUrl, logo: basisUrl + 'assets/logo/kmc-logo.svg' } : {}),
  };
}
function carLd(a, k, basisUrl) {
  if (a.sample) return null; // Beispielfahrzeuge nie als Angebot an Suchmaschinen
  return {
    '@context': 'https://schema.org', '@type': 'Car', name: a.model, brand: { '@type': 'Brand', name: a.make },
    ...(a.year ? { dateVehicleFirstRegistered: a.year } : {}),
    ...(a.kmZahl ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: a.kmZahl, unitCode: 'KMT' } } : {}),
    ...(a.fuel ? { fuelType: a.fuel } : {}), ...(a.gearbox ? { vehicleTransmission: a.gearbox } : {}),
    ...(a.kwZahl ? { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: a.kwZahl, unitCode: 'KWT' } } } : {}),
    offers: { '@type': 'Offer', priceCurrency: 'EUR', ...(a.preisZahl ? { price: a.preisZahl } : {}), seller: { '@type': 'AutoDealer', name: k.name }, ...(basisUrl ? { url: `${basisUrl}fahrzeug/${a.id}/` } : {}) },
  };
}

// ---------- Marken für den Editor ----------
// Im Editor (marken: true) werden Texte mit unsichtbaren Zeichen umschlossen, die der Editor in klickbare Elemente verwandelt.
export const MARKE_AUF = '', MARKE_MITTE = '', MARKE_ZU = '';
const markiere = (an, schluessel, wert) => (an ? `${MARKE_AUF}${schluessel}${MARKE_MITTE}${wert}${MARKE_ZU}` : wert);

// ---------- Bauen ----------
export function baue({ cfg, daten, texte, medien, marken = false, nurSeiten = null }) {
  const warnungen = [];
  const dateien = medienAdapter(medien);
  const k = cfg.betrieb;
  const basisUrl = cfg.domain ? cfg.domain.replace(/\/$/, '') + '/' : '';
  const autos = bereiteAutos(daten, dateien, warnungen);
  const seiten = {};
  const sprachen = Object.entries(cfg.sprachen || {}).filter(([, v]) => v.freigegeben).map(([c]) => c);
  if (!sprachen.includes('de')) sprachen.unshift('de');
  const robots = cfg.seo && cfg.seo.indexieren === false ? 'noindex' : '';
  const design = designCss(cfg);
  const anim = animationAttribute(cfg);

  for (const lang of sprachen) {
    const tx = texte[lang] || {};
    const ordner = lang === 'de' ? '' : `${lang}/`;
    const hole = (s) => s.split('.').reduce((o, x) => (o == null ? o : o[x]), tx);
    const z = hole('zeiten') || texte.de.zeiten;
    const zt = zeitenTexte(k, z);
    const sprachNamen = (k.sprachen || []).map((c) => (cfg.sprachen?.[c]?.name) || c);
    const und = hole('allgemein.liste_und') || ' und ', oder = hole('allgemein.liste_oder') || ' oder ';
    const verbinde = (l, w) => (l.length > 1 ? l.slice(0, -1).join(', ') + w + l[l.length - 1] : l.join(''));
    const globale = {
      sprachen: sprachNamen.join(', '), sprachen_und: verbinde(sprachNamen, und), sprachen_oder: verbinde(sprachNamen, oder),
      zeiten: zt.zeilen.join(', '), tage_kurz: zt.kurz,
      name: k.name, strasse: k.strasse, plz: k.plz, ort: k.ort, telefon: k.telefon, email: k.email, whatsapp: k.whatsapp, inhaber: k.inhaber,
    };
    const t = (schluessel, vars = {}) => {
      let v = hole(schluessel);
      if (v == null) { warnungen.push(`[${lang}] Text fehlt: ${schluessel}`); v = schluessel; }
      const alle = { ...globale, ...vars };
      return markiere(marken, schluessel, String(v).replace(/\{(\w+)\}/g, (_, n) => (alle[n] ?? `{${n}}`)));
    };
    const liste = (schluessel) => {
      const l = hole(schluessel) || [];
      if (!marken) return l;
      const mk = (v, pfad) => (typeof v === 'string' ? markiere(true, pfad, v) : Array.isArray(v) ? v.map((x, i) => mk(x, `${pfad}.${i}`)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, a === 'icon' || a === 'bild' ? b : mk(b, `${pfad}.${a}`)])) : v);
      return mk(l, schluessel);
    };
    const m = (pfad, wert) => markiere(marken, pfad, esc(wert));

    const machS = (tiefe, seitenPfad = 'index.html') => {
      const b = '../'.repeat(tiefe + (ordner ? 1 : 0));
      const l = '../'.repeat(tiefe);
      const spr = sprachen.length > 1 ? sprachen.map((code) => ({ code, aktiv: code === lang, href: b + (code === 'de' ? '' : `${code}/`) + seitenPfad })) : [];
      const mass = (src) => { const x = dateien.masse(src); return x ? `width="${x.w}" height="${x.h}"` : ''; };
      const bild = (src, { alt = '', sizes = '100vw', lazy = false, prio = false, klasse = '', vt = '', fokus = '', marke = '' } = {}) => {
        if (!dateien.existiert(src)) warnungen.push(`Datei fehlt: ${src}`);
        const v = dateien.varianten(src);
        const x = dateien.masse(src);
        const srcset = v.length > 1 ? ` srcset="${v.map((y) => `${b}${y.datei} ${y.w}w`).join(', ')}" sizes="${sizes}"` : '';
        const stil = [vt ? `view-transition-name: ${vt}` : '', fokus && fokus !== '50% 50%' ? `object-position: ${fokus}` : ''].filter(Boolean).join('; ');
        return `<img${klasse ? ` class="${klasse}"` : ''} src="${b}${src}"${srcset}${x ? ` width="${x.w}" height="${x.h}"` : ''}${lazy ? ' loading="lazy"' : ''}${prio ? ' fetchpriority="high"' : ''} alt="${esc(alt)}"${stil ? ` style="${stil}"` : ''}${marken && marke ? ` data-e-bild="${esc(marke)}"` : ''}>`;
      };
      const klein = (src) => (dateien.varianten(src)[0] || {}).datei || src;
      return { t, liste, m, k, cfg, b, l, bild, mass, klein, demo: demoDatei, sprachen: spr, marken, zeiten: zt, design: design.replace(/\{\{B\}\}/g, b), anim, robots, lang };
    };
    const soll = (p) => !nurSeiten || nurSeiten.includes(ordner + p);

    if (soll('index.html')) {
      const s = machS(0);
      const body = startseite({ s, autos });
      seiten[`${ordner}index.html`] = rahmen({ s, lang, basis: s.b, titel: t('meta.titel_start'), beschreibung: t('meta.beschreibung_start'), css: ['basis.css', 'start.css'], body, jsonld: [autoDealer(k, basisUrl)], aktiv: 'start', robots, canonical: basisUrl ? basisUrl + ordner : '', ogBild: cfg.seo?.bild && basisUrl ? basisUrl + cfg.seo.bild : '' });
    }
    for (const a of autos) {
      const pfad = `fahrzeug/${a.id}/index.html`;
      if (!soll(pfad)) continue;
      const s = machS(2, pfad);
      const { body, wa } = fahrzeugseite({ s, a });
      s.waText = wa;
      const ld = carLd(a, k, basisUrl);
      const tv = { model: a.model, beispiel: a.sample ? hole('meta.beispiel_titel') || '' : '' };
      seiten[`${ordner}${pfad}`] = rahmen({
        s, lang, basis: s.b, aktiv: 'fahrzeug',
        titel: t('meta.titel_fahrzeug', tv),
        beschreibung: t('meta.beschreibung_fahrzeug', { ...a, beispiel: a.sample ? hole('meta.beispiel_text') || '' : '' }),
        css: ['basis.css', 'fahrzeug.css'], js: ['fahrzeug.js'], body, jsonld: ld ? [ld] : [],
        robots: a.sample || robots ? 'noindex' : '', canonical: basisUrl ? `${basisUrl}${ordner}fahrzeug/${a.id}/` : '',
        ogBild: a.media.poster && basisUrl ? basisUrl + a.media.poster.src : '',
      });
    }
    if (lang === 'de') {
      for (const art of ['impressum', 'datenschutz']) {
        if (!soll(`${art}.html`)) continue;
        const s = machS(0);
        seiten[`${art}.html`] = rahmen({ s, lang, basis: s.b, aktiv: 'recht', titel: t(`meta.titel_${art}`), beschreibung: t(`meta.titel_${art}`), css: ['basis.css', 'recht.css'], body: rechtsseite({ s, art }), robots: 'noindex' });
      }
    }
  }

  if (!nurSeiten) {
    seiten['robots.txt'] = robots ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${basisUrl ? `Sitemap: ${basisUrl}sitemap.xml\n` : ''}`;
    if (basisUrl && !robots) {
      const urls = Object.keys(seiten).filter((f) => f.endsWith('.html') && !/impressum|datenschutz/.test(f) && !autos.some((a) => a.sample && f.includes(a.id))).map((f) => basisUrl + f.replace(/index\.html$/, ''));
      seiten['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
    }
  }
  return { seiten, warnungen: [...new Set(warnungen)], autos };
}
