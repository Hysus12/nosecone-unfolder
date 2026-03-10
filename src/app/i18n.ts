import type { NoseShapeType, TemplatePiece } from '../models/types';

export type UiLanguage = 'zh-Hant' | 'en';

export interface UiText {
  eyebrow: string;
  heroTitle: string;
  heroCopy: string;
  printWarning: string;
  languageLabel: string;
  chinese: string;
  english: string;
  examplesTitle: string;
  reset: string;
  currentProject: string;
  summary: string;
  exportSvg: string;
  exportPdf: string;
  exportZip: string;
  manualSection: string;
  name: string;
  shape: string;
  baseDiameter: string;
  length: string;
  tipRadius: string;
  segmentCount: string;
  sampleCount: string;
  supportDiscCount: string;
  materialThickness: string;
  tolerance: string;
  backingStripWidth: string;
  pageMargin: string;
  paperSize: string;
  seamStyle: string;
  shoulderSection: string;
  shoulderLength: string;
  shoulderOuterDiameter: string;
  shoulderWallThickness: string;
  shoulderDiscOffset: string;
  orkImport: string;
  orkHint: string;
  orkProject: string;
  applyCandidate: string;
  profilePreview: string;
  noProfile: string;
  validationTitle: string;
  pagePreview: string;
  noLayout: string;
  pageOption: string;
  pieceList: string;
  printWarningInline: string;
  exampleLabels: string[];
}

const TEXT: Record<UiLanguage, UiText> = {
  'zh-Hant': {
    eyebrow: 'Newsletter410 PDF 方法',
    heroTitle: 'OpenRocket Nosecone Unfolder Offline',
    heroCopy: '以分段展開、分段肋片、分片支撐片與獨立背條為核心的離線模板工具。',
    printWarning: '列印警告：請以 100% 比例列印，切割前先確認 20 mm 校正方塊。',
    languageLabel: '介面語言',
    chinese: '中文',
    english: 'English',
    examplesTitle: '範例',
    reset: '重設',
    currentProject: '目前專案',
    summary: '摘要',
    exportSvg: '匯出 SVG',
    exportPdf: '匯出 PDF',
    exportZip: '匯出 ZIP',
    manualSection: '手動參數',
    name: '名稱',
    shape: '形狀',
    baseDiameter: '底部直徑',
    length: '長度',
    tipRadius: 'tip 半徑',
    segmentCount: '分段數',
    sampleCount: '取樣數',
    supportDiscCount: '中間支撐片數',
    materialThickness: '支撐材料厚度',
    tolerance: '公差',
    backingStripWidth: '背條寬度',
    pageMargin: '頁邊距',
    paperSize: '輸出紙張（預設 A4）',
    seamStyle: '接縫',
    shoulderSection: '肩部 / 套管',
    shoulderLength: '肩部長度',
    shoulderOuterDiameter: '肩部外徑',
    shoulderWallThickness: '壁厚',
    shoulderDiscOffset: '圓片偏移',
    orkImport: 'OpenRocket ORK 匯入',
    orkHint: '完全在瀏覽器中解析，不需要後端。',
    orkProject: '專案',
    applyCandidate: '套用',
    profilePreview: '輪廓預覽',
    noProfile: '尚無輪廓資料',
    validationTitle: '檢查訊息',
    pagePreview: '列印版面預覽',
    noLayout: '尚無版面',
    pageOption: '第 {page} 頁',
    pieceList: '零件清單',
    printWarningInline: '列印時務必使用 100% 比例，切割前先量測 20 mm 校正方塊。',
    exampleLabels: ['教室分段鼻錐', '分段橢圓鼻錐', 'PDF 金樣分段參考', '轉接段範例']
  },
  en: {
    eyebrow: 'Newsletter410 PDF Method',
    heroTitle: 'OpenRocket Nosecone Unfolder Offline',
    heroCopy: 'Offline template builder based on segmented shrouds, polygonal ribs, sectioned support discs, and separate backing strips.',
    printWarning: 'Print warning: print at 100% scale and verify the 20 mm calibration square before cutting.',
    languageLabel: 'Language',
    chinese: 'Chinese',
    english: 'English',
    examplesTitle: 'Examples',
    reset: 'Reset',
    currentProject: 'Current Project',
    summary: 'Summary',
    exportSvg: 'Export SVG',
    exportPdf: 'Export PDF',
    exportZip: 'Export ZIP',
    manualSection: 'Manual Parameters',
    name: 'Title',
    shape: 'Shape',
    baseDiameter: 'Base diameter',
    length: 'Length',
    tipRadius: 'Tip radius',
    segmentCount: 'Segment count',
    sampleCount: 'Sample count',
    supportDiscCount: 'Intermediate disc count',
    materialThickness: 'Material thickness',
    tolerance: 'Tolerance',
    backingStripWidth: 'Backing strip width',
    pageMargin: 'Page margin',
    paperSize: 'Paper size (default A4)',
    seamStyle: 'Seam style',
    shoulderSection: 'Shoulder / Coupler',
    shoulderLength: 'Shoulder length',
    shoulderOuterDiameter: 'Shoulder outer diameter',
    shoulderWallThickness: 'Wall thickness',
    shoulderDiscOffset: 'Disc offset',
    orkImport: 'OpenRocket ORK Import',
    orkHint: 'Parsed entirely in the browser. No backend required.',
    orkProject: 'Project',
    applyCandidate: 'Apply',
    profilePreview: 'Profile Preview',
    noProfile: 'No profile data yet',
    validationTitle: 'Checks',
    pagePreview: 'Printable Layout Preview',
    noLayout: 'No layout yet',
    pageOption: 'Page {page}',
    pieceList: 'Piece List',
    printWarningInline: 'Always print at 100% scale and measure the 20 mm calibration square before cutting.',
    exampleLabels: ['Classroom Nose Cone', 'Segmented Elliptical Nose Cone', 'PDF Golden Reference', 'Transition Example']
  }
};

