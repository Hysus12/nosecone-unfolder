import type { DiscSpec, NoseConeSpec, ShoulderSleeveSpec } from '../models/types';
import { buildPieceBase } from './pieces';
import { arcPoints } from '../utils/math';
import { distributedSlotWidth } from '../utils/slots';

function fullDiscPath(radiusMm: number) {
  return {
    closed: true,
    points: arcPoints({ x: radiusMm, y: radiusMm }, radiusMm, 0, Math.PI * 2, 36)
  };
}

export function buildShoulder(spec: NoseConeSpec): Array<ShoulderSleeveSpec | DiscSpec> {
  if (!spec.shoulder) {
    return [];
  }

  const shoulder = spec.shoulder;
  const innerDiameterMm = shoulder.innerDiameterMm ?? shoulder.outerDiameterMm - 2 * (shoulder.wallThicknessMm ?? 0);
  const circumferenceMm = Math.PI * shoulder.outerDiameterMm;
  const slotWidthMm = distributedSlotWidth({
    materialThicknessMm: spec.materialThicknessMm,
    totalToleranceMm: spec.toleranceMm,
    contributingSlotCount: 1
  });

  const sleeve = buildPieceBase<ShoulderSleeveSpec>(
    {
      id: 'shoulder-sleeve',
      kind: 'shoulder_sleeve',
      title: '肩部套管',
      lengthMm: shoulder.lengthMm,
      circumferenceMm,
      assembly: {
        order: 300,
        note: `套管內圓片距離尾端 ${shoulder.discOffsetMm} mm。`
      }
    },
    {
      cutPaths: [
        {
          closed: true,
          points: [
            { x: 0, y: 0 },
            { x: circumferenceMm, y: 0 },
            { x: circumferenceMm, y: shoulder.lengthMm },
            { x: 0, y: shoulder.lengthMm }
          ]
        }
      ],
      guidePaths: [
        {
          closed: false,
          points: [
            { x: 0, y: shoulder.discOffsetMm },
            { x: circumferenceMm, y: shoulder.discOffsetMm }
          ]
        }
      ],
      labels: [
        {
          text: '肩部套管',
          position: { x: circumferenceMm * 0.2, y: shoulder.lengthMm * 0.5 }
        }
      ],
      notes: ['對接接縫請使用獨立背條。']
    }
  );

  const disc = buildPieceBase<DiscSpec>(
    {
      id: 'shoulder-disc',
      kind: 'shoulder_disc',
      title: '肩部定位圓片',
      stationIndex: 0,
      outerDiameterMm: innerDiameterMm,
      slotWidthMm,
      reliefRadiusMm: Math.max(0.8, spec.materialThicknessMm * 0.6),
      sectionCount: 1,
      assembly: {
        order: 301,
        note: `插入套管內，距尾端 ${shoulder.discOffsetMm} mm。`
      }
    },
    {
      cutPaths: [fullDiscPath(innerDiameterMm / 2)],
      labels: [
        {
          text: '肩部圓片',
          position: { x: innerDiameterMm * 0.25, y: innerDiameterMm * 0.25 }
        }
      ]
    }
  );

  return [sleeve, disc];
}
