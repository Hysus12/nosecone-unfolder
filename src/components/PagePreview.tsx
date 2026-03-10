import type { RenderedPage } from '../models/types';
import { formatPageOption, getUiText, type UiLanguage } from '../app/i18n';

interface PagePreviewProps {
  pages: RenderedPage[];
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  language: UiLanguage;
}

export function PagePreview({ pages, selectedPageIndex, onSelectPage, language }: PagePreviewProps): JSX.Element {
  const text = getUiText(language);

  if (pages.length === 0) {
    return <section className="panel-card preview-card"><div className="empty-preview">{text.noLayout}</div></section>;
  }

  const selectedPage = pages[Math.min(selectedPageIndex, pages.length - 1)];
  const previewMarkup = selectedPage.svg.replace(/^<\?xml[^>]*>\s*/i, '');

  return (
    <section className="panel-card preview-card">
      <div className="preview-toolbar">
        <h2>{text.pagePreview}</h2>
        <select value={selectedPageIndex} onChange={(event) => onSelectPage(Number(event.target.value))}>
          {pages.map((page, index) => (
            <option key={page.page.index} value={index}>
              {formatPageOption(language, index + 1)}
            </option>
          ))}
        </select>
      </div>
      <div className="page-preview" dangerouslySetInnerHTML={{ __html: previewMarkup }} />
    </section>
  );
}
