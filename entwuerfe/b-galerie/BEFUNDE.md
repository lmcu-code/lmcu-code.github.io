# Befunde des unabhängigen Prüfers: b-galerie

## Urteil

Der Entwurf wirkt überwiegend gestaltet: Eine Idee (Wand, Rahmen, Schild mit den Feldern des Fahrzeugscheins) trägt beide Bildschirme, und die Überschrift "Ausgestellt in der Escherstraße 129" kann nur dieses Haus sagen. Die stärkste Stelle ist die Fahrzeugansicht bei 1280 x 800: Die Kupferlinie führt vom Punkt an der Felge ins dunkle Schild mit der Profiltiefe, und Titel, Preis, Bühne, Demo-Kennzeichnung, alle drei Anfragewege und die Daten stehen ohne Scrollen da. Die schwächste Stelle ist der Startbildschirm am Handy: Dort wird die breite Schrift schmal gestellt, das Logo rückt nach links, es steht zweimal direkt übereinander, und zwei der vier Suchfelder schneiden ihren Text ab. Auf dem ersten Bildschirm fehlt außerdem die Signatur (die arbeitende Kupferlinie beginnt erst im Bestand); ohne sie ist er hellgraue Wand, fette breite Grotesk und schwarze Platte, also der Studio-Look, den ein Modell für "heller Galerieraum" erwartbar liefert. Zum Kundenbild passt er als ruhige, klare, helle Gegenrichtung; "ein einzelnes Auto im Licht" und "große Fahrzeugbilder" löst er noch nicht ein (kein Wagen im Hero, im Bestand rund 330 px breite Wagen, zwei von drei Rahmen leer).

## Faktenverstöße

- fahrzeug.html Zeile 57: "Inserat bei mobile.de". Das Faktenblatt kennt nur die Händlerseite; ein Inserat für das Beispielfahrzeug gibt es nicht.
- start.html Zeile 70: "Zurzeit ausgestellt" über drei Beispielfahrzeugen. Die Aussage ist für BEISPIEL-Fahrzeuge nicht gedeckt; der Satz daneben stellt es richtig, deshalb ein Grenzfall.
- fahrzeug.html Zeile 72: "Gebrauchtwagen-Garantie bis zu 24 Monate" stimmt, aber der im Faktenblatt verlangte sichtbare Platzhalter für die offenen Garantiebedingungen fehlt.
- start.html Zeile 7 (Meta-Beschreibung): "Beratung auf Deutsch, Türkçe und English". Das Blatt nennt die drei Sprachen, das Wort "Beratung" ist eine leichte Zuspitzung.
- Fuß beider Seiten: "3D-Demo-Modell: Car Concept, © 2024 Darmstadt Graphics Group GmbH, Modell und Texturen von Eric Chadwick, CC BY 4.0, bearbeitet." Steht nicht im Faktenblatt, deckt sich aber wörtlich mit 3d/BERICHT.md Zeile 9 und ist als Lizenznachweis nötig; kein Mangel.
- fahrzeug.html Zeile 40: "Ziehen dreht, Mausrad oder zwei Finger zoomen." Bedienhinweis zu einem Standbild, im Entwurf dreht nichts; keine Aussage über den Betrieb.

## Befunde

### 1. [muss] start.html, Fahrzeugsuche am Handy (styles.css Zeile 43 `.suche__feld select`, zweispaltig unter 60rem)

Problem: Text in den Auswahlfeldern abgeschnitten. Gemessen bei 390 px: "Jeder Kraftstoff" braucht 109 px bei 103 px Platz, "Neueste zuerst" 107 px bei 103 px; bei 360 px sind nur 88 px Platz. Gewählte Werte wie "Mercedes-Benz" (113 px) und "Wenigste Kilometer" (138 px) schneiden ebenfalls ab. Im Screenshot steht "Jeder Kraftstof" und "Neueste zuers".

Vorschlag: Im Block `@media (max-width: 40rem)`: `.suche__feld select { padding: 0 var(--space-lg) 0 var(--space-xs); background-position: right 0.75rem center, right 0.375rem center; }` und die Optionstexte kürzen (das Label nennt das Feld schon): "Alle" statt "Jeder Kraftstoff", "Neueste", "Günstigste", "Wenigste km".

