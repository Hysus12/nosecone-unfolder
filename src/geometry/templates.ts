import type { BackingStripSpec, NoseConeSpec, ShroudPiece, TemplatePiece, TemplateProject } from '../models/types';
import { buildPieceBase } from './pieces';
import { sampleProfile } from './profile';
import { segmentProfile } from './segmentation';
import { unfoldSegment } from './unfold';
import { buildRibs } from './ribs';
import { buildDiscs } from './discs';
import { buildShoulder } from './shoulder';
import { validateSpec } from '../utils/validation';

function buildBackingStrip(segmentIndex: number, seamLengthMm: number, widthMm: number): BackingStripSpec {
  const stripLengthMm = Math.max(6, seamLengthMm - 1.5);
  const labelText = `BS-${segmentIndex + 1}`;
  const availableLengthMm = Math.max(2, stripLengthMm - 1.4);
  const estimatedCharWidthFactor = 0.62;
  const fontSizeMm = Math.min(
    2.6,
    Math.max(1.2, availableLengthMm / Math.max(1, labelText.length * estimatedCharWidthFactor))
  );
  const baselineY = Math.min(widthMm - 0.6, Math.max(1.1, fontSizeMm * 0.85));

  return buildPieceBase<BackingStripSpec>(
    {
      id: `backing-strip-${segmentIndex + 1}`,
      kind: 'backing_strip',
      title: `\u80cc\u689d ${segmentIndex + 1}`,
      segmentIndex,
      stripWidthMm: widthMm,
      stripLengthMm,
      assembly: {
        order: 40 + segmentIndex,
        segmentIndex,
        note: '\u80cc\u689d\u8cbc\u5728\u5c0d\u61c9\u63a5\u7e2b\u5167\u5074\u3002'
      }
    },
    {
      cutPaths: [
        {
          closed: true,
          points: [
            { x: 0, y: 0 },
            { x: stripLengthMm, y: 0 },
            { x: stripLengthMm, y: widthMm },
            { x: 0, y: widthMm }
          ]
        }
      ],
      labels: [
        {
          text: labelText,
          position: { x: 0.7, y: baselineY },
          fontSizeMm
        }
      ]
    }
  );
}

export function buildTemplatePieces(spec: NoseConeSpec): TemplateProject {
  const errors = validateSpec(spec);
  const profile = sampleProfile(spec, spec.sampleCount);
  const segments = segmentProfile(profile, spec.segmentCount, 'equal_x');
  const warnings = ['\u5217\u5370\u6642\u8acb\u4f7f\u7528 100% \u6bd4\u4f8b\uff0c\u5148\u78ba\u8a8d 20 mm \u6821\u6b63\u65b9\u584a\u3002'];
  const shrouds: ShroudPiece[] = [];
  const pieces: TemplatePiece[] = [];

  segments.forEach((segment, index) => {
    const unfolded = unfoldSegment(segment, spec.glueStyle, { isTopSegment: index === 0 });
    const shroudPiece = buildPieceBase<ShroudPiece>(
      {
        id: `shroud-${index + 1}`,
        kind: 'shroud',
        title: `\u5916\u6bbc\u7247\u6bb5 ${index + 1}`,
        segmentIndex: index,
        sweepAngleRad: unfolded.sweepAngleRad,
        innerDevelopedRadiusMm: unfolded.innerDevelopedRadiusMm,
        outerDevelopedRadiusMm: unfolded.outerDevelopedRadiusMm,
        seamStyle: spec.glueStyle,
        tipTrimGuideMm: unfolded.tipTrimGuideMm,
        assembly: {
          order: index + 1,
          segmentIndex: index,
          note: `\u7531\u5c16\u7aef\u5f80\u57fa\u90e8\u7d44\u88dd\uff0c\u7b2c ${index + 1} \u6bb5\u3002`
        }
      },
      {
        cutPaths: unfolded.cutPaths,
        guidePaths: unfolded.guidePaths,
        labels: [
          {
            text: `S${index + 1}`,
            position: {
              x: unfolded.bounds.minX + unfolded.bounds.width * 0.5,
              y: unfolded.bounds.minY + unfolded.bounds.height * 0.5
            }
          }
        ],
        notes: index === 0 ? ['\u5c16\u7aef\u5340\u6bb5\u542b\u4fee\u526a\u5c0e\u7dda\u3002'] : []
      }
    );

    shrouds.push(shroudPiece);
    pieces.push(shroudPiece);

    if (unfolded.usesBackingStrip) {
      pieces.push(buildBackingStrip(index, unfolded.seamLengthMm, spec.backingStripWidthMm));
    }
  });

  const ribs = buildRibs(profile, segments, spec);
  const discs = buildDiscs(profile, segments, spec);
  const shoulder = spec.componentKind === 'nose_cone' ? buildShoulder(spec) : [];
  pieces.push(...ribs, ...discs, ...shoulder);

  return {
    spec,
    profile,
    segments,
    pieces,
    pages: [],
    warnings,
    errors
  };
}