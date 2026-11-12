// Entwürfe im eigenen Browser: IndexedDB (Daten und Bilder als Blobs). Nichts verlässt den Browser.
const DB = 'kmc-editor', VERSION = 1;
let dbP = null;
function db() {
  if (!dbP) dbP = new Promise((ok, fehl) => {
    const r = indexedDB.open(DB, VERSION);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('entwurf')) d.createObjectStore('entwurf'); if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs'); };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => fehl(r.error);
  });
  return dbP;
}
const tx = async (store, art, fn) => { const d = await db(); return new Promise((ok, fehl) => { const t = d.transaction(store, art); const s = t.objectStore(store); const r = fn(s); t.oncomplete = () => ok(r && 'result' in r ? r.result : undefined); t.onerror = () => fehl(t.error); }); };

export const ladeEntwurf = () => tx('entwurf', 'readonly', (s) => s.get('aktuell'));
export const speichereEntwurf = (wert) => tx('entwurf', 'readwrite', (s) => s.put(wert, 'aktuell'));
export const loescheEntwurf = () => tx('entwurf', 'readwrite', (s) => s.delete('aktuell'));
export const speichereBlob = (pfad, blob) => tx('blobs', 'readwrite', (s) => s.put(blob, pfad));
export const loescheBlob = (pfad) => tx('blobs', 'readwrite', (s) => s.delete(pfad));
export async function alleBlobs() {
  const d = await db();
  return new Promise((ok, fehl) => {
    const t = d.transaction('blobs', 'readonly'); const s = t.objectStore('blobs'); const m = new Map();
    const c = s.openCursor();
    c.onsuccess = () => { const cur = c.result; if (cur) { m.set(cur.key, cur.value); cur.continue(); } };
    t.oncomplete = () => ok(m); t.onerror = () => fehl(t.error);
  });
}
export const leereBlobs = () => tx('blobs', 'readwrite', (s) => s.clear());
