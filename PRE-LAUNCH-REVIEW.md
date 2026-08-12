# Hemedex Website — Pre-Launch Review

Reviewed: `website622` (the actively-edited build — `contact.html`, `publications.html`, and `styles.css` were all last touched July 17). Every finding below was confirmed by reading the actual source, not guessed — file paths and line numbers are included so they're easy to locate.

## Before you deploy — two decisions only you can make

**Two live folders exist: `website622` and `website622-ux`.** The `-ux` version is the same site with an added "Instrument OS" visual theme (`futuristic.js` — glowing hero bezel, cursor-tracking glow, scan-line motion) layered on top via CSS/JS, and it's what your local `.claude/launch.json` dev server currently points at. But `website622` (no suffix) has the more recent content edits (July 17 vs. July 16). I checked, and every bug below reproduces identically in both — but you should confirm which one is actually going live, since right now the setup is ambiguous. If it's the `-ux` theme, decide that deliberately rather than by default.

**The contact form's spam protection is half-configured.** The Web3Forms integration is live with a real access key, and a honeypot field is active. But the code comment for hCaptcha still reads "just enable it in your Web3Forms dashboard" — the widget is commented out in the HTML (`contact.html`, around line 271). Once the site is public and indexed, the honeypot alone is a fairly weak deterrent. Worth a two-minute decision before launch: enable hCaptcha in the Web3Forms dashboard, or accept the risk for now.

---

## Fix before launch

**Contact page: two email links will 404.** "General Inquiries" and "Sales Team" on `contact.html` (lines 134 and 144) are wired up as Cloudflare's email-obfuscation markup (`href="/cdn-cgi/l/email-protection#..."`), and the decode script at the bottom of the page (line 414) points at a Cloudflare-account-specific path. This only works when a site is actually proxied through Cloudflare with that feature turned on. On any other host, both emails become dead links — clicking them 404s instead of opening a mail client — and the script itself 404s in the console. This looks like leftover markup from the old site scrape. Simple fix: replace both with plain `mailto:hemedexinfo@hemedex.com` and `mailto:salesteam@hemedex.com` links and delete the decode-script tag. Worth double-checking whether you're deploying behind Cloudflare either way — if not, this is the highest-priority functional bug on the site.

