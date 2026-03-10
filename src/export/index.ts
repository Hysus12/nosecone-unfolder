import type { ExportBundle, LayoutPage, TemplatePiece } from '../models/types';
import { renderSvgPages } from './svg';
import { renderPdfFromLayout } from './pdf';
import { renderZipBundle } from './zip';

export { renderSvgPages } from './svg';
export { renderPdfFromLayout } from './pdf';
export { renderZipBundle } from './zip';

export async function buildExportBundle(
  pages: LayoutPage[],
  pieces: TemplatePiece[],
  meta: { title: string; units: string; warnings: string[]; language?: 'zh-Hant' | 'en' }
): Promise<ExportBundle> {
  const svgPages = renderSvgPages(pages, pieces, meta);
  const pdfBytes = await renderPdfFromLayout(pages, pieces, meta);
  const combinedSvg = svgPages.map((page) => page.svg).join('\n');
  const manifest = {
    title: meta.title,
    generatedAtIso: new Date().toISOString(),
    warnings: meta.warnings,
    pages: pages.length,
    pieceCount: pieces.length
  };
  const zipBytes = await renderZipBundle({
    svgPages,
    combinedSvg,
    pdfBytes,
    manifest
  });
  return {
    svgPages,
    combinedSvg,
    pdfBytes,
    zipBytes,
    manifest
  };
}
