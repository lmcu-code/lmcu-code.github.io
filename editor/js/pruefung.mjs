// Prüfliste vor dem Veröffentlichen. Jeder Punkt springt zur Stelle, an der er behoben wird.
import { baue, kontrastPruefung } from '../../vorlagen/bau.mjs';
import { Z } from './zustand.mjs';

export function pruefe() {
  const d = Z.daten, p = [];
  const cars = d.cars.cars;
  // Fahrzeuge
  for (const c of cars) {
    const name = c.model || 'Neues Fahrzeug';
    if (!c.model) p.push({ art: 'fehler', titel: 'Fahrzeug ohne Modellnamen', text: 'Bitte das Modell eintragen.', ziel: { bereich: 'fahrzeuge', id: c.id, feld: 'model' } });
    if (!c.price) p.push({ art: 'fehler', titel: `Preis fehlt: ${name}`, text: 'Ohne Preis kann das Fahrzeug nicht erscheinen.', ziel: { bereich: 'fahrzeuge', id: c.id, feld: 'price' } });
    if (!c.vat && !c.sample) p.push({ art: 'fehler', titel: `MwSt.-Angabe fehlt: ${name}`, text: 'Pflicht bei echten Fahrzeugen: „MwSt. ausweisbar“ oder „Differenzbesteuert (§ 25a UStG)“.', ziel: { bereich: 'fahrzeuge', id: c.id, feld: 'vat' } });
    const g = c.media?.gallery || [];
    if (!g.length && !c.media?.poster) p.push({ art: 'warn', titel: `Noch keine Fotos: ${name}`, text: 'Auf der Seite steht „Foto folgt“.', ziel: { bereich: 'fahrzeuge', id: c.id, reiter: 'fotos' } });
    g.forEach((x, i) => { if (!x.alt) p.push({ art: 'warn', titel: `Bildbeschreibung fehlt: ${name}, Foto ${i + 1}`, text: 'Für Screenreader und Suchmaschinen.', ziel: { bereich: 'fahrzeuge', id: c.id, reiter: 'fotos', foto: i } }); });
  }
  const bsp = cars.filter((c) => c.sample);
  if (bsp.length) p.push({ art: 'warn', titel: `${bsp.length} Beispielfahrzeug${bsp.length > 1 ? 'e' : ''} noch auf der Seite`, text: 'Sie tragen sichtbar „Beispielfahrzeug“. Durch echte Fahrzeuge ersetzen.', ziel: { bereich: 'fahrzeuge', id: bsp[0].id } });
  const ohneMwst = bsp.filter((c) => !c.vat);
  if (ohneMwst.length) p.push({ art: 'warn', titel: `MwSt.-Angabe fehlt bei ${ohneMwst.length} Beispielfahrzeug${ohneMwst.length > 1 ? 'en' : ''}`, text: 'Dort steht sichtbar „MwSt.-Angabe folgt“. Bei echten Fahrzeugen ist sie Pflicht.', ziel: { bereich: 'fahrzeuge', id: ohneMwst[0].id, feld: 'vat' } });
  // Impressum
  const offen = Object.entries(d.cfg.offen || {}).filter(([, v]) => !v).map(([k]) => ({ rechtsform: 'Rechtsform', ustId: 'USt-ID', register: 'Registereintrag', hoster: 'Hoster' }[k] || k));
  if (offen.length) p.push({ art: 'warn', titel: 'Impressum und Datenschutz unvollständig', text: `Noch offen: ${offen.join(', ')}. Vor Livegang rechtlich prüfen lassen.`, ziel: { bereich: 'betrieb', abschnitt: 'offen' } });
  // Kontrast
  for (const k of kontrastPruefung(d.cfg.design?.farben)) if (!k.ok) p.push({ art: 'fehler', titel: `Zu wenig Kontrast: ${k.name}`, text: `${k.wert.toFixed(2)} : 1, mindestens ${k.min} : 1 (WCAG AA).`, ziel: { bereich: 'design' } });
  // Bilder
  for (const [pfad, blob] of Z.blobs) {
    const m = d.medien.dateien[pfad];
    if (blob.size > 700 * 1024) p.push({ art: 'warn', titel: 'Großes Bild', text: `${pfad.split('/').pop()}: ${Math.round(blob.size / 1024)} KB. Lädt am Handy langsam.`, ziel: { bereich: 'fahrzeuge' } });
    else if (Array.isArray(m) && m[0] > 2400) p.push({ art: 'warn', titel: 'Sehr breites Bild', text: `${pfad.split('/').pop()}: ${m[0]} px breit.`, ziel: { bereich: 'fahrzeuge' } });
  }
  if (d.texte.de?.held && !d.texte.de.held.auto_alt) p.push({ art: 'warn', titel: 'Bildbeschreibung fehlt: Hero-Bild', text: 'Bitte kurz beschreiben, was zu sehen ist.', ziel: { bereich: 'seiten', auswahl: { art: 'bild', schluessel: 'cfg:bilder.held' } } });
  // Tote Links
  for (const t of toteLinks()) p.push({ art: 'fehler', titel: 'Toter Link', text: `${t.seite}: ${t.ziel}`, ziel: { bereich: 'seiten', seite: t.seite } });
  return p;
}

export function toteLinks() {
  const d = Z.daten;
  const { seiten } = baue({ cfg: d.cfg, daten: d.cars, texte: d.texte, medien: d.medien });
  const dateien = new Set([...Object.keys(seiten), ...Object.keys(d.medien.dateien), ...Z.blobs.keys(), 'impressum.html', 'datenschutz.html']);
  const tot = [];
  for (const [pfad, html] of Object.entries(seiten)) {
    if (!pfad.endsWith('.html')) continue;
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const basis = new URL(pfad, 'https://x.invalid/');
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const ziel = m[1];
      if (/^(https?:|mailto:|tel:|data:|blob:|javascript:)/.test(ziel)) continue;
      if (ziel.startsWith('#')) { if (ziel.length > 1 && !ids.has(ziel.slice(1))) tot.push({ seite: pfad, ziel }); continue; }
      const u = new URL(ziel.replace(/&amp;/g, '&'), basis);
      let rel = decodeURIComponent(u.pathname.slice(1));
      if (rel === '' || rel.endsWith('/')) rel += 'index.html';
      if (!dateien.has(rel)) tot.push({ seite: pfad, ziel });
      else if (u.hash && rel.endsWith('.html') && seiten[rel]) { const id = u.hash.slice(1); if (id && !seiten[rel].includes(`id="${id}"`)) tot.push({ seite: pfad, ziel }); }
    }
  }
  return tot.slice(0, 20);
}
