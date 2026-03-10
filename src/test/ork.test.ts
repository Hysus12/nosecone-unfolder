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
        <shape>ogive</shape>
        <length>0.120</length>
        <aftradius>0.025</aftradius>
        <aftshoulderradius>0.022</aftshoulderradius>
        <aftshoulderlength>0.030</aftshoulderlength>
        <aftshoulderthickness>0.0015</aftshoulderthickness>
        <thickness>0.0015</thickness>
      </nosecone>
      <transition>
        <name>Aft Transition</name>
        <length>0.080</length>
        <aftradius>0.022</aftradius>
        <foreradius>0.035</foreradius>
        <thickness>0.0015</thickness>
      </transition>
    </subcomponents>
  </rocket>
</openrocket>`;

describe('ORK parser', () => {
  it('imports only nose cone candidates and converts meters to millimeters', async () => {
    const zip = new JSZip();
    zip.file('rocket.ork', XML);
    const bytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await parseOrk(bytes.buffer, 'fixture.ork');

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].kind).toBe('nose_cone');

    const spec = result.candidates[0].spec;
    expect(spec.lengthMm).toBeCloseTo(120, 6);
    expect(spec.baseDiameterMm).toBeCloseTo(50, 6);
    expect(spec.materialThicknessMm).toBeCloseTo(1.5, 6);
    expect(spec.shoulder?.lengthMm).toBeCloseTo(30, 6);
    expect(spec.shoulder?.outerDiameterMm).toBeCloseTo(44, 6);
    expect(spec.shoulder?.wallThicknessMm).toBeCloseTo(1.5, 6);
  });

  it('returns a readable error when XML is missing', async () => {
    const zip = new JSZip();
    zip.file('readme.txt', 'missing xml');
    const bytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await parseOrk(bytes.buffer, 'broken.ork');
    expect(result.errors[0]?.message).toContain('XML');
  });
});