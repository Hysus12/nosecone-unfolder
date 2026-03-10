import type { NoseConeSpec, ValidationError } from '../models/types';

export function validateSpec(spec: NoseConeSpec): ValidationError[] {
  const errors: ValidationError[] = [];
  const positiveChecks: Array<[string, number]> = [
    ['baseDiameterMm', spec.baseDiameterMm],
    ['lengthMm', spec.lengthMm],
    ['sampleCount', spec.sampleCount],
    ['segmentCount', spec.segmentCount],
    ['ribCount', spec.ribCount],
    ['materialThicknessMm', spec.materialThicknessMm],
    ['pageMarginMm', spec.pageMarginMm]
  ];

  positiveChecks.forEach(([field, value]) => {
    if (!(value > 0)) {
      errors.push({
        field,
        message: `${field} 必須大於 0。`,
        severity: 'error'
      });
    }
  });

  if (spec.componentKind === 'transition') {
    if (!(spec.transitionEndDiameterMm && spec.transitionEndDiameterMm > 0)) {
      errors.push({
        field: 'transitionEndDiameterMm',
        message: '轉接段必須提供尾端直徑。',
        severity: 'error'
      });
    }
  }

  if (spec.shoulder) {
    const shoulder = spec.shoulder;
    if (shoulder.lengthMm <= 0 || shoulder.outerDiameterMm <= 0) {
      errors.push({
        field: 'shoulder',
        message: '肩部長度與外徑必須大於 0。',
        severity: 'error'
      });
    }
    if (shoulder.wallThicknessMm && shoulder.innerDiameterMm) {
      errors.push({
        field: 'shoulder',
        message: '肩部內徑與壁厚請擇一輸入。',
        severity: 'error'
      });
    }
    if (!shoulder.wallThicknessMm && !shoulder.innerDiameterMm) {
      errors.push({
        field: 'shoulder',
        message: '肩部需要壁厚或內徑資訊。',
        severity: 'error'
      });
    }
  }

  if (spec.glueStyle === 'overlap_tab') {
    errors.push({
      field: 'glueStyle',
      message: '重疊黏貼片僅為選配模式；教室預設建議使用對接加背條。',
      severity: 'warning'
    });
  }

  return errors;
}
