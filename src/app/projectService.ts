import type { ExportBundle, NoseConeSpec, TemplateProject } from '../models/types';
import { buildTemplatePieces } from '../geometry/templates';
import { layoutPages } from '../layout/pages';
import { buildExportBundle } from '../export';
import type { UiLanguage } from './i18n';

export function generateTemplateProject(inputSpec: NoseConeSpec): TemplateProject {
  const project = buildTemplatePieces(inputSpec);
  const pages = layoutPages(project.pieces, {
    size: inputSpec.pageSize,
    marginMm: inputSpec.pageMarginMm
  });
  return {
    ...project,
    pages
  };
}

export async function generateExportBundle(project: TemplateProject, language: UiLanguage): Promise<ExportBundle> {
  return buildExportBundle(project.pages, project.pieces, {
    title: project.spec.title,
    units: project.spec.units,
    warnings: project.warnings,
    language
  });
}
