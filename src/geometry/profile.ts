import type { NoseConeSpec, SampledProfilePoint } from '../models/types';
import { clamp, EPSILON, lerp } from '../utils/math';

function tangentOgiveRadiusAt(xMm: number, lengthMm: number, baseRadiusMm: number): number {
  const rho = (baseRadiusMm * baseRadiusMm + lengthMm * lengthMm) / (2 * baseRadiusMm);
  const inside = Math.max(0, rho * rho - (lengthMm - xMm) * (lengthMm - xMm));
  return Math.sqrt(inside) + baseRadiusMm - rho;
}

function secantOgiveRadiusAt(
  xMm: number,
  lengthMm: number,
  baseRadiusMm: number,
  factor: number
): number {
  const tangentRho = (baseRadiusMm * baseRadiusMm + lengthMm * lengthMm) / (2 * baseRadiusMm);
  const rho = Math.max(tangentRho * factor, tangentRho + EPSILON);
  const inside = Math.max(0, rho * rho - (lengthMm - xMm) * (lengthMm - xMm));
  return Math.sqrt(inside) + baseRadiusMm - rho;
}

function ellipticalRadiusAt(xMm: number, lengthMm: number, baseRadiusMm: number): number {
  const normalized = (xMm - lengthMm) / lengthMm;
  return baseRadiusMm * Math.sqrt(Math.max(0, 1 - normalized * normalized));
}

function parabolicRadiusAt(xMm: number, lengthMm: number, baseRadiusMm: number, k: number): number {
  const t = clamp(xMm / lengthMm, 0, 1);
  const numerator = 2 * t - k * t * t;
  const denominator = Math.max(EPSILON, 2 - k);
  return baseRadiusMm * Math.max(0, numerator / denominator);
}

function powerRadiusAt(xMm: number, lengthMm: number, baseRadiusMm: number, exponent: number): number {
  const t = clamp(xMm / lengthMm, 0, 1);
  return baseRadiusMm * Math.pow(t, exponent);
}

function resampleGenericProfile(spec: NoseConeSpec, nSamples: number): SampledProfilePoint[] {
  const source = (spec.sampledProfile ?? [])
    .map((point) => ({ x: point.x, radius: Math.max(0, point.radius) }))
    .sort((left, right) => left.x - right.x);

  if (source.length < 2) {
    return [];
  }

  const minX = source[0].x;
  const maxX = source[source.length - 1].x;
  const span = Math.max(EPSILON, maxX - minX);
  const normalized = source.map((point) => ({
    x: ((point.x - minX) / span) * spec.lengthMm,
    radius: point.radius
  }));

  return Array.from({ length: nSamples }, (_, index) => {
    const t = index / Math.max(1, nSamples - 1);
    const targetX = spec.lengthMm * t;
    const upperIndex = normalized.findIndex((point) => point.x >= targetX);
    if (upperIndex <= 0) {
      return { index, xMm: targetX, radiusMm: normalized[0].radius };
    }
    const lower = normalized[upperIndex - 1];
    const upper = normalized[upperIndex];
    const localT = (targetX - lower.x) / Math.max(EPSILON, upper.x - lower.x);
    return {
      index,
      xMm: targetX,
      radiusMm: lerp(lower.radius, upper.radius, localT)
    };
  });
}

export function sampleProfile(spec: NoseConeSpec, nSamples = spec.sampleCount): SampledProfilePoint[] {
  if (spec.shapeType === 'sampled_profile') {
    return resampleGenericProfile(spec, nSamples);
  }

  const startRadius = spec.componentKind === 'transition' ? spec.baseDiameterMm / 2 : spec.tipRadiusMm;
  const endRadius =
    spec.componentKind === 'transition'
      ? (spec.transitionEndDiameterMm ?? spec.baseDiameterMm) / 2
      : spec.baseDiameterMm / 2;

  return Array.from({ length: nSamples }, (_, index) => {
    const t = index / Math.max(1, nSamples - 1);
    const xMm = spec.lengthMm * t;
    let radiusMm = endRadius;

    switch (spec.shapeType) {
      case 'conical':
        radiusMm = lerp(startRadius, endRadius, t);
        break;
      case 'tangent_ogive':
        radiusMm = spec.componentKind === 'transition'
          ? lerp(startRadius, endRadius, t)
          : tangentOgiveRadiusAt(xMm, spec.lengthMm, endRadius);
        break;
      case 'secant_ogive':
        radiusMm = spec.componentKind === 'transition'
          ? lerp(startRadius, endRadius, t)
          : secantOgiveRadiusAt(xMm, spec.lengthMm, endRadius, spec.secantFactor ?? 1.15);
        break;
      case 'elliptical':
        radiusMm = spec.componentKind === 'transition'
          ? lerp(startRadius, endRadius, t)
          : ellipticalRadiusAt(xMm, spec.lengthMm, endRadius);
        break;
      case 'parabolic':
        radiusMm = spec.componentKind === 'transition'
          ? lerp(startRadius, endRadius, t)
          : parabolicRadiusAt(xMm, spec.lengthMm, endRadius, spec.parabolicK ?? 0.75);
        break;
      case 'power_series':
        radiusMm = spec.componentKind === 'transition'
          ? lerp(startRadius, endRadius, t)
          : powerRadiusAt(xMm, spec.lengthMm, endRadius, spec.powerExponent ?? 0.6);
        break;
      default:
        radiusMm = lerp(startRadius, endRadius, t);
        break;
    }

    if (spec.componentKind !== 'transition' && index === 0) {
      radiusMm = startRadius;
    }
    if (index === nSamples - 1) {
      radiusMm = endRadius;
    }

    return {
      index,
      xMm,
      radiusMm: Math.max(0, radiusMm)
    };
  });
}
