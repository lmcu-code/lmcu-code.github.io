// Live-Vorschau: baut die Seite im Browser mit demselben Kern wie npm run build, zeigt sie im iframe,
// macht Texte und Bilder anklickbar und aktualisiert nur geänderte Abschnitte (kein Flackern, Scrollposition bleibt).
import { baue, MARKE_AUF, MARKE_MITTE, MARKE_ZU } from '../../vorlagen/bau.mjs';
import { Z, aufloesen, hole, setze, aendere, emit, on } from './zustand.mjs';

export const WURZEL = new URL('../', location.href).href;
const iframe = () => document.getElementById('vorschaurahmen');
let abspielen = false;

// ---------- Seitenliste ----------
export function seitenListe() {
  const pre = Z.ui.sprache === 'de' ? '' : `${Z.ui.sprache}/`;
  return [
    { pfad: `${pre}index.html`, name: 'Startseite', gruppe: 'Seiten', icon: 'seiten' },
    ...Z.daten.cars.cars.map((c) => ({ pfad: `${pre}fahrzeug/${c.id}/index.html`, name: c.model || 'Neues Fahrzeug', gruppe: 'Fahrzeuge', icon: 'auto', id: c.id })),
    { pfad: 'impressum.html', name: 'Impressum', gruppe: 'Rechtliches', icon: 'liste' },
    { pfad: 'datenschutz.html', name: 'Datenschutz', gruppe: 'Rechtliches', icon: 'liste' },
  ];
}
export function cfgMitSprache(cfg, sprache) {
  if (sprache === 'de') return cfg;
  return { ...cfg, sprachen: { ...cfg.sprachen, [sprache]: { ...(cfg.sprachen?.[sprache] || {}), freigegeben: true } } };
}
export function baueVorschau(pfad, marken = true) {
  const d = Z.daten;
  const r = baue({ cfg: cfgMitSprache(d.cfg, Z.ui.sprache), daten: d.cars, texte: d.texte, medien: d.medien, marken, nurSeiten: [pfad] });
  return r.seiten[pfad] || '';
}

