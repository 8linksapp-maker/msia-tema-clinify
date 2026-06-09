import { useEffect, useState } from 'react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

const FIELDS: [string, string][] = [
  ['name', 'Nome da clínica'],
  ['description', 'Descrição (frase curta)'],
  ['phone', 'Telefone'],
  ['whatsapp', 'WhatsApp (só números, com DDI)'],
  ['email', 'E-mail'],
  ['address', 'Endereço'],
  ['hours', 'Horário de atendimento'],
];

export default function SiteConfigEditor() {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    githubApi('read', 'src/data/siteConfig.json')
      .then((d: any) => { setData(JSON.parse(d?.content || '{}')); setSha(d?.sha); })
      .catch((e: any) => setError(e?.message || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setData((p) => ({ ...(p || {}), [k]: v }));

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res: any = await githubApi('write', 'src/data/siteConfig.json', {
        content: JSON.stringify(data, null, 2),
        sha,
        message: 'CMS: dados da clínica',
      });
      setSha(res?.sha);
      triggerToast('Dados salvos!', 'success');
    } catch (e: any) {
      triggerToast(e?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-stone-500">Carregando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Dados da clínica</h1>
      <p className="text-stone-500 text-sm mb-6">Aparece no cabeçalho, rodapé e contato do site.</p>
      <div className="space-y-4">
        {FIELDS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-sm font-semibold text-stone-700 mb-1">{label}</span>
            <input
              className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:border-teal-700 focus:outline-none"
              value={data?.[k] ?? ''}
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 px-6 py-3 rounded-full bg-amber-500 text-stone-900 font-semibold hover:brightness-95 disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
