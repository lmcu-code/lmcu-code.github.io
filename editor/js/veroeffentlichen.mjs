// Veröffentlichen: Prüfliste → Fortschritt (Daten, Bilder, Seiten, GitHub) → Erfolg mit Live-Link. Ohne Token: ZIP.
import { baue, VERSION } from '../../vorlagen/bau.mjs';
import { Z, emit, aendere, dateienAusDaten, speichereJetzt } from './zustand.mjs';
import { h, ic, esc, toast, dialog, schliesseDialog } from './ui.mjs';
import { knopf, hinweis } from './felder.mjs';
import { pruefe } from './pruefung.mjs';
import { pruefListe } from './panels.mjs';
import { token, kopf, dateiAmStand, veroeffentliche, fuehreZusammen, GitFehler } from './github.mjs';
import { baueZip } from './zip.mjs';
import { WURZEL } from './vorschau.mjs';
import { loescheBlob } from './speicher.mjs';

const ziel = () => ({ repo: Z.daten.cfg.veroeffentlichung?.repo || 'lmcu-code/lmcu-code.github.io', zweig: Z.daten.cfg.veroeffentlichung?.branch || 'main' });
export const liveUrl = () => (Z.daten.cfg.domain || '').replace(/\/$/, '') + '/';

export function seitenAus(daten) { return baue({ cfg: daten.cfg, daten: daten.cars, texte: daten.texte, medien: daten.medien }).seiten; }
function basisDaten() {
  try { const b = Z.basis.dateien; return { cfg: JSON.parse(b['konfiguration.json']), cars: JSON.parse(b['cars.json']), texte: Object.fromEntries(['de', 'tr', 'en'].filter((l) => b[`i18n/${l}.json`]).map((l) => [l, JSON.parse(b[`i18n/${l}.json`])])), medien: JSON.parse(b['medien.json'] || '{"dateien":{}}') }; } catch { return null; }
}

// Alle Dateien eines Veröffentlichens: Daten, neue Bilder, Seiten, Löschungen, version.json
export function dateiListe(kennung) {
  const daten = dateienAusDaten();
  const seiten = seitenAus(Z.daten);
  const liste = [];
  for (const [pfad, inhalt] of Object.entries(daten)) if (inhalt !== Z.basis?.dateien?.[pfad]) liste.push({ pfad, inhalt, art: 'daten' });
  const schon = new Set(Z.basis?.blobs || []);
  for (const [pfad, blob] of Z.blobs) if (!schon.has(pfad) && Object.prototype.hasOwnProperty.call(Z.daten.medien.dateien, pfad)) liste.push({ pfad, inhalt: blob, art: 'bild' });
  for (const [pfad, inhalt] of Object.entries(seiten)) liste.push({ pfad, inhalt, art: 'seite' });
  const b = basisDaten();
  if (b) for (const pfad of Object.keys(seitenAus(b))) if (!(pfad in seiten)) liste.push({ pfad, inhalt: null, art: 'seite' });
  liste.push({ pfad: 'version.json', inhalt: JSON.stringify({ kennung, zeit: new Date().toISOString(), editor: VERSION }, null, 2) + '\n', art: 'daten' });
  return liste;
}

// ---------- Dialog ----------
export function oeffneVeroeffentlichen() {
  const punkte = pruefe();
  const fehler = punkte.filter((p) => p.art === 'fehler');
  const hatToken = !!token.holen();
  const kopfText = fehler.length ? `${fehler.length} Punkt${fehler.length > 1 ? 'e' : ''} vor dem Veröffentlichen beheben` : punkte.length ? 'Fast fertig. Bitte kurz ansehen:' : 'Alles geprüft.';
  const inhalt = h('div.veroeff', {},
    h('p.veroeff__kopf', { html: `${ic(fehler.length ? 'fehler' : punkte.length ? 'warn' : 'haken')}<span>${esc(kopfText)}</span>` }),
    pruefListe(punkte),
    hatToken ? null : h('div.warnkasten.warnkasten--info', {}, h('span', { html: ic('schluessel') }), h('p', { html: '<strong>Kein Token in diesem Browser.</strong> Zum Veröffentlichen einmal den Zugang einrichten (2 Minuten). Ohne Token können Sie die Website als ZIP herunterladen.' })));
  const fuss = [
    knopf('Als ZIP herunterladen', { icon: 'zip', art: 'leise', onclick: () => { schliesseDialog(); exportiereZip(); } }),
    h('span.abstand'),
    hatToken ? knopf(fehler.length ? 'Erst beheben' : 'Jetzt veröffentlichen', { icon: 'wolke', art: 'primaer', attrs: { disabled: fehler.length > 0, id: 'jetzt-veroeffentlichen' }, onclick: () => starte() })
      : knopf('Zugang einrichten', { icon: 'schluessel', art: 'primaer', onclick: () => { schliesseDialog(); emit('bereich', 'zugang'); } }),
  ];
  dialog({ titel: 'Veröffentlichen', inhalt, fuss, klasse: 'dialog--veroeff' });
}

