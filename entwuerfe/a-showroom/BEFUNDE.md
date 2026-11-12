# Befunde des unabhängigen Prüfers: a-showroom

## Urteil

Der Entwurf wirkt gestaltet, nicht erzeugt, aber der Hero allein ist die Antwort, die man auf "dunkler Showroom, Kupferlicht" erwartet: Anthrazit, Kupfer, feine breite Grotesk, Filterleiste. Was ihn rettet, ist die Logo-Linie als einziges Licht über die ganze Breite, die mit dem Schriftzug in der Kopfzeile das Logo ergibt. Die stärkste Stelle ist das kalkweiße Blatt: als Schild mit den Feldern der Zulassungsbescheinigung neben dem Auto und als Befund an der Felge mit farbechter Nahaufnahme und Kupferlinie zum Hotspot. Diese eine Idee trägt beide Bildschirme und passt zum Kundenbild (edel, ruhig, Logo als Seele). Die schwächste Stelle sind die zwei Bestandszeilen, deren "Ansehen"-Knopf bei 1280 aus dem Raster ragt und bei 768 abgeschnitten ist; dazu ist die Hero-Überschrift mit 54 px zu leise für die verlangte Typo-Kraft, und am Handy ist das Logo in der Fahrzeugansicht unlesbar klein.

## Faktenverstöße

- start.html, h2 "Drei Beispielfahrzeuge im Bestand": Beispielfahrzeuge sind laut Faktenblatt nicht im Bestand (echte Fahrzeuge noch nicht geliefert). Der Folgesatz "Echte Fahrzeuge folgen" stellt es richtig, die Überschrift selbst nicht.
- fahrzeug.html, "Inserat bei mobile.de: Öffnen": Der Link führt zur Händlerseite https://home.mobile.de/AUTOHAUSKMCMOTORSKOELN, ein Inserat für das Beispielfahrzeug gibt es nicht.
- fahrzeug.html, "Gebrauchtwagen-Garantie bis zu 24 Monate": Die Aussage steht im Faktenblatt, der dort verlangte sichtbare Platzhalter für die offenen Garantiebedingungen fehlt (Auslassung, keine Erfindung).
- start.html, Suche: Preisstufen "40.000 €" und "45.000 €" und der Knopf "3 Fahrzeuge zeigen" stehen nicht im Faktenblatt. Es sind Bedienwerte ohne Behauptung über das Autohaus; der Knopf zählt Beispielfahrzeuge ohne das Wort "Beispiel".
- fahrzeug.html, "Ziehen dreht, zwei Finger oder Mausrad zoomen.": Bedienhinweis aus dem Master-Prompt, nicht aus dem Faktenblatt; im Standbild ohne Funktion.
- Fußzeile beider Seiten, "3D-Demo-Modell: Car Concept, © 2024 Darmstadt Graphics Group GmbH, CC BY 4.0, bearbeitet.": steht nicht im Faktenblatt, stimmt aber mit dem 3D-Bericht überein und ist die Pflicht-Namensnennung. Kein Verstoß.
- Alle übrigen Angaben geprüft und übereinstimmend: Adresse, Telefon 0221 2927347513 mit tel:+492212927347513, Öffnungszeiten, drei Sprachen, vier Leistungen, alle Werte der drei Beispielfahrzeuge, fünf Hotspot-Texte, WhatsApp-Nummer und E-Mail, "Demo-Modell, nicht das angebotene Fahrzeug" wörtlich, "auf Wunsch" beim DEKRA-Siegel, MwSt.-Platzhalter an jedem Preis. Keine Bewertungen, Kundenzahlen, Jahre oder erfundenen Ausstattungen gefunden.

## Befunde

### 1. [muss] start.html, Bestandszeilen Mercedes und Audi (.wagen--zeile / .wagen__kauf) bei 1280 und 768

Problem: Preis (154 px) plus Knopf (120 px) passen nicht in die drei Spalten. Bei 1280 ragt "Ansehen" 22 bis 26 px über den rechten Containerrand (rechte Kante 1242 und 1238 statt 1216), die zwei Knöpfe stehen nicht bündig untereinander und nicht bündig zum Schild darüber. Bei 768 liegt die rechte Kante bei 802: der Knopf ist von der Bildschirmkante abgeschnitten ("Ansehe"). Bei 1280 bricht außerdem der Name als "Mercedes-/Benz E 300 de/AMG Line" und das Feld als "B/Erstzulassung".

