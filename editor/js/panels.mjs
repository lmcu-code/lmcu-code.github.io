// Bereiche (links) und Eigenschaften (rechts). Jede Eingabe ändert die Daten; die Vorschau folgt sofort.
import { SCHRIFTEN, FARB_VORLAGEN, STANDARD_FARBEN, kontrastPruefung } from '../../vorlagen/bau.mjs';
import { Z, on, emit, aendere, hole, setze, aufloesen } from './zustand.mjs';
import { h, ic, esc, $, toast, dialog, schliesseDialog } from './ui.mjs';
import { fid, textFeld, auswahlFeld, schalterFeld, segmentFeld, reglerFeld, farbFeld, panel, gruppe, hinweis, leer, knopf, ikon, ziehbar, verschiebe } from './felder.mjs';
import { seitenListe, etikett, scrolleZu, spieleAnimation, WURZEL } from './vorschau.mjs';
import { verarbeite, STUFEN, slugify, istBild } from './bilder.mjs';
import { pruefe } from './pruefung.mjs';
import { token, pruefeToken, versionen, dateiAmStand, GitFehler } from './github.mjs';

export const BEREICHE = [
  { id: 'seiten', name: 'Seiten', icon: 'seiten', text: 'Seiten, Abschnitte und Texte' },
  { id: 'fahrzeuge', name: 'Fahrzeuge', icon: 'auto', text: 'Bestand pflegen, Fotos, Stellen' },
  { id: 'design', name: 'Design', icon: 'design', text: 'Farben, Schriften, Größen' },
  { id: 'animation', name: 'Animation', icon: 'animation', text: 'Bewegung und Tempo' },
  { id: 'betrieb', name: 'Betrieb', icon: 'betrieb', text: 'Adresse, Telefon, Öffnungszeiten' },
  { id: 'seo', name: 'Suche & Teilen', icon: 'seo', text: 'Google und WhatsApp' },
  { id: 'sprachen', name: 'Sprachen', icon: 'sprachen', text: 'Deutsch, Türkçe, English' },
  { trenner: true },
  { id: 'pruefen', name: 'Prüfliste', icon: 'haken', text: 'Vor dem Veröffentlichen' },
  { id: 'versionen', name: 'Versionen', icon: 'versionen', text: 'Frühere Stände wiederherstellen' },
  { id: 'zugang', name: 'Zugang', icon: 'schluessel', text: 'GitHub-Token zum Veröffentlichen', unten: true },
];

const NAMEN = { kopf: 'Kopfzeile', held: 'Hero', werte: 'Kennwerte', bestand: 'Bestand', leistungen: 'Leistungen', ablauf: 'Ablauf', kontakt: 'Kontakt', fuss: 'Fuß', impressum: 'Impressum', datenschutz: 'Datenschutz' };
const RAUM = { kopf: ['allgemein'], held: ['held'], werte: ['werte'], bestand: ['bestand', 'suche'], leistungen: ['leistungen'], ablauf: ['leistungen.ablauf_titel', 'leistungen.ablauf_hinweis', 'leistungen.schritte'], kontakt: ['kontakt'], fuss: ['fuss'], impressum: ['recht.impressum'], datenschutz: ['recht.datenschutz'] };
const EFFEKTE = [['keiner', 'Keiner'], ['einblenden', 'Einblenden'], ['von-unten', 'Von unten'], ['maske', 'Maske'], ['zoom', 'Zoom']];
const SCHLUESSEL_NAMEN = { kennung: 'Kennzeile', titel: 'Titel', titel_1: 'Titel, Zeile 1', titel_2: 'Titel, Zeile 2', titel_3: 'Titel, Zeile 3', satz: 'Einleitungssatz', intro: 'Einleitung', knopf: 'Knopf', knopf_bestand: 'Knopf 1', knopf_besichtigung: 'Knopf 2', label: 'Bezeichnung für Screenreader', alt: 'Bildbeschreibung', auto_alt: 'Bildbeschreibung Hero-Bild', text: 'Text', kurz: 'Kurztext', liste: 'Liste', schritte: 'Schritte', leer: 'Text, wenn kein Fahrzeug da ist' };
export const schluesselName = (k) => SCHLUESSEL_NAMEN[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' ');
const sprachName = (l) => ({ de: 'Deutsch', tr: 'Türkçe', en: 'English' }[l] || l);

// ================= Links: Bereiche =================
export function zeichneBereich(id) {
  const f = { seiten: bereichSeiten, design: bereichDesign, animation: bereichAnimation, betrieb: bereichBetrieb, seo: bereichSeo, sprachen: bereichSprachen, pruefen: bereichPruefen, versionen: bereichVersionen, zugang: bereichZugang }[id];
  return f ? f() : null;
}

// ---------- Seiten ----------
function bereichSeiten() {
  const seiten = seitenListe();
  const liste = h('div.liste');
  let gruppeAlt = '', ul = null;
  for (const s of seiten) {
    if (s.gruppe !== gruppeAlt) { const gid = fid('sg-' + s.gruppe); liste.append(h('p.liste__gruppe', { id: gid, text: s.gruppe })); ul = h('ul.liste', { 'aria-labelledby': gid }); liste.append(ul); gruppeAlt = s.gruppe; }
    ul.append(h('li', {}, h('button.eintrag', { type: 'button', 'aria-current': s.pfad === Z.ui.seite ? 'true' : null, onclick: () => emit('seite', s.pfad), html: `${ic(s.icon)}<span class="eintrag__text"><strong>${esc(s.name)}</strong><small>${esc(seitenAdresse(s.pfad))}</small></span>` })));
  }
  const inhalt = [liste];
  if (/(^|\/)index\.html$/.test(Z.ui.seite) && !Z.ui.seite.includes('fahrzeug/')) inhalt.push(abschnittListe());
  else if (Z.ui.seite.includes('fahrzeug/')) {
    const id = Z.ui.seite.split('/').at(-2);
    inhalt.push(gruppe('Diese Seite', hinweis('Fahrzeugseiten entstehen aus den Fahrzeugdaten. Texte direkt in der Vorschau anklicken oder das Fahrzeug öffnen.'), knopf('Fahrzeug bearbeiten', { icon: 'auto', onclick: () => emit('auto-oeffnen', id) })));
  } else {
    const art = Z.ui.seite.replace('.html', '');
    inhalt.push(gruppe('Diese Seite', hinweis('Platzhalter wie {name} oder {strasse} werden aus „Betrieb“ eingesetzt. Offene Angaben (Rechtsform, USt-ID …) unter „Betrieb“ ergänzen.'), knopf('Alle Texte dieser Seite', { icon: 'text', onclick: () => emit('auswahl', { art: 'abschnitt', id: art }) })));
  }
  return panel('Seiten', inhalt, { untertitel: Z.ui.sprache.toUpperCase() });
}
export function seitenAdresse(pfad) { return '/' + pfad.replace(/index\.html$/, ''); }

