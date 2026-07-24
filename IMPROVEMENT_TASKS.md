# Portfolio improvement task list

**Live site:** [portfolio-demo-tan-six.vercel.app](https://portfolio-demo-tan-six.vercel.app/)  
**Repo:** static site (`index.html` · `styles.css` · `script.js` + media)

## Analysis snapshot

The site is a strong cinematic personal brand piece: clear name hierarchy in the hero, honest project storytelling, patent + recognition trust signals, and a working FormSubmit contact path. Recent PRs already covered hero identity, honest copy, trust/perf cuts, mail delivery, and preloader polish.

What still holds it back for recruiters and hiring managers:

1. **Trust blinkers** — About stats render as `0` until scrolled, then reverse back to `0` when leaving the section (`toggleActions: 'play none none reverse'`).
2. **Weight** — ~5MB+ of looping videos, 1.7MB audio, ~3.8MB project images; LCP and mobile data suffer.
3. **Proof links** — Case studies describe live products (e.g. DevMind) but the detail UI has no primary “Live demo / Repo / Patent” CTAs.
4. **Discoverability** — `robots.txt` Sitemap points at `/` (not a `sitemap.xml`); no JSON-LD; PWA icon sizes in the manifest don’t match the files.
5. **Maintainability** — ~2.2k-line `script.js` and six Google font families make iteration and load cost harder than they need to be.

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| **P0** | Fix now — hurts first impression or trust |
| **P1** | High leverage for hiring / conversion |
| **P2** | Polish, scale, and long-term hygiene |

---

## P0 — Fix first impression & trust

### T01 — Stop About stats from showing `0`
- **Problem:** `#about` counters start at `0` and ScrollTrigger `reverse` resets them when the section leaves view.
- **Do:** Animate once (`toggleActions: 'play none none none'`), or set final values in HTML / on `onComplete` and never reverse the number text.
- **Accept:** Visiting `/#about` (and scrolling past then back) always shows `1`, `7+`, `5` — never stuck on `0`.

### T02 — Make first paint honest without waiting for JS
- **Problem:** Stats and some cinematic layers depend on GSAP; if CDN/JS fails, trust numbers stay wrong.
- **Do:** Put final counts in the markup (or `noscript` fallbacks). Degrade animations gracefully when GSAP/Lenis missing (already partially handled — extend to stats).
- **Accept:** With JS disabled or GSAP blocked, About still shows correct numbers and readable layout.

### T03 — Add skip link + keyboard path through project detail
- **Problem:** No skip-to-content; project overlay focus management is thin (close button exists, but focus trap / Escape / return focus need verification).
- **Do:** Skip link to `#about` or main; Escape closes project; focus moves into `#project-detail` and returns to the opened card.
- **Accept:** Keyboard-only user can open a project, browse, close, and land back on the triggering card.

### T04 — Verify contact form end-to-end on production
- **Problem:** FormSubmit with `_captcha=false` and redirect `?mail=sent` has failed before (see past mail PRs).
- **Do:** Confirm FormSubmit activation for `allenschristian07@gmail.com`; test success + validation + honeypot; surface a clear failure if the POST errors.
- **Accept:** Real test message arrives in inbox; UI shows success/error without a blank redirect dead-end.

---

## P1 — Hiring conversion & content proof

### T05 — Project detail CTAs (Live / Repo / Docs)
- **Problem:** DevMind is “Live Product” with a URL buried in highlights; no button. Other projects lack GitHub / demo / patent registry links.
- **Do:** Extend project data with optional `links: [{label, href}]` and render a CTA row on the intro panel.
- **Accept:** At minimum DevMind + patent + any public repos are one click away from the case study.

### T06 — Surface outcomes, not only features
- **Problem:** Highlights lean feature-heavy; recruiters want scope, your role, and result.
- **Do:** Per project add a one-line **Role** + **Outcome** (even if qualitative: “solo build · live on Vercel”, “team of 4 · electrical lead”, “design patent granted”).
- **Accept:** Intro panel answers “what did Allen do?” in under 5 seconds.

### T07 — Skills board honesty pass
- **Problem:** Many pins show `NEW` badges; stack mixes depth levels (Python vs “CI/CD basics”).
- **Do:** Cull `NEW` to truly recent; group by proficiency or usage (daily / project / familiar); drop or demote unused fluff.
- **Accept:** Skills section reads as “what ships on my projects,” not a badge wall.

### T08 — Hero CTA that matches intent
- **Problem:** Hero has brand + scroll cue, but primary action (“View projects” / “Download resume”) lives later.
- **Do:** One quiet CTA group under the role line (Projects + Resume or Contact) without crowding the brand.
- **Accept:** First viewport still brand-led; one clear next step without stats/promo clutter.

### T09 — Resume file hygiene
- **Problem:** Download filename `ALLEN_CHRISTIAN_RESUMEMAIN.pdf` looks unfinished.
- **Do:** Rename to `Allen-Christian-Resume.pdf` (update `href` + any references); keep content current with featured projects.
- **Accept:** Downloaded file has a professional name and matches site claims.

### T10 — Recognition / experience scanability
- **Problem:** Recognition + experience are strong, but long cinematic sections may bury the patent on mobile.
- **Do:** Ensure patent is first and visually dominant; keep timeline scannable (role · org · dates · one result line).
- **Accept:** On a phone, patent + top intern + current study are findable within one short scroll each.

---

## P1 — Performance & media

### T11 — Compress and modernize project images
- **Problem:** ~3.8MB under `images/projects/` (PNG screenshots especially).
- **Do:** Convert to WebP/AVIF with JPG/PNG fallbacks; cap longest edge (~1600px for story panels, ~800px for cards); keep lazy loading.
- **Accept:** Project media weight down ≥50% with no visible quality hit on laptop/phone.

### T12 — Lazy-load below-fold videos
- **Problem:** Multiple cinematic MP4s (about / projects / thank-you / hero) compete for bandwidth.
- **Do:** Only hero (or poster) early; set other `<source>` / `src` when section nears viewport; pause offscreen (partially done — extend to source injection).
- **Accept:** Initial network waterfall excludes about/projects/contact videos until needed.

### T13 — Audio strategy
- **Problem:** 1.7MB `interstellar-ambient.mp3` with `preload="none"` is good, but still a large optional asset.
- **Do:** Re-encode lower bitrate mono (~96–128kbps) or shorter seamless loop; keep mute-default UX.
- **Accept:** Audio file ≤~600KB; toggle still works; no autoplay without gesture.

### T14 — Font load trim
- **Problem:** Six families from Google Fonts (Space Mono, Syne, DM Sans, Archivo Black, Caveat, Sacramento).
- **Do:** Keep 2–3 roles (display / body / mono or script); add `preconnect` to `fonts.googleapis.com` + `fonts.gstatic.com`; subset if self-hosting later.
- **Accept:** One fewer render-blocking font request chain; visual identity preserved.

### T15 — CDN resilience
- **Problem:** GSAP + Lenis from cdnjs/unpkg with no local fallback beyond “skip animation.”
- **Do:** Vendor critical libs locally or add `integrity` + documented offline fallback; ensure preloader always clears.
- **Accept:** Blocked CDN still reveals the site content within a few seconds.

---

## P2 — SEO, PWA, polish

### T16 — Real `sitemap.xml`
- **Problem:** `robots.txt` lists the homepage as Sitemap.
- **Do:** Add `sitemap.xml` (single URL is fine) and point `robots.txt` at it.
- **Accept:** `/sitemap.xml` returns valid XML; Search Console can fetch it.

### T17 — JSON-LD Person / WebSite
- **Do:** Add structured data for name, job title, sameAs (GitHub, LinkedIn), and URL.
- **Accept:** Rich Results test parses without errors.

### T18 — Fix `site.webmanifest` icons
- **Problem:** Declares `favicon.png` as 192×192 (actual 180×180) and uses `og-image.jpg` (1200×630) as an icon.
- **Do:** Export proper 192 and 512 PNGs; remove OG image from icons list.
- **Accept:** Manifest validates; Add-to-Home-Screen icon looks correct.

### T19 — Meta / branding consistency
- **Problem:** Title uses “Allen Christian”; meta author “Allen Stivanson Christian”; brand mark “ASC”.
- **Do:** Pick one public name string for title/OG/Twitter/manifest and use full legal name only where needed (resume, patent).
- **Accept:** Share cards and tab title match the hero brand.

### T20 — Custom domain readiness
- **Do:** When moving off `*.vercel.app`, update canonical, OG URLs, sitemap, FormSubmit `_next`, and any absolute asset URLs in one pass.
- **Accept:** Checklist exists; no hardcoded preview host left in SEO tags after cutover.

### T21 — Reduce decorative noise where it fights content
- **Do:** Audit hero crosshairs / dust / multi-orb layers and skills corkboard motion on low-power phones; keep 2–3 intentional motions, tone down the rest under `prefers-reduced-motion` (already partial).
- **Accept:** Mobile 60fps scroll on mid-range device for hero → about → projects; reduced-motion users get static posters.

### T22 — Split `script.js` by section
- **Do:** Modularize (preloader, hero, about, projects, recognition, contact, audio) with one build step or ES modules.
- **Accept:** Easier PR review; no behavior change.

### T23 — Analytics + spam baseline (optional)
- **Do:** Privacy-friendly analytics (e.g. Vercel Analytics / Plausible); re-enable FormSubmit captcha or add Turnstile if spam appears.
- **Accept:** Know which projects get opens; inbox stays usable.

---

## Suggested implementation order

```
Week of shipping (agent-friendly slices — not calendar estimates):

1. T01 + T02          Stats trust (small JS/HTML change)
2. T04                Mail smoke test on prod
3. T05 + T06          Project CTAs + role/outcome
4. T11 + T12 + T13    Media weight
5. T03 + T08 + T09    A11y + hero CTA + resume name
6. T07 + T10          Skills + recognition scan
7. T14–T19            Fonts, SEO, PWA
8. T20–T23            Domain, polish, modularize, analytics
```

---

## Out of scope (for now)

- Full React/Next rewrite (current static stack is fine for a portfolio).
- Replacing the cinematic direction with a flat “card dashboard” layout.
- Inventing metrics you can’t stand behind.

---

## How to use this list

- Treat each `Txx` as one PR when possible.
- Link the task ID in the PR title (`T01: fix about stat reverse`).
- After each merge, check the live Vercel URL on phone + desktop before starting the next item.

If you connect Notion later, these `Txx` items can be copied 1:1 into a Tasks board (Status · Priority · Acceptance).
