// Minimaler ZIP-Schreiber (Methode „gespeichert“, ohne Kompression), nur Browser-APIs.
const TAB = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TAB[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
// dateien: [{ pfad, daten: Uint8Array }]
export function baueZip(dateien) {
  const enc = new TextEncoder(); const teile = []; const zentral = []; let off = 0;
  const jetzt = new Date();
  const zeit = ((jetzt.getHours() << 11) | (jetzt.getMinutes() << 5) | (jetzt.getSeconds() >> 1)) & 0xffff;
  const datum = (((jetzt.getFullYear() - 1980) << 9) | ((jetzt.getMonth() + 1) << 5) | jetzt.getDate()) & 0xffff;
  for (const d of dateien) {
    const name = enc.encode(d.pfad); const crc = crc32(d.daten); const n = d.daten.length;
    const kopf = new DataView(new ArrayBuffer(30));
    kopf.setUint32(0, 0x04034b50, true); kopf.setUint16(4, 20, true); kopf.setUint16(6, 0x0800, true); kopf.setUint16(8, 0, true);
    kopf.setUint16(10, zeit, true); kopf.setUint16(12, datum, true); kopf.setUint32(14, crc, true); kopf.setUint32(18, n, true); kopf.setUint32(22, n, true);
    kopf.setUint16(26, name.length, true); kopf.setUint16(28, 0, true);
    teile.push(new Uint8Array(kopf.buffer), name, d.daten);
    const z = new DataView(new ArrayBuffer(46));
    z.setUint32(0, 0x02014b50, true); z.setUint16(4, 20, true); z.setUint16(6, 20, true); z.setUint16(8, 0x0800, true); z.setUint16(10, 0, true);
    z.setUint16(12, zeit, true); z.setUint16(14, datum, true); z.setUint32(16, crc, true); z.setUint32(20, n, true); z.setUint32(24, n, true);
    z.setUint16(28, name.length, true); z.setUint32(42, off, true);
    zentral.push(new Uint8Array(z.buffer), name);
    off += 30 + name.length + n;
  }
  const groesse = zentral.reduce((s, x) => s + x.length, 0);
  const ende = new DataView(new ArrayBuffer(22));
  ende.setUint32(0, 0x06054b50, true); ende.setUint16(8, dateien.length, true); ende.setUint16(10, dateien.length, true); ende.setUint32(12, groesse, true); ende.setUint32(16, off, true);
  return new Blob([...teile, ...zentral, new Uint8Array(ende.buffer)], { type: 'application/zip' });
}
