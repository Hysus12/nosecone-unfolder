import type { AlignmentMark, LabelAnchor, PolylinePath, TemplatePieceBase } from '../models/types';
import { boundsFromPaths, translatePath } from '../utils/math';

export interface PieceGeometry {
  cutPaths: PolylinePath[];
  guidePaths?: PolylinePath[];
  labels?: LabelAnchor[];
  alignmentMarks?: AlignmentMark[];
  notes?: string[];
}

export function normalizePieceGeometry(geometry: PieceGeometry): PieceGeometry & {
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const bounds = boundsFromPaths([...(geometry.cutPaths ?? []), ...(geometry.guidePaths ?? [])]);
  const cutPaths = geometry.cutPaths.map((path) => translatePath(path, -bounds.minX, -bounds.minY));
  const guidePaths = (geometry.guidePaths ?? []).map((path) => translatePath(path, -bounds.minX, -bounds.minY));
  const labels = (geometry.labels ?? []).map((label) => ({
    ...label,
    position: { x: label.position.x - bounds.minX, y: label.position.y - bounds.minY }
  }));
  const alignmentMarks = (geometry.alignmentMarks ?? []).map((mark) => ({
    ...mark,
    path: translatePath(mark.path, -bounds.minX, -bounds.minY)
  }));
  return {
    cutPaths,
    guidePaths,
    labels,
    alignmentMarks,
    notes: geometry.notes ?? [],
    bounds: boundsFromPaths([...cutPaths, ...guidePaths])
  };
}

export function buildPieceBase<T extends TemplatePieceBase>(
  piece: Omit<T, 'bounds' | 'cutPaths' | 'guidePaths' | 'labels' | 'alignmentMarks' | 'notes'>,
  geometry: PieceGeometry
): T {
  const normalized = normalizePieceGeometry(geometry);
  return {
    ...piece,
    bounds: normalized.bounds,
    cutPaths: normalized.cutPaths,
    guidePaths: normalized.guidePaths,
    labels: normalized.labels,
    alignmentMarks: normalized.alignmentMarks,
    notes: normalized.notes
  } as T;
}
