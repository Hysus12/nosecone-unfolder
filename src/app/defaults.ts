import type { NoseConeSpec } from '../models/types';

export const DEFAULT_SPEC: NoseConeSpec = {
  title: '\u6559\u5ba4\u5206\u6bb5\u9f3b\u9310',
  componentKind: 'nose_cone',
  shapeType: 'tangent_ogive',
  baseDiameterMm: 50,
  lengthMm: 130,
  tipRadiusMm: 0.4,
  shoulder: {
    lengthMm: 35,
    outerDiameterMm: 48.5,
    wallThicknessMm: 0.8,
    discOffsetMm: 8
  },
  sampleCount: 6,
  segmentCount: 3,
  ribCount: 2,
  intermediateDiscCount: 3,
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