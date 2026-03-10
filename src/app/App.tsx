import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SPEC } from './defaults';
import { generateExportBundle, generateTemplateProject } from './projectService';
import { MANUAL_EXAMPLES } from '../examples/manualExamples';
import { parseOrk } from '../ork';
import { renderSvgPages } from '../export';
import type { ExportBundle, NoseConeSpec, ORKImportResult, TemplateProject } from '../models/types';
import { SpecForm } from '../components/SpecForm';
import { OrkImportPanel } from '../components/OrkImportPanel';
import { ProfilePreview } from '../components/ProfilePreview';
import { PagePreview } from '../components/PagePreview';
import { PieceList } from '../components/PieceList';
import { ValidationPanel } from '../components/ValidationPanel';
import { getUiText, type UiLanguage } from './i18n';

function downloadBlob(fileName: string, bytes: BlobPart, mimeType: string): void {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function localizedExample(example: NoseConeSpec, index: number, language: UiLanguage): NoseConeSpec {
  const text = getUiText(language);
  return {
    ...example,
    title: text.exampleLabels[index] ?? example.title
  };
}

export function App(): JSX.Element {
  const [language, setLanguage] = useState<UiLanguage>('zh-Hant');
  const text = getUiText(language);
  const [spec, setSpec] = useState<NoseConeSpec>(localizedExample(DEFAULT_SPEC, 0, 'zh-Hant'));
  const [project, setProject] = useState<TemplateProject>(() => generateTemplateProject(localizedExample(DEFAULT_SPEC, 0, 'zh-Hant')));
  const [svgPages, setSvgPages] = useState(() =>
    renderSvgPages(project.pages, project.pieces, { title: project.spec.title, units: project.spec.units, language: 'zh-Hant' })
  );
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [orkResult, setOrkResult] = useState<ORKImportResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const nextProject = generateTemplateProject(spec);
    setProject(nextProject);
    setSvgPages(renderSvgPages(nextProject.pages, nextProject.pieces, { title: nextProject.spec.title, units: nextProject.spec.units, language }));
  }, [spec, language]);

  const summary = useMemo(() => {
    if (language === 'en') {
      return `${project.segments.length} shrouds | ${project.pieces.length} pieces | ${project.pages.length} pages`;
    }
    return `${project.segments.length} 段外殼 | ${project.pieces.length} 個零件 | ${project.pages.length} 頁`;
  }, [language, project]);

  const handleOrkImport = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const result = await parseOrk(buffer, file.name);
    setOrkResult(result);
  };

  const handleExport = async (kind: 'svg' | 'pdf' | 'zip') => {
    setBusy(true);
    try {
      const bundle: ExportBundle = await generateExportBundle(project, language);
      if (kind === 'svg') {
        downloadBlob(`${project.spec.title}.svg`, bundle.combinedSvg, 'image/svg+xml');
      }
      if (kind === 'pdf') {
        downloadBlob(`${project.spec.title}.pdf`, bundle.pdfBytes, 'application/pdf');
      }
      if (kind === 'zip') {
        downloadBlob(`${project.spec.title}.zip`, bundle.zipBytes, 'application/zip');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="hero-card">
          <div className="language-row">
            <div>
              <p className="eyebrow">{text.eyebrow}</p>
              <h1>{text.heroTitle}</h1>
            </div>
            <label className="language-switch">
              <span>{text.languageLabel}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as UiLanguage)}>
                <option value="zh-Hant">{text.chinese}</option>
                <option value="en">{text.english}</option>
              </select>
            </label>
          </div>
          <p className="hero-copy">{text.heroCopy}</p>
          <div className="warning-banner">{text.printWarning}</div>
        </header>

        <section className="panel-card">
          <h2>{text.examplesTitle}</h2>
          <div className="example-buttons">
            {MANUAL_EXAMPLES.map((example, index) => (
              <button key={`${index}-${example.title}`} type="button" className="secondary" onClick={() => setSpec(localizedExample(example, index, language))}>
                {text.exampleLabels[index] ?? example.title}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setSpec(localizedExample(DEFAULT_SPEC, 0, language))}>
            {text.reset}
          </button>
        </section>

        <SpecForm spec={spec} onChange={setSpec} language={language} />
        <OrkImportPanel language={language} orkResult={orkResult} onImport={handleOrkImport} onApplyCandidate={setSpec} />
      </aside>

      <section className="content">
        <section className="panel-card stats-card">
          <div>
            <h2>{text.currentProject}</h2>
            <p>{project.spec.title}</p>
          </div>
          <div>
            <h2>{text.summary}</h2>
            <p>{summary}</p>
          </div>
          <div className="export-group">
            <button type="button" onClick={() => handleExport('svg')} disabled={busy}>
              {text.exportSvg}
            </button>
            <button type="button" onClick={() => handleExport('pdf')} disabled={busy}>
              {text.exportPdf}
            </button>
            <button type="button" onClick={() => handleExport('zip')} disabled={busy}>
              {text.exportZip}
            </button>
          </div>
        </section>

        <div className="content-grid">
          <div className="content-column">
            <ProfilePreview profile={project.profile} language={language} />
            <ValidationPanel language={language} warnings={project.warnings} errors={project.errors} />
          </div>
          <div className="content-column wide">
            <PagePreview language={language} pages={svgPages} selectedPageIndex={selectedPageIndex} onSelectPage={setSelectedPageIndex} />
            <PieceList language={language} pieces={project.pieces} />
          </div>
        </div>
      </section>
    </main>
  );
}