function abschnittListe() {
  const cfg = Z.daten.cfg;
  const alle = alleAbschnitte(cfg);
  const ul = h('ul.liste.liste--abschnitte', { 'aria-label': 'Abschnitte der Startseite (Reihenfolge mit Alt + Pfeiltasten ändern)' });
  const fest = (id, text) => h('li.eintrag.abschnitt', { 'aria-current': Z.ui.auswahl?.art === 'abschnitt' && Z.ui.auswahl.id === id ? 'true' : null }, h('span.eintrag__griff.eintrag__griff--fest', { 'aria-hidden': 'true', html: ic('ziel', 'i--k') }), h('button.eintrag__text.eintrag__knopf', { type: 'button', onclick: () => waehleAbschnitt(id), html: `<strong>${esc(NAMEN[id])}</strong><small>${esc(text)}</small>` }));
  ul.append(fest('kopf', 'immer oben'));
  ul.append(fest('held', 'immer als Erstes'));
  const beweglich = alle.filter((x) => x.id !== 'held');
  beweglich.forEach((a, i) => {
    const aus = a.sichtbar === false;
    const li = h(`li.eintrag.abschnitt${aus ? '.eintrag--aus' : ''}`, { 'data-index': String(i), 'aria-current': Z.ui.auswahl?.art === 'abschnitt' && Z.ui.auswahl.id === a.id ? 'true' : null });
    li.append(
      h('span.eintrag__griff', { 'aria-hidden': 'true', 'data-tipp': 'Ziehen zum Verschieben', html: ic('griff') }),
      h('button.eintrag__text.eintrag__knopf', { type: 'button', id: fid('ab-' + a.id), 'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown', onclick: () => waehleAbschnitt(a.id), html: `<strong>${esc(NAMEN[a.id] || a.id)}</strong><small>${aus ? 'ausgeblendet' : effektName(a.id)}</small>` }),
      h('span.eintrag__aktionen', {}, ikon(aus ? 'augeZu' : 'auge', aus ? `${NAMEN[a.id]} einblenden` : `${NAMEN[a.id]} ausblenden`, () => schalteAbschnitt(a.id, aus), { attrs: { 'aria-pressed': aus ? 'false' : 'true' } })),
    );
    ul.append(li);
    if (a.id === 'leistungen') {
      const ab = cfg.startseite?.ablaufZeigen !== false;
      ul.append(h(`li.eintrag.abschnitt.abschnitt--unter${ab ? '' : '.eintrag--aus'}`, {}, h('span.eintrag__griff.eintrag__griff--fest', { 'aria-hidden': 'true' }), h('button.eintrag__text.eintrag__knopf', { type: 'button', onclick: () => waehleAbschnitt('ablauf'), html: `<strong>Ablauf</strong><small>${ab ? 'Teil von Leistungen' : 'ausgeblendet'}</small>` }), h('span.eintrag__aktionen', {}, ikon(ab ? 'auge' : 'augeZu', ab ? 'Ablauf ausblenden' : 'Ablauf einblenden', () => aendere(ab ? 'Ablauf ausgeblendet' : 'Ablauf eingeblendet', (d) => { d.cfg.startseite.ablaufZeigen = !ab; }), { attrs: { 'aria-pressed': ab ? 'true' : 'false' } }))));
    }
  });
  ul.append(fest('fuss', 'immer unten'));
  ziehbar(ul, { verschieben: (von, nach, tastatur) => verschiebeAbschnitt(beweglich[von].id, nach - von, tastatur) });
  return gruppe('Abschnitte', ul, hinweis('Ziehen am Griff oder Alt + ↑/↓ ändert die Reihenfolge. Das Auge blendet aus.'));
}
const effektName = (id) => (EFFEKTE.find((e) => e[0] === (Z.daten.cfg.animation?.effekte?.[id] || 'von-unten')) || [, ''])[1];
export function alleAbschnitte(cfg) {
  const std = ['held', 'werte', 'bestand', 'leistungen', 'kontakt'];
  const l = cfg.startseite?.abschnitte || std.map((id) => ({ id, sichtbar: true }));
  return [...l, ...std.filter((id) => !l.some((x) => x.id === id)).map((id) => ({ id, sichtbar: true }))];
}
function waehleAbschnitt(id) {
  emit('auswahl', { art: 'abschnitt', id });
  const sel = id === 'kopf' ? 'body > header' : id === 'fuss' ? 'body > footer' : id === 'ablauf' ? '.ablauf, [data-abschnitt="leistungen"]' : `[data-abschnitt="${id}"]`;
  scrolleZu(sel);
}
export function schalteAbschnitt(id, an) {
  if (id === 'held') return;
  const name = NAMEN[id] || id;
  aendere(an ? `${name} eingeblendet` : `${name} ausgeblendet`, (d) => {
    d.cfg.startseite = d.cfg.startseite || {};
    d.cfg.startseite.abschnitte = alleAbschnitte(d.cfg).map((x) => (x.id === id ? { ...x, sichtbar: an } : x));
  });
  if (!an) toast(`${name} ausgeblendet`, { art: 'info', aktion: { text: 'Rückgängig', tun: () => emit('rueck') } });
}
export function verschiebeAbschnitt(id, um, tastatur = false) {
  aendere(`${NAMEN[id]} verschoben`, (d) => {
    const l = alleAbschnitte(d.cfg);
    const held = l.filter((x) => x.id === 'held'), rest = l.filter((x) => x.id !== 'held');
    const i = rest.findIndex((x) => x.id === id), j = Math.max(0, Math.min(rest.length - 1, i + um));
    verschiebe(rest, i, j);
    d.cfg.startseite.abschnitte = [...held, ...rest];
  });
  if (tastatur) setTimeout(() => document.getElementById(fid('ab-' + id))?.focus(), 30);
}

