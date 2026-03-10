import { describe, expect, it } from 'vitest';
import { DEFAULT_SPEC } from '../app/defaults';
import { sampleProfile } from '../geometry/profile';
import { segmentProfile } from '../geometry/segmentation';
import { unfoldSegment } from '../geometry/unfold';
import { toMillimeters } from '../utils/units';

describe('profile sampling', () => {
  it('creates monotonic tangent ogive stations', () => {
    const profile = sampleProfile(DEFAULT_SPEC, 80);
    expect(profile).toHaveLength(80);
    for (let index = 1; index < profile.length; index += 1) {
      expect(profile[index].xMm).toBeGreaterThan(profile[index - 1].xMm);
      expect(profile[index].radiusMm).toBeGreaterThanOrEqual(0);
    }
  });

  it('converts inch input to millimeters', () => {
    expect(toMillimeters(1, 'inch')).toBeCloseTo(25.4, 6);
  });

  it('handles a sharp tip without NaN', () => {
    const profile = sampleProfile({ ...DEFAULT_SPEC, tipRadiusMm: 0, shapeType: 'conical' }, 40);
    expect(profile[0].radiusMm).toBe(0);
    expect(profile.every((point) => Number.isFinite(point.radiusMm))).toBe(true);
  });

  it('supports high segment counts', () => {
    const profile = sampleProfile({ ...DEFAULT_SPEC, segmentCount: 24 }, 160);
    const segments = segmentProfile(profile, 24, 'equal_x');
    expect(segments).toHaveLength(24);
    expect(segments.every((segment) => segment.slantLengthMm > 0)).toBe(true);
  });

  it('unfolds an almost conical segment stably', () => {
    const segment = {
      index: 0,
      x1Mm: 0,
      r1Mm: 10,
      x2Mm: 20,
      r2Mm: 10.01,
      axialLengthMm: 20,
      slantLengthMm: Math.hypot(20, 0.01),
      lowerRadiusMm: 10,
      upperRadiusMm: 10.01
    };
    const unfolded = unfoldSegment(segment, 'butt_with_backing_strip');
    expect(unfolded.cutPaths.length).toBeGreaterThan(0);
    expect(unfolded.seamLengthMm).toBeGreaterThan(0);
  });
});