Vorschlag: Den vorhandenen Umbruch "@media (max-width: 75rem)" auf 85rem anheben und darin ".wagen__name { grid-column: 1 / span 6 }" und ".wagen__kauf { grid-column: 7 / -1; justify-content: flex-end }" setzen (unter 40rem wieder space-between). Von mir per eingespritztem CSS geprüft, ohne Dateien zu ändern: Knöpfe bündig bei 1216 (1280) und 744 (768), Namen einzeilig, 1440 und 390 unverändert.

### 2. [muss] fahrzeug.html, Kopfzeile am Handy (.kopf__logo img neben "Zurück zum Bestand")

Problem: Das Logo schrumpft im Flex-Container: 106 px breit bei 390, 36 px bei 320. Der Schriftzug "KMC MOTORS" ist dann etwa 3 px hoch und nicht lesbar, bei 320 ist das Logo praktisch weg. Der Knopf daneben ist fast doppelt so breit wie die Marke. Das widerspricht "Das Logo ist die Seele". Zudem trägt die Startseite den Schriftzug, die Fahrzeugansicht das Kleinlogo: zwei Kopfzeilen für eine Idee.

Vorschlag: In der Fahrzeugansicht dieselbe Marke wie auf der Startseite setzen (Schriftzug, 152 px, flex: none) und den Knopftext unter 40rem auf "Zum Bestand" kürzen.

### 3. [sollte] start.html, Hero-Überschrift bei 1280 und 1440 (.hero h1, --text-display)

Problem: 54 px bei 1280 und 61 px bei 1440 in Schnitt 200: die Zeile ist ruhig, aber nicht die verlangte Typo-Kraft ("riesige Wörter"). Die größte Schrift der Seite ist die Telefonnummer unten (75 px), nicht die Überschrift. Zwischen Linie und Überschrift liegen 112 px ungenutzte Höhe.

Vorschlag: ".hero h1 { grid-column: 1 / -1; grid-row: 2; font-size: clamp(2rem, 5.9vw, 5.5rem) }" und ".hero__satz { grid-row: 2 }" (ab 60rem aufwärts). Der Satz bleibt rechts neben der kürzeren zweiten Zeile stehen. Geprüft per eingespritztem CSS: 75,5 px bei 1280, 85 px bei 1440, 88 px bei 1920, Suchknopf weiter bei 760 von 800 sichtbar, keine Überlappung mit dem Satz.

### 4. [sollte] start.html, Kopfzeile (.kopf__schriftzug als CSS-Maske auf ../../assets/logo/kmc-schriftzug.svg)

