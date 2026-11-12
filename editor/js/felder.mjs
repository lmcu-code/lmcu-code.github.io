// Feld-Bausteine, die an Daten gebunden sind. Stabile ids, damit der Fokus nach dem Neuzeichnen zurückkommt.
import { h, ic, esc } from './ui.mjs';

export const fid = (s) => 'f-' + String(s).replace(/[^a-zA-Z0-9_-]+/g, '-');

export function textFeld({ id, label, wert, aendern, hilfe, fehler, warnung, zeilen = 0, typ = 'text', platz, einheit, zusatz, max, attrs = {}, beimVerlassen }) {
  const el = zeilen ? h('textarea', { id, rows: zeilen, placeholder: platz || null, ...attrs }) : h('input', { id, type: typ, placeholder: platz || null, autocomplete: 'off', ...attrs });
  el.value = wert ?? '';
  const zaehler = max ? h('small', { text: `${String(wert ?? '').length} / ${max}` }) : null;
  el.addEventListener('input', () => { if (zaehler) { zaehler.textContent = `${el.value.length} / ${max}`; zaehler.dataset.ueber = el.value.length > max ? '' : null; if (el.value.length <= max) delete zaehler.dataset.ueber; } aendern(el.value); });
  if (beimVerlassen) el.addEventListener('change', () => beimVerlassen(el.value));
  const wrap = h('div.feld', fehler ? { 'data-fehler': '' } : {});
  const lab = h('label.feld__label', { for: id }, h('span', { text: label }));
  if (zusatz) lab.append(h('small', { text: zusatz }));
  if (zaehler) lab.append(zaehler);
  wrap.append(lab, einheit ? h('div.mit-einheit', {}, el, h('span.einheit', { text: einheit, 'aria-hidden': 'true' })) : el);
  if (fehler) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id + '-f'); wrap.append(h('p.feld__fehler', { id: id + '-f', html: `${ic('warn', 'i--k')}<span>${esc(fehler)}</span>` })); }
  else if (warnung) { el.setAttribute('aria-describedby', id + '-h'); wrap.append(h('p.feld__hilfe.feld__warnung', { id: id + '-h', html: `${ic('info', 'i--k')}<span>${esc(warnung)}</span>` })); }
  else if (hilfe) { el.setAttribute('aria-describedby', id + '-h'); wrap.append(h('p.feld__hilfe', { id: id + '-h', text: hilfe })); }
  return wrap;
}

export function auswahlFeld({ id, label, wert, optionen, aendern, hilfe, fehler }) {
  const el = h('select', { id });
  for (const [w, t] of optionen) el.append(h('option', { value: w, text: t }));
  el.value = wert ?? '';
  el.addEventListener('change', () => aendern(el.value));
  const wrap = h('div.feld', fehler ? { 'data-fehler': '' } : {});
  wrap.append(h('label.feld__label', { for: id }, h('span', { text: label })), el);
  if (fehler) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id + '-f'); wrap.append(h('p.feld__fehler', { id: id + '-f', html: `${ic('warn', 'i--k')}<span>${esc(fehler)}</span>` })); }
  else if (hilfe) { el.setAttribute('aria-describedby', id + '-h'); wrap.append(h('p.feld__hilfe', { id: id + '-h', text: hilfe })); }
  return wrap;
}

export function schalterFeld({ id, label, klein, an, aendern, aus = false }) {
  const input = h('input', { id, type: 'checkbox', role: 'switch', checked: !!an, disabled: aus, onchange: () => aendern(input.checked) });
  return h('label.schalter', {}, h('span.schalter__text', { html: `<span>${esc(label)}</span>${klein ? `<small>${esc(klein)}</small>` : ''}` }), input, h('span.schalter__bahn', { 'aria-hidden': 'true' }));
}

export function segmentFeld({ id, label, wert, optionen, aendern, sichtbar = true }) {
  const box = h('div.segment', { role: 'radiogroup', 'aria-label': label, id });
  for (const [w, t] of optionen) box.append(h('label', {}, h('input', { type: 'radio', name: id, value: w, checked: w === wert, onchange: () => aendern(w) }), t));
  return sichtbar ? h('div.feld', {}, h('span.feld__label', { text: label }), box) : box;
}

export function reglerFeld({ id, label, wert, min, max, schritt, format, aendern, hilfe }) {
  const input = h('input', { id, type: 'range', min, max, step: schritt, value: wert });
  const out = h('output', { for: id, text: format(wert) });
  const anteil = () => input.style.setProperty('--anteil', `${((input.value - min) / (max - min)) * 100}%`);
  anteil();
  input.addEventListener('input', () => { out.textContent = format(Number(input.value)); anteil(); aendern(Number(input.value)); });
  const wrap = h('div.feld', {}, h('div.feld__label', {}, h('label', { for: id, text: label }), out), h('div.regler', {}, input));
  if (hilfe) { input.setAttribute('aria-describedby', id + '-h'); wrap.append(h('p.feld__hilfe', { id: id + '-h', text: hilfe })); }
  return wrap;
}

