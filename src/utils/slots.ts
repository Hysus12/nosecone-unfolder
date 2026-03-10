export interface SlotWidthRequest {
  materialThicknessMm: number;
  totalToleranceMm: number;
  contributingSlotCount: 1 | 2;
}

export function distributedSlotWidth(request: SlotWidthRequest): number {
  const contribution = request.totalToleranceMm / request.contributingSlotCount;
  return request.materialThicknessMm + contribution;
}
