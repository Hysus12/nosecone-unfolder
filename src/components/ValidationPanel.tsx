import type { ValidationError } from '../models/types';
import { getUiText, type UiLanguage } from '../app/i18n';

interface ValidationPanelProps {
  warnings: string[];
  errors: ValidationError[];
  language: UiLanguage;
}

export function ValidationPanel({ warnings, errors, language }: ValidationPanelProps): JSX.Element {
  const text = getUiText(language);

  return (
    <section className="panel-card">
      <h2>{text.validationTitle}</h2>
      <ul className="message-list">
        <li className="warning">{text.printWarningInline}</li>
        {warnings.map((warning) => (
          <li key={warning} className="warning">
            {warning}
          </li>
        ))}
        {errors.map((error) => (
          <li key={`${error.field}-${error.message}`} className={error.severity}>
            {error.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
