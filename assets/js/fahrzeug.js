// KMC Motors, Fahrzeugseite: Ansichtswechsel, 3D-Ansicht (lädt erst auf Wunsch), 360°-Ansicht, Hotspots.
// Fallback-Kette: 3D-Modell (GLB) → 360°-Bilder → Galerie → „Foto folgt“. Ohne JavaScript bleiben Bilder, Liste und Anfrage nutzbar.
(() => {
  const datenEl = document.getElementById("fahrzeug-daten");
  const buehne = document.querySelector(".buehne");
  if (!datenEl || !buehne) return;
  const d = JSON.parse(datenEl.textContent);
  const T = d.texte;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.anim === "aus";
  const drei = buehne.querySelector(".drei");
  const startKnopf = buehne.querySelector(".buehne__knopf");
  const stellen = [...document.querySelectorAll(".stellen__liste li[data-stelle]")];

  // ---------- Galerie: Vorschaubilder wechseln die große Ansicht ohne Sprung ----------
  const ansichten = [...buehne.querySelectorAll(".ansicht")];
  const minis = [...buehne.querySelectorAll(".minis a")];
  const zeigeAnsicht = (id, merken) => {
    if (!ansichten.some((a) => a.id === id)) return;
    for (const a of ansichten) {
      const aktiv = a.id === id;
      a.classList.toggle("ist-aktiv", aktiv);
      if (aktiv) a.removeAttribute("aria-hidden"); else a.setAttribute("aria-hidden", "true");
    }
    for (const m of minis) { if (m.getAttribute("href") === "#" + id) m.setAttribute("aria-current", "true"); else m.removeAttribute("aria-current"); }
    if (merken) history.replaceState(null, "", "#" + id);
  };
  const startAnsicht = (buehne.querySelector(".ansicht--start") || ansichten[0] || {}).id;
  buehne.classList.add("mit-js");
  zeigeAnsicht(location.hash && ansichten.some((a) => "#" + a.id === location.hash) ? location.hash.slice(1) : startAnsicht, false);
  for (const m of minis) m.addEventListener("click", (e) => { e.preventDefault(); buehne.classList.add("ist-gewechselt"); zeigeAnsicht(m.getAttribute("href").slice(1), true); });

  // ---------- Hilfen ----------
  const el = (tag, attrs = {}, kinder = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) (k === "text" ? (n.textContent = v) : k === "html" ? (n.innerHTML = v) : n.setAttribute(k, v));
    for (const c of kinder) n.append(c);
    return n;
  };
  const markiereStelle = (id) => { for (const li of stellen) li.classList.toggle("ist-gewaehlt", li.dataset.stelle === id); };
  let modus = "galerie";

  // ---------- 3D ----------
  let mv = null, info = null;
  // Gesamtansicht: auf schmalen, hohen Flächen (Handy) etwas weiter weg, damit das ganze Auto ins Bild passt
  const passeOrbit = (orbit) => {
    const m = /^(\S+)\s+(\S+)\s+([\d.]+)m$/.exec(orbit || "");
    const seiten = drei.clientWidth / Math.max(1, drei.clientHeight);
    if (!m || seiten >= 1.3) return orbit || "38deg 80deg auto";
    return `${m[1]} ${m[2]} ${(parseFloat(m[3]) * Math.min(1.8, 1.55 / seiten)).toFixed(2)}m`;
  };
  const gesamt = () => {
    if (!mv) return;
    const k = d.kamera || {};
    mv.cameraTarget = k.target || "auto auto auto";
    mv.cameraOrbit = passeOrbit(k.orbit);
    mv.fieldOfView = k.fov || "auto";
    if (ruhig) mv.jumpCameraToGoal();
    info.textContent = "";
    for (const b of mv.querySelectorAll(".hs")) b.setAttribute("aria-pressed", "false");
    markiereStelle("");
  };
  const fahre = (h) => {
    if (!mv || !h.camera) return;
    mv.cameraTarget = h.camera.target; mv.cameraOrbit = h.camera.orbit; mv.fieldOfView = h.camera.fov;
    if (ruhig) mv.jumpCameraToGoal();
    info.replaceChildren(el("strong", { text: `${h.nr} ${h.label}` }), document.createTextNode(h.text));
    for (const b of mv.querySelectorAll(".hs")) b.setAttribute("aria-pressed", String(b.dataset.id === h.id));
    markiereStelle(h.id);
  };
  const zuBildern = () => {
    buehne.classList.remove("ist-3d", "ist-360");
    drei.hidden = true; modus = "galerie";
    startKnopf?.focus();
  };
  async function starte3d(danach) {
    buehne.classList.add("ist-3d"); drei.hidden = false; modus = "3d";
    if (mv) { if (danach) danach(); return; }
    const status = el("p", { class: "drei__status", role: "status", text: T.lade3d });
    drei.replaceChildren(status);
    // Decoder-Orte VOR dem Laden setzen, sonst holt model-viewer sie von fremden Servern.
    const v = new URL(d.basis + "assets/vendor/model-viewer/", document.baseURI).href;
    self.ModelViewerElement = self.ModelViewerElement || {};
    self.ModelViewerElement.meshoptDecoderLocation = v + "meshopt_decoder.js";
    self.ModelViewerElement.dracoDecoderLocation = v + "draco/";
    self.ModelViewerElement.ktx2TranscoderLocation = v + "basis/";
    self.ModelViewerElement.lottieLoaderLocation = v + "nicht-benutzt.js";
    try {
      await import(v + "model-viewer.min.js");
    } catch (fehler) { return scheitern3d(); }
    const k = d.kamera || {};
    mv = el("model-viewer", {
      src: d.glb, alt: T.alt3d, "camera-controls": "", "touch-action": "pan-y", "interaction-prompt": "none",
      "camera-orbit": passeOrbit(k.orbit), "camera-target": k.target || "auto auto auto", "field-of-view": k.fov || "auto",
      "min-camera-orbit": "auto auto 0.2m", "min-field-of-view": "5deg", "interpolation-decay": ruhig ? "1" : "200",
      "environment-image": "legacy", exposure: "0.8", "tone-mapping": "aces", "shadow-intensity": "1", loading: "eager", reveal: "auto",
    });
    for (const h of d.hotspots) {
      if (!h.position) continue;
      const b = el("button", { type: "button", class: `hs${h.kind === "zustand" ? " hs--zustand" : ""}`, slot: `hotspot-${h.id}`, "data-position": h.position, "data-normal": h.normal || null, "data-nr": h.nr, "data-id": h.id, "aria-pressed": "false", "aria-label": `${h.nr}. ${h.label}: ${h.text}` });
      b.addEventListener("click", () => fahre(h));
      mv.append(b);
    }
    info = el("p", { class: "drei__info", "aria-live": "polite" });
    const gesamtKnopf = el("button", { type: "button", class: "knopf knopf--linie" }, [T.gesamt]);
    gesamtKnopf.addEventListener("click", gesamt);
    const zurueck = el("button", { type: "button", class: "knopf knopf--linie" }, [T.schliessen]);
    zurueck.addEventListener("click", zuBildern);
    const leiste = el("div", { class: "drei__leiste" }, [gesamtKnopf, zurueck]);
    mv.addEventListener("dblclick", gesamt);
    mv.addEventListener("error", scheitern3d, { once: true });
    mv.addEventListener("load", () => { status.remove(); if (danach) danach(); }, { once: true });
    drei.replaceChildren(mv, leiste, info, status);
    const hilfe = el("p", { class: "drei__hilfe", text: T.bedienung3d });
    drei.after(hilfe);
  }
  function scheitern3d() {
    mv?.remove(); mv = null;
    buehne.classList.remove("ist-3d");
    if (d.spin && d.spin.length) return starte360(null, T.fehler3d);
    drei.hidden = true; modus = "galerie";
    const meldung = el("p", { class: "drei__hilfe", role: "status", text: T.fehler3d });
    buehne.querySelector(".buehne__leiste")?.after(meldung);
    if (startKnopf) startKnopf.hidden = true;
  }

  // ---------- 360° ----------
  let spin = null;
  function starte360(danach, hinweis) {
    buehne.classList.add("ist-360"); drei.hidden = false; modus = "360";
    if (spin) { if (danach) danach(); return; }
    const n = d.spin.length;
    const bild = el("img", { src: d.spin[0], alt: "", draggable: "false" });
    const punkt = el("span");
    const flaeche = el("div", { class: "spin", tabindex: "0", role: "slider", "aria-label": T.bedienung360, "aria-valuemin": "1", "aria-valuemax": String(n), "aria-valuenow": "1", "aria-valuetext": T.ansicht360.replace("{n}", 1).replace("{gesamt}", n) }, [bild, el("div", { class: "spin__regler", "aria-hidden": "true" }, [punkt])]);
    const status = el("p", { class: "drei__status", role: "status", text: T.lade360 });
    const zurueck = el("button", { type: "button", class: "knopf knopf--linie" }, [T.schliessen]);
    zurueck.addEventListener("click", zuBildern);
    drei.replaceChildren(flaeche, el("div", { class: "drei__leiste" }, [el("span"), zurueck]), status);
    drei.after(el("p", { class: "drei__hilfe", role: hinweis ? "status" : null, text: hinweis ? `${hinweis} ${T.bedienung360}` : T.bedienung360 }));
    // Bilder vorladen
    let geladen = 0;
    const cache = d.spin.map((src) => { const i = new Image(); i.onload = i.onerror = () => { if (++geladen === n) status.remove(); }; i.src = src; return i; });
    let bildNr = 0;
    const setze = (i) => {
      bildNr = ((Math.round(i) % n) + n) % n;
      bild.src = cache[bildNr].src;
      punkt.style.left = `${(bildNr / (n - 1)) * 100}%`;
      flaeche.setAttribute("aria-valuenow", String(bildNr + 1));
      flaeche.setAttribute("aria-valuetext", T.ansicht360.replace("{n}", bildNr + 1).replace("{gesamt}", n));
    };
    let ziehen = null, schwung = 0, raf = 0;
    flaeche.addEventListener("pointerdown", (e) => { ziehen = { x: e.clientX, nr: bildNr, t: performance.now(), lx: e.clientX }; schwung = 0; cancelAnimationFrame(raf); flaeche.setPointerCapture(e.pointerId); });
    flaeche.addEventListener("pointermove", (e) => {
      if (!ziehen) return;
      const jetzt = performance.now();
      schwung = (e.clientX - ziehen.lx) / Math.max(1, jetzt - ziehen.t);
      ziehen.lx = e.clientX; ziehen.t = jetzt;
      setze(ziehen.nr - (e.clientX - ziehen.x) / 12);
    });
    const loslassen = () => {
      if (!ziehen) return;
      ziehen = null;
      if (ruhig) return;
      let v = -schwung * 1.2, pos = bildNr;
      const lauf = () => { v *= 0.92; pos += v; setze(pos); if (Math.abs(v) > 0.05) raf = requestAnimationFrame(lauf); };
      if (Math.abs(v) > 0.2) raf = requestAnimationFrame(lauf);
    };
    flaeche.addEventListener("pointerup", loslassen);
    flaeche.addEventListener("pointercancel", loslassen);
    flaeche.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setze(bildNr - 1); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { setze(bildNr + 1); e.preventDefault(); }
      if (e.key === "Home") { setze(0); e.preventDefault(); }
    });
    spin = { setze };
    flaeche.focus({ preventScroll: true });
    if (danach) danach();
  }

  // ---------- Start-Knopf ----------
  if (startKnopf) startKnopf.addEventListener("click", () => (startKnopf.dataset.start === "3d" ? starte3d() : starte360()));

  // ---------- Liste der Stellen: Knopf „Zeigen“ ----------
  for (const li of stellen) {
    const h = d.hotspots.find((x) => x.id === li.dataset.stelle);
    if (!h) continue;
    const knopf = el("button", { type: "button", class: "knopf knopf--linie stelle__knopf" }, [li.dataset.zeigen || "Zeigen"]);
    knopf.setAttribute("aria-label", `${h.label}: ${li.dataset.zeigen || "Zeigen"}`);
    knopf.addEventListener("click", () => {
      buehne.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "center" });
      if (d.stufe === "3d" && d.glb) return modus === "3d" && mv ? fahre(h) : starte3d(() => fahre(h));
      if (d.spin.length && h.spinFrame != null) return starte360(() => { spin.setze(h.spinFrame); markiereStelle(h.id); });
      const ziel = h.ansicht === "heck" ? ansichten.find((a) => /heck/.test(a.id)) : buehne.querySelector(".ansicht--start");
      if (ziel) { zuBildern(); zeigeAnsicht(ziel.id, false); markiereStelle(h.id); }
    });
    li.querySelector("div")?.append(knopf);
  }
})();