// ---------- Marken auflösen: unsichtbare Zeichen → <span data-e> ----------
const MARKE_RE = new RegExp(`${MARKE_AUF}[^${MARKE_MITTE}]*${MARKE_MITTE}|${MARKE_ZU}`, 'g');
const entferne = (s) => s.replace(MARKE_RE, '');
export function markenAufloesen(html) {
  return html
    .replace(/<(title|script|style|option|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi, entferne)
    .replace(/<[^>]+>/g, entferne)
    .replace(new RegExp(`${MARKE_AUF}([^${MARKE_MITTE}]*)${MARKE_MITTE}`, 'g'), '<span data-e="$1">')
    .replace(new RegExp(MARKE_ZU, 'g'), '</span>');
}
function blobsEinsetzen(html) {
  for (const [pfad, url] of Z.urls) html = html.split(pfad).join(url).replace(new RegExp(`(?:\\.\\./)+${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), url);
  return html;
}
const EDITOR_STIL = `
[data-e]{cursor:text;border-radius:2px;transition:background-color .12s}
[data-e]:hover{background-color:rgba(192,138,92,.10)}
[data-e][contenteditable]{outline:calc(2px * var(--kmc-z,1)) solid #c08a5c;outline-offset:calc(3px * var(--kmc-z,1));background-color:rgba(192,138,92,.08);cursor:text;caret-color:#c08a5c}
[data-e-bild]{cursor:pointer}
.kmc-rahmen{position:absolute;z-index:2147483000;pointer-events:none;border:calc(1px * var(--kmc-z,1)) solid #c08a5c;border-radius:calc(3px * var(--kmc-z,1));box-shadow:0 0 0 calc(3px * var(--kmc-z,1)) rgba(192,138,92,.12);transition:left .09s,top .09s,width .09s,height .09s,opacity .12s}
.kmc-rahmen[data-auswahl]{border-width:calc(2px * var(--kmc-z,1));box-shadow:0 0 0 calc(4px * var(--kmc-z,1)) rgba(192,138,92,.16)}
.kmc-etikett{position:absolute;left:-1px;top:-24px;transform:scale(var(--kmc-z,1));transform-origin:0 100%;height:20px;padding:0 7px;border-radius:4px 4px 4px 0;background:#c08a5c;color:#16110c;font:600 11px/20px Archivo,system-ui,sans-serif;letter-spacing:0;white-space:nowrap;text-transform:none}
.kmc-werkzeug{position:absolute;z-index:2147483001;transform:scale(var(--kmc-z,1));transform-origin:100% 100%;display:flex;gap:2px;padding:3px;border:1px solid #303036;border-radius:8px;background:#18181b;box-shadow:0 8px 24px rgba(0,0,0,.5);font:500 12px/1 Archivo,system-ui,sans-serif;animation:kmcw .14s ease}
@keyframes kmcw{from{opacity:0}}
.kmc-werkzeug[data-unten]{transform-origin:100% 0}
.kmc-etikett[data-unten]{transform-origin:0 0}
.kmc-werkzeug button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 9px;border:0;border-radius:5px;background:transparent;color:#ecebe7;font:inherit;cursor:pointer;white-space:nowrap}
.kmc-werkzeug button:hover,.kmc-werkzeug button:focus-visible{background:#26262b;outline:none}
.kmc-werkzeug svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.kmc-werkzeug i{width:1px;margin:4px 2px;background:#303036}
`;
const STATISCH = `<script>document.documentElement.dataset.anim="aus"</script><style>*,*::before,*::after{animation:none!important;transition:none!important}.zeigen{opacity:1!important;transform:none!important;clip-path:none!important}</style>`;

function fuerIframe(html, pfad) {
  const ordner = pfad.includes('/') ? pfad.slice(0, pfad.lastIndexOf('/') + 1) : '';
  let x = markenAufloesen(html);
  x = blobsEinsetzen(x);
  return x.replace('<head>', `<head><base href="${WURZEL}${ordner}">${abspielen ? '' : STATISCH}<style id="kmc-editor-stil">${EDITOR_STIL}</style>`);
}

// ---------- Rendern ----------
let geladenePfad = null, rafId = 0, massstab = 1;
export function zeigeSeite(pfad, { neu = false } = {}) {
  Z.ui.seite = pfad;
  const f = iframe();
  const html = fuerIframe(baueVorschau(pfad), pfad);
  if (!neu && geladenePfad === pfad && f.contentDocument?.body) { patche(html); return; }
  geladenePfad = pfad;
  document.getElementById('rahmen').dataset.laedt = '';
  f.srcdoc = html;
}
export function aktualisiere() { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(() => zeigeSeite(Z.ui.seite)); }
export function spieleAnimation() {
  abspielen = true; zeigeSeite(Z.ui.seite, { neu: true });
  setTimeout(() => { abspielen = false; }, 400);
}

function patche(html) {
  const doc = iframe().contentDocument;
  const neu = new DOMParser().parseFromString(html, 'text/html');
  for (const a of ['data-anim', 'data-hero', 'data-schimmer', 'data-blitz', 'data-zaehlen', 'lang']) {
    const v = neu.documentElement.getAttribute(a);
    if (v === null) doc.documentElement.removeAttribute(a); else doc.documentElement.setAttribute(a, v);
  }
  const ds = doc.getElementById('design'), ns = neu.getElementById('design');
  if (ds && ns && ds.textContent !== ns.textContent) ds.textContent = ns.textContent;
  doc.title = neu.title;
  const bloecke = (d) => [d.querySelector('body > header'), ...d.querySelectorAll('main > *'), d.querySelector('body > footer'), d.querySelector('body > nav.schnell')].filter(Boolean);
  const alt = bloecke(doc), nb = bloecke(neu);
  if (alt.length !== nb.length) {
    doc.querySelector('main').replaceWith(doc.importNode(neu.querySelector('main'), true));
    const ah = doc.querySelector('body > header'), nh = neu.querySelector('body > header'); if (ah && nh && ah.outerHTML !== nh.outerHTML) ah.replaceWith(doc.importNode(nh, true));
    const af = doc.querySelector('body > footer'), nf = neu.querySelector('body > footer'); if (af && nf && af.outerHTML !== nf.outerHTML) af.replaceWith(doc.importNode(nf, true));
  } else {
    alt.forEach((el, i) => { if (el.outerHTML !== nb[i].outerHTML && !el.querySelector('[contenteditable]')) el.replaceWith(doc.importNode(nb[i], true)); });
  }
  markiereAuswahl();
}

// ---------- Größe, Gerät, Zoom ----------
export function passeGroesse() {
  const f = iframe(), r = document.getElementById('rahmen'), fl = document.getElementById('flaeche');
  const schmal = matchMedia('(max-width: 899px)').matches;
  const w = schmal ? 390 : Z.ui.geraet;
  const NOM = { 390: 844, 768: 1024, 1440: 900 };
  const verfuegbar = fl.clientWidth - (schmal ? 0 : 64), hoehe = fl.clientHeight - (schmal ? 0 : 64);
  let s, hg;
  if (schmal) { s = Math.min(1, fl.clientWidth / w); hg = fl.clientHeight / s; }
  else {
    hg = NOM[w] || 900;
    s = Z.ui.zoom === 'fit' ? Math.min(1, verfuegbar / w, hoehe / hg) : Number(Z.ui.zoom);
    if (!s || s < 0.1) s = 1;
  }
  f.style.width = `${w}px`; f.style.height = `${hg}px`; f.style.transform = `scale(${s})`;
  r.style.width = `${w * s}px`; r.style.height = `${hg * s}px`;
  r.dataset.geraet = String(w);
  r.dataset.massstab = String(Math.round(s * 100));
  massstab = s;
  try { f.contentDocument?.documentElement?.style.setProperty('--kmc-z', String(1 / s)); } catch { /* lädt */ }
  emit('massstab', Math.round(s * 100));
}

// ---------- Bearbeiten in der Vorschau ----------
const NAMEN = { held: 'Hero', werte: 'Kennwerte', bestand: 'Bestand', leistungen: 'Leistungen', kontakt: 'Kontakt', fuss: 'Fuß', fahrzeug: 'Fahrzeugseite', allgemein: 'Allgemein', suche: 'Suche', meta: 'SEO', recht: 'Rechtliches', zeiten: 'Öffnungszeiten', ablauf: 'Ablauf' };
const FELD = { model: 'Modell', price: 'Preis', year: 'Erstzulassung', power: 'Leistung', fuel: 'Kraftstoff', gearbox: 'Getriebe', km: 'Laufleistung', vat: 'MwSt.', make: 'Marke', label: 'Stelle', text: 'Stellentext' };
export function etikett(sel) {
  if (sel.art === 'abschnitt') return `Abschnitt · ${NAMEN[sel.id] || sel.id}`;
  if (sel.art === 'auto') return 'Fahrzeug';
  const k = sel.schluessel || '';
  if (sel.art === 'bild') return k.startsWith('car:') ? 'Bild · Fahrzeug' : 'Bild';
  if (k.startsWith('cfg:betrieb')) return 'Betrieb · ' + ({ telefon: 'Telefon', email: 'E-Mail', whatsapp: 'WhatsApp', strasse: 'Straße', ort: 'Ort', plz: 'PLZ', name: 'Name', oeffnungszeiten: 'Öffnungszeiten', inhaber: 'Inhaber' }[k.split('.')[1]] || 'Angabe');
  if (k.startsWith('cfg:offen')) return 'Impressum · offene Angabe';
  if (k.startsWith('car:')) { const f = k.split('.').at(-1); return `Fahrzeug · ${FELD[f] || f}`; }
  return `Text · ${NAMEN[k.split('.')[0]] || k.split('.')[0]}`;
}
export function istDirektEditierbar(schluessel) {
  if (schluessel.startsWith('cfg:betrieb.oeffnungszeiten') || /^car:[^.]+\.(price|km|year|power|fuel|gearbox|vat|make)$/.test(schluessel)) return false;
  const { ziel, pfad } = aufloesen(schluessel);
  const v = hole(ziel, pfad);
  return typeof v === 'string' && !/[<{&]/.test(v);
}
export function setzeWert(schluessel, wert, opts = {}) {
  aendere(`Text „${String(wert).slice(0, 24)}“`, () => {
    const { ziel, pfad, art, idx } = aufloesen(schluessel);
    if (art === 'car' && idx < 0) return;
    const altWert = hole(ziel, pfad);
    if (art === 'car' && pfad === 'model') {
      // Titel ist in Modell + feine Ausstattungslinie geteilt: das ganze Modell ersetzen, wenn ein Teil bearbeitet wurde
      ziel.model = opts.ganz ?? wert;
      return;
    }
    if (altWert !== wert) setze(ziel, pfad, wert);
  }, opts);
}

let rahmenEl = null, auswahlEl = null, werkzeugEl = null, editierend = null, hoverZiel = null;
function svg(p) { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg>`; }
const P = { stift: 'M14.5 5.5l4 4L9 19H5v-4l9.5-9.5Z', bild: 'M4.5 5.5h15v13h-15z M4.5 15.5l4-4 3.5 3.5 2.5-2.5 5 5', auge: 'M4 4l16 16 M10.6 6.1c.5-.1.9-.1 1.4-.1 6 0 9.5 6 9.5 6a17.4 17.4 0 0 1-2.6 3.3 M6.5 7.3C4 9 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1', hoch: 'M7 14l5-5 5 5', runter: 'M7 10l5 5 5-5', auto: 'M3.5 15.5v-3l2-4.2A2 2 0 0 1 7.3 7h9.4a2 2 0 0 1 1.8 1.3l2 4.2v3a1 1 0 0 1-1 1h-1 M6.5 16.5H17' };

function ziel(t) {
  if (!t || !t.closest) return null;
  const text = t.closest('[data-e]'); if (text) return { el: text, art: 'text', schluessel: text.dataset.e };
  const bild = t.closest('[data-e-bild]'); if (bild) return { el: bild, art: 'bild', schluessel: bild.dataset.eBild };
  const auto = t.closest('[data-e-auto]'); if (auto) return { el: auto, art: 'auto', id: auto.dataset.eAuto };
  const ab = t.closest('[data-abschnitt]'); if (ab) return { el: ab, art: 'abschnitt', id: ab.dataset.abschnitt };
  return null;
}
function abschnittVon(el) { const a = el.closest('[data-abschnitt]'); return a ? a.dataset.abschnitt : null; }
function zeichneRahmen(doc, el, box, beschriftung, auswahl = false) {
  if (!el || !el.isConnected) { if (box) box.style.opacity = '0'; return box; }
  if (!box) { box = doc.createElement('div'); box.className = 'kmc-rahmen'; box.setAttribute('aria-hidden', 'true'); box.innerHTML = '<span class="kmc-etikett"></span>'; doc.body.append(box); }
  const r = el.getBoundingClientRect(), sx = doc.defaultView.scrollX, sy = doc.defaultView.scrollY;
  Object.assign(box.style, { left: `${r.left + sx - 3}px`, top: `${r.top + sy - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px`, opacity: '1' });
  if (auswahl) box.dataset.auswahl = ''; else delete box.dataset.auswahl;
  box.firstChild.textContent = beschriftung;
  const z = Number(doc.documentElement.style.getPropertyValue('--kmc-z')) || 1;
  const unten = r.top < 26 * z;
  box.firstChild.style.top = unten ? 'auto' : '-24px'; box.firstChild.style.bottom = unten ? '-24px' : 'auto';
  box.firstChild.toggleAttribute('data-unten', unten);
  return box;
}
export function markiereAuswahl() {
  const doc = iframe().contentDocument; if (!doc || !doc.body) return;
  const a = Z.ui.auswahl;
  let el = null;
  if (a?.art === 'text') el = doc.querySelector(`[data-e="${CSS.escape(a.schluessel)}"]`);
  else if (a?.art === 'bild') el = doc.querySelector(`[data-e-bild="${CSS.escape(a.schluessel)}"]`);
  else if (a?.art === 'abschnitt') el = doc.querySelector(`[data-abschnitt="${CSS.escape(a.id)}"]`);
  else if (a?.art === 'auto') el = doc.querySelector(`[data-e-auto="${CSS.escape(a.id)}"]`);
  if (auswahlEl && !auswahlEl.isConnected) auswahlEl = null;
  auswahlEl = zeichneRahmen(doc, el, auswahlEl, a ? etikett(a) : '', true);
  if (!el && auswahlEl) auswahlEl.style.opacity = '0';
}

function werkzeug(doc, z) {
  werkzeugEl?.remove(); werkzeugEl = null;
  if (!z || editierend) return;
  const box = doc.createElement('div'); box.className = 'kmc-werkzeug'; box.setAttribute('role', 'toolbar'); box.setAttribute('aria-label', 'Werkzeuge');
  const knopf = (icon, text, fn) => { const b = doc.createElement('button'); b.type = 'button'; b.innerHTML = `${svg(P[icon])}<span>${text}</span>`; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); box.append(b); };
  if (z.art === 'text') knopf('stift', istDirektEditierbar(z.schluessel) ? 'Bearbeiten' : 'Im Feld bearbeiten', () => klickText(z, null));
  if (z.art === 'bild') knopf('bild', 'Bild ersetzen', () => emit('bild-ersetzen', z.schluessel));
  if (z.art === 'auto') knopf('auto', 'Fahrzeug bearbeiten', () => emit('auto-oeffnen', z.id));
  const ab = abschnittVon(z.el);
  if (ab && Z.ui.seite.endsWith('index.html') && !Z.ui.seite.includes('fahrzeug')) {
    if (box.children.length) box.append(doc.createElement('i'));
    if (ab !== 'held') {
      knopf('auge', 'Ausblenden', () => emit('abschnitt', { id: ab, aktion: 'aus' }));
      knopf('hoch', '', () => emit('abschnitt', { id: ab, aktion: 'hoch' }));
      knopf('runter', '', () => emit('abschnitt', { id: ab, aktion: 'runter' }));
      box.lastChild.setAttribute('aria-label', 'Abschnitt nach unten'); box.lastChild.previousSibling.setAttribute('aria-label', 'Abschnitt nach oben');
    }
  }
  if (!box.children.length) return;
  doc.body.append(box);
  const r = z.el.getBoundingClientRect(), sx = doc.defaultView.scrollX, sy = doc.defaultView.scrollY;
  const zf = Number(doc.documentElement.style.getPropertyValue('--kmc-z')) || 1;
  const bw = box.offsetWidth, bh = box.offsetHeight;
  const rechts = Math.max(bw * zf + 8, Math.min(doc.documentElement.clientWidth - 8, r.right + sx));
  box.style.left = `${rechts - bw}px`;
  const oben = r.top - 8 * zf - bh * zf < 4;
  box.toggleAttribute('data-unten', oben);
  box.style.top = oben ? `${r.bottom + sy + 8 * zf}px` : `${r.top + sy - 8 * zf - bh}px`;
  werkzeugEl = box;
}

function klickText(z, e) {
  emit('auswahl', { art: 'text', schluessel: z.schluessel });
  if (!istDirektEditierbar(z.schluessel)) return;
  starteEditieren(z.el, e);
}
function starteEditieren(el, e) {
  const doc = el.ownerDocument;
  if (editierend === el) return;
  beendeEditieren();
  editierend = el;
  werkzeugEl?.remove(); werkzeugEl = null;
  const vorher = el.textContent;
  el.setAttribute('contenteditable', 'plaintext-only');
  el.setAttribute('spellcheck', 'true');
  el.focus({ preventScroll: true });
  const sel = doc.getSelection();
  const r = e && doc.caretRangeFromPoint ? doc.caretRangeFromPoint(e.clientX, e.clientY) : null;
  if (r && el.contains(r.startContainer)) { sel.removeAllRanges(); sel.addRange(r); }
  const schluessel = el.dataset.e;
  const andere = () => [...doc.querySelectorAll(`[data-e="${CSS.escape(schluessel)}"]`)].filter((x) => x !== el);
  const ganzesModell = () => { const t = [...doc.querySelectorAll(`[data-e="${CSS.escape(schluessel)}"]`)].filter((x) => x.closest('h1')).map((x) => x.textContent); return t.join(' ').replace(/\s+/g, ' ').trim(); };
  const eingabe = () => {
    const text = el.textContent.replace(/\s+/g, ' ');
    for (const x of andere()) if (!schluessel.endsWith('.model')) x.textContent = text;
    setzeWert(schluessel, text, { zusammen: `t:${schluessel}`, still: true, ganz: schluessel.endsWith('.model') && el.closest('h1') ? ganzesModell() : undefined });
    zeichneRahmen(doc, el, auswahlEl, etikett({ art: 'text', schluessel }), true);
  };
  const taste = (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); el.blur(); }
    if (ev.key === 'Escape') { ev.preventDefault(); el.textContent = vorher; eingabe(); el.blur(); }
  };
  const einfuegen = (ev) => { ev.preventDefault(); const t = (ev.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '); doc.execCommand('insertText', false, t); };
  el.addEventListener('input', eingabe);
  el.addEventListener('keydown', taste);
  el.addEventListener('paste', einfuegen);
  el.addEventListener('blur', () => {
    el.removeEventListener('input', eingabe); el.removeEventListener('keydown', taste); el.removeEventListener('paste', einfuegen);
    el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck');
    if (editierend === el) editierend = null;
    if (el.textContent !== vorher) { emit('geaendert', { beschreibung: 'Text' }); emit('gespeichert-hinweis'); }
  }, { once: true });
}
function beendeEditieren() { if (editierend) editierend.blur(); }

export function verbindeIframe(oeffneSeite) {
  const f = iframe();
  f.addEventListener('load', () => {
    delete document.getElementById('rahmen').dataset.laedt;
    const doc = f.contentDocument, win = f.contentWindow;
    if (!doc) return;
    rahmenEl = null; auswahlEl = null; werkzeugEl = null; editierend = null;
    doc.documentElement.style.setProperty('--kmc-z', String(1 / massstab));
    emit('vorschau-geladen');
    doc.addEventListener('mouseover', (e) => {
      const z = ziel(e.target);
      if (z?.el === hoverZiel?.el) return;
      hoverZiel = z;
      if (rahmenEl && !rahmenEl.isConnected) rahmenEl = null;
      if (!z) { if (rahmenEl) rahmenEl.style.opacity = '0'; return; }
      rahmenEl = zeichneRahmen(doc, z.el, rahmenEl, etikett(z));
      werkzeug(doc, z);
    });
    doc.addEventListener('mouseleave', () => { if (rahmenEl) rahmenEl.style.opacity = '0'; });
    doc.addEventListener('click', (e) => {
      if (e.target.closest('.kmc-werkzeug')) return;
      const a = e.target.closest('a[href]');
      const z = ziel(e.target);
      if (editierend && editierend.contains(e.target)) return;
      if (z?.art === 'text') { e.preventDefault(); klickText(z, e); return; }
      if (z?.art === 'bild') { e.preventDefault(); emit('auswahl', { art: 'bild', schluessel: z.schluessel }); return; }
      if (a) {
        const href = a.getAttribute('href');
        if (href.startsWith('#')) return;
        e.preventDefault();
        const url = new URL(href, doc.baseURI);
        if (url.href.startsWith(WURZEL)) { let p = url.pathname.slice(new URL(WURZEL).pathname.length) || 'index.html'; if (p.endsWith('/')) p += 'index.html'; if (/\.html$/.test(p)) { oeffneSeite(p); return; } }
        return;
      }
      if (z?.art === 'auto') { e.preventDefault(); emit('auto-oeffnen', z.id); return; }
      if (z?.art === 'abschnitt') emit('auswahl', { art: 'abschnitt', id: z.id });
    });
    doc.addEventListener('submit', (e) => e.preventDefault(), true);
    win.addEventListener('scroll', () => { if (hoverZiel) rahmenEl = zeichneRahmen(doc, hoverZiel.el, rahmenEl, etikett(hoverZiel)); markiereAuswahl(); }, { passive: true });
    win.addEventListener('keydown', (e) => emit('taste-vorschau', e));
    markiereAuswahl();
  });
}
on('auswahl-aendern', markiereAuswahl);
export function scrolleZu(sel) {
  const doc = iframe().contentDocument; if (!doc) return;
  const el = doc.querySelector(sel);
  if (el) el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
export const iframeDoc = () => iframe().contentDocument;
