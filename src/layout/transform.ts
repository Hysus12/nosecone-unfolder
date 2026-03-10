import type { LayoutItem, Point2D, PolylinePath, TemplatePiece } from '../models/types';
import { boundsFromPaths, rotatePath, rotatePoint, translatePath, translatePoint } from '../utils/math';

export interface PlacedPieceGeometry {
  cutPaths: PolylinePath[];
  guidePaths: PolylinePath[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
}

function placementOffset(piece: TemplatePiece, item: LayoutItem): { dx: number; dy: number } {
  const rotatedCut = piece.cutPaths.map((path) => rotatePath(path, item.rotationDeg));
  const rotatedGuide = piece.guidePaths.map((path) => rotatePath(path, item.rotationDeg));
  const rotatedBounds = boundsFromPaths([...rotatedCut, ...rotatedGuide]);
  return {
    dx: item.xMm - rotatedBounds.minX,
    dy: item.yMm - rotatedBounds.minY
  };
}

function clampPointAxis(value: number, min: number, max: number): number {
  if (min > max) {
    return (min + max) * 0.5;
  }
  return Math.max(min, Math.min(max, value));
}

export function placePieceGeometry(piece: TemplatePiece, item: LayoutItem): PlacedPieceGeometry {
  const rotatedCut = piece.cutPaths.map((path) => rotatePath(path, item.rotationDeg));
  const rotatedGuide = piece.guidePaths.map((path) => rotatePath(path, item.rotationDeg));
  const { dx, dy } = placementOffset(piece, item);
  const cutPaths = rotatedCut.map((path) => translatePath(path, dx, dy));
  const guidePaths = rotatedGuide.map((path) => translatePath(path, dx, dy));
  return {
    cutPaths,
    guidePaths,
    bounds: boundsFromPaths([...cutPaths, ...guidePaths])
  };
}

export function placeLabelPoint(piece: TemplatePiece, item: LayoutItem, point: Point2D): Point2D {
  const { dx, dy } = placementOffset(piece, item);
  const placed = translatePoint(rotatePoint(point, item.rotationDeg), dx, dy);

  const rotatedCut = piece.cutPaths.map((path) => rotatePath(path, item.rotationDeg));
  const translatedCut = rotatedCut.map((path) => translatePath(path, dx, dy));
  const cutBounds = boundsFromPaths(translatedCut);
  const paddingMm = 0.6;
  const minX = cutBounds.width > paddingMm * 2 ? cutBounds.minX + paddingMm : cutBounds.minX;
  const maxX = cutBounds.width > paddingMm * 2 ? cutBounds.maxX - paddingMm : cutBounds.maxX;
  const minY = cutBounds.height > paddingMm * 2 ? cutBounds.minY + paddingMm : cutBounds.minY;
  const maxY = cutBounds.height > paddingMm * 2 ? cutBounds.maxY - paddingMm : cutBounds.maxY;

  return {
    x: clampPointAxis(placed.x, minX, maxX),
    y: clampPointAxis(placed.y, minY, maxY)
  };
}