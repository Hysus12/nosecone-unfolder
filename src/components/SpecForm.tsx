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

  return (
    <div className="panel-stack">
      <section className="panel-card">
        <h2>{text.manualSection}</h2>
        <label>
          {text.name}
          <input value={spec.title} onChange={(event) => update('title', event.target.value)} />
        </label>
        <label>
          {text.shape}
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
            {text.baseDiameter}
            <input type="number" value={spec.baseDiameterMm} onChange={(event) => update('baseDiameterMm', numberValue(event))} />
          </label>
          <label>
            {text.length}
            <input type="number" value={spec.lengthMm} onChange={(event) => update('lengthMm', numberValue(event))} />
          </label>
          <label>
            {text.tipRadius}
            <input type="number" value={spec.tipRadiusMm} onChange={(event) => update('tipRadiusMm', numberValue(event))} />
          </label>
          <label>
            {text.segmentCount}
            <input type="number" value={spec.segmentCount} onChange={(event) => update('segmentCount', numberValue(event))} />
          </label>
          <label>
            {text.sampleCount}
            <input type="number" value={spec.sampleCount} onChange={(event) => update('sampleCount', numberValue(event))} />
          </label>
          <label>
            {text.supportDiscCount}
            <input type="number" value={spec.intermediateDiscCount} onChange={(event) => update('intermediateDiscCount', numberValue(event))} />
          </label>
          <label>
            {text.materialThickness}
            <input type="number" value={spec.materialThicknessMm} onChange={(event) => update('materialThicknessMm', numberValue(event))} />
          </label>
          <label>
            {text.tolerance}
            <input type="number" value={spec.toleranceMm} onChange={(event) => update('toleranceMm', numberValue(event))} />
          </label>
          <label>
            {text.backingStripWidth}
            <input type="number" value={spec.backingStripWidthMm} onChange={(event) => update('backingStripWidthMm', numberValue(event))} />
          </label>
          <label>
            {text.pageMargin}
            <input type="number" value={spec.pageMarginMm} onChange={(event) => update('pageMarginMm', numberValue(event))} />
          </label>
        </div>
        <div className="grid-two">
          <label>
            {text.paperSize}
            <select value={spec.pageSize} onChange={(event) => update('pageSize', event.target.value as NoseConeSpec['pageSize'])}>
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </label>
          <label>
            {text.seamStyle}
            <select value={spec.glueStyle} onChange={(event) => update('glueStyle', event.target.value as NoseConeSpec['glueStyle'])}>
              <option value="butt_with_backing_strip">{language === 'en' ? 'Butt joint + backing strip' : '對接 + 背條'}</option>
              <option value="overlap_tab">{language === 'en' ? 'Overlap tab' : '重疊貼片'}</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel-card">
        <h2>{text.shoulderSection}</h2>
        <div className="grid-two">
          <label>
            {text.shoulderLength}
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
            {text.shoulderOuterDiameter}
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
            {text.shoulderWallThickness}
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
            {text.shoulderDiscOffset}
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
