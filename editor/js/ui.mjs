// Kleine UI-Bausteine: Elemente bauen, Icons, Toasts, Tooltips, Dialoge, Menüs.
// Icons: eigener Satz, 24er Raster, 1,5 px Linie, runde Enden.
const PFADE = {
  seiten: 'M4 6.5 12 3l8 3.5-8 3.5L4 6.5Z M4 11.5l8 3.5 8-3.5 M4 16.5l8 3.5 8-3.5',
  auto: 'M3.5 15.5v-3l2-4.2A2 2 0 0 1 7.3 7h9.4a2 2 0 0 1 1.8 1.3l2 4.2v3a1 1 0 0 1-1 1h-1 M6.5 16.5H17 M3.5 12.5h17 M7.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M16.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  design: 'M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.9 1.8-1.8 0-1.4-1.3-1.7-1.3-3 0-1.1.9-1.9 2-1.9h1.7a3.3 3.3 0 0 0 3.3-3.4C19.5 6.6 16.1 3.5 12 3.5Z M7.6 11.2h.01 M9.6 7.6h.01 M14 7h.01 M16.8 10h.01',
  animation: 'M4 12c2.5 0 2.5-5 5-5s2.5 10 5 10 2.5-5 5-5 M19 5.5v3 M17.5 7h3',
  betrieb: 'M4 9.5 5.5 4.5h13L20 9.5 M4 9.5v10h16v-10 M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.1 2.5 2.6 2.5S20 10.9 20 9.5 M10 19.5v-4.5h4v4.5',
  seo: 'M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z M20.5 20.5l-4.2-4.2 M8 11h6 M11 8v6',
  sprachen: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M3.5 12h17 M12 3.5c2.4 2.3 3.5 5.2 3.5 8.5s-1.1 6.2-3.5 8.5c-2.4-2.3-3.5-5.2-3.5-8.5S9.6 5.8 12 3.5Z',
  versionen: 'M3.5 12a8.5 8.5 0 1 0 2.6-6.1 M3.5 4.5v4h4 M12 7.5V12l3 2',
  schluessel: 'M14.5 13.5a5 5 0 1 0-4.9-6.1 M13.4 9.5 4 18.9V20.5h2.5v-1.6h1.7v-1.7h1.6l1.6-1.6 M16.2 7.8h.01',
  rueck: 'M9 14 4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  vor: 'M15 14l5-5-5-5 M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  handy: 'M7.5 3.5h9a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z M11 17.5h2',
  tablet: 'M5.5 3.5h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z M11 17.5h2',
  desktop: 'M3.5 5.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-10Z M9 20.5h6 M12 16.5v4',
  auge: 'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  augeZu: 'M4 4l16 16 M10.6 6.1c.5-.1.9-.1 1.4-.1 6 0 9.5 6 9.5 6a17.4 17.4 0 0 1-2.6 3.3 M6.5 7.3C4 9 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1 M10 10.2a2.5 2.5 0 0 0 3.6 3.5',
  wolke: 'M7 18.5a4.5 4.5 0 0 1-.6-9 5.5 5.5 0 0 1 10.6 1.5A3.75 3.75 0 0 1 17 18.5H7Z M12 15.5v-5 M9.5 13 12 10.5l2.5 2.5',
  hilfe: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.5 M12 16.6h.01',
  runter: 'M7 10l5 5 5-5',
  hoch: 'M7 14l5-5 5 5',
  rechts: 'M10 7l5 5-5 5',
  play: 'M8 5.5v13l10-6.5-10-6.5Z',
  plus: 'M12 5v14 M5 12h14',
  kopie: 'M8.5 8.5h10v11h-10z M15.5 8.5v-3h-10v11h3',
  muell: 'M4.5 7h15 M9.5 7V4.5h5V7 M6.5 7l.8 12.5h9.4L17.5 7 M10.5 10.5v6 M13.5 10.5v6',
  griff: 'M9 6.5h.01 M15 6.5h.01 M9 12h.01 M15 12h.01 M9 17.5h.01 M15 17.5h.01',
  bild: 'M4.5 5.5h15v13h-15z M4.5 15.5l4-4 3.5 3.5 2.5-2.5 5 5 M15.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  text: 'M5 6.5V5h14v1.5 M12 5v14 M9.5 19h5',
  stift: 'M14.5 5.5l4 4L9 19H5v-4l9.5-9.5Z M12.5 7.5l4 4',
  extern: 'M13.5 4.5h6v6 M19.5 4.5 11 13 M17.5 13.5v5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1h5',
  zu: 'M6 6l12 12 M18 6 6 18',
  suche: 'M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z M20.5 20.5l-4.2-4.2',
  haken: 'M5 12.5l4.5 4.5L19 7.5',
  warn: 'M12 4 2.8 19.5h18.4L12 4Z M12 10v4.5 M12 17h.01',
  fehler: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M9 9l6 6 M15 9l-6 6',
  info: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M12 11v5 M12 8h.01',
  ziel: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M12 12h.01',
  hochladen: 'M12 15.5V4.5 M7.5 9 12 4.5 16.5 9 M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15',
  zip: 'M5.5 3.5h9l4 4v13h-13z M14.5 3.5v4h4 M10 6h1.5 M10 9h1.5 M10 12h1.5 M9.5 15.5h2.5v3h-2.5z',
  dreh: 'M3.5 12a8.5 4.5 0 1 0 17 0 M17 16l3.5.5-.5 3.5',
  wuerfel: 'M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7L12 3.5Z M4.5 7.7 12 12l7.5-4.3 M12 12v8.5',
  tastatur: 'M3.5 6.5h17v11h-17z M7 10h.01 M10 10h.01 M13 10h.01 M16 10h.01 M8 14h8',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  stern: 'M12 3.5l2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.3-5.3 3.3 1.4-6-4.6-4 6.1-.5L12 3.5Z',
  fokus: 'M4.5 9V4.5H9 M15 4.5h4.5V9 M19.5 15v4.5H15 M9 19.5H4.5V15 M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  zuschnitt: 'M7 3.5v13.5h13.5 M3.5 7H17v13.5',
  sicht: 'M12 3.5v4 M12 16.5v4 M3.5 12h4 M16.5 12h4',
  liste: 'M8.5 7h11 M8.5 12h11 M8.5 17h11 M4.5 7h.01 M4.5 12h.01 M4.5 17h.01',
  menue: 'M4.5 7h15 M4.5 12h15 M4.5 17h15',
};
export function iconSprite() {
  const s = Object.entries(PFADE).map(([n, d]) => `<symbol id="i-${n}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`).join('');
  const div = document.createElement('div');
  div.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${s}</svg>`;
  document.body.prepend(div.firstChild);
}
export const ic = (name, klasse = '') => `<svg class="i ${klasse}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// h('button.knopf', { onclick }, 'Text') – minimaler Elementbauer
export function h(sel, attrs = {}, ...kinder) {
  const [tag, ...klassen] = sel.split('.');
  const el = document.createElement(tag || 'div');
  if (klassen.length) el.className = klassen.join(' ');
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k in el && typeof v !== 'string' && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kinder.flat()) if (k !== null && k !== undefined && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
}
export const $ = (s, w = document) => w.querySelector(s);
export const $$ = (s, w = document) => [...w.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- Toasts ----------
export function toast(text, { art = 'gut', aktion = null, dauer = 3200 } = {}) {
  const box = $('#toasts');
  const t = h('div.toast', { 'data-art': art, role: art === 'fehler' ? 'alert' : 'status' });
  t.innerHTML = `${ic(art === 'fehler' ? 'fehler' : art === 'info' ? 'info' : 'haken')}<span>${esc(text)}</span>`;
  if (aktion) t.append(h('button.knopf.knopf--leise', { type: 'button', onclick: () => { aktion.tun(); weg(); } }, aktion.text));
  const weg = () => { t.dataset.weg = ''; setTimeout(() => t.remove(), 220); };
  box.append(t);
  setTimeout(weg, aktion ? Math.max(dauer, 6000) : dauer);
  while (box.children.length > 3) box.firstChild.remove();
}

// ---------- Tooltips mit Tastenkürzel (data-tipp, data-kuerzel) ----------
export function tooltips() {
  const tipp = $('#tipp');
  let ziel = null, timer = 0;
  const zeige = (el) => {
    const text = el.dataset.tipp || el.getAttribute('aria-label') || '';
    if (!text) return;
    tipp.innerHTML = `<span>${esc(text)}</span>${el.dataset.kuerzel ? el.dataset.kuerzel.split(' ').map((k) => `<kbd>${esc(k)}</kbd>`).join('') : ''}`;
    tipp.hidden = false;
    const r = el.getBoundingClientRect(), t = tipp.getBoundingClientRect();
    let x = r.left + r.width / 2 - t.width / 2, y = r.bottom + 8;
    if (y + t.height > innerHeight - 8) y = r.top - t.height - 8;
    tipp.style.left = `${Math.max(8, Math.min(innerWidth - t.width - 8, x))}px`; tipp.style.top = `${y}px`;
  };
  const weg = () => { clearTimeout(timer); tipp.hidden = true; ziel = null; };
  document.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-tipp]'); if (el === ziel) return; weg(); if (el && matchMedia('(hover: hover)').matches) { ziel = el; timer = setTimeout(() => zeige(el), 450); } });
  document.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tipp]'); weg(); if (el && el.matches(':focus-visible')) { ziel = el; zeige(el); } });
  document.addEventListener('focusout', weg);
  document.addEventListener('pointerdown', weg);
  for (const el of $$('[data-tipp]')) if (!el.getAttribute('aria-label') && !el.querySelector('.nur-sr') && !el.textContent.trim()) el.setAttribute('aria-label', el.dataset.tipp);
}