const SCHRITTE = [['daten', 'Daten'], ['bild', 'Bilder'], ['seite', 'Seiten'], ['github', 'GitHub veröffentlicht …']];
async function starte(wiederholt = false) {
  const { repo, zweig } = ziel();
  const zeilen = {};
  const setzeZ = (k, z, text = '') => { zeilen[k].dataset.zustand = z; zeilen[k].querySelector('small').textContent = text; if (z === 'fertig') zeilen[k].querySelector('.kreis').innerHTML = ic('haken', 'i--k'); };
  const zeigeFortschritt = () => {
    if (!document.querySelector('.dialog--veroeff')) dialog({ titel: 'Veröffentlichen', inhalt: h('div'), fuss: h('span'), klasse: 'dialog--veroeff' });
    const box = document.querySelector('.dialog .dialog__inhalt'), fussEl = document.querySelector('.dialog .dialog__fuss');
    fussEl?.replaceChildren(h('span.hinweis', { text: 'Bitte das Fenster offen lassen.' }));
    const ol = h('ol.fortschritt', { 'aria-live': 'polite' }, ...SCHRITTE.map(([k, t]) => (zeilen[k] = h('li', { 'data-zustand': 'wartet' }, h('span.kreis', { 'aria-hidden': 'true' }), h('span', { text: t }), h('small')))));
    box.replaceChildren(h('p.veroeff__kopf', { html: `${ic('wolke')}<span>Wird veröffentlicht …</span>` }), ol);
  };
  zeigeFortschritt();
  try {
    await speichereJetzt();
    setzeZ('daten', 'laeuft', 'Online-Stand prüfen');
    let eltern = await kopf(repo, zweig);
    if (Z.basis?.sha && eltern !== Z.basis.sha) { const ok = await zusammenfuehren(repo, eltern); if (!ok) { schliesseDialog(); return; } zeigeFortschritt(); }
    const kennung = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const liste = dateiListe(kennung);
    const anz = (a) => liste.filter((x) => x.art === a).length;
    const sortiert = [...liste.filter((x) => x.art === 'daten'), ...liste.filter((x) => x.art === 'bild'), ...liste.filter((x) => x.art === 'seite')];
    const gezaehlt = { daten: 0, bild: 0, seite: 0 };
    setzeZ('daten', 'laeuft', `0 / ${anz('daten')}`);
    if (!anz('bild')) setzeZ('bild', 'fertig', 'keine neuen');
    let vorher = 'daten';
    const sha = await veroeffentliche({
      repo, zweig, eltern, dateien: sortiert.map((x) => ({ pfad: x.pfad, inhalt: x.inhalt, art: x.art })),
      nachricht: `Website aktualisiert mit dem Editor (${new Date().toLocaleString('de-DE')})`,
      schritt: (d) => {
        if (d.art !== vorher) { setzeZ(vorher, 'fertig', `${gezaehlt[vorher]} / ${anz(vorher)}`); vorher = d.art; }
        gezaehlt[d.art]++;
        setzeZ(d.art, 'laeuft', `${gezaehlt[d.art]} / ${anz(d.art)}`);
      },
    });
    setzeZ(vorher, 'fertig', `${gezaehlt[vorher]} / ${anz(vorher)}`);
    for (const k of ['daten', 'bild', 'seite']) if (zeilen[k].dataset.zustand !== 'fertig') setzeZ(k, 'fertig', anz(k) ? `${anz(k)} / ${anz(k)}` : 'keine');
    setzeZ('github', 'fertig', sha.slice(0, 7));
    // Neuer Grundstand
    const veroeffBlobs = [...Z.blobs.keys()];
    Z.basis = { dateien: dateienAusDaten(), sha, geladen: Date.now(), blobs: veroeffBlobs };
    Z.live = { zeit: Date.now(), sha, kennung, bestaetigt: false };
    await speichereJetzt();
    emit('status'); emit('veroeffentlicht');
    beobachteLive(kennung);
    setTimeout(() => erfolg(sha), 350);
  } catch (e) {
    const offen = Object.values(zeilen).find((z) => z.dataset.zustand === 'laeuft') || zeilen.github;
    offen.dataset.zustand = 'fehler'; offen.querySelector('.kreis').innerHTML = ic('zu', 'i--k');
    if (e instanceof GitFehler && e.art === 'konflikt' && !wiederholt) { toast('Jemand hat zeitgleich veröffentlicht. Ich führe zusammen und versuche es erneut.', { art: 'info' }); return starte(true); }
    fehlerAnzeigen(e);
  }
}

