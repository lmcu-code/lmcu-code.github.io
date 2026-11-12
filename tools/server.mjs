#!/usr/bin/env node
// Kleiner Vorschau-Server ohne Abhängigkeiten: node tools/server.mjs [port]
// Danach im Browser: http://localhost:8080/ (Website) und http://localhost:8080/tools/hotspots.html (Hotspot-Editor)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2]) || 8080;
const typen = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

http.createServer((anfrage, antwort) => {
  let datei = path.join(wurzel, decodeURIComponent(new URL(anfrage.url, 'http://x').pathname));
  if (!datei.startsWith(wurzel)) { antwort.writeHead(403); return antwort.end(); }
  try {
    if (fs.statSync(datei).isDirectory()) datei = path.join(datei, 'index.html');
    const inhalt = fs.readFileSync(datei);
    antwort.writeHead(200, { 'content-type': typen[path.extname(datei).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    antwort.end(inhalt);
  } catch {
    antwort.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    antwort.end('Nicht gefunden');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Vorschau läuft: http://localhost:${port}/`);
  console.log(`Hotspot-Editor:  http://localhost:${port}/tools/hotspots.html`);
  console.log('Beenden mit Strg+C');
});
