import type { NoseConeSpec } from '../models/types';

export const GOLDEN_REFERENCE_SPEC: NoseConeSpec = {
  title: 'Golden PDF Reference',
  componentKind: 'nose_cone',
  shapeType: 'tangent_ogive',
  baseDiameterMm: 54,
  lengthMm: 160,
  tipRadiusMm: 0.2,
  shoulder: {
    lengthMm: 30,
    outerDiameterMm: 52,
    innerDiameterMm: 50.4,
    discOffsetMm: 7
  },
  sampleCount: 96,
  segmentCount: 10,
  ribCount: 2,
  intermediateDiscCount: 4,
  materialThicknessMm: 1.5,
  toleranceMm: 0.24,
  slotPolicy: 'distributed_slot_clearance',
  glueStyle: 'butt_with_backing_strip',
  seamAllowanceMm: 0,
  backingStripWidthMm: 9,
  pageSize: 'A4',
  pageMarginMm: 8,
  units: 'mm',
  ribMode: 'cross_ribs'
};