// ---------- Schicht: Dialog ----------
let offenerDialog = null;
export function dialog({ titel, inhalt, fuss = null, breit = false, klasse = '', beimSchliessen = null, ohneKopf = false }) {
  schliesseDialog();
  const schicht = $('#schicht');
  const grund = h('div.schicht__grund', { onclick: () => schliesseDialog() });
  const box = h(`div.dialog${breit ? '.dialog--breit' : ''}${klasse ? '.' + klasse : ''}`, { role: 'dialog', 'aria-modal': 'true', 'aria-label': titel });
  if (!ohneKopf) box.append(h('div.dialog__kopf', {}, h('h2', { text: titel }), h('button.ik', { type: 'button', 'aria-label': 'Schließen', 'data-tipp': 'Schließen', 'data-kuerzel': 'Esc', onclick: () => schliesseDialog(), html: ic('zu') })));
  const innen = h('div.dialog__inhalt');
  if (inhalt) innen.append(inhalt);
  box.append(innen);
  if (fuss) box.append(h('div.dialog__fuss', {}, fuss));
  schicht.replaceChildren(grund, box);
  schicht.dataset.offen = '';
  const vorher = document.activeElement;
  offenerDialog = { box, innen, vorher, beimSchliessen };
  setTimeout(() => (box.querySelector('[autofocus], input, select, textarea, button:not(.ik)') || box.querySelector('button'))?.focus(), 30);
  return offenerDialog;
}
export function schliesseDialog() {
  if (!offenerDialog) return;
  const d = offenerDialog; offenerDialog = null;
  delete $('#schicht').dataset.offen;
  $('#schicht').replaceChildren();
  d.beimSchliessen?.();
  d.vorher?.focus?.();
}
export const dialogOffen = () => !!offenerDialog;
document.addEventListener('keydown', (e) => {
  if (!offenerDialog) return;
  if (e.key === 'Escape') { e.preventDefault(); schliesseDialog(); }
  if (e.key === 'Tab') {
    const f = [...offenerDialog.box.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});

// ---------- Menü (Seitenwahl) ----------
export function menue(anker, gruppen, waehle) {
  $$('.menue').forEach((m) => m.remove());
  const r = anker.getBoundingClientRect();
  const m = h('div.menue', { role: 'listbox', 'aria-label': anker.getAttribute('aria-label') || 'Auswahl' });
  for (const g of gruppen) {
    if (g.titel) m.append(h('div.menue__gruppe', { role: 'presentation', text: g.titel }));
    for (const e of g.eintraege) m.append(h('button', { type: 'button', role: 'option', 'aria-selected': e.aktiv ? 'true' : 'false', onclick: () => { schliesse(); waehle(e.wert); }, html: `${e.icon ? ic(e.icon, 'i--k') : ''}<span>${esc(e.text)}</span>` }));
  }
  m.style.left = `${Math.min(r.left, innerWidth - 280)}px`; m.style.top = `${r.bottom + 6}px`;
  document.body.append(m);
  anker.setAttribute('aria-expanded', 'true');
  const schliesse = () => { m.remove(); anker.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', aussen, true); document.removeEventListener('keydown', taste, true); };
  const aussen = (e) => { if (!m.contains(e.target) && e.target !== anker && !anker.contains(e.target)) schliesse(); };
  const taste = (e) => {
    const b = [...m.querySelectorAll('button')]; const i = b.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); schliesse(); anker.focus(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); b[(i + 1) % b.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); b[(i - 1 + b.length) % b.length].focus(); }
  };
  setTimeout(() => { document.addEventListener('pointerdown', aussen, true); document.addEventListener('keydown', taste, true); (m.querySelector('[aria-selected="true"]') || m.querySelector('button'))?.focus(); });
}

// ---------- Felder ----------
export function feld({ label, hilfe, fehler, kind, zusatz }) {
  const id = kind.id || `f${Math.random().toString(36).slice(2, 8)}`;
  kind.id = id;
  const wrap = h('div.feld', fehler ? { 'data-fehler': '' } : {});
  wrap.append(h('label.feld__label', { for: id, html: `<span>${esc(label)}</span>${zusatz ? `<small>${esc(zusatz)}</small>` : ''}` }), kind);
  if (fehler) { const fid = id + '-f'; kind.setAttribute('aria-describedby', fid); kind.setAttribute('aria-invalid', 'true'); wrap.append(h('p.feld__fehler', { id: fid, text: fehler })); }
  else if (hilfe) { const hid = id + '-h'; kind.setAttribute('aria-describedby', hid); wrap.append(h('p.feld__hilfe', { id: hid, text: hilfe })); }
  return wrap;
}
export function schalter({ label, klein, an, aendern }) {
  const input = h('input', { type: 'checkbox', checked: !!an, onchange: () => aendern(input.checked) });
  return h('label.schalter', {}, h('span.schalter__text', { html: `<span>${esc(label)}</span>${klein ? `<small>${esc(klein)}</small>` : ''}` }), input, h('span.schalter__bahn', { 'aria-hidden': 'true' }));
}
export function segment({ label, wert, optionen, aendern }) {
  const name = `s${Math.random().toString(36).slice(2, 8)}`;
  const box = h('div.segment', { role: 'radiogroup', 'aria-label': label });
  for (const [w, t] of optionen) box.append(h('label', {}, h('input', { type: 'radio', name, value: w, checked: w === wert, onchange: () => aendern(w) }), t));
  return box;
}
export function regler({ label, wert, min, max, schritt, format, aendern }) {
  const input = h('input', { type: 'range', min, max, step: schritt, value: wert, 'aria-label': label });
  const out = h('output', { text: format(wert) });
  const anteil = () => input.style.setProperty('--anteil', `${((input.value - min) / (max - min)) * 100}%`);
  anteil();
  input.addEventListener('input', () => { out.textContent = format(Number(input.value)); anteil(); aendern(Number(input.value), false); });
  input.addEventListener('change', () => aendern(Number(input.value), true));
  return h('div.feld', {}, h('span.feld__label', { text: label }), h('div.regler', {}, input, out));
}
