# Card Detail Pages — Design

Date: 2026-09-16
Status: Approved (design); implementation not started
Scope: Site only. The CMS editor UI is explicitly out of scope for this spec.

## Problem

Every card section on the marketing page is a dead end. A reader who is drawn in by
"Future of Banking" or "Risk Setting" has nowhere to go. The nine card sections carry
the nine services the business actually sells, and each card is currently three lines
of body copy with no way to learn more.

This spec adds an article page behind every card, reachable by clicking the card.

## Goals

- Each of the 27 cards (9 sections x 3 cards) resolves to its own article page.
- The article page reads as the same publication as the landing page — same type
  scale, same rules, same three-tone palette — not as a generic blog template.
- Content is authored in the existing section records, so the future CMS work is
  an editor-UI problem and not a data-modelling problem.
- The landing page's existing appearance does not change, apart from cards gaining
  a link affordance.

## Non-goals

- No CMS editing UI for the new fields. The admin section editor does not yet render
  nested lists; adding that is separate work.
- No search, tags, pagination, or article index page.
- No redesign of the six image-card sections on the landing page.
- No new copywriting. Seed content carries the existing placeholder body text.

## Routing

    /services/[section]/[slug]

Example: `/services/future-of-x-book/future-of-banking`

One dynamic route file handles all nine sections. The `services` prefix is
deliberate: a top-level `[section]` segment would sit in the same position as
`/admin` and `/api` and shadow any future top-level route, which is a failure mode
that costs nothing to avoid now.

An unknown section or slug calls `notFound()`.

## Section registry

A single module, `lib/card-pages.ts`, is the one place that knows how the nine
route segments map onto section records. Everything else — the page, the landing
components, the metadata — reads from it. Adding a tenth section is one entry here.

| Route segment | Section key | Data path | Theme | Number |
|---|---|---|---|---|
| `future-of-x-book` | `thrivable-business` | `futures` | light | 1 |
| `critical-business-loop` | `thrivable-business` | `loops` | light | 2 |
| `brand-culture-xp` | `thrivable-business` | `cultures` | light | 3 |
| `business-game` | `business-leadership` | `statements[0].cards` | dark | 4 |
| `strategic-roles` | `business-leadership` | `statements[1].cards` | dark | 5 |
| `leadership-model` | `business-leadership` | `statements[2].cards` | dark | 6 |
| `risk-setting` | `technocratic-design` | `statements[0].cards` | light | 7 |
| `change-solving` | `technocratic-design` | `statements[1].cards` | light | 8 |
| `performance-testing` | `technocratic-design` | `statements[2].cards` | light | 9 |

Statement rows are addressed by their `number` field, not by array index. Index
lookup would silently retarget every page in a section the moment an editor
reorders the statements; `number` is the stable identity the seed already carries.

## Data model

Article content lives inside the card it belongs to, in the section record that
already holds that card. `lib/section-validation.ts` validates and normalises
nested lists recursively, so this needs no change to the validation layer.

Fields added to each card (all three `TileGrid` lists and both `statements[].cards`
lists):

| Field | Type | Purpose |
|---|---|---|
| `slug` | text | URL segment. Blank falls back to a slug derived from the display title. |
| `hero_image` | image | Article hero. Blank falls back — see below. |
| `hero_image_alt` | text | Alternative text for the hero. |
| `lead` | textarea | Opening paragraph, set at display scale. |
| `sections` | list | Article body: `heading` (text), `body` (textarea). |
| `key_points` | list | `title` (text), `body` (textarea). Rendered as a numbered trio. |
| `cta_heading` | text | Closing band heading. |
| `cta_label` / `cta_href` | text | Closing band button. |

The six image-card sections additionally gain `heading`, `label`, and `body`.

They need this because their existing `title` is not a display title. The schema
documents it as "Image description" and the landing page passes it to the `alt`
attribute and to the empty-card placeholder. Repurposing it would change what a
screen reader announces on the landing page, so `title` keeps its alt-text role
untouched and `heading` carries the display title.

**Display title** therefore means `heading` where present, falling back to `title`.
The three `TileGrid` sections leave `heading` blank and keep using `title`, which
is already a real display title for them. One helper in `lib/card-pages.ts`
resolves this, and nothing else in the codebase needs to know about the split.

### Fallback chain

Every new field is optional, because a half-authored card must not break the
landing page or crash a route. Resolution order for the hero image:

1. the card's own `hero_image`
2. the parent section's `question_image`
3. the card's `image`

Rule 2 sits above rule 3 deliberately. For the six image-card sections the card
`image` is a complete pre-designed card *with its text baked into the pixels*.
Blown up to hero width that text reappears at the wrong scale, next to the real
HTML title, saying the same thing twice. The parent section's question image is a
real photograph and degrades gracefully. Rule 3 remains as a last resort for the
three `TileGrid` sections, whose card images are plain photographs.

An article with no `lead` and no `sections` renders its hero, its card `body` as
the lead, and the CTA band. It looks sparse but correct.

## Page composition

The route renders these blocks in order. Each is a presentational component in
`components/card-page/`, taking plain props, with no data fetching of its own.

1. **Breadcrumb** — `ALIAFLOW / BUSINESS LEADERSHIP / BUSINESS GAME`, 12px,
   uppercase, `.12em` tracking. Links back to the landing section anchor.
