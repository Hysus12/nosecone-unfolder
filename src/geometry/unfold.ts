import type { GlueStyle, Point2D, PolylinePath, SegmentSpec } from '../models/types';
import { arcPoints, boundsFromPaths, EPSILON, nearlyEqual } from '../utils/math';

export interface UnfoldedSegmentGeometry {
  cutPaths: PolylinePath[];
  guidePaths: PolylinePath[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  sweepAngleRad: number;
  innerDevelopedRadiusMm: number;
  outerDevelopedRadiusMm: number;
  seamLengthMm: number;
  tipTrimGuideMm?: number;
  usesBackingStrip: boolean;
}

function buildRectangle(width: number, height: number): PolylinePath {
  return {
    closed: true,
    points: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ]
  };
}

export function unfoldSegment(
  segment: SegmentSpec,
  seamStyle: GlueStyle,
  options: { isTopSegment?: boolean } = {}
): UnfoldedSegmentGeometry {
  const r1 = segment.r1Mm;
  const r2 = segment.r2Mm;
  const slant = segment.slantLengthMm;
  const usesBackingStrip = seamStyle === 'butt_with_backing_strip';

  if (nearlyEqual(r1, r2, 1e-4)) {
    const width = 2 * Math.PI * ((r1 + r2) / 2);
    const path = buildRectangle(width, slant);
    const tipTrimGuideMm = options.isTopSegment ? Math.min(2.5, slant * 0.2) : undefined;
    return {
      cutPaths: [path],
      guidePaths: tipTrimGuideMm
        ? [
            {
              closed: false,
              points: [
                { x: width - tipTrimGuideMm, y: 0 },
                { x: width, y: tipTrimGuideMm }
              ]
            }
          ]
        : [],
      bounds: boundsFromPaths([path]),
      sweepAngleRad: 0,
      innerDevelopedRadiusMm: 0,
      outerDevelopedRadiusMm: slant,
      seamLengthMm: slant,
      tipTrimGuideMm,
      usesBackingStrip
    };
  }

  const deltaRadius = Math.abs(r2 - r1);
  const sweepAngleRad = (2 * Math.PI * deltaRadius) / Math.max(EPSILON, slant);
  const coneFactor = slant / deltaRadius;
  const developed1 = coneFactor * r1;
  const developed2 = coneFactor * r2;
  const innerDevelopedRadiusMm = Math.min(developed1, developed2);
  const outerDevelopedRadiusMm = Math.max(developed1, developed2);

  const outerArc = arcPoints({ x: 0, y: 0 }, outerDevelopedRadiusMm, 0, sweepAngleRad);
  const innerArc = innerDevelopedRadiusMm > EPSILON
    ? arcPoints({ x: 0, y: 0 }, innerDevelopedRadiusMm, sweepAngleRad, 0)
    : [{ x: 0, y: 0 }];

  const cutPath: PolylinePath = {
    closed: true,
    points: [...outerArc, ...innerArc]
  };

  const guidePaths: PolylinePath[] = [];
  let tipTrimGuideMm: number | undefined;
  if (options.isTopSegment) {
    tipTrimGuideMm = Math.min(2.5, slant * 0.22);
    const seamEnd = outerArc[outerArc.length - 1] as Point2D;
    guidePaths.push({
      closed: false,
      points: [
        seamEnd,
        { x: seamEnd.x - tipTrimGuideMm, y: seamEnd.y - tipTrimGuideMm }
      ]
    });
  }

  return {
    cutPaths: [cutPath],
    guidePaths,
    bounds: boundsFromPaths([cutPath, ...guidePaths]),
    sweepAngleRad,
    innerDevelopedRadiusMm,
    outerDevelopedRadiusMm,
    seamLengthMm: slant,
    tipTrimGuideMm,
    usesBackingStrip
  };
}
