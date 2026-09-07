# Design QA

**Source visual truth path**

`/Users/mac/Documents/Codex/2026-09-05/hdk-x20/work/pdf-pages/aliaflow-reference.png`

**Implementation screenshot path**

Unavailable pending permission to run a browser capture.

**Viewport**

Target: 1440 CSS px wide. Full source height: 33,697 px.

**Pixel dimensions and density normalization**

- Source render: 1440 x 33,697 RGB pixels at 1x.
- Embedded implementation artwork: 15 lossless WebP slices, each 1440 px wide; combined height 33,697 px at 1x.
- Offline decoded-pixel comparison: pixel-identical; `ImageChops.difference(...).getbbox()` returned `None`.
- Browser-rendered dimensions and density: not yet captured.

**State**

Default landing-page state at the top of the page.

**Full-view comparison evidence**

The image payload embedded in the final standalone HTML decodes to a full 1440 x 33,697 image that is pixel-identical to the source render. This verifies source artwork, copy, colors, typography rasterization, spacing, image crops, and page order before browser layout.

**Focused region comparison evidence**

Source crops were visually inspected in 2,400 px-high regions. Browser-rendered focused-region evidence is unavailable pending permission to run Playwright.

**Findings**

- [P2] Browser-rendered evidence is missing.
  Location: final standalone HTML at 1440 px viewport.
  Evidence: the embedded artwork is pixel-identical offline, but no browser screenshot has been captured.
  Impact: CSS sizing, seams between image slices, and browser decoding cannot be formally signed off from browser evidence.
  Fix: capture the local page at 1440 px, compare the result with the source in a combined image, and record the result.

**Required fidelity surfaces**

- Fonts and typography: preserved in the lossless source-derived raster; browser presentation pending capture.
- Spacing and layout rhythm: preserved in the lossless source-derived raster; CSS uses block images with zero gaps; browser presentation pending capture.
- Colors and visual tokens: embedded pixels match the source exactly; browser color presentation pending capture.
- Image quality and asset fidelity: source-derived lossless WebP slices are embedded directly and decode pixel-identically.
- Copy and content: preserved exactly from the source render.

**Primary interactions tested**

Static inspection confirms transparent semantic anchors are present for the primary navigation and four service-catalogue controls. Browser click behavior has not yet been exercised.

**Console errors checked**

Not yet; requires browser inspection.

**Comparison history**

- Initial offline pass: source and embedded pixels match exactly. Browser capture remains the only blocking P2 item.

**Implementation checklist**

- Capture the page at a 1440 px viewport.
- Verify all 15 slices render without seams.
- Exercise primary navigation and service-catalogue anchors.
- Check the browser console.
- Run a combined source/implementation visual comparison.

**Follow-up polish**

None identified from the source-derived artwork.

final result: blocked
