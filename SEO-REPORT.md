# Hemedex Website — SEO & AI-SEO Report

**Prepared during the pre-launch visual/code cleanup pass.**
This document covers (1) what was already strong, (2) what was fixed in this pass, (3) ready-to-paste `<head>` additions for each page, and (4) prioritized recommendations for traditional search and for AI/LLM answer engines ("AI SEO").

Nothing in your page *content* was changed. The items below are metadata, structured data, and infrastructure — plus copy-paste snippets you control.

---

## 1. Current state — what's already solid

Your site has a better SEO baseline than most pre-launch sites:

- **Every page has a unique `<title>` and `<meta name="description">`.** Titles use the brand + a descriptive qualifier; descriptions are written for humans.
- **`lang="en"` is set on all six pages.**
- **Exactly one `<h1>` per page** (contact.html was the only exception — fixed this pass; see §2).
- **100% image `alt` coverage** — all 121 `<img>` tags have an `alt` attribute. The 19 empty `alt=""` values are correct: they're the decorative duplicate carousel logos that exist only for the seamless scroll loop, and empty alt is the right call for purely decorative images.
- **Semantic landmarks** — `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, plus a skip-link and ARIA labels. Search engines and screen readers both benefit.
- **Fast, static, no render-blocking JS** — the site is plain HTML/CSS/JS with deferred YouTube facades and lazy-loaded images, which is exactly what Core Web Vitals rewards.

---

## 2. Fixed in this pass

| Fix | Why it matters |
|---|---|
| **contact.html `<h2>Get in Touch` → `<h1>`** | Every page should have exactly one top-level `<h1>`. Contact was missing one. Styling preserved (CSS selector updated to match). |
| **Added `robots.txt`** | Tells search + AI crawlers what they may access and points to the sitemap. Includes explicit allow rules for AI crawlers (see §4). |
| **Added `sitemap.xml`** | Lets Google/Bing discover all six pages immediately rather than relying on link-crawling. |

Both new files go in the **site root** (same folder as index.html) when you deploy.

---

## 3. Ready-to-paste `<head>` additions

These are the highest-leverage SEO items still missing: **Open Graph** (controls how links look when shared on LinkedIn/Facebook/Slack), **Twitter Card**, **canonical URL** (prevents duplicate-content ambiguity), and **JSON-LD structured data** (the single most important thing for AI SEO — see §4).

Paste the matching block into each page's `<head>`, just **after** the existing `<meta name="description">` line. Adjust the OG image filename to a real 1200×630 image you have (a product hero or logo card works well).

> ⚠️ All URLs below assume the final structure is `https://hemedex.com/page.html`. If you deploy with clean URLs (e.g. `/products` instead of `/products.html` — recommended, see §5), update the `og:url` and `canonical` values to match.

### 3a. Shared block — add to ALL pages (adjust per-page values)

```html
<!-- Canonical -->
<link rel="canonical" href="https://hemedex.com/index.html">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Hemedex">
<meta property="og:title" content="Hemedex — Continuous Cerebral Perfusion Monitoring | Know The Flow™">
<meta property="og:description" content="The only monitor that continuously measures tissue perfusion in absolute units. Bowman Perfusion Monitor for neurocritical care and multimodal monitoring.">
<meta property="og:url" content="https://hemedex.com/index.html">
<meta property="og:image" content="https://hemedex.com/images/og/hemedex-og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@HemedexInc">
<meta name="twitter:title" content="Hemedex — Continuous Cerebral Perfusion Monitoring">
<meta name="twitter:description" content="The only monitor that continuously measures tissue perfusion in absolute units.">
<meta name="twitter:image" content="https://hemedex.com/images/og/hemedex-og.jpg">
```

For the other five pages, change **`og:title` / `og:description` / `og:url` / `canonical`** to that page's real title, description, and URL. Everything else (site_name, image, twitter:card, twitter:site) stays the same.

### 3b. Organization structured data — add to index.html only

This is the keystone for AI SEO. It tells Google's Knowledge Graph and LLMs exactly who Hemedex is.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Hemedex, Inc.",
  "url": "https://hemedex.com",
  "logo": "https://hemedex.com/images/logo.jpg",
  "description": "Hemedex manufactures continuous cerebral blood flow (perfusion) monitoring technology for neurocritical care, including the Bowman Perfusion Monitor and QFlow 500 Perfusion Probe.",
  "foundingDate": "2000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "564 Main St",
    "addressLocality": "Waltham",
    "addressRegion": "MA",
    "postalCode": "02452",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.linkedin.com/company/hemedex-inc./",
    "https://twitter.com/HemedexInc",
    "https://www.youtube.com/channel/UCDMZ3P6b3M8cCwWg7AHebag"
  ]
}
</script>
```

### 3c. Product structured data — add to products.html

Repeat one `Product` block per product (Bowman Monitor, QFlow 500, each bolt kit). Example for the monitor — duplicate and edit `name`/`description`/`url` for the others:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalDevice",
  "name": "Bowman Perfusion Monitor",
  "manufacturer": { "@type": "Organization", "name": "Hemedex, Inc." },
  "description": "Continuous, real-time measurement of cerebral perfusion in absolute units for neurocritical care and the operating room.",
  "url": "https://hemedex.com/products.html#bowman-monitor"
}
</script>
```

> Note: Schema.org's `MedicalDevice` does not use price/availability the way retail `Product` does, which suits a clinical capital device. Keep claims factual and consistent with your FDA-cleared labeling — don't add efficacy claims in structured data that aren't on the page.

### 3d. Publications — add to publications.html

