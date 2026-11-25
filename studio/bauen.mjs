#!/usr/bin/env node
const V = '1795641000';
// KMC Motors · Richtung A „Studio“: baut Startseite + Fahrzeugseiten aus cars.json und konfiguration.json.
//   node bauen.mjs <repo-ordner> <ausgabe-ordner>
import fs from 'node:fs';
import path from 'node:path';

const [repo, aus] = process.argv.slice(2);
const lies = (p) => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const cfg = lies('konfiguration.json');
const autos = JSON.parse(fs.readFileSync(process.argv[4] || path.join(repo, 'cars.json'), 'utf8')).cars;
const B = cfg.betrieb;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enc = encodeURIComponent;
const slug = (x) => String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const strasseLang = B.strasse.replace(/str\.\s*/i, 'straße ');
const adresseQ = enc(`${B.strasse}, ${B.plz} ${B.ort}`);
const wa = (t) => `https://wa.me/${B.whatsappLink}?text=${enc(t)}`;
const TAGE = { Monday: 'Mo', Tuesday: 'Di', Wednesday: 'Mi', Thursday: 'Do', Friday: 'Fr', Saturday: 'Sa', Sunday: 'So' };
const zeitText = (v, b) => `${v.replace(':00', '')}–${b.replace(':00', '')} Uhr`;
const oeffnung = cfg.betrieb.oeffnungszeiten.map((o) => {
  const t = o.tage.map((x) => TAGE[x]);
  const label = t.length > 2 ? `${({ Mo: 'Montag', Sa: 'Samstag' })[t[0]] || t[0]} bis ${({ Fr: 'Freitag' })[t.at(-1)] || t.at(-1)}` : ({ Sa: 'Samstag' })[t[0]] || t.join(', ');
  return { label, zeit: zeitText(o.von, o.bis) };
});
const ico = (d) => `<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="${d}"/></svg>`;
const PFEIL = ico('M2 8h11M9 4l4 4-4 4');

function rahmen({ basis, titel, beschreibung, body, robots = 'noindex, nofollow' }) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschreibung)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#0A0A0B">
<link rel="icon" href="${basis}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${basis}assets/apple-touch-icon.png">
<link rel="preload" href="${basis}assets/fonts/hanken-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${basis}assets/studio/studio.css?v=${V}">
</head>
<body>
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<div class="page">
${kopf(basis)}
${body}
${fuss(basis)}
</div>
${leiste()}
<script src="${basis}assets/studio/studio.js?v=${V}" defer></script>
</body>
</html>
`;
}

function kopf(basis) {
  const h = basis ? `${basis}index.html` : '';
  return `<header class="top">
<div class="wrap top__in">
<a class="top__logo" href="${basis || './'}"><img src="${basis}assets/logo/kmc-logo.svg" alt="KMC Motors Köln, zur Startseite" width="946" height="268"></a>
<nav class="top__nav" aria-label="Hauptnavigation"><a href="${h}#bestand">Bestand</a><a href="${h}#leistungen">Leistungen</a><a href="${h}#ablauf">Ablauf</a><a href="${h}#kontakt">Kontakt</a></nav>
<div class="top__act"><a class="top__tel" href="tel:${B.telefonLink}">${esc(B.telefon)}</a><a class="btn" href="${wa('Hallo KMC Motors, ich habe eine Frage.')}">Anfragen</a></div>
</div>
</header>`;
}

function fuss(basis) {
  return `<footer class="foot">
<div class="wrap foot__in">
<img src="${basis}assets/logo/kmc-logo.svg" alt="KMC Motors Köln" width="946" height="268">
<p>${esc(B.name)} · Inhaber ${esc(B.inhaber)} · ${esc(B.strasse)}, ${esc(B.plz)} ${esc(B.ort)}</p>
<nav class="foot__nav" aria-label="Rechtliches"><a href="${basis}impressum.html">Impressum</a><a href="${basis}datenschutz.html">Datenschutz</a><a href="${esc(B.mobilede)}">mobile.de</a></nav>
</div>
</footer>`;
}

function leiste() {
  return `<nav class="dock" aria-label="Schnellkontakt"><a href="tel:${B.telefonLink}">Anrufen</a><a href="${wa('Hallo KMC Motors, ich habe eine Frage.')}">WhatsApp</a></nav>`;
}

const istBeispiel = (a) => a.sample !== false;
const bild = (basis, src) => `${basis}${src}`;
const waAuto = (a) => wa(`Hallo KMC Motors, ich interessiere mich für den ${a.model}${istBeispiel(a) ? ' (Beispielfahrzeug)' : ''}, ${a.price}, Fahrzeug-ID ${a.id}. Wann kann ich ihn ansehen?`);
const ezJahr = (a) => a.year;

function karteOhneFoto(a) {
  const zeilen = [['Erstzulassung', a.year], ['Kilometerstand', a.km], ['Leistung', a.power], ['Kraftstoff', a.fuel], ['Getriebe', a.gearbox]].filter(([, v]) => v);
  return `<article class="car">
