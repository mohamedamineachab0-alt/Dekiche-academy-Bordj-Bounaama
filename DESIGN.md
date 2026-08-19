# Design System Documentation: Aetherium Academic

## 1. Overview & Creative North Star
This design system establishes a premium, world-class EdTech experience. It rejects generic templates in favor of a "Linear/Vercel Vibe" characterized by deep, commanding typography, luxurious whitespace, subtle graph-paper textures, and fluid micro-interactions. The aesthetic is clean, minimalist, and deeply trustworthy.

---

## 2. Colors & Surface Architecture

The palette is strictly controlled, anchored in deep purples and pristine whites, avoiding harsh contrasts or generic default colors.

### Base Surfaces
*   **Primary Background:** Pure White (`#ffffff` / `bg-white`) for cards and main content areas.
*   **Secondary Background:** Soft Gray (`#f9fafb` / `bg-gray-50/50`) often paired with a subtle graph-paper grid (`bg-notebook-grid`) for underlying canvas depth.

### Brand Palette (The Purple Spectrum)
*   **Primary Action:** Deep Purple (`bg-purple-600` / `text-purple-600`). Used for primary buttons, active states, and key icons.
*   **Accent/Badge:** Soft Purple (`bg-purple-50` / `text-purple-700`). Used for secondary buttons, badge backgrounds, and icon containers.
*   **Commanding Text:** Very Deep Purple (`text-purple-950` / `text-purple-900`). Used strictly for high-level headings and titles.
*   **Body Text:** Clean Dark Gray (`text-gray-500` / `text-gray-600`). Used for subtitles and paragraph text.

### Borders
*   **Subtle Definition:** Hyper-subtle purple borders (`border-purple-100/50` or `border-purple-100`) define all cards and containers. Never use generic gray borders for primary content.

---

## 3. Typography: The Academic Voice

*   **Primary Font:** `IBM Plex Sans Arabic` is strictly enforced universally across all elements.
*   **Headings (H1/H2):** Must be heavy and commanding. Use `text-3xl font-black text-purple-950 tracking-tight`.
*   **Subtitles/Body:** Must be clean and readable. Use `text-[0.925rem] text-gray-500 font-medium leading-relaxed`.

---

## 4. Elevation, Depth & Shapes

We avoid default browser or generic CSS framework shadows, opting for custom, premium depth.

*   **Border Radius:** Highly rounded corners are mandatory. Use `rounded-3xl` for main cards and `rounded-2xl` for inner elements or smaller cards.
*   **Resting Shadow:** A custom, premium soft dropshadow: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.
*   **Hover Shadow (Bloom):** On interaction, shadows must "bloom" with a subtle brand tint: `hover:shadow-[0_20px_40px_rgb(168,85,247,0.15)]`.

---

## 5. Micro-Interactions (Make it Alive)

Every interactive element must feel fluid and responsive.

*   **Transitions:** All cards, buttons, and inputs must use `transition-all duration-300 ease-out`.
*   **Hover Lift:** Interactive cards must lift subtly: `hover:-translate-y-1`.
*   **Icon Playfulness:** Icons within interactive groups should scale and rotate slightly on hover: `group-hover:scale-110 group-hover:rotate-3`.

---

## 6. Spatial Tension (Whitespace)

Stop cramming elements. The design must breathe.
*   **Inner Padding:** Use luxurious padding inside cards, typically `p-8`.
*   **Structural Gaps:** Grid layouts and flex containers should use wide gaps, such as `gap-8`.

---

## 7. Component Examples

### The Premium Card
```html
<div class="group block bg-white rounded-3xl p-8 border border-purple-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(168,85,247,0.15)] hover:border-purple-200 relative flex flex-col h-full">
  <!-- Content -->
</div>
```

### The Icon Container
```html
<div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 bg-purple-50 text-purple-600 shadow-sm border border-purple-100/30">
  <!-- Icon -->
</div>
```

### The Action Badge
```html
<div class="flex items-center gap-2 font-bold text-sm text-purple-600 transition-all duration-300 ease-out group-hover:gap-4 bg-purple-50/50 px-4 py-2 rounded-xl">
  <span>Action Text</span>
</div>
```
