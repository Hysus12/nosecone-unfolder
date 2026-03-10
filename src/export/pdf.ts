import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { LayoutPage, TemplatePiece } from '../models/types';
import { placeLabelPoint, placePieceGeometry } from '../layout/transform';

const MM_TO_PT = 72 / 25.4;

function toPt(valueMm: number): number {
  return valueMm * MM_TO_PT;
}

function toPdfSafeText(value: string, fallback: string): string {
  const sanitized = value
    .replace(/[^\x20-\x7E]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return sanitized.length > 0 ? sanitized : fallback;
}

export async function renderPdfFromLayout(
  pages: LayoutPage[],
  pieces: TemplatePiece[],
  meta: { title: string; units: string; language?: 'zh-Hant' | 'en' }
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pieceMap = new Map(pieces.map((piece) => [piece.id, piece]));
  const titleText = toPdfSafeText(meta.title, 'Template Project');
  const unitsText = toPdfSafeText(meta.units, 'mm');
  const language = meta.language ?? 'zh-Hant';

  for (const layoutPage of pages) {
    const widthPt = toPt(layoutPage.coordinateSystem.pageWidthMm);
    const heightPt = toPt(layoutPage.coordinateSystem.pageHeightMm);
    const page = pdf.addPage([widthPt, heightPt]);

    const drawLineMm = (x1: number, y1: number, x2: number, y2: number, guide = false) => {
      page.drawLine({
        start: { x: toPt(x1), y: heightPt - toPt(y1) },
        end: { x: toPt(x2), y: heightPt - toPt(y2) },
        thickness: toPt(guide ? 0.12 : 0.2),
        color: guide ? rgb(0.23, 0.37, 0.45) : rgb(0.07, 0.07, 0.07),
        opacity: guide ? 0.75 : 1
      });
    };

    page.drawRectangle({
      x: toPt(0.5),
      y: toPt(0.5),
      width: toPt(layoutPage.coordinateSystem.pageWidthMm - 1),
      height: toPt(layoutPage.coordinateSystem.pageHeightMm - 1),
      borderWidth: toPt(0.2),
      borderColor: rgb(0.55, 0.55, 0.55)
    });

    const pageHeading =
      language === 'en'
        ? `${titleText} | Page ${layoutPage.index + 1} | ${unitsText}`
        : `${titleText} | Page ${layoutPage.index + 1} | ${unitsText}`;

    page.drawText(pageHeading, {
      x: toPt(8),
      y: heightPt - toPt(8),
      size: toPt(3),
      font,
      color: rgb(0.35, 0.35, 0.35)
    });

    const calibrationX = layoutPage.coordinateSystem.pageWidthMm - 32;
    const calibrationY = layoutPage.coordinateSystem.pageHeightMm - 32;
    page.drawRectangle({
      x: toPt(calibrationX),
      y: heightPt - toPt(calibrationY + 20),
      width: toPt(20),
      height: toPt(20),
      borderWidth: toPt(0.2),
      borderColor: rgb(0.55, 0.55, 0.55)
    });
    page.drawText(language === 'en' ? '20 mm calibration' : '20 mm scale', {
      x: toPt(calibrationX),
      y: heightPt - toPt(calibrationY - 1.5),
      size: toPt(3),
      font,
      color: rgb(0.35, 0.35, 0.35)
    });

    for (const item of layoutPage.items) {
      const piece = pieceMap.get(item.pieceId);
      if (!piece) {
        continue;
      }
      const placed = placePieceGeometry(piece, item);
      for (const path of placed.guidePaths) {
        for (let index = 1; index < path.points.length; index += 1) {
          const start = path.points[index - 1];
          const end = path.points[index];
          drawLineMm(start.x, start.y, end.x, end.y, true);
        }
      }
      for (const path of placed.cutPaths) {
        for (let index = 1; index < path.points.length; index += 1) {
          const start = path.points[index - 1];
          const end = path.points[index];
          drawLineMm(start.x, start.y, end.x, end.y, false);
        }
        if (path.closed && path.points.length > 1) {
          const start = path.points[path.points.length - 1];
          const end = path.points[0];
          drawLineMm(start.x, start.y, end.x, end.y, false);
        }
      }
      for (const label of piece.labels) {
        const safeLabel = toPdfSafeText(label.text, piece.id.toUpperCase());
        const placedPoint = placeLabelPoint(piece, item, label.position);
        page.drawText(safeLabel, {
          x: toPt(placedPoint.x),
          y: heightPt - toPt(placedPoint.y),
          size: toPt(label.fontSizeMm ?? 3),
          font,
          color: rgb(0.1, 0.1, 0.1)
        });
      }
    }
  }

  return pdf.save();
}
