// Zustand des Editors: Daten (wie im Repo), Basis (zuletzt veröffentlichter Stand), Verlauf (Rückgängig), Blobs (neue Bilder).
import { speichereEntwurf, speichereBlob } from './speicher.mjs';

export const Z = {
  daten: null,          // { cfg, cars, texte: { de, tr, en }, medien }
  basis: null,          // { dateien: { pfad: JSON-Text }, sha, geladen }
  blobs: new Map(),     // pfad → Blob (neue oder geänderte Dateien, noch nicht veröffentlicht)
  urls: new Map(),      // pfad → blob:-URL für die Vorschau
  ui: { seite: 'index.html', sprache: 'de', geraet: 1440, zoom: 'fit', bereich: 'seiten', auswahl: null },
  live: { zeit: null, sha: null },
  verlauf: [], zukunft: [],
};
const hoerer = new Map();
export const on = (art, fn) => { if (!hoerer.has(art)) hoerer.set(art, new Set()); hoerer.get(art).add(fn); };
export const emit = (art, info) => { for (const fn of hoerer.get(art) || []) fn(info); };

// ---------- Pfade ----------
export function hole(obj, pfad) { return String(pfad).split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
export function setze(obj, pfad, wert) {
  const teile = String(pfad).split('.'); let o = obj;
  for (let i = 0; i < teile.length - 1; i++) { if (o[teile[i]] == null) o[teile[i]] = /^\d+$/.test(teile[i + 1]) ? [] : {}; o = o[teile[i]]; }
  o[teile.at(-1)] = wert;
}
// Marken-Schlüssel aus der Vorschau → { wurzel, pfad }
export function aufloesen(schluessel) {
  if (schluessel.startsWith('cfg:')) return { art: 'cfg', ziel: Z.daten.cfg, pfad: schluessel.slice(4) };
  if (schluessel.startsWith('car:')) {
    const [id, ...rest] = schluessel.slice(4).split('.');
    const idx = Z.daten.cars.cars.findIndex((c) => c.id === id);
    return { art: 'car', id, idx, ziel: Z.daten.cars.cars[idx], pfad: rest.join('.') };
  }
  return { art: 'text', ziel: Z.daten.texte[Z.ui.sprache], pfad: schluessel };
}

// ---------- Dateien ----------
export function dateienAusDaten(d = Z.daten) {
  const f = { 'konfiguration.json': d.cfg, 'cars.json': d.cars, 'medien.json': d.medien };
  for (const [l, t] of Object.entries(d.texte)) f[`i18n/${l}.json`] = t;
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, JSON.stringify(v, null, k === 'medien.json' ? 1 : 2) + '\n']));
}

// ---------- Ändern mit Verlauf ----------
let letzte = { schluessel: null, zeit: 0 };
export function aendere(beschreibung, fn, { zusammen = null, still = false } = {}) {
  const jetzt = Date.now();
  if (!(zusammen && letzte.schluessel === zusammen && jetzt - letzte.zeit < 1200)) {
    Z.verlauf.push({ daten: JSON.stringify(Z.daten), beschreibung });
    if (Z.verlauf.length > 100) Z.verlauf.shift();
  }
  letzte = { schluessel: zusammen, zeit: jetzt };
  Z.zukunft = [];
  fn(Z.daten);
  Z.ungespeichert = true;
  if (!still) emit('geaendert', { beschreibung });
  planeSpeichern();
}
export function rueck() {
  const v = Z.verlauf.pop(); if (!v) return null;
  Z.zukunft.push({ daten: JSON.stringify(Z.daten), beschreibung: v.beschreibung });
  Z.daten = JSON.parse(v.daten); letzte = { schluessel: null, zeit: 0 };
  emit('geaendert', { beschreibung: v.beschreibung, verlauf: true }); planeSpeichern();
  return v.beschreibung;
}
export function vor() {
  const v = Z.zukunft.pop(); if (!v) return null;
  Z.verlauf.push({ daten: JSON.stringify(Z.daten), beschreibung: v.beschreibung });
  Z.daten = JSON.parse(v.daten);
  emit('geaendert', { beschreibung: v.beschreibung, verlauf: true }); planeSpeichern();
  return v.beschreibung;
}

// ---------- Blobs (neue Bilder) ----------
export async function legeBlobAb(pfad, blob, masse) {
  Z.blobs.set(pfad, blob);
  if (Z.urls.has(pfad)) URL.revokeObjectURL(Z.urls.get(pfad));
  Z.urls.set(pfad, URL.createObjectURL(blob));
  const d = { ...Z.daten.medien.dateien, [pfad]: masse ? [masse.w, masse.h] : 0 };
  Z.daten.medien.dateien = Object.fromEntries(Object.keys(d).sort().map((k) => [k, d[k]])); // sortiert wie build.mjs
  await speichereBlob(pfad, blob);
}

// ---------- Automatisch speichern ----------
let timer = 0;
export function planeSpeichern() {
  clearTimeout(timer);
  emit('speichern', 'laeuft');
  timer = setTimeout(speichereJetzt, 500);
}
export async function speichereJetzt() {
  clearTimeout(timer);
  try {
    await speichereEntwurf({ daten: Z.daten, basis: Z.basis, live: Z.live, blobs: [...Z.blobs.keys()], zeit: Date.now(), version: 1 });
    Z.ungespeichert = false;
    emit('speichern', 'fertig');
  } catch (e) { emit('speichern', 'fehler'); }
}

// ---------- Unterschiede zum veröffentlichten Stand ----------
function zaehleUnterschiede(a, b, n = { z: 0 }) {
  if (n.z > 999) return n.z;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) { if (JSON.stringify(a) !== JSON.stringify(b)) n.z++; return n.z; }
  const schl = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of schl) zaehleUnterschiede(a[k], b[k], n);
  return n.z;
}
export function anzahlAenderungen() {
  if (!Z.basis) return 0;
  const jetzt = dateienAusDaten();
  let n = 0;
  for (const [pfad, text] of Object.entries(jetzt)) {
    if (pfad === 'medien.json') continue;
    const alt = Z.basis.dateien[pfad];
    if (alt === text) continue;
    if (!alt) { n++; continue; }
    if (pfad === 'cars.json') {
      // je Fahrzeug eine Änderung (neu, gelöscht, geändert) plus Reihenfolge
      const a = JSON.parse(alt).cars, b = JSON.parse(text).cars;
      const ma = new Map(a.map((c) => [c.id, JSON.stringify(c)])), mb = new Map(b.map((c) => [c.id, JSON.stringify(c)]));
      for (const [id, c] of mb) if (ma.get(id) !== c) n++;
      for (const id of ma.keys()) if (!mb.has(id)) n++;
      if (a.map((c) => c.id).filter((id) => mb.has(id)).join() !== b.map((c) => c.id).filter((id) => ma.has(id)).join()) n++;
      continue;
    }
    n += zaehleUnterschiede(JSON.parse(alt), JSON.parse(text));
  }
  return n;
}
