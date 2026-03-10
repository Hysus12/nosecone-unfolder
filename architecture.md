# Architecture

## Reference and build method
This project follows the segmented paper-construction workflow demonstrated in Apogee Newsletter 410:
- https://www.apogeerockets.com/education/downloads/Newsletter410.pdf

Core rules implemented:
- Axisymmetric profiles are sampled and segmented into frustum-like sections.
- Each section is unfolded independently (no single smooth ogive unfold).
- Ribs follow the same segmented approximation.
- Intermediate support discs are sectioned and include slot-corner relief.
- Default seam mode is butt joint with separate backing strips.
- Tip section includes trim guidance.
- Nose-cone shoulder generation includes coupler sleeve + offset internal disc.

## Project layout
- `src/geometry/`: profile sampling, segmentation, unfolding, ribs/discs/shoulder, template assembly
- `src/layout/`: page packing and placed-geometry transforms
- `src/export/`: SVG/PDF/ZIP generation
- `src/ork/`: OpenRocket `.ork` zip/xml parsing
- `src/components/`: UI panels and previews
- `src/app/`: app orchestration, defaults, i18n, services
- `src/test/`: geometry/layout/export/parser regression tests
- `public/examples/`: bundled local fixtures

## Geometry pipeline
1. `sampleProfile(spec, nSamples)` -> monotonic `(x, r)` stations
2. `segmentProfile(profile, nSegments, 'equal_x')` -> segment set
3. `unfoldSegment(segment, seamStyle)` -> per-segment cut geometry
4. Build structure pieces:
   - shrouds
   - backing strips
   - polygonal cross ribs
   - sectioned support discs
   - shoulder sleeve/disc (nose cone)
5. Pack pieces into pages with non-overlap layout
6. Render with shared coordinates to SVG and PDF

## Export pipeline
- SVG preview/export and PDF export use the same layout coordinates.
- ZIP bundle contains:
  - `templates.pdf`
  - `svg/page-XX.svg`
  - `svg/combined.svg`
  - `manifest.json`
  - `manifest.txt`

## Offline packaging
Build commands:
- `npm run build`
- `npm run offline-dist`

Output folder:
- `offline-dist/index.html`
- `offline-dist/assets/`
- `offline-dist/examples/`
- `offline-dist/README-STUDENT.txt`

`offline-dist/index.html` is generated with relative asset references and runs under `file://` in Chromium-based browsers.

## Validation and tests
Run tests:
- `npm run test`

Coverage focus:
- profile sampling
- segmentation and unfolding
- slot/tolerance behavior
- PDF-conformance checks (segmented ribs/discs/seams/tip/shoulder)
- ORK parser behavior
- layout non-overlap
- SVG/PDF export smoke tests
- golden dimensional regression

## Current limitations
- Transition/boattail v1 supports segmented shroud generation and shared rib/disc logic only.
- `equal_slant_approx` strategy is not exposed in v1.
- PDF text uses conservative ASCII-safe fallback for maximum compatibility with built-in PDF font encoding.

## Roadmap
- Additional rib modes (beyond cross-rib baseline)
- Deeper OpenRocket shape mapping
- Expanded tip-trim options
- More combined-sheet export controls