2. **Title band** — two columns on the `.service-statement` model: card label as
   eyebrow, then the title at `clamp(44px, 6vw, 92px)` / `line-height .9` /
   `letter-spacing -.075em` / weight 800. Right column is the circular medallion
   from `.statement-mark` (175px, `#f1f1f1`, number at 72px/800) carrying the
   section number.
3. **Hero image** — full bleed, `60svh`, grayscale, 3px rule top and bottom.
4. **Lead** — `clamp(22px, 2.4vw, 31px)`, measure-limited. The 31px ceiling is the
   landing's own large-body size, from `.why-us > p` and `.fig-outcome-title p`.
5. **Body** — `max-width: 680px`, `16px / 1.45`. Headings `28px / -.05em / 800`
   with a 2px rule above.
6. **Key points** — three columns divided by 2px vertical rules, the `.future-grid`
   construction. Each carries a numeral at `88px / .7 / -.08em` in `#aaa`, lifted
   from `.why-list b`.
7. **CTA band** — `#aaa` ground, centred heading, the existing square button.
8. **Related rail** — the sibling cards of the same section, minus the current
   one, in a single shared card presentation. Once the six image-card sections
   gain `label` and `heading`, every card has the same three pieces of metadata,
   so one rail serves all nine sections rather than two rails serving one each.
   The rail respects the registry's `cardArt` flag: `photo` images fill and crop
   their frame, `composed` images are shown whole, because a composed card is a
   finished design whose text a crop would cut through.
9. **Footer** — the existing `<Footer />` component with its seeded data.

### Typography deviation

Body copy is set at `line-height: 1.45`, against the landing's `1.14`–`1.3`. The
tight setting is correct for three-line card blurbs and becomes hostile over
several hundred words. This is the single intentional departure from the landing's
type rules and is confined to the article body column.

### Dark theme

Sections marked dark invert using values that already exist in the stylesheet:
ground `#292929`, text `#fff`, body `#d3d3d3`, rules `#555`, medallion `#474747`
on `#f5f5f5`. No new colours are introduced. The theme is chosen by the registry,
not by the card, so a section is internally consistent.

### Responsive

At `<= 780px`: title clamps to its 44px floor, hero drops to `46svh`, key points
collapse to one column separated by 2px bottom rules (matching `.future-grid`'s
own mobile behaviour), gutters go to 10%.

## Landing page changes

`TileGrid` (`components/ThrivableBusiness.tsx`) and `CarouselSlide`
(`components/FutureImageCarousel.tsx`) wrap each card in a `next/link` when, and
only when, the card resolves to a slug. A card without a slug renders exactly as
it does today, as an unlinked article element.

Hover, desktop only: the card image scales to `1.03` over `.4s ease` inside the
existing `overflow: hidden` frame. Keyboard focus reuses the `3px solid #2557d6`
outline the carousel rails already use.

### Duplicate slides

`FigmaSections.tsx:118` and `:187` append `cards.slice(0, 2)` so each rail shows
five slides rather than three. Those two trailing slides are visual padding
pointing at the same two articles as the first two. They are marked `aria-hidden`
and given `tabIndex={-1}`, so the rail reads as three articles to a screen reader
and to the tab order while still looking like five.

## Error handling

| Case | Behaviour |
|---|---|
| Unknown route segment | `notFound()` |
| Unknown slug within a known section | `notFound()` |
| Section record missing from the database | `notFound()`, not a thrown error — a missing record must not surface a stack trace on a public URL |
| Card has no article content | Renders hero + card body as lead + CTA |
| Two cards in one section share a slug | The first wins; a duplicate-slug check is part of the test suite |

The route is `dynamic = "force-dynamic"`, matching the landing page, and
deliberately defines no `generateStaticParams`. The two cannot coexist:
`generateStaticParams` wins, and the 27 articles would be frozen at build time,
so a CMS publish would not reach readers until the next deploy. Section content
is exactly the thing expected to change after launch, so the pages render on
demand.

`generateMetadata` supplies title and description per article, from the card's
`heading`/`title` and `lead`.

## Testing

The project uses Vitest. New unit tests, following the existing `lib/*.test.ts`
pattern:

- `lib/card-pages.test.ts`
  - every registry entry resolves against seeded section data
  - statement lookup is by `number` and survives a reordered `statements` array
  - slug derivation: casing, spaces, punctuation, and an already-slugged title
  - blank `slug` falls back to the derived slug
  - display title resolves to `heading` when set and to `title` when not
  - hero fallback chain returns `question_image` before the card `image`
  - duplicate slugs within one section are detected
  - unknown section and unknown slug both resolve to null

- `lib/sections.schema.test.ts` — extended to assert the new card fields validate,
  and that a card carrying none of them still passes.

Route-level rendering is verified manually in the browser against both themes and
both breakpoints, consistent with how the existing page components are checked.

## Implementation order

1. `lib/card-pages.ts` registry, slug derivation, and resolver, with its tests.
2. Schema additions and seed content for all 27 cards.
3. `app/services/[section]/[slug]/page.tsx` and the `components/card-page/` blocks.
4. `app/card-page.css`.
5. Landing-page linking in `TileGrid` and `CarouselSlide`, plus the duplicate-slide
   accessibility fix.
