import type { ChangeEvent } from 'react';
import type { NoseConeSpec, NoseShapeType } from '../models/types';
import { getShapeOptions, getUiText, type UiLanguage } from '../app/i18n';

interface SpecFormProps {
  spec: NoseConeSpec;
  onChange: (next: NoseConeSpec) => void;
  language: UiLanguage;
}

function numberValue(event: ChangeEvent<HTMLInputElement>): number {
  return Number(event.target.value);
}

export function SpecForm({ spec, onChange, language }: SpecFormProps): JSX.Element {
  const text = getUiText(language);
  const shapes = getShapeOptions(language);
  const update = <K extends keyof NoseConeSpec>(key: K, value: NoseConeSpec[K]) => {
    onChange({ ...spec, [key]: value });
  };

  const hints: Record<string, string> =
    language === 'en'
      ? {
          title: 'Project title shown in preview and exports.',
          shape: 'Nose profile family used for station sampling.',
          baseDiameter: 'Outer base diameter of the nose cone (mm).',
          length: 'Tip-to-base axial length (mm).',
          tipRadius: 'Tip blunt radius. Use 0 for a sharp tip.',
          segmentCount: 'Number of shroud bands after segmentation.',
          sampleCount: 'Profile sample stations before segmentation.',
          supportDiscCount: 'Number of intermediate support disc stations.',
          materialThickness: 'Cardstock/board thickness used for slots (mm).',
          tolerance: 'Total clearance used by distributed slot compensation (mm).',
          backingStripWidth: 'Width of seam backing strips (mm).',
          pageMargin: 'Page margin kept clear for printing (mm).',
          paperSize: 'Page size for layout and export.',
          seamStyle: 'Default recommended: butt joint + separate backing strip.',
          shoulderLength: 'Coupler sleeve length (mm).',
          shoulderOuterDiameter: 'Shoulder outer diameter (mm).',
          shoulderWallThickness: 'Shoulder wall thickness (mm).',
          shoulderDiscOffset: 'Distance from sleeve end to shoulder seating disc (mm).'
        }
      : {
          title: '\u986f\u793a\u5728\u9810\u89bd\u8207\u532f\u51fa\u7684\u5c08\u6848\u540d\u7a31\u3002',
          shape: '\u7528\u4f86\u53d6\u6a23\u8f2a\u5ed3\u7684\u9f3b\u9310\u5f62\u72c0\u3002',
          baseDiameter: '\u9f3b\u9310\u57fa\u90e8\u5916\u5f91\uff08mm\uff09\u3002',
          length: '\u5f9e\u5c16\u7aef\u5230\u57fa\u90e8\u7684\u8ef8\u5411\u9577\u5ea6\uff08mm\uff09\u3002',
          tipRadius: '\u5c16\u7aef\u5713\u89d2\u534a\u5f91\uff0c0 \u8868\u793a\u92f8\u5c16\u3002',
          segmentCount: '\u5206\u6bb5\u5f8c\u7684\u5916\u6bbc\u7247\u6bb5\u6578\u3002',
          sampleCount: '\u5206\u6bb5\u524d\u8f2a\u5ed3\u53d6\u6a23\u9ede\u6578\u3002',
          supportDiscCount: '\u4e2d\u9593\u652f\u6490\u5713\u7247\u7ad9\u4f4d\u6578\u3002',
          materialThickness: '\u5361\u7d19\u6216\u677f\u6750\u539a\u5ea6\uff08mm\uff09\u3002',
          tolerance: '\u63d2\u69fd\u7684\u7e3d\u9593\u9699\u516c\u5dee\uff08mm\uff09\uff0c\u7531\u96d9\u5074\u5206\u914d\u3002',
          backingStripWidth: '\u63a5\u7e2b\u80cc\u689d\u5bec\u5ea6\uff08mm\uff09\u3002',
          pageMargin: '\u5217\u5370\u7559\u767d\u908a\u754c\uff08mm\uff09\u3002',
          paperSize: '\u7248\u9762\u6392\u7248\u8207\u532f\u51fa\u7d19\u5f35\u5c3a\u5bf8\u3002',
          seamStyle: '\u5efa\u8b70\u9810\u8a2d\uff1a\u5c0d\u63a5\u52a0\u7368\u7acb\u80cc\u689d\u3002',
          shoulderLength: '\u80a9\u90e8\u5957\u7ba1\u9577\u5ea6\uff08mm\uff09\u3002',
          shoulderOuterDiameter: '\u80a9\u90e8\u5916\u5f91\uff08mm\uff09\u3002',
          shoulderWallThickness: '\u80a9\u90e8\u5957\u7ba1\u58c1\u539a\uff08mm\uff09\u3002',
          shoulderDiscOffset: '\u5f9e\u5957\u7ba1\u5c3e\u7aef\u5230\u5b9a\u4f4d\u5713\u7247\u7684\u8ddd\u96e2\uff08mm\uff09\u3002'
        };

  const withHint = (label: string, hint: string) => (
    <span className="label-line">
      <span>{label}</span>
      <span className="help-hint" title={hint} aria-label={hint}>
        ?
      </span>
    </span>
  );

  return (
    <div className="panel-stack">
      <section className="panel-card">
        <h2>{text.manualSection}</h2>
        <label>
          {withHint(text.name, hints.title)}
          <input value={spec.title} onChange={(event) => update('title', event.target.value)} />
        </label>
        <label>
          {withHint(text.shape, hints.shape)}
          <select value={spec.shapeType} onChange={(event) => update('shapeType', event.target.value as NoseShapeType)}>
            {shapes.map((shape) => (
              <option key={shape.value} value={shape.value}>
                {shape.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid-two">
          <label>
            {withHint(text.baseDiameter, hints.baseDiameter)}
            <input type="number" value={spec.baseDiameterMm} onChange={(event) => update('baseDiameterMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.length, hints.length)}
            <input type="number" value={spec.lengthMm} onChange={(event) => update('lengthMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.tipRadius, hints.tipRadius)}
            <input type="number" value={spec.tipRadiusMm} onChange={(event) => update('tipRadiusMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.segmentCount, hints.segmentCount)}
            <input type="number" value={spec.segmentCount} onChange={(event) => update('segmentCount', numberValue(event))} />
          </label>
          <label>
            {withHint(text.sampleCount, hints.sampleCount)}
            <input type="number" value={spec.sampleCount} onChange={(event) => update('sampleCount', numberValue(event))} />
          </label>
          <label>
            {withHint(text.supportDiscCount, hints.supportDiscCount)}
            <input type="number" value={spec.intermediateDiscCount} onChange={(event) => update('intermediateDiscCount', numberValue(event))} />
          </label>
          <label>
            {withHint(text.materialThickness, hints.materialThickness)}
            <input type="number" value={spec.materialThicknessMm} onChange={(event) => update('materialThicknessMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.tolerance, hints.tolerance)}
            <input type="number" value={spec.toleranceMm} onChange={(event) => update('toleranceMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.backingStripWidth, hints.backingStripWidth)}
            <input type="number" value={spec.backingStripWidthMm} onChange={(event) => update('backingStripWidthMm', numberValue(event))} />
          </label>
          <label>
            {withHint(text.pageMargin, hints.pageMargin)}
            <input type="number" value={spec.pageMarginMm} onChange={(event) => update('pageMarginMm', numberValue(event))} />
          </label>
        </div>
        <div className="grid-two">
          <label>
            {withHint(text.paperSize, hints.paperSize)}
            <select value={spec.pageSize} onChange={(event) => update('pageSize', event.target.value as NoseConeSpec['pageSize'])}>
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </label>
          <label>
            {withHint(text.seamStyle, hints.seamStyle)}
            <select value={spec.glueStyle} onChange={(event) => update('glueStyle', event.target.value as NoseConeSpec['glueStyle'])}>
              <option value="butt_with_backing_strip">{language === 'en' ? 'Butt joint + backing strip' : '\u5c0d\u63a5 + \u80cc\u689d'}</option>
              <option value="overlap_tab">{language === 'en' ? 'Overlap tab' : '\u91cd\u758a\u8cbc\u7247'}</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel-card">
        <h2>{text.shoulderSection}</h2>
        <div className="grid-two">
          <label>
            {withHint(text.shoulderLength, hints.shoulderLength)}
            <input
              type="number"
              value={spec.shoulder?.lengthMm ?? 0}
              onChange={(event) =>
                onChange({
                  ...spec,
                  shoulder: {
                    ...spec.shoulder,
                    lengthMm: numberValue(event),
                    outerDiameterMm: spec.shoulder?.outerDiameterMm ?? spec.baseDiameterMm - 1.5,
                    wallThicknessMm: spec.shoulder?.wallThicknessMm ?? 0.8,
                    discOffsetMm: spec.shoulder?.discOffsetMm ?? 8
                  }
                })
              }
            />
          </label>
          <label>
            {withHint(text.shoulderOuterDiameter, hints.shoulderOuterDiameter)}
            <input
              type="number"
              value={spec.shoulder?.outerDiameterMm ?? 0}
              onChange={(event) =>
                onChange({
                  ...spec,
                  shoulder: {
                    ...spec.shoulder,
                    lengthMm: spec.shoulder?.lengthMm ?? 30,
                    outerDiameterMm: numberValue(event),
                    wallThicknessMm: spec.shoulder?.wallThicknessMm ?? 0.8,
                    discOffsetMm: spec.shoulder?.discOffsetMm ?? 8
                  }
                })
              }
            />
          </label>
          <label>
            {withHint(text.shoulderWallThickness, hints.shoulderWallThickness)}
            <input
              type="number"
              value={spec.shoulder?.wallThicknessMm ?? 0}
              onChange={(event) =>
                onChange({
                  ...spec,
                  shoulder: {
                    ...spec.shoulder,
                    lengthMm: spec.shoulder?.lengthMm ?? 30,
                    outerDiameterMm: spec.shoulder?.outerDiameterMm ?? spec.baseDiameterMm - 1.5,
                    wallThicknessMm: numberValue(event),
                    discOffsetMm: spec.shoulder?.discOffsetMm ?? 8
                  }
                })
              }
            />
          </label>
          <label>
            {withHint(text.shoulderDiscOffset, hints.shoulderDiscOffset)}
            <input
              type="number"
              value={spec.shoulder?.discOffsetMm ?? 0}
              onChange={(event) =>
                onChange({
                  ...spec,
                  shoulder: {
                    ...spec.shoulder,
                    lengthMm: spec.shoulder?.lengthMm ?? 30,
                    outerDiameterMm: spec.shoulder?.outerDiameterMm ?? spec.baseDiameterMm - 1.5,
                    wallThicknessMm: spec.shoulder?.wallThicknessMm ?? 0.8,
                    discOffsetMm: numberValue(event)
                  }
                })
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}