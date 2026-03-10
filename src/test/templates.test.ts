import { describe, expect, it } from 'vitest';
import { DEFAULT_SPEC } from '../app/defaults';
import { buildTemplatePieces } from '../geometry/templates';

describe('PDF-conformance template generation', () => {
  it('creates polygonal ribs from segmented stations', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    const rib = project.pieces.find((piece) => piece.kind === 'rib');
    expect(rib?.kind).toBe('rib');
    if (rib?.kind === 'rib') {
      expect(rib.polygonStations.length).toBe(DEFAULT_SPEC.segmentCount + 1);
    }
  });

  it('sections intermediate support discs and adds relief', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    const discs = project.pieces.filter((piece) => piece.kind === 'disc_quadrant');
    expect(discs.length).toBe(DEFAULT_SPEC.intermediateDiscCount * 4);
    discs.forEach((disc) => {
      if (disc.kind === 'disc_quadrant') {
        expect(disc.reliefRadiusMm).toBeGreaterThan(0);
        expect(disc.sectionCount).toBe(4);
      }
    });
  });

  it('uses butt-joint backing strips by default', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    const strips = project.pieces.filter((piece) => piece.kind === 'backing_strip');
    expect(strips).toHaveLength(DEFAULT_SPEC.segmentCount);
  });

  it('adds special tip trimming metadata to the first shroud', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    const first = project.pieces.find((piece) => piece.kind === 'shroud' && piece.segmentIndex === 0);
    expect(first?.kind).toBe('shroud');
    if (first?.kind === 'shroud') {
      expect(first.tipTrimGuideMm).toBeGreaterThan(0);
    }
  });

  it('includes shoulder sleeve and offset disc when shoulder is enabled', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    expect(project.pieces.some((piece) => piece.kind === 'shoulder_sleeve')).toBe(true);
    expect(project.pieces.some((piece) => piece.kind === 'shoulder_disc')).toBe(true);
  });

  it('preserves assembly order from tip to base', () => {
    const project = buildTemplatePieces(DEFAULT_SPEC);
    const shrouds = project.pieces.filter((piece) => piece.kind === 'shroud');
    const orders = shrouds.map((piece) => piece.assembly.order);
    expect(orders).toEqual([...orders].sort((left, right) => left - right));
  });
});
