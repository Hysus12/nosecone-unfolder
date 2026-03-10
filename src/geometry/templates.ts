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
  const labelWidthEstimateMm = Math.max(8, `BS-${segmentIndex + 1}`.length * 1.8);
  return buildPieceBase<BackingStripSpec>(
    {
      id: `backing-strip-${segmentIndex + 1}`,
      kind: 'backing_strip',
      title: `背條 ${segmentIndex + 1}`,
      segmentIndex,
      stripWidthMm: widthMm,
      stripLengthMm,
      assembly: {
        order: 40 + segmentIndex,
        segmentIndex,
        note: '背條位於接縫內側。'
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
          text: `BS-${segmentIndex + 1}`,
          position: {
            x: Math.max(1.2, stripLengthMm * 0.5 - labelWidthEstimateMm * 0.5),
            y: Math.max(2.2, widthMm * 0.66)
          },
          fontSizeMm: Math.min(3, Math.max(2.2, widthMm * 0.38))
        }
      ]
    }
  );
}

export function buildTemplatePieces(spec: NoseConeSpec): TemplateProject {
  const errors = validateSpec(spec);
  const profile = sampleProfile(spec, spec.sampleCount);
  const segments = segmentProfile(profile, spec.segmentCount, 'equal_x');
  const warnings = ['列印時請使用 100% 比例，先確認 20 mm 校正方塊。'];
  const shrouds: ShroudPiece[] = [];
  const pieces: TemplatePiece[] = [];

  segments.forEach((segment, index) => {
    const unfolded = unfoldSegment(segment, spec.glueStyle, { isTopSegment: index === 0 });
    const shroudPiece = buildPieceBase<ShroudPiece>(
      {
        id: `shroud-${index + 1}`,
        kind: 'shroud',
        title: `外殼片段 ${index + 1}`,
        segmentIndex: index,
        sweepAngleRad: unfolded.sweepAngleRad,
        innerDevelopedRadiusMm: unfolded.innerDevelopedRadiusMm,
        outerDevelopedRadiusMm: unfolded.outerDevelopedRadiusMm,
        seamStyle: spec.glueStyle,
        tipTrimGuideMm: unfolded.tipTrimGuideMm,
        assembly: {
          order: index + 1,
          segmentIndex: index,
          note: `由尖端往基部組裝，第 ${index + 1} 段。`
        }
      },
      {
        cutPaths: unfolded.cutPaths,
        guidePaths: unfolded.guidePaths,
        labels: [
          {
            text: `S${index + 1}`,
            position: { x: unfolded.bounds.width * 0.3, y: unfolded.bounds.height * 0.35 }
          }
        ],
        notes: index === 0 ? ['頂端片包含額外修剪導引。'] : []
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
