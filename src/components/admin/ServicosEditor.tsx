import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Plus, Trash2, Stethoscope } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

interface ServicoItem {
    slug: string;
    nome: string;
    resumo: string;
    topicos: string[];
}

const EMPTY_SERVICO: ServicoItem = { slug: '', nome: '', resumo: '', topicos: [] };

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function ServicosEditor() {
    const [items, setItems] = useState<ServicoItem[]>([]);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        githubApi('read', 'src/data/servicos.json')
            .then(data => {
                const parsed = JSON.parse(data?.content || '[]');
                const normalized = Array.isArray(parsed)
                    ? parsed.map((it: any) => ({ ...it, topicos: Array.isArray(it.topicos) ? it.topicos : [] }))
                    : [];
                setItems(normalized);
                setFileSha(data.sha);
            })
            .catch(err => {
                if (err.message.includes('404')) setItems([]);
                else setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        triggerToast('Salvando serviços...', 'progress', 30);
        try {
            const res = await githubApi('write', 'src/data/servicos.json', {
                content: JSON.stringify(items, null, 2),
                sha: fileSha || undefined,
                message: 'CMS: Update servicos.json',
            });
            setFileSha(res.sha);
            triggerToast('Serviços salvos com sucesso!', 'success', 100);
        } catch (err: any) {
            setError(err.message);
            triggerToast(`Erro ao salvar: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        setItems([...items, { ...EMPTY_SERVICO, topicos: [] }]);
    };

    const removeItem = (idx: number) => {
        if (!confirm('Excluir este serviço?')) return;
        setItems(items.filter((_, i) => i !== idx));
    };

    const updateField = (idx: number, field: keyof ServicoItem, value: string) => {
        setItems(items.map((it, i) => {
            if (i !== idx) return it;
            const updated = { ...it, [field]: value };
            // Auto-gera slug ao editar nome (apenas se slug atual é derivado do nome antigo)
            if (field === 'nome') {
                const autoSlug = toSlug(it.nome);
                if (it.slug === '' || it.slug === autoSlug) {
                    updated.slug = toSlug(value);
                }
            }
            return updated;
        }));
    };

    const updateSlugDirect = (idx: number, value: string) => {
        const safe = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        setItems(items.map((it, i) => i === idx ? { ...it, slug: safe } : it));
    };

    // Tópicos helpers
    const addTopico = (idx: number) => {
        setItems(items.map((it, i) => i === idx ? { ...it, topicos: [...it.topicos, ''] } : it));
    };

    const updateTopico = (servicoIdx: number, topicoIdx: number, value: string) => {
        setItems(items.map((it, i) => {
            if (i !== servicoIdx) return it;
            const topicos = it.topicos.map((t, ti) => ti === topicoIdx ? value : t);
            return { ...it, topicos };
        }));
    };

    const removeTopico = (servicoIdx: number, topicoIdx: number) => {
        setItems(items.map((it, i) => {
            if (i !== servicoIdx) return it;
            return { ...it, topicos: it.topicos.filter((_, ti) => ti !== topicoIdx) };
        }));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-adm-ink-faint bg-adm-surface rounded-lg border border-adm-border">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-adm-primary" aria-hidden="true" />
            <p className="font-medium animate-pulse">Carregando serviços...</p>
        </div>
    );

    const inputClass = "w-full bg-adm-elev border border-adm-border rounded-md px-4 py-3 text-sm text-adm-ink font-medium focus:outline-none focus:border-adm-primary focus:ring-2 focus:ring-adm-primary/20 transition-all";
    const labelClass = "block text-[10px] font-bold text-adm-ink-muted uppercase tracking-widest mb-1.5";
    const subInputClass = "flex-1 bg-adm-elev border border-adm-border rounded-md px-3 py-2.5 text-sm text-adm-ink font-medium focus:outline-none focus:border-adm-primary focus:ring-2 focus:ring-adm-primary/20 transition-all";

    return (
        <form onSubmit={handleSave} className="space-y-6 pb-32 max-w-3xl">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-adm-surface/80 backdrop-blur-xl p-5 px-6 rounded-lg border border-adm-border shadow-xl shadow-slate-200/50 sticky top-0 z-40">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">Serviços</h2>
                    <p className="text-xs font-bold text-adm-ink-muted uppercase tracking-widest mt-1">
                        {items.length} serviço{items.length !== 1 ? 's' : ''} &middot; <code className="font-mono normal-case tracking-normal text-adm-ink-faint">src/data/servicos.json</code>
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-adm-primary hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-adm-surface px-6 py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Save className="w-5 h-5" aria-hidden="true" />}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {error && (
                <div role="alert" className="p-5 bg-red-100/50 text-red-700 rounded-lg font-bold border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" /> {error}
                </div>
            )}

            {/* Items */}
            <div className="space-y-4" aria-label="Lista de serviços">
                {items.length === 0 ? (
                    <div className="bg-adm-elev border-2 border-dashed border-adm-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
                        <Stethoscope className="w-12 h-12 text-adm-ink-faint mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-bold text-adm-ink mb-2">Nenhum serviço cadastrado</h3>
                        <p className="text-adm-ink-muted mb-6">Adicione os serviços oferecidos pela clínica.</p>
                        <button type="button" onClick={addItem} className="bg-adm-primary text-adm-surface font-bold px-8 py-3 rounded-md shadow-md hover:brightness-90 transition-colors">
                            Adicionar primeiro serviço
                        </button>
                    </div>
                ) : items.map((item, idx) => (
                    <div key={idx} className="p-6 bg-adm-surface border border-adm-border rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-adm-ink-faint uppercase tracking-widest">Serviço #{idx + 1}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                aria-label={`Excluir serviço ${item.nome || `#${idx + 1}`}`}
                                className="text-adm-ink-faint hover:text-red-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={labelClass} htmlFor={`nome-${idx}`}>Nome</label>
                                <input
                                    id={`nome-${idx}`}
                                    type="text"
                                    value={item.nome}
                                    onChange={e => updateField(idx, 'nome', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ex: Implante dentário"
                                />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor={`slug-${idx}`}>
                                    Slug (URL)
                                </label>
                                <div className="flex items-stretch bg-adm-elev border border-adm-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-adm-primary/20 focus-within:border-adm-primary">
                                    <span className="px-3 flex items-center font-mono text-xs text-adm-ink-faint bg-adm-elev border-r border-adm-border whitespace-nowrap">/servicos/</span>
                                    <input
                                        id={`slug-${idx}`}
                                        type="text"
                                        value={item.slug}
                                        onChange={e => updateSlugDirect(idx, e.target.value)}
                                        className="flex-1 bg-transparent px-3 py-3 text-adm-ink font-mono text-sm focus:outline-none"
                                        placeholder="implante-dentario"
                                    />
                                </div>
                                <p className="text-[10px] text-adm-ink-faint mt-1.5">
                                    URL final: <code className="bg-adm-elev px-1 rounded">/servicos/{item.slug || '...'}</code>
                                </p>
                            </div>

                            <div>
                                <label className={labelClass} htmlFor={`resumo-${idx}`}>Resumo</label>
                                <textarea
                                    id={`resumo-${idx}`}
                                    rows={3}
                                    value={item.resumo}
                                    onChange={e => updateField(idx, 'resumo', e.target.value)}
                                    className={`${inputClass} resize-y`}
                                    placeholder="Breve descrição do serviço que aparece nos cards do site..."
                                />
                            </div>

                            {/* Tópicos abordados */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={`${labelClass} mb-0`}>Tópicos abordados</label>
                                    <button
                                        type="button"
                                        onClick={() => addTopico(idx)}
                                        className="text-[11px] font-semibold text-adm-primary hover:text-adm-primary/80 flex items-center gap-1 px-2 py-1 rounded hover:bg-adm-primary-soft transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar tópico
                                    </button>
                                </div>
                                <p className="text-[10px] text-adm-ink-faint mb-2">Viram os títulos (H2) do roteiro nas páginas de SEO local.</p>
                                {item.topicos.length === 0 ? (
                                    <p className="text-xs text-adm-ink-faint italic py-2">Nenhum tópico cadastrado.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {item.topicos.map((topico, tIdx) => (
                                            <div key={tIdx} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={topico}
                                                    onChange={e => updateTopico(idx, tIdx, e.target.value)}
                                                    className={subInputClass}
                                                    placeholder="Ex: O que é o implante dentário"
                                                    aria-label={`Tópico ${tIdx + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeTopico(idx, tIdx)}
                                                    aria-label={`Remover tópico ${topico || tIdx + 1}`}
                                                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-adm-ink-faint hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add button */}
            {items.length > 0 && (
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full p-4 border-2 border-dashed border-adm-border hover:border-adm-primary bg-adm-surface hover:bg-adm-primary-soft rounded-lg text-adm-ink-muted hover:text-adm-primary font-semibold flex items-center justify-center gap-2 transition-all min-h-[52px]"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" /> Adicionar serviço
                </button>
            )}
        </form>
    );
}
