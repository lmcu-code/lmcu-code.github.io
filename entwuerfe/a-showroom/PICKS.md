# Richtung A · Dunkler Showroom, Kupferlicht: „Bei Licht besehen“

## (a) Picks-Block

**Hallmark · v2.0.0**

- **Idee** · Der Raum bleibt dunkel, und hell ist nur, was man gerade prüft: die Linie des Logos und das kalkweiße Blatt mit den Angaben zum Auto.
- **Look** · Grund: Anthrazit `#141416` (LOGO.md), die Bühne eine Stufe dunkler, der Tresen der Suche eine Stufe heller · Schrift: Kalkweiß `#f2f0eb` (LOGO.md) · Akzent: Kupfer `#c08a5c` auf dunkel, `#7f5230` auf dem Blatt (LOGO.md), nur als Kante, Linie, Feldcode und ein gefüllter Knopf je Seite · Blatt: Kalkweiß als Fläche mit Anthrazit als Schrift (dieselben zwei Logofarben, vertauscht) · Schriften: Zalando Sans Expanded für Überschriften (Schnitt 200) und Preise (Schnitt 800), Zalando Sans für Text (400), beide OFL, aus `@fontsource-variable`, selbst gehostet. Gewählt am Schriftbild der echten Überschrift gegen 14 andere: die breiten Buchstaben ziehen jedes Wort in die Länge wie die Linie des Coupés, der feine Schnitt hat die Strichstärke der Logo-Linie. Kein Hallmark-Theme setzt sie (`theme.mjs check` sagt „clear“).
- **Chrome** · Kopfzeile: auf allen Seiten derselbe Schriftzug „KMC MOTORS“ links, als Inline-SVG aus `assets/logo/kmc-schriftzug.svg` (keine Maske, auch als Datei geöffnet sichtbar). Auf der Startseite rechts Bestand, Leistungen, Kontakt und die Telefonnummer mit Kupferstrich, am Handy das Menü; in der Fahrzeugansicht rechts „Zurück zum Bestand“, am Handy „Zum Bestand“. Keine Linie darunter. Am Handy dazu die feste Leiste „Anrufen“ und „WhatsApp-Anfrage“, auf allen Seiten gleich benannt und zum selben Kanal · Fuß: Adresse als Überschrift mit „Karte öffnen“, Telefonnummer groß, darunter WhatsApp und E-Mail als Textlinks, Öffnungszeiten daneben, darunter eine Zeile mit Logo, Impressum und Datenschutz (beide als „folgt“ markiert).
- **Hero** · Die Autolinie des Logos über die ganze Breite, als einziges Licht im Raum. Direkt darunter die Überschrift groß über die Breite (75 px bei 1280, 85 px bei 1440), der eine Satz rechts neben ihrer zweiten Zeile, unten die Suche als Tresen mit Kupferkante von Rand zu Rand. Der Schriftzug steht oben in der Kopfzeile: Zusammen ergibt der Bildschirm das Logo. Am Handy steht die Linie mit 56 px Luft darüber und 48 px darunter frei.
- **Signatur** · Im Hero die Logo-Linie als einziges Licht. Ab dem Bestand das kalkweiße Blatt im dunklen Raum: auf der Startseite als Schild neben dem Auto (Felder wie in der Zulassungsbescheinigung), in der Fahrzeugansicht als Befund an der Felge, mit einer Kupferlinie am Hotspot festgemacht.
- **Abschnitte** · Start: Hero mit Suche · „Drei Beispielfahrzeuge“ (ein Fahrzeug im Licht mit Bühne und Schild, zwei als Zeilen) · Abschluss mit Adresse und Karte, Telefon, WhatsApp, E-Mail, Zeiten, dazu eine Zeile Leistungen mit Platzhalter „Abschnitt folgt“ · Fuß. Fahrzeugansicht: Bühne mit Hotspots und Befund, daneben Name, Preis, Anfrage, Zusagen · Liste aller fünf Stellen · Datenblatt mit Fahrzeug-ID, daneben Zustandsbericht und Händlerseite · Fuß. Zusatz: `fahrzeug-heck.html` zeigt die Heckansicht mit dem geöffneten Zustands-Hotspot; „Zum Heck drehen“ führt dorthin, „Nach vorn drehen“ zurück.
- **Material** · echt: Name, Adresse, Telefon, Zeiten, Sprachen, vier Leistungen, WhatsApp und E-Mail (aus dem Impressum, bitte bestätigen), Logo, Händlerseite bei mobile.de · Bilder: Poster des 3D-Demo-Modells (Car Concept, CC BY 4.0), im Dunkeln kupfern getönt (nur über die Klasse `.buehne--demo`, echte Fotos bleiben farbecht), auf dem Blatt farbecht; kein KI-Bild · Beispiel: drei Fahrzeuge, fünf Hotspot-Texte, Fahrzeug-ID · fehlt und ist sichtbar markiert: MwSt.-Angabe, Garantiebedingungen, Fahrzeugfotos, Detailfoto des Kratzers, Zustandsbericht, Abschnitt Leistungen, Impressum, Datenschutz.
- **Sweep** · Stand nach der Nachbesserung: `sloplint --render`: start Hero-Stufe clean (0 FAIL, 0 REFLEX, 0 WARN), ganze Seite 0 FAIL, 0 WARN, 1 DISMISSED (77) · fahrzeug 0 FAIL, 0 WARN, 2 DISMISSED (49, 77) · fahrzeug-heck 0 FAIL, 0 WARN, 2 DISMISSED (49, 77) · keine Regel abgewählt, keine neue Abweisung · gemeinsames Prüfwerkzeug: start, fahrzeug und fahrzeug-heck ohne harte Mängel, axe 0, keine fremden Anfragen, kein Überlauf, kein Ziel unter 44 px · eigener Durchlauf `arbeit/fegen.cjs`: bei 116 Breiten von 320 bis 1920 px ragt nichts über seinen Behälter, keine Option eines Auswahlfelds ist abgeschnitten · Falz 1280 x 800: Überschrift bis 590, Satz bis 590, Suchknopf bis 757.