Problem: Der Schriftzug ist ein leeres span mit Maskenbild. Lädt die Maske nicht, ist die Marke ohne Ersatz unsichtbar. Gemessen: Beim Öffnen per Doppelklick (file://) fehlt "KMC MOTORS" in der Kopfzeile in 6 von 6 Aufnahmen; über einen Webserver erscheint er. Wer den Entwurf als Datei öffnet, sieht eine Startseite ohne Markennamen.

Vorschlag: Den Schriftzug als Inline-SVG in die Kopfzeile setzen (die Datei nutzt currentColor, 5 KB) und mit "color: var(--color-accent)" färben. Keine Maske, keine zusätzliche Anfrage.

### 5. [sollte] start.html, Abschluss #kontakt und feste Handy-Leiste ("Anfrage")

Problem: "Anfrage" führt zu einem Abschnitt, in dem nur die Telefonnummer steht. E-Mail und WhatsApp fehlen auf der Startseite, obwohl das Faktenblatt beide führt; die Sprachen fehlen dort ebenfalls, obwohl der Stempel sie für den Fuß nennt. Die Leiste hat damit zwei Wege zum selben Ziel (Anruf).

Vorschlag: Unter der Telefonnummer zwei Textlinks ergänzen: "WhatsApp 0151 21181898" (wa.me-Link) und "kmcmotors@t-online.de"; "Anfrage" in der Leiste auf den WhatsApp-Link legen wie in der Fahrzeugansicht.

### 6. [sollte] start.html, Überschrift "Drei Beispielfahrzeuge im Bestand" und fahrzeug.html, "Inserat bei mobile.de: Öffnen"

Problem: Beispielfahrzeuge sind nicht im Bestand (Faktenblatt: echte Fahrzeuge noch nicht geliefert). "Inserat bei mobile.de" führt zur Händlerseite, ein Inserat für das Beispielfahrzeug gibt es nicht. Beides sagt mehr, als stimmt.

Vorschlag: Überschrift auf "Drei Beispielfahrzeuge" kürzen. Beschriftung in "Händlerseite bei mobile.de" ändern.

### 7. [sollte] fahrzeug.html, Zusagen neben der Bühne ("Gebrauchtwagen-Garantie: bis zu 24 Monate")

Problem: Die Garantiebedingungen sind laut Faktenblatt OFFEN und sollen als sichtbarer Platzhalter stehen. Hier steht die Zusage ohne Hinweis.

Vorschlag: Im dd ein "<span class=\"fill\">Bedingungen folgen</span>" anhängen.

### 8. [sollte] fahrzeug.html, Legende der fünf Stellen unter der Bühne (Vorderansicht)

Problem: Die Legende zählt fünf Stellen, die Bühne zeigt drei. Kofferraum (4) und Stoßfänger (5) haben keinen Hinweis, dass sie am Heck liegen; ein Kunde sucht sie im Bild. Der Zusammenhang mit "Zum Heck drehen" ist nicht ausgesprochen.

Vorschlag: Bei 4 und 5 im Text "Am Heck:" voranstellen (in der Heckansicht entsprechend "Vorn:" bei 1 bis 3), oder die zwei Legendenknöpfe im Standbild auf fahrzeug-heck.html verlinken.

### 9. [sollte] start.html, Hero am Handy bei 390 (.hero__linie, .hero__raster)

Problem: Die Logo-Linie ist 69 px hoch und sitzt 16 px unter der Kopfzeile, direkt unter dem Menü-Knopf: Das einzige Licht im Raum wirkt dort wie ein Zierstrich. Der Hero endet bei 669 von 844 px, Platz wäre da. Die im Picks-Block genannte Signatur (das kalkweiße Blatt) fehlt auf dem ersten Bildschirm ganz.

Vorschlag: Unter 40rem der Linie Luft geben: padding-block-start und row-gap von .hero__raster auf var(--space-xl) (40 px). Der Suchknopf endet dann bei etwa 693 und bleibt über der festen Leiste (780). Im Picks-Block die Logo-Linie als Signatur des Hero nennen, das Blatt als Signatur ab dem Bestand.

### 10. [kann] start.html, Navigationspunkt "Leistungen" und Zeile .schluss__zeile

Problem: "Leistungen" springt auf einen einzigen Satz am Fuß des Kontakts; der Link "Karte öffnen" hängt an diesem Satz statt an der Adresse. Für einen Entwurf vertretbar (Stempel begründet es), aber der Sprung enttäuscht.

Vorschlag: "Karte öffnen" direkt unter die Adresse setzen und die Leistungszeile mit einem sichtbaren Platzhalter "Abschnitt folgt" versehen.

### 11. [kann] fahrzeug.html, Datenblatt, Zelle "Preis"

Problem: Der Preis steht zweimal im selben schwarzen Schnitt (neben der Bühne und im Datenblatt), am Handy zusätzlich über der Bühne. Das ist ein Echo (Gate 69) und nimmt dem einen großen Preis die Wirkung.

Vorschlag: Die Preiszelle im Datenblatt streichen oder in der Datengröße (--text-title, Schnitt 400) setzen.

### 12. [kann] styles.css Zeile 89, Filter auf .buehne__bild img

Problem: Der Kupferton ist ein Farbfilter über jedem Bühnenbild. Am grauen Demo-Modell stimmig, an echten Fahrzeugfotos verfälscht er die Lackfarbe (der Designer nennt das selbst als schwächste Stelle).

Vorschlag: Den Filter an eine eigene Klasse binden (zum Beispiel .buehne--demo), damit echte Fotos später farbecht bleiben; dem Kunden beim Zeigen sagen, dass der Ton nur für das Demo-Modell gilt.

### 13. [kann] start.html und fahrzeug.html, Fuß: Links "Impressum" und "Datenschutz"

Problem: Beide führen auf #kontakt, ohne Kennzeichnung, dass die Seiten noch fehlen.

Vorschlag: Als Text mit Platzhalter setzen ("Impressum <span class=fill>folgt</span>") oder aria-disabled mit sichtbarem "folgt".

### 14. [kann] fahrzeug.html, Bühne

Problem: Der Entwurf zeigt den geöffneten Zustand mit Bedienhinweis "Ziehen dreht", aber nicht den Einstieg "In 3D ansehen" (Master-Prompt Abschnitt 4: Viewer lädt erst auf Wunsch). Der Kunde sieht nicht, wie der Wow-Moment beginnt.

Vorschlag: Beim Zeigen einen Satz dazu sagen oder auf der Startseite am Schild neben "Ansehen" den Text "In 3D ansehen" verwenden.


## Eigene Messung des Prüfers

Entwurf kopiert nach entwuerfe/_pruefung-a-showroom/ (alte shots, .hallmark und sloplint-Texte des Designers vorher entfernt) und dort frisch gemessen. Am Original und im Repo nichts geändert (git status leer).

1. pruefe-entwurf.mjs: start.html und fahrzeug.html "ohne harte Mängel". Konsole leer, keine fremden Anfragen, kein Überlauf der Seite, axe 0 bei 390 und 1440, keine zu kleinen Ziele, beide Schriften geladen. Länge: Start Handy 3,96 Bildschirme, Desktop 3,0; Fahrzeugansicht Handy 3,4, Desktop 2,0. Ohne JavaScript 217 Wörter und h1 sichtbar. Das Werkzeug meldet aber bei 768 zweimal "zuBreit: a.btn.btn--still" und wertet das nicht als Mangel; das ist der abgeschnittene "Ansehen"-Knopf.

2. sloplint start.html --render --stage hero: clean, 0 FAIL, 0 REFLEX, 0 WARN. Ohne --stage: 0 FAIL, 0 WARN, 1 DISMISSED (77, im Stempel begründet). fahrzeug.html ohne --stage: 0 FAIL, 0 WARN, 2 DISMISSED (49 und 77, beide begründet und für eine Unteransicht vertretbar).

3. Screenshots mit dem Read-Werkzeug angesehen: Hero bei 375, 1280, 1440, 1920; beide Seiten bei 390 (ganz, in Abschnitten), 768, 1280, 1440 (ganz); dazu eigene Aufnahmen (Menü offen, Tastaturfokus, Heckansicht, 320).

4. Eigene Playwright-Messung (Skripte und Bilder in entwuerfe/_pruefung-a-showroom/_mess/):
- Falz 1280 x 800: h1 bei 478 bis 593, Satz bis 593, Suchknopf bis 760. Alles sichtbar, 30 Wörter im ersten Bildschirm. Bei 1440 x 900 füllt der Hero genau einen Bildschirm, bei 1920 hält der Container (1312 px).
- Schriftgrade: h1 54,4 px (1280), 60,8 px (1440), 32 px (390); Telefonnummer 67 bis 75 px.
- Bestandszeilen: "Ansehen" rechte Kante 1242 und 1238 bei Containerrand 1216 (1280); 802 bei Bildschirmbreite 768.
- Fahrzeugansicht Handy: Hotspots 44 x 44 px, kein Überlappen (15 px Abstand bei 390, 3 px bei 320); alle Knöpfe mindestens 44 px hoch; Logo in der Kopfzeile 106 px breit bei 390, 36 px bei 320.
- Kontraste: Kupfer auf Anthrazit 6,16; Anthrazit auf Kupferknopf 6,16; gedämpfter Text 7,13; Kupfer dunkel auf Blatt 5,85; Feldrand 4,66. Sichtbarer Fokusrahmen in Kupfer an Auswahlfeld und Hotspot.
- Seitengewicht Startseite 225 KB (Budget 250 KB).
- Kopf-Schriftzug per file:// in 6 von 6 Aufnahmen unsichtbar (CSS-Maske), über http sichtbar.
- Zwei Korrekturen per eingespritztem CSS geprüft, ohne Dateien zu ändern: größere Hero-Überschrift (75,5 px bei 1280, Falz hält) und breitere Kaufspalte in den Zeilen (Knöpfe bündig bei 1280 und 768).

5. Namensnennung des Demo-Modells gegen dem 3D-Bericht geprüft: stimmt.