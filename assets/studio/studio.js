// KMC Motors · Studio: Kopfzeile beim Scrollen, Karte erst auf Klick, Bestand ausklappen, Held-Video, Bildwechsel auf der Fahrzeugseite
(() => {
  const top = document.querySelector('.top');
  if (top) {
    const f = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
  }
  const KEY = 'kmc-karte';
  const ladeKarte = (box) => {
    if (box.classList.contains('is-geladen')) return;
    const f = document.createElement('iframe');
    f.src = box.dataset.karte;
    f.title = 'Karte: Standort KMC Motors';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    box.querySelectorAll(':scope > *').forEach((x) => { x.hidden = true; });
    box.appendChild(f);
    const weg = document.createElement('button');
    weg.type = 'button'; weg.className = 'btn map__weg'; weg.textContent = 'Karte ausblenden';
    weg.addEventListener('click', () => {
      try { localStorage.removeItem(KEY); } catch (e) {}
      f.remove(); weg.remove(); box.classList.remove('is-geladen');
      box.querySelectorAll(':scope > *').forEach((x) => { x.hidden = false; });
    });
    box.appendChild(weg);
    box.classList.add('is-geladen');
  };
  document.querySelectorAll('[data-karte]').forEach((box) => {
    const k = box.querySelector('[data-karte-laden]');
    if (k) k.addEventListener('click', () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} ladeKarte(box); });
    let ok = false; try { ok = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (ok) ladeKarte(box);
  });
  document.querySelectorAll('[data-mehr]').forEach((k) => k.addEventListener('click', () => {
    const box = document.getElementById(k.getAttribute('aria-controls'));
    const auf = k.getAttribute('aria-expanded') !== 'true';
    box.hidden = !auf;
    k.setAttribute('aria-expanded', String(auf));
    k.textContent = auf ? k.dataset.zu : k.dataset.auf;
    if (!auf) k.closest('.sec').scrollIntoView({ behavior: 'smooth' });
  }));
  const vid = document.querySelector('[data-held-video]');
  if (vid && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { vid.removeAttribute('autoplay'); vid.pause(); }
  const bild = document.getElementById('dp-bild');
  document.querySelectorAll('.dp__thumbs button').forEach((b, _, alle) => b.addEventListener('click', () => {
    bild.src = b.dataset.src; bild.alt = b.dataset.alt;
    alle.forEach((x) => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'true');
  }));
})();
