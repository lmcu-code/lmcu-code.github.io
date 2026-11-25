// KMC Motors · Studio: Kopfzeile beim Scrollen, Karte erst auf Klick, Bildwechsel auf der Fahrzeugseite
(() => {
  const top = document.querySelector('.top');
  if (top) {
    const f = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
  }
  document.querySelectorAll('[data-karte-laden]').forEach((k) => k.addEventListener('click', () => {
    const box = k.closest('[data-karte]');
    const f = document.createElement('iframe');
    f.src = box.dataset.karte;
    f.title = 'Karte: Standort KMC Motors';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.querySelectorAll(':scope > *').forEach((x) => { x.hidden = true; });
    box.appendChild(f);
  }));
  const bild = document.getElementById('dp-bild');
  document.querySelectorAll('.dp__thumbs button').forEach((b, _, alle) => b.addEventListener('click', () => {
    bild.src = b.dataset.src; bild.alt = b.dataset.alt;
    alle.forEach((x) => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'true');
  }));
})();
