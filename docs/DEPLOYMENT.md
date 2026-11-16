# Publishing StudyNova

One GitHub Pages site holds two versions (DECISIONS D5):

| | URL | Built from | Updates when |
|---|---|---|---|
| **Production** | https://bazeocrisy.github.io/StudyNova/ | `main` | an owner-approved pull request is merged into `main` |
| **Preview** | https://bazeocrisy.github.io/StudyNova/preview/ | `develop` | work is pushed to `develop` |

Every publish rebuilds **both** from their branches, so a preview update never changes production and vice versa.
Until a `develop` branch exists, the preview is built from `main`.

## Development flow
1. Claude builds on `develop` (or a feature branch merged into `develop`), runs `npm run test:all`, and pushes.
2. GitHub tests both branches, builds both sites and publishes. The preview shows the new work within a few minutes.
3. The owner checks the preview on a computer and a phone, and gives feedback until it is right.
4. Claude opens (or updates) a pull request `develop` → `main`, naming the PR number and head commit.
5. **The owner explicitly approves the merge.** After it is merged, production updates automatically.

Nothing merges automatically. A failing test on either branch stops the whole publish; the live site stays as it was.

## What is published
Only files on the allowlist in `scripts/build-site.js` are copied to `_site`, and then verified.

| Published | Never published |
|---|---|
| `index.html`, `css/*.css`, `js/**/*.js` | `tests/`, `scripts/`, `docs/`, `.github/`, `.claude/`, any `.md` |
| `data/subjects.json`, `data/weeks/index.json` and each week **listed** in it | Week files not listed (drafts), `data/SCHEMA.md` |
| `assets/brand/*` (icons, logo, manifest) | `private/`, photos, scans, anything named like `page-012.png` |
| `math/index.html`, `math/css`, `math/js`, `math/curriculum`, `math/assets/brand` | `math/study-guides/` tooling, tests, package files |
| `math/study-guides/lessons/**.html`, its assets and fonts, and its printed PDFs | `package.json`, `README.md`, `STATUS.md`, `CLAUDE.md` |

The verifier fails the build when:
- a file is not on the allowlist, or a forbidden path (e.g. `chapter-5`, `docs`) is present;
- a file name looks like a scanned page, or a photo format appears, or a PDF was not printed by Chrome from a
  StudyNova page;
- any published text contains a blocked name (`scripts/privacy.js`);
- a page loads a script, stylesheet or font from another site, contains analytics, or has an `http://` link;
- a local `href`/`src` (pages), `url()` (styles), `import` (modules) or manifest icon does not resolve, is absolute
  (it would break under `/StudyNova/preview/`) or points outside the site;
- `data/` does not match `data/SCHEMA.md`, or a listed week is missing, or an unlisted week is published;
- the site is larger than 40 MB.

**The repository itself is public:** leaving a file off the website does not hide it on GitHub. Private material
belongs in `private/` (git-ignored), never in a commit.

## Workflow (`.github/workflows/pages.yml`)
- **Pull requests:** `npm test`, `npm run test:browser`, build and verify, browser tests against `_site`. Nothing is
  published.
- **Push to `main` or `develop`:** unit tests for both branches, allowlist builds of both, browser tests against each
  built site, then one publish: production at `/` and preview at `/preview/`. The publish job runs the browser suites
  with `--quick`, which leaves out the slow layout sweep (`HEAVY` in `scripts/run-browser-tests.mjs`, about 11 minutes
  per run); every pull request runs all of them, and production changes only through an approved pull request.
- **Run workflow (Actions tab):** rebuilds and republishes both (e.g. after a GitHub outage).
- Runs on `ubuntu-latest` with Node 22 and Chrome at `/usr/bin/google-chrome`. Checkouts keep no credentials; only
  the deploy job may write to Pages.

## One-time setup (owner)
1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Environments → `github-pages` → Deployment branches: allow `main` and `develop`.
3. Create the `develop` branch from `main`.

If the first push ran before steps 1–2, its publish step fails ("not allowed to deploy" or "Pages not enabled");
nothing is broken. Finish the steps, then Actions → *StudyNova site* → **Run workflow**.

## Rollback
- **Production:** revert the bad merge on `main` (the *Revert* button on the merged pull request). Production
  republishes automatically.
- **Preview:** push a fix or a revert to `develop`.
- **Take the whole site down:** Settings → Pages → *Unpublish site*.

## Checking locally
```
npm run build                    # builds and verifies _site (prints what was left out and why)
npm run serve -- --site _site    # serve the built copy at /StudyNova/
npm run test:site                # build, then every browser suite against _site only
```