export function farbFeld({ id, label, wert, aendern }) {
  const farbe = h('input', { type: 'color', value: wert, 'aria-label': `${label}, Farbwähler`, id: id + '-w' });
  const text = h('input', { id, type: 'text', value: wert, spellcheck: 'false', maxlength: 7, autocomplete: 'off' });
  farbe.addEventListener('input', () => { text.value = farbe.value; aendern(farbe.value); });
  text.addEventListener('input', () => { const v = text.value.trim(); if (/^#[0-9a-f]{6}$/i.test(v)) { farbe.value = v.toLowerCase(); aendern(v.toLowerCase()); } });
  return h('div.feld', {}, h('label.feld__label', { for: id }, h('span', { text: label })), h('div.farbe', {}, farbe, text));
}

export const panel = (titel, inhalt, { aktionen = [], fuss = null, untertitel = '', vorher = null } = {}) => {
  const p = h('section.panel', { 'aria-labelledby': fid('p-' + titel) });
  const kopf = h('div.panel__kopf', {}, h('h2', { id: fid('p-' + titel), text: titel }));
  if (untertitel) kopf.append(h('span.marke.marke--leise', { text: untertitel }));
  if (aktionen.length) kopf.append(h('div.rechts-weg', {}, ...aktionen));
  p.append(kopf);
  if (vorher) p.append(vorher);
  p.append(h('div.panel__inhalt', {}, ...[].concat(inhalt).filter(Boolean)));
  if (fuss) p.append(h('div.panel__fuss', {}, fuss));
  return p;
};
export const gruppe = (titel, ...kinder) => h('div.gruppe', {}, titel ? h('h3.gruppe__titel', { text: titel }) : null, ...kinder.flat().filter(Boolean));
export const hinweis = (text, art = '') => h(`p.hinweis${art ? '.hinweis--' + art : ''}`, { html: text });
export const leer = (icon, titel, text, ...kn) => h('div.leer', {}, h('span', { html: ic(icon) }), h('strong', { text: titel }), h('p', { text }), ...kn);
export const knopf = (text, { icon, art = '', klein = false, tipp, kuerzel, onclick, id, attrs = {} } = {}) => h(`button.knopf${art ? '.knopf--' + art : ''}${klein ? '.klein' : ''}`, { type: 'button', id: id || null, 'data-tipp': tipp || null, 'data-kuerzel': kuerzel || null, onclick, html: `${icon ? ic(icon) : ''}<span>${esc(text)}</span>`, ...attrs });
export const ikon = (icon, tipp, onclick, { kuerzel, klein = true, attrs = {} } = {}) => h(`button.ik${klein ? '.ik--klein' : ''}`, { type: 'button', 'aria-label': tipp, 'data-tipp': tipp, 'data-kuerzel': kuerzel || null, onclick, html: ic(icon), ...attrs });

// Ziehen und Ablegen in Listen (Maus, Touch über Pointer-Events) mit Einfügelinie; Tastatur: Alt + Pfeil.
export function ziehbar(liste, { griff = '.eintrag__griff', verschieben, raster = false }) {
  let quelle = null, ziel = null, unten = false;
  const eintraege = () => [...liste.children].filter((x) => x.dataset.index !== undefined);
  const leeren = () => eintraege().forEach((x) => x.classList.remove('zieh-ziel', 'zieh-ziel--unten'));
  liste.addEventListener('pointerdown', (e) => {
    const g = e.target.closest(griff); if (!g) return;
    quelle = g.closest('[data-index]'); if (!quelle) return;
    e.preventDefault(); g.setPointerCapture(e.pointerId);
    quelle.classList.add('wird-gezogen');
    const bewegen = (ev) => {
      leeren(); ziel = null;
      for (const el of eintraege()) {
        const r = el.getBoundingClientRect();
        if (ev.clientY >= r.top && ev.clientY <= r.bottom && (!raster || (ev.clientX >= r.left && ev.clientX <= r.right))) { ziel = el; unten = raster ? ev.clientX > r.left + r.width / 2 : ev.clientY > r.top + r.height / 2; break; }
      }
      if (ziel && ziel !== quelle) ziel.classList.add('zieh-ziel', ...(unten ? ['zieh-ziel--unten'] : []));
    };
    const ende = () => {
      g.removeEventListener('pointermove', bewegen); g.removeEventListener('pointerup', ende); g.removeEventListener('pointercancel', ende);
      quelle.classList.remove('wird-gezogen'); leeren();
      if (ziel && ziel !== quelle) {
        const von = Number(quelle.dataset.index); let nach = Number(ziel.dataset.index) + (unten ? 1 : 0);
        if (nach > von) nach -= 1;
        if (nach !== von) verschieben(von, nach);
      }
      quelle = null; ziel = null;
    };
    g.addEventListener('pointermove', bewegen); g.addEventListener('pointerup', ende); g.addEventListener('pointercancel', ende);
  });
  liste.addEventListener('keydown', (e) => {
    if (!e.altKey || !['ArrowUp', 'ArrowDown', ...(raster ? ['ArrowLeft', 'ArrowRight'] : [])].includes(e.key)) return;
    const el = e.target.closest('[data-index]'); if (!el) return;
    e.preventDefault();
    const von = Number(el.dataset.index), nach = von + (['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 1);
    if (nach < 0 || nach >= eintraege().length) return;
    verschieben(von, nach, true);
  });
}
export const verschiebe = (arr, von, nach) => { const [x] = arr.splice(von, 1); arr.splice(nach, 0, x); return arr; };
