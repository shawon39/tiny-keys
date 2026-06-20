# 🐶 Baby Keyboard Game

A tiny, joyful keyboard game for a **two-year-old**. Press *any* key — or tap the
screen — and a big, bouncy animal or emoji pops up with a friendly sound, a
spoken name, a colour flash and a burst of confetti. 🎉

It's a **pure static website** (HTML + CSS + vanilla JavaScript), so it runs
anywhere and deploys to **GitHub Pages** with no build step.

---

## ✨ What it does

- **Press any key → delight.** Every key spawns a giant, springy emoji at a
  random spot on screen.
- **Tap / touch works too.** On a tablet, every tap spawns an item right where
  the finger lands (multi-touch friendly) — perfect for little hands.
- **It talks.** A cheerful voice names each item ("Dog!", "Star!") via the
  browser's built-in speech synthesis.
- **It sings.** A soft, musical "boop" (Web Audio, C-major pentatonic) plays on
  every press — even random mashing sounds nice.
- **It celebrates.** Confetti, an expanding ripple, a whole-screen colour flash,
  and a slowly drifting rainbow background.
- **Two modes.** A settings panel toggles between **🐾 Animals** (60+ friendly
  animals) and **😀 Emojis** (stars, food, vehicles, happy faces…).

## 🛡️ Built for toddlers (and the parents who hand over the device)

- **Mash-proof & lag-free** — feedback fires instantly on `keydown`, animations
  are GPU-only (transform/opacity), and there's a hard cap on on-screen elements
  with self-cleanup, so it stays smooth no matter how hard it's mashed.
- **No accidental escapes** — pinch-zoom, double-tap-zoom, pull-to-refresh, text
  selection and the right-click/long-press menu are all disabled; dangerous keys
  are swallowed during play; and **Play** enters fullscreen to hide the browser
  chrome.
- **Toddler-proof settings** — the ⚙️ gear in the corner needs a deliberate
  **1.5-second hold** to open (a quick tap does nothing), so a toddler can't
  wander into it. A normal **Settings** button is available on the welcome screen
  for the parent.
- **Never breaks** — every browser API is feature-detected and wrapped; a missing
  API, a blocked CDN, or a private-mode `localStorage` all degrade gracefully
  instead of throwing.
- **Variety that lasts** — a shuffle-bag picker means items never immediately
  repeat, so it stays fresh over many sessions.
- **Respects `prefers-reduced-motion`** for sensitive setups.

## 📁 Project structure

```
.
├── index.html              # entry point (root, as required)
├── manifest.webmanifest    # PWA manifest (Add to Home Screen → fuller-screen)
├── .nojekyll               # tell GitHub Pages to skip Jekyll processing
├── css/
│   └── styles.css          # all visuals & animations
├── js/
│   ├── data.js             # curated animal + emoji datasets (char + spoken name)
│   ├── audio.js            # Web Audio tones + Web Speech naming
│   ├── effects.js          # emoji spawn, ripple, confetti, flash (capped + cleaned)
│   └── app.js              # settings, input, welcome/play flow, lockdown
└── assets/
    └── icon.svg            # app icon
```

## 📦 Libraries (authentic, version-pinned CDNs)

Loaded with `defer` and used only as progressive enhancement — the game works
fully even if both are blocked or offline.

| Library | Purpose | CDN |
| --- | --- | --- |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) `1.9.4` | Confetti bursts | jsDelivr |
| [@twemoji/api](https://github.com/jdecked/twemoji) `17.0.3` | Render emoji as crisp, OS-consistent **SVG** images | jsDelivr |

If `canvas-confetti` is unavailable, a pure-CSS particle burst is used instead.
If Twemoji is unavailable, the native OS emoji glyph is shown (Twemoji also falls
back to it automatically if an individual image fails to load).

## ▶️ Run locally

Because the app loads emoji-SVG assets over HTTPS, just open it through any static
server (opening `index.html` via `file://` also works, but a server matches the
deployed behaviour):

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

## 🚀 Deploy to GitHub Pages

1. Create a repository and push these files (keep `index.html` at the repo root).
2. In **Settings → Pages**, set **Source: Deploy from a branch**, branch `main`,
   folder `/ (root)`.
3. Open the published URL, e.g. `https://<you>.github.io/<repo>/`.

All asset paths are **relative**, and `.nojekyll` is included, so it works
correctly from a project-site subpath with no extra configuration.

> Tip: on a tablet, use the browser's **Add to Home Screen** for the most
> immersive, lock-screen-friendly experience.

## 🧰 Customising

- **Add/replace items:** edit the `ANIMALS` / `EMOJIS` arrays in
  [`js/data.js`](js/data.js) — each entry is `{ char, name }` where `name` is the
  word spoken aloud.
- **Tune the feel:** colours and animations live in
  [`css/styles.css`](css/styles.css); sound, confetti density and the on-screen
  item cap (`MAX_ITEMS`) live in the JS modules.

Made with ❤️ for tiny hands.
