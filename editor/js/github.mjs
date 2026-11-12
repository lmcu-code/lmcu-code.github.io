// Veröffentlichen über die GitHub-API direkt aus dem Browser (Git-Data-API: blobs, tree, commit, ref).
// Das Token liegt nur im eigenen Browser (localStorage) und wird nie ins Repo geschrieben.
const SCHLUESSEL = 'kmc-editor-token';
export const token = { holen: () => { try { return localStorage.getItem(SCHLUESSEL) || ''; } catch { return ''; } }, setzen: (t) => { try { if (t) localStorage.setItem(SCHLUESSEL, t); else localStorage.removeItem(SCHLUESSEL); } catch { /* privat */ } } };
export function apiBasis() {
  const p = new URLSearchParams(location.search).get('api');
  try { if (p) localStorage.setItem('kmc-editor-api', p); return p || localStorage.getItem('kmc-editor-api') || 'https://api.github.com'; } catch { return p || 'https://api.github.com'; }
}

export class GitFehler extends Error {
  constructor(art, text, status) { super(text); this.art = art; this.status = status; }
}
async function api(pfad, { methode = 'GET', koerper, mitToken = true } = {}) {
  const t = token.holen();
  let r;
  try {
    r = await fetch(apiBasis() + pfad, {
      method: methode, cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(t && mitToken ? { Authorization: `Bearer ${t}` } : {}), ...(koerper ? { 'Content-Type': 'application/json' } : {}) },
      body: koerper ? JSON.stringify(koerper) : undefined,
    });
  } catch {
    throw new GitFehler('netz', navigator.onLine === false ? 'Keine Internetverbindung. Ihre Änderungen sind als Entwurf gespeichert; veröffentlichen Sie, sobald Sie wieder online sind.' : 'GitHub ist gerade nicht erreichbar. Ihre Änderungen sind sicher als Entwurf gespeichert. Bitte in ein paar Minuten noch einmal versuchen.');
  }
  if (r.status === 401) throw new GitFehler('token', 'Das Token wird von GitHub nicht angenommen. Es ist falsch, abgelaufen oder widerrufen. Bitte unter „Zugang“ ein neues Token eintragen.', 401);
  if (r.status === 403 && r.headers.get('x-ratelimit-remaining') === '0') throw new GitFehler('limit', 'GitHub hat zu viele Anfragen gezählt. Bitte in einer Stunde erneut versuchen oder ein Token eintragen.', 403);
  if (r.status === 403 || r.status === 404) throw new GitFehler('rechte', 'Das Token darf dieses Repository nicht ändern. Bitte prüfen: nur dieses Repository ausgewählt, Berechtigung „Contents: Read and write“.', r.status);
  if (r.status === 409 || r.status === 422) throw new GitFehler('konflikt', 'Jemand hat zwischendurch veröffentlicht.', r.status);
  if (!r.ok) throw new GitFehler('unbekannt', `GitHub meldet einen Fehler (${r.status}). Bitte später erneut versuchen.`, r.status);
  return r.status === 204 ? null : r.json();
}

export async function pruefeToken(repo) {
  const info = await api(`/repos/${repo}`);
  if (!info.permissions || !info.permissions.push) throw new GitFehler('rechte', 'Das Token kann das Repository lesen, aber nicht schreiben. Bitte „Contents: Read and write“ auswählen.', 403);
  return info;
}
export const kopf = (repo, zweig) => api(`/repos/${repo}/git/ref/heads/${zweig}`, { mitToken: !!token.holen() }).then((r) => r.object.sha);
export async function dateiAmStand(repo, sha, pfad) {
  const r = await api(`/repos/${repo}/contents/${pfad}?ref=${sha}`, { mitToken: !!token.holen() });
  const bin = atob(r.content.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
export async function versionen(repo, zweig, anzahl = 12) {
  const l = await api(`/repos/${repo}/commits?sha=${zweig}&per_page=${anzahl}`, { mitToken: !!token.holen() });
  return l.map((c) => ({ sha: c.sha, text: c.commit.message.split('\n')[0], zeit: c.commit.committer?.date || c.commit.author?.date, von: c.commit.author?.name }));
}

const b64 = async (inhalt) => {
  const bytes = typeof inhalt === 'string' ? new TextEncoder().encode(inhalt) : new Uint8Array(await inhalt.arrayBuffer());
  let s = ''; const n = 0x8000;
  for (let i = 0; i < bytes.length; i += n) s += String.fromCharCode.apply(null, bytes.subarray(i, i + n));
  return btoa(s);
};
// dateien: [{ pfad, inhalt: string | Blob | null (löschen) }]
export async function veroeffentliche({ repo, zweig, eltern, dateien, nachricht, schritt = () => {} }) {
  const commit = await api(`/repos/${repo}/git/commits/${eltern}`);
  const eintraege = [];
  let i = 0;
  for (const d of dateien) {
    i++;
    if (d.inhalt === null) { eintraege.push({ path: d.pfad, mode: '100644', type: 'blob', sha: null }); continue; }
    const blob = await api(`/repos/${repo}/git/blobs`, { methode: 'POST', koerper: { content: await b64(d.inhalt), encoding: 'base64' } });
    eintraege.push({ path: d.pfad, mode: '100644', type: 'blob', sha: blob.sha });
    schritt(d, i, dateien.length);
  }
  const baum = await api(`/repos/${repo}/git/trees`, { methode: 'POST', koerper: { base_tree: commit.tree.sha, tree: eintraege } });
  const neu = await api(`/repos/${repo}/git/commits`, { methode: 'POST', koerper: { message: nachricht, tree: baum.sha, parents: [eltern] } });
  await api(`/repos/${repo}/git/refs/heads/${zweig}`, { methode: 'PATCH', koerper: { sha: neu.sha, force: false } });
  return neu.sha;
}

// Dreiwege-Zusammenführung von JSON: nimmt fremde Änderungen, wo nur sie geändert haben, eigene, wo nur ich geändert habe.
export function fuehreZusammen(basis, meine, ihre, pfad = '', konflikte = []) {
  const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (gleich(meine, ihre)) return meine;
  if (gleich(basis, ihre)) return meine;
  if (gleich(basis, meine)) return ihre;
  const obj = (x) => x && typeof x === 'object' && !Array.isArray(x);
  if (obj(basis) && obj(meine) && obj(ihre)) {
    const out = {};
    for (const k of new Set([...Object.keys(meine), ...Object.keys(ihre)])) {
      const v = fuehreZusammen(basis?.[k], meine[k], ihre[k], pfad ? `${pfad}.${k}` : k, konflikte);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  konflikte.push(pfad || '(ganze Datei)');
  return meine;
}
