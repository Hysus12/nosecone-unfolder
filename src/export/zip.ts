import JSZip from 'jszip';
import type { ExportBundle } from '../models/types';

export async function renderZipBundle(bundle: Omit<ExportBundle, 'zipBytes'>): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(bundle.manifest, null, 2));
  zip.file('manifest.txt', [
    `title=${bundle.manifest.title}`,
    `pages=${bundle.manifest.pages}`,
    `pieceCount=${bundle.manifest.pieceCount}`,
    `generatedAtIso=${bundle.manifest.generatedAtIso}`
  ].join('\n'));
  zip.file('templates.pdf', bundle.pdfBytes);
  bundle.svgPages.forEach((page, index) => {
    zip.file(`svg/page-${String(index + 1).padStart(2, '0')}.svg`, page.svg);
  });
  zip.file('svg/combined.svg', bundle.combinedSvg);
  return zip.generateAsync({ type: 'uint8array' });
}
