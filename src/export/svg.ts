import type { LayoutPage, RenderedPage, TemplatePiece } from '../models/types';
import { pathToSvgD } from '../utils/math';
import { placeLabelPoint, placePieceGeometry } from '../layout/transform';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

export function renderSvgPages(
  pages: LayoutPage[],
  pieces: TemplatePiece[],
  meta: { title: string; units: string; language?: 'zh-Hant' | 'en' }
): RenderedPage[] {
  const pieceMap = new Map(pieces.map((piece) => [piece.id, piece]));
  const language = meta.language ?? 'zh-Hant';

  return pages.map((page) => {
    const cutMarkup: string[] = [];
    const guideMarkup: string[] = [];
    const labelMarkup: string[] = [];

    page.items.forEach((item) => {
      const piece = pieceMap.get(item.pieceId);
      if (!piece) {
        return;
      }
      const placed = placePieceGeometry(piece, item);
      placed.cutPaths.forEach((path) => {
        cutMarkup.push(`<path d="${pathToSvgD(path)}" class="cut" />`);
      });
      placed.guidePaths.forEach((path) => {
        guideMarkup.push(`<path d="${pathToSvgD(path)}" class="guide" />`);
      });
      piece.labels.forEach((label) => {
        const placedPoint = placeLabelPoint(piece, item, label.position);
        labelMarkup.push(
          `<text x="${placedPoint.x.toFixed(3)}" y="${placedPoint.y.toFixed(3)}" class="label">${escapeXml(label.text)}</text>`
        );
      });
    });

    const width = page.coordinateSystem.pageWidthMm;
    const height = page.coordinateSystem.pageHeightMm;
    const calibrationX = width - 32;
    const calibrationY = height - 32;
    const pageMetaText =
      language === 'en'
        ? `${escapeXml(meta.title)} | Page ${page.index + 1} | ${escapeXml(meta.units)}`
        : `${escapeXml(meta.title)} | ²Ä ${page.index + 1} ­¶ | ${escapeXml(meta.units)}`;
    const calibrationText = language === 'en' ? '20 mm calibration' : '20 mm ®Õ¥¿';

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">
  <title>${escapeXml(meta.title)} - Page ${page.index + 1}</title>
  <style>
    .cut { fill: none; stroke: #111; stroke-width: 0.2; }
    .guide { fill: none; stroke: #3a5f73; stroke-width: 0.15; stroke-dasharray: 1.2 0.8; }
    .frame { fill: none; stroke: #8a8a8a; stroke-width: 0.2; }
    .label { font-family: sans-serif; font-size: 3.2px; fill: #111; }
    .meta { font-family: sans-serif; font-size: 3px; fill: #555; }
  </style>
  <rect x="0.5" y="0.5" width="${(width - 1).toFixed(3)}" height="${(height - 1).toFixed(3)}" class="frame" />
  <text x="8" y="8" class="meta">${pageMetaText}</text>
  <rect x="${calibrationX}" y="${calibrationY}" width="20" height="20" class="frame" />
  <text x="${calibrationX}" y="${calibrationY - 1.5}" class="meta">${calibrationText}</text>
  ${guideMarkup.join('\n  ')}
  ${cutMarkup.join('\n  ')}
  ${labelMarkup.join('\n  ')}
</svg>`;

    return { page, svg };
  });
}