// ---------- Design ----------
const SCHRIFT_ROLLEN = [['breit', 'Überschriften und Text', 'KMC Motors Köln'], ['ziffer', 'Preise und Zahlen', '38.900 €'], ['marke', 'Kennzeilen', 'KMC MOTORS']];
let schriftStil = false;
function schriftenLaden() {
  if (schriftStil) return; schriftStil = true;
  const css = Object.values(SCHRIFTEN).filter((s) => !s.basis || s.name === 'Bodoni Moda').map((s) => `@font-face{font-family:"${s.name}";font-display:swap;font-weight:${s.gewicht};src:url(${WURZEL}assets/fonts/${s.datei}) format("woff2")}`).join('');
  document.head.append(h('style', { text: css }));
}
function bereichDesign() {
  schriftenLaden();
  const d = Z.daten.cfg.design || {};
  const f = { ...STANDARD_FARBEN, ...(d.farben || {}) };
  const gleich = (a) => Object.keys(STANDARD_FARBEN).every((k) => (a[k] || '').toLowerCase() === (f[k] || '').toLowerCase());
  const vor = h('div.voreinstellungen', { role: 'group', 'aria-label': 'Farbvarianten' });
  for (const v of FARB_VORLAGEN) {
    vor.append(h('button.voreinstellung', { type: 'button', 'aria-pressed': gleich(v.farben) ? 'true' : 'false', onclick: () => aendere(`Farbvariante ${v.name}`, (x) => { x.cfg.design.farben = { ...v.farben }; }) },
      h('span.voreinstellung__farben', { 'aria-hidden': 'true' }, ...['grund', 'akzent', 'ueberschrift', 'text'].map((k) => h('i', { style: { background: v.farben[k] } }))),
      h('span.voreinstellung__text', { html: `<strong>${esc(v.name)}</strong><small>${esc(v.text)}</small>` })));
  }
  const farben = [['akzent', 'Akzent (Kupfer)'], ['grund', 'Grund'], ['ueberschrift', 'Überschriften'], ['text', 'Fließtext'], ['nebentext', 'Nebentext']].map(([k, n]) => farbFeld({ id: fid('farbe-' + k), label: n, wert: f[k], aendern: (w) => aendere(`Farbe ${n}`, (x) => { x.cfg.design.farben = { ...STANDARD_FARBEN, ...(x.cfg.design.farben || {}), [k]: w }; }, { zusammen: 'farbe-' + k }) }));
  const kontraste = h('div.kontrastbox', { id: 'kontrast-box' }, ...kontrastInhalt());
  const sch = { breit: 'archivo', ziffer: 'bodoni-moda', marke: 'cinzel', ...(d.schriften || {}) };
  const schriften = SCHRIFT_ROLLEN.map(([rolle, titel, probe]) => {
    const box = h('div.schriftwahl', { role: 'radiogroup', 'aria-label': titel });
    for (const [key, s] of Object.entries(SCHRIFTEN).filter(([, s]) => s.rolle === rolle)) {
      box.append(h('label', {}, h('input', { type: 'radio', name: 'schrift-' + rolle, value: key, checked: sch[rolle] === key, onchange: () => aendere(`Schrift ${s.name}`, (x) => { x.cfg.design.schriften = { ...sch, [rolle]: key }; }) }),
        h('span.probe', { style: { fontFamily: `"${s.name}"`, fontWeight: rolle === 'breit' ? '700' : '500', fontStretch: rolle === 'breit' ? '112%' : null, letterSpacing: rolle === 'marke' ? '.12em' : null }, text: probe }),
        h('small', { text: s.name + (s.basis ? ' · Standard' : '') })));
    }
    return h('div.feld', {}, h('span.feld__label', { text: titel }), box);
  });
  const pct = (v) => `${Math.round(v * 100)} %`;
  return panel('Design', [
    gruppe('Farbvarianten', vor),
    gruppe('Eigene Farben', ...farben, h('p.gruppe__titel.gruppe__titel--klein', { text: 'Kontrast (WCAG AA, mindestens 4,5 : 1)' }), kontraste),
    gruppe('Schriften', hinweis('Alle Schriften liegen auf der eigenen Website (keine fremden Server).'), ...schriften),
    gruppe('Größen und Abstände',
      reglerFeld({ id: fid('skala'), label: 'Schriftgröße', wert: d.schriftgroesse ?? 1, min: 0.85, max: 1.2, schritt: 0.05, format: pct, aendern: (v) => aendere('Schriftgröße', (x) => { x.cfg.design.schriftgroesse = v; }, { zusammen: 'skala' }) }),
      reglerFeld({ id: fid('abstand'), label: 'Abstände zwischen Abschnitten', wert: d.abstand ?? 1, min: 0.7, max: 1.3, schritt: 0.05, format: pct, aendern: (v) => aendere('Abstände', (x) => { x.cfg.design.abstand = v; }, { zusammen: 'abstand' }) })),
  ]);
}
function kontrastInhalt() {
  const pr = kontrastPruefung(Z.daten.cfg.design?.farben);
  const schlecht = pr.filter((p) => !p.ok);
  const liste = h('ul.kontraste', { 'aria-label': 'Kontrastprüfung' }, ...pr.map((p) => h('li', {}, h('span', { text: p.name }), h(`span.marke.marke--${p.ok ? 'gut' : 'fehler'}`, { html: `${ic(p.ok ? 'haken' : 'warn', 'i--k')}${p.wert.toFixed(1).replace('.', ',')} : 1` }))));
  const warnung = schlecht.length ? h('div.warnkasten.warnkasten--fehler', { role: 'alert' }, h('span', { html: ic('warn') }), h('p', { html: `<strong>Zu wenig Kontrast.</strong> ${esc(schlecht.map((s) => s.name).join(', '))} ${schlecht.length > 1 ? 'liegen' : 'liegt'} unter 4,5 : 1. Veröffentlichen ist gesperrt, bis das behoben ist.` }), knopf('Standard wiederherstellen', { klein: true, art: 'leise', onclick: () => aendere('Farben zurückgesetzt', (x) => { x.cfg.design.farben = { ...STANDARD_FARBEN }; }) })) : null;
  return [liste, warnung].filter(Boolean);
}
// Kontrastanzeige läuft live mit, auch während ein Farbfeld den Fokus hat
on('geaendert', () => { const b = document.getElementById('kontrast-box'); if (b && Z.daten) b.replaceChildren(...kontrastInhalt()); });
export const kontrastOk = () => kontrastPruefung(Z.daten.cfg.design?.farben).every((p) => p.ok);

// ---------- Animation ----------
function bereichAnimation() {
  const a = Z.daten.cfg.animation || {};
  const an = a.an !== false;
  const setz = (beschr, fn, z) => aendere(beschr, (x) => { x.cfg.animation = x.cfg.animation || {}; fn(x.cfg.animation); }, z ? { zusammen: z } : {});
  const effekte = alleAbschnitte(Z.daten.cfg).filter((x) => x.id !== 'held').map((x) => auswahlFeld({ id: fid('eff-' + x.id), label: NAMEN[x.id], wert: a.effekte?.[x.id] || 'von-unten', optionen: EFFEKTE, aendern: (w) => setz(`Effekt ${NAMEN[x.id]}`, (y) => { y.effekte = { ...(y.effekte || {}), [x.id]: w }; }) }));
  return panel('Animation', [
    gruppe(null, schalterFeld({ id: fid('anim-an'), label: 'Animationen', klein: an ? 'an' : 'aus: alles steht still', an, aendern: (v) => setz(v ? 'Animationen an' : 'Animationen aus', (y) => { y.an = v; }) }),
      hinweis('Wer auf dem Gerät „Bewegung reduzieren“ eingestellt hat, sieht immer eine ruhige Seite. Das bleibt so.')),
    gruppe('Stärke und Tempo',
      segmentFeld({ id: fid('staerke'), label: 'Stärke', wert: a.staerke || 'normal', optionen: [['dezent', 'Dezent'], ['normal', 'Normal'], ['ausdrucksstark', 'Ausdrucksstark']], aendern: (w) => setz(`Stärke ${w}`, (y) => { y.staerke = w; }) }),
      reglerFeld({ id: fid('tempo'), label: 'Dauer', wert: a.tempo ?? 1, min: 0.5, max: 1.8, schritt: 0.1, format: (v) => `${v.toFixed(1).replace('.', ',')}× · ${v < 0.95 ? 'schneller' : v > 1.05 ? 'ruhiger' : 'normal'}`, aendern: (v) => setz('Tempo', (y) => { y.tempo = v; }, 'tempo') })),
    gruppe('Einzelne Effekte',
      schalterFeld({ id: fid('hero'), label: 'Auftritt im Hero', klein: 'Titel und Auto gleiten herein', an: a.heroAuftritt !== false, aendern: (v) => setz('Hero-Auftritt', (y) => { y.heroAuftritt = v; }) }),
      schalterFeld({ id: fid('schimmer'), label: 'Schimmer', klein: 'Lichtkante über Kupferwörtern', an: a.schimmer !== false, aendern: (v) => setz('Schimmer', (y) => { y.schimmer = v; }) }),
      schalterFeld({ id: fid('blitz'), label: 'Scheinwerfer-Blitz', klein: 'einmal beim Laden', an: a.blitz !== false, aendern: (v) => setz('Scheinwerfer-Blitz', (y) => { y.blitz = v; }) }),
      schalterFeld({ id: fid('zaehlen'), label: 'Zahlen zählen hoch', klein: 'bei den Kennwerten', an: a.zaehlen !== false, aendern: (v) => setz('Zählende Zahlen', (y) => { y.zaehlen = v; }) })),
    gruppe('Effekt je Abschnitt', ...effekte),
  ], { fuss: knopf('Animation abspielen', { icon: 'play', art: 'leise', onclick: spieleAnimation, attrs: { class: 'knopf knopf--leise knopf--breit' } }) });
}

