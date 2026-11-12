// KMC Motors, Entwurf C: kleine Verbesserungen. Ohne dieses Skript bleibt alles lesbar, sichtbar und bedienbar.
(() => {
  const WA = "https://wa.me/4915121181898?text=";
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 0. Einblenden beim Scrollen: was beim Laden schon sichtbar ist, bleibt einfach stehen
  const zeigen = [...document.querySelectorAll(".zeigen")];
  if (!ruhig && "IntersectionObserver" in window) {
    for (const el of zeigen) if (el.getBoundingClientRect().top < innerHeight) el.classList.add("ist-da");
    document.documentElement.classList.add("js-bereit");
    const io = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) if (e.isIntersecting) { e.target.classList.add("ist-da"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    for (const el of zeigen) if (!el.classList.contains("ist-da")) io.observe(el);
  }

  // 1. Kennwerte zählen hoch (nur echte Zahlen: 24, 3)
  const zahlen = [...document.querySelectorAll("[data-zaehlen]")];
  if (!ruhig && zahlen.length && "IntersectionObserver" in window) {
    const zaehle = (el) => {
      const ziel = Number(el.dataset.zaehlen), dauer = 900, t0 = performance.now();
      const schritt = (t) => {
        const p = Math.min(1, (t - t0) / dauer), k = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(ziel * k));
        if (p < 1) requestAnimationFrame(schritt);
      };
      requestAnimationFrame(schritt);
    };
    const io = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) if (e.isIntersecting) { zaehle(e.target); io.unobserve(e.target); }
    }, { threshold: 0.6 });
    for (const el of zahlen) io.observe(el);
  }

  // 2. Kopfzeile wird beim Scrollen fester; leichte Parallaxe des Autos im Hero
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

  // 3. Suche filtert die Beispielfahrzeuge (ohne JS springt das Formular nur zum Bestand)
  const suche = document.querySelector("form.suche");
  const karten = [...document.querySelectorAll(".karte")];
  const status = document.getElementById("treffer");
  if (suche && karten.length && status) {
    suche.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(suche);
      const marke = d.get("marke"), kraftstoff = d.get("kraftstoff"), preis = Number(d.get("preis")) || Infinity;
      let n = 0;
      for (const k of karten) {
        const passt = (!marke || k.dataset.marke === marke) && (!kraftstoff || k.dataset.kraftstoff === kraftstoff) && Number(k.dataset.preis) <= preis;
        k.hidden = !passt;
        if (passt) { n++; k.classList.add("ist-da"); }
      }
      status.textContent = n === 0
        ? "Kein Beispielfahrzeug passt zu Ihrer Auswahl. Den ganzen Bestand finden Sie bei mobile.de, oder fragen Sie uns direkt."
        : n === karten.length
          ? "Alle drei Beispielfahrzeuge passen zu Ihrer Auswahl."
          : `${n} von ${karten.length} Beispielfahrzeugen ${n === 1 ? "passt" : "passen"} zu Ihrer Auswahl.`;
      document.getElementById("bestand").scrollIntoView({ block: "start" });
    });
  }

  // 4. Kontaktformular: baut eine WhatsApp-Nachricht (ohne JS: mailto)
  const form = document.getElementById("formular");
  if (form) {
    const knopfText = form.querySelector("[data-ohne-js]");
    if (knopfText) knopfText.textContent = "Per WhatsApp senden";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const zeilen = ["Hallo KMC Motors,"];
      for (const [k, v] of d) if (String(v).trim()) zeilen.push(`${k}: ${String(v).trim()}`);
      const url = WA + encodeURIComponent(zeilen.join("\n"));
      const fenster = window.open(url, "_blank", "noopener");
      if (!fenster) window.location.href = url;
    });
  }

  // 5. Fahrzeugansicht: Vorschaubilder überblenden die große Ansicht ohne Sprung
  const buehne = document.querySelector(".buehne");
  if (buehne) {
    const ansichten = [...buehne.querySelectorAll(".ansicht")];
    const minis = [...document.querySelectorAll(".minis a")];
    const zeige = (id, merken) => {
      for (const a of ansichten) {
        const aktiv = a.id === id;
        a.classList.toggle("ist-aktiv", aktiv);
        if (aktiv) a.removeAttribute("aria-hidden"); else a.setAttribute("aria-hidden", "true");
      }
      for (const m of minis) {
        if (m.getAttribute("href") === "#" + id) m.setAttribute("aria-current", "true"); else m.removeAttribute("aria-current");
      }
      if (merken) history.replaceState(null, "", "#" + id);
    };
    const start = location.hash && ansichten.some((a) => "#" + a.id === location.hash) ? location.hash.slice(1) : "ansicht-seite";
    buehne.classList.add("mit-js");
    zeige(start, false);
    for (const m of minis) m.addEventListener("click", (e) => { e.preventDefault(); buehne.classList.add("ist-gewechselt"); zeige(m.getAttribute("href").slice(1), true); });
  }
})();
