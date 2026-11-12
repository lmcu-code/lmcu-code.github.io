# Zwei Designrichtungen zur Wahl

Schritt 2 aus `docs/MASTER-PROMPT.md`: zwei klar verschiedene Richtungen, je als statischer Entwurf mit Startbildschirm und Fahrzeugansicht. Bitte eine wählen. Erst danach wird das System in `design.md` festgeschrieben und die Seite gebaut.

| | A · Dunkler Showroom, Kupferlicht | B · Heller Galerieraum, dunkle Rahmen |
|---|---|---|
| Ordner | `a-showroom/` | `b-galerie/` |
| Start | `a-showroom/start.html` | `b-galerie/start.html` |
| Fahrzeugansicht | `a-showroom/fahrzeug.html`, Heck: `fahrzeug-heck.html` | `b-galerie/fahrzeug.html`, Nahansicht: `fahrzeug-nah.html` |
| Schrift | Zalando Sans Expanded und Zalando Sans | Archivo (eine variable Schrift, sehr fein und sehr kräftig) |
| Idee | Der Raum ist dunkel. Hell ist nur, was man gerade prüft: die Logo-Linie und ein kalkweißes Blatt mit den Angaben zum Auto. | Das Fenster ist der dunkle Rahmen, innen eine helle Wand. Logo und Wagen stehen darauf wie Ausstellungsstücke, jedes mit einem Schild. |
| Begründung und Picks-Block | `a-showroom/PICKS.md` | `b-galerie/PICKS.md` |
| Screenshots | `a-showroom/shots/` | `b-galerie/shots/` |

Beide am Handy nebeneinander: `handy-a-und-b.png`.

## Ansehen

```bash
python3 -m http.server 8000
```

Aus dem Hauptordner des Repos starten, dann im Browser `http://localhost:8000/entwuerfe/a-showroom/start.html` und `http://localhost:8000/entwuerfe/b-galerie/start.html` öffnen. Die Entwürfe laden Logo und Favicon aus `assets/`, deshalb nicht einzeln verschieben.

## Was die Entwürfe sind und was nicht

- Standbilder ohne JavaScript. Die Suche filtert noch nicht, die Hotspots reagieren noch nicht. Zwischen den Ansichten führen echte Links.
- Die 3D-Bühne zeigt gerenderte Standbilder eines frei lizenzierten Demo-Modells (Car Concept, © 2024 Darmstadt Graphics Group GmbH, CC BY 4.0, bearbeitet). Es trägt die Beschriftung „Demo-Modell, nicht das angebotene Fahrzeug“.
- Alle drei Fahrzeuge und alle Hotspot-Texte sind Beispiele und so gekennzeichnet. Was fehlt, steht als gestrichelter Platzhalter da (MwSt.-Angabe, Fotos, Garantiebedingungen, Zustandsbericht).
- E-Mail, WhatsApp-Nummer und Inhaber stammen aus dem Impressum-Text des Auftraggebers. Der Master-Prompt führt sie noch als unbekannt: bitte bestätigen.

## Wie geprüft wurde

Jeder Entwurf wurde von einem unabhängigen Prüfer begutachtet (`BEFUNDE.md`), danach nachgebessert und von einem zweiten Prüfer abgenommen. Stand beider Entwürfe:

- Hallmark-Prüfer (`sloplint --render`): 0 FAIL, 0 REFLEX auf allen Seiten.
- axe bei 390 und 1440 px: 0 Verstöße. Keine Konsolenfehler, keine Anfragen an fremde Server.
- Nichts abgeschnitten oder herausragend von 320 bis 1920 px. Überschrift, Satz und Suchknopf stehen bei 1280 × 800 und auf üblichen Laptop- und Handygrößen im ersten Bildschirm.
- Bekannte Grenze: Auf sehr kleinen Handys (320 px breit) liegt der Suchknopf unter dem ersten Bildschirm.

Eine dritte Richtung („Prüfbericht“, hell) wurde gebaut und verworfen, weil sie B zu ähnlich war.

## Entwurf C · nach den Referenzbildern 

`c-referenz/start.html` und `c-referenz/fahrzeug.html`: dunkler Showroom nach den fünf Referenzen des Auftraggebers (Velaro, Hellcat, Roma, Motornews, Suchleiste). Geprüft: axe 0, keine fremden Anfragen, kein Überlauf von 320 bis 1920 px, Suchknopf bei 18 Fenstergrößen im ersten Bildschirm. Startseite 343 KB beim ersten Laden. Bewusst nicht nach Hallmark: Kennzeilen vor Überschriften und Versalien-Labels (aus den Referenzen), deshalb meldet sloplint 10 FAIL je Seite.
