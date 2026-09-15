# Design QA — Risk Setting carousel

**Source visual truth path**

`/var/folders/vq/9cn4z2r911vc7xhryc7k99y40000gn/T/codex-clipboard-0a824f3c-c148-441a-bef5-193413ef3eae.png`

**Implementation screenshot path**

Codex in-app browser capture of `http://localhost:4173/#risk-setting`.

**Viewport**

906 × 822 CSS px desktop browser viewport.

**Pixel dimensions and density normalization**

- Source reference: 762 × 622 px.
- Implementation browser capture: 906 × 822 CSS px, reviewed at 1× browser density.
- Comparison was normalized by proportion rather than pixel equality because the implementation is responsive and adds carousel items beyond the source’s three visible cards.

**State**

Desktop default state, with a second check after activating the next-card control.

**Full-view comparison evidence**

The browser-rendered section was compared against the supplied reference: the grey top cap, compact white heading panel, circular strategy illustration, three-column bordered card grid, and card hierarchy match. The people asset supplied by the user is used directly for every card.

**Focused region comparison evidence**

Focused review covered the heading/copy/icon row and the first three cards. The initial header was too tall; it was reduced to the source proportion and the cards were changed to near-square image slots.

**Findings**

- No actionable P0/P1/P2 differences remain for the new risk-setting section.

**Required fidelity surfaces**

- Fonts and typography: Arial/Helvetica system stack, bold display title, compact metadata, and small body copy match the reference’s neutral sans-serif hierarchy.
- Spacing and layout rhythm: notched cap, 2 px grid lines, header-to-rail transition, three desktop cards, and mobile single-card peek are implemented.
- Colors and visual tokens: white canvas, light-grey image panels, medium-grey rule/cap, and charcoal text follow the supplied reference.
- Image quality and asset fidelity: the supplied people image is used directly in every card, with top-aligned cover cropping; the circular strategy illustration is sourced from the supplied reference image.
- Copy and content: source headings and card labels are retained; additional cards make the carousel scrollable.

**Primary interactions tested**

The next-card control was exercised in the browser and shifted the rail by 301 px. The focusable rail also supports keyboard arrows, drag/scroll, and snap behavior.

**Console errors checked**

No console errors observed in the browser preview.

**Comparison history**

- Initial pass: header was over-tall relative to the reference.
- Fixed: header reduced to a compact 184 px composition and card image areas changed to near-square proportions.
- Final browser pass: no actionable P0/P1/P2 differences.

**Implementation checklist**

- [x] Responsive risk-setting section implemented.
- [x] Supplied team image added to the public asset bundle.
- [x] Horizontal drag/scroll rail with snap behavior and controls implemented.
- [x] Browser preview checked and control interaction exercised.
- [x] Production build and Sites worker tests passed.

**Follow-up polish**

- [P3] Replace the duplicated demo copy and image with per-service CMS content when those assets are available.

final result: passed
