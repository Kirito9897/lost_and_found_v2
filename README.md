LOST/FOUND — Campus Object Archive
══════════════════════════════════
FRONTEND ONLY. No backend required.

This package is pure HTML + CSS + JavaScript.
All data is stored in your browser (localStorage) so every
feature works immediately with no server and no database.

RUN IT
  Option A — just double-click index.html
  Option B — serve statically:
       python3 -m http.server 8000
       then open http://localhost:8000

PAGES
  index.html         Homepage (preloader, hero, marquee, recent reports,
                     recovery journey animation, two paths)
  browse.html        Search / filter (lost-found / category) / sort
  item.html?id=      Item detail page
  report-lost.html   Lost item report form (validation, image check)
  report-found.html  Found item report form
  login.html         Sign in (tick "administrator" to preview admin panel)
  register.html      Create account
  dashboard.html     User dashboard (All / Pending / Verified / Returned)
  admin.html         Admin workspace (stats, match suggestions,
                     verify & return actions, CSV export, demo reset)
  contact.html       Contact form + privacy note

NOTES
  · "Sign in" is a frontend demo — it only stores a flag in localStorage
    so you can preview the dashboards. No real authentication exists.
  · 8 sample records ship with the site so nothing looks empty.
    Use "Reset demo data" in the admin panel to restore them.
  · To connect a real backend later, all data calls live in js/data.js
    (LFStore and LFAuth) — replace them with your API calls then.

TECH
  Space Grotesk + Inter + IBM Plex Mono (Google Fonts)
  GSAP (CDN) for the preloader and hero reveal
  Vanilla JS everywhere else — no build step, no frameworks
