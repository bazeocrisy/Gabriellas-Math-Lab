// Load the app's classic browser scripts into Node (they attach to globalThis.GML).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const LESSONS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10'].filter((id) => fs.existsSync(path.join(ROOT, 'curriculum/decimals', id, 'bank.js')));
export const CORE = ['js/decimal.js', 'js/words.js', 'js/models.js', 'js/engine.js', 'js/kit.js', 'curriculum/decimals/lessons.js',
  ...LESSONS.flatMap((id) => [`curriculum/decimals/${id}/bank.js`, `curriculum/decimals/${id}/lesson.js`])];

export function loadGML(files = CORE) {
  globalThis.GML = {};
  for (const f of files) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
  return globalThis.GML;
}
