// Bilder im Browser verkleinern (WebP, srcset-Stufen), zuschneiden, Fokuspunkt. Keine Uploads an fremde Dienste.
import { legeBlobAb } from './zustand.mjs';

export const STUFEN = { foto: [480, 800, 1400], spin: [1200], hero: [800, 1400, 2000], klein: [480, 800] };
export const slugify = (x) => String(x).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'bild';

async function oeffne(datei) {
  if ('createImageBitmap' in window) { try { return await createImageBitmap(datei, { imageOrientation: 'from-image' }); } catch { /* weiter mit <img> */ } }
  const url = URL.createObjectURL(datei);
  const img = new Image(); img.src = url; await img.decode(); URL.revokeObjectURL(url);
  return img;
}
// zuschnitt: { x, y, b, h } in Anteilen 0..1 (optional)
export async function verarbeite(datei, { stufen = STUFEN.foto, basisPfad, zuschnitt = null, qualitaet = 0.82 }) {
  const quelle = await oeffne(datei);
  const qw = quelle.width, qh = quelle.height;
  const z = zuschnitt ? { x: zuschnitt.x * qw, y: zuschnitt.y * qh, b: zuschnitt.b * qw, h: zuschnitt.h * qh } : { x: 0, y: 0, b: qw, h: qh };
  const ergebnisse = [];
  const breiten = [...new Set(stufen.map((w) => Math.min(w, Math.round(z.b))))].sort((a, b) => a - b);
  for (const w of breiten) {
    const hgt = Math.round((z.h / z.b) * w);
    const c = document.createElement('canvas'); c.width = w; c.height = hgt;
    const ctx = c.getContext('2d', { alpha: true }); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(quelle, z.x, z.y, z.b, z.h, 0, 0, w, hgt);
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/webp', qualitaet));
    const pfad = `${basisPfad}-${w}.webp`;
    await legeBlobAb(pfad, blob, { w, h: hgt });
    ergebnisse.push({ pfad, w, h: hgt, groesse: blob.size });
  }
  quelle.close?.();
  return { gross: ergebnisse.at(-1), alle: ergebnisse, original: { w: qw, h: qh, groesse: datei.size } };
}
export function istBild(f) { return /^image\/(jpeg|png|webp|avif|gif)$/.test(f.type) || /\.(jpe?g|png|webp|avif)$/i.test(f.name); }
