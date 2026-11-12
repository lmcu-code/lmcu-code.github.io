// Fahrzeuge: Liste, Daten mit Prüfung, Fotos (WebP im Browser), Stellen direkt auf dem Foto, 360° und 3D.
import { tausender, zahl, demoDatei } from '../../vorlagen/bau.mjs';
import { Z, emit, aendere, legeBlobAb } from './zustand.mjs';
import { h, ic, esc, toast, dialog, schliesseDialog } from './ui.mjs';
import { fid, textFeld, auswahlFeld, schalterFeld, segmentFeld, reglerFeld, panel, gruppe, hinweis, leer, knopf, ikon, ziehbar, verschiebe } from './felder.mjs';
import { verarbeite, STUFEN, slugify, istBild } from './bilder.mjs';
import { bildUrl, ablageZiel, fokusDialog } from './panels.mjs';

export const MWST = [['', 'Bitte wählen (Pflicht)'], ['inkl. 19 % MwSt., MwSt. ausweisbar', 'MwSt. ausweisbar (inkl. 19 %)'], ['Differenzbesteuert nach § 25a UStG, MwSt. nicht ausweisbar', 'Differenzbesteuert (§ 25a UStG)']];
const KRAFTSTOFF = ['Benzin', 'Diesel', 'Elektro', 'Hybrid (Benzin/Elektro)', 'Hybrid (Diesel/Elektro)', 'Plug-in-Hybrid', 'Autogas (LPG)', 'Erdgas (CNG)'];
const GETRIEBE = ['Automatik', 'Schaltgetriebe', 'Halbautomatik'];
const ANSICHTEN = ['Vorn', 'Seite', 'Heck', 'Innen', 'Felge', 'Cockpit', 'Kofferraum', 'Motor', 'Detail'];
const autoVon = (id) => Z.daten.cars.cars.find((c) => c.id === id);
const idx = (id) => Z.daten.cars.cars.findIndex((c) => c.id === id);