// ---------- Betrieb ----------
const TAGE = [['Monday', 'Mo'], ['Tuesday', 'Di'], ['Wednesday', 'Mi'], ['Thursday', 'Do'], ['Friday', 'Fr'], ['Saturday', 'Sa'], ['Sunday', 'So']];
export const telefonLink = (t) => { let d = String(t || '').replace(/[^\d+]/g, ''); if (d.startsWith('00')) d = '+' + d.slice(2); if (d.startsWith('0')) d = '+49' + d.slice(1); return d; };
function bereichBetrieb() {
  const k = Z.daten.cfg.betrieb;
  const setzB = (feld, beschr) => (w) => aendere(beschr, (x) => {
    x.cfg.betrieb[feld] = w;
    if (feld === 'telefon') x.cfg.betrieb.telefonLink = telefonLink(w);
    if (feld === 'whatsapp') x.cfg.betrieb.whatsappLink = telefonLink(w).replace('+', '');
  }, { zusammen: 'b-' + feld });
  const tf = (feld, label, o = {}) => textFeld({ id: fid('b-' + feld), label, wert: k[feld], aendern: setzB(feld, label), ...o });
  const mailFehler = k.email && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(k.email) ? 'Bitte eine gültige E-Mail-Adresse eintragen.' : '';
  const telFehler = k.telefon && telefonLink(k.telefon).replace(/\D/g, '').length < 8 ? 'Die Nummer scheint zu kurz.' : '';
  // Öffnungszeiten
  const zeiten = h('div.zeiten');
  (k.oeffnungszeiten || []).forEach((o, i) => {
    const tage = h('div.tage', { role: 'group', 'aria-label': `Tage, Zeile ${i + 1}` }, ...TAGE.map(([en, kurz]) => h('label.tag', {}, h('input', { type: 'checkbox', checked: o.tage.includes(en), onchange: (e) => aendere('Öffnungstage', (x) => { const t = new Set(x.cfg.betrieb.oeffnungszeiten[i].tage); if (e.target.checked) t.add(en); else t.delete(en); x.cfg.betrieb.oeffnungszeiten[i].tage = TAGE.map((y) => y[0]).filter((y) => t.has(y)); }) }), h('span', { text: kurz }))));
    const zeit = (wo, label) => h('input', { type: 'time', value: o[wo], 'aria-label': `${label}, Zeile ${i + 1}`, id: fid(`z-${i}-${wo}`), onchange: (e) => aendere('Öffnungszeit', (x) => { x.cfg.betrieb.oeffnungszeiten[i][wo] = e.target.value; }) });
    zeiten.append(h('div.zeitzeile', {}, tage, h('div.zeitzeile__uhr', {}, zeit('von', 'Von'), h('span', { text: 'bis', 'aria-hidden': 'true' }), zeit('bis', 'Bis'), ikon('muell', `Zeile ${i + 1} entfernen`, () => aendere('Öffnungszeit entfernt', (x) => { x.cfg.betrieb.oeffnungszeiten.splice(i, 1); })))));
  });
  zeiten.append(knopf('Zeile hinzufügen', { icon: 'plus', klein: true, art: 'leise', onclick: () => aendere('Öffnungszeit hinzugefügt', (x) => { x.cfg.betrieb.oeffnungszeiten.push({ tage: ['Sunday'], von: '10:00', bis: '14:00' }); }) }));
  const fmt = Z.daten.texte.de.zeiten?.format || 'kurz';
  const sprachen = h('div.tage', { role: 'group', 'aria-label': 'Gesprochene Sprachen' }, ...['de', 'tr', 'en'].map((l) => h('label.tag.tag--breit', {}, h('input', { type: 'checkbox', checked: (k.sprachen || []).includes(l), onchange: (e) => aendere('Sprachen im Betrieb', (x) => { const s = new Set(x.cfg.betrieb.sprachen); if (e.target.checked) s.add(l); else s.delete(l); x.cfg.betrieb.sprachen = ['de', 'tr', 'en'].filter((y) => s.has(y)); }) }), h('span', { text: sprachName(l) }))));
  const offen = Z.daten.cfg.offen || {};
  const of = (feld, label, hilfe) => textFeld({ id: fid('o-' + feld), label, wert: offen[feld], hilfe, platz: 'noch offen', aendern: (w) => aendere(label, (x) => { x.cfg.offen = { ...(x.cfg.offen || {}), [feld]: w }; }, { zusammen: 'o-' + feld }) });
  return panel('Betrieb', [
    hinweis('Alle Angaben an einer Stelle. Sie erscheinen überall auf der Website: Kopf, Kontakt, Fuß, Impressum, Fahrzeugseiten.'),
    gruppe('Name', tf('name', 'Name des Betriebs'), tf('kurz', 'Kurzname'), tf('inhaber', 'Inhaber')),
    gruppe('Adresse', tf('strasse', 'Straße und Nummer'), h('div.zeile2', {}, tf('plz', 'PLZ', { attrs: { inputmode: 'numeric' } }), tf('ort', 'Ort')), tf('karte', 'Link zur Karte', { typ: 'url', hilfe: 'OpenStreetMap-Link, öffnet sich beim Klick auf „Karte“.' })),
    gruppe('Kontakt', tf('telefon', 'Telefon', { typ: 'tel', fehler: telFehler, hilfe: `Wählt: ${k.telefonLink || '–'}` }), tf('whatsapp', 'WhatsApp', { typ: 'tel', hilfe: `wa.me/${k.whatsappLink || '–'}` }), tf('email', 'E-Mail', { typ: 'email', fehler: mailFehler }), tf('mobilede', 'mobile.de-Seite', { typ: 'url' })),
    gruppe('Öffnungszeiten', zeiten, segmentFeld({ id: fid('zeitformat'), label: 'Schreibweise', wert: fmt, optionen: [['kurz', '10 bis 18 Uhr'], ['24h', '10:00 bis 18:00']], aendern: (w) => aendere('Zeitformat', (x) => { for (const l of Object.keys(x.texte)) if (x.texte[l].zeiten) x.texte[l].zeiten.format = w; }) })),
    gruppe('Sprachen im Betrieb', sprachen, hinweis('Erscheint in den Kennwerten und im Kontakt („Wir sprechen …“).')),
    gruppe('Großes Wort hinter dem Hero', textFeld({ id: fid('riese'), label: 'Schriftzug', wert: Z.daten.cfg.riese, max: 8, aendern: (w) => aendere('Schriftzug', (x) => { x.cfg.riese = w; }, { zusammen: 'riese' }) })),
    h('div', { id: 'betrieb-offen' }, gruppe('Für das Impressum', hinweis('Diese Angaben fehlen noch. Bis sie da sind, steht „wird ergänzt“ im Impressum. Vor dem Livegang rechtlich prüfen lassen.'), of('rechtsform', 'Rechtsform', 'z. B. Einzelunternehmen'), of('ustId', 'USt-IdNr.'), of('register', 'Registereintrag', 'falls vorhanden'), of('hoster', 'Hoster der Website', 'z. B. GitHub Pages (GitHub Inc.)'))),
  ]);
}

