# Hemedex Website — v622 Changelog

Snapshot `website622`, copied from `website609` (2026-06-22).
This pass focused on **SEO / social / structured-data metadata**, a couple of
**consistency bug fixes**, and two **new features** (publications sorting +
the "Selected Literature" toggle). Existing page *copy* (headings, body text,
citations) was not changed; the only markup added to publications was the
`data-selected` flag + ★ badge on the 40 already-present curated papers.

---

## 1. New feature — Publications sort control
The Publications page had search + keyword filtering but no way to re-order
results. Added a **"Sort by"** dropdown to the results bar:

- **Newest first** (default — matches the previous authored order)
- **Oldest first**
- **Selected Literature** — Hemedex's curated picks first (see §1b), then newest
  within each group.

(An earlier iteration of this dropdown had a "Relevance" option based on topic
breadth; that was replaced by the keyword-driven relevance in §1c, which is a
truer relevance signal. "Selected Literature" took its slot in the dropdown.)

Implementation:
- `publications.html` — added the `<select id="pub-sort-select">` in
  `.pub-results-bar`.
- `styles.css` — `.pub-results-bar` is now a flex row (count left, controls
  right); added `.pub-sort` / `.pub-sort-select` styling (on-brand, custom
  caret, focus ring).
- `main.js` — added `sortPublications()`, which sorts the in-memory `pubData`
  array **and** reorders the DOM (keeping the no-results message and "Show More"
  button last). Composes with search + keyword filters; resets the visible
  batch to the first page on change.

Verified in-browser: newest = 2024→2018; oldest = 1975→1984; Selected
Literature = curated papers first; no console errors.

## 1b. New feature — "Selected Literature" toggle
Restored Hemedex's hand-curated "Selected Literature" concept, which existed on
the older site (e.g. `website527`, where 54 of 114 papers carried
`data-categories="selected"`) but was lost when v609 moved to the 91-paper
keyword-analyzed corpus.

- Matched website527's curated "selected" titles against the current 91-paper
  list: **40 of the 54** are present and were tagged `data-selected="true"`.
  (The other 14 curated papers are not in the current corpus; per decision,
  they were **not** re-added in this pass — see "Not done" below.)
- `publications.html` — added a **★ Selected Literature** toggle button to the
  results bar (grouped with Sort in `.pub-results-controls`), and a small
  **★ Selected** badge on each curated card (next to the year).
- `styles.css` — added `.pub-results-controls`, `.pub-selected-toggle`
  (+ active `aria-pressed="true"` state), and `.pub-selected-badge`.
- `main.js` — each paper gets a `selected` flag from `data-selected`; a new
  guard in `matches()` filters to the curated set when the toggle is active.
  Composes with search, keyword filters, and sort.

Verified in-browser: 40 tagged papers, 40 badges; toggle filters 91 → 40 and
back; "Selected + TDF" keyword = 26 (all selected and containing TDF);
`aria-pressed` toggles correctly; no console errors.

## 1c. New feature — keyword-driven Relevance (mention counts)
Relevance is now a data-driven signal tied to the keyword filter, using the
actual **mention frequency** of each keyword in each paper (from
`publication_sorting/keyword_analysis.csv`), not just whether the keyword is
present.

- **Data:** every card was matched to its column in `keyword_analysis.csv` by
  **keyword-set fingerprint** (91/91 exact matches) and given a new
  `data-kwcounts="keyword:count;…"` attribute with the per-keyword mention
  counts for that paper.
- **Behaviour:** when one or more keyword filters are active, each visible card
  shows a **Mentions** row — one chip per selected keyword with its count, plus
  a **Total** chip when more than one is selected — and the list auto-orders by
  that total (descending). This is the new "relevance." With no keyword active,
  the Sort-by dropdown (Newest / Oldest / Selected) drives order.
- **Sort control:** selecting a keyword filter auto-switches the sort to a
  **"Relevance"** option that appears at the top of the (still-enabled) dropdown.
  The user can override it — pick Newest / Oldest / Selected and the list
  re-sorts while the mention chips stay visible. Clearing the keyword filters
  removes the Relevance option and keeps the last chosen sort.
- `main.js` — `data-kwcounts` parsed into `counts`; `relevanceScore()` sums the
  active keywords' counts; `sortPublications()` uses relevance when keywords are
  active; `renderMentions()` builds the chips; `updateSortUI()` manages the
  disabled "Relevance" state.
