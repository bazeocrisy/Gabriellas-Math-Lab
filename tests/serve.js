// Local preview: serves the site at http://127.0.0.1:<port>/StudyNova/ (the same path GitHub Pages uses).
// The hub loads JSON with fetch, so it must be served; opening index.html as a file will not work.
//   npm run serve                 the repository as it is
//   npm run serve -- --site _site the built site (after npm run build), exactly as it would be published
import path from 'node:path';
import { startServer, BASE, ROOT } from './lib/harness.js';

const arg = process.argv.indexOf('--site');
const root = arg < 0 ? ROOT : path.resolve(process.argv[arg + 1]);
const port = Number(process.env.PORT) || 0;
const server = await startServer({ root, port });
console.log(`StudyNova preview: ${server.origin}${BASE}  (serving ${path.relative(ROOT, root) || 'the repository'}; Ctrl+C to stop)`);
