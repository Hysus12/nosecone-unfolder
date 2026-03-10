import type { SampledProfilePoint, SegmentSpec, SegmentationStrategy } from '../models/types';
import { EPSILON, lerp } from '../utils/math';

export function interpolateRadiusAtX(profile: SampledProfilePoint[], xMm: number): number {
  if (xMm <= profile[0].xMm) {
    return profile[0].radiusMm;
  }
  if (xMm >= profile[profile.length - 1].xMm) {
    return profile[profile.length - 1].radiusMm;
  }

  for (let index = 1; index < profile.length; index += 1) {
    const left = profile[index - 1];
    const right = profile[index];
    if (xMm <= right.xMm) {
      const localT = (xMm - left.xMm) / Math.max(EPSILON, right.xMm - left.xMm);
      return lerp(left.radiusMm, right.radiusMm, localT);
    }
  }

  return profile[profile.length - 1].radiusMm;
}

export function segmentProfile(
  profile: SampledProfilePoint[],
  nSegments: number,
  strategy: SegmentationStrategy = 'equal_x'
): SegmentSpec[] {
  if (strategy !== 'equal_x') {
    throw new Error(`Unsupported segmentation strategy: ${strategy}`);
  }

  const lengthMm = profile[profile.length - 1].xMm;
  const step = lengthMm / nSegments;
  const segments: SegmentSpec[] = [];

  for (let index = 0; index < nSegments; index += 1) {
    const x1Mm = step * index;
    const x2Mm = step * (index + 1);
    const r1Mm = interpolateRadiusAtX(profile, x1Mm);
    const r2Mm = interpolateRadiusAtX(profile, x2Mm);
    const axialLengthMm = x2Mm - x1Mm;
    const slantLengthMm = Math.hypot(axialLengthMm, r2Mm - r1Mm);

    segments.push({
      index,
      x1Mm,
      r1Mm,
      x2Mm,
      r2Mm,
      axialLengthMm,
      slantLengthMm,
      lowerRadiusMm: Math.min(r1Mm, r2Mm),
      upperRadiusMm: Math.max(r1Mm, r2Mm)
    });
  }

  return segments;
}
