import { describe, expect, it } from 'vitest';
import { buildTemplatePieces } from '../geometry/templates';
import { layoutPages } from '../layout/pages';
import { renderSvgPages } from '../export/svg';
import { renderPdfFromLayout } from '../export/pdf';
import type { NoseConeSpec } from '../models/types';

const GOLDEN_CONICAL: NoseConeSpec = {
  title: 'Golden Conical Regression',
  componentKind: 'nose_cone',
  shapeType: 'conical',
  baseDiameterMm: 40,
  lengthMm: 100,
  tipRadiusMm: 0,
  shoulder: undefined,
  sampleCount: 32,
  segmentCount: 4,
  ribCount: 2,
  intermediateDiscCount: 1,
  materialThicknessMm: 1.5,
  toleranceMm: 0.2,
  slotPolicy: 'distributed_slot_clearance',
  glueStyle: 'butt_with_backing_strip',
  seamAllowanceMm: 0,
  backingStripWidthMm: 8,
  pageSize: 'A4',
  pageMarginMm: 8,
  units: 'mm',
  ribMode: 'cross_ribs'
};

describe('layout and export', () => {
  it('produces non-overlapping layout items', () => {
    const project = buildTemplatePieces(GOLDEN_CONICAL);
    const pages = layoutPages(project.pieces, { size: GOLDEN_CONICAL.pageSize, marginMm: GOLDEN_CONICAL.pageMarginMm });
    const firstPage = pages[0];
    for (let i = 0; i < firstPage.items.length; i += 1) {
      for (let j = i + 1; j < firstPage.items.length; j += 1) {
        const a = firstPage.items[i];
        const b = firstPage.items[j];
        const overlap = !(a.xMm + a.widthMm <= b.xMm || b.xMm + b.widthMm <= a.xMm || a.yMm + a.heightMm <= b.yMm || b.yMm + b.heightMm <= a.yMm);
        expect(overlap).toBe(false);
      }
    }
  });

  it('renders valid SVG with calibration square', () => {
    const project = buildTemplatePieces(GOLDEN_CONICAL);
    const pages = layoutPages(project.pieces, { size: GOLDEN_CONICAL.pageSize, marginMm: GOLDEN_CONICAL.pageMarginMm });
    const svgPages = renderSvgPages(pages, project.pieces, { title: project.spec.title, units: project.spec.units });
    expect(svgPages[0].svg).toContain('<svg');
    expect(svgPages[0].svg).toContain('20 mm');
    expect(svgPages[0].svg).toContain('width="20" height="20"');
  });

  it('renders a vector PDF byte stream', async () => {
    const project = buildTemplatePieces(GOLDEN_CONICAL);
    const pages = layoutPages(project.pieces, { size: GOLDEN_CONICAL.pageSize, marginMm: GOLDEN_CONICAL.pageMarginMm });
    const bytes = await renderPdfFromLayout(pages, project.pieces, { title: project.spec.title, units: project.spec.units });
    const header = String.fromCharCode(...bytes.slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('keeps golden regression geometry stable', () => {
    const project = buildTemplatePieces(GOLDEN_CONICAL);
    const shrouds = project.pieces.filter((piece) => piece.kind === 'shroud');
    shrouds.forEach((piece) => {
      if (piece.kind === 'shroud') {
        expect(piece.outerDevelopedRadiusMm - piece.innerDevelopedRadiusMm).toBeCloseTo(25.495098, 3);
        expect(piece.sweepAngleRad).toBeCloseTo(1.232234, 3);
      }
    });
    const strip = project.pieces.find((piece) => piece.kind === 'backing_strip');
    expect(strip?.kind).toBe('backing_strip');
    if (strip?.kind === 'backing_strip') {
      expect(strip.stripWidthMm).toBe(8);
      expect(strip.stripLengthMm).toBeCloseTo(23.995098, 3);
    }
    const pages = layoutPages(project.pieces, { size: GOLDEN_CONICAL.pageSize, marginMm: GOLDEN_CONICAL.pageMarginMm });
    expect(pages[0].items[0]).toMatchObject({ pieceId: 'shroud-4', xMm: 8, yMm: 8, rotationDeg: 90 });
    expect(pages[0].items[0].widthMm).toBeCloseTo(96.191284, 3);
    expect(pages[0].items[0].heightMm).toBeCloseTo(76.577226, 3);
    expect(pages[0].items[4]).toMatchObject({ pieceId: 'rib-2', rotationDeg: 0 });
    expect(pages[0].items[4].xMm).toBeCloseTo(8, 3);
    expect(pages[0].items[4].yMm).toBeCloseTo(137.0997, 3);
    expect(pages[0].items[4].widthMm).toBeCloseTo(100, 3);
    expect(pages[0].items[4].heightMm).toBeCloseTo(40, 3);
  });
});