- `styles.css` — `.pub-mentions`, `.pub-mention(-kw/-n/-total)`, and the
  disabled-select style.

Verified in-browser: single keyword (perfusion) orders 174→43 by count;
two keywords (perfusion + cbf) shows both chips + a Total that equals their sum
on every card and orders by that total (224→152→142); selecting a keyword
auto-selects an enabled "Relevance" option, and overriding to Newest/Oldest
re-sorts while the mention chips stay visible; clearing removes the Relevance
option; no console errors.

## 2. SEO / social metadata — all 6 pages
Implemented the high-priority items that `SEO-REPORT.md` documented but
intentionally left unapplied. Added to every page's `<head>`:

- **Canonical URL** (`<link rel="canonical">`) — prevents duplicate-content
  ambiguity.
- **Open Graph tags** (`og:type/site_name/title/description/url/image`) — so
  shared links on LinkedIn, email, and Slack render a proper title + image card
  instead of a bare URL. Per-page title/description/url.
- **Twitter Card tags** (`summary_large_image`).
- **`theme-color`** = brand navy `#384794`.

> Note: all `og:url` / `canonical` values assume the final domain is
> `https://hemedex.com/<page>.html`. If you deploy with clean URLs
> (`/products` instead of `/products.html`), update these accordingly.

## 3. Structured data (JSON-LD)
- `index.html` — **MedicalBusiness** Organization (name, founding date, Waltham
  address, phone, logo, social `sameAs`). Keystone for Google's Knowledge Graph
  and AI answer engines.
- `products.html` — **MedicalDevice** graph (Bowman Monitor, QFlow 500 probe,
  Quad/Dual/Single bolt kits) + **FAQPage** built from a subset of the existing
  on-page FAQ accordion (answer text mirrors the visible page verbatim, as
  Google requires).
- `publications.html` — **CollectionPage** describing the evidence library.

All JSON-LD validated as parseable.

## 4. New OG share image
- Generated `images/og/hemedex-og.jpg` (1200×630) — branded navy card with the
  Hemedex wordmark, "Know The Flow™", and a perfusion-waveform motif. Referenced
  by all the OG/Twitter `image` tags above. (Swap for a photographic/product
  card later if preferred; dimensions are already correct.)

## 5. Consistency bug fixes
- **Favicon type mismatch** — `clinical.html`, `contact.html`, and
  `publications.html` declared `type="image/jpeg"` for a `.ico` file. Changed to
  `type="image/x-icon"` to match `index.html` / `products.html` / `about.html`.
- **Nav inconsistency** — the "Partner Institutions" dropdown link
  (`about.html#global-reach`) was commented out on 5 of 6 pages but still live on
  `contact.html`. Commented it out on `contact.html` too, so the nav is identical
  everywhere. (The target section still exists in `about.html`; re-enable the
  link on all pages together when ready to surface it.)

## 6. AI-SEO
- Added root **`llms.txt`** — a curated markdown map of the site for LLM answer
  engines (per `SEO-REPORT.md` §4.6).

---

## Validation
- JSON-LD: all 4 blocks parse (`json.loads`).
- CSS: braces balanced (512/512).
- main.js: brackets balanced; behavior verified live via browser preview.
- HTML: all 6 pages parse; exactly one `<h1>` each (unchanged from v609).

## Open option — the 14 dropped curated papers
website527's "Selected Literature" had 54 papers; 14 are absent from the current
91-paper corpus and were left out of this pass. All 14 have recoverable
citations (and DOIs/links) from `website527` / the old root `publications.html`.
Notable ones: Park 2024 (non-invasive CBF), Vaz 2024, Ader 2024, Foreman 2023
(thermal-conductivity edema), and Ko 2012 "Real-Time Estimation of Brain Water
Content" (cited on products.html). Say the word to re-add them as full entries
and tag them selected (would make the toggle show 54).

## Not done (still open recommendations from SEO-REPORT.md)
- Replace the generated OG card with a photographic product version if desired.
- Decide on clean URLs (`/products` vs `/products.html`) before launch and update
  canonicals/OG URLs to match.
- Submit `sitemap.xml` to Google Search Console + Bing after deploy.
- Optional `site.webmanifest` + WebP conversion of large partner logos/backgrounds.
