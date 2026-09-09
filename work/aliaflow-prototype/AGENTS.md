# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

For the componentized Next.js rendition, the “YOUR THRIVABLE BUSINESS IS” manifesto heading must occupy a full viewport height, matching the preceding full-page outcome sections.
It must enter from the preceding heading through the existing scroll-pinned sequence; the following service catalogue then continues with normal document scrolling.
The dark values panel with the pale rounded triangle and the words “DIFFERENT / COMPETITIVE / SCALABLE” is a separate full-page scroll screen between that heading and the service catalogue.
Use the supplied `public/assets/subtract.svg` asset verbatim for the pale triangular form in this values panel.
Use `public/assets/future-of-x-book.svg` as the illustration in the first Future of X Book card, replacing its previous cyborg image.
For the “DESIRABLE / DIFFERENT” outcome, use the fixed reference-derived black-circle packing layout, including the large pale central circle, rather than a generic or randomly packed bubble field.
For the “FEASIBLE / COMPETITIVE” outcome, use its own reference-derived circle pack: text at left, a square pale panel at right, and black circles clustered around it.
For the “VIABLE / SCALABLE” outcome, use its own reference-derived circle pack and the large pale rounded rectangle on the left, with copy placed at the right.
The service-catalogue handoff must match the reference: a white catalogue panel with a centered bottom notch, followed by a grey Thrivable Business heading and the full-width “WHERE TO PLAY? / HOW TO WIN?” image.
Use `public/assets/where-to-play.png` verbatim for that image panel; its typography is embedded in the supplied image, so no additional text overlay is permitted.
The image panel must preserve the source image’s 5728:3037 aspect ratio so the full artwork is visible without vertical cropping.
The Critical Business Loop is a dedicated composition: a notched white header with the supplied loop illustration, followed by a three-column gridded colored-loop diagram panel and the three-column business-loop details below.
The Brand Culture & XP section is a dedicated composition: a notched white header with a pale circular culture icon, then three edge-to-edge halftone image panels and their aligned metadata/detail row below.
The Future of X card rail is CMS image-only: title, copy, and visual design are baked into each uploaded image rather than entered as separate fields. It is a horizontally draggable carousel.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
