import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { parseOrk } from '../ork';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<openrocket>
  <rocket>
    <name>Fixture Rocket</name>
    <subcomponents>
      <nosecone>
        <name>Forward NC</name>
        <shape>tangent ogive</shape>
        <length>120</length>
        <aftRadius>25</aftRadius>
        <tipRadius>0.5</tipRadius>
        <thickness>1.5</thickness>
      </nosecone>
      <transition>
        <name>Aft Transition</name>
        <length>80</length>
        <aftRadius>22</aftRadius>
        <foreRadius>35</foreRadius>
        <thickness>1.5</thickness>
      </transition>
    </subcomponents>
  </rocket>
</openrocket>`;

describe('ORK parser', () => {
  it('extracts nose cone and transition candidates', async () => {
    const zip = new JSZip();
    zip.file('rocket.xml', XML);
    const bytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await parseOrk(bytes.buffer, 'fixture.ork');
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates.some((candidate) => candidate.kind === 'nose_cone')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.kind === 'transition')).toBe(true);
  });

  it('returns a readable error when XML is missing', async () => {
    const zip = new JSZip();
    zip.file('readme.txt', 'missing xml');
    const bytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await parseOrk(bytes.buffer, 'broken.ork');
    expect(result.errors[0]?.message).toContain('XML');
  });
});
