import type { DiscSpec, NoseConeSpec, SampledProfilePoint, SegmentSpec } from '../models/types';
import { buildPieceBase } from './pieces';
import { interpolateRadiusAtX } from './segmentation';
import { arcPoints } from '../utils/math';
import { distributedSlotWidth } from '../utils/slots';

function discQuadrantPath(radiusMm: number, slotWidthMm: number, reliefRadiusMm: number) {
  const slotHalf = slotWidthMm / 2;
  const outerArc = arcPoints({ x: 0, y: 0 }, radiusMm, 0, Math.PI / 2, 20);
  return {
    closed: true,
    points: [
      { x: slotHalf + reliefRadiusMm, y: 0 },
      ...outerArc,
      { x: 0, y: slotHalf + reliefRadiusMm },
      { x: 0, y: slotHalf },
      { x: reliefRadiusMm, y: slotHalf },
      { x: slotHalf, y: reliefRadiusMm },
      { x: slotHalf, y: 0 }
    ]
  };
}

function fullDiscPath(radiusMm: number) {
  return {
    closed: true,
    points: arcPoints({ x: radiusMm, y: radiusMm }, radiusMm, 0, Math.PI * 2, 36)
  };
}

export function buildDiscs(
  profile: SampledProfilePoint[],
  segments: SegmentSpec[],
  spec: NoseConeSpec
): DiscSpec[] {
  const discSpecs: DiscSpec[] = [];
  const slotWidthMm = distributedSlotWidth({
    materialThicknessMm: spec.materialThicknessMm,
    totalToleranceMm: spec.toleranceMm,
    contributingSlotCount: 1
  });
  const reliefRadiusMm = Math.max(0.8, spec.materialThicknessMm * 0.6);
  const usableStations = spec.intermediateDiscCount + 2;

  for (let index = 1; index <= spec.intermediateDiscCount; index += 1) {
    const xMm = (spec.lengthMm * index) / usableStations;
    const radiusMm = interpolateRadiusAtX(profile, xMm);
    for (let quadrantIndex = 0; quadrantIndex < 4; quadrantIndex += 1) {
      discSpecs.push(
        buildPieceBase<DiscSpec>(
          {
            id: `disc-${index}-q${quadrantIndex + 1}`,
            kind: 'disc_quadrant',
            title: `中間支撐片 ${index}-${quadrantIndex + 1}`,
            stationIndex: index,
            outerDiameterMm: radiusMm * 2,
            slotWidthMm,
            reliefRadiusMm,
            sectionCount: 4,
            assembly: {
              order: 200 + index,
              stationIndex: index,
              note: `分四片插入第 ${index} 站位。`
            }
          },
          {
            cutPaths: [discQuadrantPath(radiusMm, slotWidthMm, reliefRadiusMm)],
            labels: [
              {
                text: `D${index}-${quadrantIndex + 1}`,
                position: { x: radiusMm * 0.62, y: radiusMm * 0.4 }
              }
            ],
            notes: ['內角保留 relief，避免膠角干涉。']
          }
        )
      );
    }
  }

  const baseRadiusMm = segments[segments.length - 1].r2Mm;
  discSpecs.push(
    buildPieceBase<DiscSpec>(
      {
        id: 'bottom-disc',
        kind: 'disc_full',
        title: '底部支撐圓片',
        stationIndex: segments.length,
        outerDiameterMm: baseRadiusMm * 2,
        slotWidthMm,
        reliefRadiusMm,
        sectionCount: 1,
        assembly: {
          order: 260,
          stationIndex: segments.length,
          note: '底部圓片用於基部收口。'
        }
      },
      {
        cutPaths: [
          fullDiscPath(baseRadiusMm),
          {
            closed: true,
            points: [
              { x: baseRadiusMm - slotWidthMm / 2, y: 0 },
              { x: baseRadiusMm + slotWidthMm / 2, y: 0 },
              { x: baseRadiusMm + slotWidthMm / 2, y: baseRadiusMm * 2 },
              { x: baseRadiusMm - slotWidthMm / 2, y: baseRadiusMm * 2 }
            ]
          },
          {
            closed: true,
            points: [
              { x: 0, y: baseRadiusMm - slotWidthMm / 2 },
              { x: baseRadiusMm * 2, y: baseRadiusMm - slotWidthMm / 2 },
              { x: baseRadiusMm * 2, y: baseRadiusMm + slotWidthMm / 2 },
              { x: 0, y: baseRadiusMm + slotWidthMm / 2 }
            ]
          }
        ],
        labels: [
          {
            text: 'BASE',
            position: { x: baseRadiusMm * 0.7, y: baseRadiusMm * 0.7 }
          }
        ]
      }
    )
  );

  return discSpecs;
}