A `CollectionPage` + `ScholarlyArticle` itemList helps AI engines understand this is an evidence library. At minimum, wrap the page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Hemedex Research Publications",
  "description": "Peer-reviewed publications on cerebral perfusion monitoring, thermal diffusion flowmetry, and multimodal neuromonitoring.",
  "url": "https://hemedex.com/publications.html"
}
</script>
```

### 3e. FAQ structured data — products.html & clinical.html

You already have a working FAQ accordion on products.html. Marking it up as `FAQPage` can earn rich results in Google *and* gives LLMs clean Q&A pairs to quote. Build it from your existing on-page FAQ text (don't invent new answers):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Paste an existing FAQ question here",
      "acceptedAnswer": { "@type": "Answer", "text": "Paste the existing on-page answer here." }
    }
  ]
}
</script>
```

> Rule: the structured-data answer text must match what's visible on the page. Google penalizes FAQ markup that doesn't mirror visible content.

---

## 4. AI SEO (LLM answer engines) — the part most sites miss

"AI SEO" = being accurately cited when someone asks ChatGPT, Claude, Perplexity, or Google's AI Overviews about cerebral perfusion monitoring. The mechanics differ from blue-link SEO:

**4.1 Let the AI crawlers in (done).** `robots.txt` now explicitly allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, CCBot, and others. If for legal/brand reasons you do *not* want your content used for model training, change specific `Allow: /` lines to `Disallow: /` — but note that blocking them also removes you from those engines' answers. For a marketing site that *wants* to be cited, allowing them is correct.

**4.2 Structured data is how LLMs disambiguate you.** The JSON-LD in §3 is the single biggest AI-SEO lever. It states unambiguously: Hemedex is a medical device company, founded 2000, in Waltham MA, that makes these specific named products. That's exactly the factual scaffolding an LLM needs to answer "who makes the Bowman Perfusion Monitor?" correctly instead of hallucinating.

**4.3 Answer-shaped content wins.** LLMs preferentially quote content that directly answers a question in the first sentence. Your clinical page is well-suited to this. Where possible (future content edits, not now), lead sections with a one-sentence direct answer ("Thermal diffusion flowmetry measures cerebral blood flow by…") before elaborating. Your FAQ blocks already do this — marking them up (§3e) amplifies it.

**4.4 Entity consistency.** Use the exact same product names everywhere — "Bowman Perfusion Monitor," "QFlow 500 Perfusion Probe" — across the site, LinkedIn, YouTube, and any press. LLMs build confidence in an entity when its name, address, and descriptors are identical across sources. The `sameAs` array in §3b links your social profiles to reinforce this.

**4.5 Citations & authority.** Your 91-publication library is a genuine AI-SEO asset — it's the kind of primary-source evidence answer engines weight heavily for medical topics. Make sure each publication links out to its DOI/PubMed/journal page (you already have Google Scholar URLs in the analysis workbook). Outbound links to authoritative sources signal that your page is a real evidence hub, not thin marketing.

**4.6 llms.txt (optional, emerging).** A small but growing convention is a root `llms.txt` file that gives LLMs a curated map of your most important pages in markdown. It's not yet widely consumed, but it's cheap to add and forward-looking. Ask me and I can generate one from your sitemap.

---

## 5. Prioritized recommendations

### High priority (do before/at launch)
1. **Deploy `robots.txt` + `sitemap.xml`** to the site root (created this pass).
2. **Add the §3a Open Graph + canonical block to all six pages.** Without OG tags, every shared link (LinkedIn posts, email, Slack) shows an ugly bare URL with no image — a real problem for a B2B medical brand where LinkedIn sharing matters.
3. **Create one 1200×630 OG image** (`images/og/hemedex-og.jpg`) — a branded card with the logo + "Know The Flow™" + a product shot. Referenced by all OG/Twitter tags.
4. **Add the §3b Organization JSON-LD to index.html.** Keystone for both Google Knowledge Graph and AI SEO.
5. **Submit the sitemap** in Google Search Console and Bing Webmaster Tools after deployment. (Also lets you monitor indexing/errors.)

### Medium priority (first weeks post-launch)
6. **Add Product JSON-LD (§3c) to products.html** — one block per device.
7. **Add FAQ JSON-LD (§3e)** built from your existing accordion text.
8. **Consider clean URLs** — `/products` instead of `/products.html`. Most static hosts (Netlify, Cloudflare Pages, Vercel, GitHub Pages with a config) support this. Cleaner for sharing and slightly preferred by search engines. If you do this, update all `canonical`/`og:url` values and internal links accordingly.
9. **Add `<meta name="theme-color">`** and a `site.webmanifest` for a polished mobile/PWA presentation (minor but easy).

### Lower priority (ongoing)
10. **Publications: ensure every entry links to its DOI/PubMed.** Strong AI-SEO signal for medical authority.
11. **CollectionPage JSON-LD (§3d)** on publications.
12. **Optional `llms.txt`** at root.
13. **Performance check** — run Lighthouse/PageSpeed Insights post-launch. The site should already score well; verify image sizes (some partner logos and backgrounds may benefit from WebP conversion and explicit `width`/`height` attributes to reduce layout shift).

---

## 6. One thing to watch — medical claims

Because Hemedex is an FDA-cleared medical device company, **structured data and meta descriptions must stay consistent with your cleared labeling.** Don't let SEO copy drift into efficacy/outcome claims that aren't supported on-page and in your regulatory materials. Everything in this report uses factual, descriptive language ("continuous measurement of cerebral perfusion") rather than outcome claims, and your structured data should do the same. When in doubt, mirror language that already passed regulatory review.

---

*Files created this pass: `robots.txt`, `sitemap.xml`. Snippets above are ready to paste but were intentionally **not** auto-injected so you retain full control over what metadata ships — and so you can set the real OG image path and final URL scheme first.*