<a class="car__img car__img--leer" href="fahrzeug/${slug(a.id)}/" tabindex="-1" aria-hidden="true"><img src="assets/logo/kmc-zeichen-kupfer.svg" alt="" width="946" height="182"><span>Neu eingetroffen · Fotos folgen</span></a>
<p class="car__tag">${esc(a.make)} · EZ ${esc(a.year)}</p>
<h3><a href="fahrzeug/${slug(a.id)}/">${esc(a.model)}</a></h3>
<p class="car__price">${esc(a.price)}</p>
<dl class="spec">${zeilen.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<div class="car__act"><a class="btn" href="${waAuto(a)}">Anfragen</a><a class="link" href="fahrzeug/${slug(a.id)}/"><span>Datenblatt</span>${PFEIL}</a></div>
</article>`;
}

function karte(a) {
  const p = a.img ? { src: a.imgS, alt: `${a.model}, Foto aus dem Inserat` } : (a.media?.poster || a.media?.gallery?.[0] || null);
  if (!p) return karteOhneFoto(a);
  const zeilen = [['Erstzulassung', a.year], ['Kilometerstand', a.km], ['Leistung', a.power], ['Kraftstoff', a.fuel], ['Getriebe', a.gearbox]].filter(([, v]) => v);
  return `<article class="car">
<a class="car__img${a.img ? ' car__img--foto' : ''}" href="fahrzeug/${slug(a.id)}/" tabindex="-1" aria-hidden="true"><img src="${a.img ? p.src : bild('', p.src)}" alt="${esc(p.alt || a.model)}" loading="lazy"></a>
<p class="car__tag">${istBeispiel(a) ? 'Beispielfahrzeug' : `${esc(a.make)} · EZ ${esc(a.year)}`}</p>
<h3><a href="fahrzeug/${slug(a.id)}/">${esc(a.model)}</a></h3>
<p class="car__price">${esc(a.price)}</p>
<dl class="spec">${zeilen.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<div class="car__act"><a class="btn" href="${waAuto(a)}">Anfragen</a><a class="link" href="fahrzeug/${slug(a.id)}/"><span>Datenblatt</span>${PFEIL}</a></div>
</article>`;
}

const HELD_VIDEO = { src: 'assets/media/kmc-hero-loop.mp4', poster: 'assets/media/kmc-hero-poster.webp' };

function held() {
  const h = autos.find((a) => a.hero) || autos.find((a) => a.img);
  if (HELD_VIDEO && fs.existsSync(path.join(repo, HELD_VIDEO.src))) {
    const cap = h ? `<figcaption><span>Gerade im Bestand</span><a href="fahrzeug/${slug(h.id)}/"><b>${esc(h.model)}</b> · ${esc(h.price)}</a></figcaption>` : '';
    return `<figure class="stage stage--foto stage--video"><video src="${HELD_VIDEO.src}" poster="${HELD_VIDEO.poster}" autoplay muted loop playsinline preload="auto" aria-hidden="true" data-held-video></video>${cap}</figure>`;
  }
  if (!h) return `<figure class="stage"><img src="assets/bilder/hero-auto-2000.webp" alt="Dunkler Sportwagen von schräg vorn im Studiolicht (Demo-Modell)" width="2000" height="881" fetchpriority="high"><figcaption><span>Demo-Modell</span><span>Hier steht später das Foto aus dem Bestand</span></figcaption></figure>`;
  return `<figure class="stage stage--foto"><img src="${h.heroBild || h.img}" alt="${esc(h.model)}${h.heroBild ? ' im Studio' : ', Foto aus dem Inserat'}" fetchpriority="high"><figcaption><span>Gerade im Bestand</span><a href="fahrzeug/${slug(h.id)}/"><b>${esc(h.model)}</b> · ${esc(h.price)}</a></figcaption></figure>`;
}

function startseite() {
  const sortiert = [...autos.filter((a) => a.img || a.media?.poster || a.media?.gallery?.length), ...autos.filter((a) => !(a.img || a.media?.poster || a.media?.gallery?.length))];
  const erste = sortiert.slice(0, 3);
  const rest = sortiert.slice(3);
  const beispiele = autos.filter(istBeispiel).length;
  const hinweis = beispiele ? `<p class="sec__note">${beispiele === autos.length ? 'Beispielfahrzeuge, abgebildet mit einem Demo-Modell. Hier erscheinen später die echten Fahrzeuge aus dem Bestand.' : 'Einige Fahrzeuge sind Beispiele.'}</p>` : `<p class="sec__note">Eine Auswahl aus unserem Bestand. Alle Fahrzeuge und Fotos finden Sie bei mobile.de.</p>`;
  const body = `<main id="inhalt">
<section aria-labelledby="held-titel">
<div class="wrap">
<div class="hero__grid">
<h1 id="held-titel" class="hero__h"><b>Gebrauchtwagen in Köln.</b>Garantie bis 24 Monate.</h1>
<div class="hero__row">
<p>Besichtigung, Probefahrt, Kaufvertrag und Übergabe an einem Ort: ${esc(strasseLang)}, ${esc(B.ort)}.</p>
<div class="hero__cta"><a class="btn btn--lg" href="#bestand">Bestand ansehen</a><a class="link" href="${wa('Hallo KMC Motors, ich möchte eine Besichtigung vereinbaren.')}"><span>Besichtigung anfragen</span>${PFEIL}</a></div>
</div>
</div>
</div>
${held()}
<div class="wrap">
<p class="claim">Auf Wunsch mit <b>DEKRA-Siegel</b> und Fahrzeugzustandsbericht. Beratung auf <b>Deutsch, Türkçe und English</b>, von Montag bis Samstag.</p>
</div>
</section>

<section id="bestand" class="sec" aria-labelledby="bestand-titel">
<div class="wrap">
<div class="sec__head"><h2 id="bestand-titel" class="h2">Im Bestand.</h2><a class="link" href="${esc(B.mobilede)}"><span>Ganzer Bestand bei mobile.de</span>${PFEIL}</a></div>
${hinweis}
<div class="cars">
${erste.map(karte).join('\n')}
</div>
${rest.length ? `<div class="cars cars--mehr" id="mehr-fahrzeuge" hidden>
${rest.map(karte).join('\n')}
</div>
<div class="mehr"><button class="btn btn--ghost btn--lg" type="button" aria-expanded="false" aria-controls="mehr-fahrzeuge" data-mehr data-zu="Weniger anzeigen" data-auf="Mehr anzeigen · ${rest.length} weitere Fahrzeuge">Mehr anzeigen · ${rest.length} weitere Fahrzeuge</button></div>` : ''}
</div>
</section>

<section id="leistungen" class="sec sec--mist" aria-labelledby="leistungen-titel">
<div class="wrap">
<h2 id="leistungen-titel" class="h2">Alles an <i>einem Ort.</i></h2>
<ul class="svc">
<li><p class="svc__t"><b>DEKRA-Siegel</b> auf Wunsch.</p><p class="svc__d">Unabhängige Prüfung von optischem und technischem Zustand, mit Fahrzeugzustandsbericht.</p></li>
<li><p class="svc__t"><b>Garantie</b> bis 24 Monate.</p><p class="svc__d">Für Gebrauchtwagen. Die Bedingungen nennen wir Ihnen vor dem Kauf.</p></li>
<li><p class="svc__t"><b>Gutachten</b> nach einem Unfall.</p><p class="svc__d">Schadenshöhe, Wertminderung, Restwert. Komplette Abwicklung mit der gegnerischen Versicherung.</p></li>
<li><p class="svc__t"><b>Kennzeichen</b> für Überführung und Export.</p><p class="svc__d">Kurzzeitkennzeichen höchstens 5 Tage. Exportkennzeichen 14 Tage bis 1 Jahr.</p></li>
<li><p class="svc__t"><b>TÜV und AU</b> für Ihr Auto.</p><p class="svc__d">Hauptuntersuchung und Abgasuntersuchung. Termin einfach anfragen.</p></li>
</ul>
</div>
</section>

<section id="ablauf" class="sec" aria-labelledby="ablauf-titel">
<div class="wrap">
<h2 id="ablauf-titel" class="h2">So läuft <i>der Kauf.</i></h2>
<ol class="steps">
<li><span class="steps__k">Ansehen</span><span class="steps__d">Besichtigung in der ${esc(strasseLang)}</span></li>
<li><span class="steps__k">Probefahren</span><span class="steps__d">auf Wunsch mit Kurzzeitkennzeichen</span></li>
<li><span class="steps__k">Unterschreiben</span><span class="steps__d">auf Wunsch mit DEKRA-Siegel und Garantie</span></li>
<li><span class="steps__k">Mitnehmen</span><span class="steps__d">fürs Ausland mit Exportkennzeichen</span></li>
</ol>
</div>
</section>

<section id="kontakt" class="dark" aria-labelledby="kontakt-titel">
<div class="wrap dark__grid">
<div>
<h2 id="kontakt-titel" class="addr"><b>${esc(strasseLang)}</b>${esc(B.plz)} ${esc(B.ort)}</h2>
<table class="hours"><tbody>
${oeffnung.map((o) => `<tr><th scope="row">${esc(o.label)}</th><td>${esc(o.zeit)}</td></tr>`).join('\n')}
<tr><th scope="row">Sonntag und feiertags</th><td>geschlossen</td></tr>
</tbody></table>
<ul class="direct">
<li><a href="tel:${B.telefonLink}"><span class="direct__k">Anrufen</span><span class="direct__v">${esc(B.telefon)}</span></a></li>
<li><a href="${wa('Hallo KMC Motors, ich habe eine Frage.')}"><span class="direct__k">WhatsApp</span><span class="direct__v">${esc(B.whatsapp)}</span></a></li>
<li><a href="mailto:${esc(B.email)}"><span class="direct__k">E-Mail</span><span class="direct__v">${esc(B.email)}</span></a></li>
</ul>
</div>
<div class="map" data-karte="https://maps.google.com/maps?q=${adresseQ}&amp;z=17&amp;hl=de&amp;output=embed">
<svg class="map__pin" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 40s13-12.5 13-23a13 13 0 0 0-26 0c0 10.5 13 23 13 23z"/><circle cx="22" cy="17" r="4.5"/></svg>
<div class="map__body">
<p class="map__t">So finden Sie uns</p>
<p>Interaktive Karte von Google Maps, zum Zoomen und Verschieben. Erst wenn Sie sie anzeigen, werden Daten an Google übertragen. Ihre Wahl merkt sich die Seite.</p>
<div class="map__act"><button class="btn btn--lg" type="button" data-karte-laden>Karte anzeigen</button><a class="link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${adresseQ}"><span>Route planen</span></a></div>
</div>
</div>
</div>
</section>
</main>`;
  return rahmen({
    basis: '',
    titel: `${B.name} · Gebrauchtwagen in der ${strasseLang}`,
    beschreibung: `${B.name}, ${B.strasse}: Gebrauchtwagen, DEKRA-Siegel auf Wunsch, Garantie bis zu 24 Monate, Kfz-Gutachten, Kennzeichen, TÜV und AU.`,
    body,
  });
}

function fahrzeugseite(a) {
  const basis = '../../';
  const g = a.img ? [{ src: a.img, alt: `${a.model}, Foto aus dem Inserat`, ext: true }] : (a.media?.gallery || []).length ? a.media.gallery : a.media?.poster ? [a.media.poster] : [{ src: 'assets/logo/kmc-zeichen-kupfer.svg', alt: 'Fotos folgen', leer: true }];
  const start = Math.max(0, g.findIndex((x) => x.start));
  const auf = (v) => (v == null || v === '' ? 'auf Anfrage' : v);
  const zeilen = [
    ['B', 'Erstzulassung', a.year],
    ['', 'Kilometerstand', a.km],
    ['P.2', 'Leistung', a.power],
    ['P.3', 'Kraftstoff', a.fuel],
    ...(a.gearbox ? [['', 'Getriebe', a.gearbox]] : []),
    ['', 'DEKRA-Siegel', a.dekra ? 'ja' : 'auf Wunsch'],
    ['', 'Garantie', a.warrantyMonths ? `${a.warrantyMonths} Monate` : 'bis 24 Monate möglich'],
    ['', 'MwSt.', a.vat ? a.vat : 'auf Anfrage'],
  ];
  const ausst = a.ausstattung ? a.ausstattung.map((t) => ({ label: t, text: '' })) : (a.hotspots || []).filter((h) => h.text);
  const body = `<main id="inhalt" class="dp">
<div class="wrap">
<p class="dp__back"><a class="link" href="${basis}index.html#bestand">${ico('M14 8H3M7 4L3 8l4 4')}<span>Zurück zum Bestand</span></a></p>
<div class="dp__grid">
<div class="dp__media">
<figure class="dp__stage${a.img ? ' dp__stage--foto' : ''}${g[start].leer ? ' dp__stage--leer' : ''}"><img id="dp-bild" src="${g[start].ext ? g[start].src : basis + g[start].src}" alt="${esc(g[start].alt || a.model)}" width="1400"></figure>
${g.length > 1 ? `<div class="dp__thumbs" role="list">${g.map((x, i) => `<button type="button" role="listitem" data-src="${basis}${x.src}" data-alt="${esc(x.alt || '')}"${i === start ? ' aria-current="true"' : ''}><img src="${basis}${x.thumb || x.src}" alt="" loading="lazy"><span>${esc(x.label || '')}</span></button>`).join('')}</div>` : ''}
${istBeispiel(a) ? '<p class="dp__demo">Beispielfahrzeug · abgebildet ist ein Demo-Modell, nicht das angebotene Auto.</p>' : ''}
</div>
<div class="dp__info">
<p class="car__tag">${esc(a.make)} · Fahrzeug-ID ${esc(a.id)}</p>
<h1 class="dp__h">${esc(a.model)}</h1>
<p class="dp__price">${esc(a.price)}</p>
<div class="car__act"><a class="btn btn--lg" href="${waAuto(a)}">Per WhatsApp anfragen</a><a class="link" href="tel:${B.telefonLink}"><span>${esc(B.telefon)}</span></a></div>
<table class="sheet"><caption>Datenblatt</caption><tbody>
${zeilen.map(([c, k, v]) => `<tr><th scope="row"><span class="sheet__c">${c ? `(${c})` : ''}</span>${esc(k)}</th><td>${esc(auf(v))}</td></tr>`).join('\n')}
</tbody></table>
${ausst.length ? `<h2 class="dp__h2">Ausstattung</h2><ul class="dp__list">${ausst.map((h) => `<li><b>${esc(h.label)}</b>${h.text ? `<span>${esc(h.text)}</span>` : ''}</li>`).join('')}</ul>` : ''}
${a.url ? `<p style="margin:24px 0 0"><a class="link" href="${esc(a.url)}"><span>Alle Fotos und Details bei mobile.de</span>${PFEIL}</a></p>` : ''}
<p class="dp__fine">Angaben ohne Gewähr. Irrtümer und Zwischenverkauf vorbehalten. Besichtigung in der ${esc(strasseLang)}, ${esc(B.plz)} ${esc(B.ort)}.</p>
</div>
</div>
</div>
</main>`;
  return rahmen({
    basis,
    titel: `${a.model} · ${istBeispiel(a) ? 'Beispielfahrzeug · ' : ''}KMC Motors Köln`,
    beschreibung: `${a.model}, Erstzulassung ${a.year}, ${a.power}, ${a.km}, ${a.fuel}, ${a.gearbox}, ${a.price}. ${B.name}, ${B.strasse}.`,
    body,
  });
}

const schreib = (p, s) => { const z = path.join(aus, p); fs.mkdirSync(path.dirname(z), { recursive: true }); fs.writeFileSync(z, s); };
schreib('index.html', startseite());
for (const a of autos) schreib(`fahrzeug/${slug(a.id)}/index.html`, fahrzeugseite(a));
console.log(`gebaut: index.html + ${autos.length} Fahrzeugseiten`);
