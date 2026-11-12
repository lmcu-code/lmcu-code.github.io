// KMC Website-Editor: Start, Rahmen, Tastenkürzel, Befehlspalette, Einführung, Status.
import { baue } from '../../vorlagen/bau.mjs';
import { Z, on, emit, aendere, rueck, vor, speichereJetzt, anzahlAenderungen, dateienAusDaten } from './zustand.mjs';
import { ladeEntwurf, alleBlobs, loescheBlob } from './speicher.mjs';
import { iconSprite, ic, h, $, $$, esc, toast, tooltips, dialog, schliesseDialog, dialogOffen, menue } from './ui.mjs';
import { seitenListe, zeigeSeite, aktualisiere, spieleAnimation, passeGroesse, verbindeIframe, markiereAuswahl, scrolleZu, WURZEL, cfgMitSprache, markenAufloesen } from './vorschau.mjs';
import { BEREICHE, zeichneBereich, zeichneInspektor, schalteAbschnitt, verschiebeAbschnitt, waehleBildDatei, seitenAdresse, versionenNeu } from './panels.mjs';
import { bereichFahrzeuge, inspektorAuto, neuesAuto, studio } from './fahrzeuge.mjs';
import { oeffneVeroeffentlichen, exportiereZip, beobachteLive, liveUrl } from './veroeffentlichen.mjs';
import { pruefe } from './pruefung.mjs';
import { kopf, fuehreZusammen } from './github.mjs';
import { fid } from './felder.mjs';

const app = $('#app');
const schmal = () => matchMedia('(max-width: 899px)').matches;
const mittel = () => matchMedia('(max-width: 1099px)').matches;
const DATEN = ['konfiguration.json', 'cars.json', 'i18n/de.json', 'i18n/tr.json', 'i18n/en.json', 'medien.json'];
const norm = (pfad, text) => JSON.stringify(JSON.parse(text), null, pfad === 'medien.json' ? 1 : 2) + '\n';