async function zusammenfuehren(repo, eltern) {
  const konflikte = [];
  const neu = {};
  for (const pfad of ['konfiguration.json', 'cars.json', 'i18n/de.json', 'i18n/tr.json', 'i18n/en.json', 'medien.json']) {
    let ihre; try { ihre = await dateiAmStand(repo, eltern, pfad); } catch (e) { if (e.art === 'rechte') continue; throw e; }
    const basis = Z.basis.dateien[pfad];
    if (!basis || ihre === basis) continue;
    const meine = dateienAusDaten()[pfad];
    neu[pfad] = fuehreZusammen(JSON.parse(basis), JSON.parse(meine), JSON.parse(ihre), pfad === 'medien.json' ? '' : pfad, pfad === 'medien.json' ? [] : konflikte);
    if (pfad === 'medien.json') neu[pfad] = { ...JSON.parse(ihre), dateien: { ...JSON.parse(ihre).dateien, ...JSON.parse(meine).dateien } };
  }
  if (konflikte.length) {
    const ok = await new Promise((weiter) => {
      dialog({ titel: 'Jemand hat zwischendurch veröffentlicht', inhalt: h('div', {},
        h('p', { text: 'Seit Sie den Editor geöffnet haben, wurde die Website von anderer Stelle geändert. Fremde Änderungen werden übernommen. An diesen Stellen haben beide etwas geändert:' }),
        h('ul.konfliktliste', {}, ...konflikte.slice(0, 12).map((k) => h('li', { html: `<code>${esc(k)}</code>` }))),
        hinweis('„Meine Fassung veröffentlichen“ behält an diesen Stellen Ihre Änderung. „Abbrechen“ lässt alles, wie es ist; Sie können unter „Versionen“ nachsehen.')),
      fuss: [knopf('Abbrechen', { art: 'leise', onclick: () => { schliesseDialog(); weiter(false); } }), knopf('Meine Fassung veröffentlichen', { art: 'primaer', onclick: () => { weiter(true); } })], beimSchliessen: () => weiter(false) });
    });
    if (!ok) return false;
  }
  if (Object.keys(neu).length) {
    aendere('Mit dem Online-Stand zusammengeführt', (d) => {
      if (neu['konfiguration.json']) d.cfg = neu['konfiguration.json'];
      if (neu['cars.json']) d.cars = neu['cars.json'];
      for (const l of ['de', 'tr', 'en']) if (neu[`i18n/${l}.json`]) d.texte[l] = neu[`i18n/${l}.json`];
      if (neu['medien.json']) d.medien = neu['medien.json'];
    });
    // Grundstand jetzt = fremder Stand, damit nur noch eigene Änderungen als „neu“ zählen
    const b = { ...Z.basis.dateien };
    for (const pfad of Object.keys(neu)) { try { b[pfad] = await dateiAmStand(repo, eltern, pfad); } catch { /* bleibt */ } }
    Z.basis = { ...Z.basis, dateien: b, sha: eltern };
    toast('Fremde Änderungen übernommen', { art: 'info' });
  } else Z.basis = { ...Z.basis, sha: eltern };
  return true;
}

function fehlerAnzeigen(e) {
  const box = document.querySelector('.dialog .dialog__inhalt'), fussEl = document.querySelector('.dialog .dialog__fuss');
  const text = e instanceof GitFehler ? e.message : 'Unerwarteter Fehler beim Veröffentlichen. Ihre Änderungen sind als Entwurf gespeichert.';
  box.append(h('div.warnkasten.warnkasten--fehler', { role: 'alert' }, h('span', { html: ic('fehler') }), h('p', { html: `<strong>Nicht veröffentlicht.</strong> ${esc(text)}` })));
  const knoepfe = [knopf('Als ZIP herunterladen', { icon: 'zip', art: 'leise', onclick: () => { schliesseDialog(); exportiereZip(); } }), h('span.abstand')];
  if (e.art === 'token' || e.art === 'rechte') knoepfe.push(knopf('Zugang prüfen', { icon: 'schluessel', art: 'primaer', onclick: () => { schliesseDialog(); emit('bereich', 'zugang'); } }));
  else knoepfe.push(knopf('Erneut versuchen', { icon: 'dreh', art: 'primaer', onclick: () => starte() }));
  fussEl?.replaceChildren(...knoepfe);
  emit('status', { fehler: text });
  if (!(e instanceof GitFehler)) console.error(e);
}

