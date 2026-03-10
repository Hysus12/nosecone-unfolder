import { DEFAULT_SPEC } from '../app/defaults';
import type { NoseConeSpec } from '../models/types';

export const MANUAL_EXAMPLES: NoseConeSpec[] = [
  DEFAULT_SPEC,
  {
    ...DEFAULT_SPEC,
    title: '分段橢圓鼻錐',
    shapeType: 'elliptical',
    lengthMm: 150,
    baseDiameterMm: 60,
    segmentCount: 14
  },
  {
    ...DEFAULT_SPEC,
    title: 'PDF 金樣分段參考',
    shapeType: 'tangent_ogive',
    lengthMm: 160,
    baseDiameterMm: 54,
    segmentCount: 10,
    backingStripWidthMm: 9,
    sampleCount: 96
  },
  {
    ...DEFAULT_SPEC,
    title: '轉接段範例',
    componentKind: 'transition',
    shapeType: 'conical',
    baseDiameterMm: 80,
    transitionEndDiameterMm: 45,
    lengthMm: 90,
    shoulder: undefined,
    segmentCount: 8
  }
];
