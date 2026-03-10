export type UnitSystem = 'mm' | 'inch';

export type NoseShapeType =
  | 'conical'
  | 'tangent_ogive'
  | 'secant_ogive'
  | 'elliptical'
  | 'parabolic'
  | 'power_series'
  | 'sampled_profile';

export type GlueStyle = 'butt_with_backing_strip' | 'overlap_tab';
export type PaperSize = 'A4' | 'Letter';
export type SegmentationStrategy = 'equal_x';
export type SupportedComponentKind = 'nose_cone' | 'transition';
export type SlotCompensationPolicy = 'distributed_slot_clearance';
export type RibMode = 'cross_ribs';

export interface ShoulderSpec {
  lengthMm: number;
  outerDiameterMm: number;
  wallThicknessMm?: number;
  innerDiameterMm?: number;
  discOffsetMm: number;
}

export interface GenericSamplePointInput {
  x: number;
  radius: number;
}

export interface NoseConeSpec {
  title: string;
  componentKind: SupportedComponentKind;
  shapeType: NoseShapeType;
  baseDiameterMm: number;
  lengthMm: number;
  tipRadiusMm: number;
  shoulder?: ShoulderSpec;
  transitionEndDiameterMm?: number;
  powerExponent?: number;
  parabolicK?: number;
  secantFactor?: number;
  sampleCount: number;
  segmentCount: number;
  ribCount: number;
  intermediateDiscCount: number;
  materialThicknessMm: number;
  toleranceMm: number;
  slotPolicy: SlotCompensationPolicy;
  glueStyle: GlueStyle;
  seamAllowanceMm: number;
  backingStripWidthMm: number;
  pageSize: PaperSize;
  pageMarginMm: number;
  units: UnitSystem;
  ribMode: RibMode;
  sampledProfile?: GenericSamplePointInput[];
}

export interface SampledProfilePoint {
  index: number;
  xMm: number;
  radiusMm: number;
}

export interface SegmentSpec {
  index: number;
  x1Mm: number;
  r1Mm: number;
  x2Mm: number;
  r2Mm: number;
  axialLengthMm: number;
  slantLengthMm: number;
  lowerRadiusMm: number;
  upperRadiusMm: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface PolylinePath {
  points: Point2D[];
  closed: boolean;
}

export interface PieceBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface LabelAnchor {
  text: string;
  position: Point2D;
  rotationDeg?: number;
  fontSizeMm?: number;
}

export interface AlignmentMark {
  label: string;
  path: PolylinePath;
}

export interface AssemblyOrderTag {
  order: number;
  segmentIndex?: number;
  stationIndex?: number;
  note: string;
}

export interface TemplatePieceBase {
  id: string;
  kind:
    | 'shroud'
    | 'rib'
    | 'disc_quadrant'
    | 'disc_full'
    | 'backing_strip'
    | 'shoulder_sleeve'
    | 'shoulder_disc';
  title: string;
  bounds: PieceBounds;
  cutPaths: PolylinePath[];
  guidePaths: PolylinePath[];
  labels: LabelAnchor[];
  alignmentMarks: AlignmentMark[];
  assembly: AssemblyOrderTag;
  notes: string[];
}

export interface ShroudPiece extends TemplatePieceBase {
  kind: 'shroud';
  segmentIndex: number;
  sweepAngleRad: number;
  innerDevelopedRadiusMm: number;
  outerDevelopedRadiusMm: number;
  seamStyle: GlueStyle;
  tipTrimGuideMm?: number;
}

export interface RibSpec extends TemplatePieceBase {
  kind: 'rib';
  ribIndex: number;
  slotWidthMm: number;
  slotDepthMm: number;
  polygonStations: SampledProfilePoint[];
}

export interface DiscSpec extends TemplatePieceBase {
  kind: 'disc_quadrant' | 'disc_full' | 'shoulder_disc';
  stationIndex: number;
  outerDiameterMm: number;
  slotWidthMm?: number;
  reliefRadiusMm: number;
  sectionCount: number;
}

export interface BackingStripSpec extends TemplatePieceBase {
  kind: 'backing_strip';
  segmentIndex: number;
  stripWidthMm: number;
  stripLengthMm: number;
}

export interface ShoulderSleeveSpec extends TemplatePieceBase {
  kind: 'shoulder_sleeve';
  lengthMm: number;
  circumferenceMm: number;
}

export type TemplatePiece =
  | ShroudPiece
  | RibSpec
  | DiscSpec
  | BackingStripSpec
  | ShoulderSleeveSpec;

export interface LayoutItem {
  pieceId: string;
  pageIndex: number;
  xMm: number;
  yMm: number;
  rotationDeg: 0 | 90;
  widthMm: number;
  heightMm: number;
}

export interface PageCoordinateSystem {
  pageWidthMm: number;
  pageHeightMm: number;
  marginMm: number;
}

export interface LayoutPage {
  index: number;
  coordinateSystem: PageCoordinateSystem;
  items: LayoutItem[];
}

export interface TemplateProject {
  spec: NoseConeSpec;
  profile: SampledProfilePoint[];
  segments: SegmentSpec[];
  pieces: TemplatePiece[];
  pages: LayoutPage[];
  warnings: string[];
  errors: ValidationError[];
}

export interface ORKComponentCandidate {
  id: string;
  name: string;
  kind: SupportedComponentKind;
  summary: string;
  spec: Partial<NoseConeSpec>;
}

export interface ORKImportResult {
  projectName: string;
  sourceFileName: string;
  candidates: ORKComponentCandidate[];
  warnings: string[];
  errors: ValidationError[];
}

export interface RenderedPage {
  page: LayoutPage;
  svg: string;
}

export interface ExportBundle {
  svgPages: RenderedPage[];
  combinedSvg: string;
  pdfBytes: Uint8Array;
  zipBytes: Uint8Array;
  manifest: {
    title: string;
    generatedAtIso: string;
    warnings: string[];
    pages: number;
    pieceCount: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface PageSpec {
  size: PaperSize;
  marginMm: number;
}
