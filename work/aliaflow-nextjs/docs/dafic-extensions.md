# ALIAFLOW extensions aligned to DAFIC

The ALIAFLOW landing page uses the DAFIC **Simple** mode as the system baseline: primary `#0A8080`, canvas `#FFFFFF`, subdued surface `#E6E6E6`, ink `#27272A`, muted text `#71717A`, and border `#D4D4D8`.

## Outcome narrative panel

- **Purpose:** present each business outcome as a scroll-led editorial panel.
- **Anatomy:** contextual label, outcome headline, supporting copy, focal visual slot, animated circle field.
- **States:** resting, entering, visible, and reduced-motion fallback.
- **Responsive:** two columns on wide screens; visual then content on small screens.
- **RTL:** copy remains a logical content block; heading and body inherit the document direction.
- **Typography/tokens:** uses the design-system font stack, neutral ink/surfaces, `20px` and `32px` radius levels where a card uses rounding.

## Foresight catalogue card

- **Purpose:** link a future-of-industry theme to its book or event detail.
- **Anatomy:** visual image slot, card title, industry meta label, heading, tags, optional action slot.
- **States:** default, hover/focus, compact mobile layout.
- **Responsive:** three columns to one column; all reading order is preserved.
- **RTL:** metadata and content are direction-aware; visual stays independent.
- **Typography/tokens:** white surface, `#D4D4D8` dividers, `#71717A` secondary type and teal action color.

## Local preview-only frame

- **Purpose:** provide a guaranteed local visual fallback when the Next development runtime cannot bind.
- **Scope:** not a replacement for the Next components; it is a temporary inspection surface that uses the same real assets and content hierarchy.
