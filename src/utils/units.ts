import type { PaperSize, UnitSystem } from '../models/types';

export const MM_PER_INCH = 25.4;

export function toMillimeters(value: number, unit: UnitSystem): number {
  return unit === 'mm' ? value : value * MM_PER_INCH;
}

export function fromMillimeters(value: number, unit: UnitSystem): number {
  return unit === 'mm' ? value : value / MM_PER_INCH;
}

export function roundForDisplay(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function paperDimensionsMm(size: PaperSize): { width: number; height: number } {
  if (size === 'Letter') {
    return { width: 215.9, height: 279.4 };
  }
  return { width: 210, height: 297 };
}
