// The privacy rules in one place (docs/DECISIONS.md D6). scripts/build-site.js and tests/unit/*.test.js both use them.
// The repository is public: none of these may appear in anything the site publishes.

import { createHash } from 'node:crypto';

/** SHA-256 of a lowercased name (also: `node scripts/privacy.js --hash Name`). */
export const hashName = (name) => createHash('sha256').update(String(name).toLowerCase()).digest('hex');

/**
 * Personal names that must never be published (the family's names), stored only as SHA-256 hashes of the lowercased
 * name so this public repository does not itself publish them. Add a name by adding its hash here, never anywhere else.
 * A word matches if it, or the word without a trailing "s" (a possessive written without an apostrophe), is blocked.
 */
export const BLOCKED_NAME_HASHES = new Set([
  '85616c20cbae93dcfcc843beae681de3610ccaac207eba12127142c600c23ecb',
  'e98bdba91cef17ba0d5eae1f3aadcfb75c3f9fbea15d22d6c5a817395e1fcd8b',
  '9d0c52ae7023170cf8437d8683aeee910389238e7792b12c08f04f15c305ca9a',
  '5d7f15f2fce8ddb2dbef5c38be896c238ba7e0a432e396759030a853fa6b1151',
]);

/** Returns the first blocked name found in `text` (as written there), or null. */
export function findBlockedName(text, hashes = BLOCKED_NAME_HASHES) {
  const seen = new Set();
  for (const word of String(text).match(/[A-Za-z]+/g) || []) {
    const w = word.toLowerCase();
    if (seen.has(w)) continue;
    seen.add(w);
    if (hashes.has(hashName(w)) || (w.length > 3 && w.endsWith('s') && hashes.has(hashName(w.slice(0, -1))))) return word;
  }
  return null;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href && process.argv[2] === '--hash') {
  for (const n of process.argv.slice(3)) console.log(hashName(n));
}

/** A file name that looks like a scanned textbook or worksheet page (page-001.png, page_12.jpg, scan-3.webp, IMG_1234.jpg). */
export const SCAN_NAME = /(?:^|[/_-])(?:page|pg|scan|img)[-_ ]?\d{1,4}\.(?:png|jpe?g|webp|gif|heic|tiff?|bmp)$/i;

/** Photo formats that never belong on the site (camera photos, scans). Drawings are SVG; icons are PNG. */
export const PHOTO_EXT = /\.(?:jpe?g|heic|heif|tiff?|bmp)$/i;

/** Third-party trackers and analytics. */
export const ANALYTICS = /gtag\(|google-analytics|googletagmanager|plausible\.io|matomo|fbq\(|hotjar|segment\.com|mixpanel|clarity\.ms/i;

/** Script, stylesheet or font loaded from another site (https:// or protocol-relative). */
export const EXTERNAL_LOAD = [
  /<script[^>]*\ssrc\s*=\s*["']?(?:https?:)?\/\//i,
  /<link[^>]*\shref\s*=\s*["']?(?:https?:)?\/\/[^"'>]*["']?[^>]*>/i,
  /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i,
  /url\(\s*["']?(?:https?:)?\/\//i,
  /fonts\.googleapis|fonts\.gstatic|use\.typekit|cdn\.jsdelivr|unpkg\.com|cdnjs\./i,
];

/** Insecure http:// links (namespace identifiers such as the SVG and XHTML namespaces are not links). */
export function insecureLinks(text) {
  return (text.match(/http:\/\/[^\s"'<>)]+/g) || []).filter((u) => !/^http:\/\/www\.w3\.org\//.test(u));
}

/** Credentials that must never be committed. */
export const SECRETS = /api[_-]?key\s*[:=]\s*["'][^"']+|secret\s*[:=]\s*["'][^"']+|password\s*[:=]\s*["'][^"']+|BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/i;