// ---------- Prüfen ----------
export function pruefeAuto(c) {
  const f = {};
  if (!c.model?.trim()) f.model = 'Bitte das Modell eintragen.';
  if (!c.make?.trim()) f.make = 'Bitte die Marke eintragen.';
  const p = zahl(c.price);
  if (!p) f.price = 'Bitte einen Preis eintragen.'; else if (p < 300 || p > 2000000) f.price = 'Der Preis wirkt ungewöhnlich. Bitte prüfen.';
  if (!c.vat) f.vat = 'Pflichtangabe vor dem Veröffentlichen.';
  const km = zahl(c.km); if (c.km && (km === null || km > 2000000)) f.km = 'Bitte nur Ziffern, z. B. 42300.';
  if (c.year && !/^((0[1-9]|1[0-2])\/)?(19[5-9]\d|20\d\d)$/.test(c.year)) f.year = 'Format MM/JJJJ oder JJJJ, z. B. 03/2021.';
  else if (c.year && Number(c.year.slice(-4)) > new Date().getFullYear()) f.year = 'Das Jahr liegt in der Zukunft.';
  const kw = zahl(String(c.power).split('kW')[0]); if (c.power && (!kw || kw > 1500)) f.power = 'Bitte die Leistung in kW eintragen.';
  if (c.warrantyMonths != null && c.warrantyMonths !== '' && !(Number(c.warrantyMonths) >= 1 && Number(c.warrantyMonths) <= 60)) f.warrantyMonths = '1 bis 60 Monate oder leer lassen.';
  if (c.report && !/^https?:\/\//.test(c.report)) f.report = 'Bitte eine vollständige Adresse mit https:// eintragen.';
  if (c.url && !/^https?:\/\//.test(c.url)) f.url = 'Bitte eine vollständige Adresse mit https:// eintragen.';
  return f;
}
const ps = (kw) => Math.round(kw * 1.35962);
const neueId = (c, ausser) => {
  const basis = slugify(`${c.make || ''} ${String(c.model || '').replace(new RegExp('^' + (c.make || '#'), 'i'), '')} ${String(c.year || '').slice(-4)}`) || 'fahrzeug';
  let id = basis, n = 2;
  while (Z.daten.cars.cars.some((x) => x.id === id && x !== ausser)) id = `${basis}-${n++}`;
  return id;
};
const veroeffentlicht = (id) => { try { return JSON.parse(Z.basis?.dateien?.['cars.json'] || '{"cars":[]}').cars.some((c) => c.id === id); } catch { return false; } };

// ---------- Liste (links) ----------
let suche = '';
export function bereichFahrzeuge() {
  const cars = Z.daten.cars.cars;
  const such = h('label.suche', {}, h('span', { html: ic('suche') }), h('span.nur-sr', { text: 'Fahrzeuge suchen' }), h('input', { type: 'search', id: 'fz-suche', placeholder: 'Suchen: Modell, Preis, Jahr …', value: suche, oninput: (e) => { suche = e.target.value; filtern(); } }));
  const ul = h('ul.liste.fz-liste', { 'aria-label': 'Fahrzeuge (Reihenfolge mit Alt + Pfeiltasten ändern)' });
  cars.forEach((c, i) => {
    const p = c.media?.poster?.src || c.media?.gallery?.[0]?.src;
    const fehler = Object.keys(pruefeAuto(c)).length;
    const li = h('li.eintrag.fz', { 'data-index': String(i), 'data-such': `${c.model} ${c.make} ${c.price} ${c.year} ${c.fuel} ${c.id}`.toLowerCase(), 'aria-current': Z.ui.auswahl?.art === 'auto' && Z.ui.auswahl.id === c.id ? 'true' : null });
    li.append(
      h('span.eintrag__griff', { 'aria-hidden': 'true', html: ic('griff') }),
      h('button.eintrag__knopf.fz__knopf', { type: 'button', id: fid('fz-' + c.id), onclick: () => emit('auto-oeffnen', c.id) },
        h('span.eintrag__bild', { style: p ? { backgroundImage: `url("${bildUrl(Z.urls.has(p) ? p : kleinste(p))}")` } : {}, html: p ? '' : ic('bild', 'i--k') }),
        h('span.eintrag__text', { html: `<strong>${esc(c.model || 'Neues Fahrzeug')}</strong><small>${c.sample ? '<span class="marke marke--leise">Beispiel</span>' : ''}${fehler ? `<span class="marke marke--warn" aria-label="${fehler} offene Angaben">${ic('warn', 'i--k')}${fehler}</span>` : ''}<span>${esc([c.price || 'ohne Preis', c.year].filter(Boolean).join(' · '))}</span></small>` })),
      h('span.eintrag__aktionen', {}, ikon('kopie', 'Duplizieren', () => dupliziere(c.id)), ikon('muell', 'Löschen', () => loesche(c.id))),
    );
    ul.append(li);
  });
  ziehbar(ul, { verschieben: (von, nach, tast) => { const id = cars[von].id; aendere('Reihenfolge der Fahrzeuge', (d) => verschiebe(d.cars.cars, von, nach)); if (tast) setTimeout(() => document.getElementById(fid('fz-' + id))?.closest('li')?.querySelector('button')?.focus(), 30); } });
  const keine = h('p.hinweis.fz-keine', { hidden: true, text: 'Kein Fahrzeug passt zur Suche.' });
  const filtern = () => { const q = suche.trim().toLowerCase(); let n = 0; for (const li of ul.children) { const an = !q || li.dataset.such.includes(q); li.hidden = !an; if (an) n++; } keine.hidden = n > 0; };
  setTimeout(filtern);
  const neu = knopf('Fahrzeug hinzufügen', { icon: 'plus', art: 'primaer', klein: true, onclick: neuesAuto, kuerzel: 'N' });
  const inhalt = cars.length ? [such, ul, keine, hinweis('Reihenfolge = Reihenfolge auf der Website. Ziehen am Griff oder Alt + ↑/↓.')]
    : [leer('auto', 'Noch keine Fahrzeuge', 'Legen Sie das erste Fahrzeug an. Fotos ziehen Sie danach einfach hinein.', neu)];
  return panel('Fahrzeuge', inhalt, { untertitel: `${cars.length}`, aktionen: cars.length ? [neu] : [] });
}
const kleinste = (src) => { const m = String(src).match(/^(.*)-(\d+)\.webp$/); if (!m) return src; const v = Object.keys(Z.daten.medien.dateien).filter((k) => k.startsWith(m[1] + '-') && /-\d+\.webp$/.test(k)).sort((a, b) => parseInt(a.match(/-(\d+)\.webp$/)[1]) - parseInt(b.match(/-(\d+)\.webp$/)[1])); return v[0] || src; };

export function neuesAuto() {
  const c = { id: '', sample: false, model: '', make: '', price: '', vat: '', km: '', year: '', fuel: '', power: '', gearbox: '', dekra: null, warrantyMonths: null, report: '', url: '', media: { gallery: [] }, hotspots: [] };
  c.id = neueId({ make: 'fahrzeug', model: Date.now().toString(36).slice(-4) });
  aendere('Fahrzeug hinzugefügt', (d) => { d.cars.cars.unshift(c); });
  Z.ui.reiter = 'daten';
  emit('auto-oeffnen', c.id);
  setTimeout(() => document.getElementById(fid('a-model'))?.focus(), 80);
}
function dupliziere(id) {
  const c = JSON.parse(JSON.stringify(autoVon(id)));
  c.model = `${c.model} (Kopie)`; c.id = neueId(c);
  aendere('Fahrzeug dupliziert', (d) => { d.cars.cars.splice(idx(id) + 1, 0, c); });
  emit('auto-oeffnen', c.id);
  toast('Fahrzeug dupliziert');
}
export function loesche(id) {
  const c = autoVon(id);
  aendere(`${c.model || 'Fahrzeug'} gelöscht`, (d) => { d.cars.cars.splice(idx(id), 1); });
  if (Z.ui.auswahl?.id === id) emit('auswahl', null);
  if (Z.ui.seite.includes(`fahrzeug/${id}/`)) emit('seite', 'index.html');
  toast(`„${c.model || 'Fahrzeug'}“ gelöscht`, { art: 'info', aktion: { text: 'Rückgängig', tun: () => emit('rueck') } });
}

// ---------- Editor (rechts) ----------
export function inspektorAuto(id) {
  const c = autoVon(id);
  if (!c) return panel('Fahrzeug', [leer('auto', 'Fahrzeug nicht gefunden', 'Vielleicht wurde es gelöscht.')]);
  const reiter = Z.ui.reiter || 'daten';
  const f = pruefeAuto(c);
  const tabs = [['daten', 'Daten', Object.keys(f).length], ['fotos', 'Fotos', (c.media?.gallery || []).length], ['stellen', 'Stellen', (c.hotspots || []).length], ['3d', '3D & 360°', 0]];
  const leiste = h('div.reiter', { role: 'tablist', 'aria-label': 'Fahrzeug' }, ...tabs.map(([k, n, z]) => h('button', { type: 'button', role: 'tab', id: `reiter-${k}`, 'aria-selected': reiter === k ? 'true' : 'false', 'aria-controls': 'reiter-inhalt', tabindex: reiter === k ? '0' : '-1', onclick: () => { Z.ui.reiter = k; emit('neu'); setTimeout(() => document.getElementById(`reiter-${k}`)?.focus(), 20); }, onkeydown: (e) => { const i = tabs.findIndex((t) => t[0] === reiter); const j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1; if (j >= 0) { e.preventDefault(); Z.ui.reiter = tabs[j][0]; emit('neu'); setTimeout(() => document.getElementById(`reiter-${tabs[j][0]}`)?.focus(), 20); } }, html: `${esc(n)}${z ? ` <span class="reiter__zahl${k === 'daten' ? ' reiter__zahl--warn' : ''}">${z}</span>` : ''}` })));
  const inhalt = { daten: tabDaten, fotos: tabFotos, stellen: tabStellen, '3d': tab3d }[reiter](c, f);
  const p = panel(c.model || 'Neues Fahrzeug', h('div', { id: 'reiter-inhalt', role: 'tabpanel', 'aria-labelledby': `reiter-${reiter}`, class: 'reiter__inhalt' }, ...[].concat(inhalt)), {
    vorher: leiste, untertitel: c.sample ? 'Beispiel' : '',
    aktionen: [ikon('extern', 'Fahrzeugseite in der Vorschau', () => emit('seite', `${Z.ui.sprache === 'de' ? '' : Z.ui.sprache + '/'}fahrzeug/${c.id}/index.html`)), ikon('zu', 'Schließen', () => emit('auswahl', null), { kuerzel: 'Esc' })],
  });
  return p;
}
// Die Adresse (id) eines neuen Fahrzeugs folgt Marke/Modell/Jahr; offene Felder kennen noch die alte id.
const alias = {};
const echteId = (id) => { let i = id, n = 0; while (alias[i] && n++ < 50) i = alias[i]; return i; };
const setzAuto = (id, beschr, fn, zusammen) => aendere(beschr, (d) => { const c = d.cars.cars.find((x) => x.id === echteId(id)); if (c) fn(c); }, zusammen ? { zusammen: zusammen.replace(id, echteId(id)) } : {});

function tabDaten(c, f) {
  const id = c.id;
  const neuId = !veroeffentlicht(id);
  const feldAenderung = (feld, beschr, wandel = (w) => w) => (w) => {
    let neu = null;
    setzAuto(id, beschr, (x) => {
      x[feld] = wandel(w);
      if (neuId && ['model', 'make', 'year'].includes(feld) && x.model) { const n = neueId(x, x); if (n !== x.id) { neu = { alt: x.id, neu: n }; alias[x.id] = n; delete alias[n]; x.id = n; } }
    }, `a-${id}-${feld}`);
    if (neu) emit('auto-id', neu);
  };
  const kw = zahl(String(c.power).split('kW')[0]);
  const beisp = schalterFeld({ id: fid('a-sample'), label: 'Beispielfahrzeug', klein: c.sample ? 'Trägt sichtbar „Beispielfahrzeug“, wird nicht an Suchmaschinen gemeldet' : 'Echtes Angebot', an: !!c.sample, aendern: (v) => setzAuto(id, v ? 'Als Beispiel markiert' : 'Als echtes Angebot markiert', (x) => { x.sample = v; }) });
  const demoHinweis = autoHatDemo(c) ? h('div.warnkasten.warnkasten--info', {}, h('span', { html: ic('info') }), h('p', { html: '<strong>Fotos vom Demo-Modell.</strong> Sie tragen auf der Website immer den Hinweis „Demo-Modell“. Ersetzen Sie sie unter „Fotos“ durch echte Aufnahmen.' })) : null;
  return [
    gruppe(null, beisp, demoHinweis),
    gruppe('Fahrzeug',
      textFeld({ id: fid('a-model'), label: 'Modell', wert: c.model, platz: 'z. B. BMW 430i Coupé M Sport', fehler: f.model, aendern: feldAenderung('model', 'Modell') }),
      textFeld({ id: fid('a-make'), label: 'Marke', wert: c.make, platz: 'z. B. BMW', fehler: f.make, aendern: feldAenderung('make', 'Marke'), attrs: { list: 'marken-liste' } }),
      h('datalist', { id: 'marken-liste' }, ...[...new Set(Z.daten.cars.cars.map((x) => x.make).filter(Boolean).concat(['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Porsche', 'Opel', 'Ford', 'Skoda', 'Seat', 'Toyota']))].map((m) => h('option', { value: m })))),
    gruppe('Preis',
      textFeld({ id: fid('a-price'), label: 'Preis', einheit: '€', wert: zahl(c.price) ? tausender(zahl(c.price)) : '', fehler: f.price, attrs: { inputmode: 'numeric' }, aendern: feldAenderung('price', 'Preis', (w) => (zahl(w) ? `${tausender(zahl(w))} €` : '')) }),
      auswahlFeld({ id: fid('a-vat'), label: 'MwSt.', wert: c.vat, optionen: MWST.some((m) => m[0] === c.vat) ? MWST : [...MWST, [c.vat, c.vat]], fehler: f.vat, hilfe: '', aendern: feldAenderung('vat', 'MwSt.') })),
    gruppe('Eckdaten',
      h('div.zeile2', {},
        textFeld({ id: fid('a-km'), label: 'Kilometerstand', einheit: 'km', wert: zahl(c.km) ? tausender(zahl(c.km)) : '', fehler: f.km, attrs: { inputmode: 'numeric' }, aendern: feldAenderung('km', 'Kilometerstand', (w) => (zahl(w) !== null ? `${tausender(zahl(w))} km` : '')) }),
        textFeld({ id: fid('a-year'), label: 'Erstzulassung', wert: c.year, platz: 'MM/JJJJ', fehler: f.year, attrs: { inputmode: 'numeric' }, aendern: feldAenderung('year', 'Erstzulassung', (w) => w.trim()) })),
      h('div.zeile2', {},
        textFeld({ id: fid('a-power'), label: 'Leistung', einheit: 'kW', wert: kw || '', fehler: f.power, hilfe: kw ? `= ${ps(kw)} PS` : 'PS wird automatisch berechnet', attrs: { inputmode: 'numeric' }, aendern: feldAenderung('power', 'Leistung', (w) => (zahl(w) ? `${zahl(w)} kW (${ps(zahl(w))} PS)` : '')) }),
        auswahlFeld({ id: fid('a-gearbox'), label: 'Getriebe', wert: c.gearbox, optionen: [['', '–'], ...GETRIEBE.map((g) => [g, g]), ...(c.gearbox && !GETRIEBE.includes(c.gearbox) ? [[c.gearbox, c.gearbox]] : [])], aendern: feldAenderung('gearbox', 'Getriebe') })),
      auswahlFeld({ id: fid('a-fuel'), label: 'Kraftstoff', wert: c.fuel, optionen: [['', '–'], ...KRAFTSTOFF.map((g) => [g, g]), ...(c.fuel && !KRAFTSTOFF.includes(c.fuel) ? [[c.fuel, c.fuel]] : [])], aendern: feldAenderung('fuel', 'Kraftstoff') })),
    gruppe('Prüfung und Garantie',
      segmentFeld({ id: fid('a-dekra'), label: 'DEKRA-Siegel', wert: c.dekra === true ? 'ja' : 'wunsch', optionen: [['wunsch', 'Auf Wunsch'], ['ja', 'Liegt vor']], aendern: (w) => setzAuto(id, 'DEKRA', (x) => { x.dekra = w === 'ja' ? true : null; }) }),
      textFeld({ id: fid('a-garantie'), label: 'Garantie', einheit: 'Monate', wert: c.warrantyMonths ?? '', fehler: f.warrantyMonths, hilfe: 'Leer lassen für „bis zu 24 Monate, Bedingungen folgen“.', attrs: { inputmode: 'numeric' }, aendern: feldAenderung('warrantyMonths', 'Garantie', (w) => (zahl(w) ? zahl(w) : null)) }),
      textFeld({ id: fid('a-report'), label: 'Zustandsbericht (Link)', typ: 'url', wert: c.report, fehler: f.report, platz: 'https://…', aendern: feldAenderung('report', 'Zustandsbericht') }),
      textFeld({ id: fid('a-url'), label: 'Inserat bei mobile.de (Link)', typ: 'url', wert: c.url, fehler: f.url, platz: 'https://suchen.mobile.de/…', aendern: feldAenderung('url', 'mobile.de-Link') })),
    gruppe('Adresse', h('p.hinweis', { html: `<code>/fahrzeug/${esc(c.id)}/</code>${neuId ? ' · bildet sich aus Marke, Modell und Jahr, bis das Fahrzeug veröffentlicht ist' : ''}` })),
    h('div.knopfzeile.knopfzeile--trenner', {}, knopf('Duplizieren', { icon: 'kopie', art: 'leise', klein: true, onclick: () => dupliziere(id) }), knopf('Löschen', { icon: 'muell', art: 'gefahr', klein: true, onclick: () => loesche(id) })),
  ];
}
export const autoHatDemo = (c) => [c.media?.glb, c.media?.poster?.src, ...(c.media?.gallery || []).map((g) => g.src)].some(demoDatei);

// ---------- Fotos ----------
async function fotosHinzu(id, dateien) {
  const bilder = [...dateien].filter(istBild);
  if (!bilder.length) { toast('Keine Bilder gefunden. Erlaubt sind JPG, PNG, WebP und AVIF.', { art: 'fehler' }); return; }
  const fort = h('div.toast', { 'data-art': 'info', role: 'status' }); document.getElementById('toasts').append(fort);
  const neu = [];
  let i = 0;
  for (const d of bilder) {
    i++; fort.innerHTML = `${ic('hochladen')}<span>Foto ${i} von ${bilder.length} wird verkleinert …</span>`;
    try {
      const r = await verarbeite(d, { stufen: STUFEN.foto, basisPfad: `assets/fahrzeuge/${slugify(d.name.replace(/\.\w+$/, ''))}-${Date.now().toString(36)}` });
      const gross = r.alle.find((x) => x.w >= 1400) || r.gross;
      neu.push({ src: gross.pfad, alt: '', label: '' });
    } catch { toast(`„${d.name}“ konnte nicht gelesen werden.`, { art: 'fehler' }); }
  }
  fort.remove();
  if (!neu.length) return;
  setzAuto(id, `${neu.length} Foto${neu.length > 1 ? 's' : ''} hinzugefügt`, (c) => {
    c.media = c.media || {};
    const warLeerOderDemo = !(c.media.gallery || []).length || (c.media.gallery || []).every((g) => demoDatei(g.src));
    c.media.gallery = [...(c.media.gallery || []), ...neu];
    delete c.media.demo;
    if (warLeerOderDemo || !c.media.poster) { c.media.poster = { src: neu[0].src, alt: neu[0].alt }; }
    if (!c.media.gallery.some((g) => g.start)) { const g = c.media.gallery.find((x) => x.src === neu[0].src); if (g) g.start = true; }
  });
  Z.ui.foto = (autoVon(id).media.gallery.length - neu.length);
  toast(`${neu.length} Foto${neu.length > 1 ? 's' : ''} hinzugefügt · als WebP in 3 Größen`);
}
function tabFotos(c) {
  const id = c.id, g = c.media?.gallery || [];
  const titelSrc = c.media?.poster?.src;
  const dateiWahl = h('input.nur-sr', { type: 'file', id: fid('fotos-datei'), multiple: true, accept: 'image/jpeg,image/png,image/webp,image/avif', onchange: (e) => fotosHinzu(id, e.target.files) });
  const ablage = h('label.ablage', { for: dateiWahl.id }, h('span', { html: ic('hochladen') }), h('strong', { text: 'Fotos hierher ziehen' }), h('small', { text: 'oder klicken zum Auswählen · JPG, PNG, WebP · werden im Browser verkleinert' }));
  ablageZiel(ablage, (f) => fotosHinzu(id, f));
  const teile = [h('div', {}, ablage, dateiWahl)];
  if (autoHatDemo(c)) teile.push(h('div.warnkasten.warnkasten--info', {}, h('span', { html: ic('info') }), h('p', { html: 'Das sind Bilder des Demo-Modells (mit Hinweis auf der Website). Echte Fotos hinzufügen und die Demo-Bilder danach entfernen.' }), knopf('Demo-Bilder entfernen', { klein: true, art: 'leise', onclick: () => setzAuto(id, 'Demo-Bilder entfernt', (x) => { x.media.gallery = x.media.gallery.filter((y) => !demoDatei(y.src)); if (demoDatei(x.media.poster?.src)) x.media.poster = x.media.gallery[0] ? { src: x.media.gallery[0].src, alt: x.media.gallery[0].alt } : null; if (demoDatei(x.media.glb)) { x.media.glb = ''; delete x.camera; } x.media.spin = (x.media.spin || []).filter((s) => !demoDatei(s)); x.hotspots = (x.hotspots || []).filter((hs) => hs.poster?.bild && x.media.gallery.some((y) => y.src === hs.poster.bild)); delete x.media.demo; }) })));
  if (!g.length) { teile.push(leer('bild', 'Noch keine Fotos', 'Bis Fotos da sind, steht „Foto folgt“ auf der Website.')); return teile; }
  const sel = Math.min(Z.ui.foto ?? 0, g.length - 1);
  const ul = h('ul.fotos', { 'aria-label': 'Fotos (Reihenfolge mit Alt + Pfeiltasten ändern)' });
  g.forEach((x, i) => {
    const li = h('li.foto', { 'data-index': String(i), 'data-gewaehlt': i === sel ? '' : null, style: { backgroundImage: `url("${bildUrl(Z.urls.has(x.src) ? x.src : kleinste(x.src))}")` } },
      h('button.foto__wahl', { type: 'button', id: fid(`foto-${i}`), 'aria-current': i === sel ? 'true' : null, 'aria-label': `Foto ${i + 1}${x.label ? ', ' + x.label : ''}${x.src === titelSrc ? ', Titelbild' : ''}`, onclick: () => { Z.ui.foto = i; emit('neu'); setTimeout(() => document.getElementById(fid(`foto-${i}`))?.focus(), 20); } }),
      x.src === titelSrc ? h('span.foto__titel.marke.marke--akzent', { html: `${ic('stern', 'i--k')}Titel` }) : null,
      h('span.foto__griff', { 'aria-hidden': 'true', html: ic('griff', 'i--k') }),
      h('span.foto__ansicht', { text: x.label || `Foto ${i + 1}` }),
      (c.hotspots || []).some((hs) => aufFoto(hs, x)) ? h('span.foto__punkte', { 'aria-hidden': 'true', text: String((c.hotspots || []).filter((hs) => aufFoto(hs, x)).length) }) : null);
    ul.append(li);
  });
  ziehbar(ul, { griff: '.foto__griff', raster: true, verschieben: (von, nach, tast) => { setzAuto(id, 'Fotos umsortiert', (x) => verschiebe(x.media.gallery, von, nach)); Z.ui.foto = nach; if (tast) setTimeout(() => document.getElementById(fid(`foto-${nach}`))?.focus(), 30); } });
  teile.push(ul);
  const x = g[sel];
  const m = Z.daten.medien.dateien[x.src];
  teile.push(gruppe(`Foto ${sel + 1}`,
    h('p.hinweis', { text: `${x.src.split('/').pop()}${Array.isArray(m) ? ` · ${m[0]} × ${m[1]} px` : ''}${Z.blobs.has(x.src) ? ' · neu' : ''}` }),
    auswahlFeld({ id: fid('foto-ansicht'), label: 'Ansicht', wert: x.label || '', optionen: [['', '–'], ...ANSICHTEN.map((a) => [a, a]), ...(x.label && !ANSICHTEN.includes(x.label) ? [[x.label, x.label]] : [])], aendern: (w) => setzAuto(id, 'Ansicht', (y) => { y.media.gallery[sel].label = w; }) }),
    textFeld({ id: fid('foto-alt'), label: 'Bildbeschreibung', zusatz: 'für Screenreader und Google', zeilen: 2, wert: x.alt, platz: 'z. B. Front von schräg links', warnung: x.alt ? '' : 'Noch leer. Steht in der Prüfliste.', aendern: (w) => setzAuto(id, 'Bildbeschreibung', (y) => { y.media.gallery[sel].alt = w; if (y.media.poster?.src === y.media.gallery[sel].src) y.media.poster.alt = w; }, `alt-${id}-${sel}`) }),
    h('div.knopfraster', {},
      x.src === titelSrc ? h('span.knopf.knopf--leise.klein.knopf--status', { html: `${ic('stern')}<span>Ist Titelbild</span>` }) : knopf('Als Titelbild', { icon: 'stern', klein: true, art: 'leise', onclick: () => setzAuto(id, 'Titelbild gewählt', (y) => { y.media.poster = { src: x.src, alt: x.alt }; y.media.gallery.forEach((z, j) => { if (j === sel) z.start = true; else delete z.start; }); }) }),
      knopf('Stellen markieren', { icon: 'ziel', klein: true, art: 'leise', onclick: () => studio(id, sel) }),
      knopf('Fokuspunkt', { icon: 'fokus', klein: true, art: 'leise', onclick: () => fokusDialog(`car:${id}.media.gallery.${sel}`) }),
      knopf('Entfernen', { icon: 'muell', klein: true, art: 'gefahr', onclick: () => { setzAuto(id, 'Foto entfernt', (y) => { const [weg] = y.media.gallery.splice(sel, 1); y.hotspots = (y.hotspots || []).filter((hs) => hs.poster?.bild !== weg.src); if (y.media.poster?.src === weg.src) y.media.poster = y.media.gallery[0] ? { src: y.media.gallery[0].src, alt: y.media.gallery[0].alt } : null; }); Z.ui.foto = Math.max(0, sel - 1); toast('Foto entfernt', { art: 'info', aktion: { text: 'Rückgängig', tun: () => emit('rueck') } }); } })),
  ));
  return teile;
}
export const aufFoto = (hs, g) => !!hs.poster && (hs.poster.bild ? hs.poster.bild === g.src : !!g.hotspots);

// ---------- Stellen ----------
function tabStellen(c) {
  const id = c.id, hs = c.hotspots || [], g = c.media?.gallery || [];
  const teile = [hinweis('Stellen sind nummerierte Punkte auf einem Foto: Ausstattung (z. B. „Ledersitze“) oder Zustand (z. B. „Kratzer, 4 cm“). Ehrlich zeigen schafft Vertrauen.')];
  if (!g.length) { teile.push(leer('ziel', 'Erst Fotos hinzufügen', 'Stellen werden direkt auf einem Foto markiert.', knopf('Zu den Fotos', { klein: true, art: 'leise', onclick: () => { Z.ui.reiter = 'fotos'; emit('neu'); } }))); return teile; }
  teile.push(knopf('Stelle auf einem Foto markieren', { icon: 'ziel', art: 'primaer', klein: true, onclick: () => studio(id, Math.max(0, g.findIndex((x) => x.start))) }));
  if (!hs.length) { teile.push(leer('ziel', 'Noch keine Stellen', 'Öffnen Sie ein Foto und klicken Sie auf die Stelle, die Sie zeigen möchten.')); return teile; }
  const ul = h('ul.liste.stellenliste');
  hs.forEach((x, i) => {
    const fi = g.findIndex((y) => aufFoto(x, y));
    ul.append(h('li.eintrag', {}, h('span.stellen-nr', { 'data-art': x.kind, text: String(i + 1), 'aria-hidden': 'true' }),
      h('button.eintrag__knopf.eintrag__text', { type: 'button', onclick: () => (fi >= 0 ? studio(id, fi, i) : null), html: `<strong>${esc(x.label || 'Ohne Namen')}</strong><small>${x.kind === 'zustand' ? 'Zustand' : 'Ausstattung'} · ${fi >= 0 ? `auf Foto ${fi + 1}${g[fi].label ? ' (' + esc(g[fi].label) + ')' : ''}` : x.position ? 'nur im 3D-Modell' : 'ohne Foto'}</small>` }),
      h('span.eintrag__aktionen', {}, ikon('muell', `Stelle ${i + 1} löschen`, () => { setzAuto(id, 'Stelle gelöscht', (y) => y.hotspots.splice(i, 1)); toast('Stelle gelöscht', { art: 'info', aktion: { text: 'Rückgängig', tun: () => emit('rueck') } }); }))));
  });
  teile.push(ul);
  return teile;
}

// Studio: Punkte direkt auf dem Foto setzen, ziehen, beschriften
export function studio(id, fotoIndex = 0, stelleIndex = null) {
  let foto = fotoIndex, aktiv = stelleIndex;
  const box = h('div.studio');
  const zeichne = () => {
    const c = autoVon(id); if (!c) return schliesseDialog();
    const g = c.media.gallery, x = g[foto], hs = c.hotspots || [];
    if (aktiv != null && !hs[aktiv]) aktiv = null;
    const img = h('img', { src: bildUrl(x.src), alt: x.alt || '', draggable: false });
    const flaeche = h('div.studio__flaeche', { role: 'application', 'aria-label': 'Foto. Klicken setzt eine neue Stelle. Ausgewählte Stelle mit Pfeiltasten verschieben.', tabindex: '0' }, img);
    hs.forEach((s, i) => {
      if (!aufFoto(s, x)) return;
      const p = h('button.studio__punkt', { type: 'button', 'data-art': s.kind === 'zustand' ? 'zustand' : null, 'aria-pressed': i === aktiv ? 'true' : 'false', 'aria-label': `Stelle ${i + 1}: ${s.label}`, style: { left: s.poster.x + '%', top: s.poster.y + '%' }, html: `<span>${i + 1}</span>` });
      p.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); e.preventDefault(); aktiv = i; p.setPointerCapture(e.pointerId);
        const r = img.getBoundingClientRect(); let bewegt = false;
        p.onpointermove = (ev) => { bewegt = true; const nx = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)), ny = Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100)); p.style.left = nx + '%'; p.style.top = ny + '%'; p.dataset.x = nx.toFixed(2); p.dataset.y = ny.toFixed(2); };
        p.onpointerup = () => { p.onpointermove = null; if (bewegt) setzAuto(id, 'Stelle verschoben', (y) => { y.hotspots[i].poster = { ...y.hotspots[i].poster, x: Number(p.dataset.x), y: Number(p.dataset.y), bild: y.hotspots[i].poster.bild || x.src }; }); zeichne(); };
      });
      flaeche.append(p);
    });
    flaeche.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.studio__punkt')) return;
      const r = img.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100, py = ((e.clientY - r.top) / r.height) * 100;
      if (px < 0 || px > 100 || py < 0 || py > 100) return;
      const nr = hs.length + 1;
      setzAuto(id, 'Stelle gesetzt', (y) => { y.hotspots = y.hotspots || []; y.hotspots.push({ id: `stelle-${Date.now().toString(36)}`, kind: 'ausstattung', label: `Stelle ${nr}`, text: '', poster: { x: Math.round(px * 100) / 100, y: Math.round(py * 100) / 100, line: 90, side: py > 55 ? 'unten' : 'oben', bild: x.src } }); });
      aktiv = autoVon(id).hotspots.length - 1;
      zeichne();
      setTimeout(() => { const el = document.getElementById(fid('st-label')); el?.focus(); el?.select(); }, 40);
    });
    flaeche.addEventListener('keydown', (e) => {
      if (aktiv == null) return;
      const s = e.shiftKey ? 2 : 0.5; const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
      if (!d) return; e.preventDefault();
      setzAuto(id, 'Stelle verschoben', (y) => { const p = y.hotspots[aktiv].poster; p.x = Math.round(Math.max(0, Math.min(100, p.x + d[0])) * 100) / 100; p.y = Math.round(Math.max(0, Math.min(100, p.y + d[1])) * 100) / 100; p.bild = p.bild || x.src; }, `st-${aktiv}`);
      zeichne(); document.querySelector('.studio__flaeche')?.focus();
    });
    const bildSeite = h('div.studio__bild', {}, flaeche, h('p.studio__hinweis', { text: aktiv == null ? 'Klicken Sie auf die Stelle, die Sie zeigen möchten' : 'Punkt ziehen zum Verschieben · Klick ins Foto setzt eine weitere Stelle' }));
    const minis = h('div.studio__minis', { role: 'group', 'aria-label': 'Foto wählen' }, ...g.map((y, i) => h('button', { type: 'button', 'aria-pressed': i === foto ? 'true' : 'false', 'aria-label': `Foto ${i + 1}${y.label ? ', ' + y.label : ''}`, style: { backgroundImage: `url("${bildUrl(Z.urls.has(y.src) ? y.src : kleinste(y.src))}")` }, onclick: () => { foto = i; aktiv = null; zeichne(); } })));
    const seite = h('div.studio__seite', {}, h('p.gruppe__titel', { text: `Foto ${foto + 1}${x.label ? ' · ' + x.label : ''}` }), minis);
    const hier = hs.map((s, i) => [s, i]).filter(([s]) => aufFoto(s, x));
    if (aktiv != null) {
      const s = hs[aktiv], i = aktiv;
      const st = (beschr, fn, z) => setzAuto(id, beschr, (y) => fn(y.hotspots[i]), z);
      seite.append(h('div.studio__form', {},
        h('p.studio__stelle', { html: `<span class="stellen-nr" data-art="${esc(s.kind)}">${i + 1}</span><strong>Stelle ${i + 1}</strong>` }),
        segmentFeld({ id: fid('st-art'), label: 'Art', wert: s.kind === 'zustand' ? 'zustand' : 'ausstattung', optionen: [['ausstattung', 'Ausstattung'], ['zustand', 'Zustand']], aendern: (w) => { st('Art der Stelle', (y) => { y.kind = w; }); zeichne(); } }),
        textFeld({ id: fid('st-label'), label: 'Bezeichnung', wert: s.label, platz: 'z. B. Felge vorne links', aendern: (w) => st('Bezeichnung', (y) => { y.label = w; }, `stl-${i}`), beimVerlassen: () => zeichne() }),
        textFeld({ id: fid('st-text'), label: 'Beschreibung', zeilen: 2, wert: s.text, platz: s.kind === 'zustand' ? 'z. B. Kratzer, 4 cm' : 'z. B. 19″ Leichtmetall, Profil 6 mm', aendern: (w) => st('Beschreibung', (y) => { y.text = w; }, `stt-${i}`) }),
        segmentFeld({ id: fid('st-seite'), label: 'Kästchen', wert: s.poster?.side === 'unten' ? 'unten' : 'oben', optionen: [['oben', 'Über dem Punkt'], ['unten', 'Unter dem Punkt']], aendern: (w) => { st('Kästchen', (y) => { y.poster.side = w; }); } }),
        reglerFeld({ id: fid('st-linie'), label: 'Linie', wert: s.poster?.line || 90, min: 40, max: 180, schritt: 2, format: (v) => `${v} px`, aendern: (v) => st('Linienlänge', (y) => { y.poster.line = v; }, `stlin-${i}`) }),
        h('div.knopfzeile', {}, knopf('Fertig', { icon: 'haken', klein: true, art: 'leise', onclick: () => { aktiv = null; zeichne(); } }), knopf('Löschen', { icon: 'muell', klein: true, art: 'gefahr', onclick: () => { setzAuto(id, 'Stelle gelöscht', (y) => y.hotspots.splice(i, 1)); aktiv = null; zeichne(); toast('Stelle gelöscht', { art: 'info', aktion: { text: 'Rückgängig', tun: () => { emit('rueck'); zeichne(); } } }); } }))));
    } else {
      seite.append(hier.length ? h('ul.liste', {}, ...hier.map(([s, i]) => h('li', {}, h('button.eintrag', { type: 'button', onclick: () => { aktiv = i; zeichne(); }, html: `<span class="stellen-nr" data-art="${esc(s.kind)}">${i + 1}</span><span class="eintrag__text"><strong>${esc(s.label)}</strong><small>${esc(s.text || 'ohne Beschreibung')}</small></span>` })))) : leer('ziel', 'Keine Stelle auf diesem Foto', 'Klicken Sie ins Foto, um die erste zu setzen.'));
    }
    box.replaceChildren(bildSeite, seite);
  };
  zeichne();
  dialog({ titel: 'Stellen auf dem Foto', breit: true, klasse: 'dialog--studio', inhalt: box, fuss: [h('span.hinweis', { text: 'Änderungen erscheinen sofort in der Vorschau.' }), knopf('Fertig', { art: 'primaer', onclick: schliesseDialog })], beimSchliessen: () => emit('neu') });
}

