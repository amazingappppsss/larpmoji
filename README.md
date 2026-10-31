# LARPMOJI

Discover, create and share unconventional internet-native emojis.
React + TypeScript + Vite + Tailwind CSS v4 + Lucide.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features
- **Explore**: hero, categories, sort (trending / newest / A–Z), random pick
- **Search**: name, tags, shortcode, category, description, author (press `/`)
- **Detail modal**: copy image, copy `:shortcode:`, download PNG/SVG, favourite, remix
- **Favourites + My creations**: saved in `localStorage`
- **Creator**: upload / drag-drop / paste an image, crop shape, zoom, rotate, drag to pan, background, caption
- **LARPMOJI Keyboard** (`K` or the *Open Keyboard* button): compact grid, search,
  Recently used, Favourites, category tabs, arrow-key navigation. Tapping an emoji
  copies the **actual PNG image** to the clipboard; if the browser can't, it downloads the file instead.

## Project structure
```
public/emojis/            raw emoji image files (served untouched)
src/data/assetEmojis.ts   registry for file-based emojis  <- add new image emojis here
src/data/emojis.ts        central dataset + categories (generated SVG mocks)
src/data/emojiArt.ts      procedural SVG emoji generator for mock data
src/lib/emojiActions.ts   copy-to-clipboard / download logic
src/lib/search.ts         search + sort
src/store/                app state (favourites, recents, creations, toasts)
src/components/keyboard/  reusable <EmojiKeyboard> + app-wired <KeyboardDock>
src/components/pages/     Explore, Favourites, Creator
```

## Adding an image emoji
1. Put the file in `public/emojis/` (PNG with transparency is best), e.g. `public/emojis/crying-laughing.png`.
2. Add an entry to `ASSET_SEEDS` in `src/data/assetEmojis.ts`.

Files are never resized or redrawn. Copy and download use the original file.
If a registered file is missing, the app shows a "missing file" tile rather than a substitute.
