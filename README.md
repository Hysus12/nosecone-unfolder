# openrocket-nosecone-unfolder-offline

An offline nose-cone/transition template tool (runs by opening `index.html` directly), based on Apogee Newsletter 410:
- https://www.apogeerockets.com/education/downloads/Newsletter410.pdf

## What it does
- Generate printable templates from manual nose-cone/transition parameters
- Import OpenRocket `.ork` files (browser-side parsing)
- Produce segmented shrouds, backing strips, ribs, support discs, and shoulder/coupler parts (nose cone)
- Preview page layout and export `SVG`, `PDF`, and `ZIP`
- Run fully offline with `file://`

## Quick start
1. Install Node.js 18+
2. In project root, run:
   - `npm install`
   - `npm run build`
   - `npm run offline-dist`
3. Open `offline-dist/index.html` or double-click `offline-dist/Start-App.bat`

## Student one-click package (no Node.js on student laptops)
For maintainers:
1. Run `npm run release:win`
2. Output folder: `release/windows/`
3. Artifacts:
   - `OpenRocketNoseconeUnfolder-offline-dist-<version>.zip`
   - `OpenRocketNoseconeUnfolder-Setup-<version>.exe` (if Inno Setup 6 is installed)

For students:
- Download the `.zip` or `Setup.exe`
- Extract/install and double-click `Start-App.bat`

## Basic workflow
1. Load an example or enter parameters
2. Optionally import a `.ork` file
3. Check preview and piece list
4. Click `Export PDF`, `Export SVG`, or `Export ZIP`
5. Print at 100% scale and verify the 20 mm calibration square before cutting

## Photos
The first three images are real build photos. The fourth image is the Newsletter 410 reference page.

<img src="docs/images/03-real-print-templates.jpg" alt="Real build 3: printed templates" width="50%" />
<img src="docs/images/02-real-build-ribs-discs.jpg" alt="Real build 2: internal support structure" width="50%" />
<img src="docs/images/01-real-build-segmented.jpg" alt="Real build 1: segmented shell test" width="50%" />
<img src="docs/images/04-newsletter410-reference.jpg" alt="Reference 4: Newsletter 410 page" width="50%" />

For technical details, see [architecture.md](./architecture.md).

## Latest fixes (v0.1.1)
- ORK import now uses OpenRocket units correctly (`m -> mm`)
- ORK import focuses on `nosecone` only; transition components are ignored
- Nose-cone shoulder dimensions are mapped from ORK `aftshoulder*` fields
- Default classroom values updated: `Segment count = 3`, `Sample count = 6`
