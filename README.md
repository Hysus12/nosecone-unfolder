# openrocket-nosecone-unfolder-offline

以 `Newsletter410.pdf` 的紙製鼻錐/尾錐施工法為核心，建立可離線執行的 OpenRocket 模板工具。這個專案不把 ogive、elliptical、parabolic 視為單一可展曲面，而是先取樣、再分段、再把每段獨立展開，並讓肋片與支撐片沿用同一份分段近似。

## PDF-derived build philosophy
- 外殼必須採分段 frustum 展開，不做單片平滑 ogive 展開。
- 肋片外形必須跟著分段折線，不做平滑 ogive 肋片。
- 中間支撐片採分片插入，保留 inner-corner relief。
- 預設接縫為對接 + 獨立背條。
- 頂端片需要額外修剪導引。
- 肩部/套管需要偏移定位圓片。

## Developer setup
1. 安裝 Node.js 18+。
2. 在專案根目錄執行 `npm install`。
3. `npm run dev` 啟動開發模式。

## Build and offline-dist
1. `npm run build`
2. `npm run offline-dist`
3. 產出會放在 `offline-dist/`
4. 用 Chromium-based 瀏覽器直接開啟 `offline-dist/index.html`

## Mandatory file:// verification
每次 release 前都必須手動驗證：
1. 直接以 `file://` 開啟 `offline-dist/index.html`
2. 手動載入一組手動範例與一個 `.ork`
3. 確認 preview、SVG、PDF、ZIP 都可用
4. 開發者工具中不得出現 fetch、worker、chunk path 或 asset path 的 `file://` 錯誤

## Testing
- `npm run test`
- 測試涵蓋 profile sampling、segmentation、unfold、PDF-conformance、layout/export、ORK parser 與 golden regression

## Supported shapes
- conical
- tangent ogive
- secant ogive
- elliptical
- parabolic
- power series
- sampled profile

## Architecture overview
- `src/geometry/`: profile sampling、segmentation、unfold、ribs/discs/shoulder、template assembly
- `src/layout/`: page layout 與 placed geometry transform
- `src/export/`: SVG/PDF/ZIP export
- `src/ork/`: ORK zip/xml parser
- `src/components/`: Traditional Chinese UI
- `src/test/`: regression and conformance tests

## Known limitations
- transition/boattail 在 v1 只保證 segmented shroud + shared rib/disc support method
- `equal_slant_approx` 尚未開放
- 若本機沒有 Node.js，無法在此環境直接 build/test，但 source 與 scripts 已完整提供

## Roadmap
- N radial ribs
- more faithful OpenRocket shape mapping
- richer tip-piece trimming options
- multi-sheet combined SVG controls