// ---------- SEO ----------
function bereichSeo() {
  const tx = Z.daten.texte[Z.ui.sprache], cfg = Z.daten.cfg;
  const vars = { name: cfg.betrieb.name, strasse: cfg.betrieb.strasse, sprachen: (cfg.betrieb.sprachen || []).map((c) => cfg.sprachen?.[c]?.name || c).join(', ') };
  const ersetze = (s) => String(s || '').replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? '');
  const titel = ersetze(tx.meta?.titel_start), text = ersetze(tx.meta?.beschreibung_start);
  const domain = (cfg.domain || '').replace(/\/$/, '');
  const ogUrl = Z.urls.get(cfg.seo?.bild) || (cfg.seo?.bild ? WURZEL + cfg.seo.bild : '');
  const bildWahl = h('input', { type: 'file', accept: 'image/*', class: 'nur-sr', id: fid('og-datei'), onchange: async (e) => {
    const f = e.target.files[0]; if (!f || !istBild(f)) return;
    const pfad = `assets/og-${Date.now().toString(36)}`;
    const r = await verarbeite(f, { stufen: [1200], basisPfad: pfad, zuschnitt: zuschnittFuer(await bildMasse(f), 1200 / 630) });
    aendere('Vorschaubild', (x) => { x.cfg.seo.bild = r.gross.pfad; });
    toast('Vorschaubild ersetzt');
  } });
  const ind = cfg.seo?.indexieren === true;
  return panel('Suche & Teilen', [
    gruppe('Google', textFeld({ id: fid('seo-titel'), label: 'Titel', wert: tx.meta?.titel_start, max: 60, aendern: (w) => aendere('SEO-Titel', (x) => { x.texte[Z.ui.sprache].meta.titel_start = w; }, { zusammen: 'seo-t' }), hilfe: 'Höchstens 60 Zeichen. Platzhalter wie {name} sind erlaubt.' }),
      textFeld({ id: fid('seo-text'), label: 'Beschreibung', wert: tx.meta?.beschreibung_start, max: 160, zeilen: 3, aendern: (w) => aendere('SEO-Beschreibung', (x) => { x.texte[Z.ui.sprache].meta.beschreibung_start = w; }, { zusammen: 'seo-b' }), hilfe: '120 bis 160 Zeichen sind ideal.' }),
      h('div.google', { 'aria-label': 'So sieht es bei Google aus' }, h('p.google__url', { text: (domain || 'https://…').replace(/^https?:\/\//, '') + ' › ' }), h('p.google__titel', { text: titel.slice(0, 64) + (titel.length > 64 ? ' …' : '') }), h('p.google__text', { text: text.slice(0, 160) + (text.length > 160 ? ' …' : '') }))),
    gruppe('WhatsApp und soziale Netze',
      h('div.wa', { 'aria-label': 'So sieht ein geteilter Link in WhatsApp aus' }, h('div.wa__bild', { style: { backgroundImage: ogUrl ? `url("${ogUrl}")` : 'none' } }), h('div.wa__text', {}, h('strong', { text: titel }), h('span', { text: text.slice(0, 90) + (text.length > 90 ? ' …' : '') }), h('span', { text: (domain || '').replace(/^https?:\/\//, '') }))),
      h('div.knopfzeile', {}, h('label.knopf.knopf--leise.klein', { for: fid('og-datei'), html: `${ic('hochladen')}<span>Vorschaubild ersetzen</span>` }), bildWahl),
      hinweis('Wird auf 1200 × 630 Pixel zugeschnitten.')),
    gruppe('Adresse und Auffindbarkeit',
      textFeld({ id: fid('domain'), label: 'Adresse der Website', typ: 'url', wert: cfg.domain, aendern: (w) => aendere('Adresse', (x) => { x.cfg.domain = w.trim(); }, { zusammen: 'domain' }) }),
      schalterFeld({ id: fid('indexieren'), label: 'Bei Google auffindbar', klein: ind ? 'Suchmaschinen dürfen die Seite aufnehmen' : 'aus: Suchmaschinen werden gebeten, die Seite nicht aufzunehmen', an: ind, aendern: (v) => aendere(v ? 'Auffindbar' : 'Nicht auffindbar', (x) => { x.cfg.seo.indexieren = v; }) }),
      hinweis('Erst einschalten, wenn Impressum vollständig ist und echte Fahrzeuge im Bestand stehen. Beispielfahrzeuge werden nie an Suchmaschinen gemeldet.')),
  ]);
}

// ---------- Sprachen ----------
function vollstaendig(l) {
  const de = Z.daten.texte.de, x = Z.daten.texte[l] || {};
  let n = 0, da = 0;
  const lauf = (a, b) => { if (typeof a === 'string') { n++; if (typeof b === 'string' && b.trim()) da++; return; } if (a && typeof a === 'object') for (const k of Object.keys(a)) lauf(a[k], b?.[k]); };
  lauf(de, x);
  return { n, da };
}
function bereichSprachen() {
  const cfg = Z.daten.cfg;
  const zeilen = ['de', 'tr', 'en'].map((l) => {
    const v = vollstaendig(l), frei = l === 'de' || cfg.sprachen?.[l]?.freigegeben;
    const pr = Math.round((v.da / v.n) * 100);
    return h('div.sprachzeile', {},
      h('button.eintrag', { type: 'button', 'aria-current': Z.ui.sprache === l ? 'true' : null, onclick: () => emit('sprache', l), html: `<span class="sprachkuerzel">${l.toUpperCase()}</span><span class="eintrag__text"><strong>${sprachName(l)}</strong><small>${l === 'de' ? 'Hauptsprache' : `${pr} % übersetzt`}${Z.ui.sprache === l ? ' · wird bearbeitet' : ''}</small></span>` }),
      l === 'de' ? h('span.marke.marke--gut', { text: 'immer live' }) : schalterFeld({ id: fid('frei-' + l), label: 'Freigeben', an: frei, aendern: (w) => { aendere(w ? `${sprachName(l)} freigegeben` : `${sprachName(l)} zurückgezogen`, (x) => { x.cfg.sprachen[l] = { ...(x.cfg.sprachen[l] || {}), freigegeben: w }; }); if (w && pr < 100) toast(`${sprachName(l)} ist erst zu ${pr} % übersetzt. Fehlende Texte erscheinen als Schlüssel.`, { art: 'info' }); } }),
    );
  });
  return panel('Sprachen', [
    hinweis('Wählen Sie, welche Sprache Sie gerade bearbeiten. Die Vorschau wechselt mit. Erst mit „Freigeben“ erscheint eine Sprache auf der Website (mit Sprachwahl oben).'),
    gruppe('Sprache bearbeiten', ...zeilen),
    hinweis('Türkisch und Englisch sind Entwürfe. Bitte vor der Freigabe von Muttersprachlern prüfen lassen.'),
  ]);
}

// ---------- Prüfliste ----------
export function pruefListe(punkte, { kompakt = false } = {}) {
  if (!punkte.length) return h('div.leer.leer--gut', {}, h('span', { html: ic('haken') }), h('strong', { text: 'Alles in Ordnung' }), h('p', { text: 'Keine offenen Punkte. Sie können veröffentlichen.' }));
  const ul = h('ul.pruef');
  for (const p of punkte) ul.append(h('li', { 'data-art': p.art }, h('button', { type: 'button', onclick: () => { schliesseDialog(); emit('springe', p.ziel); }, html: `${ic(p.art === 'fehler' ? 'fehler' : 'warn')}<span><strong>${esc(p.titel)}</strong>${kompakt ? '' : `<small>${esc(p.text)}</small>`}</span>${ic('rechts', 'i--k pruef__pfeil')}` })));
  return ul;
}
function bereichPruefen() {
  const p = pruefe();
  const f = p.filter((x) => x.art === 'fehler').length, w = p.length - f;
  return panel('Prüfliste', [
    h('p.pruef__summe', { html: f ? `<span class="marke marke--fehler">${f} muss behoben werden</span> ${w ? `<span class="marke marke--warn">${w} Hinweis${w > 1 ? 'e' : ''}</span>` : ''}` : w ? `<span class="marke marke--warn">${w} Hinweis${w > 1 ? 'e' : ''}</span> <span class="hinweis">Veröffentlichen ist möglich.</span>` : '' }),
    pruefListe(p),
    hinweis('Rote Punkte sperren das Veröffentlichen. Gelbe Punkte sind Hinweise. Klick springt zur Stelle.'),
  ]);
}

// ---------- Versionen ----------
let versionCache = null;
function bereichVersionen() {
  const cfg = Z.daten.cfg.veroeffentlichung || {};
  const box = h('div.versionen', {}, h('div.skelett-liste', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')));
  const laden = async () => {
    try {
      versionCache = versionCache || await versionen(cfg.repo, cfg.branch || 'main', 15);
      box.replaceChildren(versionsListe(versionCache, cfg));
    } catch (e) {
      box.replaceChildren(leer('versionen', 'Versionen nicht erreichbar', e instanceof GitFehler ? e.message : 'GitHub antwortet gerade nicht. Ihr Entwurf ist davon nicht betroffen.', knopf('Erneut versuchen', { klein: true, art: 'leise', onclick: () => { versionCache = null; emit('neu'); } })));
    }
  };
  laden();
  return panel('Versionen', [
    hinweis('Jedes Veröffentlichen ist eine Version. „Wiederherstellen“ lädt die Inhalte eines früheren Stands in den Editor; live geht er erst mit „Veröffentlichen“.'),
    box,
    gruppe('Entwurf', hinweis('Ihr Entwurf wird automatisch in diesem Browser gespeichert.'), knopf('Entwurf verwerfen', { icon: 'muell', art: 'leise', klein: true, onclick: () => emit('verwerfen') })),
  ]);
}
export const versionenNeu = () => { versionCache = null; };
const zeitText = (iso) => { const d = new Date(iso); return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
function versionsListe(l, cfg) {
  if (!l.length) return leer('versionen', 'Noch keine Versionen', 'Nach dem ersten Veröffentlichen stehen sie hier.');
  const ul = h('ul.liste.versionsliste');
  l.forEach((v, i) => ul.append(h('li.eintrag', {}, h('span.versionspunkt', { 'aria-hidden': 'true', 'data-erste': i === 0 ? '' : null }), h('span.eintrag__text', { html: `<strong>${esc(v.text)}</strong><small>${zeitText(v.zeit)}${v.von ? ' · ' + esc(v.von) : ''}${i === 0 ? ' · aktuell live' : ''}</small>` }),
    i === 0 ? null : knopf('Wiederherstellen', { klein: true, art: 'leise', onclick: () => wiederherstellen(v, cfg) }))));
  return ul;
}
async function wiederherstellen(v, cfg) {
  toast('Lade Version …', { art: 'info', dauer: 1500 });
  try {
    const pf = ['konfiguration.json', 'cars.json', 'i18n/de.json', 'i18n/tr.json', 'i18n/en.json'];
    const t = await Promise.all(pf.map((p) => dateiAmStand(cfg.repo, v.sha, p).then(JSON.parse).catch(() => null)));
    if (!t[0] || !t[1] || !t[2]) throw new Error('In dieser Version fehlen die Daten (ältere Website ohne Editor).');
    aendere(`Version vom ${zeitText(v.zeit)} wiederhergestellt`, (d) => { d.cfg = t[0]; d.cars = t[1]; d.texte = { de: t[2], tr: t[3] || d.texte.tr, en: t[4] || d.texte.en }; });
    emit('neu');
    toast(`Version vom ${zeitText(v.zeit)} geladen. Mit „Veröffentlichen“ geht sie live.`, { aktion: { text: 'Rückgängig', tun: () => emit('rueck') } });
  } catch (e) { toast(e.message || 'Version konnte nicht geladen werden.', { art: 'fehler' }); }
}

// ---------- Zugang ----------
function bereichZugang() {
  const cfg = Z.daten.cfg.veroeffentlichung || {};
  const t = token.holen();
  const eingabe = h('input', { type: 'password', id: fid('token'), autocomplete: 'off', spellcheck: 'false', placeholder: 'github_pat_…', value: '' });
  const status = h('p.hinweis', { role: 'status' });
  const speichern = async () => {
    const wert = eingabe.value.trim();
    if (!wert) { status.textContent = 'Bitte zuerst das Token einfügen.'; return; }
    token.setzen(wert); status.textContent = 'Prüfe bei GitHub …';
    try { await pruefeToken(cfg.repo); status.textContent = ''; toast('Token gespeichert und geprüft ✓'); emit('neu'); emit('status'); }
    catch (e) { status.innerHTML = `<span class="text-fehler">${esc(e.message)}</span>`; if (e.art === 'token' || e.art === 'rechte') token.setzen(''); }
  };
  const schritt = (n, titel, text) => h('li', {}, h('span.schritt__nr', { text: String(n), 'aria-hidden': 'true' }), h('div', { html: `<strong>${titel}</strong><p>${text}</p>` }));
  return panel('Zugang', [
    h('div.zugang__status', {}, h(`span.marke.marke--${t ? 'gut' : 'leise'}`, { html: `${ic(t ? 'haken' : 'schluessel', 'i--k')}${t ? 'Token gespeichert' : 'Kein Token'}` }), h('span.hinweis', { text: `Ziel: ${cfg.repo} (${cfg.branch || 'main'})` })),
    t ? gruppe(null, hinweis('Mit diesem Token kann dieser Browser veröffentlichen. Auf fremden oder geteilten Geräten bitte wieder entfernen.'), knopf('Token aus diesem Browser entfernen', { icon: 'muell', art: 'leise', klein: true, onclick: () => { token.setzen(''); toast('Token entfernt'); emit('neu'); emit('status'); } })) : null,
    gruppe(t ? 'Neues Token eintragen' : 'So richten Sie den Zugang ein',
      h('ol.schritte', {},
        schritt(1, 'Bei GitHub anmelden', 'Mit dem Konto, dem die Website gehört.'),
        schritt(2, 'Neues Token anlegen', `<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new ${ic('extern', 'i--k')}</a><br>Name: „KMC Editor“. Ablauf: z. B. 1 Jahr.`),
        schritt(3, 'Nur dieses Repository', `Bei „Repository access“: <em>Only select repositories</em> und <code>${esc(cfg.repo || '')}</code> wählen.`),
        schritt(4, 'Eine Berechtigung', 'Bei „Repository permissions“ → <em>Contents</em>: <strong>Read and write</strong>. Sonst nichts.'),
        schritt(5, 'Erzeugen und hier einfügen', '„Generate token“, kopieren, unten einfügen.')),
      h('div.feld', {}, h('label.feld__label', { for: eingabe.id }, h('span', { text: 'Token' })), eingabe),
      h('div.knopfzeile', {}, knopf('Prüfen und speichern', { icon: 'haken', art: 'primaer', klein: true, onclick: speichern })), status),
    gruppe('Gut zu wissen',
      hinweis('Das Token ist der Schlüssel zur Website: Wer es hat, kann veröffentlichen. Es gibt kein Passwort und kein Benutzerkonto im Editor.'),
      hinweis('Es wird nur in diesem Browser gespeichert (nicht im Repository, nicht auf einem Server). Kein Tracking, keine Datenbank.'),
      hinweis('Ohne Token können Sie trotzdem alles bearbeiten, als Entwurf speichern und die Website „Als ZIP herunterladen“.')),
  ]);
}

// ================= Rechts: Eigenschaften =================
export function zeichneInspektor() {
  const a = Z.ui.auswahl;
  if (!a) return inspektorLeer();
  if (a.art === 'text') return inspektorText(a.schluessel);
  if (a.art === 'bild') return inspektorBild(a.schluessel);
  if (a.art === 'abschnitt') return inspektorAbschnitt(a.id);
  return inspektorLeer();
}
function inspektorLeer() {
  return panel('Eigenschaften', [leer('ziel', 'Nichts ausgewählt', 'Klicken Sie in der Vorschau auf einen Text, ein Bild oder einen Abschnitt.'),
    h('ul.tastenliste', {}, h('li', { html: '<span>Text ändern</span><span>Klick, tippen, <kbd>Enter</kbd></span>' }), h('li', { html: '<span>Befehle suchen</span><span><kbd>Strg</kbd><kbd>K</kbd></span>' }), h('li', { html: '<span>Rückgängig</span><span><kbd>Strg</kbd><kbd>Z</kbd></span>' }), h('li', { html: '<span>Gerät wechseln</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span>' }))]);
}
const zurueckKnopf = () => ikon('zu', 'Auswahl aufheben', () => emit('auswahl', null), { kuerzel: 'Esc' });

function textFeldFuer(schluessel, { label, autofokus = false } = {}) {
  const { ziel, pfad, art } = aufloesen(schluessel);
  const wert = hole(ziel, pfad) ?? '';
  const lang = String(wert).length > 70 || /<|\n/.test(wert);
  const vars = String(wert).match(/\{\w+\}/g);
  const el = textFeld({ id: fid('t-' + schluessel), label: label || schluesselName(pfad.split('.').at(-1)), wert, zeilen: lang ? Math.min(8, Math.ceil(String(wert).length / 38)) : 0, aendern: (w) => aendere(`Text „${w.slice(0, 20)}“`, (d) => { const r = aufloesen(schluessel); setze(r.ziel, r.pfad, w); }, { zusammen: 't:' + schluessel }), hilfe: vars ? `Platzhalter ${[...new Set(vars)].join(' ')} bitte stehen lassen, sie werden automatisch ersetzt.` : '', attrs: autofokus ? { 'data-autofokus': '' } : {} });
  if (art === 'text' && Z.ui.sprache !== 'de') { const de = hole(Z.daten.texte.de, pfad); if (de) el.append(h('p.feld__hilfe.feld__original', { html: `<span class="sprachkuerzel">DE</span> ${esc(de)}` })); }
  return el;
}
function inspektorText(schluessel) {
  if (schluessel.startsWith('cfg:betrieb.oeffnungszeiten')) return panel('Öffnungszeiten', [hinweis('Öffnungszeiten stehen unter „Betrieb“ und werden überall gleich angezeigt.'), knopf('Zu den Öffnungszeiten', { icon: 'betrieb', onclick: () => emit('bereich', 'betrieb') })], { aktionen: [zurueckKnopf()] });
  const { art, pfad } = aufloesen(schluessel);
  const kopf = etikett({ art: 'text', schluessel });
  const inhalt = [textFeldFuer(schluessel, { autofokus: true })];
  if (art === 'cfg' && pfad.startsWith('betrieb.')) inhalt.push(hinweis('Diese Angabe gilt überall auf der Website. Alle Betriebsdaten stehen unter „Betrieb“.'), knopf('Alle Betriebsdaten', { icon: 'betrieb', klein: true, art: 'leise', onclick: () => emit('bereich', 'betrieb') }));
  if (art === 'text') {
    inhalt.push(h('p.hinweis', { html: `Sprache: <strong>${sprachName(Z.ui.sprache)}</strong> · Schlüssel <code>${esc(schluessel)}</code>` }));
    const andere = ['de', 'tr', 'en'].filter((l) => l !== Z.ui.sprache && typeof hole(Z.daten.texte[l], schluessel) === 'string');
    if (andere.length) inhalt.push(gruppe('Andere Sprachen', ...andere.map((l) => textFeld({ id: fid(`ue-${l}-${schluessel}`), label: sprachName(l), zusatz: l === 'de' ? 'Hauptsprache' : Z.daten.cfg.sprachen?.[l]?.freigegeben ? 'freigegeben' : 'Entwurf, nicht live', wert: hole(Z.daten.texte[l], schluessel), zeilen: String(hole(Z.daten.texte[l], schluessel)).length > 70 ? 3 : 0, aendern: (w) => aendere(`Übersetzung ${l.toUpperCase()}`, (d) => setze(d.texte[l], schluessel, w), { zusammen: `ue:${l}:${schluessel}` }) }))));
    const ns = schluessel.split('.')[0];
    const ab = Object.entries(RAUM).find(([, r]) => r.some((x) => schluessel.startsWith(x)))?.[0];
    if (ab) inhalt.push(knopf(`Alle Texte: ${NAMEN[ab]}`, { icon: 'liste', klein: true, art: 'leise', onclick: () => emit('auswahl', { art: 'abschnitt', id: ab }) }));
    else if (ns === 'fahrzeug') inhalt.push(hinweis('Dieser Text steht auf allen Fahrzeugseiten gleich.'));
  }
  return panel(kopf, inhalt, { aktionen: [zurueckKnopf()] });
}

// ---------- Bilder ----------
export function bildZiel(schluessel) {
  const { art, ziel, pfad, id } = aufloesen(schluessel);
  const roh = hole(ziel, pfad);
  const obj = typeof roh === 'object' && roh ? roh : null;
  const src = obj ? obj.src : roh;
  const istHeld = schluessel === 'cfg:bilder.held';
  const schritt = schluessel.match(/^cfg:bilder\.schritte\.(\d+)$/);
  const altPfad = istHeld ? 'held.auto_alt' : schritt ? `leistungen.schritte.${schritt[1]}.alt` : null;
  return {
    src, art, id,
    alt: altPfad ? hole(Z.daten.texte[Z.ui.sprache], altPfad) : obj?.alt,
    fokus: obj?.fokus || '50% 50%',
    stufen: istHeld ? STUFEN.hero : schritt ? [480] : pfad.endsWith('poster') ? STUFEN.klein : STUFEN.foto,
    basis: art === 'car' ? `assets/fahrzeuge/${id}/` : 'assets/bilder/',
    setzeAlt: (d, w) => { if (altPfad) setze(d.texte[Z.ui.sprache], altPfad, w); else { const r = aufloesen(schluessel); hole(r.ziel, r.pfad).alt = w; } },
    setzeSrc: (d, neu, masse) => { const r = aufloesen(schluessel); const o = hole(r.ziel, r.pfad); if (typeof o === 'object' && o) { o.src = neu; delete o.thumb; if (istHeld) o.punkte = false; } else setze(r.ziel, r.pfad, neu); },
    setzeFokus: (d, w) => { const r = aufloesen(schluessel); const o = hole(r.ziel, r.pfad); if (typeof o === 'object' && o) o.fokus = w; },
    hatFokus: !!obj,
  };
}
export const bildUrl = (src) => Z.urls.get(src) || (src ? WURZEL + src : '');
export function bildMasse(datei) { return new Promise((ok) => { const u = URL.createObjectURL(datei); const i = new Image(); i.onload = () => { ok({ w: i.naturalWidth, h: i.naturalHeight }); URL.revokeObjectURL(u); }; i.onerror = () => ok(null); i.src = u; }); }
export function zuschnittFuer(m, verh) { if (!m) return null; const v = m.w / m.h; if (Math.abs(v - verh) < 0.01) return null; return v > verh ? { x: (1 - verh / v) / 2, y: 0, b: verh / v, h: 1 } : { x: 0, y: (1 - v / verh) / 2, b: 1, h: v / verh }; }

export async function ersetzeBild(schluessel, datei, { zuschnitt = null } = {}) {
  if (!datei || !istBild(datei)) { toast('Das ist kein Bild. Erlaubt sind JPG, PNG, WebP und AVIF.', { art: 'fehler' }); return; }
  const z = bildZiel(schluessel);
  const name = slugify(datei.name.replace(/\.\w+$/, ''));
  const t0 = toastLaeuft('Bild wird verkleinert …');
  try {
    const r = await verarbeite(datei, { stufen: z.stufen, basisPfad: `${z.basis}${name}-${Date.now().toString(36)}`, zuschnitt });
    const ziel = r.alle.find((x) => x.w >= 1400) || r.gross;
    aendere('Bild ersetzt', (d) => z.setzeSrc(d, ziel.pfad, { w: ziel.w, h: ziel.h }));
    t0(); toast(`Bild ersetzt · ${r.alle.length} Größen als WebP, zusammen ${Math.round(r.alle.reduce((s, x) => s + x.groesse, 0) / 1024)} KB`, { aktion: { text: 'Rückgängig', tun: () => emit('rueck') } });
    if (!z.alt) setTimeout(() => document.getElementById(fid('alt-' + schluessel))?.focus(), 60);
  } catch (e) { t0(); toast('Das Bild konnte nicht gelesen werden. Bitte als JPG oder PNG versuchen.', { art: 'fehler' }); }
}
function toastLaeuft(text) { toast(text, { art: 'info', dauer: 60000 }); const t = document.querySelector('#toasts .toast:last-child'); return () => t?.remove(); }

export function waehleBildDatei(schluessel) {
  const i = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/avif' });
  i.addEventListener('change', () => ersetzeBild(schluessel, i.files[0]));
  i.click();
}

function inspektorBild(schluessel) {
  const z = bildZiel(schluessel);
  const ablage = h('label.ablage.ablage--bild', { tabindex: '-1' }, h('img.ablage__vorschau', { src: bildUrl(z.src), alt: '', style: { objectPosition: z.fokus } }), h('span', { html: `${ic('hochladen')}<strong>Bild ersetzen</strong><small>hierher ziehen oder klicken</small>` }), h('input.nur-sr', { type: 'file', accept: 'image/*', onchange: (e) => ersetzeBild(schluessel, e.target.files[0]) }));
  ablageZiel(ablage, (f) => ersetzeBild(schluessel, f[0]));
  const m = Z.daten.medien.dateien[z.src];
  const info = h('p.hinweis', { text: `${z.src.split('/').pop()}${Array.isArray(m) ? ` · ${m[0]} × ${m[1]} px` : ''}${Z.blobs.has(z.src) ? ' · neu, noch nicht veröffentlicht' : ''}` });
  const inhalt = [ablage, info,
    textFeld({ id: fid('alt-' + schluessel), label: 'Bildbeschreibung', zusatz: 'für Screenreader und Google', wert: z.alt, zeilen: 2, aendern: (w) => aendere('Bildbeschreibung', (d) => z.setzeAlt(d, w), { zusammen: 'alt:' + schluessel }), fehler: z.alt ? '' : 'Bitte kurz beschreiben, was zu sehen ist.' }),
  ];
  if (z.hatFokus) inhalt.push(h('div.knopfzeile', {}, knopf('Fokuspunkt setzen', { icon: 'fokus', klein: true, art: 'leise', onclick: () => fokusDialog(schluessel) })), hinweis('Der Fokuspunkt bleibt sichtbar, wenn das Bild auf schmalen Bildschirmen beschnitten wird.'));
  if (z.art === 'car') inhalt.push(knopf('Fahrzeug öffnen', { icon: 'auto', klein: true, art: 'leise', onclick: () => emit('auto-oeffnen', z.id) }));
  return panel(etikett({ art: 'bild', schluessel }), inhalt, { aktionen: [zurueckKnopf()] });
}
export function ablageZiel(el, fn) {
  el.addEventListener('dragover', (e) => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); el.dataset.ueber = ''; } });
  el.addEventListener('dragleave', () => delete el.dataset.ueber);
  el.addEventListener('drop', (e) => { e.preventDefault(); delete el.dataset.ueber; const f = [...e.dataTransfer.files].filter(istBild); if (f.length) fn(f); });
}
export function fokusDialog(schluessel) {
  const z = bildZiel(schluessel);
  let [fx, fy] = z.fokus.split(' ').map((x) => parseFloat(x));
  const punkt = h('span.fokuspunkt', { style: { left: fx + '%', top: fy + '%' } });
  const img = h('img', { src: bildUrl(z.src), alt: z.alt || '', draggable: false });
  const flaeche = h('div.studio__flaeche.fokus__flaeche', { tabindex: '0', role: 'application', 'aria-label': 'Fokuspunkt: klicken oder mit Pfeiltasten verschieben' }, img, punkt);
  const setze = (x, y) => { fx = Math.round(Math.max(0, Math.min(100, x))); fy = Math.round(Math.max(0, Math.min(100, y))); punkt.style.left = fx + '%'; punkt.style.top = fy + '%'; };
  flaeche.addEventListener('pointerdown', (e) => { const r = img.getBoundingClientRect(); const mv = (ev) => setze(((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100); mv(e); flaeche.setPointerCapture(e.pointerId); flaeche.onpointermove = mv; flaeche.onpointerup = () => { flaeche.onpointermove = null; }; });
  flaeche.addEventListener('keydown', (e) => { const s = e.shiftKey ? 10 : 2; const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key]; if (d) { e.preventDefault(); setze(fx + d[0], fy + d[1]); } });
  dialog({ titel: 'Fokuspunkt', breit: true, inhalt: h('div.fokus', {}, flaeche, hinweis('Klicken Sie auf den wichtigsten Punkt im Bild, z. B. die Front des Autos.')), fuss: [knopf('Abbrechen', { art: 'leise', onclick: schliesseDialog }), knopf('Übernehmen', { art: 'primaer', onclick: () => { aendere('Fokuspunkt', (d) => z.setzeFokus(d, `${fx}% ${fy}%`)); schliesseDialog(); toast('Fokuspunkt gesetzt'); } })] });
}

// ---------- Abschnitt ----------
function blaetter(wurzel, pfad, raus) {
  const v = hole(wurzel, pfad);
  if (typeof v === 'string') { raus.push(pfad); return; }
  if (Array.isArray(v)) v.forEach((_, i) => blaetter(wurzel, `${pfad}.${i}`, raus));
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) if (!['icon', 'bild', 'format'].includes(k)) blaetter(wurzel, `${pfad}.${k}`, raus);
}
function inspektorAbschnitt(id) {
  const tx = Z.daten.texte[Z.ui.sprache];
  const cfg = Z.daten.cfg;
  const inhalt = [];
  const beweglich = ['werte', 'bestand', 'leistungen', 'kontakt'].includes(id);
  const startseite = !Z.ui.seite.includes('fahrzeug/') && Z.ui.seite.endsWith('index.html');
  if (beweglich && startseite) {
    const a = alleAbschnitte(cfg).find((x) => x.id === id);
    inhalt.push(gruppe(null,
      schalterFeld({ id: fid('sicht-' + id), label: 'Sichtbar', an: a?.sichtbar !== false, aendern: (v) => schalteAbschnitt(id, v) }),
      auswahlFeld({ id: fid('ieff-' + id), label: 'Effekt beim Erscheinen', wert: cfg.animation?.effekte?.[id] || 'von-unten', optionen: EFFEKTE, aendern: (w) => aendere(`Effekt ${NAMEN[id]}`, (d) => { d.cfg.animation.effekte = { ...(d.cfg.animation.effekte || {}), [id]: w }; }) }),
      h('div.knopfzeile', {}, knopf('Nach oben', { icon: 'hoch', klein: true, art: 'leise', onclick: () => verschiebeAbschnitt(id, -1) }), knopf('Nach unten', { icon: 'runter', klein: true, art: 'leise', onclick: () => verschiebeAbschnitt(id, 1) }))));
  }
  if (id === 'held') inhalt.push(gruppe('Bild', h('div.knopfzeile', {}, knopf('Hero-Bild ersetzen', { icon: 'bild', klein: true, art: 'leise', onclick: () => waehleBildDatei('cfg:bilder.held') }), knopf('Fokuspunkt', { icon: 'fokus', klein: true, art: 'leise', onclick: () => fokusDialog('cfg:bilder.held') }))));
  if (id === 'bestand') inhalt.push(gruppe('Fahrzeuge', hinweis('Die Karten entstehen aus dem Bestand.'), knopf('Fahrzeuge verwalten', { icon: 'auto', klein: true, art: 'leise', onclick: () => emit('bereich', 'fahrzeuge') })));
  if (id === 'impressum' || id === 'datenschutz') inhalt.push(gruppe(null, hinweis('Rechtstexte bitte prüfen lassen. Platzhalter wie {telefon_link} werden aus „Betrieb“ ersetzt.'), knopf('Offene Angaben', { icon: 'betrieb', klein: true, art: 'leise', onclick: () => emit('springe', { bereich: 'betrieb', abschnitt: 'offen' }) })));
  const pfade = [];
  for (const r of RAUM[id] || []) blaetter(tx, r, pfade);
  if (pfade.length) {
    const felder = [];
    let gr = '';
    for (const p of pfade) {
      const teile = p.split('.');
      const zahl = teile.findIndex((x) => /^\d+$/.test(x));
      const g = zahl > 0 ? `${schluesselName(teile[zahl - 1])} ${Number(teile[zahl]) + 1}` : '';
      if (g !== gr) { if (g) felder.push(h('p.unterkopf', { text: g })); gr = g; }
      felder.push(textFeldFuer(p, { label: schluesselName(teile.at(-1)) }));
    }
    inhalt.push(gruppe(`Texte · ${sprachName(Z.ui.sprache)}`, ...felder));
  }
  return panel(`Abschnitt · ${NAMEN[id] || id}`, inhalt, { aktionen: [zurueckKnopf()] });
}
