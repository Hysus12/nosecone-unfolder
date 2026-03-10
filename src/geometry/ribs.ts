import type { NoseConeSpec, RibSpec, SampledProfilePoint, SegmentSpec } from '../models/types';
import { buildPieceBase } from './pieces';
import { distributedSlotWidth } from '../utils/slots';

function ribStationsFromSegments(segments: SegmentSpec[]): SampledProfilePoint[] {
  const stations: SampledProfilePoint[] = [];
  segments.forEach((segment, index) => {
    if (index === 0) {
      stations.push({ index, xMm: segment.x1Mm, radiusMm: segment.r1Mm });
    }
    stations.push({ index: index + 1, xMm: segment.x2Mm, radiusMm: segment.r2Mm });
  });
  return stations;
}

function ribOutline(stations: SampledProfilePoint[]) {
  const upper = stations.map((station) => ({ x: station.xMm, y: station.radiusMm }));
  const lower = [...stations].reverse().map((station) => ({ x: station.xMm, y: -station.radiusMm }));
  return {
    closed: true,
    points: [...upper, ...lower]
  };
}

export function buildRibs(
  profile: SampledProfilePoint[],
  segments: SegmentSpec[],
  spec: NoseConeSpec
): RibSpec[] {
  const stations = ribStationsFromSegments(segments);
  const slotWidthMm = distributedSlotWidth({
    materialThicknessMm: spec.materialThicknessMm,
    totalToleranceMm: spec.toleranceMm,
    contributingSlotCount: 2
  });
  const slotDepthMm = spec.lengthMm / 2;
  const baseRadius = profile[profile.length - 1].radiusMm;
  const slotInset = Math.min(baseRadius * 0.6, 12);

  return [0, 1].map((ribIndex) => {
    const slotStartX = ribIndex === 0 ? 0 : spec.lengthMm - slotDepthMm;
    const slotEndX = ribIndex === 0 ? slotDepthMm : spec.lengthMm;

    return buildPieceBase<RibSpec>(
      {
        id: `rib-${ribIndex + 1}`,
        kind: 'rib',
        title: `支撐肋 ${ribIndex + 1}`,
        ribIndex,
        slotWidthMm,
        slotDepthMm,
        polygonStations: stations,
        assembly: {
          order: 100 + ribIndex,
          note: '先組十字支撐肋，再插入支撐片。'
        }
      },
      {
        cutPaths: [
          ribOutline(stations),
          {
            closed: true,
            points: [
              { x: slotStartX, y: -slotWidthMm / 2 },
              { x: slotEndX, y: -slotWidthMm / 2 },
              { x: slotEndX, y: slotWidthMm / 2 },
              { x: slotStartX, y: slotWidthMm / 2 }
            ]
          }
        ],
        guidePaths: [
          {
            closed: false,
            points: [
              { x: 0, y: 0 },
              { x: spec.lengthMm, y: 0 }
            ]
          },
          {
            closed: false,
            points: [
              { x: spec.lengthMm * 0.5, y: -slotInset },
              { x: spec.lengthMm * 0.5, y: slotInset }
            ]
          }
        ],
        labels: [
          {
            text: `R${ribIndex + 1}`,
            position: { x: spec.lengthMm * 0.5, y: baseRadius * 0.6 }
          }
        ],
        notes: ['外形採分段折線，不使用平滑 ogive 肋型。']
      }
    );
  });
}
