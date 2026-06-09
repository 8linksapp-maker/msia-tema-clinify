import { describe, it, expect } from 'vitest';
import { buildVars, varsToCss, type ThemePreset } from '../lib/theme';

const fake: ThemePreset = {
  name: 'Fake',
  colors: { bg: '#fff', primary: '#111' },
  fonts: { display: 'A', body: 'B' },
};

describe('buildVars', () => {
  it('maps colors to --c-* vars and fonts to --font-*', () => {
    const v = buildVars(fake);
    expect(v['--c-bg']).toBe('#fff');
    expect(v['--c-primary']).toBe('#111');
    expect(v['--font-display']).toBe('A');
    expect(v['--font-body']).toBe('B');
  });

  it('overrides win over preset', () => {
    const v = buildVars(fake, { colors: { primary: '#999' } });
    expect(v['--c-primary']).toBe('#999');
    expect(v['--c-bg']).toBe('#fff');
  });
});

describe('varsToCss', () => {
  it('wraps vars in :root{}', () => {
    expect(varsToCss({ '--c-bg': '#fff' })).toBe(':root{--c-bg:#fff}');
  });
});