const SHAPE_LABELS: Record<UiLanguage, Record<NoseShapeType, string>> = {
  'zh-Hant': {
    conical: '圓錐',
    tangent_ogive: '相切 ogive',
    secant_ogive: '割線 ogive',
    elliptical: '橢圓',
    parabolic: '拋物線',
    power_series: '冪次曲線',
    sampled_profile: '取樣輪廓'
  },
  en: {
    conical: 'Conical',
    tangent_ogive: 'Tangent ogive',
    secant_ogive: 'Secant ogive',
    elliptical: 'Elliptical',
    parabolic: 'Parabolic',
    power_series: 'Power series',
    sampled_profile: 'Sampled profile'
  }
};

export function getUiText(language: UiLanguage): UiText {
  return TEXT[language];
}

export function getShapeOptions(language: UiLanguage): Array<{ value: NoseShapeType; label: string }> {
  return (Object.keys(SHAPE_LABELS[language]) as NoseShapeType[]).map((value) => ({
    value,
    label: SHAPE_LABELS[language][value]
  }));
}

export function formatPageOption(language: UiLanguage, page: number): string {
  return getUiText(language).pageOption.replace('{page}', String(page));
}

export function pieceTitleForLanguage(piece: TemplatePiece, language: UiLanguage): string {
  if (language === 'zh-Hant') {
    return piece.title;
  }
  switch (piece.kind) {
    case 'shroud':
      return `Shroud segment ${piece.segmentIndex + 1}`;
    case 'backing_strip':
      return `Backing strip ${piece.segmentIndex + 1}`;
    case 'rib':
      return `Cross rib ${piece.ribIndex + 1}`;
    case 'disc_quadrant':
      return `Support disc ${piece.id.toUpperCase()}`;
    case 'disc_full':
      return 'Bottom disc';
    case 'shoulder_sleeve':
      return 'Shoulder sleeve';
    case 'shoulder_disc':
      return 'Shoulder disc';
    default:
      return 'Template piece';
  }
}

export function pieceNoteForLanguage(piece: TemplatePiece, language: UiLanguage): string {
  if (language === 'zh-Hant') {
    return piece.assembly.note;
  }
  switch (piece.kind) {
    case 'shroud':
      return `Assemble from tip to base, section ${piece.segmentIndex + 1}.`;
    case 'backing_strip':
      return 'Glue inside the matching shroud seam.';
    case 'rib':
      return 'Assemble the cross ribs before inserting support discs.';
    case 'disc_quadrant':
      return `Insert at support station ${piece.stationIndex}.`;
    case 'disc_full':
      return 'Close the base opening with the bottom disc.';
    case 'shoulder_sleeve':
      return 'Wrap and glue the shoulder coupler sleeve.';
    case 'shoulder_disc':
      return 'Seat this disc at the configured shoulder offset.';
    default:
      return 'Template piece';
  }
}

