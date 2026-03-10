import type { TemplatePiece } from '../models/types';
import { getUiText, pieceNoteForLanguage, pieceTitleForLanguage, type UiLanguage } from '../app/i18n';

interface PieceListProps {
  pieces: TemplatePiece[];
  language: UiLanguage;
}

export function PieceList({ pieces, language }: PieceListProps): JSX.Element {
  const text = getUiText(language);

  return (
    <section className="panel-card piece-list">
      <h2>{text.pieceList}</h2>
      <ul>
        {pieces.map((piece) => (
          <li key={piece.id}>
            <strong>{pieceTitleForLanguage(piece, language)}</strong>
            <span>{piece.id.toUpperCase()}</span>
            <span>{pieceNoteForLanguage(piece, language)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
