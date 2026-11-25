// KMC Motors · Studio: Kopfzeile beim Scrollen, Bestand ausklappen, Held-Video, Bildwechsel auf der Fahrzeugseite
(() => {
  const top = document.querySelector('.top');
  if (top) {
    const f = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
  }
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
