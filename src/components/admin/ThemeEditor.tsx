import { useEffect, useState } from 'react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

// Especialidades = presets em src/data/themes/<slug>.json (data-driven via import.meta.glob)
const themeModules: Record<string, any> = import.meta.glob('../../data/themes/*.json', { eager: true });
const PRESETS = Object.entries(themeModules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    const data = (mod as any).default ?? mod;
    return { slug, label: data?.name || slug };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

const TOKEN_LABELS: Record<string, string> = {
  primary: 'Cor principal (marca)',
  secondary: 'Cor secundária',
  accent: 'Destaque (botões/CTA)',
  'accent-ink': 'Texto sobre o destaque',
  bg: 'Fundo da página',
  surface: 'Cartões',
  soft: 'Fundo de seção',
  ink: 'Texto principal',
  'ink-muted': 'Texto secundário',
  border: 'Bordas',
};

interface ThemeConfig {
  preset: string;
  overrides?: { colors?: Record<string, string>; fonts?: { display?: string; body?: string } };
}

export default function ThemeEditor() {
  const [cfg, setCfg] = useState<ThemeConfig>({ preset: 'dental', overrides: { colors: {} } });
  const [base, setBase] = useState<Record<string, string>>({});
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    githubApi('read', 'src/data/theme.json')
      .then((d: any) => {
        const parsed = JSON.parse(d?.content || '{}');
        setCfg({ preset: parsed.preset || 'dental', overrides: parsed.overrides || { colors: {} } });
        setSha(d?.sha);
      })
      .catch((e: any) => setError(e?.message || 'Erro ao carregar o tema'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cfg.preset) return;
    githubApi('read', `src/data/themes/${cfg.preset}.json`)
      .then((d: any) => { const p = JSON.parse(d?.content || '{}'); setBase(p.colors || {}); })
      .catch(() => setBase({}));
  }, [cfg.preset]);

  const overrides = cfg.overrides?.colors || {};
  const valueFor = (t: string) => overrides[t] ?? base[t] ?? '#000000';

  const setPreset = (preset: string) =>
    setCfg((c) => ({ ...c, preset, overrides: { ...(c.overrides || {}), colors: {} } }));
  const setColor = (t: string, hex: string) =>
    setCfg((c) => ({ ...c, overrides: { ...(c.overrides || {}), colors: { ...(c.overrides?.colors || {}), [t]: hex } } }));
  const resetOverrides = () => setCfg((c) => ({ ...c, overrides: { ...(c.overrides || {}), colors: {} } }));

  const save = async () => {
    setSaving(true);
    try {
      const res: any = await githubApi('write', 'src/data/theme.json', {
        content: JSON.stringify(cfg, null, 2),
        sha,
        message: 'CMS: tema do site',
      });
      setSha(res?.sha);
      triggerToast('Tema salvo! Publique para aplicar no site.', 'success');
    } catch (e: any) {
      triggerToast(e?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-adm-ink-muted">Carregando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const tokens = Object.keys(base).length ? Object.keys(base) : Object.keys(TOKEN_LABELS);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-adm-ink mb-1">Tema do site</h1>
      <p className="text-adm-ink-muted text-sm mb-6">Escolha a especialidade e ajuste as cores. Salve e publique para aplicar no site.</p>

      <label className="block mb-6">
        <span className="block text-sm font-semibold text-adm-ink mb-1">Especialidade (paleta base)</span>
        <select value={cfg.preset} onChange={(e) => setPreset(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-adm-border bg-adm-surface text-adm-ink">
          {PRESETS.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
        </select>
      </label>

      <div className="space-y-1">
        {tokens.map((t) => (
          <label key={t} className="flex items-center justify-between gap-4 py-2 border-b border-adm-border">
            <span className="text-sm text-adm-ink">{TOKEN_LABELS[t] || t}</span>
            <span className="flex items-center gap-2">
              <input type="color" value={valueFor(t)} onChange={(e) => setColor(t, e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-adm-border" />
              <input type="text" value={valueFor(t)} onChange={(e) => setColor(t, e.target.value)} className="w-24 px-2 py-1 text-sm rounded border border-adm-border bg-adm-surface font-mono text-adm-ink" />
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={save} disabled={saving} className="px-6 py-3 rounded-full bg-adm-primary text-white font-semibold disabled:opacity-50">
          {saving ? 'Salvando…' : 'Salvar tema'}
        </button>
        <button onClick={resetOverrides} className="px-4 py-3 rounded-full border border-adm-border text-adm-ink text-sm">
          Restaurar cores do preset
        </button>
      </div>
    </div>
  );
}
