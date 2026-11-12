// KMC Motors: kleine Verbesserungen für alle Seiten. Ohne dieses Skript bleibt alles lesbar, sichtbar und bedienbar.
(() => {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 0. Teilbarer Link #<fahrzeug-id> auf der Startseite öffnet direkt die Fahrzeugseite
  const ziel = decodeURIComponent(location.hash.slice(1));
  if (ziel && /^[a-z0-9-]+$/.test(ziel)) {
    const karte = document.querySelector(`.karte[id="${ziel}"] a[href*="fahrzeug/"]`);
    if (karte) { location.replace(karte.href); return; }
  }

  // 1. Einblenden beim Scrollen: was beim Laden schon sichtbar ist, bleibt einfach stehen
  const zeigen = [...document.querySelectorAll(".zeigen")];
  if (!ruhig && "IntersectionObserver" in window) {
    for (const el of zeigen) if (el.getBoundingClientRect().top < innerHeight) el.classList.add("ist-da");
    document.documentElement.classList.add("js-bereit");
    const io = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) if (e.isIntersecting) { e.target.classList.add("ist-da"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    for (const el of zeigen) if (!el.classList.contains("ist-da")) io.observe(el);
  }

  // 2. Kennwerte zählen hoch (nur echte Zahlen)
  const zahlen = [...document.querySelectorAll("[data-zaehlen]")];
  if (!ruhig && zahlen.length && "IntersectionObserver" in window) {
    const zaehle = (el) => {
      const zielZahl = Number(el.dataset.zaehlen), dauer = 900, t0 = performance.now();
      const schritt = (t) => {
        const p = Math.min(1, (t - t0) / dauer);
        el.textContent = String(Math.round(zielZahl * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(schritt);
      };
      requestAnimationFrame(schritt);
    };
    const io = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) if (e.isIntersecting) { zaehle(e.target); io.unobserve(e.target); }
    }, { threshold: 0.6 });
    for (const el of zahlen) io.observe(el);
  }

  // 3. Kopfzeile wird beim Scrollen fester; leichte Parallaxe des Autos im Hero
  const kopf = document.querySelector(".kopf");
  const heldAuto = document.querySelector(".held__auto");
  let wartet = false;
  const beimScrollen = () => {
    wartet = false;
    const y = scrollY;
    if (kopf) kopf.classList.toggle("ist-gescrollt", y > 8);
    if (heldAuto && !ruhig && y < innerHeight * 1.2) heldAuto.style.setProperty("--par", `${Math.min(12, y * 0.045).toFixed(1)}px`);
  };
  addEventListener("scroll", () => { if (!wartet) { wartet = true; requestAnimationFrame(beimScrollen); } }, { passive: true });
  beimScrollen();

  // 4. Suche: filtert und sortiert die Fahrzeuge, Auswahl steht in der URL (?marke=BMW&sort=preis)
  const suche = document.querySelector("form.suche");
  const liste = document.querySelector(".karten");
  const status = document.getElementById("treffer");
  if (suche && liste && status) {
    const karten = [...liste.querySelectorAll(".karte")];
    const felder = ["marke", "kraftstoff", "preis", "sort"];
    const anwenden = (d, merken) => {
      const marke = d.get("marke") || "", kraftstoff = d.get("kraftstoff") || "", preis = Number(d.get("preis")) || Infinity, sort = d.get("sort") || "";
      let n = 0;
      for (const k of karten) {
        const passt = (!marke || k.dataset.marke === marke) && (!kraftstoff || k.dataset.kraftstoff === kraftstoff) && (!k.dataset.preis || Number(k.dataset.preis) <= preis);
        k.hidden = !passt;
        if (passt) { n++; k.classList.add("ist-da"); }
      }
      const zahl = (k, f) => Number(k.dataset[f]) || 0;
      const reihe = [...karten].sort((a, b) =>
        sort === "preis" ? zahl(a, "preis") - zahl(b, "preis")
        : sort === "preis-ab" ? zahl(b, "preis") - zahl(a, "preis")
        : sort === "km" ? zahl(a, "km") - zahl(b, "km")
        : sort === "jahr" ? zahl(b, "jahr") - zahl(a, "jahr")
        : zahl(a, "pos") - zahl(b, "pos"));
      for (const k of reihe) liste.appendChild(k);
      const g = karten.length, sd = status.dataset;
      const text = n === 0 ? sd.tKeiner : n === g ? sd.tAlle : n === 1 ? sd.tEiner : sd.tMehrere;
      if (text) status.textContent = text.replace("{n}", n).replace("{gesamt}", g);
      if (merken) {
        const q = new URLSearchParams();
        for (const f of felder) if (d.get(f)) q.set(f, d.get(f));
        history.replaceState(null, "", `${location.pathname}${q.toString() ? "?" + q : ""}#bestand`);
      }
    };
    const url = new URLSearchParams(location.search);
    if (felder.some((f) => url.has(f))) {
      for (const f of felder) { const el = suche.elements[f]; if (el && url.has(f)) el.value = url.get(f); }
      anwenden(new FormData(suche), false);
    }
    suche.addEventListener("submit", (e) => {
      e.preventDefault();
      anwenden(new FormData(suche), true);
      document.getElementById("bestand").scrollIntoView({ block: "start" });
    });
  }

  // 5. Kontaktformular: baut eine WhatsApp-Nachricht (ohne JS: mailto)
  const form = document.getElementById("formular");
  if (form && form.dataset.wa) {
    const knopfText = form.querySelector("[data-ohne-js]");
    if (knopfText && form.dataset.knopfWa) knopfText.textContent = form.dataset.knopfWa;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const zeilen = [form.dataset.waStart || ""];
      for (const [k, v] of new FormData(form)) if (String(v).trim()) zeilen.push(`${k}: ${String(v).trim()}`);
      const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(zeilen.join("\n"))}`;
      const fenster = window.open(url, "_blank", "noopener");
      if (!fenster) window.location.href = url;
    });
  }
})();