### 2. [muss] fahrzeug.html Zeile 57, Textlink "Inserat bei mobile.de"

Problem: Der Link führt auf die Händlerseite; für das Beispielfahrzeug gibt es kein Inserat. Die Beschriftung behauptet eines.

Vorschlag: Linktext ändern in "KMC Motors bei mobile.de".

### 3. [sollte] start.html, erster Bildschirm bei 1280 x 800 und 1440 x 900 (Hero)

Problem: Die Signatur aus dem Picks-Block (Kupferlinie als Bilderleiste und Führungslinie) ist auf dem ersten Bildschirm nicht zu sehen; Kupfer kommt dort nur im Logo vor. Ohne sie liest sich der Hero als hellgraue Wand, fette Grotesk und schwarze Platte.

Vorschlag: Die Bilderleiste schon im Hero beginnen lassen: dieselbe 2-px-Kupferlinie wie `.bestand__wand::before` in voller Wandbreite an der Oberkante des Suchsockels (`.suche` bekommt `position: relative` und ein `::before` mit `left/right: calc(-1 * var(--gutter))`, `top: -2px`).

### 4. [sollte] start.html Zeile 16 und 27: Logo-Linie in der Kopfleiste und Logo im Hero

Problem: Dieselbe Zeichnung steht zweimal im ersten Bildschirm, am Handy direkt übereinander (Kopfleiste y 28, Hero-Logo ab y 80). Das schwächt den "Logo-Moment" und wirkt wie ein Baukasten-Kopf.

Vorschlag: Auf start.html das `<img>` aus `.kopf__logo` entfernen (auf fahrzeug.html bleibt es als Heimweg) oder es per `.kopf__logo img { visibility: hidden }` nur auf der Startseite ausblenden.

### 5. [sollte] tokens.css, `@media (max-width: 40rem)`: `--breit: 90%`; styles.css Zeile 188 `.hero__logo { align-self: flex-start }`

Problem: Am Handy wird die Displayschrift schmal (90 %) statt breit (125 %) gesetzt, und das Logo rückt nach links. Die Typo-Stimme des Entwurfs und die Diagonale gehen genau auf dem Gerät verloren, das die meisten Kunden nutzen; übrig bleibt ein gewöhnlicher Stapel (Logo, Überschrift, Satz, Formular) in einer neutralen Grotesk.

Vorschlag: `--breit: 90%` aus dem Handy-Block löschen und dort `--text-display: clamp(1.5rem, 8.4vw, 4.5rem)` setzen ("Escherstraße 129" ist bei 125 % Breite 10,63 em lang und passt damit bis 320 px); `align-self: flex-start` bei `.hero__logo` streichen, damit das Logo rechts bleibt.

### 6. [sollte] start.html, Hero auf niedrigen Laptop-Fenstern (styles.css Zeile 33 bis 35)

Problem: Der Floor (1280 x 800) ist erfüllt: Suchknopf endet bei y 740, Sockel bei 764. Bei 1366 x 650 liegt der Knopf aber bei y 669 bis 717 und bei 1536 x 730 bei y 700 bis 748, also unter der Falz, weil Schrift und Logo nur mit der Breite wachsen.

Vorschlag: `--text-display: clamp(2.25rem, min(7.4vw, 12svh), 7rem)` und `.hero__logo { width: clamp(16rem, min(40vw, 46svh), 36rem) }`.

### 7. [sollte] fahrzeug.html Zeile 34 bis 36 (`.punkt`) und Zeile 44 bis 48 (`.marke` in der Legende)

Problem: Nur der offene Punkt ist über die Linie mit seiner Zeile verbunden. Die geschlossenen Punkte und die fünf Legendenzeilen tragen identische Kreise; man sieht nicht, welcher Punkt zu welcher Zeile gehört, und nicht, dass Kofferraum und Stoßfänger auf der Rückseite liegen.

Vorschlag: Ziffern 1 bis 5 in Punkt und Marke setzen (z. B. `data-nr` und `content: attr(data-nr)` in `.punkt::before` und `.marke`); bei den Zeilen 4 und 5 den Zusatz "Rückseite" in der Knopfbeschriftung.

### 8. [sollte] fahrzeug.html, Zustandspunkt "Stoßfänger hinten rechts" (Zeile 48)