function erfolg(sha) {
  const url = liveUrl();
  const box = document.querySelector('.dialog .dialog__inhalt'), fussEl = document.querySelector('.dialog .dialog__fuss');
  if (!box) return;
  box.replaceChildren(h('div.erfolg', {},
    h('div.erfolg__licht', { 'aria-hidden': 'true' }),
    h('span', { html: '<svg class="ring" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="32"/><path d="M24 37l8 8 16-17"/></svg>' }),
    h('h3', { text: 'Veröffentlicht' }),
    h('p', { html: `GitHub hat die Änderungen übernommen. In etwa einer Minute ist alles live unter<br><a href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace(/^https?:\/\//, ''))}</a>` }),
    h('p.hinweis.erfolg__live', { id: 'live-status', role: 'status', html: `<span class="dreht">${ic('dreh', 'i--k')}</span> GitHub Pages baut die Seite …` }),
    h('p.erfolg__info', { html: `Version <code>${esc(sha.slice(0, 7))}</code> · unter „Versionen“ jederzeit wiederherstellbar` })));
  fussEl?.replaceChildren(knopf('Weiter bearbeiten', { art: 'leise', onclick: schliesseDialog }), h('span.abstand'), h('a.knopf.knopf--primaer', { href: url, target: '_blank', rel: 'noopener', html: `${ic('extern')}<span>Website ansehen</span>` }));
  document.querySelector('.dialog')?.classList.add('dialog--erfolg');
}

// ---------- Live-Bestätigung: version.json abfragen ----------
let beobachter = 0;
export function beobachteLive(kennung) {
  clearInterval(beobachter);
  let versuche = 0;
  beobachter = setInterval(async () => {
    if (++versuche > 40) { clearInterval(beobachter); return; }
    try {
      const r = await fetch(`${WURZEL}version.json?t=${Date.now()}`, { cache: 'no-store' });
      const v = await r.json();
      if (v.kennung === kennung) {
        clearInterval(beobachter);
        Z.live = { ...Z.live, bestaetigt: true, zeit: Date.now() };
        speichereJetzt(); emit('status');
        const el = document.getElementById('live-status'); if (el) { el.innerHTML = `${ic('haken', 'i--k')} Ist live.`; el.dataset.live = ''; }
        // Neue Bilder liegen jetzt online: aus dem Browser-Speicher entfernen
        for (const p of Z.basis?.blobs || []) loescheBlob(p).catch(() => {});
      }
    } catch { /* weiter warten */ }
  }, 8000);
}

// ---------- ZIP ----------
export async function exportiereZip() {
  const t = h('div.toast', { 'data-art': 'info', role: 'status', html: `${ic('zip')}<span>ZIP wird gepackt …</span>` });
  document.getElementById('toasts').append(t);
  try {
    const enc = new TextEncoder();
    const dateien = [];
    const seiten = seitenAus(Z.daten);
    for (const [p, s] of Object.entries(seiten)) dateien.push({ pfad: p, daten: enc.encode(s) });
    for (const [p, s] of Object.entries(dateienAusDaten())) dateien.push({ pfad: p, daten: enc.encode(s) });
    dateien.push({ pfad: '.nojekyll', daten: new Uint8Array() });
    const assets = Object.keys(Z.daten.medien.dateien);
    let n = 0;
    for (const p of assets) {
      n++; if (n % 10 === 0) t.innerHTML = `${ic('zip')}<span>ZIP wird gepackt … ${n} / ${assets.length}</span>`;
      if (Z.blobs.has(p)) { dateien.push({ pfad: p, daten: new Uint8Array(await Z.blobs.get(p).arrayBuffer()) }); continue; }
      try { const r = await fetch(WURZEL + p); if (r.ok) dateien.push({ pfad: p, daten: new Uint8Array(await r.arrayBuffer()) }); } catch { /* fehlt */ }
    }
    const blob = baueZip(dateien);
    const a = h('a', { href: URL.createObjectURL(blob), download: `kmc-website-${new Date().toISOString().slice(0, 10)}.zip` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    t.remove();
    toast(`ZIP erstellt · ${dateien.length} Dateien, ${(blob.size / 1048576).toFixed(1).replace('.', ',')} MB`);
  } catch (e) { t.remove(); toast('Das ZIP konnte nicht erstellt werden. Bitte erneut versuchen.', { art: 'fehler' }); }
}
