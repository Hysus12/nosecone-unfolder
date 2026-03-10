import type { ChangeEvent } from 'react';
import type { NoseConeSpec, ORKImportResult } from '../models/types';
import { getUiText, type UiLanguage } from '../app/i18n';

interface OrkImportPanelProps {
  orkResult: ORKImportResult | null;
  onImport: (file: File) => void;
  onApplyCandidate: (spec: NoseConeSpec) => void;
  language: UiLanguage;
}

export function OrkImportPanel({ orkResult, onImport, onApplyCandidate, language }: OrkImportPanelProps): JSX.Element {
  const text = getUiText(language);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <section className="panel-card">
      <h2>{text.orkImport}</h2>
      <input type="file" accept=".ork,.zip" onChange={handleFile} />
      <p className="muted">{text.orkHint}</p>
      {orkResult ? (
        <div className="candidate-list">
          <p>
            {text.orkProject}：{orkResult.projectName}
          </p>
          {orkResult.candidates.map((candidate) => (
            <button key={candidate.id} type="button" className="secondary" onClick={() => onApplyCandidate(candidate.spec as NoseConeSpec)}>
              {text.applyCandidate} {candidate.summary}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
