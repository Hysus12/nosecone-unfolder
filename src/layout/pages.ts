import type { LayoutItem, LayoutPage, PageSpec, TemplatePiece } from '../models/types';
import { paperDimensionsMm } from '../utils/units';

function dimensionsForRotation(piece: TemplatePiece, rotationDeg: 0 | 90) {
  return rotationDeg === 0
    ? { width: piece.bounds.width, height: piece.bounds.height }
    : { width: piece.bounds.height, height: piece.bounds.width };
}

function bestRotation(piece: TemplatePiece, availableWidth: number, availableHeight: number): 0 | 90 {
  const zero = dimensionsForRotation(piece, 0);
  const quarter = dimensionsForRotation(piece, 90);
  const zeroFits = zero.width <= availableWidth && zero.height <= availableHeight;
  const quarterFits = quarter.width <= availableWidth && quarter.height <= availableHeight;

  if (zeroFits && !quarterFits) {
    return 0;
  }
  if (quarterFits && !zeroFits) {
    return 90;
  }
  if (quarterFits && quarter.height < zero.height) {
    return 90;
  }
  return 0;
}

export function layoutPages(pieces: TemplatePiece[], pageSpec: PageSpec): LayoutPage[] {
  const pageDimensions = paperDimensionsMm(pageSpec.size);
  const usableWidth = pageDimensions.width - 2 * pageSpec.marginMm;
  const usableHeight = pageDimensions.height - 2 * pageSpec.marginMm;
  const sortedPieces = [...pieces].sort((left, right) => right.bounds.height - left.bounds.height);

  const pages: LayoutPage[] = [];
  let currentItems: LayoutItem[] = [];
  let cursorX = pageSpec.marginMm;
  let cursorY = pageSpec.marginMm;
  let shelfHeight = 0;
  let pageIndex = 0;

  const flushPage = () => {
    pages.push({
      index: pageIndex,
      coordinateSystem: {
        pageWidthMm: pageDimensions.width,
        pageHeightMm: pageDimensions.height,
        marginMm: pageSpec.marginMm
      },
      items: currentItems
    });
    pageIndex += 1;
    currentItems = [];
    cursorX = pageSpec.marginMm;
    cursorY = pageSpec.marginMm;
    shelfHeight = 0;
  };

  sortedPieces.forEach((piece) => {
    const rotationDeg = bestRotation(piece, usableWidth, usableHeight);
    const size = dimensionsForRotation(piece, rotationDeg);

    if (cursorX + size.width > pageSpec.marginMm + usableWidth) {
      cursorX = pageSpec.marginMm;
      cursorY += shelfHeight + 5;
      shelfHeight = 0;
    }

    if (cursorY + size.height > pageSpec.marginMm + usableHeight) {
      flushPage();
    }

    currentItems.push({
      pieceId: piece.id,
      pageIndex,
      xMm: cursorX,
      yMm: cursorY,
      rotationDeg,
      widthMm: size.width,
      heightMm: size.height
    });

    cursorX += size.width + 5;
    shelfHeight = Math.max(shelfHeight, size.height);
  });

  if (currentItems.length > 0 || pages.length === 0) {
    flushPage();
  }

  return pages;
}
