import type { SampledProfilePoint } from '../models/types';
import { getUiText, type UiLanguage } from '../app/i18n';

interface ProfilePreviewProps {
  profile: SampledProfilePoint[];
  language: UiLanguage;
}

export function ProfilePreview({ profile, language }: ProfilePreviewProps): JSX.Element {
  const text = getUiText(language);

  if (profile.length === 0) {
    return <div className="empty-preview">{text.noProfile}</div>;
  }

  const length = profile[profile.length - 1].xMm;
  const maxRadius = Math.max(...profile.map((point) => point.radiusMm));
  const top = profile.map((point) => `${point.xMm},${maxRadius - point.radiusMm}`).join(' ');
  const bottom = [...profile].reverse().map((point) => `${point.xMm},${maxRadius + point.radiusMm}`).join(' ');

  return (
    <section className="panel-card">
      <h2>{text.profilePreview}</h2>
      <svg viewBox={`0 0 ${length} ${maxRadius * 2}`} className="profile-svg">
        <polyline points={top} className="profile-line" />
        <polyline points={bottom} className="profile-line" />
        <line x1="0" y1={maxRadius} x2={length} y2={maxRadius} className="profile-axis" />
      </svg>
    </section>
  );
}
