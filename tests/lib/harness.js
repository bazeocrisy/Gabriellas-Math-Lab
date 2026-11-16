// Test harness for the hub: static server under /StudyNova/ (like GitHub Pages) + headless Chrome/Edge over CDP.
// Adapted from Study Scoop's harness. No dependencies (Node 22+ for the built-in WebSocket).
// The Math app has its own harness in tests/math/lib (owned with the Math app).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BASE = '/StudyNova/';
export const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

/**
 * `root` is the folder served at BASE: the repository by default, or a built site folder (scripts/build-site.js).
 * `overlay` maps a path under BASE (e.g. "data/weeks.json") to a repository file that replaces it.
 */
export async function startServer({ overlay = {}, root = ROOT, port = 0 } = {}) {
  root = path.resolve(root);
  const missing = [];
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    // Chrome requests a tab icon when an original image opens in a new tab.
    // No icon is supplied; answer that browser-generated request without recording a broken app link.
    if (url === '/favicon.ico') { res.writeHead(204).end(); return; }
    if (!url.startsWith(BASE)) { missing.push(url); res.writeHead(404).end(); return; }
    const rel = url.slice(BASE.length) || 'index.html';
    const base = overlay[rel] ? ROOT : root;
    let file = path.join(base, overlay[rel] || rel);
    if (!file.startsWith(base + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { missing.push(url); res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { origin: `http://127.0.0.1:${server.address().port}`, missing, close: () => server.close() };
}

export async function startBrowser() {
  const candidates = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const exe = candidates.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sn-chrome-'));
  // Chrome refuses to start as root (containers) unless its sandbox is turned off; CI runs as a normal user.
  const rootFlags = typeof process.getuid === 'function' && process.getuid() === 0 ? ['--no-sandbox'] : [];
  const proc = spawn(exe, [...rootFlags, '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let port;
  for (let i = 0; i < 150 && !port; i++) {
    await new Promise((r) => setTimeout(r, 100));
    try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch { /* not ready */ }
  }
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let nextId = 0;
  const pending = new Map();
  const errors = [];
  const requests = [];   // every URL the page asked for
  const failures = [];   // HTTP errors and network failures
  const urlById = new Map();
  let loadWaiters = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    const p = msg.params;
    if (msg.method === 'Page.loadEventFired') { loadWaiters.forEach((r) => r()); loadWaiters = []; }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) {
      errors.push(`console.${p.type}: ${p.args.map((a) => a.value || a.description).join(' ')}`);
    }
    if (msg.method === 'Log.entryAdded' && p.entry.level === 'error' && p.entry.source !== 'network') errors.push(`log: ${p.entry.text}`);
    if (msg.method === 'Network.requestWillBeSent') { requests.push(p.request.url); urlById.set(p.requestId, p.request.url); }
    if (msg.method === 'Network.responseReceived' && p.response.status >= 400) failures.push(`${p.response.status} ${p.response.url}`);
    if (msg.method === 'Network.loadingFailed' && !p.canceled) failures.push(`failed ${urlById.get(p.requestId)} ${p.errorText}`);
  });
  // A browser command that never answers fails after 60 s with its name, instead of stalling a CI job silently.
  const send = (method, params = {}) => {
    const id = ++nextId;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((r, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`browser command timed out after 60 s: ${method} ${JSON.stringify(params).slice(0, 200)}`)); }, 60000);
      pending.set(id, (msg) => { clearTimeout(timer); r(msg); });
    });
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Log.enable');
  const b = {
    errors, requests, failures, send,
    async js(expr) {
      const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'evaluate failed');
      return r.result.result.value;
    },
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    /** A signature of the rendered view: the hub's data-ready marker if it sets one, else the route and main heading. */
    async signature() {
      return b.js(`const app = document.getElementById('app') || document.querySelector('main');
        const h = document.querySelector('main h1, #app h1, h1');
        return app && app.dataset.ready ? 'ready:' + app.dataset.ready : (h && h.textContent.trim() ? location.hash + '|' + h.textContent.trim() + '|' + (app ? app.innerHTML.length : 0) : '');`);
    },
    /** Wait until the hub has rendered a view different from `previous` (and has stopped changing). */
    async ready(previous) {
      let last = '', stable = 0;
      for (let i = 0; i < 160; i++) {
        const v = await b.signature();
        if (v && v !== previous) { if (v === last) { if (++stable >= 2) return v; } else stable = 0; }
        last = v;
        await b.wait(50);
      }
      throw new Error('page did not finish rendering (no main heading appeared)');
    },
    /** A fresh page load (via about:blank, so a hash-only change still reloads and focus starts at the top). */
    async load(url) {
      for (const target of ['about:blank', url]) {
        const loaded = new Promise((r) => { loadWaiters.push(r); setTimeout(r, 10000); });
        await send('Page.navigate', { url: target });
        await loaded;
      }
      return b.ready();
    },
    /** Change the hash (a same-page navigation) and wait for the new render. */
    async hash(h) {
      const before = await b.signature();
      await b.js(`location.hash = ${JSON.stringify(h)};`);
      return b.ready(before);
    },
    async initScript(source) { await send('Page.addScriptToEvaluateOnNewDocument', { source }); },
    async viewport(width, height, mobile = width < 1024) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    },
    async media(type = '', features = []) { await send('Emulation.setEmulatedMedia', { media: type, features }); },
    async shot(file) {
      const m = await b.js('return { w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight };');
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: m.w, height: Math.min(m.h, 8000), scale: 1 } });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    },
    /** Types text into the focused field, like a keyboard would. */
    async type(text) { await send('Input.insertText', { text }); },
    /** Waits until a page condition is true (never a fixed delay); fails with the last value seen. */
    async waitFor(expr, timeout = 5000) {
      let last;
      for (const end = Date.now() + timeout; Date.now() < end;) {
        last = await b.js(`return (${expr});`);
        if (last) return last;
        await b.wait(40);
      }
      throw new Error(`timed out waiting for ${expr} (last: ${JSON.stringify(last)})`);
    },
    /** A real mouse click in the middle of an element (as a child's click or tap would land), not a script click. */
    async clickAt(selector) {
      const r = await b.js(`const el = document.querySelector(${JSON.stringify(selector)}); el.scrollIntoView({ block: 'center' }); const q = el.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2];`);
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', { type, x: r[0], y: r[1], button: type === 'mouseMoved' ? 'none' : 'left', clickCount: type === 'mouseMoved' ? 0 : 1 });
      }
    },
    async key(key, shift = false) {
      const vk = { Tab: 9, Enter: 13, ' ': 32 }[key] || 0;
      const mods = shift ? 8 : 0;
      const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: vk, modifiers: mods, text });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: vk, modifiers: mods });
    },
    close() {
      try { ws.send(JSON.stringify({ id: ++nextId, method: 'Browser.close' })); } catch { /* ignore */ }
      try { ws.close(); } catch { /* ignore */ }
      try {
        if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
        else proc.kill();
      } catch { /* ignore */ }
    },
  };
  return b;
}