// ---------- 3D & 360° ----------
function tab3d(c) {
  const id = c.id, m = c.media || {};
  const glbWahl = h('input.nur-sr', { type: 'file', id: fid('glb-datei'), accept: '.glb,model/gltf-binary', onchange: async (e) => {
    const d = e.target.files[0]; if (!d) return;
    if (!/\.glb$/i.test(d.name)) { toast('Bitte eine .glb-Datei wählen.', { art: 'fehler' }); return; }
    const mb = d.size / 1048576;
    const pfad = `assets/fahrzeuge/${slugify(d.name.replace(/\.glb$/i, ''))}-${Date.now().toString(36)}.glb`;
    await legeBlobAb(pfad, d, null);
    setzAuto(id, '3D-Modell hinzugefügt', (x) => { x.media.glb = pfad; delete x.media.demo; });
    if (mb > 4) toast(`Das Modell ist ${mb.toFixed(1).replace('.', ',')} MB groß. Über 4 MB lädt es am Handy spürbar langsam. Besser komprimieren (z. B. Draco, Texturen 2K).`, { art: 'fehler', dauer: 9000 });
    else toast(`3D-Modell hinzugefügt (${mb.toFixed(1).replace('.', ',')} MB)`);
  } });
  const spinWahl = h('input.nur-sr', { type: 'file', id: fid('spin-datei'), multiple: true, accept: 'image/*', onchange: async (e) => {
    const l = [...e.target.files].filter(istBild).sort((a, b) => a.name.localeCompare(b.name, 'de', { numeric: true }));
    if (l.length < 8) { toast('Für 360° bitte mindestens 8 Bilder rundum wählen (besser 24 bis 36).', { art: 'fehler' }); return; }
    const fort = h('div.toast', { 'data-art': 'info', role: 'status' }); document.getElementById('toasts').append(fort);
    const basis = `assets/fahrzeuge/spin-${Date.now().toString(36)}`; const pfade = [];
    for (let i = 0; i < l.length; i++) { fort.innerHTML = `${ic('dreh')}<span>360°: Bild ${i + 1} von ${l.length} …</span>`; const r = await verarbeite(l[i], { stufen: STUFEN.spin, basisPfad: `${basis}-${String(i).padStart(2, '0')}` }); pfade.push(r.gross.pfad); }
    fort.remove();
    setzAuto(id, '360°-Serie hinzugefügt', (x) => { x.media.spin = pfade; delete x.media.spinFrames; delete x.media.demo; });
    toast(`360°-Serie mit ${pfade.length} Bildern hinzugefügt`);
  } });
  const spin = Array.isArray(m.spin) ? m.spin : [];
  return [
    hinweis('Reihenfolge auf der Website: 3D-Modell, sonst 360°-Drehung, sonst Fotos. Ohne alles steht „Foto folgt“.'),
    gruppe('3D-Modell',
      m.glb ? h('div.datei', {}, h('span', { html: ic('wuerfel') }), h('span.eintrag__text', { html: `<strong>${esc(m.glb.split('/').pop())}</strong><small>${demoDatei(m.glb) ? 'Demo-Modell · trägt immer den Hinweis' : Z.blobs.has(m.glb) ? `${(Z.blobs.get(m.glb).size / 1048576).toFixed(1).replace('.', ',')} MB · neu` : 'veröffentlicht'}</small>` }), ikon('muell', '3D-Modell entfernen', () => setzAuto(id, '3D-Modell entfernt', (x) => { x.media.glb = ''; delete x.media.demo; }))) : leer('wuerfel', 'Kein 3D-Modell', 'Optional. Eine .glb-Datei bis 4 MB.'),
      h('div.knopfzeile', {}, h('label.knopf.knopf--leise.klein', { for: glbWahl.id, html: `${ic('hochladen')}<span>${m.glb ? 'Anderes Modell' : '.glb hochladen'}</span>` }), glbWahl),
      hinweis('Empfehlung: höchstens 4 MB. Größere Modelle werden mit Warnung angenommen.')),
    gruppe('360°-Drehung',
      spin.length ? h('div.spinreihe', { 'aria-label': `${spin.length} Bilder` }, ...spin.filter((_, i) => i % Math.ceil(spin.length / 6) === 0).slice(0, 6).map((s) => h('i', { style: { backgroundImage: `url("${bildUrl(s)}")` } }))) : leer('dreh', 'Keine 360°-Serie', '24 bis 36 Fotos rundum, gleicher Abstand und Höhe.'),
      h('div.knopfzeile', {}, h('label.knopf.knopf--leise.klein', { for: spinWahl.id, html: `${ic('hochladen')}<span>${spin.length ? 'Serie ersetzen' : 'Serie hochladen'}</span>` }), spinWahl, spin.length ? knopf('Entfernen', { icon: 'muell', klein: true, art: 'gefahr', onclick: () => setzAuto(id, '360° entfernt', (x) => { x.media.spin = []; }) }) : null),
      hinweis('Bilder werden nach Dateinamen sortiert (01, 02, …).')),
  ];
}
