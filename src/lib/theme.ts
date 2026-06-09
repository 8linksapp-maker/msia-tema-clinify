import dental from '../data/themes/dental.json';
import harmonizacao from '../data/themes/harmonizacao.json';
import themeConfig from '../data/theme.json';

export interface ThemePreset {
  name: string;
  colors: Record<string, string>;
  fonts: { display: string; body: string };
}

export interface ThemeOverrides {
  colors?: Record<string, string>;
  fonts?: Partial<{ display: string; body: string }>;
}

export const PRESETS: Record<string, ThemePreset> = { dental, harmonizacao };

/** Pure: merge preset + overrides into a flat CSS-var map. Testable. */
export function buildVars(preset: ThemePreset, overrides: ThemeOverrides = {}): Record<string, string> {
  const colors = { ...preset.colors, ...(overrides.colors ?? {}) };
  const fonts = { ...preset.fonts, ...(overrides.fonts ?? {}) };
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) vars[`--c-${k}`] = v;
  vars['--font-display'] = fonts.display;
  vars['--font-body'] = fonts.body;
  return vars;
}

/** Reads the live theme.json and resolves the active preset. */
export function resolveTheme(): { vars: Record<string, string>; preset: ThemePreset } {
  const preset = PRESETS[themeConfig.preset] ?? PRESETS.dental;
  const vars = buildVars(preset, (themeConfig.overrides ?? {}) as ThemeOverrides);
  return { vars, preset };
}

export function varsToCss(vars: Record<string, string>): string {
  return ':root{' + Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';') + '}';
}
