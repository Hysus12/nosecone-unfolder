import type { PieceBounds, Point2D, PolylinePath } from '../models/types';

export const EPSILON = 1e-6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function nearlyEqual(a: number, b: number, epsilon = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function arcPoints(
  center: Point2D,
  radius: number,
  startRad: number,
  endRad: number,
  density = 48
): Point2D[] {
  const span = endRad - startRad;
  const steps = Math.max(8, Math.ceil((Math.abs(span) / (Math.PI / 12)) * (density / 24)));
  const points: Point2D[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const angle = startRad + span * t;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  return points;
}

export function boundsFromPaths(paths: PolylinePath[]): PieceBounds {
  const allPoints = paths.flatMap((path) => path.points);
  const minX = Math.min(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export function translatePoint(point: Point2D, dx: number, dy: number): Point2D {
  return { x: point.x + dx, y: point.y + dy };
}

export function translatePath(path: PolylinePath, dx: number, dy: number): PolylinePath {
  return {
    ...path,
    points: path.points.map((point) => translatePoint(point, dx, dy))
  };
}

export function rotatePoint(point: Point2D, rotationDeg: 0 | 90): Point2D {
  if (rotationDeg === 0) {
    return point;
  }
  return { x: -point.y, y: point.x };
}

export function rotatePath(path: PolylinePath, rotationDeg: 0 | 90): PolylinePath {
  return {
    ...path,
    points: path.points.map((point) => rotatePoint(point, rotationDeg))
  };
}

export function normalizePathOrigin(path: PolylinePath): PolylinePath {
  const bounds = boundsFromPaths([path]);
  return translatePath(path, -bounds.minX, -bounds.minY);
}

export function pathToSvgD(path: PolylinePath): string {
  if (path.points.length === 0) {
    return '';
  }
  const commands = path.points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`
  );
  if (path.closed) {
    commands.push('Z');
  }
  return commands.join(' ');
}