## (b) Drei Sätze für den Kunden

Die Seite ist ein abgedunkelter Raum, in dem nur zwei Dinge hell sind: die kupferne Linie aus Ihrem Logo und ein kalkweißes Blatt, auf dem steht, was man über das Auto wissen muss.
Das passt zu KMC Motors, weil Ihr Vorteil das genaue Hinsehen ist: Profiltiefe in Millimetern, der Kratzer mit seiner Länge, das DEKRA-Siegel, und alles steht in denselben Feldern wie im Fahrzeugschein.
Eine gewöhnliche dunkle Autoseite zeigt Glanz und ein Stimmungsfoto, diese zeigt Belege, und das Licht fällt immer auf die Stelle, die Ihr Kunde gerade prüft.

## (c) Skizziert und verworfen

**Nur die Linie.** Alles in Kupferstrichen auf Schwarz, jedes Fahrzeug als Umriss, die Schrift so fein wie das Logo.
Verworfen: Ich müsste Autos zeichnen, die es nicht gibt, und Kupfer wäre überall statt ein Signal. Geblieben ist die Linie als einziges Bild im Hero.

**Schaufenster Escherstraße bei Nacht.** Die Seite als Blick durch die Scheibe: Öffnungszeiten und Sprachen als Beschriftung auf dem Glas, dahinter der Hof.
Verworfen: Das trägt nur mit echten Fotos vom Autohaus, und die gibt es noch nicht; ein KI-Bild als Hauptmotiv wäre unehrlich. Geblieben sind Adresse und Zeiten als große Schrift im Abschluss.

## (d) Schwächste Stelle

Am Handy hat die Logo-Linie jetzt Luft, aber sie bleibt flach: 69 px hoch bei 390 px Breite, 55 px bei 320 px. Mehr Höhe gäbe es nur, wenn die Linie über den Rand hinausliefe, und das Logo schneide ich nicht an.
Der Kupferton auf dem Auto hängt jetzt an der Klasse `.buehne--demo`. Wie die Bühne mit einem echten, farbechten Foto aussieht, ist weiter nicht geprüft; dann hält nur der dunkle Grund sie zusammen.
Die Fahrzeugansicht ist dicht: Bei 1440 px stehen bis zu 79 Wörter auf einem Bildschirm (Grenze des Prüfers: 80). Deshalb nennt die Liste am Desktop für die offene Stelle nur „Geöffnet“, die Auskunft steht im Befund direkt darüber.

## Offen

- Die Hotspots 4 und 5 liegen am Heck und fehlen deshalb auf dem Standbild von vorn. Die Liste sagt bei beiden „Am Heck“; die Bühne zeigt sie in `fahrzeug-heck.html`. Dort steht bei 1 bis 3 „Vorn“.
- „Ansehen“ führt bei allen drei Beispielfahrzeugen zur selben Fahrzeugansicht (BMW). Der Link „KMC Motors bei mobile.de“ führt zur Händlerseite, ein Inserat für das Beispielfahrzeug gibt es nicht.
- Hotspots, „Schließen“ und die Suche sind im Standbild ohne Funktion (kein JavaScript). „Zum Heck drehen“ ist ein Link auf die zweite Ansicht.
- Der Bedienhinweis wechselt nach Gerät: „Ziehen dreht, Mausrad zoomt.“ mit Maus, „Ein Finger dreht, zwei Finger zoomen, Doppeltipp setzt zurück.“ unter 960 px Breite und auf Geräten ohne Maus.
- Zwischen 961 und 1216 px Breite steht die Fahrzeugansicht gestapelt (Name und Preis links, Anfrage rechts, Bühne darunter über die ganze Breite), weil die Spalte neben der Bühne dort zu schmal wäre. Zwischen 1217 und 1340 px ist die Spalte etwas höher als die Bühne; die Bühne wächst dann um höchstens 33 px nach oben.
- Unter 388 px Breite steht in der Suche ein Auswahlfeld je Zeile, damit „Mercedes-Benz“ nie abgeschnitten ist. Bei 1366 x 650 liegt der Suchknopf unter dem Falz (784 px); verlangt ist der Falz bei 1280 x 800.
- Die vorausgefüllte Anfrage nennt Modell, Preis und „Fahrzeug-ID bmw-430i-2021“; dieselbe ID steht im Datenblatt. Die Preiszelle im Datenblatt ist dafür entfallen.
- Die Tabellenziffern der Schrift sind eine eigene, schreibmaschinenartige Zeichnung mit durchgestrichener Null. Ich setze deshalb die normalen Ziffern; die drei Preise stehen nie in einer Spalte untereinander.
- `bau/bau.py` erzeugt die beiden Fahrzeugansichten aus einer Vorlage (Aufruf aus dem Ordner des Entwurfs). `arbeit/` enthält die Messskripte, `npm/` nur die Schriftpakete für die Auswahl.