// ================= Start =================
async function start() {
  iconSprite();
  baueSchiene();
  try {
    const roh = await ladeLive();
    const live = { cfg: JSON.parse(roh['konfiguration.json']), cars: JSON.parse(roh['cars.json']), texte: { de: JSON.parse(roh['i18n/de.json']), tr: JSON.parse(roh['i18n/tr.json']), en: JSON.parse(roh['i18n/en.json']) }, medien: JSON.parse(roh['medien.json']) };
    const liveDateien = dateienAusDaten(live);
    const entwurf = await ladeEntwurf().catch(() => null);
    const blobs = await alleBlobs().catch(() => new Map());
    if (entwurf?.daten && entwurf.basis) {
      Z.daten = entwurf.daten; Z.basis = entwurf.basis; Z.live = entwurf.live || {};
      for (const [p, b] of blobs) { if (Object.prototype.hasOwnProperty.call(live.medien.dateien, p)) { loescheBlob(p).catch(() => {}); continue; } Z.blobs.set(p, b); Z.urls.set(p, URL.createObjectURL(b)); }
      const geaendert = DATEN.some((p) => liveDateien[p] !== Z.basis.dateien[p]);
      if (geaendert) {
        const eigene = anzahlAenderungen();
        if (!eigene && !Z.blobs.size) Z.daten = live;
        else {
          const k = [];
          const alt = Object.fromEntries(DATEN.map((p) => [p, Z.basis.dateien[p] ? JSON.parse(Z.basis.dateien[p]) : null]));
          const neu = { cfg: fuehreZusammen(alt['konfiguration.json'], Z.daten.cfg, live.cfg, 'konfiguration', k), cars: fuehreZusammen(alt['cars.json'], Z.daten.cars, live.cars, 'fahrzeuge', k), texte: {}, medien: { ...live.medien, dateien: { ...live.medien.dateien, ...Z.daten.medien.dateien } } };
          for (const l of ['de', 'tr', 'en']) neu.texte[l] = fuehreZusammen(alt[`i18n/${l}.json`], Z.daten.texte[l], live.texte[l], `texte ${l}`, k);
          Z.daten = neu;
          setTimeout(() => toast(k.length ? `Die Website wurde inzwischen geändert. Übernommen; an ${k.length} Stelle${k.length > 1 ? 'n' : ''} gilt Ihr Entwurf.` : 'Die Website wurde inzwischen geändert. Die Änderungen sind in Ihren Entwurf übernommen.', { art: 'info', dauer: 7000 }), 600);
        }
        Z.basis = { dateien: liveDateien, sha: null, geladen: Date.now(), blobs: [] };
      }
    } else {
      Z.daten = live; Z.basis = { dateien: liveDateien, sha: null, geladen: Date.now(), blobs: [] };
    }
    Z.daten.cfg.design = Z.daten.cfg.design || {}; Z.daten.cfg.animation = Z.daten.cfg.animation || {}; Z.daten.cfg.startseite = Z.daten.cfg.startseite || {}; Z.daten.cfg.seo = Z.daten.cfg.seo || {};
  } catch (e) {
    console.error(e);
    app.dataset.zustand = 'fehler';
    $('#arbeit').append(h('div.ladefehler', { role: 'alert' }, h('span', { html: ic('fehler') }), h('strong', { text: 'Die Website-Daten konnten nicht geladen werden.' }), h('p', { text: navigator.onLine === false ? 'Keine Internetverbindung. Bitte verbinden und neu laden.' : 'Bitte die Seite neu laden. Bleibt der Fehler, ist die Website gerade nicht erreichbar.' }), h('button.knopf.knopf--primaer', { type: 'button', onclick: () => location.reload(), text: 'Neu laden' })));
    return;
  }
  // Grundstand bei GitHub (für Konflikterkennung); ohne Netz geht es auch
  const ziel = Z.daten.cfg.veroeffentlichung || {};
  if (!Z.basis.sha) kopf(ziel.repo, ziel.branch || 'main').then((sha) => { Z.basis.sha = sha; }).catch(() => {});
  try { const u = JSON.parse(localStorage.getItem('kmc-editor-ui') || '{}'); Object.assign(Z.ui, { geraet: u.geraet || (schmal() ? 390 : 1440), zoom: u.zoom || 'fit', bereich: u.bereich || 'seiten' }); } catch { /* egal */ }
  const seiteParam = new URLSearchParams(location.search).get('seite');
  if (seiteParam && seitenListe().some((s) => s.pfad === seiteParam)) Z.ui.seite = seiteParam;
  verbindeIframe((p) => emit('seite', p));
  ereignisse();
  tasten();
  tooltips();
  zeichneAlles(true);
  waehleGeraet(Z.ui.geraet, false);
  zeigeSeite(Z.ui.seite, { neu: true });
  app.dataset.zustand = 'bereit';
  status();
  setInterval(status, 30000);
  if (Z.live?.kennung && !Z.live.bestaetigt) beobachteLive(Z.live.kennung);
  addEventListener('resize', () => passeGroesse());
  addEventListener('beforeunload', (e) => { if (Z.ungespeichert) { speichereJetzt(); e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') speichereJetzt(); });
  let einf = null; try { einf = localStorage.getItem('kmc-editor-einfuehrung'); } catch { /* privat */ }
  if (!einf && !new URLSearchParams(location.search).has('ohne-einfuehrung')) setTimeout(einfuehrung, 400);
}
async function ladeLive() {
  const t = Date.now();
  const r = await Promise.all(DATEN.map((p) => fetch(`${WURZEL}${p}?t=${t}`, { cache: 'no-store' }).then((x) => { if (!x.ok) throw new Error(p); return x.text(); })));
  return Object.fromEntries(DATEN.map((p, i) => [p, r[i]]));
}

// ================= Rahmen =================
function baueSchiene() {
  const s = $('#schiene');
  s.replaceChildren();
  let n = 0;
  for (const b of BEREICHE) {
    if (b.trenner) { s.append(h('span.schiene__trenner', { 'aria-hidden': 'true' })); continue; }
    n++;
    s.append(h('button', { type: 'button', 'data-bereich': b.id, class: b.unten ? 'schiene__unten' : null, 'aria-label': b.name, 'data-tipp': b.name, 'data-kuerzel': n <= 9 ? `Alt ${n}` : null, onclick: () => emit('bereich', b.id), html: ic(b.icon) }));
  }
  const u = $('#unten');
  u.replaceChildren(
    h('button', { type: 'button', 'data-tab': 'vorschau', onclick: () => blatt(null), html: `${ic('auge')}<span>Vorschau</span>` }),
    h('button', { type: 'button', 'data-tab': 'seiten', onclick: () => emit('bereich', 'seiten'), html: `${ic('text')}<span>Texte</span>` }),
    h('button', { type: 'button', 'data-tab': 'fahrzeuge', onclick: () => emit('bereich', 'fahrzeuge'), html: `${ic('auto')}<span>Fahrzeuge</span>` }),
    h('button', { type: 'button', 'data-tab': 'mehr', onclick: mehrMenue, html: `${ic('menue')}<span>Mehr</span>` }),
  );
  $('#hilfe').addEventListener('click', einfuehrung);
  $('#rueck').addEventListener('click', () => emit('rueck'));
  $('#vor').addEventListener('click', () => emit('vor'));
  $('#veroeffentlichen').addEventListener('click', oeffneVeroeffentlichen);
  $('#vorschau').addEventListener('click', vorschauTab);
  $('#abspielen').addEventListener('click', spieleAnimation);
  $('#seitenwahl').addEventListener('click', seitenMenue);
  $('#zoom').addEventListener('change', (e) => { Z.ui.zoom = e.target.value; merkeUi(); passeGroesse(); });
  for (const b of $$('[data-geraet]')) b.addEventListener('click', () => waehleGeraet(Number(b.dataset.geraet)));
  $('.geraete').addEventListener('keydown', (e) => { const l = $$('[data-geraet]'); const i = l.findIndex((x) => x.getAttribute('aria-checked') === 'true'); const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null; if (j === null) return; e.preventDefault(); const z = l[(j + l.length) % l.length]; waehleGeraet(Number(z.dataset.geraet)); z.focus(); });
}
function mehrMenue() {
  const l = h('div.liste.mehr', {}, ...BEREICHE.filter((b) => !b.trenner && !['seiten', 'fahrzeuge'].includes(b.id)).map((b) => h('button.eintrag', { type: 'button', onclick: () => { schliesseDialog(); emit('bereich', b.id); }, html: `${ic(b.icon)}<span class="eintrag__text"><strong>${esc(b.name)}</strong><small>${esc(b.text)}</small></span>` })),
    h('button.eintrag', { type: 'button', onclick: () => { schliesseDialog(); exportiereZip(); }, html: `${ic('zip')}<span class="eintrag__text"><strong>Als ZIP herunterladen</strong><small>Ganze Website als Datei</small></span>` }),
    h('button.eintrag', { type: 'button', onclick: () => { schliesseDialog(); einfuehrung(); }, html: `${ic('hilfe')}<span class="eintrag__text"><strong>Einführung</strong><small>Die drei Schritte noch einmal</small></span>` }));
  dialog({ titel: 'Mehr', inhalt: l });
}
function merkeUi() { try { localStorage.setItem('kmc-editor-ui', JSON.stringify({ geraet: Z.ui.geraet, zoom: Z.ui.zoom, bereich: Z.ui.bereich })); } catch { /* egal */ } }
function waehleGeraet(w, merken = true) {
  Z.ui.geraet = w;
  for (const b of $$('[data-geraet]')) { const an = Number(b.dataset.geraet) === w; b.setAttribute('aria-checked', an ? 'true' : 'false'); b.tabIndex = an ? 0 : -1; }
  $('#zoom').value = Z.ui.zoom;
  passeGroesse();
  if (merken) merkeUi();
}
function blatt(welches) {
  if (welches) app.dataset.blatt = welches; else delete app.dataset.blatt;
  const tab = !welches ? 'vorschau' : welches === 'rechts' && Z.ui.auswahl?.art !== 'auto' ? 'seiten' : ['seiten', 'fahrzeuge'].includes(Z.ui.bereich) ? Z.ui.bereich : 'mehr';
  for (const b of $$('#unten button')) b.setAttribute('aria-current', b.dataset.tab === tab ? 'true' : 'false');
}

// ---------- Neuzeichnen mit Fokuserhalt ----------
let zeichnet = false;
function ersetze(box, neu, erzwingen) {
  const a = document.activeElement;
  const drin = a && box.contains(a);
  if (drin && !erzwingen && (a.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]), textarea, select') || a.closest('[role=application]'))) return false;
  if (drin && erzwingen === 'weich' && (a.matches('select, input[type=range], input[type=color]') || a.closest('[role=application]'))) return false;
  const id = drin ? a.id : null;
  const sel = drin && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null;
  const scroll = box.scrollTop;
  zeichnet = true;
  try {
    box.replaceChildren(...[].concat(neu).filter(Boolean));
    box.scrollTop = scroll;
    if (id) { const n = document.getElementById(id); if (n) { n.focus({ preventScroll: true }); if (sel && 'setSelectionRange' in n) try { n.setSelectionRange(...sel); } catch { /* typ */ } } }
  } finally { zeichnet = false; }
  return true;
}
let rafPanels = 0, erzwingenPlan = false;
const STAERKE = { false: 0, weich: 1, true: 2 };
function planePanels(erzwingen = false) { if (STAERKE[erzwingen] > STAERKE[erzwingenPlan]) erzwingenPlan = erzwingen; cancelAnimationFrame(rafPanels); rafPanels = requestAnimationFrame(() => { const e = erzwingenPlan; erzwingenPlan = false; zeichneLinks(e); zeichneRechts(e); zeichneSchiene(); }); }
function zeichneAlles(erzwingen) { zeichneSchiene(); zeichneLinks(erzwingen); zeichneRechts(erzwingen); seitenName(); }
function zeichneSchiene() {
  const fehler = pruefe().filter((p) => p.art === 'fehler').length;
  for (const b of $$('#schiene [data-bereich]')) {
    b.setAttribute('aria-current', b.dataset.bereich === Z.ui.bereich ? 'true' : 'false');
    b.querySelector('.zaehler')?.remove();
    if (b.dataset.bereich === 'pruefen' && fehler) { b.append(h('span.zaehler', { text: String(fehler), 'aria-hidden': 'true' })); b.setAttribute('aria-label', `Prüfliste, ${fehler} offen`); }
  }
}
function zeichneLinks(erzwingen) { ersetze($('#links'), Z.ui.bereich === 'fahrzeuge' ? bereichFahrzeuge() : zeichneBereich(Z.ui.bereich), erzwingen); }
function zeichneRechts(erzwingen) {
  const a = Z.ui.auswahl;
  ersetze($('#rechts'), a?.art === 'auto' ? inspektorAuto(a.id) : zeichneInspektor(), erzwingen);
  app.toggleAttribute('data-auswahl', !!a);
}
function seitenName() {
  const s = seitenListe().find((x) => x.pfad === Z.ui.seite);
  $('#seitenname').textContent = s ? s.name : 'Seite';
  $('#seitenwahl').setAttribute('aria-label', `Seite wählen, aktuell: ${s ? s.name : ''}`);
}
function seitenMenue() {
  const l = seitenListe();
  const gruppen = [...new Set(l.map((s) => s.gruppe))].map((g) => ({ titel: g, eintraege: l.filter((s) => s.gruppe === g).map((s) => ({ text: s.name, wert: s.pfad, aktiv: s.pfad === Z.ui.seite, icon: s.icon })) }));
  menue($('#seitenwahl'), gruppen, (p) => emit('seite', p));
}

// ================= Status =================
function relativ(ms) { const s = Math.round((Date.now() - ms) / 1000); if (s < 60) return 'wenigen Sekunden'; const m = Math.round(s / 60); if (m < 60) return `${m} Minute${m > 1 ? 'n' : ''}`; const st = Math.round(m / 60); if (st < 24) return `${st} Stunde${st > 1 ? 'n' : ''}`; const t = Math.round(st / 24); return `${t} Tag${t > 1 ? 'en' : ''}`; }
let speicherZustand = 'fertig', statusFehler = '';
function status(info) {
  if (info?.fehler) statusFehler = info.fehler;
  const el = $('#status'), text = el.querySelector('.status__text');
  const n = Z.daten ? anzahlAenderungen() : 0;
  let art, t;
  if (speicherZustand === 'laeuft') { art = 'speichert'; t = 'Speichert …'; }
  else if (speicherZustand === 'fehler') { art = 'fehler'; t = 'Entwurf nicht gespeichert'; }
  else if (n > 0) { art = 'offen'; t = `Nicht veröffentlichte Änderungen (${n})`; statusFehler = ''; }
  else if (Z.live?.zeit && Z.live.bestaetigt) { art = 'live'; t = `Live seit ${relativ(Z.live.zeit)}`; }
  else if (Z.live?.zeit) { art = 'live'; t = 'Veröffentlicht · wird live …'; }
  else { art = 'gespeichert'; t = 'Alle Änderungen gespeichert'; }
  el.dataset.art = art; text.textContent = t;
  el.title = statusFehler || '';
  $('#rueck').disabled = !Z.verlauf.length; $('#vor').disabled = !Z.zukunft.length;
  $('#rueck').dataset.tipp = Z.verlauf.length ? `Rückgängig: ${Z.verlauf.at(-1).beschreibung}` : 'Rückgängig';
  $('#vor').dataset.tipp = Z.zukunft.length ? `Wiederholen: ${Z.zukunft.at(-1).beschreibung}` : 'Wiederholen';
  const pub = $('#veroeffentlichen');
  pub.dataset.offen = n > 0 ? '' : null; if (n === 0) delete pub.dataset.offen;
  pub.setAttribute('aria-label', n > 0 ? `Veröffentlichen, ${n} Änderungen` : 'Veröffentlichen');
}

// ================= Ereignisse =================
function ereignisse() {
  on('geaendert', (info) => { aktualisiere(); status(); planePanels(!!info?.verlauf); });
  on('speichern', (z) => { speicherZustand = z; status(); });
  on('status', status);
  on('neu', () => planePanels(true));
  on('rueck', () => { const b = rueck(); if (b) toast(`Rückgängig: ${b}`, { art: 'info', dauer: 1800 }); });
  on('vor', () => { const b = vor(); if (b) toast(`Wiederholt: ${b}`, { art: 'info', dauer: 1800 }); });
  on('auswahl', (sel) => {
    Z.ui.auswahl = sel;
    markiereAuswahl();
    zeichneRechts(true); zeichneLinks(false);
    if (sel && schmal()) blatt('rechts');
    if (!sel && app.dataset.blatt === 'rechts') blatt(null);
    if (sel?.art === 'text' && !schmal()) setTimeout(() => { if (!$('#vorschaurahmen').contentDocument?.querySelector('[contenteditable]')) $('#rechts [data-autofokus]')?.focus({ preventScroll: true }); }, 30);
  });
  on('auto-oeffnen', (id) => {
    const seite = `${Z.ui.sprache === 'de' ? '' : Z.ui.sprache + '/'}fahrzeug/${id}/index.html`;
    const ausListe = Z.ui.bereich === 'fahrzeuge';
    if (Z.ui.bereich !== 'fahrzeuge') { Z.ui.bereich = 'fahrzeuge'; merkeUi(); }
    Z.ui.auswahl = { art: 'auto', id };
    if (Z.ui.foto == null || Z.ui.letztesAuto !== id) Z.ui.foto = 0;
    Z.ui.letztesAuto = id;
    if (ausListe && Z.ui.seite !== seite) { zeigeSeite(seite, { neu: true }); seitenName(); }
    markiereAuswahl();
    zeichneAlles(true);
    if (schmal()) blatt('rechts');
  });
  on('auto-id', ({ alt, neu }) => {
    if (Z.ui.auswahl?.id === alt) Z.ui.auswahl = { ...Z.ui.auswahl, id: neu };
    if (Z.ui.seite.includes(`fahrzeug/${alt}/`)) { Z.ui.seite = Z.ui.seite.replace(`fahrzeug/${alt}/`, `fahrzeug/${neu}/`); zeigeSeite(Z.ui.seite, { neu: true }); seitenName(); }
  });
  on('seite', (p) => {
    if (!p) return;
    const autoId = p.match(/fahrzeug\/([^/]+)\//)?.[1];
    if (!autoId && Z.ui.auswahl?.art === 'auto') Z.ui.auswahl = null;
    if (Z.ui.auswahl && Z.ui.auswahl.art !== 'auto') Z.ui.auswahl = null;
    zeigeSeite(p, { neu: true });
    seitenName();
    zeichneAlles(true);
    const u = new URL(location.href); u.searchParams.set('seite', p); history.replaceState(null, '', u);
    if (schmal() && app.dataset.blatt === 'links' && Z.ui.bereich === 'seiten') blatt(null);
  });
  on('bereich', (id) => {
    const gleich = Z.ui.bereich === id;
    Z.ui.bereich = id; merkeUi();
    zeichneSchiene(); zeichneLinks(true);
    if (mittel() && !schmal()) { if (gleich && app.hasAttribute('data-links-offen')) app.removeAttribute('data-links-offen'); else app.setAttribute('data-links-offen', ''); }
    if (schmal()) blatt('links');
    setTimeout(() => $('#links .panel__kopf h2')?.closest('.panel')?.querySelector('input, button:not(.ik), select')?.focus({ preventScroll: true }), 30);
  });
  on('sprache', (l) => {
    const alt = Z.ui.sprache; Z.ui.sprache = l;
    let p = Z.ui.seite.replace(/^(tr|en)\//, '');
    if (!/^(impressum|datenschutz)\.html$/.test(p) && l !== 'de') p = `${l}/${p}`;
    Z.ui.seite = p; Z.ui.auswahl = Z.ui.auswahl?.art === 'auto' ? Z.ui.auswahl : null;
    zeigeSeite(p, { neu: true }); seitenName(); zeichneAlles(true);
    if (alt !== l) toast(`Sie bearbeiten jetzt: ${{ de: 'Deutsch', tr: 'Türkçe', en: 'English' }[l]}`, { art: 'info', dauer: 2000 });
  });
  on('springe', springe);
  on('abschnitt', ({ id, aktion }) => { if (aktion === 'aus') schalteAbschnitt(id, false); else verschiebeAbschnitt(id, aktion === 'hoch' ? -1 : 1); setTimeout(() => scrolleZu(`[data-abschnitt="${id}"]`), 120); });
  on('bild-ersetzen', (k) => { emit('auswahl', { art: 'bild', schluessel: k }); waehleBildDatei(k); });
  on('verwerfen', () => {
    dialog({ titel: 'Entwurf verwerfen?', inhalt: h('p', { text: 'Alle nicht veröffentlichten Änderungen werden auf den Stand der Website zurückgesetzt. Mit „Rückgängig“ holen Sie sie zurück, solange der Editor offen ist.' }), fuss: [h('button.knopf.knopf--leise', { type: 'button', onclick: schliesseDialog, text: 'Abbrechen' }), h('button.knopf.knopf--gefahr', { type: 'button', text: 'Verwerfen', onclick: () => {
      schliesseDialog();
      aendere('Entwurf verworfen', (d) => { const b = Z.basis.dateien; d.cfg = JSON.parse(b['konfiguration.json']); d.cars = JSON.parse(b['cars.json']); d.texte = { de: JSON.parse(b['i18n/de.json']), tr: JSON.parse(b['i18n/tr.json']), en: JSON.parse(b['i18n/en.json']) }; d.medien = JSON.parse(b['medien.json']); });
      Z.ui.auswahl = null; emit('neu');
      toast('Entwurf verworfen', { art: 'info', aktion: { text: 'Rückgängig', tun: () => emit('rueck') } });
    } })] });
  });
  on('veroeffentlicht', () => { versionenNeu(); planePanels(true); });
  on('taste-vorschau', (e) => taste(e, true));
  on('vorschau-geladen', () => { markiereAuswahl(); });
  on('massstab', (m) => { const o = $('#zoom option[value="fit"]'); if (o) o.textContent = `Anpassen · ${m} %`; });
  window.addEventListener('focusout', (e) => { if (!zeichnet && e.target.isConnected && e.target.closest?.('#links, #rechts') && e.target.matches('input, textarea, select')) planePanels('weich'); });
  matchMedia('(max-width: 899px)').addEventListener('change', () => { blatt(null); passeGroesse(); });
}

function springe(ziel) {
  if (!ziel) return;
  if (ziel.bereich === 'fahrzeuge' && ziel.id) {
    if (ziel.reiter) Z.ui.reiter = ziel.reiter; else if (ziel.feld) Z.ui.reiter = 'daten';
    if (ziel.foto != null) Z.ui.foto = ziel.foto;
    Z.ui.bereich = 'fahrzeuge';
    emit('auto-oeffnen', ziel.id);
    const seite = `fahrzeug/${ziel.id}/index.html`; if (Z.ui.seite !== seite) emit('seite', seite);
    setTimeout(() => { const el = document.getElementById(ziel.feld ? fid('a-' + ziel.feld) : ziel.foto != null ? fid('foto-alt') : ''); el?.focus(); el?.scrollIntoView({ block: 'center' }); }, 80);
    return;
  }
  if (ziel.seite) emit('seite', ziel.seite);
  if (ziel.bereich) emit('bereich', ziel.bereich);
  if (ziel.auswahl) emit('auswahl', ziel.auswahl);
  if (ziel.abschnitt) setTimeout(() => { const el = document.getElementById('betrieb-' + ziel.abschnitt); el?.scrollIntoView({ block: 'start' }); el?.querySelector('input')?.focus({ preventScroll: true }); }, 60);
}

// ================= Tastatur =================
const tippt = (el) => el && (el.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select, [contenteditable]') || el.isContentEditable);
function taste(e, ausVorschau = false) {
  const strg = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (strg && k === 'z' && !e.shiftKey) { e.preventDefault(); if (ausVorschau) $('#vorschaurahmen').contentDocument?.activeElement?.blur?.(); emit('rueck'); return; }
  if (strg && ((k === 'z' && e.shiftKey) || k === 'y')) { e.preventDefault(); emit('vor'); return; }
  if (strg && k === 'k') { e.preventDefault(); palette(); return; }
  if (strg && k === 's') { e.preventDefault(); speichereJetzt().then(() => toast('Gespeichert ✓', { dauer: 1600 })); return; }
  if (strg && k === 'p' && e.shiftKey) { e.preventDefault(); oeffneVeroeffentlichen(); return; }
  if (strg && k === 'p') { e.preventDefault(); vorschauTab(); return; }
  if (ausVorschau) return;
  if (dialogOffen()) return;
  if (e.altKey && /^[1-9]$/.test(e.key)) { const l = BEREICHE.filter((b) => !b.trenner); const b = l[Number(e.key) - 1]; if (b) { e.preventDefault(); emit('bereich', b.id); } return; }
  if (tippt(document.activeElement)) return;
  if (e.key === 'Escape') { if (app.dataset.blatt) blatt(null); else if (Z.ui.auswahl) emit('auswahl', null); return; }
  if (strg || e.altKey) return;
  if (e.key === '1' || e.key === '2' || e.key === '3') { waehleGeraet([390, 768, 1440][Number(e.key) - 1]); return; }
  if (e.key === '?') { einfuehrung(); return; }
  if (k === 'n' && Z.ui.bereich === 'fahrzeuge') { e.preventDefault(); neuesAuto(); }
}
function tasten() { document.addEventListener('keydown', (e) => taste(e)); }

// ================= Vorschau im neuen Tab =================
function vorschauTab() {
  const d = Z.daten;
  const html = baue({ cfg: cfgMitSprache(d.cfg, Z.ui.sprache), daten: d.cars, texte: d.texte, medien: d.medien, nurSeiten: [Z.ui.seite] }).seiten[Z.ui.seite] || '';
  const ordner = Z.ui.seite.includes('/') ? Z.ui.seite.slice(0, Z.ui.seite.lastIndexOf('/') + 1) : '';
  let x = html.replace('<head>', `<head><base href="${WURZEL}${ordner}">`);
  for (const [p, u] of Z.urls) x = x.split(p).join(u).replace(new RegExp(`(?:\\.\\./)+${u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), u);
  const w = open(URL.createObjectURL(new Blob([x], { type: 'text/html' })), '_blank', 'noopener');
  if (!w) toast('Der Browser hat das neue Fenster blockiert.', { art: 'fehler' });
}

// ================= Befehlspalette (Strg + K) =================
function befehle() {
  const l = [];
  const b = (gruppe, text, icon, tun, kuerzel = '') => l.push({ gruppe, text, icon, tun, kuerzel });
  b('Aktionen', 'Veröffentlichen', 'wolke', oeffneVeroeffentlichen, 'Strg ⇧ P');
  b('Aktionen', 'Neues Fahrzeug', 'plus', () => { emit('bereich', 'fahrzeuge'); neuesAuto(); }, 'N');
  b('Aktionen', 'Als ZIP herunterladen', 'zip', exportiereZip);
  b('Aktionen', 'Vorschau im neuen Tab', 'extern', vorschauTab, 'Strg P');
  b('Aktionen', 'Animation abspielen', 'play', spieleAnimation);
  b('Aktionen', 'Rückgängig', 'rueck', () => emit('rueck'), 'Strg Z');
  b('Aktionen', 'Wiederholen', 'vor', () => emit('vor'), 'Strg ⇧ Z');
  b('Aktionen', 'Einführung zeigen', 'hilfe', einfuehrung, '?');
  b('Aktionen', 'Website ansehen (live)', 'extern', () => open(liveUrl(), '_blank', 'noopener'));
  for (const [w, n, k] of [[390, 'Handy', '1'], [768, 'Tablet', '2'], [1440, 'Desktop', '3']]) b('Ansicht', `Gerät: ${n}`, n === 'Handy' ? 'handy' : n === 'Tablet' ? 'tablet' : 'desktop', () => waehleGeraet(w), k);
  BEREICHE.filter((x) => !x.trenner).forEach((x, i) => b('Bereiche', x.name, x.icon, () => emit('bereich', x.id), i < 9 ? `Alt ${i + 1}` : ''));
  for (const s of seitenListe()) b('Seiten', s.name, s.icon, () => emit('seite', s.pfad), seitenAdresse(s.pfad));
  for (const c of Z.daten.cars.cars) { b('Fahrzeuge', `${c.model || 'Neues Fahrzeug'} bearbeiten`, 'auto', () => { emit('bereich', 'fahrzeuge'); emit('auto-oeffnen', c.id); }, c.price); if ((c.media?.gallery || []).length) b('Fahrzeuge', `Stellen markieren: ${c.model}`, 'ziel', () => { emit('auto-oeffnen', c.id); studio(c.id, 0); }); }
  for (const l2 of ['de', 'tr', 'en']) b('Sprachen', `Bearbeiten auf ${{ de: 'Deutsch', tr: 'Türkçe', en: 'English' }[l2]}`, 'sprachen', () => emit('sprache', l2));
  // Texte durchsuchbar
  const lauf = (o, p) => { if (typeof o === 'string') { if (o.length > 2 && !/^(\{|i-)/.test(o)) l.push({ gruppe: 'Texte', text: o.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 90), icon: 'text', schluessel: p, tun: () => textSpringen(p) }); return; } if (o && typeof o === 'object') for (const k of Object.keys(o)) if (!['_status', 'lang', 'meta', 'zeiten'].includes(k) || p) lauf(o[k], p ? `${p}.${k}` : k); };
  lauf(Z.daten.texte[Z.ui.sprache], '');
  return l;
}
function textSpringen(schluessel) {
  const ns = schluessel.split('.')[0];
  const seite = ns === 'recht' ? (schluessel.includes('datenschutz') ? 'datenschutz.html' : 'impressum.html') : ns === 'fahrzeug' ? `${Z.ui.sprache === 'de' ? '' : Z.ui.sprache + '/'}fahrzeug/${Z.daten.cars.cars[0]?.id}/index.html` : `${Z.ui.sprache === 'de' ? '' : Z.ui.sprache + '/'}index.html`;
  if (Z.ui.seite !== seite) emit('seite', seite);
  emit('bereich', 'seiten');
  emit('auswahl', { art: 'text', schluessel });
  setTimeout(() => { scrolleZu(`[data-e="${CSS.escape(schluessel)}"]`); markiereAuswahl(); }, 250);
}
function palette() {
  if (dialogOffen()) schliesseDialog();
  const alle = befehle();
  const input = h('input', { type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'palette-liste', 'aria-autocomplete': 'list', placeholder: 'Befehl, Seite, Fahrzeug oder Text suchen …', 'aria-label': 'Befehl suchen', autocomplete: 'off', spellcheck: 'false' });
  const ul = h('ul.palette__liste', { id: 'palette-liste', role: 'listbox', 'aria-label': 'Treffer' });
  let treffer = [], wahl = 0;
  const zeichne = () => {
    const q = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    treffer = alle.filter((x) => (q.length ? q.every((w) => `${x.text} ${x.gruppe} ${x.schluessel || ''}`.toLowerCase().includes(w)) : x.gruppe !== 'Texte')).slice(0, 60);
    wahl = Math.min(wahl, Math.max(0, treffer.length - 1));
    ul.replaceChildren();
    let g = '';
    treffer.forEach((x, i) => {
      if (x.gruppe !== g) { g = x.gruppe; ul.append(h('li.palette__gruppe', { role: 'presentation', text: g })); }
      ul.append(h('li', { role: 'option', id: `pal-${i}`, 'aria-selected': i === wahl ? 'true' : 'false', onclick: () => ausfuehren(i), onpointermove: () => { if (wahl !== i) { wahl = i; markiere(); } }, html: `${ic(x.icon)}<span>${esc(x.text)}</span>${x.kuerzel ? `<small>${x.kuerzel.split(' ').length > 1 && /^(Strg|Alt|N|\?|\d)$/.test(x.kuerzel.split(' ')[0]) ? x.kuerzel.split(' ').map((k) => `<kbd>${esc(k)}</kbd>`).join('') : /^(Strg|Alt|N|\?|\d)/.test(x.kuerzel) ? `<kbd>${esc(x.kuerzel)}</kbd>` : esc(x.kuerzel)}</small>` : ''}` }));
    });
    if (!treffer.length) ul.append(h('li.palette__leer', { role: 'presentation', text: 'Nichts gefunden.' }));
    markiere();
  };
  const markiere = () => { for (const li of ul.querySelectorAll('[role=option]')) li.setAttribute('aria-selected', li.id === `pal-${wahl}` ? 'true' : 'false'); input.setAttribute('aria-activedescendant', treffer.length ? `pal-${wahl}` : ''); ul.querySelector(`#pal-${wahl}`)?.scrollIntoView({ block: 'nearest' }); };
  const ausfuehren = (i) => { const x = treffer[i]; if (!x) return; schliesseDialog(); setTimeout(x.tun, 10); };
  input.addEventListener('input', () => { wahl = 0; zeichne(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); wahl = Math.min(treffer.length - 1, wahl + 1); markiere(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); wahl = Math.max(0, wahl - 1); markiere(); }
    if (e.key === 'Enter') { e.preventDefault(); ausfuehren(wahl); }
  });
  dialog({ titel: 'Befehle', ohneKopf: true, klasse: 'palette', inhalt: h('div', {}, h('div.palette__suche', {}, h('span', { html: ic('suche') }), input, h('kbd', { text: 'Esc' })), ul, h('p.palette__fuss', { 'aria-hidden': 'true', html: '<span><kbd>↑</kbd><kbd>↓</kbd> wählen</span><span><kbd>Enter</kbd> ausführen</span><span>Suche auch in allen Texten</span>' })) });
  zeichne();
  setTimeout(() => input.focus(), 20);
}

// ================= Einführung (3 Schritte) =================
const SCHRITTE = [
  { titel: 'Klicken und schreiben', text: 'Fahren Sie in der Vorschau über einen Text: ein kupferner Rahmen zeigt, was bearbeitbar ist. Klicken, tippen, fertig. Bilder ersetzen Sie über die kleine Leiste darüber.', skizze: 'text' },
  { titel: 'Fahrzeuge pflegen', text: 'Unter „Fahrzeuge“ legen Sie ein Auto an, ziehen Fotos hinein und markieren Stellen direkt auf dem Foto. Preis, MwSt. und Eckdaten werden geprüft.', skizze: 'auto' },
  { titel: 'Prüfen und veröffentlichen', text: 'Alles wird automatisch als Entwurf gespeichert. „Veröffentlichen“ prüft vorher die wichtigsten Punkte und bringt die Website mit einem Klick online.', skizze: 'live' },
];
function skizze(art) {
  const s = h('div.skizze', { 'aria-hidden': 'true' });
  const i = (st, kl = '') => h('i', { class: kl, style: st });
  if (art === 'text') s.append(i({ left: '8%', top: '10%', width: '84%', height: '9%' }), i({ left: '8%', top: '30%', width: '62%', height: '13%' }, 'ak'), h('span.etikett', { text: 'Text · Hero', style: { left: '8%', top: 'calc(30% - 20px)' } }), i({ left: '8%', top: '48%', width: '48%', height: '5%' }), i({ left: '8%', top: '62%', width: '26%', height: '9%' }), i({ left: '58%', top: '50%', width: '34%', height: '38%' }));
  if (art === 'auto') s.append(i({ left: '8%', top: '10%', width: '84%', height: '52%' }), i({ left: '30%', top: '30%', width: '14px', height: '14px', borderRadius: '50%' }, 'ak'), i({ left: '62%', top: '44%', width: '14px', height: '14px', borderRadius: '50%' }, 'ak'), i({ left: '8%', top: '68%', width: '26%', height: '18%' }), i({ left: '37%', top: '68%', width: '26%', height: '18%' }), i({ left: '66%', top: '68%', width: '26%', height: '18%' }));
  if (art === 'live') s.append(i({ left: '8%', top: '12%', width: '84%', height: '10%' }), i({ left: '8%', top: '30%', width: '84%', height: '8%' }), i({ left: '8%', top: '42%', width: '84%', height: '8%' }), i({ left: '8%', top: '54%', width: '84%', height: '8%' }), i({ left: '56%', top: '74%', width: '36%', height: '12%' }, 'ak'), h('span.etikett', { text: 'Veröffentlichen', style: { left: '58%', top: 'calc(74% + 9px)', background: 'transparent', color: '#e0b088' } }));
  return s;
}
function einfuehrung() {
  let n = 0;
  const bild = h('div.einfuehrung__bild');
  const text = h('div.einfuehrung__text');
  const fertig = () => { try { localStorage.setItem('kmc-editor-einfuehrung', '1'); } catch { /* privat */ } schliesseDialog(); };
  const zeichne = () => {
    const s = SCHRITTE[n];
    bild.replaceChildren(skizze(s.skizze));
    text.replaceChildren(
      h('p.einfuehrung__schritt', { text: `Schritt ${n + 1} von 3` }),
      h('h2', { id: 'einf-titel', text: s.titel }),
      h('p', { text: s.text }),
      h('div.einfuehrung__punkte', { 'aria-hidden': 'true' }, ...SCHRITTE.map((_, i) => h('i', { 'data-an': i === n ? '' : null }))),
      h('div.einfuehrung__knoepfe', {},
        h('button.knopf.knopf--leise', { type: 'button', onclick: fertig, text: 'Überspringen' }),
        h('div.knopfzeile', {}, n > 0 ? h('button.knopf.knopf--leise', { type: 'button', onclick: () => { n--; zeichne(); }, text: 'Zurück' }) : null,
          h('button.knopf.knopf--primaer', { type: 'button', id: 'einf-weiter', onclick: () => { if (n < 2) { n++; zeichne(); $('#einf-weiter')?.focus(); } else fertig(); }, text: n < 2 ? 'Weiter' : 'Los geht’s' }))));
  };
  zeichne();
  dialog({ titel: 'Einführung', ohneKopf: true, klasse: 'einfuehrung', inhalt: h('div.einfuehrung__innen', {}, bild, text), beimSchliessen: () => { try { localStorage.setItem('kmc-editor-einfuehrung', '1'); } catch { /* privat */ } } });
  setTimeout(() => { const d = $('.dialog.einfuehrung'); d?.setAttribute('tabindex', '-1'); d?.focus(); }, 40);
}

start();