Problem: Der Vertrauensvorteil aus Master-Prompt Abschnitt 4 (ehrlich markierte Gebrauchsspur) ist auf der Bühne gar nicht zu sehen und steht als fünfte, letzte Legendenzeile mit einer kleinen schwarzen Raute. Am Handy liegt er 1,5 Bildschirme tief.

Vorschlag: Die Zustandszeile in der Legende an die erste Stelle setzen und mit einer 2-px-Kupferlinie links kennzeichnen (`.legende__zeile--zustand { border-left: 2px solid var(--color-accent) }`); für die Kundenvorlage zusätzlich das Standbild von hinten rechts als zweite Ansicht rendern.

### 9. [sollte] fahrzeug.html Zeile 41, Knopf "Gesamtansicht"

Problem: Der Knopf ist aktiv, obwohl die Seite bereits die Gesamtansicht zeigt (die Auskunft zur Felge ist offen, die Kamera aber nicht herangefahren). Der Zustand widerspricht fahrzeug-nah.html und dem Ablauf aus Abschnitt 4.

Vorschlag: In fahrzeug.html `disabled` am Knopf setzen (der Stil `.btn:disabled` existiert) oder den Knopf in diesem Zustand weglassen.

### 10. [sollte] fahrzeug.html, Bühne (Zeile 29 bis 42)

Problem: Der Zustand "Poster, 3D lädt erst auf Wunsch" fehlt: Es gibt keinen Knopf "In 3D ansehen", die Bühne tut so, als wäre der Viewer schon geladen. Der Kunde sieht den Einstieg in den Wow-Moment nicht.

Vorschlag: In fahrzeug.html den Knopf unten rechts als "In 3D ansehen" beschriften (gefüllte `.btn`) und den Hilfetext erst in fahrzeug-nah.html zeigen; dort bleibt "Gesamtansicht".

### 11. [sollte] fahrzeug.html Zeile 72, "Gebrauchtwagen-Garantie bis zu 24 Monate"

Problem: Die Garantiebedingungen sind laut Faktenblatt OFFEN und müssen als sichtbarer Platzhalter stehen; hier fehlt er.

Vorschlag: Im `<dd>` ergänzen: `<span class="luecke">Bedingungen folgen</span>`.

### 12. [sollte] start.html, Hängung im Bestand bei 1440 (styles.css Zeile 69 bis 72, `--bild-hoehe`)

Problem: Zwei von drei Rahmen sind leere graue Flächen mit "Foto folgt" (Hallmark 68, Wireframe-Eindruck), und der einzige Wagen ist rund 330 px breit in einem 408 x 201 px großen Rahmen. "Große Fahrzeugbilder wie bei bmw.de" entsteht so nicht, und die Signatur (Rahmen auf der Kupferleiste) zeigt sich in der Kundenvorlage zu zwei Dritteln leer.

Vorschlag: `.exponat__bild img { padding-inline: 0 }` und `--bild-hoehe: clamp(11rem, 19vw, 17rem)`; in den zwei leeren Rahmen statt der grauen Fläche den Modellnamen groß in der leichten breiten Schrift setzen ("Foto folgt" klein darunter).

### 13. [kann] fahrzeug.html Zeile 40, Hilfetext "Ziehen dreht, Mausrad oder zwei Finger zoomen."

Problem: Am Handy nennt er das Mausrad und belegt zweizeilig die untere Bühnenecke; der Master-Prompt nennt als Bedienung "1 Finger dreht, 2 Finger zoomen, Doppeltipp setzt zurück".

Vorschlag: Zwei Fassungen: am Handy (`max-width: 40rem`) "Ein Finger dreht, zwei Finger zoomen.", sonst "Ziehen dreht, Mausrad zoomt."

### 14. [kann] start.html Zeile 70 bis 71, "Zurzeit ausgestellt" und der Hinweissatz

Problem: Die Überschrift behauptet einen aktuellen Bestand; die Richtigstellung ("Alle drei sind Beispielfahrzeuge") steht bei 1440 klein und grau rund 290 px weiter rechts.

Vorschlag: Den Hinweissatz direkt unter die Überschrift in die linke Spalte setzen (`.bestand__kopf { grid-template-columns: minmax(0, 1fr) }`).

