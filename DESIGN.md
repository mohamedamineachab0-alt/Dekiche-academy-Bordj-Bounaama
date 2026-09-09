# Design System: أكاديمية دقيش

## 1. Visual Theme & Atmosphere
White and violet only. Purple brand surfaces, white cards, no yellow, no blue, no gold. Clean academic product UI for daily use.

## 2. Color Palette & Roles
- **White** (`#FFFFFF`) — Canvas, cards, buttons on purple, text on purple
- **Violet** (`#5B21B6`) — Brand, sidebar, hero, primary CTAs on white
- **Violet hover** (`#4C1D95`)
- **Violet mid** (`#6D28D9`)
- **Violet soft** (`#EDE9FE` / `#F5F3FF`) — muted fills, icon tiles
- **Ink** (`#2E1065`) — Body text (dark violet, not black)
- **Muted** (`#6D5B8C`)
- **Line** (`#DDD6FE`)

Hero: `linear-gradient(135deg, #5b21b6 0%, #4c1d95 100%)`.

## 3. Typography Rules
- **Primary:** IBM Plex Sans Arabic. IBM Plex Sans for Latin.
- **Weights:** 700 headings/CTAs, 600 labels, 400–500 body. No 900.

## 4. Component Stylings
- **Buttons:** `.btn-primary` purple + white text. On `.bg-hero`, the same class becomes white + purple text. `.btn-hero-outline` white glass. `.btn-secondary` soft violet.
- **Cards:** white `.surface-card`. Soft tiles: violet wash. Solid tiles: violet + white type.
- **Banned as brand:** yellow, gold, cyan, action-blue, neon.

## 5. Anti-Patterns
No yellow markers, no gold bevels, no Zellige, no emojis, no Inter, no pure black, no extra brand hues.
