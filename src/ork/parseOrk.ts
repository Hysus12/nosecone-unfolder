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
    if (lower.includes('nosecone') || lower === 'nosecone') {
      asArray(value).forEach((item, index) => matches.push({ kind: 'nose_cone', node: item, path: `${nextPath}[${index}]` }));
    }
    if (lower.includes('transition') || lower === 'transition') {
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
    if (typeof raw === 'object' && raw && '#text' in raw) {
      return String((raw as any)['#text']);
    }
  }
  return undefined;
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

function candidateFromNode(
  kind: 'nose_cone' | 'transition',
  node: any,
  path: string,
  index: number
): ORKComponentCandidate {
  const length = numericValue(node, ['length', 'shapeparameter', 'len']) ?? DEFAULT_SPEC.lengthMm;
  const baseRadius = numericValue(node, ['aftRadius', 'radius']);
  const baseDiameter = numericValue(node, ['baseDiameter', 'baseDiameterMm']) ?? (baseRadius !== undefined ? baseRadius * 2 : DEFAULT_SPEC.baseDiameterMm);
  const foreRadius = numericValue(node, ['foreRadius']) ?? numericValue(node, ['tipRadius']);
  const foreDiameter = foreRadius !== undefined ? foreRadius * 2 : DEFAULT_SPEC.tipRadiusMm * 2;
  const thickness = numericValue(node, ['thickness']) ?? DEFAULT_SPEC.materialThicknessMm;
  const name = textValue(node, ['name']) ?? `${kind === 'nose_cone' ? 'Nose Cone' : 'Transition'} ${index + 1}`;
  const rawShape = textValue(node, ['shape', 'shapeType', 'type']);

  return {
    id: `${kind}-${index + 1}`,
    name,
    kind,
    summary: `${name} | ${length} mm | ${baseDiameter.toFixed(1)} mm`,
    spec: {
      ...DEFAULT_SPEC,
      title: name,
      componentKind: kind,
      shapeType: mapShape(kind, rawShape),
      baseDiameterMm: baseDiameter,
      lengthMm: length,
      tipRadiusMm: kind === 'transition' ? baseDiameter / 2 : Math.max(0.2, foreDiameter / 2),
      transitionEndDiameterMm: kind === 'transition' ? Math.max(1, foreDiameter) : undefined,
      materialThicknessMm: thickness,
      shoulder: kind === 'transition' ? undefined : DEFAULT_SPEC.shoulder
    }
  };
}

export async function parseOrk(arrayBuffer: ArrayBuffer, sourceFileName = 'import.ork'): Promise<ORKImportResult> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlEntry = zip.file(/\.xml$/i)[0] ?? zip.file(/rocket/i)[0] ?? zip.file(/\.ork$/i)[0];
  if (!xmlEntry) {
    return {
      projectName: sourceFileName,
      sourceFileName,
      candidates: [],
      warnings: [],
      errors: [{ field: 'ork', message: 'ORK 內找不到 XML 專案內容。', severity: 'error' }]
    };
  }

  const xmlText = await xmlEntry.async('text');
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const parsed = parser.parse(xmlText);
  const nodes = findComponentNodes(parsed);
  const candidates = nodes.map((entry, index) => candidateFromNode(entry.kind, entry.node, entry.path, index));

  return {
    projectName: textValue(parsed?.openrocket ?? parsed, ['name']) ?? sourceFileName,
    sourceFileName,
    candidates,
    warnings: candidates.length === 0 ? ['未找到可匯入的 nose cone 或 transition。'] : [],
    errors: candidates.length === 0 ? [{ field: 'ork', message: 'ORK 沒有可用的鼻錐或轉接段元件。', severity: 'error' }] : []
  };
}
