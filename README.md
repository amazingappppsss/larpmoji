# LARPMOJI

**Cursed emojis. Tap to copy.**
Tap any emoji → it's copied as an image → paste it into WhatsApp, Discord, iMessage, Instagram, Slack…

Live: https://amazingappppsss.github.io/larpmoji/

## What's inside
- **Feed**: ~70 hand-tuned cursed emojis (big eyes, real eyes, deep fried, melted, mashups, captioned reactions),
  plus an **endless feed** that generates brand-new cursed emojis as you scroll.
- **Tap = copy**: copies the real PNG image (falls back to download if the browser can't).
- **The Kitchen**: pick any emoji or upload a pic → big eyes, swap eyes/mouth, deep fry, melt, swirl,
  stretch, pixelate, colour, stickers, meme caption, or hit 🎲 **CURSIFY**.
- **Stash**: favourites + your own cooks (saved on your device).
- **Keyboard** (`K`): compact picker with search, recently used and favourites.
- Group-chat preview that shows what you've sent.

Emojis are drawn with the visitor's own device emoji font, so they look native on every phone.

## How it works
`src/lib/cursed.ts` is the cursed engine. It renders emoji glyphs onto a canvas, then applies warps
(bulge, swirl, melt, wave), deep-fry, pixelate, hue and captions. The library lives in `src/data/emojis.ts`.

## Adding an image emoji
1. Upload the file to `public/emojis/` (you can do this on github.com: Add file → Upload files).
2. Register it in `src/data/assetEmojis.ts` (`crying-laughing.png` is already registered).
File-based emojis are hidden until their file exists, and are copied/downloaded with their original pixels.

## Deploy
Every push to `main` builds and publishes to GitHub Pages automatically (`.github/workflows/deploy.yml`).

## Develop locally (optional)
```bash
npm install
npm run dev
```
