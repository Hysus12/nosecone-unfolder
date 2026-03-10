import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type { NoseConeSpec, ORKComponentCandidate, ORKImportResult } from '../models/types';
import { DEFAULT_SPEC } from '../app/defaults';

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function findComponentNodes(node: unknown, path = 'root'): Array<{ kind: 'nose_cone' | 'transition'; node: any; path: string }> {
  if (!node || typeof node !== 'object') {
    return [];
  }

  const entries = Object.entries(node as Record<string, unknown>);
  const matches: Array<{ kind: 'nose_cone' | 'transition'; node: any; path: string }> = [];

  entries.forEach(([key, value]) => {
    const lower = key.toLowerCase();
    const nextPath = `${path}.${key}`;
    if (lower === 'nosecone' || lower.includes('nosecone')) {
      asArray(value).forEach((item, index) => matches.push({ kind: 'nose_cone', node: item, path: `${nextPath}[${index}]` }));
    }
    if (lower === 'transition' || lower.includes('transition')) {
      asArray(value).forEach((item, index) => matches.push({ kind: 'transition', node: item, path: `${nextPath}[${index}]` }));
    }
    asArray(value).forEach((item, index) => {
      matches.push(...findComponentNodes(item, `${nextPath}[${index}]`));
    });
  });

  return matches;
}

function numericValue(node: any, keys: string[]): number | undefined {
  for (const key of keys) {
    const match = Object.entries(node ?? {}).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
    if (!match) {
      continue;
    }
    const raw = match[1];
    const text = typeof raw === 'object' && raw !== null && '#text' in raw ? (raw as any)['#text'] : raw;
    const parsed = Number(text);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function textValue(node: any, keys: string[]): string | undefined {
  for (const key of keys) {
    const match = Object.entries(node ?? {}).find(([candidate]) => candidate.toLowerCase() === key.toLowerCase());
    if (!match) {
      continue;
    }
    const raw = match[1];
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof raw === 'object' && raw !== null && '#text' in raw) {
      return String((raw as any)['#text']);
    }
  }
  return undefined;
}

function metersToMillimeters(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }
  return value * 1000;
}

function mapShape(kind: 'nose_cone' | 'transition', rawShape?: string): NoseConeSpec['shapeType'] {
  const normalized = (rawShape ?? '').toLowerCase();
  if (kind === 'transition') {
    return 'conical';
  }
  if (normalized.includes('secant')) {
    return 'secant_ogive';
  }
  if (normalized.includes('tangent') || normalized.includes('ogive')) {
    return 'tangent_ogive';
  }
  if (normalized.includes('ellipse')) {
    return 'elliptical';
  }
  if (normalized.includes('para')) {
    return 'parabolic';
  }
  if (normalized.includes('power')) {
    return 'power_series';
  }
  return 'conical';
}

function firstRocketName(parsed: any): string | undefined {
  const openrocket = parsed?.openrocket;
  const rocketNode = Array.isArray(openrocket?.rocket) ? openrocket.rocket[0] : openrocket?.rocket;
  return textValue(rocketNode, ['name']) ?? textValue(openrocket, ['name']) ?? textValue(parsed, ['name']);
}

function candidateFromNode(kind: 'nose_cone' | 'transition', node: any, index: number): ORKComponentCandidate {
  const lengthMm = metersToMillimeters(numericValue(node, ['length', 'len'])) ?? DEFAULT_SPEC.lengthMm;
  const aftRadiusMm = metersToMillimeters(numericValue(node, ['aftRadius', 'aftRadiusMm', 'radius']));
  const foreRadiusMm = metersToMillimeters(numericValue(node, ['foreRadius']));
  const tipRadiusMmRaw = metersToMillimeters(numericValue(node, ['tipRadius']));
  const thicknessMm = metersToMillimeters(numericValue(node, ['thickness'])) ?? DEFAULT_SPEC.materialThicknessMm;

  const baseDiameterMm = aftRadiusMm !== undefined ? aftRadiusMm * 2 : DEFAULT_SPEC.baseDiameterMm;
  const transitionEndDiameterMm = foreRadiusMm !== undefined ? foreRadiusMm * 2 : undefined;

  const shoulderRadiusMm = metersToMillimeters(numericValue(node, ['aftShoulderRadius']));
  const shoulderLengthMm = metersToMillimeters(numericValue(node, ['aftShoulderLength']));
  const shoulderThicknessMm = metersToMillimeters(numericValue(node, ['aftShoulderThickness'])) ?? thicknessMm;

  const shoulder =
    kind === 'nose_cone' && shoulderRadiusMm !== undefined && shoulderLengthMm !== undefined && shoulderLengthMm > 0
      ? {
          lengthMm: shoulderLengthMm,
          outerDiameterMm: shoulderRadiusMm * 2,
          wallThicknessMm: shoulderThicknessMm,
          discOffsetMm: Math.max(3, Math.min(12, shoulderLengthMm * 0.25))
        }
      : undefined;

  const name = textValue(node, ['name']) ?? `${kind === 'nose_cone' ? 'Nose Cone' : 'Transition'} ${index + 1}`;
  const rawShape = textValue(node, ['shape', 'shapeType', 'type']);

  return {
    id: `${kind}-${index + 1}`,
    name,
    kind,
    summary: `${name} | ${lengthMm.toFixed(1)} mm | ${baseDiameterMm.toFixed(1)} mm`,
    spec: {
      ...DEFAULT_SPEC,
      title: name,
      componentKind: kind,
      shapeType: mapShape(kind, rawShape),
      baseDiameterMm,
      lengthMm,
      tipRadiusMm: kind === 'transition' ? 0 : Math.max(0, tipRadiusMmRaw ?? 0),
      transitionEndDiameterMm: kind === 'transition' ? Math.max(1, transitionEndDiameterMm ?? baseDiameterMm * 0.7) : undefined,
      materialThicknessMm: thicknessMm,
      shoulder: kind === 'nose_cone' ? shoulder : undefined
    }
  };
}

export async function parseOrk(arrayBuffer: ArrayBuffer, sourceFileName = 'import.ork'): Promise<ORKImportResult> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlEntry = zip.file(/\.xml$/i)[0] ?? zip.file(/\.ork$/i)[0] ?? zip.file(/rocket/i)[0];

  if (!xmlEntry) {
    return {
      projectName: sourceFileName,
      sourceFileName,
      candidates: [],
      warnings: [],
      errors: [{ field: 'ork', message: 'No XML content found inside ORK.', severity: 'error' }]
    };
  }

  const xmlText = await xmlEntry.async('text');
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const parsed = parser.parse(xmlText);
  const nodes = findComponentNodes(parsed);
  const allCandidates = nodes.map((entry, index) => candidateFromNode(entry.kind, entry.node, index));
  const noseCandidates = allCandidates.filter((candidate) => candidate.kind === 'nose_cone');

  if (noseCandidates.length === 0) {
    return {
      projectName: firstRocketName(parsed) ?? sourceFileName,
      sourceFileName,
      candidates: [],
      warnings: ['Non-nose components are ignored.'],
      errors: [{ field: 'ork', message: 'No nose cone component found in ORK.', severity: 'error' }]
    };
  }

  return {
    projectName: firstRocketName(parsed) ?? sourceFileName,
    sourceFileName,
    candidates: noseCandidates,
    warnings: allCandidates.length > noseCandidates.length ? ['Transition components were ignored.'] : [],
    errors: []
  };
}