### 15. [kann] fahrzeug.html bei 390, `.zusagen` (styles.css Zeile 161 bis 163)

Problem: "auf Wunsch" bricht in eine eigene Zeile und steht links, die beiden anderen Werte stehen rechts.

Vorschlag: `.zusagen dd { margin-left: auto; text-align: right; }`

### 16. [kann] Fuß beider Seiten, `.fuss__ende p` (start.html Zeile 145)

Problem: Firmenname, Platzhalter für Impressum und Datenschutz und der Lizenznachweis des 3D-Modells laufen als ein rechtsbündiger Absatz über drei Zeilen ineinander.

Vorschlag: Den Lizenznachweis (`[data-credits]`) als eigenen Absatz darunter setzen (`display: block; margin-top: var(--space-xs)`).

### 17. [kann] fahrzeug.html Zeile 54 und 55, vorausgefüllte WhatsApp-Nachricht und E-Mail

Problem: Modell und Preis stehen drin, die Fahrzeug-ID fehlt (Master-Prompt Abschnitt 7 verlangt Modell, Preis und Fahrzeug-ID).

Vorschlag: Im Text ergänzen: "(Fahrzeug bmw-430i-2021)".


## Eigene Messung des Prüfers

Ich habe den Entwurf nach entwuerfe/_pruefung-b-galerie/ kopiert, die Screenshots des Designers dort gelöscht und alles neu erzeugt. Am Original und im Repo ist nichts geändert.

- **pruefe-entwurf.mjs:** beide Seiten "ohne harte Mängel". 0 Konsolenfehler, 0 fremde Anfragen, kein Überlauf bei 390 bis 1920, axe ohne Verstöße bei 390 und 1440, keine Touch-Ziele unter 44 px, Archivo geladen. Länge: Start 4,27 Bildschirme am Handy und 2,77 am Desktop, Fahrzeugansicht 3,3 und 2,01. Ohne JavaScript 226 Wörter, h1 sichtbar.
- **sloplint, Hero-Stufe (start.html):** 0 FAIL, 0 WARN, 1 WAIVED (38iii, leichte über schwerer Zeile, mit dem Master-Prompt begründet), 1 ANSWERED (F4).
- **sloplint, ganze Seite:** start.html und fahrzeug.html je 0 FAIL, 0 WARN, dazu 1 DISMISSED (77, Abschnittszahl); bei einem Entwurf mit zwei Ansichten vertretbar.
- **Screenshots angesehen:** Start bei 390, 768, 1280, 1440, 1920 und ganze Seite bei 390 und 1440; Fahrzeugansicht bei 390, 768, 1280 und ganze Seite bei 390 und 1440.
- **Falz am Start (eigenes Playwright-Skript):** bei 1280 x 800 endet die Überschrift bei y 521, der Satz bei 602, der Suchknopf bei 740, der Sockel bei 764, also alles sichtbar. Bei 1440 x 900 endet der Sockel bei 864, bei 1920 hält der Container 1312 px. Bei 1366 x 650 und 1536 x 730 liegt der Suchknopf unter der Falz.
- **Suchfelder am Handy:** bei 390 px 103 px Platz gegen 109 und 107 px Text, bei 360 px 88 px Platz.
- **Handy-Hero:** bei 390 x 844 endet der Suchknopf bei y 598, die feste Leiste beginnt bei 780. Bei 320 x 568 liegt der Knopf unter der Leiste.
- **Hotspots:** je 44 x 44 px, kleinster Abstand 83 px bei 390 und 76 px bei 360.
- **Fahrzeugansicht bei 1280 x 800:** Titel, Preis, Bühne, offene Auskunft (y 672 bis 729), drei Anfragewege (y 230 bis 442) und Datentabelle (bis 771) liegen im ersten Bildschirm.
- **Tastatur:** jeder Halt hat einen sichtbaren 2-px-Fokusrahmen in Kupfer.
- **Wörter im ersten Bildschirm:** Start 27 bei 1280 und 39 bei 390, Fahrzeugansicht 68 und 44.

Belege liegen im Prüfordner unter shots/, .hallmark/shots/ und eigen/ (mein Messskript mess.cjs, nah-390.png, nah-1440.png, fokus-punkt-1280.png, fokus-start-1280.png).