**The homepage hero image is 4.4MB.** `images/backgrounds/shutterstock_294471983.jpg` is the full-bleed background behind your hero headline — the very first thing that paints, above the fold, loaded eagerly (correctly, since it's the LCP element) — and it's an unoptimized 4.4MB JPEG. This is by a wide margin the single biggest performance liability on the site; on a phone over cellular it could add multiple seconds to first paint. Resize to the actual rendered dimensions and re-export at reasonable JPEG/WebP quality — this should get you under 200–300KB with no visible loss.

**Two dead links on the Clinical page.** In the "Other Applications" section (`clinical.html`, line 319), "Transplantation / Surgery" and "Methodology" link to `publications.html#transplant` and `publications.html#methodology`. Neither anchor exists on that page, so both links just load Publications with no filter applied. Your Publications page actually supports deep-linking straight into a keyword filter (e.g. `publications.html#transplantation` auto-selects that keyword and sorts by relevance) — `transplantation` is a valid keyword already, so that link is a one-word fix (`#transplant` → `#transplantation`). There's no `methodology` keyword in the current filter set, so that one either needs a matching keyword added or the link changed to point somewhere real.

---

## High priority

**Homepage: 63 images load eagerly that don't need to.** The partner-institution carousel (48 logos + 15 duplicates for the seamless loop) has no `loading="lazy"` on any slide, and neither does the bottom CTA background image. That's 64 unnecessary eager requests competing with the hero image and fonts during initial load, on a section that's well below the fold. Adding `loading="lazy"` to all `.carousel-slide img` tags and the `.cta-bg-img` is a low-risk, high-value fix.

**Products page: the five product "hero" images aren't lazy either.** Each product-detail section (`#bowman-monitor`, `#qflow-probe`, `#quad-bolt`, `#dual-bolt`, `#single-bolt`) has a large lead image with no `loading` attribute, even though the smaller thumbnails higher up the same page correctly use `loading="lazy"`. Since these sections sit further down the page, they should follow the same pattern.

**Contact page photo is a 3MB PNG.** `images/other/office_picture.png` (the Waltham HQ photo) is a photograph saved as PNG, which is the wrong format for photographic content — it's nearly 3MB where a well-compressed JPEG or WebP would likely be under 300KB. It is at least lazy-loaded, so the impact is smaller than the hero image, but still worth converting.

**Low-contrast text fails accessibility guidelines in a few real spots.** The `--text-light: #94a3b8` CSS variable (styles.css, defined in `:root`) measures 2.56:1 against white — well under the 4.5:1 WCAG AA minimum for body text. It's used in three places: the Publications keyword-filter hint text, the small count badges next to each keyword chip, and — most visibly — the "For urgent clinical support, call..." line on the Contact page (line 279), which is exactly the kind of text you don't want to be hard to read. Because it's a single CSS variable, darkening it once (or swapping these three spots to `--text-muted`, which already passes at 4.76:1) fixes all instances at once.

---

## Medium priority

**About page loads a full mapping library for a feature that's turned off.** The "Partner Institutions" map section on `about.html` is commented out, but the page still unconditionally loads Leaflet's CSS and JS from a CDN and runs an inline script that builds 48 markers — all of which immediately no-ops because the map container doesn't exist. That's a wasted round-trip and parse cost on every About page visit. Either finish and ship the map, or remove the Leaflet `<link>`/`<script>` tags and the builder script until it's ready.

**One product video breaks the site's own lazy-video pattern.** Everywhere else on the site, YouTube embeds use a lightweight "click to load" facade (thumbnail image now, real iframe only after a click) — a nice pattern that keeps YouTube's JS off the page until someone actually wants to watch. The QFlow 500 probe placement video on `products.html` (line 536) is a plain embedded `<iframe>` instead, loading full YouTube chrome on every page visit regardless of whether anyone watches it. Worth converting to match the rest of the site.

**Stray tag in the clinical page copy.** `clinical.html` line 531 has `Specialist <Td></Td>team` in a bullet list — an empty, invalid `<Td>` tag left in the sentence, almost certainly from a copy-paste. It happens to render harmlessly (the surrounding text still reads correctly), but it's invalid markup that would flag in any HTML validator and should just be deleted.

**~13MB of images in `website622/images/` aren't used anywhere.** 133 of the 226 image files in that folder (roughly half, by file size) aren't referenced by any of the six live pages — old logo crops, superseded product photos, and a handful of oddly-named scratch files (`ggg.png`, `377.jpg`, `t.jpg`). Not a live performance issue since unused files aren't downloaded by visitors, but worth pruning before you upload the folder to a production host.

---

## Low priority / polish

- The mobile hamburger menu button is about 38×32px — just under the 44×44px minimum recommended for comfortable tap targets. Small increase to padding would fix it.
- `main.js` still has a `console.log('%c🩺 Hemedex', ...)` branding tag (harmless, but easy to strip for a clean production console).
- The cursor-tracking glow effect in `website622-ux/futuristic.js` recalculates the hero's bounding box on every raw `pointermove` event rather than throttling via `requestAnimationFrame` (the scroll handler in the same file does throttle correctly). Unlikely to be noticeable, but cheap to fix if you're already in that file.
- The "Next Generation Monitor" sections on the homepage and Products page still show "Photo coming soon" placeholder art. That's presumably intentional given the "In Development" badge — just flagging in case you want real imagery in before launch.
- Double check the partner-logo carousel against "the list sent to Connor" mentioned in your `2026 Website Notes to add.docx` — I can confirm the 48 logos that are there render at consistent size (the CSS uses a fixed-size container with `object-fit: contain`, so mismatched source-image dimensions aren't an issue), but I have no way to confirm the list of 48 is complete against whatever list you were sent.

---

## Already solid — no action needed

A lot of prior cleanup work is holding up well and doesn't need to be revisited:

- All six pages have exactly one `<h1>`, unique titles/descriptions, canonical URLs, Open Graph/Twitter cards, and valid JSON-LD structured data (verified by actually parsing each block).
- `robots.txt` and `sitemap.xml` are present and correctly scoped.
- Base font size (16px), line height (1.65), and viewport meta are all correct on every page.
- `prefers-reduced-motion` is properly respected — the carousel and all CSS animations/transitions correctly stop for users who request reduced motion.
- `main.js` and `futuristic.js` both pass a Node syntax check; `styles.css` has balanced braces (539/539); no broken `target="_blank"` links (all correctly carry `rel="noopener noreferrer"`).
- The two content items I could spot-check against your `2026 Website Notes to add.docx` (CE Mark removed, ISO 10993 claim removed, product order QLB→DLB→SLB, "Quad Lumen Bolt Trial" removed from the contact form) are all correctly done.
- The Publications page (109 papers, keyword filtering, sorting, the "Selected Literature" toggle, and the newer citation-count sort) all work correctly end-to-end in the code — including the "Show More" pagination, which I confirmed exists and is wired up correctly.

---

*Methodology: full manual read of all six HTML pages, `styles.css` (2,952 lines), and `main.js`; automated link/anchor/alt-text/contrast checks against the actual source; image directory audit by file size and reference-tracing; cross-check against your own `SEO-REPORT.md`, `CHANGELOG-622.md`, `CHANGELOG-cleanup.md`, and `2026 Website Notes to add.docx`. Did not test on a live server or in an actual browser, since the site isn't deployed yet — everything above is verified from source, not visually screenshotted.*
